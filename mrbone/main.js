// Menu, smooth scroll, parallax, text effects, the TV screen and the photo band. No dependencies.
const header = document.querySelector('.header');
const burger = document.querySelector('.burger');
const stage = document.querySelector('.stage');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = window.matchMedia('(min-width: 1024px)');
const finePointer = window.matchMedia('(pointer: fine)');

burger?.addEventListener('click', () => {
  const open = header.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});
header?.querySelectorAll('.header__nav a').forEach((link) => link.addEventListener('click', () => {
  header.classList.remove('is-open');
  burger?.setAttribute('aria-expanded', 'false');
}));

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
    if (!finePointer.matches || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    event.preventDefault();
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    scrollToY((scroller.active ? scroller.target : window.scrollY) + event.deltaY * scale * 0.7);
  }, { passive: false });
}
window.addEventListener('scroll', () => {
  if (!scroller.active) scroller.target = scroller.current = window.scrollY;
}, { passive: true });
document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => {
  const target = document.querySelector(link.getAttribute('href'));
  if (!target) return;
  event.preventDefault();
  const y = link.getAttribute('href') === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - 40;
  if (reduceMotion) window.scrollTo(0, y);
  else scrollToY(y);
}));

// Parallax --------------------------------------------------------------------
// Scroll: People and everything below it slide up over the poster; the bone on the rope and
// the boy in the footer drift. Cursor: the big moon moves most, the small moon less, the blue bone least.
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

  if (boneRope) boneRope.style.transform = `translate3d(0, ${clamp(-0.18 * (y + view / 2 - (top + 5845 * u)), -300 * u, 300 * u).toFixed(1)}px, 0)`;
  if (capGuy) capGuy.style.transform = `translate3d(0, ${Math.min(-0.3 * (y - maxScroll()), 400 * u).toFixed(1)}px, 0)`;

  pointer.cx = lerp(pointer.cx, pointer.x, 0.08);
  pointer.cy = lerp(pointer.cy, pointer.y, 0.08);
  depthItems.forEach((element) => {
    const depth = Number(element.dataset.depth) * u;
    element.style.transform = `translate3d(${(pointer.cx * depth).toFixed(2)}px, ${(pointer.cy * depth).toFixed(2)}px, 0)`;
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

// Text effects ------------------------------------------------------------------
// Headings shuffle their letters for a moment before settling.
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&$@!?';
const textNodes = (element) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) if (walker.currentNode.data.trim()) nodes.push(walker.currentNode);
  return nodes;
};
const shuffle = (element) => {
  const nodes = textNodes(element);
  const originals = nodes.map((node) => node.data);
  const total = originals.reduce((sum, text) => sum + text.length, 0);
  const duration = 650;
  const start = performance.now();
  const frame = (now) => {
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
    else nodes.forEach((node, n) => { node.data = originals[n]; });
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
  document.querySelectorAll('.reveal, .script:not(.hero-script)').forEach((element) => observer.observe(element));
  // The hero plays on load.
  shuffle(document.querySelector('.hero-title'));
  setTimeout(() => document.querySelector('.hero-script')?.classList.add('is-written'), 350);
} else {
  document.querySelectorAll('.script').forEach((element) => element.classList.add('is-written'));
}

// Photo band ------------------------------------------------------------------
// Each row holds its photos twice so the CSS animation can loop without a seam.
document.querySelectorAll('.strip__row').forEach((row) => {
  [...row.children].forEach((child) => row.append(child.cloneNode(true)));
});

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
    if (now - last < 50) return;
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
          if (Math.random() < 0.08) chars[i] = randomChar(level);
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
