import Lenis from 'https://unpkg.com/lenis@1.3.4/dist/lenis.mjs';

const MOBILE_BREAKPOINT = 800;
const mqMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
const pointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

const forceThemeColor = () => {
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (!meta) return;
  meta.setAttribute('content', '#0b0b0c');
  requestAnimationFrame(() => meta.setAttribute('content', '#0b0b0b'));
};

forceThemeColor();

const CASE_PROJECTS = {
  pandawin: {
    image: 'assets/pandawin/hero.jpg',
    pageUrl: 'pandawin.html',
    visitUrl: 'https://www.behance.net/gallery/257750803/Online-Casino-Platform-UIUX-Design',
    copy: {
      en: {
        pageTitle: 'PandaWin — Online Casino Platform — MLK.STUDIO',
        caseTitle: 'PandaWin',
        caseKicker: 'UI/UX Design · iGaming · Web & Mobile',
        caseDescription: 'PandaWin is a modern online casino platform designed to combine an engaging gaming experience with clear navigation and a distinctive visual identity.',
        skills: 'UX/UI design · Design system · User flows · Responsive layouts',
        imageAlt: 'PandaWin online casino platform — hero visual',
        projectLabel: 'project',
        projectValue: 'Online Casino Platform',
        challengeIndex: '02 — the challenge',
        challengeTitle: 'The Challenge',
        challengeText: 'Casino platforms combine games, payments, rewards, and complex user flows. The challenge was to organize these features into a clear, consistent, and easy-to-use experience across desktop and mobile.',
        solutionIndex: '03 — the solution',
        solutionTitle: 'The Solution',
        solutionText: 'We developed a unified interface system with intuitive navigation, responsive layouts, streamlined user flows, and a recognizable visual language. Special attention was given to bonuses, VIP features, wallet interactions, and user engagement.',
        identityIndex: '04 — visual identity & illustrations',
        identityTitle: 'Visual Identity & Illustrations',
        identityText: 'The project was created in collaboration with an illustrator who developed custom characters, promotional artwork, and visual assets exclusively for PandaWin.',
        roleDesignLabel: 'UI/UX design',
        roleIllustrationLabel: 'illustrations',
        roleIllustrationValue: 'Custom artwork by a collaborating artist',
        scopeIndex: '05 — project scope & results',
        scopeTitle: 'Project Scope & Results',
        scopeLayouts: 'Desktop & mobile layouts',
        scopeModals: 'Modal & overlay states',
        scopeResponsiveValue: 'Responsive',
        scopeResponsive: 'Desktop & mobile experience',
        scopeCustomValue: 'Custom',
        scopeCustom: 'Illustrations & visual assets',
        finalIndex: '06 — final overview',
        finalTitle: 'Final Overview',
        finalText: 'The result is a complete, responsive design system that brings together complex casino functionality, a consistent user experience, and a unique visual identity.',
        backToWorks: 'back to selected works',
        altDesktop: 'PandaWin desktop interface',
        altMobile1: 'PandaWin mobile interface, screen one',
        altMobile2: 'PandaWin mobile interface, screen two',
        altGames: 'PandaWin game lobby and gaming features',
        altIllustration1: 'Custom PandaWin character illustration',
        altIllustration2: 'PandaWin promotional artwork',
        altModals: 'PandaWin modal windows and overlay states',
        altFinal: 'PandaWin final design overview',
      },
      uk: {
        pageTitle: 'PandaWin — Online Casino Platform — MLK.STUDIO',
        caseTitle: 'PandaWin',
        caseKicker: 'UI/UX дизайн · iGaming · Web & Mobile',
        caseDescription: 'PandaWin — сучасна платформа онлайн-казино, що поєднує захопливий ігровий досвід, зрозумілу навігацію та виразну візуальну айдентику.',
        skills: 'UX/UI дизайн · Дизайн-система · Користувацькі сценарії · Адаптивні макети',
        imageAlt: 'Платформа онлайн-казино PandaWin — головний візуал',
        projectLabel: 'проєкт',
        projectValue: 'Online Casino Platform',
        challengeIndex: '02 — завдання',
        challengeTitle: 'Завдання',
        challengeText: 'Платформи онлайн-казино поєднують ігри, платежі, винагороди та складні користувацькі сценарії. Завдання полягало в тому, щоб організувати ці функції у зрозумілий, послідовний і зручний досвід на десктопі та мобільних пристроях.',
        solutionIndex: '03 — рішення',
        solutionTitle: 'Рішення',
        solutionText: 'Ми створили єдину інтерфейсну систему з інтуїтивною навігацією, адаптивними макетами, спрощеними користувацькими сценаріями та впізнаваною візуальною мовою. Особливу увагу приділили бонусам, VIP-функціям, роботі з гаманцем і залученню користувачів.',
        identityIndex: '04 — айдентика та ілюстрації',
        identityTitle: 'Айдентика та ілюстрації',
        identityText: 'Проєкт створено у співпраці з ілюстратором, який розробив власних персонажів, промо-арт і візуальні матеріали спеціально для PandaWin.',
        roleDesignLabel: 'UI/UX дизайн',
        roleIllustrationLabel: 'ілюстрації',
        roleIllustrationValue: 'Авторські ілюстрації художника-партнера',
        scopeIndex: '05 — обсяг і результати',
        scopeTitle: 'Обсяг і результати',
        scopeLayouts: 'Макетів для десктопу та мобільних',
        scopeModals: 'Станів модальних вікон і оверлеїв',
        scopeResponsiveValue: 'Адаптивність',
        scopeResponsive: 'Досвід для десктопу та мобільних',
        scopeCustomValue: 'Авторські',
        scopeCustom: 'Ілюстрації та візуальні матеріали',
        finalIndex: '06 — підсумок',
        finalTitle: 'Підсумок',
        finalText: 'Результат — цілісна адаптивна дизайн-система, що поєднує складний функціонал казино, послідовний користувацький досвід і унікальну візуальну айдентику.',
        backToWorks: 'назад до робіт',
        altDesktop: 'Десктопний інтерфейс PandaWin',
        altMobile1: 'Мобільний інтерфейс PandaWin, екран перший',
        altMobile2: 'Мобільний інтерфейс PandaWin, екран другий',
        altGames: 'Ігрове лобі та ігрові функції PandaWin',
        altIllustration1: 'Авторська ілюстрація персонажа PandaWin',
        altIllustration2: 'Промо-арт PandaWin',
        altModals: 'Модальні вікна та оверлеї PandaWin',
        altFinal: 'Фінальний огляд дизайну PandaWin',
      },
    },
  },
  1: {
    image: 'assets/case-1.avif',
    visitUrl: 'https://www.behance.net/gallery/218243837/NFT-Collection-Landing-Page-MRBONE',
    copy: {
      en: {
        pageTitle: 'MR.BONE — MLK.STUDIO',
        caseTitle: 'MR.BONE',
        caseKicker: 'NFT collection website design & development',
        caseDescription: 'An immersive digital home for a character-led NFT collection, combining cinematic storytelling, collectible art and a bold interactive experience.',
        skills: 'Art direction · UX/UI design · 3D integration · Motion · Front-end direction',
        imageAlt: 'Full website design for MR.BONE',
      },
      uk: {
        pageTitle: 'MR.BONE — MLK.STUDIO',
        caseTitle: 'MR.BONE',
        caseKicker: 'Дизайн і розробка сайту NFT-колекції',
        caseDescription: 'Імерсивна цифрова платформа для персонажної NFT-колекції, що поєднує кінематографічний сторітелінг, колекційне мистецтво та сміливий інтерактивний досвід.',
        skills: 'Артдирекшн · UX/UI дизайн · 3D-інтеграція · Моушн · Артдирекшн розробки',
        imageAlt: 'Повний дизайн вебсайту MR.BONE',
      },
    },
  },
  2: {
    image: 'assets/case-2.avif',
    visitUrl: 'https://www.behance.net/gallery/213949479/LANDING-PAGE-Storm-traffic',
    copy: {
      en: {
        pageTitle: 'Storm Traffic — MLK.STUDIO',
        caseTitle: 'Storm Traffic',
        caseKicker: 'Affiliate platform design & development',
        caseDescription: 'A high-energy recruitment and brand platform for an international affiliate marketing team, built to communicate scale, ambition and performance.',
        skills: 'Strategy · UX/UI design · Illustration · Motion · Front-end direction',
        imageAlt: 'Full website design for Storm Traffic',
      },
      uk: {
        pageTitle: 'Storm Traffic — MLK.STUDIO',
        caseTitle: 'Storm Traffic',
        caseKicker: 'Дизайн і розробка affiliate-платформи',
        caseDescription: 'Динамічна рекрутингова та бренд-платформа для міжнародної affiliate-команди, створена для передачі масштабу, амбіцій і результативності.',
        skills: 'Стратегія · UX/UI дизайн · Ілюстрація · Моушн · Артдирекшн розробки',
        imageAlt: 'Повний дизайн вебсайту Storm Traffic',
      },
    },
  },
  3: {
    image: 'assets/case-3.avif',
    visitUrl: 'https://blackring.partners',
    copy: {
      en: {
        pageTitle: 'Black Ring — MLK.STUDIO',
        caseTitle: 'Black Ring',
        caseKicker: 'Brand website design & development',
        caseDescription: 'A dark, high-impact corporate website for an entertainment marketing company, translating its competitive focus into a confident digital identity.',
        skills: 'Brand direction · UX/UI design · 3D integration · Motion · Front-end direction',
        imageAlt: 'Full website design for Black Ring',
      },
      uk: {
        pageTitle: 'Black Ring — MLK.STUDIO',
        caseTitle: 'Black Ring',
        caseKicker: 'Дизайн і розробка брендового вебсайту',
        caseDescription: 'Темний виразний корпоративний сайт для маркетингової компанії у сфері розваг, що перетворює її конкурентний фокус на впевнену цифрову айдентику.',
        skills: 'Бренд-дирекшн · UX/UI дизайн · 3D-інтеграція · Моушн · Артдирекшн розробки',
        imageAlt: 'Повний дизайн вебсайту Black Ring',
      },
    },
  },
  4: {
    image: 'assets/case-4.avif',
    visitUrl: 'serenity/',
    copy: {
      en: {
        pageTitle: 'Serenity — MLK.STUDIO',
        caseTitle: 'Serenity',
        caseKicker: 'Consultancy website design & development',
        caseDescription: 'A clear, structured digital platform for an international consultancy, making complex registration and legal services easier to understand and access.',
        skills: 'Research · Information architecture · UX/UI design · Design system · Front-end direction',
        imageAlt: 'Full website design for Serenity',
      },
      uk: {
        pageTitle: 'Serenity — MLK.STUDIO',
        caseTitle: 'Serenity',
        caseKicker: 'Дизайн і розробка сайту консалтингової компанії',
        caseDescription: 'Зрозуміла структурована цифрова платформа для міжнародної консалтингової компанії, що спрощує сприйняття та доступ до реєстраційних і юридичних послуг.',
        skills: 'Дослідження · Інформаційна архітектура · UX/UI дизайн · Дизайн-система · Артдирекшн розробки',
        imageAlt: 'Повний дизайн вебсайту Serenity',
      },
    },
  },
  5: {
    image: 'assets/case-5.avif',
    visitUrl: 'Kowalski%20%26%20Partners/',
    copy: {
      en: {
        pageTitle: 'Kowalski & Partners — MLK.STUDIO',
        caseTitle: 'Kowalski & Partners',
        caseKicker: 'Website design & development',
        caseDescription: 'A digital platform for a full-service law firm, translating authority, clarity and trust into a modern high-performance website.',
        skills: 'Research · UX/UI design · Design system · Motion · Front-end direction',
        imageAlt: 'Full website design for Kowalski & Partners',
      },
      uk: {
        pageTitle: 'Kowalski & Partners — MLK.STUDIO',
        caseTitle: 'Kowalski & Partners',
        caseKicker: 'Дизайн і розробка вебсайту',
        caseDescription: 'Цифрова платформа для юридичної компанії повного циклу, що перетворює авторитет, ясність і довіру на сучасний високопродуктивний вебсайт.',
        skills: 'Дослідження · UX/UI дизайн · Дизайн-система · Моушн · Артдирекшн розробки',
        imageAlt: 'Повний дизайн вебсайту Kowalski & Partners',
      },
    },
  },
  6: {
    image: 'assets/azerux/case.jpg',
    visitUrl: 'azerux/',
    copy: {
      en: {
        pageTitle: 'Azerux — MLK.STUDIO',
        caseTitle: 'Azerux',
        caseKicker: 'Cybersecurity services website design',
        caseDescription: 'A dark, technology-driven website for a cybersecurity company, presenting DDoS protection and security services with clarity, depth and confidence.',
        skills: 'Art direction · UX/UI design · Information architecture · Design system',
        imageAlt: 'Full website design for Azerux',
      },
      uk: {
        pageTitle: 'Azerux — MLK.STUDIO',
        caseTitle: 'Azerux',
        caseKicker: 'Дизайн сайту сервісів кібербезпеки',
        caseDescription: 'Темний технологічний сайт для компанії з кібербезпеки, що чітко й упевнено представляє захист від DDoS-атак і безпекові сервіси.',
        skills: 'Артдирекшн · UX/UI дизайн · Інформаційна архітектура · Дизайн-система',
        imageAlt: 'Повний дизайн вебсайту Azerux',
      },
    },
  },
};

// Standalone case pages declare their project on <body>; case.html reads ?project=.
const requestedProject = document.body.dataset.caseProject
  || String(Number.parseInt(new URLSearchParams(window.location.search).get('project') || '', 10));
const activeProjectKey = Object.hasOwn(CASE_PROJECTS, requestedProject) ? requestedProject : '5';
const activeProject = CASE_PROJECTS[activeProjectKey];

const CASE_TRANSLATIONS = {
  en: {
    navServices: 'services',
    navAbout: 'about us',
    navTeam: 'team',
    navWorks: 'our works',
    navContact: 'contact us',
    navMenu: 'menu',
    back: 'back',
    toolsSkillsLabel: 'tools & skills',
    footerTitle: 'Still thinking?<br>Write to us right now!',
    offerTitle: 'Like this project?',
    offerDescription: 'Let’s build something just as strong for you.',
    startProject: 'start your project',
    visitSite: 'visit this site',
    formName: 'name',
    formEmail: 'email',
    formDetails: 'project details',
    formRequest: 'request',
    formSending: 'sending…',
    formSuccess: "Request sent. We'll get back to you soon.",
    formError: 'We could not send your request. Please try again or contact us via Telegram or WhatsApp.',
    formRequired: 'Please complete all three fields and enter a valid email address.',
    formNotice: 'Your information will be used to respond to your inquiry. Learn more in our <a href="privacy-policy/" target="_blank" rel="noopener">Privacy Policy</a>.',
    privacyPolicy: 'Privacy Policy',
    legalInformation: 'Legal Information',
  },
  uk: {
    navServices: 'послуги',
    navAbout: 'про нас',
    navTeam: 'команда',
    navWorks: 'наші роботи',
    navContact: 'зв’язатися',
    navMenu: 'меню',
    back: 'назад',
    toolsSkillsLabel: 'інструменти та навички',
    footerTitle: 'Ще думаєте?<br>Напишіть нам просто зараз!',
    offerTitle: 'Сподобався проєкт?',
    offerDescription: 'Давайте створимо для вас такий самий сильний продукт.',
    startProject: 'розпочати проєкт',
    visitSite: 'переглянути сайт',
    formName: 'ім’я',
    formEmail: 'електронна пошта',
    formDetails: 'деталі проєкту',
    formRequest: 'надіслати',
    formSending: 'надсилаємо…',
    formSuccess: 'Заявку надіслано. Ми зв’яжемося з вами найближчим часом.',
    formError: 'Не вдалося надіслати заявку. Спробуйте ще раз або напишіть нам у Telegram чи WhatsApp.',
    formRequired: 'Заповніть усі три поля та вкажіть коректну електронну адресу.',
    formNotice: 'Ваші дані будуть використані для відповіді на ваш запит. Докладніше — у нашій <a href="privacy-policy/" target="_blank" rel="noopener">Політиці конфіденційності</a>.',
    privacyPolicy: 'Політика конфіденційності',
    legalInformation: 'Юридична інформація',
  },
};

const languagePreferenceKey = 'mlk-language';
// Ukrainian by default for visitors in Ukraine (browser language or time zone), English elsewhere.
const UKRAINE_TIME_ZONES = ['Europe/Kyiv', 'Europe/Kiev', 'Europe/Uzhgorod', 'Europe/Zaporozhye', 'Europe/Simferopol'];
const defaultLanguage = () => {
  const browserLanguage = navigator.languages?.[0] || navigator.language || '';
  let timeZone = '';
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    // Older browsers: rely on the browser language only.
  }
  return browserLanguage.toLowerCase().startsWith('uk') || UKRAINE_TIME_ZONES.includes(timeZone) ? 'uk' : 'en';
};
let activeLanguage = 'en';

try {
  const storedLanguage = localStorage.getItem(languagePreferenceKey);
  if (storedLanguage === 'uk' || storedLanguage === 'en') {
    activeLanguage = storedLanguage;
  } else {
    activeLanguage = defaultLanguage();
  }
} catch {
  activeLanguage = defaultLanguage();
}

const applyCaseLanguage = () => {
  const strings = {
    ...CASE_TRANSLATIONS[activeLanguage],
    ...activeProject.copy[activeLanguage],
  };
  document.documentElement.lang = activeLanguage;
  document.title = strings.pageTitle;
  // Each project gets its own address and description for search engines.
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  canonical.href = new URL(activeProject.pageUrl || `case.html?project=${activeProjectKey}`, 'https://mlkdesign.github.io/').href;
  document.querySelector('meta[name="description"]')?.setAttribute('content', strings.caseDescription);

  document.querySelectorAll('[data-case-i18n]').forEach((element) => {
    const value = strings[element.dataset.caseI18n];
    if (value) element.textContent = value;
  });
  document.querySelectorAll('[data-case-i18n-html]').forEach((element) => {
    const value = strings[element.dataset.caseI18nHtml];
    if (value) element.innerHTML = value;
  });
  document.querySelectorAll('[data-language]').forEach((button) => {
    const selected = button.dataset.language === activeLanguage;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });

  const caseImage = document.querySelector('[data-case-image]');
  if (caseImage) {
    caseImage.src = activeProject.image;
    caseImage.alt = strings.imageAlt;
  }
  document.querySelectorAll('[data-case-i18n-alt]').forEach((image) => {
    const value = strings[image.dataset.caseI18nAlt];
    if (value) image.alt = value;
  });
  const visitLink = document.querySelector('[data-case-visit]');
  if (visitLink) visitLink.href = activeProject.visitUrl || activeProject.image;
  if (activeProject.visitUrl === null) visitLink?.remove();
};

applyCaseLanguage();

document.querySelectorAll('[data-case-fade]').forEach((element) => {
  if (prefersReducedMotion) return;
  element.classList.add('is-fade-pending');
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    element.classList.add('is-fade-visible');
    observer.disconnect();
  }, { threshold: 0.15 });
  observer.observe(element);
});

document.querySelectorAll('[data-language]').forEach((button) => {
  button.addEventListener('click', () => {
    const nextLanguage = button.dataset.language;
    if (nextLanguage === activeLanguage) return;
    try {
      localStorage.setItem(languagePreferenceKey, nextLanguage);
    } catch {
      // The language still updates for browsers with restricted storage.
    }
    window.scrollTo(0, 0);
    window.location.reload();
  });
});

const cursorDot = document.querySelector('.cursor-dot');
const cursorEllipse = document.querySelector('.cursor-ellipse');

if (pointerFine && cursorDot && cursorEllipse) {
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let cursorFrame = 0;

  const renderCursor = () => {
    current.x += (target.x - current.x) * 0.12;
    current.y += (target.y - current.y) * 0.12;
    cursorEllipse.style.left = `${current.x}px`;
    cursorEllipse.style.top = `${current.y}px`;
    const moving = Math.abs(target.x - current.x) > 0.05
      || Math.abs(target.y - current.y) > 0.05;
    cursorFrame = moving ? requestAnimationFrame(renderCursor) : 0;
  };

  window.addEventListener('pointermove', (event) => {
    target.x = event.clientX;
    target.y = event.clientY;
    cursorDot.style.left = `${event.clientX}px`;
    cursorDot.style.top = `${event.clientY}px`;
    if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);
  }, { passive: true });

  document.querySelectorAll('a, button, input, textarea, select').forEach((element) => {
    element.addEventListener('mouseenter', () => {
      if (element.matches('[data-language].is-active')) return;
      document.body.classList.add('is-interactive');
    });
    element.addEventListener('mouseleave', () => document.body.classList.remove('is-interactive'));
  });
}

let lenis = null;
let lenisFrame = 0;
let scrollIdleTimer = 0;

const markCaseScrolling = () => {
  document.body.classList.add('is-scrolling');
  clearTimeout(scrollIdleTimer);
  scrollIdleTimer = window.setTimeout(() => {
    document.body.classList.remove('is-scrolling');
    scrollIdleTimer = 0;
  }, 120);
};

const renderLenis = (time) => {
  if (!lenis) {
    lenisFrame = 0;
    return;
  }
  lenis.raf(time);
  lenisFrame = requestAnimationFrame(renderLenis);
};

const setCaseScrollMode = () => {
  const shouldSmooth = !mqMobile.matches && !prefersReducedMotion;
  if (shouldSmooth && !lenis) {
    lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 0.3,
      syncTouch: false,
    });
    lenis.on('scroll', markCaseScrolling);
    lenisFrame = requestAnimationFrame(renderLenis);
  } else if (!shouldSmooth && lenis) {
    cancelAnimationFrame(lenisFrame);
    lenisFrame = 0;
    lenis.destroy();
    lenis = null;
    clearTimeout(scrollIdleTimer);
    scrollIdleTimer = 0;
    document.body.classList.remove('is-scrolling');
  }
};

setCaseScrollMode();
mqMobile.addEventListener('change', setCaseScrollMode);

const initialTransition = document.querySelector('.page-transition');
let resolveCaseReady;
const caseReady = new Promise((resolve) => {
  resolveCaseReady = resolve;
});

const caseCopy = document.querySelector('.case-info__copy');
if (caseCopy) {
  caseCopy.classList.add('has-sequence');
  caseReady.then(() => {
    requestAnimationFrame(() => caseCopy.classList.add('is-sequence-visible'));
  });
}

const waitForImage = (image) => new Promise((resolve) => {
  if (!image) {
    resolve();
    return;
  }
  const finish = () => {
    if (typeof image.decode === 'function') image.decode().catch(() => undefined).then(resolve);
    else resolve();
  };
  if (image.complete) finish();
  else {
    image.addEventListener('load', finish, { once: true });
    image.addEventListener('error', resolve, { once: true });
  }
});

Promise.all([
  document.fonts?.ready || Promise.resolve(),
  waitForImage(document.querySelector('.case-visual img')),
]).then(() => {
  if (!initialTransition || prefersReducedMotion) {
    initialTransition?.remove();
    forceThemeColor();
    resolveCaseReady();
    return;
  }

  initialTransition.getBoundingClientRect();
  initialTransition.classList.remove('is-covered');
  initialTransition.classList.add('is-opening');
  window.setTimeout(() => {
    initialTransition.remove();
    forceThemeColor();
    resolveCaseReady();
  }, 1160);
});

const splitReveal = (element) => {
  if (!element || element.dataset.revealReady === 'true') return;
  const fragment = document.createDocumentFragment();
  const nodes = Array.from(element.childNodes);
  const letters = Math.max(1, (element.textContent || '').replace(/\s+/g, '').length);
  const stagger = Math.min(0.03, 1.2 / letters);
  let index = 0;

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      (node.textContent || '').split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/\s/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }
        const word = document.createElement('span');
        word.className = 'word';
        [...part].forEach((character) => {
          const char = document.createElement('span');
          char.className = 'char';
          char.textContent = character;
          char.style.transitionDelay = `${index * stagger}s`;
          index += 1;
          word.appendChild(char);
        });
        fragment.appendChild(word);
      });
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
      fragment.appendChild(node.cloneNode(false));
    }
  });

  element.replaceChildren(fragment);
  element.dataset.revealReady = 'true';
};

document.querySelectorAll('[data-reveal]').forEach((element) => {
  splitReveal(element);
  const reveal = () => {
    if (element.dataset.revealTriggered === 'true') return;
    element.dataset.revealTriggered = 'true';
    element.classList.add('is-revealing');
    requestAnimationFrame(() => {
      element.classList.add('is-visible');
      window.setTimeout(() => {
        element.classList.remove('is-revealing');
        element.classList.add('is-revealed');
      }, 2100);
    });
  };

  if (prefersReducedMotion) {
    reveal();
  } else if (element.dataset.revealOn === 'load') {
    caseReady.then(reveal);
  } else {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      reveal();
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(element);
  }
});

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

const navigateWithTransition = (destination) => {
  if (prefersReducedMotion) {
    window.location.assign(destination);
    return;
  }
  lenis?.stop();
  const transition = createPageTransition();
  transition.getBoundingClientRect();
  transition.classList.add('is-closing');
  window.setTimeout(() => window.location.assign(destination), 1160);
};

document.querySelectorAll('[data-page-transition], a[href^="index.html"]').forEach((link) => {
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
    navigateWithTransition(link.href);
  });
});

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
      closeMobileMenu({ immediate: link.hasAttribute('data-open-form'), restoreFocus: false });
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

const caseOffer = document.querySelector('.case-offer');
const caseOfferClose = caseOffer?.querySelector('.case-offer__close');
caseReady.then(() => {
  window.setTimeout(() => {
    caseOffer?.classList.add('is-visible');
    caseOffer?.setAttribute('aria-hidden', 'false');
  }, 3000);
});
caseOfferClose?.addEventListener('click', () => {
  caseOffer.classList.remove('is-visible');
  caseOffer.setAttribute('aria-hidden', 'true');
});

const pixelsSection = document.querySelector('.pixels');
const pixelsCanvas = pixelsSection?.querySelector('.pixels-canvas');

if (pixelsSection && pixelsCanvas) {
  const PIXEL_SIZE = 16;
  const PIXEL_GAP = 4;
  const PIXEL_STEP = PIXEL_SIZE + PIXEL_GAP;
  const PIXEL_FADE_DURATION = 1000;
  const PIXEL_LOGO_HEIGHT = 7;
  const GLYPHS = {
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

  const buildLogo = (text) => {
    const cells = new Set();
    let width = 0;
    [...text].forEach((character, characterIndex) => {
      const glyph = GLYPHS[character];
      glyph.forEach((row, rowIndex) => {
        [...row].forEach((value, colIndex) => {
          if (value === '1') cells.add(`${width + colIndex},${rowIndex}`);
        });
      });
      width += glyph[0].length + (characterIndex < text.length - 1 ? 1 : 0);
    });
    return { cells, width };
  };

  const logos = {
    desktop: buildLogo('MLK.STUDIO'),
    mobile: buildLogo('MLK'),
  };
  const context = pixelsCanvas.getContext('2d', { alpha: true });
  const accentValue = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const accentNumber = Number.parseInt(accentValue.replace('#', ''), 16);
  const accent = {
    r: Number.isFinite(accentNumber) ? (accentNumber >> 16) & 255 : 255,
    g: Number.isFinite(accentNumber) ? (accentNumber >> 8) & 255 : 90,
    b: Number.isFinite(accentNumber) ? accentNumber & 255 : 31,
  };
  const pointer = { active: false, hasPosition: false, x: 0, y: 0, index: -1 };
  let activeLogo = logos.desktop;
  let cssWidth = 0;
  let cssHeight = 0;
  let columns = 0;
  let rows = 0;
  let offsetX = 0;
  let offsetY = 0;
  let baseAlphas = new Float32Array(0);
  let heat = new Float32Array(0);
  let pixelFrame = 0;
  let previousTime = 0;

  const isLogoCell = (col, row) => {
    const logoColumns = columns - 2;
    const logoRows = rows - 2;
    const logoCol = col - 1;
    const logoRow = row - 1;
    if (
      logoColumns <= 0
      || logoRows <= 0
      || logoCol < 0
      || logoCol >= logoColumns
      || logoRow < 0
      || logoRow >= logoRows
    ) return false;
    const sourceCol = Math.min(activeLogo.width - 1, Math.floor((logoCol / logoColumns) * activeLogo.width));
    const sourceRow = Math.min(PIXEL_LOGO_HEIGHT - 1, Math.floor((logoRow / logoRows) * PIXEL_LOGO_HEIGHT));
    return activeLogo.cells.has(`${sourceCol},${sourceRow}`);
  };

  const getCellIndex = (x, y) => {
    const localX = x - offsetX;
    const localY = y - offsetY;
    if (localX < 0 || localY < 0) return -1;
    const col = Math.floor(localX / PIXEL_STEP);
    const row = Math.floor(localY / PIXEL_STEP);
    if (col < 0 || col >= columns || row < 0 || row >= rows) return -1;
    if (localX - col * PIXEL_STEP >= PIXEL_SIZE || localY - row * PIXEL_STEP >= PIXEL_SIZE) return -1;
    return row * columns + col;
  };

  const drawPixels = (withHeat = false) => {
    if (!context) return;
    context.clearRect(0, 0, cssWidth, cssHeight);
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        const index = row * columns + col;
        const factor = withHeat ? heat[index] : 0;
        const baseAlpha = baseAlphas[index];
        context.fillStyle = factor > 0
          ? `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${factor})`
          : `rgba(255, 255, 255, ${baseAlpha})`;
        context.fillRect(
          offsetX + col * PIXEL_STEP,
          offsetY + row * PIXEL_STEP,
          PIXEL_SIZE,
          PIXEL_SIZE,
        );
      }
    }
  };

  const heatPath = (startX, startY, endX, endY) => {
    const samples = Math.max(1, Math.ceil(Math.hypot(endX - startX, endY - startY) / 2));
    for (let sample = 0; sample <= samples; sample += 1) {
      const progress = sample / samples;
      const index = getCellIndex(
        startX + (endX - startX) * progress,
        startY + (endY - startY) * progress,
      );
      if (index >= 0) heat[index] = 1;
    }
  };

  const renderHeat = (time) => {
    pixelFrame = 0;
    const cooling = (previousTime ? Math.max(0, time - previousTime) : 0) / PIXEL_FADE_DURATION;
    previousTime = time;
    let maxHeat = 0;
    for (let index = 0; index < heat.length; index += 1) {
      if (pointer.active && index === pointer.index) heat[index] = 1;
      else if (heat[index] > 0) heat[index] = Math.max(0, heat[index] - cooling);
      maxHeat = Math.max(maxHeat, heat[index]);
    }
    drawPixels(true);
    if (pointer.active || maxHeat > 0.001) pixelFrame = requestAnimationFrame(renderHeat);
    else {
      heat.fill(0);
      previousTime = 0;
      drawPixels();
    }
  };

  const startHeat = () => {
    if (!pixelFrame) {
      previousTime = 0;
      pixelFrame = requestAnimationFrame(renderHeat);
    }
  };

  const resizePixels = () => {
    const rect = pixelsCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cssWidth = rect.width;
    cssHeight = rect.height;
    pixelsCanvas.width = Math.max(1, Math.round(cssWidth * dpr));
    pixelsCanvas.height = Math.max(1, Math.round(cssHeight * dpr));
    context?.setTransform(dpr, 0, 0, dpr, 0, 0);
    columns = Math.max(0, Math.floor((cssWidth + PIXEL_GAP) / PIXEL_STEP));
    rows = Math.max(0, Math.floor((cssHeight + PIXEL_GAP) / PIXEL_STEP));
    activeLogo = mqMobile.matches ? logos.mobile : logos.desktop;
    const gridWidth = columns ? columns * PIXEL_SIZE + (columns - 1) * PIXEL_GAP : 0;
    const gridHeight = rows ? rows * PIXEL_SIZE + (rows - 1) * PIXEL_GAP : 0;
    offsetX = (cssWidth - gridWidth) / 2;
    offsetY = (cssHeight - gridHeight) / 2;
    baseAlphas = new Float32Array(columns * rows);
    heat = new Float32Array(columns * rows);
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        baseAlphas[row * columns + col] = isLogoCell(col, row) ? 0.1 : 0;
      }
    }
    pointer.index = getCellIndex(pointer.x, pointer.y);
    drawPixels(pointer.active);
  };

  if (pointerFine && !prefersReducedMotion) {
    const updatePointer = (event) => {
      const nextX = event.offsetX;
      const nextY = event.offsetY;
      if (pointer.hasPosition) heatPath(pointer.x, pointer.y, nextX, nextY);
      pointer.x = nextX;
      pointer.y = nextY;
      pointer.index = getCellIndex(nextX, nextY);
      if (pointer.index >= 0) heat[pointer.index] = 1;
      pointer.hasPosition = true;
    };
    pixelsCanvas.addEventListener('pointerenter', (event) => {
      pointer.active = true;
      pointer.hasPosition = false;
      updatePointer(event);
      startHeat();
    }, { passive: true });
    pixelsCanvas.addEventListener('pointermove', updatePointer, { passive: true });
    pixelsCanvas.addEventListener('pointerleave', () => {
      pointer.active = false;
      pointer.hasPosition = false;
      pointer.index = -1;
      startHeat();
    }, { passive: true });
  }

  new ResizeObserver(resizePixels).observe(pixelsSection);
  resizePixels();
}

const formModal = document.querySelector('.form-modal');

if (formModal) {
  const closeButton = formModal.querySelector('.form-modal__close');
  const requestForm = formModal.querySelector('.request-form');
  const firstField = requestForm?.querySelector('input, textarea');
  const transitionDuration = prefersReducedMotion ? 0 : 780;
  let open = false;
  let closeTimer = 0;
  let trigger = null;
  let lockedScrollY = 0;
  let usesFixedBodyLock = false;

  formModal.inert = true;

  const unlockScroll = () => {
    const restoreFixedBody = usesFixedBodyLock;
    if (restoreFixedBody) {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, lockedScrollY);
      usesFixedBodyLock = false;
    }
    if (lenis) {
      lenis.resize();
      if (restoreFixedBody) {
        lenis.scrollTo(lockedScrollY, { immediate: true, force: true });
      }
      lenis.start();
    }
  };

  const finishClose = () => {
    formModal.classList.remove('is-mounted');
    formModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('form-open');
    unlockScroll();
    trigger?.focus({ preventScroll: true });
    trigger = null;
  };

  const closeModal = () => {
    if (!open) return;
    open = false;
    formModal.inert = true;
    formModal.classList.remove('is-open');
    clearTimeout(closeTimer);
    if (transitionDuration) closeTimer = window.setTimeout(finishClose, transitionDuration);
    else finishClose();
  };

  const openModal = (nextTrigger) => {
    if (open) return;
    clearTimeout(closeTimer);
    open = true;
    trigger = nextTrigger;
    lockedScrollY = lenis?.scroll ?? window.scrollY;
    lenis?.stop();
    usesFixedBodyLock = mqMobile.matches;
    if (usesFixedBodyLock) {
      document.body.style.position = 'fixed';
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    }
    document.body.classList.add('form-open');
    formModal.inert = false;
    formModal.setAttribute('aria-hidden', 'false');
    formModal.classList.add('is-mounted');
    requestAnimationFrame(() => {
      formModal.classList.add('is-open');
      firstField?.focus({ preventScroll: true });
    });
  };

  document.querySelectorAll('[data-open-form]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(button);
    });
  });
  closeButton?.addEventListener('click', closeModal);
  const requestButton = requestForm?.querySelector('.request-btn');
  const requestStatus = requestForm?.querySelector('.request-form__status');
  let requestSubmitting = false;

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

  // Same Formspree endpoint and flow as the home page form.
  requestForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (requestSubmitting) return;

    const strings = CASE_TRANSLATIONS[activeLanguage];
    setRequestStatus();

    if (!requestForm.checkValidity()) {
      setRequestStatus(strings.formRequired, 'error');
      requestForm.reportValidity();
      return;
    }

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
        body: new FormData(requestForm),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      const rejected = Array.isArray(result?.errors) && result.errors.length > 0;
      if (!response.ok || rejected) throw new Error('Form submission failed');

      requestForm.reset();
      setRequestStatus(strings.formSuccess, 'success');
    } catch {
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
    if (open && event.key === 'Escape') closeModal();
  });
}

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
