// Loading screen, menu, smooth scroll, parallax, text effects, the TV screen and the photo band. No dependencies.
const root = document.documentElement;
const header = document.querySelector('.header');
const burger = document.querySelector('.burger');
const stage = document.querySelector('.stage');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = window.matchMedia('(min-width: 1024px)');
const finePointer = window.matchMedia('(pointer: fine)');

// Loading screen ------------------------------------------------------------------
// The icons take turns until the page, its fonts and at least 1.4 s have passed (7 s at most).
// Then the screen lifts away, the landing rises from under it and the hero starts playing.
const loader = document.querySelector('.loader');
const readyCallbacks = [];
const onReady = (callback) => (root.classList.contains('is-ready') ? callback() : readyCallbacks.push(callback));
if (!loader || root.classList.contains('is-loaded')) {
  loader?.remove();
  root.classList.add('is-loaded', 'is-ready');
} else {
  if ('scrollRestoration' in history && !location.hash) {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }
  const icons = [...loader.querySelectorAll('svg')];
  let current = 0;
  icons[0].classList.add('is-on');
  const timer = setInterval(() => {
    icons[current].classList.remove('is-on');
    current = (current + 1) % icons.length;
    icons[current].classList.add('is-on');
  }, 80);
  const finish = () => {
    clearInterval(timer);
    loader.remove();
  };
  const loaded = new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });
  const minimum = new Promise((resolve) => setTimeout(resolve, Math.max(0, 1400 - performance.now())));
  const ceiling = new Promise((resolve) => setTimeout(resolve, 7000));
  Promise.race([Promise.all([loaded, minimum, document.fonts?.ready]), ceiling]).then(() => {
    root.classList.add('is-loaded');
    if (reduceMotion) finish();
    else setTimeout(finish, 1200);
    setTimeout(() => {
      root.classList.add('is-ready');
      readyCallbacks.splice(0).forEach((callback) => callback());
    }, reduceMotion ? 0 : 250);
  });
}

burger?.addEventListener('click', () => {
  const open = header.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});
header?.querySelectorAll('.header__nav a').forEach((link) => link.addEventListener('click', () => {
  header.classList.remove('is-open');
  burger?.setAttribute('aria-expanded', 'false');
}));

// Socials open to the exact width of their icon and name, so the square widens at an even pace.
const socials = [...document.querySelectorAll('.socials a')];
const measureSocials = () => socials.forEach((link) => link.style.setProperty('--open', `${link.scrollWidth}px`));
measureSocials();
document.fonts?.ready.then(measureSocials);
window.addEventListener('resize', measureSocials);

// One pixel of the 1920 frame, as the stylesheet computes it.
const unit = () => (desktop.matches ? Math.min(1, window.innerWidth / 1920) : 1);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (from, to, amount) => from + (to - from) * amount;

// Smooth scroll ---------------------------------------------------------------
// The wheel moves a target at 0.7 of its usual distance and the page eases towards it.
// Touch, keyboard and the scrollbar keep the browser's own scrolling.
const scroller = { target: window.scrollY, current: window.scrollY, active: false };
const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
const scrollStep = () => {
  scroller.current = lerp(scroller.current, scroller.target, 0.1);
  if (Math.abs(scroller.target - scroller.current) < 0.5) scroller.current = scroller.target;
  window.scrollTo({ top: scroller.current, behavior: 'instant' });
  scroller.active = scroller.current !== scroller.target;
  if (scroller.active) requestAnimationFrame(scrollStep);
};
const scrollToY = (y) => {
  scroller.target = clamp(y, 0, maxScroll());
  if (!scroller.active) {
    scroller.current = window.scrollY;
    scroller.active = true;
    requestAnimationFrame(scrollStep);
  }
};
if (!reduceMotion) {
  window.addEventListener('wheel', (event) => {
    if (!root.classList.contains('is-loaded')) { event.preventDefault(); return; }
    if (!finePointer.matches || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    event.preventDefault();
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    scrollToY((scroller.active ? scroller.target : window.scrollY) + event.deltaY * scale * 0.7);
  }, { passive: false });
}
window.addEventListener('scroll', () => {
  if (!scroller.active) scroller.target = scroller.current = window.scrollY;
}, { passive: true });
// The header logo reloads the page and starts it again from the top, loading screen included.
document.querySelector('.header__logo')?.addEventListener('click', (event) => {
  event.preventDefault();
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  window.location.replace(window.location.pathname + window.location.search);
});
document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => {
  const target = document.querySelector(link.getAttribute('href'));
  if (!target) return;
  event.preventDefault();
  const y = link.getAttribute('href') === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - 40;
  if (reduceMotion) window.scrollTo(0, y);
  else scrollToY(y);
}));

// Parallax --------------------------------------------------------------------
// Scroll: People and everything below it slide up over the poster; the bone on the rope, the boy in
// the footer and the moons drift. Cursor: the big moon moves most, the small moon less, the blue bone least;
// the bone on the rope follows it too.
const boneRope = document.querySelector('.bone-rope');
const capGuy = document.querySelector('.cap-guy');
const depthItems = [...document.querySelectorAll('[data-depth]')];
const pointer = { x: 0, y: 0, cx: 0, cy: 0 };
let ticking = false;

const stageTop = () => stage.getBoundingClientRect().top + window.scrollY;
const render = () => {
  ticking = false;
  if (!desktop.matches || reduceMotion) {
    stage.style.removeProperty('--lift');
    [boneRope, capGuy, ...depthItems].forEach((element) => element && (element.style.transform = ''));
    return;
  }
  const u = unit();
  const top = stageTop();
  const view = window.innerHeight;
  const y = window.scrollY;

  // People: 260 frame px lower when it enters the screen, in its Figma place after one screen of scrolling.
  const peopleTop = top + 2192 * u;
  const progress = clamp((y + view - peopleTop) / view, 0, 1);
  stage.style.setProperty('--lift', `${(260 * u * (1 - progress)).toFixed(1)}px`);

  if (capGuy) capGuy.style.transform = `translate3d(0, ${Math.min(-0.3 * (y - maxScroll()), 400 * u).toFixed(1)}px, 0)`;

  pointer.cx = lerp(pointer.cx, pointer.x, 0.08);
  pointer.cy = lerp(pointer.cy, pointer.y, 0.08);
  // The bone on the rope drifts on scroll and follows the cursor a little.
  if (boneRope) {
    const ropeDrift = clamp(-0.18 * (y + view / 2 - (top + 5845 * u)), -300 * u, 300 * u);
    boneRope.style.transform = `translate3d(${(pointer.cx * 18 * u).toFixed(2)}px, ${(ropeDrift + pointer.cy * 18 * u).toFixed(2)}px, 0)`;
  }
  depthItems.forEach((element) => {
    const depth = Number(element.dataset.depth) * u;
    const drift = clamp(Number(element.dataset.scroll || 0) * (y + view / 2 - (top + Number(element.dataset.center || 0) * u)), -200 * u, 200 * u);
    element.style.transform = `translate3d(${(pointer.cx * depth).toFixed(2)}px, ${(pointer.cy * depth + drift).toFixed(2)}px, 0)`;
  });
  if (Math.abs(pointer.cx - pointer.x) > 0.001 || Math.abs(pointer.cy - pointer.y) > 0.001) requestRender();
};
const requestRender = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(render);
};
window.addEventListener('scroll', requestRender, { passive: true });
window.addEventListener('resize', requestRender);
desktop.addEventListener?.('change', requestRender);
window.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse') return;
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  requestRender();
}, { passive: true });
requestRender();

// Cursor light: follows the mouse with a little lag and fades out when the mouse leaves the window.
const cursorLight = document.querySelector('.cursor-light');
if (cursorLight && !reduceMotion) {
  const light = { x: 0, y: 0, cx: 0, cy: 0, running: false };
  const follow = () => {
    light.cx = lerp(light.cx, light.x, 0.18);
    light.cy = lerp(light.cy, light.y, 0.18);
    cursorLight.style.transform = `translate3d(${light.cx.toFixed(1)}px, ${light.cy.toFixed(1)}px, 0)`;
    light.running = Math.abs(light.cx - light.x) > 0.3 || Math.abs(light.cy - light.y) > 0.3;
    if (light.running) requestAnimationFrame(follow);
  };
  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    light.x = event.clientX;
    light.y = event.clientY;
    if (!cursorLight.classList.contains('is-on')) {
      light.cx = light.x;
      light.cy = light.y;
      cursorLight.classList.add('is-on');
    }
    if (!light.running) {
      light.running = true;
      requestAnimationFrame(follow);
    }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => cursorLight.classList.remove('is-on'));
}

// Text effects ------------------------------------------------------------------
// Headings shuffle their letters for a moment before settling.
// Narrow glyphs only, and no wrapping while it runs, so a line never spills onto the next one.
const GLYPHS = 'ABCDEFGHJKLNOPRSTUVXYZ0123456789';
const textNodes = (element) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) if (walker.currentNode.data.trim()) nodes.push(walker.currentNode);
  return nodes;
};
// A new shuffle on the same element replaces the running one and still settles on the real text.
const shuffles = new WeakMap();
const shuffle = (element, duration = 650) => {
  if (!element) return;
  if (!shuffles.has(element)) {
    const nodes = textNodes(element);
    shuffles.set(element, { nodes, originals: nodes.map((node) => node.data), run: 0 });
  }
  const state = shuffles.get(element);
  const { nodes, originals } = state;
  const run = ++state.run;
  const total = originals.reduce((sum, text) => sum + text.length, 0);
  const start = performance.now();
  element.style.whiteSpace = 'nowrap';
  const frame = (now) => {
    if (run !== state.run) return;
    const t = (now - start) / duration;
    let index = 0;
    nodes.forEach((node, n) => {
      node.data = [...originals[n]].map((char) => {
        const settleAt = 0.25 + (index++ / total) * 0.75;
        if (t >= settleAt || char === ' ' || char === '\n') return char;
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }).join('');
    });
    if (t < 1) requestAnimationFrame(frame);
    else {
      nodes.forEach((node, n) => { node.data = originals[n]; });
      element.style.whiteSpace = '';
    }
  };
  requestAnimationFrame(frame);
};

// Big numbers count up from zero, keeping their decimals.
const countUp = (element) => {
  const to = Number(element.dataset.to);
  const decimals = (element.dataset.to.split('.')[1] || '').length;
  const start = performance.now();
  const frame = (now) => {
    const t = clamp((now - start) / 1600, 0, 1);
    element.textContent = (to * (1 - (1 - t) ** 3)).toFixed(decimals);
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};

// Scroll reveal: blocks fade up, headings shuffle, scripts are written in, numbers count.
const counts = [...document.querySelectorAll('.count')];
if (!reduceMotion && 'IntersectionObserver' in window) {
  counts.forEach((count) => { count.textContent = (0).toFixed((count.dataset.to.split('.')[1] || '').length); });
  const onEnter = (element) => {
    element.classList.add('is-in');
    if (element.matches('h1, h2, h3, .title-md') && !element.matches('.culture')) shuffle(element);
    if (element.matches('.script')) element.classList.add('is-written');
    if (element.matches('.stats')) element.querySelectorAll('.count').forEach(countUp);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      onEnter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.poster, .title-xl, .title-md, .card, .sea-card, .stats, .links, .lead, .lead + .copy, .join-title, .tv')
    .forEach((element) => element.classList.add('reveal'));
  // The hero plays, and the rest starts revealing, once the loading screen lifts.
  onReady(() => {
    document.querySelectorAll('.reveal, .script:not(.hero-script)').forEach((element) => observer.observe(element));
    shuffle(document.querySelector('.hero-title'));
    setTimeout(() => document.querySelector('.hero-script')?.classList.add('is-written'), 350);
  });
} else {
  document.querySelectorAll('.script').forEach((element) => element.classList.add('is-written'));
}

// Buttons: the logo turns (CSS) and the label shuffles on the way in and on the way out.
document.querySelectorAll('.cta').forEach((button) => {
  const label = button.querySelector('span');
  if (reduceMotion || !label) return;
  button.addEventListener('pointerenter', () => shuffle(label, 420));
  button.addEventListener('pointerleave', () => shuffle(label, 420));
});

// Footer icons -------------------------------------------------------------------
// Pointing at the footer sets each icon cycling through the four, each at its own pace;
// leaving lets them run on and settle back on their own icon one after another, left to right.
const footer = document.querySelector('.footer');
const slots = [...document.querySelectorAll('.footer__slot')].map((slot, index) => ({
  index,
  icons: [...slot.children],
  shown: index,
  timer: 0,
  settle: 0,
}));
const showIcon = (slot, icon) => {
  slot.icons[slot.shown].classList.remove('is-on');
  slot.shown = icon;
  slot.icons[icon].classList.add('is-on');
};
if (footer && slots.length && !reduceMotion) {
  footer.addEventListener('pointerenter', () => {
    slots.forEach((slot) => {
      clearTimeout(slot.settle);
      if (slot.timer) return;
      const pace = 70 + slot.index * 17;
      const step = () => {
        showIcon(slot, (slot.shown + 1) % slot.icons.length);
        slot.timer = setTimeout(step, pace);
      };
      slot.timer = setTimeout(step, slot.index * 35);
    });
  });
  footer.addEventListener('pointerleave', () => {
    slots.forEach((slot) => {
      clearTimeout(slot.settle);
      slot.settle = setTimeout(() => {
        clearTimeout(slot.timer);
        slot.timer = 0;
        showIcon(slot, slot.index);
      }, 200 + slot.index * 160);
    });
  });
}

// Photo band ------------------------------------------------------------------
// Each row holds its photos twice and slides by half its width, so it loops without a seam.
// Pointing at a photo frames it (CSS) and slows the row to a stop; leaving lets it pick up speed again.
const rows = [...document.querySelectorAll('.strip__row')].map((row) => {
  [...row.querySelectorAll(':scope > img')].forEach((photo) => {
    const cell = document.createElement('span');
    cell.className = 'strip__cell';
    photo.replaceWith(cell);
    cell.append(photo);
  });
  [...row.children].forEach((child) => row.append(child.cloneNode(true)));
  const band = { row, offset: 0, speed: 1, target: 1, visible: false };
  row.parentElement.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') band.target = 0; });
  row.parentElement.addEventListener('pointerleave', () => { band.target = 1; });
  return band;
});
if (rows.length && !reduceMotion) {
  let lastTime = 0;
  let moving = false;
  const step = (now) => {
    const dt = Math.min(now - lastTime, 50);
    lastTime = now;
    rows.forEach((band) => {
      band.speed = lerp(band.speed, band.target, 1 - 0.93 ** (dt / 16.7));
      // The full loop (half the row) takes 60 s, as the CSS fallback does.
      const half = band.row.scrollWidth / 2;
      band.offset = (band.offset + (band.speed * half * dt) / 60000) % half;
      band.row.style.transform = `translate3d(${(-band.offset).toFixed(2)}px, 0, 0)`;
    });
    moving = rows.some((band) => band.visible);
    if (moving) requestAnimationFrame(step);
  };
  const observer = 'IntersectionObserver' in window && new IntersectionObserver((entries) => {
    entries.forEach((entry) => { rows.find((band) => band.row.parentElement === entry.target).visible = entry.isIntersecting; });
    if (!moving && rows.some((band) => band.visible)) {
      moving = true;
      lastTime = performance.now();
      requestAnimationFrame(step);
    }
  });
  rows.forEach((band) => {
    band.row.style.animation = 'none';
    if (observer) observer.observe(band.row.parentElement);
    else band.visible = true;
  });
  if (!observer) { moving = true; lastTime = performance.now(); requestAnimationFrame(step); }
}

// TV screen ------------------------------------------------------------------
// The MR.BONE skull is drawn in symbols that keep changing, like a terminal in The Matrix.
const screen = document.querySelector('.tv__screen');
if (screen) {
  const RAMP = ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';
  const context = screen.getContext('2d');
  let cols = 0;
  let rows = 0;
  let cell = { w: 0, h: 0 };
  let density = [];
  let chars = [];
  let reveal = 0;
  let running = false;
  let last = 0;
  let cycleStart = 0;
  const logo = new Image();
  logo.src = 'assets/tv-logo.svg';

  const randomChar = (level) => {
    const spread = 9;
    const center = Math.round(level * (RAMP.length - 1));
    const index = clamp(center + Math.round((Math.random() - 0.5) * spread), 1, RAMP.length - 1);
    return RAMP[index];
  };

  // Samples the logo into a grid of brightness values; the skull is round, so it is
  // drawn narrower in columns to make up for the tall character cells.
  const layout = () => {
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = screen.getBoundingClientRect();
    if (!width || !height) return false;
    screen.width = Math.round(width * ratio);
    screen.height = Math.round(height * ratio);
    cols = 64;
    cell.w = screen.width / cols;
    cell.h = cell.w * 1.75;
    rows = Math.floor(screen.height / cell.h);
    cell.h = screen.height / rows;
    const sample = document.createElement('canvas');
    sample.width = cols;
    sample.height = rows;
    const sampleContext = sample.getContext('2d', { willReadFrequently: true });
    const logoRows = rows * 0.9;
    const logoCols = (logoRows * cell.h) / cell.w;
    sampleContext.drawImage(logo, (cols - logoCols) / 2, (rows - logoRows) / 2, logoCols, logoRows);
    const pixels = sampleContext.getImageData(0, 0, cols, rows).data;
    density = Array.from({ length: cols * rows }, (_, i) => pixels[i * 4 + 3] / 255);
    chars = density.map((level) => randomChar(level));
    context.font = `${Math.round(cell.h * 0.92)}px "SFMono-Regular", Menlo, Consolas, monospace`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    return true;
  };

  const draw = (now) => {
    if (!running) return;
    requestAnimationFrame(draw);
    if (now - last < 28) return;
    last = now;
    // Every 9 s the logo is written again, top to bottom.
    const elapsed = (now - cycleStart) / 1000;
    if (elapsed > 9) cycleStart = now;
    reveal = clamp(elapsed / 1.8, 0, 1);
    context.clearRect(0, 0, screen.width, screen.height);
    const frontRow = reveal * (rows + 6);
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const i = r * cols + c;
        const level = density[i];
        const ahead = frontRow - r;
        if (ahead < 0) continue;
        let alpha;
        let char;
        if (ahead < 3) {
          // The writing front: bright random symbols.
          char = RAMP[1 + Math.floor(Math.random() * (RAMP.length - 1))];
          alpha = level > 0.05 ? 1 : 0.35;
        } else if (level > 0.05) {
          if (Math.random() < 0.16) chars[i] = randomChar(level);
          char = chars[i];
          alpha = 0.45 + level * 0.55;
        } else {
          // Faint background rain.
          if (Math.random() > 0.035) continue;
          char = RAMP[1 + Math.floor(Math.random() * 20)];
          alpha = 0.18;
        }
        context.fillStyle = `rgba(234, 230, 216, ${alpha})`;
        context.fillText(char, (c + 0.5) * cell.w, (r + 0.5) * cell.h);
      }
    }
  };

  const start = () => {
    if (running || !logo.complete || !layout()) return;
    running = true;
    cycleStart = performance.now();
    requestAnimationFrame(draw);
  };
  const stop = () => { running = false; };
  logo.addEventListener('load', () => { if (screen.dataset.visible === 'true') start(); });
  window.addEventListener('resize', () => { if (running) layout(); });
  if (reduceMotion) {
    logo.addEventListener('load', () => {
      if (!layout()) return;
      chars.forEach((char, i) => {
        if (density[i] <= 0.05) return;
        context.fillStyle = `rgba(234, 230, 216, ${0.45 + density[i] * 0.55})`;
        context.fillText(char, ((i % cols) + 0.5) * cell.w, (Math.floor(i / cols) + 0.5) * cell.h);
      });
    });
  } else if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      screen.dataset.visible = String(entry.isIntersecting);
      if (entry.isIntersecting) start();
      else stop();
    }).observe(screen);
  }
}
