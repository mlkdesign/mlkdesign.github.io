// Loading, menu, parallax, the Core Focus rows and slider, the logo band and the reveal. No dependencies.
const root = document.documentElement;
const header = document.querySelector('.header');
const burger = document.querySelector('.burger');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = window.matchMedia('(min-width: 1024px)');
const finePointer = window.matchMedia('(pointer: fine)');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (from, to, amount) => from + (to - from) * amount;
// One pixel of the 1440 frame, as the stylesheet computes it.
const unit = () => (desktop.matches ? Math.min(1, window.innerWidth / 1440) : 1);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Menu -----------------------------------------------------------------------
burger?.addEventListener('click', () => {
  const open = header.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});
header?.querySelectorAll('.header__nav a, .menu a[href^="#"]').forEach((link) => link.addEventListener('click', () => {
  header.classList.remove('is-open');
  burger?.setAttribute('aria-expanded', 'false');
}));

// The menu marks the section on screen.
const navLinks = [...document.querySelectorAll('.header__nav a')];
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) spy.observe(section);
  });
  // Above the first linked section nothing is marked.
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) navLinks.forEach((link) => link.classList.remove('is-active'));
  }, { rootMargin: '-45% 0px -50% 0px' }).observe(document.querySelector('.hero'));
}

// Loading ----------------------------------------------------------------------------
// The hero button grows into a progress bar while the page loads (to the width of the content on
// desktop, to its own width on phones). At 100% the logo fades out with the loading screen, the bar
// shrinks back into the button and the hero plays in with the header.
const bootLogo = document.querySelector('.boot-logo');
const heroButton = document.querySelector('.btn--hero');
const bar = heroButton?.querySelector('.btn__bar');
const percent = heroButton?.querySelector('.btn__percent');
const readyCallbacks = [];
const onReady = (callback) => (root.classList.contains('is-ready') ? callback() : readyCallbacks.push(callback));
const setReady = () => {
  root.classList.remove('is-booting');
  root.classList.add('is-ready');
  readyCallbacks.splice(0).forEach((callback) => callback());
};

const boot = async () => {
  if (!root.classList.contains('is-booting') || reduceMotion || !bar) {
    bootLogo?.remove();
    setReady();
    return;
  }
  if ('scrollRestoration' in history && !location.hash) {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }
  // Progress follows the images and fonts above the fold, and takes at least 2.4 s.
  const images = [...document.images].filter((image) => image.loading !== 'lazy');
  const total = images.length + 1;
  let loaded = images.filter((image) => image.complete).length;
  images.forEach((image) => {
    if (!image.complete) {
      const done = () => { loaded += 1; };
      image.addEventListener('load', done, { once: true });
      image.addEventListener('error', done, { once: true });
    }
  });
  document.fonts?.ready.then(() => { loaded += 1; });
  if (!document.fonts) loaded += 1;
  const fullWidth = () => (desktop.matches ? 1264 * unit() : heroButton.offsetWidth);
  const start = performance.now();
  let shown = 0;
  let last = start;
  await new Promise((resolve) => {
    const tick = (now) => {
      const timeCap = clamp((now - start) / 2400, 0, 1);
      const target = Math.min(loaded / total, timeCap);
      // Eases towards the target at the same pace whatever the frame rate.
      shown = Math.max(shown, lerp(shown, target, 1 - 0.9 ** ((now - last) / 16.7)));
      last = now;
      if (target >= 1 && shown > 0.995) shown = 1;
      bar.style.width = `${Math.max(fullWidth() * shown, 4)}px`;
      percent.textContent = `${Math.round(shown * 100)}%`;
      if (shown >= 1 || now - start > 8000) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  bar.style.width = `${fullWidth()}px`;
  percent.textContent = '100%';
  await wait(250);

  // The logo leaves with the loading screen; the bar shrinks back into the button at the same time.
  bootLogo.classList.add('is-leaving');
  root.classList.remove('is-booting');
  bar.style.removeProperty('width');
  await wait(500);
  setReady();
  await wait(600);
  bootLogo.remove();
};

// Parallax -------------------------------------------------------------------------
// Cursor: dots, glows, rings and stickers each move by their data-depth (frame px at the screen edge).
// Scroll: rings, the about orbit and the collaboration stickers drift by their data-speed.
// data-bound keeps a layer inside an ellipse ("half-axis along, half-axis across, angle"): the sphere in its ring.
const layers = [...document.querySelectorAll('[data-depth], [data-speed]')].map((element) => {
  const [along, across, angle] = (element.dataset.bound || '').split(' ').map(Number);
  return {
    element,
    depth: Number(element.dataset.depth || 0),
    speed: Number(element.dataset.speed || 0),
    bound: element.dataset.bound ? { along, across, cos: Math.cos((angle * Math.PI) / 180), sin: Math.sin((angle * Math.PI) / 180) } : null,
    center: 0,
  };
});
const keepInside = (x, y, { along, across, cos, sin }, u) => {
  const a = x * cos + y * sin;
  const b = -x * sin + y * cos;
  const reach = Math.hypot(a / (along * u), b / (across * u));
  return reach > 1 ? [x / reach, y / reach] : [x, y];
};
const pointer = { x: 0, y: 0, cx: 0, cy: 0 };
let ticking = false;

const measure = () => {
  layers.forEach((layer) => {
    layer.element.style.translate = 'none';
    const box = layer.element.getBoundingClientRect();
    layer.center = box.top + window.scrollY + box.height / 2;
  });
  requestRender();
};
const render = () => {
  ticking = false;
  markRow();
  if (!desktop.matches || reduceMotion) {
    layers.forEach((layer) => { layer.element.style.translate = ''; });
    return;
  }
  const u = unit();
  const middle = window.scrollY + window.innerHeight / 2;
  pointer.cx = lerp(pointer.cx, pointer.x, 0.08);
  pointer.cy = lerp(pointer.cy, pointer.y, 0.08);
  layers.forEach(({ element, depth, speed, bound, center }) => {
    const drift = speed ? clamp(speed * (center - middle), -240 * u, 240 * u) : 0;
    let x = pointer.cx * depth * u;
    let y = pointer.cy * depth * u + drift;
    if (bound) [x, y] = keepInside(x, y, bound, u);
    element.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
  });
  if (Math.abs(pointer.cx - pointer.x) > 0.001 || Math.abs(pointer.cy - pointer.y) > 0.001) requestRender();
};
function requestRender() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(render);
}
window.addEventListener('scroll', requestRender, { passive: true });
window.addEventListener('resize', measure);
desktop.addEventListener?.('change', measure);
window.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse' || !finePointer.matches) return;
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  requestRender();
}, { passive: true });
window.addEventListener('load', measure);
measure();

// Core Focus -------------------------------------------------------------------
// Desktop: the row passing the middle of the screen lights up as the page scrolls. Phones: the rows are a slider with arrows.
const rows = [...document.querySelectorAll('.row')];
function markRow() {
  if (!desktop.matches || !rows.length) return;
  const line = window.innerHeight * 0.5;
  let active = rows[0];
  rows.forEach((row) => { if (row.getBoundingClientRect().top <= line) active = row; });
  rows.forEach((row) => row.classList.toggle('is-active', row === active));
}
const list = document.querySelector('.focus__list');
const slide = (direction) => {
  const step = (rows[0]?.offsetWidth || 300) + 8;
  list.scrollBy({ left: direction * step, behavior: reduceMotion ? 'auto' : 'smooth' });
};
document.querySelector('.focus__prev')?.addEventListener('click', () => slide(-1));
document.querySelector('.focus__next')?.addEventListener('click', () => slide(1));

// Logo band: enough logos for two widths of the widest screen, so the loop never shows a gap.
const stripRow = document.querySelector('.strip__row');
if (stripRow) {
  const logos = Array.from({ length: 16 }, () => '<img src="assets/logo-strip.svg" alt="" width="140" height="15" />').join('');
  stripRow.innerHTML = logos + logos;
}

// The form is part of the layout only.
document.querySelector('.form')?.addEventListener('submit', (event) => event.preventDefault());

// Reveal ----------------------------------------------------------------------
if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  onReady(() => document.querySelectorAll('.rv').forEach((element) => observer.observe(element)));
} else {
  document.querySelectorAll('.rv').forEach((element) => element.classList.add('is-in'));
}

boot();
