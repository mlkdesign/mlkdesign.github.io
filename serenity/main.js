// Mobile menu, article slider and demo forms. No dependencies.
const header = document.querySelector('.header');
const burger = document.querySelector('.burger');

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

  const updateThumb = () => {
    if (!thumb) return;
    const bar = thumb.parentElement.clientWidth;
    // The design shows a fixed thumb of about 40% of the bar.
    const width = bar * 0.4;
    const max = track.scrollWidth - track.clientWidth;
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
