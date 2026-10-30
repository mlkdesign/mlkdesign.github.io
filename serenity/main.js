// Mobile menu, article slider and demo forms. No dependencies.
const header = document.querySelector('.header');
const burger = document.querySelector('.burger');

const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 10);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

burger?.addEventListener('click', () => {
  const open = header.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

header?.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', () => {
    header.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

const track = document.querySelector('.articles__track');
const thumb = document.querySelector('.articles__thumb');

if (track) {
  const step = () => (track.querySelector('.article-card')?.offsetWidth || 325) + 20;
  document.querySelector('.articles__prev')?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  document.querySelector('.articles__next')?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

  const prev = document.querySelector('.articles__prev');
  const next = document.querySelector('.articles__next');
  const setArrow = (button, enabled) => {
    if (!button) return;
    button.classList.toggle('arrow-btn--active', enabled);
    button.disabled = !enabled;
  };

  const updateThumb = () => {
    const max = track.scrollWidth - track.clientWidth;
    setArrow(prev, track.scrollLeft > 1);
    setArrow(next, track.scrollLeft < max - 1);
    if (!thumb) return;
    const bar = thumb.parentElement.clientWidth;
    // The design shows a fixed thumb of about 40% of the bar.
    const width = bar * 0.4;
    const progress = max > 0 ? track.scrollLeft / max : 0;
    thumb.style.width = `${width}px`;
    thumb.style.transform = `translateX(${(bar - width) * progress}px)`;
  };
  track.addEventListener('scroll', updateThumb, { passive: true });
  window.addEventListener('resize', updateThumb);
  updateThumb();
}

// The forms are part of the layout only: they are not connected to a backend.
document.querySelectorAll('.request').forEach((form) => {
  form.addEventListener('submit', (event) => event.preventDefault());
});

// Consultation modal: buttons marked data-modal open it instead of jumping to the page form.
const modal = document.querySelector('#consult');

if (modal && typeof modal.showModal === 'function') {
  document.querySelectorAll('[data-modal]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      header?.classList.remove('is-open');
      document.body.style.overflow = '';
      modal.showModal();
    });
  });
  modal.querySelector('[data-modal-close]')?.addEventListener('click', () => modal.close());
  // A click on the dimmed backdrop (outside the form) closes it.
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Standard reveal: blocks fade up as they enter the viewport; siblings are staggered.
const revealTargets = [
  '.display', '.title-48', '.title-40', '.about__card', '.about__mark', '.advantages',
  '.advantage', '.offer-row', '.turnkey__pill', '.turnkey__title', 'main .request', '.partners__logos img', '.article-card',
  '.registration > *', '.service-menu', '.service-card', '.service-map', '.service-closing', '.step', '.landing-copy > *',
  '.company', '.companies__more', '.article > *', '.legal-form', '.country-note', '.tax-row', '.country-band__grid > *',
  '.doc', '.reporting > *', '.service-list li', '.footer__grid > *',
].join(',');

if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll(revealTargets).forEach((element) => {
    if (element.closest('.modal, .reveal')) return;
    const siblings = Array.from(element.parentElement.children).filter((child) => child.matches(revealTargets));
    element.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(element), 6) * 0.08}s`);
    element.classList.add('reveal');
    observer.observe(element);
  });
}

// Article and country heroes stay pinned while the page content slides over them;
// the photo drifts slower and the title fades out.
const pinnedHero = document.querySelector('.article-hero, .country-hero');

if (pinnedHero && !reduceMotion) {
  const photo = pinnedHero.querySelector('img');
  const text = pinnedHero.querySelector('.wrap');
  photo?.classList.add('parallax-img');
  text?.classList.add('parallax-text');
  let frame = 0;
  const update = () => {
    frame = 0;
    const height = pinnedHero.offsetHeight;
    const progress = Math.min(window.scrollY / height, 1);
    if (photo) photo.style.translate = `0 ${progress * height * -0.25}px`;
    if (text) {
      text.style.translate = `0 ${progress * height * -0.4}px`;
      text.style.opacity = String(1 - progress * 1.4);
    }
  };
  window.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(update);
  }, { passive: true });
  update();
}
