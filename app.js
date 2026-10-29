import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import Lenis from 'https://unpkg.com/lenis@1.3.4/dist/lenis.mjs';
import Matter from 'https://esm.sh/matter-js@0.20.0';

// ---------------------------------------------------------------------------
// Viewport state.
// stableVh is intentionally NOT updated on height-only resizes: mobile Safari
// toggles the address bar while scrolling and we must not re-layout for that.
// ---------------------------------------------------------------------------
const MOBILE_BREAKPOINT = 800;
const mqMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
const pointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let viewportWidth = window.innerWidth;
let stableVh = window.innerHeight;

const clearStaleInteractiveFocus = () => {
  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement && activeElement.matches('a, button')) {
    activeElement.blur();
  }
};

let pointerInitiatedFocus = false;

document.addEventListener('pointerdown', () => {
  pointerInitiatedFocus = true;
}, { capture: true, passive: true });

document.addEventListener('keydown', () => {
  pointerInitiatedFocus = false;
}, { capture: true });

document.addEventListener('focusin', (event) => {
  if (!pointerInitiatedFocus) return;

  const interactive = event.target instanceof Element
    ? event.target.closest('a, button')
    : null;
  if (interactive instanceof HTMLElement) interactive.blur();
});

document.addEventListener('pointerup', (event) => {
  const interactive = event.target instanceof Element
    ? event.target.closest('a, button')
    : null;
  if (interactive instanceof HTMLElement) {
    requestAnimationFrame(() => {
      if (document.activeElement === interactive) interactive.blur();
    });
  }
}, { passive: true });

window.addEventListener('pageshow', () => {
  pointerInitiatedFocus = false;
  requestAnimationFrame(clearStaleInteractiveFocus);
});

// ---------------------------------------------------------------------------
// Custom cursor (pointer devices only — on touch the elements are hidden)
// ---------------------------------------------------------------------------
const cursorDot = document.querySelector('.cursor-dot');
const cursorEllipse = document.querySelector('.cursor-ellipse');

if (pointerFine && cursorDot && cursorEllipse) {
  const ellipseTarget = { x: 0, y: 0 };
  const ellipseCurrent = { x: 0, y: 0 };
  let cursorFrame = 0;

  const animateCursor = () => {
    ellipseCurrent.x += (ellipseTarget.x - ellipseCurrent.x) * 0.12;
    ellipseCurrent.y += (ellipseTarget.y - ellipseCurrent.y) * 0.12;
    cursorEllipse.style.left = `${ellipseCurrent.x}px`;
    cursorEllipse.style.top = `${ellipseCurrent.y}px`;

    const stillMoving = Math.abs(ellipseTarget.x - ellipseCurrent.x) > 0.05
      || Math.abs(ellipseTarget.y - ellipseCurrent.y) > 0.05;
    cursorFrame = stillMoving ? requestAnimationFrame(animateCursor) : 0;
  };

  window.addEventListener('pointermove', (event) => {
    ellipseTarget.x = event.clientX;
    ellipseTarget.y = event.clientY;
    cursorDot.style.left = `${event.clientX}px`;
    cursorDot.style.top = `${event.clientY}px`;
    if (!cursorFrame) cursorFrame = requestAnimationFrame(animateCursor);
  });

  document.querySelectorAll('a, button, input, textarea, select').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (el.matches('[data-language].is-active')) {
        document.body.classList.remove('is-interactive');
        return;
      }
      document.body.classList.add('is-interactive');
    });
    el.addEventListener('mouseleave', () => document.body.classList.remove('is-interactive'));
  });

  window.addEventListener('pointerdown', () => {
    cursorDot.style.transform = 'translate(-50%, -50%) scale(0.9)';
    cursorEllipse.style.transform = 'translate(-50%, -50%) scale(0.95)';
  });
  window.addEventListener('pointerup', () => {
    cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorEllipse.style.transform = 'translate(-50%, -50%) scale(1)';
  });

}

// ---------------------------------------------------------------------------
// Hero CV button: DVD screensaver + follow-the-cursor inside .sp-box
// ---------------------------------------------------------------------------
const spBox = document.querySelector('.sp-box');
const projectBtn = spBox?.querySelector('.btn');

if (spBox && projectBtn) {
  const dvdMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  // On mobile the button is static, centered, with no pointer interaction
  const dvdStatic = () => dvdMotionQuery.matches || mqMobile.matches;
  const DVD_SPEED = 1.75 / 3;
  const FOLLOW_LERP = 0.15;
  const position = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  const velocity = { x: DVD_SPEED, y: DVD_SPEED };
  const bounds = { maxX: 0, maxY: 0, buttonWidth: 0, buttonHeight: 0 };
  let isFollowing = false;
  let isMeasured = false;
  let dvdInView = true;
  let dvdFrameId = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const renderProjectButton = () => {
    projectBtn.style.transform = `translate3d(${position.x.toFixed(2)}px, ${position.y.toFixed(2)}px, 0)`;
  };

  const seedDvdVelocity = () => {
    velocity.x = (Math.random() < 0.5 ? -1 : 1) * DVD_SPEED;
    velocity.y = (Math.random() < 0.5 ? -1 : 1) * DVD_SPEED;
  };

  const measureDvdBounds = () => {
    const boxRect = spBox.getBoundingClientRect();
    const buttonRect = projectBtn.getBoundingClientRect();
    bounds.buttonWidth = buttonRect.width;
    bounds.buttonHeight = buttonRect.height;
    bounds.maxX = Math.max(0, boxRect.width - buttonRect.width);
    bounds.maxY = Math.max(0, boxRect.height - buttonRect.height);

    if (!isMeasured || dvdStatic()) {
      position.x = bounds.maxX / 2;
      position.y = bounds.maxY / 2;
      isMeasured = true;
    } else {
      position.x = clamp(position.x, 0, bounds.maxX);
      position.y = clamp(position.y, 0, bounds.maxY);
    }

    target.x = clamp(target.x, 0, bounds.maxX);
    target.y = clamp(target.y, 0, bounds.maxY);
    renderProjectButton();
  };

  const updateFollowTarget = (event) => {
    const boxRect = spBox.getBoundingClientRect();
    target.x = clamp(event.clientX - boxRect.left - bounds.buttonWidth / 2, 0, bounds.maxX);
    target.y = clamp(event.clientY - boxRect.top - bounds.buttonHeight / 2, 0, bounds.maxY);
  };

  const moveOnAxis = (axis, maxKey) => {
    const max = bounds[maxKey];
    if (max <= 0) {
      position[axis] = 0;
      return;
    }
    position[axis] += velocity[axis];
    if (position[axis] <= 0) {
      position[axis] = 0;
      velocity[axis] = Math.abs(velocity[axis]);
    } else if (position[axis] >= max) {
      position[axis] = max;
      velocity[axis] = -Math.abs(velocity[axis]);
    }
  };

  const dvdTick = () => {
    if (!dvdInView || dvdStatic()) {
      dvdFrameId = 0;
      return;
    }
    if (isFollowing) {
      position.x += (target.x - position.x) * FOLLOW_LERP;
      position.y += (target.y - position.y) * FOLLOW_LERP;
    } else {
      moveOnAxis('x', 'maxX');
      moveOnAxis('y', 'maxY');
    }
    renderProjectButton();
    dvdFrameId = requestAnimationFrame(dvdTick);
  };

  const startDvdAnimation = () => {
    if (dvdStatic() || !dvdInView || dvdFrameId) return;
    dvdFrameId = requestAnimationFrame(dvdTick);
  };

  const stopDvdAnimation = () => {
    cancelAnimationFrame(dvdFrameId);
    dvdFrameId = 0;
  };

  spBox.addEventListener('pointerenter', (event) => {
    if (mqMobile.matches) return;
    document.body.classList.add('cursor-hide');
    if (dvdMotionQuery.matches) return;
    isFollowing = true;
    updateFollowTarget(event);
  });

  spBox.addEventListener('pointermove', (event) => {
    if (!isFollowing || dvdStatic()) return;
    updateFollowTarget(event);
  });

  spBox.addEventListener('pointerleave', () => {
    if (mqMobile.matches) return;
    document.body.classList.remove('cursor-hide');
    isFollowing = false;
    if (Math.hypot(velocity.x, velocity.y) < 0.1) {
      seedDvdVelocity();
    }
  });

  const syncDvdMode = () => {
    isFollowing = false;
    document.body.classList.remove('cursor-hide');
    measureDvdBounds();
    if (dvdStatic()) {
      stopDvdAnimation();
    } else {
      if (Math.hypot(velocity.x, velocity.y) < 0.1) seedDvdVelocity();
      startDvdAnimation();
    }
  };

  dvdMotionQuery.addEventListener('change', syncDvdMode);
  mqMobile.addEventListener('change', syncDvdMode);

  new ResizeObserver(measureDvdBounds).observe(spBox);
  new IntersectionObserver(([entry]) => {
    dvdInView = entry.isIntersecting;
    if (dvdInView) startDvdAnimation();
    else stopDvdAnimation();
  }, { threshold: 0.01 }).observe(spBox);
  (document.fonts?.ready || Promise.resolve()).then(measureDvdBounds);

  measureDvdBounds();
  if (!dvdStatic()) {
    seedDvdVelocity();
    startDvdAnimation();
  }
}

// ---------------------------------------------------------------------------
// Preloader + stair-step reveal.
// The white stair screen acts as the preloader: it stays until the site is
// fully loaded (fonts, every page image, hero textures and window load),
// showing the percentage bottom-right. Only then the stairs open.
// ---------------------------------------------------------------------------
const stairReveal = document.querySelector('.stair-reveal');
const preloaderCount = stairReveal?.querySelector('.stair-reveal__count');

const forceThemeColor = () => {
  let meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', '#0b0b0c');
  requestAnimationFrame(() => meta.setAttribute('content', '#0b0b0b'));
};

forceThemeColor();

const LOAD_UNITS = { fonts: 15, tex0: 15, tex1: 15, tex2: 15, images: 30, page: 10 };
const loadedUnits = new Set();
let loadProgressTarget = 0;

const markLoaded = (key) => {
  if (!(key in LOAD_UNITS) || loadedUnits.has(key)) return;
  loadedUnits.add(key);
  let total = 0;
  loadedUnits.forEach((k) => {
    total += LOAD_UNITS[k];
  });
  loadProgressTarget = total;
};

(document.fonts?.ready || Promise.resolve()).then(() => markLoaded('fonts'));
if (document.readyState === 'complete') {
  markLoaded('page');
} else {
  window.addEventListener('load', () => markLoaded('page'), { once: true });
}

const decodeLoadedImage = (image) => {
  if (typeof image.decode !== 'function') return Promise.resolve();
  return image.decode().catch(() => undefined);
};

const waitForDomImage = (image) => new Promise((resolve) => {
  image.loading = 'eager';
  image.fetchPriority = 'high';

  const finish = () => decodeLoadedImage(image).then(resolve);
  if (image.complete) {
    finish();
    return;
  }

  image.addEventListener('load', finish, { once: true });
  image.addEventListener('error', resolve, { once: true });
});

const preloadImageSource = (source) => new Promise((resolve) => {
  const image = new Image();
  image.decoding = 'async';
  image.onload = () => decodeLoadedImage(image).then(resolve);
  image.onerror = resolve;
  image.src = source;
});

const cssImageSources = [
  'assets/noise.png',
  'assets/caret-right.svg',
];

Promise.all([
  ...Array.from(document.images, waitForDomImage),
  ...cssImageSources.map(preloadImageSource),
]).then(() => markLoaded('images'));

// Resolves when the displayed counter has smoothly reached 100%
const siteReady = new Promise((resolve) => {
  let displayed = 0;
  let shownPercent = -1;
  const tick = () => {
    displayed += (loadProgressTarget - displayed) * 0.14;
    if (loadProgressTarget >= 100 && displayed > 99.2) displayed = 100;
    const percent = Math.round(displayed);
    if (percent !== shownPercent && preloaderCount) {
      shownPercent = percent;
      preloaderCount.textContent = `${percent}%`;
    }
    if (displayed >= 100) {
      resolve();
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

const stairRevealDone = new Promise((resolve) => {
  if (!stairReveal) {
    resolve();
    return;
  }

  siteReady.then(() => {
    if (prefersReducedMotion) {
      stairReveal.remove();
      forceThemeColor();
      resolve();
      return;
    }

    setTimeout(() => {
      stairReveal.classList.add('is-open');
      // Content starts animating while the back layer is still clearing
      setTimeout(resolve, 700);
      // Last back step: 0.16s layer delay + 7 * 0.055s stagger + 0.75s duration
      setTimeout(() => {
        stairReveal.remove();
        forceThemeColor();
      }, 1500);
    }, 200);
  });
});

// ---------------------------------------------------------------------------
// Per-character reveal (blur + slide), capped to 2s total per element
// ---------------------------------------------------------------------------
const REVEAL_MAX_TOTAL_SECONDS = 2;
const scrambleMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealCleanups = new WeakMap();

function getRevealCssSeconds(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function splitReveal(el) {
  if (el.dataset.revealReady === 'true') return;

  const baseDelay = parseFloat(el.dataset.revealDelay || '0') || 0;
  const duration = getRevealCssSeconds('--reveal-duration', 0.8);
  const charCount = (el.textContent || '').replace(/\s+/g, '').length;
  // Cap the stagger so the whole element (delay + stagger + duration) fits the budget
  const staggerBudget = Math.max(0, REVEAL_MAX_TOTAL_SECONDS - baseDelay - duration);
  const stagger = Math.min(
    getRevealCssSeconds('--reveal-stagger', 0.03),
    charCount > 1 ? staggerBudget / (charCount - 1) : staggerBudget,
  );
  const fragment = document.createDocumentFragment();
  const nodes = Array.from(el.childNodes);
  let index = 0;

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = (node.textContent || '').split(/(\s+)/);
      parts.forEach((part) => {
        if (!part) return;
        if (/\s/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
        } else {
          const word = document.createElement('span');
          word.className = 'word';
          [...part].forEach((char) => {
            const letter = document.createElement('span');
            letter.className = 'char';
            letter.textContent = char;
            letter.style.transitionDelay = `${baseDelay + index++ * stagger}s`;
            word.appendChild(letter);
          });
          fragment.appendChild(word);
        }
      });
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
      fragment.appendChild(node.cloneNode(false));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      fragment.appendChild(node.cloneNode(true));
    }
  });

  el.textContent = '';
  el.appendChild(fragment);
  el.dataset.revealReady = 'true';
}

function setupReveal(el) {
  revealCleanups.get(el)?.();
  splitReveal(el);

  let cancelled = false;
  let frame = 0;
  let finishTimer = 0;
  let observer;
  const cleanup = () => {
    cancelled = true;
    observer?.disconnect();
    cancelAnimationFrame(frame);
    clearTimeout(finishTimer);
    revealCleanups.delete(el);
  };
  revealCleanups.set(el, cleanup);

  const run = () => {
    if (cancelled || el.dataset.revealTriggered === 'true') return;
    el.dataset.revealTriggered = 'true';
    if (scrambleMotionQuery.matches) {
      el.classList.add('is-visible', 'is-revealed');
      return;
    }
    el.classList.add('is-revealing');
    frame = requestAnimationFrame(() => {
      if (cancelled) return;
      el.classList.add('is-visible');
      finishTimer = window.setTimeout(() => {
        el.classList.remove('is-revealing');
        el.classList.add('is-revealed');
      }, REVEAL_MAX_TOTAL_SECONDS * 1000 + 100);
    });
  };

  if (scrambleMotionQuery.matches) {
    run();
    return;
  }

  // Preserve the original reveal triggers independently of hover interaction.
  if (el.dataset.revealOn === 'load') {
    stairRevealDone.then(() => { if (!cancelled) run(); });
  } else {
    observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          run();
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    observer.observe(el);
  }
}

// ---------------------------------------------------------------------------
// English / Ukrainian interface translation.
// ---------------------------------------------------------------------------
const UI_TRANSLATIONS = {
  "en": {
    "pageTitle": "Jack Milka — UI/UX & Digital Product Designer",
    "preloader": "Creating digital experiences.",
    "navWorks": "selected works",
    "navAbout": "about me",
    "navContact": "contact me",
    "navMenu": "menu",
    "heroButton": "view CV",
    "heroTitle": "I turn complex ideas into intuitive digital experiences that feel effortless.",
    "aboutSub": "I design digital products, websites and visual experiences with a focus on usability, clarity and the details that make an interface feel right.",
    "aboutTitle": "Design is where creativity meets functionality.",
    "statsTitle": "I'm Jack Milka, a UI/UX and digital designer focused on creating thoughtful, visually distinctive experiences for web and mobile.",
    "statsIntro": "I work across product design, web experiences and visual communication. My approach combines clean aesthetics, intuitive interactions and practical solutions that support real business goals.",
    "statYears": "Years of<br>experience",
    "statProjects": "Projects<br>delivered",
    "worksIntro": "A selection of digital products, websites and visual experiences I've designed for different brands and businesses.",
    "worksTitle": "Selected works",
    "worksCta": "your project could be next",
    "worksProcess": "My process brings together thoughtful design, clarity and attention to detail.",
    "finalTitle": "Have a project in mind? Let's make it happen.",
    "cookieTitle": "Cookie settings",
    "cookieClose": "Close cookie settings",
    "cookieDescription": "With your permission, Google Analytics measures visits and interactions. Analytics stays off until you accept. You can change your choice in Cookie settings.",
    "accept": "accept",
    "decline": "decline",
    "formName": "name",
    "formEmail": "email",
    "formDetails": "project details",
    "formRequest": "request",
    "formSending": "sending…",
    "formSuccess": "Request sent. I'll get back to you soon.",
    "formError": "I could not send your request. Please try again or contact me via Telegram or WhatsApp.",
    "formRequired": "Please complete all three fields and enter a valid email address.",
    "formNotice": "Your information will be used to respond to your inquiry. Learn more in the <a href=\"../privacy-policy/\" target=\"_blank\" rel=\"noopener\">Privacy Policy</a>.",
    "telegramContact": "Contact Jack Milka on Telegram, @EugeneMilka",
    "whatsappContact": "Contact Jack Milka on WhatsApp, +380 73 826 53 54",
    "primaryNavigation": "Primary navigation",
    "modalNavigation": "Modal navigation",
    "language": "Language",
    "previousProject": "Previous project",
    "nextProject": "Next project",
    "projectRequest": "Project request",
    "close": "Close",
    "socialMedia": "Social media",
    "pageDescription": "Jack Milka is a UI/UX and digital product designer creating mobile apps, websites, interactive experiences and visual identities.",
    "navSkills": "skills",
    "navExperience": "experience",
    "availability": "Available for freelance & collaborations",
    "experienceTitle": "Experience",
    "experienceWebsite": "View website",
    "experienceProfile": "View profile",
    "experienceLinkedin": "View LinkedIn",
    "experienceDou": "View on DOU",
    "downloadCv": "view my CV",
    "cvFile": "assets/cv/Jack-Milka-CV-EN.pdf",
    "finalButton": "get in touch"
  },
  "uk": {
    "pageTitle": "Jack Milka — UI/UX та digital-дизайнер",
    "preloader": "Створюю цифрові продукти.",
    "navWorks": "роботи",
    "navAbout": "про мене",
    "navContact": "зв’язатися",
    "navMenu": "меню",
    "heroButton": "переглянути CV",
    "heroTitle": "Я перетворюю складні ідеї на інтуїтивні цифрові продукти, якими легко користуватися.",
    "aboutSub": "Я створюю цифрові продукти, вебсайти та візуальні рішення, приділяючи увагу зручності, зрозумілості та деталям, які роблять інтерфейс довершеним.",
    "aboutTitle": "Дизайн — це місце, де креативність зустрічається з функціональністю.",
    "statsTitle": "Євгеній Мілка — UI/UX та digital-дизайнер, який створює продумані, візуально виразні інтерфейси для вебу та мобільних застосунків.",
    "statsIntro": "Я працюю з дизайном цифрових продуктів, вебінтерфейсами та візуальними комунікаціями. У своїй роботі поєдную чисту естетику, інтуїтивну взаємодію та практичні рішення для бізнесу.",
    "statYears": "Років<br>досвіду",
    "statProjects": "Реалізованих<br>проєктів",
    "worksIntro": "Добірка цифрових продуктів, вебсайтів і візуальних рішень, які я створив для різних брендів і компаній.",
    "worksTitle": "Обрані роботи",
    "worksCta": "наступним може бути ваш проєкт",
    "worksProcess": "Мій підхід поєднує продуманий дизайн, зрозумілість та увагу до деталей.",
    "finalTitle": "Маєте ідею проєкту? Нумо втілимо її разом.",
    "cookieTitle": "Налаштування cookie",
    "cookieClose": "Закрити налаштування cookie",
    "cookieDescription": "За вашою згодою Google Analytics вимірює відвідування та взаємодії. Аналітика вимкнена, доки ви не погодитеся. Змінити вибір можна в налаштуваннях cookie.",
    "accept": "прийняти",
    "decline": "відхилити",
    "formName": "ім’я",
    "formEmail": "електронна пошта",
    "formDetails": "деталі проєкту",
    "formRequest": "надіслати",
    "formSending": "надсилаю…",
    "formSuccess": "Заявку надіслано. Я зв’яжуся з вами найближчим часом.",
    "formError": "Не вдалося надіслати заявку. Спробуйте ще раз або напишіть мені в Telegram чи WhatsApp.",
    "formRequired": "Заповніть усі три поля та вкажіть коректну електронну адресу.",
    "formNotice": "Ваші дані будуть використані для відповіді на ваш запит. Докладніше — у <a href=\"../privacy-policy/\" target=\"_blank\" rel=\"noopener\">Політиці конфіденційності</a>.",
    "telegramContact": "Написати Jack Milka в Telegram, @EugeneMilka",
    "whatsappContact": "Написати Jack Milka у WhatsApp, +380 73 826 53 54",
    "primaryNavigation": "Основна навігація",
    "modalNavigation": "Навігація форми",
    "language": "Мова",
    "previousProject": "Попередній проєкт",
    "nextProject": "Наступний проєкт",
    "projectRequest": "Заявка на проєкт",
    "close": "Закрити",
    "socialMedia": "Соціальні мережі",
    "pageDescription": "Jack Milka — UI/UX та digital-дизайнер, який створює мобільні застосунки, вебсайти, інтерактивні рішення та візуальну айдентику.",
    "navSkills": "навички",
    "navExperience": "досвід",
    "availability": "Відкритий до фриланс-проєктів і співпраці",
    "experienceTitle": "Досвід роботи",
    "experienceWebsite": "Переглянути сайт",
    "experienceProfile": "Переглянути профіль",
    "experienceLinkedin": "Переглянути LinkedIn",
    "experienceDou": "Переглянути на DOU",
    "downloadCv": "переглянути CV",
    "cvFile": "assets/cv/Jack-Milka-CV-UA.pdf",
    "finalButton": "зв’язатися"
  }
};

const SERVICE_TRANSLATIONS = {
  "en": [
    {
      "title": "UI/UX & Product Design",
      "description": "Designing intuitive interfaces for mobile apps, websites and digital platforms, from early concepts to interactive prototypes.",
      "tools": "Figma · FigJam · Adobe Photoshop",
      "tags": [
        "Mobile App Design",
        "Web UI/UX",
        "SaaS Platforms",
        "iGaming Interfaces",
        "Wireframes & User Flows",
        "Interactive Prototypes",
        "Design Systems"
      ]
    },
    {
      "title": "Web Design & Development",
      "description": "Creating modern landing pages and responsive websites, combining thoughtful design with no-code development and AI-assisted workflows.",
      "tools": "Figma · Webflow · HTML · CSS · JavaScript · AI Coding Tools",
      "tags": [
        "Landing Pages",
        "Responsive Websites",
        "Webflow",
        "Frontend Implementation",
        "Website Animations",
        "AI-Assisted Development"
      ]
    },
    {
      "title": "Motion & Interaction",
      "description": "Bringing interfaces to life through meaningful transitions, micro-interactions and motion that improves the user experience.",
      "tools": "After Effects · Premiere Pro · Figma · GSAP",
      "tags": [
        "UI Animations",
        "Micro-interactions",
        "Motion Design",
        "Scroll Effects",
        "Interactive Experiences"
      ]
    },
    {
      "title": "Graphic & Visual Design",
      "description": "Creating visual identities, marketing graphics and digital assets that give products a distinctive and consistent look.",
      "tools": "Adobe Photoshop · Illustrator · Figma",
      "tags": [
        "Brand Identity",
        "Logo Design",
        "Marketing Banners",
        "Game Graphics",
        "Image Editing",
        "Presentation Design",
        "Visual Assets"
      ]
    }
  ],
  "uk": [
    {
      "title": "UI/UX & Product Design",
      "description": "Проєктування інтуїтивних інтерфейсів мобільних застосунків, вебсайтів і цифрових платформ — від перших концепцій до інтерактивних прототипів.",
      "tools": "Figma · FigJam · Adobe Photoshop",
      "tags": [
        "Дизайн мобільних застосунків",
        "Веб UI/UX",
        "SaaS-платформи",
        "iGaming-інтерфейси",
        "Вайрфрейми та користувацькі сценарії",
        "Інтерактивні прототипи",
        "Дизайн-системи"
      ]
    },
    {
      "title": "Вебдизайн та розробка",
      "description": "Створення сучасних лендингів та адаптивних вебсайтів із поєднанням продуманого дизайну, no-code розробки та AI-інструментів.",
      "tools": "Figma · Webflow · HTML · CSS · JavaScript · AI Coding Tools",
      "tags": [
        "Лендинги",
        "Адаптивні вебсайти",
        "Webflow",
        "Реалізація інтерфейсів",
        "Анімації вебсайтів",
        "Розробка з AI-інструментами"
      ]
    },
    {
      "title": "Motion & Interaction",
      "description": "Оживлення інтерфейсів за допомогою продуманих переходів, мікровзаємодій та анімації, що покращує користувацький досвід.",
      "tools": "After Effects · Premiere Pro · Figma · GSAP",
      "tags": [
        "Анімації інтерфейсу",
        "Мікровзаємодії",
        "Моушн-дизайн",
        "Ефекти прокручування",
        "Інтерактивні рішення"
      ]
    },
    {
      "title": "Графічний та візуальний дизайн",
      "description": "Створення візуальної айдентики, рекламної графіки та цифрових матеріалів, які формують впізнаваний і цілісний образ продукту.",
      "tools": "Adobe Photoshop · Illustrator · Figma",
      "tags": [
        "Айдентика бренду",
        "Дизайн логотипів",
        "Рекламні банери",
        "Ігрова графіка",
        "Редагування зображень",
        "Дизайн презентацій",
        "Візуальні матеріали"
      ]
    }
  ]
};

const EXPERIENCE_TRANSLATIONS = {
  "en": [
    {
      "role": "UI/UX Designer",
      "description": "Designing user interfaces and digital experiences for iGaming products, with a focus on usability, visual consistency, interaction patterns and scalable UI solutions.",
      "company": "Zexter",
      "period": "Oct 2025 — Present",
      "meta": "iGaming / Digital Products"
    },
    {
      "role": "UI/UX Designer",
      "description": "Designing mobile application interfaces, user flows, wireframes and interactive prototypes with a focus on usability, visual consistency and intuitive user experiences.",
      "company": "X-IT",
      "period": "Oct 2024 — Present",
      "meta": "Mobile App Design"
    },
    {
      "role": "UI/UX Designer — iGaming",
      "description": "Designed UI/UX solutions for iGaming-related digital products, including web interfaces, landing pages and interactive elements.",
      "company": "Storm Traffic",
      "period": "2020 — 2023"
    },
    {
      "role": "Graphic Designer",
      "description": "Created digital and print design materials for marketing and brand communications, including advertising graphics, layouts and visual assets.",
      "company": "Unique Media",
      "period": "May 2020 — Oct 2024",
      "meta": "Freelance / Remote · USA"
    },
    {
      "role": "Freelance UI/UX & Graphic Designer",
      "description": "Working independently with clients on website design, mobile interfaces, branding, marketing graphics and digital products.",
      "company": "Freelancehunt",
      "period": "2017 — Present"
    }
  ],
  "uk": [
    {
      "role": "UI/UX Designer",
      "description": "Проєктування інтерфейсів і цифрових продуктів у сфері iGaming з акцентом на зручність, візуальну послідовність, взаємодію та масштабовані UI-рішення.",
      "company": "Zexter",
      "period": "Жовтень 2025 — Дотепер",
      "meta": "iGaming / Цифрові продукти"
    },
    {
      "role": "UI/UX Designer",
      "description": "Проєктування інтерфейсів мобільних застосунків, користувацьких сценаріїв, вайрфреймів та інтерактивних прототипів з акцентом на зручність, візуальну послідовність та інтуїтивну взаємодію.",
      "company": "X-IT",
      "period": "Жовтень 2024 — Дотепер",
      "meta": "Mobile App Design"
    },
    {
      "role": "UI/UX Designer — iGaming",
      "description": "Розробка UI/UX рішень для цифрових продуктів у сфері iGaming, зокрема вебінтерфейсів, лендингів та інтерактивних елементів.",
      "company": "Storm Traffic",
      "period": "2020 — 2023"
    },
    {
      "role": "Graphic Designer",
      "description": "Створення цифрових і друкованих матеріалів для маркетингу та брендових комунікацій, зокрема рекламної графіки, макетів і візуальних матеріалів.",
      "company": "Unique Media",
      "period": "Травень 2020 — Жовтень 2024",
      "meta": "Фриланс / Віддалено · США"
    },
    {
      "role": "Freelance UI/UX & Graphic Designer",
      "description": "Самостійна робота з клієнтами над дизайном вебсайтів, мобільних інтерфейсів, брендингом, рекламною графікою та цифровими продуктами.",
      "company": "Freelancehunt",
      "period": "2017 — Дотепер"
    }
  ]
};

const I18N_TEXT_BINDINGS = {
  preloader: '.stair-reveal__text',
  navSkills: '.nav-menu a[href="#skills"] .nav-link-line, .mobile-menu-modal__links a[href="#skills"] .mobile-menu-modal__label',
  navWorks: '.nav-menu a[href="#works"] .nav-link-line, .mobile-menu-modal__links a[href="#works"] .mobile-menu-modal__label',
  navAbout: '.nav-menu a[href="#about-me"] .nav-link-line, .mobile-menu-modal__links a[href="#about-me"] .mobile-menu-modal__label',
  navExperience: '.nav-menu a[href="#experience"] .nav-link-line, .mobile-menu-modal__links a[href="#experience"] .mobile-menu-modal__label',
  navContact: '.nav-menu .book .nav-link-line, .form-modal__contact-spacer, .mobile-menu-modal__links a[data-open-form] .mobile-menu-modal__label',
  navMenu: '.nav-toggle .nav-link-line',
  heroButton: '.hero .btn__line',
  heroTitle: '.hero h1',
  aboutSub: '.about-sub',
  aboutTitle: '.about-title',
  statsTitle: '.stats-title',
  statsIntro: '.stats-intro',
  experienceTitle: '.experience-title',
  experienceWebsite: '[data-experience-link="website"] .social-link-line',
  experienceProfile: '[data-experience-link="profile"] .social-link-line',
  experienceLinkedin: '[data-experience-link="linkedin"] .social-link-line',
  experienceDou: '[data-experience-link="dou"] .social-link-line',
  availability: '.availability',
  downloadCv: '[data-cv-link] .btn__line',
  worksIntro: '.works-intro',
  worksTitle: '.works-title',
  worksCta: '.work-card__cta span',
  worksProcess: '.works-process-lead',
  finalTitle: '.contact-cta__title',
  navContactFinal: '.contact-cta__button .btn__line',
  cookieTitle: '.cookie-banner__title',
  cookieDescription: '.cookie-banner__description',
  accept: '.cookie-banner__button--accept .nav-link-line',
  decline: '.cookie-banner__button--decline .nav-link-line',
  formName: '.request-field[for="request-name"] > span',
  formEmail: '.request-field[for="request-email"] > span',
  formDetails: '.request-field[for="request-details"] > span',
  formRequest: '.request-btn .btn__line',
  formNotice: '.request-form__notice',
};

const I18N_HTML_KEYS = new Set(['statYears', 'statProjects', 'formNotice']);
const languageButtons = Array.from(document.querySelectorAll('[data-language]'));
const languagePreferenceKey = 'jack-milka-language';
const languageScrollResetKey = 'jack-milka-language-scroll-reset';
let activeLanguage = 'en';

const forcePageScrollTop = () => {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);
};

let resetScrollAfterLanguageReload = false;
try {
  resetScrollAfterLanguageReload = sessionStorage.getItem(languageScrollResetKey) === 'true';
  if (resetScrollAfterLanguageReload) sessionStorage.removeItem(languageScrollResetKey);
} catch {
  // The pre-reload reset below still covers browsers without session storage.
}

if (resetScrollAfterLanguageReload) {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  forcePageScrollTop();
  requestAnimationFrame(forcePageScrollTop);
  window.addEventListener('pageshow', () => {
    forcePageScrollTop();
    requestAnimationFrame(forcePageScrollTop);
    window.setTimeout(() => {
      if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
    }, 0);
  }, { once: true });
}

const setTranslatedContent = (element, value, useHtml = false) => {
  if (!element || typeof value !== 'string') return;
  const revealWasReady = element.dataset.revealReady === 'true';
  if (revealWasReady && element.hasAttribute('data-shuffle')) {
    element.querySelectorAll('.char').forEach(stopScramble);
  }

  if (revealWasReady) {
    revealCleanups.get(element)?.();
    element.classList.remove('is-visible', 'is-revealed', 'is-revealing');
    delete element.dataset.revealReady;
    delete element.dataset.revealTriggered;
  }

  if (useHtml) element.innerHTML = value;
  else element.textContent = value;

  if (!revealWasReady) return;
  setupReveal(element);
};

const applyLanguage = (language) => {
  const nextLanguage = language === 'uk' ? 'uk' : 'en';
  const strings = UI_TRANSLATIONS[nextLanguage];
  activeLanguage = nextLanguage;
  document.documentElement.lang = nextLanguage;
  document.title = strings.pageTitle;

  Object.entries(I18N_TEXT_BINDINGS).forEach(([key, selector]) => {
    const translationKey = key === 'navContactFinal' ? 'finalButton' : key;
    document.querySelectorAll(selector).forEach((element) => {
      setTranslatedContent(element, strings[translationKey], I18N_HTML_KEYS.has(translationKey));
    });
  });

  const statLabelKeys = ['statYears', 'statProjects'];
  document.querySelectorAll('.stat-label').forEach((element, index) => {
    const key = statLabelKeys[index];
    if (key) setTranslatedContent(element, strings[key], true);
  });

  document.querySelectorAll('.service').forEach((service, index) => {
    const serviceStrings = SERVICE_TRANSLATIONS[nextLanguage][index];
    if (!serviceStrings) return;
    setTranslatedContent(service.querySelector('.service-title'), serviceStrings.title);
    setTranslatedContent(service.querySelector('.service-desc > p:not(.service-tools)'), serviceStrings.description);
    setTranslatedContent(service.querySelector('.service-tools'), serviceStrings.tools);
    const tags = service.querySelectorAll('.tag');
    tags.forEach((tag, tagIndex) => {
      if (serviceStrings.tags[tagIndex]) tag.textContent = serviceStrings.tags[tagIndex];
    });
    service.querySelector('.service-tags')?.setAttribute('aria-label', serviceStrings.tags.join(', '));
  });

  const attributeBindings = [
    ['.site-header .nav', 'aria-label', 'primaryNavigation'],
    ['.mobile-menu-modal', 'aria-label', 'primaryNavigation'],
    ['.mobile-menu-modal__links', 'aria-label', 'primaryNavigation'],
    ['.mobile-menu-modal__close', 'aria-label', 'close'],
    ['.form-modal__header .nav', 'aria-label', 'modalNavigation'],
    ['.language-switcher', 'aria-label', 'language'],
    ['.works-nav .works-arrow--prev', 'aria-label', 'previousProject'],
    ['.works-nav .works-arrow--next', 'aria-label', 'nextProject'],
    ['.form-modal', 'aria-label', 'projectRequest'],
    ['.form-modal__close', 'aria-label', 'close'],
    ['.social-link--telegram, .contact-tile--telegram', 'aria-label', 'telegramContact'],
    ['.social-link--whatsapp, .contact-tile--whatsapp', 'aria-label', 'whatsappContact'],
    ['.social-links, .form-modal__contacts', 'aria-label', 'socialMedia'],
    // The CV follows the site language: EN → English PDF, УКР → Ukrainian PDF.
    ['[data-hero-cv], [data-cv-link]', 'href', 'cvFile'],
    ['.cookie-banner', 'aria-label', 'cookieTitle'],
    ['.cookie-banner__close', 'aria-label', 'cookieClose'],
  ];
  attributeBindings.forEach(([selector, attribute, key]) => {
    document.querySelectorAll(selector).forEach((element) => element.setAttribute(attribute, strings[key]));
  });

  languageButtons.forEach((button) => {
    const selected = button.dataset.language === nextLanguage;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });

  document.querySelectorAll('.experience-row').forEach((row, index) => {
    const entry = EXPERIENCE_TRANSLATIONS[nextLanguage][index];
    Object.entries(entry).forEach(([key, value]) => {
      row.querySelector(`[data-experience="${key}"]`).textContent = value;
    });
  });
  document.querySelector('meta[name="description"]')?.setAttribute('content', strings.pageDescription);
  ['og:title', 'twitter:title'].forEach((name) => document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.setAttribute('content', strings.pageTitle));
  ['og:description', 'twitter:description'].forEach((name) => document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.setAttribute('content', strings.pageDescription));
};

try {
  const storedLanguage = localStorage.getItem(languagePreferenceKey);
  if (storedLanguage === 'uk' || storedLanguage === 'en') {
    activeLanguage = storedLanguage;
  } else {
    activeLanguage = 'en';
  }
} catch {
  activeLanguage = 'en';
}

applyLanguage(activeLanguage);

languageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const nextLanguage = button.dataset.language;
    if (nextLanguage === activeLanguage) return;
    try {
      localStorage.setItem(languagePreferenceKey, nextLanguage);
    } catch {
      // Reload still proceeds in restrictive browsing contexts.
    }
    try {
      sessionStorage.setItem(languageScrollResetKey, 'true');
    } catch {
      // The immediate scroll reset below remains as a fallback.
    }
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    forcePageScrollTop();
    history.replaceState(history.state, '', `${window.location.pathname}${window.location.search}`);
    requestAnimationFrame(() => window.location.reload());
  });
});

function setupFadeIn() {
  const elements = Array.from(document.querySelectorAll('[data-fade]'));
  elements.forEach((el, index) => {
    el.style.transitionDelay = `${index * 0.06}s`;
    if (prefersReducedMotion) {
      el.classList.add('is-in');
    }
  });

  if (prefersReducedMotion) return;

  stairRevealDone.then(() => {
    requestAnimationFrame(() => {
      elements.forEach((el) => el.classList.add('is-in'));
    });
  });
}

document.querySelectorAll('[data-reveal]').forEach(setupReveal);
setupFadeIn();

// ---------------------------------------------------------------------------
// Original Hero character shuffle, triggered only by hovering each letter.
// ---------------------------------------------------------------------------
const scrambleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&$@/\\<>*';
const activeScrambles = new Map();
const scrambleHoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

const stopScramble = (char) => {
  const timers = activeScrambles.get(char);
  if (timers) {
    clearInterval(timers.intervalId);
    clearTimeout(timers.timeoutId);
    activeScrambles.delete(char);
  }

  if (char.dataset.original !== undefined) {
    char.textContent = char.dataset.original;
  }
  char.classList.remove('is-scrambling');
  char.style.removeProperty('--scramble-char-width');
};

const startScramble = (char) => {
  if (scrambleMotionQuery.matches || !char.textContent || /^\s+$/.test(char.textContent)) return;

  if (char.dataset.original === undefined) {
    char.dataset.original = char.textContent;
  }

  stopScramble(char);
  char.style.setProperty('--scramble-char-width', `${char.getBoundingClientRect().width}px`);
  char.classList.add('is-scrambling');
  const useLowercase = /^[a-z]$/.test(char.dataset.original);

  const updateCharacter = () => {
    const randomIndex = Math.floor(Math.random() * scrambleCharacters.length);
    const randomCharacter = scrambleCharacters[randomIndex];
    char.textContent = useLowercase ? randomCharacter.toLowerCase() : randomCharacter;
  };

  updateCharacter();
  const intervalId = setInterval(updateCharacter, 45);
  const timeoutId = setTimeout(() => stopScramble(char), 600);
  activeScrambles.set(char, { intervalId, timeoutId });
};

// Delegate to the title so translated/recreated letters need no new handlers.
const setupScramble = (title) => {
  title.addEventListener('mouseover', (event) => {
    if (!scrambleHoverQuery.matches || !title.classList.contains('is-revealed')) return;
    if (!(event.target instanceof HTMLElement) || !event.target.classList.contains('char')) return;
    startScramble(event.target);
  });

  title.addEventListener('mouseout', (event) => {
    if (!(event.target instanceof HTMLElement) || !event.target.classList.contains('char')) return;
    stopScramble(event.target);
  });

  title.addEventListener('mouseleave', () => {
    title.querySelectorAll('.char.is-scrambling').forEach(stopScramble);
  });
};

document.querySelectorAll('[data-shuffle]').forEach(setupScramble);

scrambleMotionQuery.addEventListener('change', (event) => {
  if (!event.matches) return;
  [...activeScrambles.keys()].forEach(stopScramble);
  document.querySelectorAll('[data-reveal]').forEach((title) => {
    revealCleanups.get(title)?.();
    title.dataset.revealTriggered = 'true';
    title.classList.remove('is-revealing');
    title.classList.add('is-visible', 'is-revealed');
  });
});

scrambleHoverQuery.addEventListener('change', (event) => {
  if (!event.matches) [...activeScrambles.keys()].forEach(stopScramble);
});

// ---------------------------------------------------------------------------
// WebGL hero background (three.js)
// ---------------------------------------------------------------------------
const heroSection = document.querySelector('.hero');

const rendererPixelRatio = () => Math.min(window.devicePixelRatio || 1, mqMobile.matches ? 1.5 : 2);
const rendererHeight = () => Math.max(1, Math.round(stableVh * (mqMobile.matches ? 0.5 : 1)));
const initialRendererHeight = rendererHeight();

const createHeroRenderer = () => {
  try {
    return new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (error) {
    console.warn('WebGL is unavailable; using the static hero fallback.', error);
    const canvas = document.createElement('canvas');
    canvas.className = 'is-webgl-fallback';
    canvas.style.backgroundImage = 'url("assets/header-1.png?v=20260716-1")';
    canvas.style.backgroundPosition = 'center bottom';
    canvas.style.backgroundRepeat = 'no-repeat';
    canvas.style.backgroundSize = 'cover';
    return {
      domElement: canvas,
      setPixelRatio: () => {},
      setSize: (width, height) => {
        canvas.width = Math.max(1, Math.round(width));
        canvas.height = Math.max(1, Math.round(height));
      },
      setClearColor: () => {},
      render: () => {},
    };
  }
};

const renderer = createHeroRenderer();
renderer.setPixelRatio(rendererPixelRatio());
renderer.setSize(viewportWidth, initialRendererHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x0b0b0b, 1);
heroSection.prepend(renderer.domElement);
renderer.domElement.id = 'hero-canvas';
const heroCanvas = renderer.domElement;

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
camera.position.z = 1;

const scene = new THREE.Scene();
const geometry = new THREE.PlaneGeometry(2.08, 2.08);
const uniforms = {
  uTexture: { value: null },
  uDisplacement: { value: null },
  uFlowMap: { value: null },
  uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  uParallax: { value: new THREE.Vector2(0, 0) },
  uMouseInfluence: { value: 0.0 },
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2(viewportWidth, initialRendererHeight) },
  uImageResolution: { value: new THREE.Vector2(1, 1) },
  uCoverAlignY: { value: mqMobile.matches ? 0.5 : 0.0 },
};

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision mediump float;

    uniform sampler2D uTexture;
    uniform sampler2D uDisplacement;
    uniform sampler2D uFlowMap;
    uniform vec2 uMouse;
    uniform vec2 uParallax;
    uniform float uMouseInfluence;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uImageResolution;
    uniform float uCoverAlignY;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;

      vec2 parallax = uParallax / uResolution;
      uv += parallax;

      vec2 ambient = texture2D(uDisplacement, uv * 1.18 + vec2(uTime * 0.012, uTime * 0.008)).rg - 0.5;
      uv += ambient * 0.012;

      vec2 flow = texture2D(uFlowMap, uv * 1.1 + vec2(uTime * 0.008, -uTime * 0.005)).rg - 0.5;
      uv += flow * 0.0065 * (0.45 + uMouseInfluence * 0.25);

      vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
      vec2 p = uv * aspect;
      vec2 m = uMouse * aspect;
      float d = distance(p, m);
      float ripple = smoothstep(0.52, 0.0, d);
      vec2 disp = texture2D(uDisplacement, uv + vec2(uTime * 0.028, -uTime * 0.018)).rg - 0.5;
      uv += disp * ripple * 0.09 * (0.75 + uMouseInfluence * 0.3);

      // "cover" fit: center horizontally; bottom-align on desktop
      vec2 s = uResolution / uImageResolution;
      float scale = max(s.x, s.y);
      vec2 size = uImageResolution * scale;
      vec2 overflow = uResolution - size;
      vec2 offset = vec2(overflow.x * 0.5, overflow.y * uCoverAlignY);
      vec2 coverUv = (uv * uResolution - offset) / size;

      gl_FragColor = texture2D(uTexture, coverUv);
    }
  `,
});

scene.add(new THREE.Mesh(geometry, material));

const textureLoader = new THREE.TextureLoader();
const texturePaths = ['assets/header-1.png?v=20260716-1', 'assets/heightMap.png', 'assets/map-9.jpg'];

const loadTexture = (path) =>
  new Promise((resolve, reject) => {
    textureLoader.load(
      path,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        resolve(texture);
      },
      undefined,
      reject,
    );
  });

const targetMouse = { x: 0.5, y: 0.5 };
const smoothedMouse = { x: 0.5, y: 0.5 };
let influence = 0.0;
let activePointer = false;

if (pointerFine) {
  window.addEventListener('pointermove', (event) => {
    targetMouse.x = event.clientX / viewportWidth;
    targetMouse.y = 1 - event.clientY / stableVh;
    activePointer = true;
    influence = 1.0;
  });

  window.addEventListener('pointerleave', () => {
    activePointer = false;
  });
}

// Mobile: the hero scrolls out of view natively — stop rendering once it's gone
let heroInView = true;
let webglReady = false;
let heroRenderFrame = 0;
let desktopScrollActive = false;

const renderLoop = () => {
  heroRenderFrame = 0;
  if (!webglReady || !heroInView || desktopScrollActive) return;

  smoothedMouse.x += (targetMouse.x - smoothedMouse.x) * 0.06;
  smoothedMouse.y += (targetMouse.y - smoothedMouse.y) * 0.06;

  if (activePointer) {
    influence += (1 - influence) * 0.16;
  } else {
    influence *= 0.94;
  }

  uniforms.uMouse.value.set(smoothedMouse.x, smoothedMouse.y);
  uniforms.uParallax.value.set((0.5 - smoothedMouse.x) * 30, (0.5 - smoothedMouse.y) * 30);
  uniforms.uMouseInfluence.value = influence;
  uniforms.uTime.value += 0.016;

  renderer.render(scene, camera);
  heroRenderFrame = requestAnimationFrame(renderLoop);
};

const startHeroRender = () => {
  if (webglReady && heroInView && !heroRenderFrame) {
    heroRenderFrame = requestAnimationFrame(renderLoop);
  }
};

new IntersectionObserver(([entry]) => {
  heroInView = entry.isIntersecting;
  if (heroInView) {
    startHeroRender();
  } else {
    cancelAnimationFrame(heroRenderFrame);
    heroRenderFrame = 0;
  }
}).observe(heroSection);

Promise.all(
  texturePaths.map((path, i) =>
    loadTexture(path).finally(() => markLoaded(`tex${i}`)),
  ),
).then(([texture, displacement, flowMap]) => {
  uniforms.uTexture.value = texture;
  uniforms.uDisplacement.value = displacement;
  uniforms.uFlowMap.value = flowMap;
  uniforms.uImageResolution.value.set(texture.image.width, texture.image.height);
  webglReady = true;
  startHeroRender();
}).catch((error) => {
  console.error('Hero textures failed to load:', error);
});

// ---------------------------------------------------------------------------
// Services: natural-height sticky stack. No scroll-driven layout writes.
// ---------------------------------------------------------------------------
const serviceEls = Array.from(document.querySelectorAll('.service'));

if (serviceEls.length) {
  if (prefersReducedMotion) {
    serviceEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const serviceObserver = new IntersectionObserver((entries, obs) => {
      const incoming = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => serviceEls.indexOf(a.target) - serviceEls.indexOf(b.target));
      incoming.forEach((entry, batchIndex) => {
        setTimeout(() => entry.target.classList.add('is-in'), batchIndex * 130);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    serviceEls.forEach((el) => serviceObserver.observe(el));
  }

}

// ---------------------------------------------------------------------------
// Service tags: isolated Matter.js worlds with one shared, sleep-aware rAF.
// ---------------------------------------------------------------------------
const serviceTagContainers = Array.from(document.querySelectorAll('.service-tags'));

if (serviceTagContainers.length) {
  if (prefersReducedMotion) {
    serviceTagContainers.forEach((container) => container.classList.add('is-static'));
  } else {
    const { Engine, Bodies, Body, Composite, Sleeping } = Matter;
    const TAG_CEILING_CATEGORY = 0x0002;
    const TAG_MASK_WITHOUT_CEILING = 0xfffffffd;
    const activeTagPhysics = new Set();
    const tagPhysicsStates = serviceTagContainers.map((container) => ({
      container,
      service: container.closest('.service'),
      chips: Array.from(container.querySelectorAll('.tag')),
      engine: Engine.create({ enableSleeping: true }),
      records: [],
      boundaries: [],
      width: 0,
      height: 0,
      ceilingY: 0,
      ready: false,
      startRequested: false,
      started: false,
      spawnedCount: 0,
      visible: false,
      pointer: { active: false, x: 0, y: 0, left: 0, top: 0 },
    }));

    let tagPhysicsFrame = 0;
    let previousPhysicsTime = 0;
    const TAG_PHYSICS_FRAME_INTERVAL = 1000 / 30;

    tagPhysicsStates.forEach((state) => {
      state.engine.gravity.y = 1;
    });

    const canRunTagPhysics = (state) =>
      state.ready &&
      state.started &&
      state.spawnedCount > 0 &&
      state.visible;

    const renderTagRecord = (record) => {
      const { position, angle } = record.body;
      record.element.style.transform =
        `translate3d(${position.x - record.width / 2}px, ${position.y - record.height / 2}px, 0) ` +
        `rotate(${angle}rad)`;
    };

    const enforceTagCeiling = (state, record) => {
      const topLimit = state.ceilingY + record.height / 2;

      if (!record.ceilingEnabled && record.body.position.y >= topLimit) {
        record.ceilingEnabled = true;
        record.body.collisionFilter.mask = 0xffffffff;
      }

      if (record.ceilingEnabled && record.body.position.y < topLimit) {
        Body.setPosition(record.body, {
          x: record.body.position.x,
          y: topLimit,
        });
        Body.setVelocity(record.body, {
          x: record.body.velocity.x,
          y: Math.abs(record.body.velocity.y) * 0.25,
        });
      }
    };

    const renderTagState = (state) => {
      state.records.forEach((record) => {
        if (!record.spawned) return;
        enforceTagCeiling(state, record);
        renderTagRecord(record);
      });
    };

    const repelTagsFromPointer = (state) => {
      if (!state.pointer.active) return;
      const radius = 160;

      state.records.forEach((record) => {
        if (!record.spawned) return;
        let dx = record.body.position.x - state.pointer.x;
        let dy = record.body.position.y - state.pointer.y;
        let distance = Math.hypot(dx, dy);
        if (distance >= radius) return;
        if (distance < 0.001) {
          dx = Math.random() - 0.5;
          dy = Math.random() - 0.5;
          distance = Math.hypot(dx, dy) || 1;
        }

        const proximity = 1 - distance / radius;
        const force = 0.006 * record.body.mass * proximity;
        Sleeping.set(record.body, false);
        Body.applyForce(record.body, record.body.position, {
          x: (dx / distance) * force,
          y: (dy / distance) * force,
        });
      });
    };

    const runTagPhysics = (time) => {
      tagPhysicsFrame = 0;
      let pointerActive = false;
      for (const state of activeTagPhysics) {
        if (state.pointer.active) {
          pointerActive = true;
          break;
        }
      }
      const frameInterval = pointerActive ? 1000 / 60 : TAG_PHYSICS_FRAME_INTERVAL;
      if (previousPhysicsTime && time - previousPhysicsTime < frameInterval * 0.9) {
        tagPhysicsFrame = requestAnimationFrame(runTagPhysics);
        return;
      }
      const delta = previousPhysicsTime
        ? Math.min(1000 / 30, Math.max(1000 / 120, time - previousPhysicsTime))
        : 1000 / 60;
      previousPhysicsTime = time;

      activeTagPhysics.forEach((state) => {
        if (!canRunTagPhysics(state)) {
          activeTagPhysics.delete(state);
          return;
        }

        repelTagsFromPointer(state);
        Engine.update(state.engine, delta);
        renderTagState(state);

        const allSpawned = state.spawnedCount === state.records.length;
        const allSleeping = allSpawned && state.records.every(({ body }) => body.isSleeping);
        if (allSleeping) {
          activeTagPhysics.delete(state);
        }
      });

      if (activeTagPhysics.size) {
        tagPhysicsFrame = requestAnimationFrame(runTagPhysics);
      } else {
        previousPhysicsTime = 0;
      }
    };

    const activateTagPhysics = (state) => {
      if (!canRunTagPhysics(state)) return;
      activeTagPhysics.add(state);
      if (!tagPhysicsFrame) tagPhysicsFrame = requestAnimationFrame(runTagPhysics);
    };

    const rebuildTagBoundaries = (state) => {
      state.boundaries.forEach((boundary) => Composite.remove(state.engine.world, boundary));

      const thickness = 80;
      const wallHeight = state.height + 400;
      const wallY = state.height / 2 - 100;
      state.boundaries = [
        Bodies.rectangle(
          state.width / 2,
          state.ceilingY - thickness / 2,
          state.width + thickness * 2,
          thickness,
          {
            isStatic: true,
            collisionFilter: { category: TAG_CEILING_CATEGORY },
          },
        ),
        Bodies.rectangle(
          state.width / 2,
          state.height + thickness / 2,
          state.width + thickness * 2,
          thickness,
          { isStatic: true },
        ),
        Bodies.rectangle(-thickness / 2, wallY, thickness, wallHeight, { isStatic: true }),
        Bodies.rectangle(
          state.width + thickness / 2,
          wallY,
          thickness,
          wallHeight,
          { isStatic: true },
        ),
      ];
      Composite.add(state.engine.world, state.boundaries);
    };

    const resizeTagPhysics = (state) => {
      if (!state.ready) return;
      const rect = state.container.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;

      state.width = rect.width;
      state.height = rect.height;
      state.pointer.left = rect.left;
      state.pointer.top = rect.top;
      const titleRect = state.service?.querySelector('.service-title')?.getBoundingClientRect();
      state.ceilingY = mqMobile.matches
        ? 0
        : titleRect
          ? Math.min(0, titleRect.top - rect.top)
          : 0;
      state.container.style.setProperty('--tag-ceiling-y', `${state.ceilingY}px`);
      rebuildTagBoundaries(state);

      state.records.forEach((record) => {
        if (!record.spawned) return;
        const minX = Math.min(record.width / 2, state.width / 2);
        const maxX = Math.max(minX, state.width - record.width / 2);
        const minY = Math.min(record.height / 2, state.height / 2);
        const maxY = Math.max(minY, state.height - record.height / 2);
        Body.setPosition(record.body, {
          x: Math.min(maxX, Math.max(minX, record.body.position.x)),
          y: Math.min(maxY, Math.max(minY, record.body.position.y)),
        });
        enforceTagCeiling(state, record);
        Sleeping.set(record.body, false);
        renderTagRecord(record);
      });

      activateTagPhysics(state);
    };

    const spawnTag = (state, record) => {
      if (record.spawned) return;
      const minX = Math.min(record.width / 2, state.width / 2);
      const maxX = Math.max(minX, state.width - record.width / 2);
      const spawnX = minX + Math.random() * (maxX - minX);
      const spawnY = state.ceilingY - (60 + Math.random() * 100);

      Body.setPosition(record.body, { x: spawnX, y: spawnY });
      Body.setAngle(record.body, (Math.random() - 0.5) * 0.4);
      Body.setAngularVelocity(record.body, (Math.random() - 0.5) * 0.05);
      Composite.add(state.engine.world, record.body);
      record.spawned = true;
      state.spawnedCount += 1;
      record.element.style.opacity = '1';
      renderTagRecord(record);
      activateTagPhysics(state);
    };

    const startTagCascade = (state) => {
      state.startRequested = true;
      if (!state.ready || state.started) return;
      state.started = true;
      state.records.forEach((record, index) => {
        window.setTimeout(() => spawnTag(state, record), index * 90);
      });
    };

    const initializeTagPhysics = (state) => {
      state.records = state.chips.map((element) => {
        const rect = element.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const body = Bodies.rectangle(0, 0, width, height, {
          chamfer: { radius: height / 2 },
          restitution: 0.2,
          friction: 0.3,
          frictionAir: 0.015,
          collisionFilter: {
            category: 0x0001,
            mask: TAG_MASK_WITHOUT_CEILING,
          },
        });
        return { element, body, width, height, spawned: false, ceilingEnabled: false };
      });
      state.ready = true;
      resizeTagPhysics(state);
      if (state.startRequested) startTagCascade(state);
    };

    const servicePhysicsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const state = tagPhysicsStates.find(({ container }) => container === entry.target);
        if (!state) return;

        state.visible = entry.isIntersecting;
        if (state.visible) {
          startTagCascade(state);
          activateTagPhysics(state);
        } else {
          activeTagPhysics.delete(state);
        }
      });
    }, { threshold: 0.05 });

    tagPhysicsStates.forEach((state) => {
      servicePhysicsObserver.observe(state.container);

      const resizeObserver = new ResizeObserver(() => resizeTagPhysics(state));
      resizeObserver.observe(state.container);

      if (pointerFine) {
        const updateTagPointerPosition = (event) => {
          state.pointer.x = event.clientX - state.pointer.left;
          state.pointer.y = event.clientY - state.pointer.top;
          activateTagPhysics(state);
        };

        state.container.addEventListener('pointerenter', (event) => {
          const rect = state.container.getBoundingClientRect();
          state.pointer.left = rect.left;
          state.pointer.top = rect.top;
          state.pointer.active = true;
          updateTagPointerPosition(event);
        }, { passive: true });
        state.container.addEventListener('pointermove', updateTagPointerPosition, { passive: true });
        state.container.addEventListener('pointerleave', () => {
          state.pointer.active = false;
        });
      }
    });

    (document.fonts?.ready || Promise.resolve()).then(() => {
      tagPhysicsStates.forEach(initializeTagPhysics);
    });
  }
}

// ---------------------------------------------------------------------------
// Stats counter: one viewport observer, no scroll/resize listeners.
// ---------------------------------------------------------------------------
const statsSection = document.querySelector('.stats');
const statNums = Array.from(document.querySelectorAll('.stat-num[data-count-to]'));

const formatStatValue = (el, value) => {
  const suffix = el.dataset.suffix || '';
  return `${String(value).padStart(2, '0')}${suffix}`;
};

const resetStatValues = () => {
  statNums.forEach((el) => {
    el.textContent = formatStatValue(el, 0);
  });
};

const setFinalStatValues = () => {
  statNums.forEach((el) => {
    const target = Number.parseInt(el.dataset.countTo || '0', 10);
    el.textContent = formatStatValue(el, target);
  });
};

const animateStatValues = () => {
  const duration = 1800;
  let start = null;

  const tick = (now) => {
    if (start === null) start = now;

    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);

    statNums.forEach((el) => {
      const target = Number.parseInt(el.dataset.countTo || '0', 10);
      const value = Math.round(target * eased);
      el.textContent = formatStatValue(el, value);
    });

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      setFinalStatValues();
    }
  };

  requestAnimationFrame(tick);
};

if (statsSection && statNums.length) {
  if (prefersReducedMotion) {
    setFinalStatValues();
  } else {
    resetStatValues();
    const statsTrigger = statsSection.querySelector('.stat') || statsSection;
    let hasCounted = false;
    let statsObserver;

    const startStatsCounter = () => {
      if (hasCounted) return;
      hasCounted = true;
      animateStatValues();
      statsObserver?.disconnect();
    };

    const startIfStatsAreVisible = () => {
      const rect = statsTrigger.getBoundingClientRect();
      const viewportHeight = document.documentElement.clientHeight;
      if (rect.bottom > 0 && rect.top < viewportHeight) startStatsCounter();
    };

    statsObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) startStatsCounter();
    }, { threshold: 0.01 });

    statsObserver.observe(statsTrigger);

    if (document.readyState === 'complete') {
      requestAnimationFrame(startIfStatsAreVisible);
    } else {
      window.addEventListener('load', () => {
        requestAnimationFrame(startIfStatsAreVisible);
      }, { once: true });
    }
  }
}

// ---------------------------------------------------------------------------
// Experience: native keyboard-accessible disclosures with measured height transitions.
document.querySelectorAll('.experience-row').forEach((row) => {
  let animation;
  row.querySelector('summary').addEventListener('click', (event) => {
    if (prefersReducedMotion) return;
    event.preventDefault();
    const startHeight = row.getBoundingClientRect().height;
    const opening = !row.open || row.dataset.closing === 'true';
    animation?.cancel();
    row.open = true;
    row.dataset.closing = String(!opening);
    const endHeight = opening ? row.scrollHeight : row.querySelector('summary').offsetHeight;
    row.style.overflow = 'hidden';
    animation = row.animate({ height: [startHeight + 'px', endHeight + 'px'] }, {
      duration: 350, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    });
    animation.onfinish = () => {
      row.open = opening;
      row.style.overflow = '';
      delete row.dataset.closing;
      lenis?.resize();
    };
  });
});

// ---------------------------------------------------------------------------
// Selected work: native horizontal scrolling with arrow controls.
// ---------------------------------------------------------------------------
const worksSection = document.querySelector('.works');
const worksInner = worksSection?.querySelector('.works-inner');
const worksTitle = worksSection?.querySelector('.works-title');
const worksViewport = worksSection?.querySelector('.works-viewport');
const worksTrack = worksSection?.querySelector('.works-track');
const workCards = Array.from(worksSection?.querySelectorAll('.work-card') || []);
const worksPrev = worksSection?.querySelector('.works-arrow--prev');
const worksNext = worksSection?.querySelector('.works-arrow--next');

const getWorkSlideStep = () => {
  if (!workCards.length || !worksTrack) return 0;
  const cardWidth = workCards[0].getBoundingClientRect().width;
  const gap = Number.parseFloat(getComputedStyle(worksTrack).columnGap) || 0;
  return cardWidth + gap;
};

const renderWorksControls = () => {
  if (!worksViewport) return;
  const maxScroll = Math.max(0, worksViewport.scrollWidth - worksViewport.clientWidth);
  if (worksPrev) worksPrev.disabled = worksViewport.scrollLeft <= 0.5;
  if (worksNext) worksNext.disabled = worksViewport.scrollLeft >= maxScroll - 0.5;
};

const measureWorks = () => {
  if (!worksInner || !worksTitle || !worksViewport || !worksTrack || !workCards.length) return;
  const innerStyles = getComputedStyle(worksInner);
  const startOffset = mqMobile.matches
    ? Number.parseFloat(innerStyles.paddingLeft) || 0
    : worksTitle.getBoundingClientRect().left;
  worksTrack.style.setProperty('--works-start-offset', `${startOffset}px`);
  renderWorksControls();
};

worksPrev?.addEventListener('click', () => {
  worksViewport?.scrollBy({
    left: -getWorkSlideStep(),
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });
});

worksNext?.addEventListener('click', () => {
  worksViewport?.scrollBy({
    left: getWorkSlideStep(),
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });
});

worksViewport?.addEventListener('scroll', () => {
  renderWorksControls();
}, { passive: true });

if (worksSection && workCards.length) {
  if (prefersReducedMotion) {
    workCards.forEach((card) => card.classList.add('is-in'));
  } else {
    const worksObserver = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      workCards.forEach((card) => card.classList.add('is-in'));
      observer.unobserve(worksSection);
    }, { threshold: 0.2 });

    worksObserver.observe(worksSection);
  }
}

const createPageTransition = () => {
  const transition = document.createElement('div');
  transition.className = 'page-transition';
  transition.setAttribute('aria-hidden', 'true');
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 8; index += 1) {
    const step = document.createElement('span');
    step.className = 'page-transition__step';
    step.style.setProperty('--i', String(index));
    fragment.appendChild(step);
  }
  transition.appendChild(fragment);
  document.body.appendChild(transition);
  return transition;
};

const clearPageTransitionState = () => {
  document.body.classList.remove('is-page-transitioning');
  document.querySelectorAll('.page-transition').forEach((transition) => transition.remove());
};

window.addEventListener('pagehide', clearPageTransitionState);
window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  clearPageTransitionState();
  lenis?.resize();
  lenis?.start();
});

document.querySelectorAll('[data-case-link]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (
      event.defaultPrevented
      || (typeof event.button === 'number' && event.button !== 0)
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) return;

    event.preventDefault();
    const destination = link.href;
    if (prefersReducedMotion) {
      window.location.assign(destination);
      return;
    }

    const transition = createPageTransition();
    document.body.classList.add('is-page-transitioning');
    transition.getBoundingClientRect();
    transition.classList.add('is-closing');
    window.setTimeout(() => window.location.assign(destination), 1160);
  });
});

// ---------------------------------------------------------------------------
// Jack Milka pixel grid: one responsive Canvas 2D surface. The static grid is
// redrawn only on resize; rAF runs while hovered or while residual heat fades.
// ---------------------------------------------------------------------------
const pixelsSection = document.querySelector('.pixels');
const pixelsCanvas = pixelsSection?.querySelector('.pixels-canvas');

if (pixelsSection && pixelsCanvas) {
  const PIXEL_SIZE = 16;
  const PIXEL_GAP = 4;
  const PIXEL_STEP = PIXEL_SIZE + PIXEL_GAP;
  const PIXEL_FADE_DURATION = 1000;
  const PIXEL_PATH_SAMPLE_STEP = 2;
  const PIXEL_LOGO_DESKTOP = 'MLK.DESIGN';
  const PIXEL_LOGO_MOBILE = 'MLK.DESIGN';
  const PIXEL_LOGO_HEIGHT = 7;
  const PIXEL_LOGO_INSET_CELLS = 1;
  const GLYPHS = {
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    G: ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
    N: ['10001', '11001', '11001', '10101', '10011', '10011', '10001'],
    J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
    ' ': ['000', '000', '000', '000', '000', '000', '000'],
    M: ['10001', '11011', '10101', '10001', '10001', '10001', '10001'],
    L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
    '.': ['00', '00', '00', '00', '00', '11', '11'],
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  };

  const buildPixelLogo = (text) => {
    const cells = new Set();
    let width = 0;

    [...text].forEach((character, characterIndex) => {
      const glyph = GLYPHS[character];
      glyph.forEach((row, rowIndex) => {
        [...row].forEach((value, colIndex) => {
          if (value === '1') cells.add(`${width + colIndex},${rowIndex}`);
        });
      });
      width += glyph[0].length;
      if (characterIndex < text.length - 1) width += 1;
    });

    return { cells, width };
  };

  const pixelLogos = {
    desktop: buildPixelLogo(PIXEL_LOGO_DESKTOP),
    mobile: buildPixelLogo(PIXEL_LOGO_MOBILE),
  };
  let activePixelLogo = pixelLogos.desktop;

  const parseHexColor = (value) => {
    const match = value.trim().match(/^#([\da-f]{6})$/i);
    if (!match) return { r: 255, g: 90, b: 31 };
    const number = Number.parseInt(match[1], 16);
    return {
      r: (number >> 16) & 255,
      g: (number >> 8) & 255,
      b: number & 255,
    };
  };

  const accent = parseHexColor(
    getComputedStyle(document.documentElement).getPropertyValue('--accent'),
  );
  const context = pixelsCanvas.getContext('2d', { alpha: true });
  const pointer = { active: false, hasPosition: false, x: 0, y: 0, cellIndex: -1 };
  let cssWidth = 0;
  let cssHeight = 0;
  let columns = 0;
  let rows = 0;
  let gridOffsetX = 0;
  let gridOffsetY = 0;
  let baseAlphas = new Float32Array(0);
  let heat = new Float32Array(0);
  let pixelsFrame = 0;
  let previousPixelsTime = 0;

  const isLogoCell = (col, row) => {
    const logoColumns = columns - PIXEL_LOGO_INSET_CELLS * 2;
    const logoRows = rows - PIXEL_LOGO_INSET_CELLS * 2;
    const logoCol = col - PIXEL_LOGO_INSET_CELLS;
    const logoRow = row - PIXEL_LOGO_INSET_CELLS;
    if (
      logoColumns <= 0 ||
      logoRows <= 0 ||
      logoCol < 0 ||
      logoCol >= logoColumns ||
      logoRow < 0 ||
      logoRow >= logoRows
    ) return false;

    const sourceCol = Math.min(
      activePixelLogo.width - 1,
      Math.floor((logoCol / logoColumns) * activePixelLogo.width),
    );
    const sourceRow = Math.min(
      PIXEL_LOGO_HEIGHT - 1,
      Math.floor((logoRow / logoRows) * PIXEL_LOGO_HEIGHT),
    );
    return activePixelLogo.cells.has(`${sourceCol},${sourceRow}`);
  };

  const pixelColor = (baseAlpha, factor) => {
    if (factor <= 0) return `rgba(255, 255, 255, ${baseAlpha})`;
    if (baseAlpha <= 0) {
      return `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${factor})`;
    }
    const red = Math.round(255 + (accent.r - 255) * factor);
    const green = Math.round(255 + (accent.g - 255) * factor);
    const blue = Math.round(255 + (accent.b - 255) * factor);
    const alpha = baseAlpha + (1 - baseAlpha) * factor;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  };

  const drawPixelGrid = (withHeat = false) => {
    if (!context || !cssWidth || !cssHeight) return;
    context.clearRect(0, 0, cssWidth, cssHeight);

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        const index = row * columns + col;
        context.fillStyle = pixelColor(baseAlphas[index], withHeat ? heat[index] : 0);
        context.fillRect(
          gridOffsetX + col * PIXEL_STEP,
          gridOffsetY + row * PIXEL_STEP,
          PIXEL_SIZE,
          PIXEL_SIZE,
        );
      }
    }
  };

  const getPixelCellIndex = (x, y) => {
    const localX = x - gridOffsetX;
    const localY = y - gridOffsetY;
    if (localX < 0 || localY < 0) return -1;

    const col = Math.floor(localX / PIXEL_STEP);
    const row = Math.floor(localY / PIXEL_STEP);
    if (col < 0 || col >= columns || row < 0 || row >= rows) return -1;
    if (localX - col * PIXEL_STEP >= PIXEL_SIZE) return -1;
    if (localY - row * PIXEL_STEP >= PIXEL_SIZE) return -1;
    return row * columns + col;
  };

  const heatPixelPath = (startX, startY, endX, endY) => {
    const distance = Math.hypot(endX - startX, endY - startY);
    const samples = Math.max(1, Math.ceil(distance / PIXEL_PATH_SAMPLE_STEP));

    for (let sample = 0; sample <= samples; sample += 1) {
      const progress = sample / samples;
      const index = getPixelCellIndex(
        startX + (endX - startX) * progress,
        startY + (endY - startY) * progress,
      );
      if (index >= 0) heat[index] = 1;
    }
  };

  const renderPixelsHeat = (time) => {
    pixelsFrame = 0;
    const delta = previousPixelsTime ? Math.max(0, time - previousPixelsTime) : 0;
    previousPixelsTime = time;
    const cooling = delta / PIXEL_FADE_DURATION;
    let maxHeat = 0;

    for (let index = 0; index < heat.length; index += 1) {
      if (pointer.active && index === pointer.cellIndex) {
        heat[index] = 1;
      } else if (heat[index] > 0) {
        heat[index] = Math.max(0, heat[index] - cooling);
      }
      if (heat[index] > maxHeat) maxHeat = heat[index];
    }

    drawPixelGrid(true);

    if (pointer.active || maxHeat > 0.001) {
      pixelsFrame = requestAnimationFrame(renderPixelsHeat);
    } else {
      heat.fill(0);
      previousPixelsTime = 0;
      drawPixelGrid(false);
    }
  };

  const startPixelsHeat = () => {
    if (!pixelsFrame) {
      previousPixelsTime = 0;
      pixelsFrame = requestAnimationFrame(renderPixelsHeat);
    }
  };

  const resizePixels = () => {
    const rect = pixelsCanvas.getBoundingClientRect();
    cssWidth = rect.width;
    cssHeight = rect.height;
    const dpr = window.devicePixelRatio || 1;

    pixelsCanvas.width = Math.max(1, Math.round(cssWidth * dpr));
    pixelsCanvas.height = Math.max(1, Math.round(cssHeight * dpr));
    context?.setTransform(dpr, 0, 0, dpr, 0, 0);

    columns = Math.max(0, Math.floor((cssWidth + PIXEL_GAP) / PIXEL_STEP));
    rows = Math.max(0, Math.floor((cssHeight + PIXEL_GAP) / PIXEL_STEP));
    activePixelLogo = mqMobile.matches ? pixelLogos.mobile : pixelLogos.desktop;
    const gridWidth = columns > 0 ? columns * PIXEL_SIZE + (columns - 1) * PIXEL_GAP : 0;
    const gridHeight = rows > 0 ? rows * PIXEL_SIZE + (rows - 1) * PIXEL_GAP : 0;
    gridOffsetX = (cssWidth - gridWidth) / 2;
    gridOffsetY = (cssHeight - gridHeight) / 2;
    baseAlphas = new Float32Array(columns * rows);
    heat = new Float32Array(columns * rows);

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        baseAlphas[row * columns + col] = isLogoCell(col, row) ? 0.1 : 0;
      }
    }

    pointer.cellIndex = getPixelCellIndex(pointer.x, pointer.y);
    if (pointer.active && pointer.cellIndex >= 0) heat[pointer.cellIndex] = 1;
    previousPixelsTime = 0;
    drawPixelGrid(pointer.active);
  };

  if (pointerFine && !prefersReducedMotion) {
    const updatePixelsPointer = (event) => {
      const nextX = event.offsetX;
      const nextY = event.offsetY;
      if (pointer.hasPosition) {
        heatPixelPath(pointer.x, pointer.y, nextX, nextY);
      }
      pointer.x = nextX;
      pointer.y = nextY;
      pointer.cellIndex = getPixelCellIndex(nextX, nextY);
      if (pointer.cellIndex >= 0) heat[pointer.cellIndex] = 1;
      pointer.hasPosition = true;
    };

    pixelsCanvas.addEventListener('pointerenter', (event) => {
      pointer.active = true;
      pointer.hasPosition = false;
      updatePixelsPointer(event);
      startPixelsHeat();
    }, { passive: true });

    pixelsCanvas.addEventListener('pointermove', updatePixelsPointer, { passive: true });

    pixelsCanvas.addEventListener('pointerleave', () => {
      pointer.active = false;
      pointer.hasPosition = false;
      pointer.cellIndex = -1;
      startPixelsHeat();
    }, { passive: true });
  }

  const pixelsResizeObserver = new ResizeObserver(resizePixels);
  pixelsResizeObserver.observe(pixelsSection);
  resizePixels();
}

// ---------------------------------------------------------------------------
// Scroll source: Lenis at 30% of the previous wheel speed on desktop.
// Mobile stays native.
// ---------------------------------------------------------------------------
let lenis = null;
let lenisFrame = 0;
let desktopScrollIdleTimer = 0;
const HERO_PARALLAX_STRENGTH = 0.3;
let lastHeroParallaxOffset = Number.NaN;

const finishDesktopScrollEffects = () => {
  clearTimeout(desktopScrollIdleTimer);
  desktopScrollIdleTimer = 0;
  desktopScrollActive = false;
  document.body.classList.remove('is-scrolling');
  startHeroRender();
};

const markDesktopScrolling = () => {
  if (mqMobile.matches) return;
  desktopScrollActive = true;
  document.body.classList.add('is-scrolling');
  cancelAnimationFrame(heroRenderFrame);
  heroRenderFrame = 0;
  clearTimeout(desktopScrollIdleTimer);
  desktopScrollIdleTimer = window.setTimeout(finishDesktopScrollEffects, 120);
};

const runLenisFrame = (time) => {
  if (!lenis) {
    lenisFrame = 0;
    return;
  }
  lenis.raf(time);
  lenisFrame = requestAnimationFrame(runLenisFrame);
};

const startLenisFrame = () => {
  if (!lenisFrame) lenisFrame = requestAnimationFrame(runLenisFrame);
};

const stopLenisFrame = () => {
  cancelAnimationFrame(lenisFrame);
  lenisFrame = 0;
};

const updateHeroParallax = (scroll) => {
  const enabled = !mqMobile.matches && !prefersReducedMotion;
  const clampedScroll = Math.min(stableVh, Math.max(0, scroll));
  const offset = enabled ? clampedScroll * HERO_PARALLAX_STRENGTH : 0;
  if (Math.abs(offset - lastHeroParallaxOffset) < 0.1) return;

  lastHeroParallaxOffset = offset;
  heroCanvas.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
};

const setScrollMode = () => {
  const useLenis = !mqMobile.matches && !prefersReducedMotion;

  if (useLenis && !lenis) {
    lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 0.3,
      syncTouch: false,
      autoResize: false,
    });
    lenis.on('scroll', ({ scroll }) => {
      markDesktopScrolling();
      updateHeroParallax(scroll);
    });
    startLenisFrame();
  } else if (!useLenis) {
    if (lenis) {
      stopLenisFrame();
      lenis.destroy();
      lenis = null;
    }
    finishDesktopScrollEffects();
  }

  if (document.body.classList.contains('form-open')) {
    lenis?.stop();
  }

  updateHeroParallax(lenis?.scroll ?? window.scrollY);
};

const anchorHeader = document.querySelector('.site-header');

const scrollToPageHash = (hash) => {
  const target = hash ? document.getElementById(hash.slice(1)) : null;
  if (!target) return;

  const isPageTop = target.id === 'top';
  const headerOffset = isPageTop
    ? 0
    : -((anchorHeader?.getBoundingClientRect().height || 0) + 15);

  if (lenis) {
    lenis.scrollTo(target, {
      offset: headerOffset,
      duration: 1.2,
    });
  } else {
    const targetTop = isPageTop
      ? 0
      : window.scrollY + target.getBoundingClientRect().top + headerOffset;
    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }

  if (window.location.hash !== hash) history.pushState(null, '', hash);
};

document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
  if (link.hasAttribute('data-form-nav')) return;

  link.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;

    event.preventDefault();
    scrollToPageHash(link.getAttribute('href'));
  });
});

// ---------------------------------------------------------------------------
// Mobile navigation: the same top-down mask language as the form modal.
// ---------------------------------------------------------------------------
const mobileMenuModal = document.querySelector('.mobile-menu-modal');
const mobileMenuToggle = document.querySelector('.site-header .nav-toggle');

if (mobileMenuModal && mobileMenuToggle) {
  const mobileMenuClose = mobileMenuModal.querySelector('.mobile-menu-modal__close');
  const mobileMenuLinks = Array.from(mobileMenuModal.querySelectorAll(
    '.mobile-menu-modal__top .brand, .mobile-menu-modal__links a',
  ));
  const MOBILE_MENU_TRANSITION_MS = prefersReducedMotion ? 0 : 780;
  let mobileMenuTimer = 0;
  let mobileMenuOpen = false;

  mobileMenuModal.inert = true;

  const finishMobileMenuClose = (restoreFocus) => {
    mobileMenuModal.classList.remove('is-mounted');
    mobileMenuModal.setAttribute('aria-hidden', 'true');
    mobileMenuModal.inert = true;
    if (restoreFocus) mobileMenuToggle.focus({ preventScroll: true });
  };

  const closeMobileMenu = ({ immediate = false, restoreFocus = true } = {}) => {
    if (!mobileMenuOpen && !mobileMenuModal.classList.contains('is-mounted')) return;
    clearTimeout(mobileMenuTimer);
    mobileMenuOpen = false;
    mobileMenuModal.classList.remove('is-open');
    document.body.classList.remove('mobile-menu-open');

    if (immediate || MOBILE_MENU_TRANSITION_MS === 0) {
      finishMobileMenuClose(restoreFocus);
    } else {
      mobileMenuTimer = window.setTimeout(
        () => finishMobileMenuClose(restoreFocus),
        MOBILE_MENU_TRANSITION_MS,
      );
    }
  };

  const openMobileMenu = () => {
    if (!mqMobile.matches || mobileMenuOpen) return;
    clearTimeout(mobileMenuTimer);
    mobileMenuOpen = true;
    mobileMenuModal.inert = false;
    mobileMenuModal.setAttribute('aria-hidden', 'false');
    mobileMenuModal.classList.add('is-mounted');
    document.body.classList.add('mobile-menu-open');
    requestAnimationFrame(() => {
      mobileMenuModal.classList.add('is-open');
      mobileMenuClose?.focus({ preventScroll: true });
    });
  };

  mobileMenuToggle.addEventListener('click', openMobileMenu);
  mobileMenuClose?.addEventListener('click', () => closeMobileMenu());

  mobileMenuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const opensForm = link.hasAttribute('data-open-form');
      closeMobileMenu({ immediate: opensForm, restoreFocus: false });
    });
  });

  document.addEventListener('keydown', (event) => {
    if (!mobileMenuOpen) return;
    if (event.key === 'Escape') {
      closeMobileMenu();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = Array.from(mobileMenuModal.querySelectorAll('a[href], button:not([disabled])'))
      .filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  mqMobile.addEventListener('change', (event) => {
    if (!event.matches) closeMobileMenu({ immediate: true, restoreFocus: false });
  });
}

// ---------------------------------------------------------------------------
// Project request modal: solid top-down mask, focus management and floats.
// ---------------------------------------------------------------------------
const formModal = document.querySelector('.form-modal');

if (formModal) {
  const formPanel = formModal.querySelector('.form-modal__panel');
  const formClose = formModal.querySelector('.form-modal__close');
  const requestForm = formModal.querySelector('.request-form');
  const firstFormField = requestForm?.querySelector('.request-field input, .request-field textarea');
  const requestButton = requestForm?.querySelector('.request-btn');
  const requestStatus = requestForm?.querySelector('.request-form__status');
  const formFloats = Array.from(formModal.querySelectorAll('.form-modal__media .float'))
    .map((element) => ({
      element,
      depth: Number.parseFloat(element.dataset.depth || '0'),
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    }));
  const MODAL_TRANSITION_MS = prefersReducedMotion ? 0 : 780;
  const modalPointer = { x: 0, y: 0 };
  let modalOpen = false;
  let modalClosing = false;
  let modalCloseTimer = 0;
  let modalFloatFrame = 0;
  let modalTrigger = null;
  let modalAfterClose = null;
  let lockedScrollY = 0;
  let savedBodyStyles = null;
  let usesFixedBodyLock = false;
  let requestSubmitting = false;

  formModal.inert = true;

  const modalFocusable = () => Array.from(formModal.querySelectorAll(
    'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
  )).filter((element) => element.getClientRects().length > 0);

  const lockModalScroll = () => {
    lockedScrollY = lenis?.scroll ?? window.scrollY;
    lenis?.stop();
    usesFixedBodyLock = mqMobile.matches;
    if (!usesFixedBodyLock) return;

    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const bodyPaddingRight = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;

    savedBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };

    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`;
    }
  };

  const unlockModalScroll = () => {
    const restoreFixedBody = usesFixedBodyLock && savedBodyStyles;
    if (restoreFixedBody) {
      Object.assign(document.body.style, savedBodyStyles);
      savedBodyStyles = null;
      usesFixedBodyLock = false;
      window.scrollTo(0, lockedScrollY);
    }

    if (lenis) {
      lenis.resize();
      if (restoreFixedBody) {
        lenis.scrollTo(lockedScrollY, { immediate: true, force: true });
      }
      lenis.start();
    }
    updateHeroParallax(lockedScrollY);
  };

  const renderModalFloats = () => {
    modalFloatFrame = 0;
    if (!modalOpen || !pointerFine || prefersReducedMotion || mqMobile.matches) return;

    let moving = false;
    formFloats.forEach((item) => {
      item.x += (item.targetX - item.x) * 0.1;
      item.y += (item.targetY - item.y) * 0.1;
      if (Math.abs(item.targetX - item.x) > 0.02 || Math.abs(item.targetY - item.y) > 0.02) {
        moving = true;
      }
      item.element.style.transform = `translate3d(${item.x.toFixed(2)}px, ${item.y.toFixed(2)}px, 0)`;
    });

    if (moving) {
      modalFloatFrame = requestAnimationFrame(renderModalFloats);
    }
  };

  const startModalFloats = () => {
    if (!pointerFine || prefersReducedMotion || mqMobile.matches || modalFloatFrame) return;
    modalFloatFrame = requestAnimationFrame(renderModalFloats);
  };

  const stopModalFloats = () => {
    cancelAnimationFrame(modalFloatFrame);
    modalFloatFrame = 0;
    formFloats.forEach((item) => {
      item.x = 0;
      item.y = 0;
      item.targetX = 0;
      item.targetY = 0;
      item.element.style.transform = '';
    });
  };

  const finishModalClose = () => {
    const afterClose = modalAfterClose;
    modalCloseTimer = 0;
    modalAfterClose = null;
    formModal.classList.remove('is-mounted');
    formModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('form-open');
    unlockModalScroll();
    modalClosing = false;
    if (afterClose) {
      afterClose();
    } else {
      modalTrigger?.focus({ preventScroll: true });
    }
    modalTrigger = null;
  };

  const closeFormModal = (afterClose = null) => {
    if (!modalOpen || modalClosing) return;
    modalAfterClose = typeof afterClose === 'function' ? afterClose : null;
    modalOpen = false;
    modalClosing = true;
    formModal.inert = true;
    formModal.classList.remove('is-open');
    stopModalFloats();
    clearTimeout(modalCloseTimer);

    if (MODAL_TRANSITION_MS === 0) {
      finishModalClose();
    } else {
      modalCloseTimer = window.setTimeout(finishModalClose, MODAL_TRANSITION_MS);
    }
  };

  const openFormModal = (trigger) => {
    if (modalOpen) return;
    const wasClosing = modalClosing;
    if (modalClosing) {
      clearTimeout(modalCloseTimer);
      modalCloseTimer = 0;
      modalClosing = false;
    }

    modalOpen = true;
    modalAfterClose = null;
    modalTrigger = trigger instanceof HTMLElement ? trigger : document.activeElement;
    if (!wasClosing) lockModalScroll();
    document.body.classList.add('form-open');
    formModal.inert = false;
    formModal.setAttribute('aria-hidden', 'false');
    formModal.classList.add('is-mounted');

    requestAnimationFrame(() => {
      formModal.classList.add('is-open');
      firstFormField?.focus({ preventScroll: true });
      startModalFloats();
    });
  };

  document.querySelectorAll('[data-open-form]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openFormModal(trigger);
    });
  });

  formModal.querySelectorAll('[data-form-nav]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const hash = link.getAttribute('href');
      closeFormModal(() => scrollToPageHash(hash));
    });
  });

  const setRequestButtonLabel = (text) => {
    requestButton?.querySelectorAll('.btn__line').forEach((line) => {
      line.textContent = text;
    });
  };

  const setRequestStatus = (message = '', state = '') => {
    if (!requestStatus) return;
    requestStatus.textContent = message;
    requestStatus.classList.toggle('is-success', state === 'success');
    requestStatus.classList.toggle('is-error', state === 'error');
  };

  formClose?.addEventListener('click', () => closeFormModal());
  requestForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (requestSubmitting) return;

    const strings = UI_TRANSLATIONS[activeLanguage];
    setRequestStatus();

    if (!requestForm.checkValidity()) {
      setRequestStatus(strings.formRequired, 'error');
      requestForm.reportValidity();
      return;
    }

    window.portfolioAnalytics?.track('contact_form_submit');
    const submission = new FormData(requestForm);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);
    requestSubmitting = true;
    requestForm.setAttribute('aria-busy', 'true');
    if (requestButton) requestButton.disabled = true;
    setRequestButtonLabel(strings.formSending);

    try {
      const response = await fetch(requestForm.action, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: submission,
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      const rejected = Array.isArray(result?.errors) && result.errors.length > 0;
      if (!response.ok || rejected) throw new Error('Form submission failed');

      window.portfolioAnalytics?.track('generate_lead', { form_id: 'project_request' });
      requestForm.reset();
      setRequestStatus(strings.formSuccess, 'success');
    } catch {
      window.portfolioAnalytics?.track('contact_form_error', { form_id: 'project_request' });
      setRequestStatus(strings.formError, 'error');
    } finally {
      window.clearTimeout(timeoutId);
      requestSubmitting = false;
      requestForm.removeAttribute('aria-busy');
      if (requestButton) requestButton.disabled = false;
      setRequestButtonLabel(strings.formRequest);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!modalOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeFormModal();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = modalFocusable();
    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!formModal.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  if (pointerFine && !prefersReducedMotion) {
    formModal.addEventListener('pointermove', (event) => {
      if (!modalOpen || mqMobile.matches) return;
      const rect = formPanel.getBoundingClientRect();
      modalPointer.x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      modalPointer.y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
      formFloats.forEach((item) => {
        item.targetX = modalPointer.x * item.depth * 90;
        item.targetY = modalPointer.y * item.depth * 90;
      });
      startModalFloats();
    }, { passive: true });

    formModal.addEventListener('pointerleave', () => {
      formFloats.forEach((item) => {
        item.targetX = 0;
        item.targetY = 0;
      });
      startModalFloats();
    }, { passive: true });
  }
}

// ---------------------------------------------------------------------------
// Resize: react to WIDTH changes and orientation only. Height-only resizes
// (mobile Safari address bar) never trigger re-layout or re-measure.
// ---------------------------------------------------------------------------
let viewportRefreshFrame = 0;

const applyViewport = () => {
  viewportWidth = window.innerWidth;
  stableVh = window.innerHeight;
  const canvasHeight = rendererHeight();
  renderer.setPixelRatio(rendererPixelRatio());
  renderer.setSize(viewportWidth, canvasHeight, false);
  uniforms.uResolution.value.set(viewportWidth, canvasHeight);
  uniforms.uCoverAlignY.value = mqMobile.matches ? 0.5 : 0.0;
  setScrollMode();
  measureWorks();
  lenis?.resize();
};

const scheduleViewportRefresh = () => {
  cancelAnimationFrame(viewportRefreshFrame);
  viewportRefreshFrame = requestAnimationFrame(applyViewport);
};

window.addEventListener('resize', () => {
  if (window.innerWidth === viewportWidth) return;
  scheduleViewportRefresh();
});
window.addEventListener('orientationchange', scheduleViewportRefresh);
mqMobile.addEventListener('change', scheduleViewportRefresh);

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
setScrollMode();
measureWorks();
(document.fonts?.ready || Promise.resolve()).then(() => {
  measureWorks();
  lenis?.resize();
});

// Floating panels (case offer, cookie banner) stop above the orange closing block instead of covering it.
{
  const closingBlock = document.querySelector('.contact-cta');
  const coveringSurface = closingBlock?.previousElementSibling;
  if (closingBlock && coveringSurface) {
    let footerFrame = 0;
    const updateFooterOverlap = () => {
      footerFrame = 0;
      const overlap = Math.max(0, window.innerHeight - coveringSurface.getBoundingClientRect().bottom);
      document.documentElement.style.setProperty('--footer-overlap', `${Math.round(overlap)}px`);
    };
    const scheduleFooterOverlap = () => {
      if (!footerFrame) footerFrame = requestAnimationFrame(updateFooterOverlap);
    };
    window.addEventListener('scroll', scheduleFooterOverlap, { passive: true });
    window.addEventListener('resize', scheduleFooterOverlap);
    updateFooterOverlap();
  }
}
