// Phone menu and scroll reveal. No dependencies.
const header = document.querySelector('.header');
const burger = document.querySelector('.burger');

burger?.addEventListener('click', () => {
  const open = header.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});
header?.querySelectorAll('.header__nav a').forEach((link) => link.addEventListener('click', () => {
  header.classList.remove('is-open');
  burger?.setAttribute('aria-expanded', 'false');
}));

// Cards, titles and copy fade up as they come into view.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.poster, .title-xl, .title-md, .card, .sea-card, .stats, .links, .lead, .lead + .copy, .join-title, .tv')
    .forEach((element) => {
      element.classList.add('reveal');
      observer.observe(element);
    });
}
