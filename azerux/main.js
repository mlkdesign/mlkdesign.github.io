// Menu, tabs, FAQ, sliders, plan periods, blog controls and the consultation modal. No dependencies.
const header = document.querySelector('.header');
const burger = document.querySelector('.burger');
const desktop = window.matchMedia('(min-width: 1281px)');

const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 10);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const closeMenu = () => {
  header?.classList.remove('is-open');
  burger?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
};

burger?.addEventListener('click', () => {
  const open = header.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

header?.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', closeMenu));

// Theme: dark by default (the main design); the sun/moon button switches and remembers the choice.
const themeButton = document.querySelector('.theme');
const syncTheme = () => {
  const light = document.documentElement.dataset.theme === 'light';
  themeButton?.setAttribute('aria-pressed', String(light));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#e3e8f7' : '#121212');
};
themeButton?.addEventListener('click', () => {
  const light = document.documentElement.dataset.theme !== 'light';
  if (light) document.documentElement.dataset.theme = 'light';
  else delete document.documentElement.dataset.theme;
  try { localStorage.setItem('azerux-theme', light ? 'light' : 'dark'); } catch (error) { /* private mode: the choice lasts for this page only */ }
  syncTheme();
});
syncTheme();

// Dropdowns open on hover on desktop; the button toggles them for touch and keyboard.
header?.querySelectorAll('.nav__drop').forEach((drop) => {
  const button = drop.querySelector('button');
  button.addEventListener('click', () => {
    const open = !drop.classList.contains('is-open');
    header.querySelectorAll('.nav__drop.is-open').forEach((other) => {
      other.classList.remove('is-open');
      other.querySelector('button').setAttribute('aria-expanded', 'false');
    });
    drop.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
  });
});
document.addEventListener('click', (event) => {
  if (!desktop.matches || event.target.closest('.nav__drop')) return;
  header?.querySelectorAll('.nav__drop.is-open').forEach((drop) => {
    drop.classList.remove('is-open');
    drop.querySelector('button').setAttribute('aria-expanded', 'false');
  });
});

// Solutions: Services / DDoS Attack Protection tabs; on phones only three cards show until "See all".
const tabs = [...document.querySelectorAll('.switch__btn')];
const seeAll = document.querySelector('.solutions__all');
const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
panels.forEach((panel) => panel?.classList.add('is-collapsed'));
const syncSeeAll = () => {
  const panel = panels.find((p) => p && !p.hidden);
  if (seeAll) seeAll.hidden = !panel || !panel.classList.contains('is-collapsed') || panel.children.length <= 3;
};
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    tabs.forEach((other, i) => {
      other.classList.toggle('is-active', i === index);
      other.setAttribute('aria-selected', String(i === index));
      if (panels[i]) panels[i].hidden = i !== index;
    });
    syncSeeAll();
  });
});
seeAll?.addEventListener('click', () => {
  panels.forEach((panel) => panel?.classList.remove('is-collapsed'));
  syncSeeAll();
});
syncSeeAll();

// FAQ: one question open at a time (desktop shows its answer on the right, phones expand it in place).
document.querySelectorAll('.faq__box').forEach((box) => {
  const items = [...box.querySelectorAll('.faq__item')];
  items.forEach((item) => {
    item.querySelector('.faq__q').addEventListener('click', () => {
      const wasOpen = item.classList.contains('is-open');
      items.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
      });
      // On desktop one answer always stays visible; on phones a second tap folds it.
      const open = desktop.matches || window.innerWidth > 767 || !wasOpen;
      item.classList.toggle('is-open', open);
      item.querySelector('.faq__q').setAttribute('aria-expanded', String(open));
    });
  });
  // The answers sit beside the list, out of flow: the box grows to fit the longest one,
  // so its button keeps the same 40px inset from the bottom and the right.
  const answers = items.map((item) => item.querySelector('.faq__a'));
  const fit = () => {
    if (window.innerWidth <= 767) {
      box.style.minHeight = '';
      return;
    }
    const tallest = Math.max(...answers.map((answer) => {
      const gap = parseFloat(getComputedStyle(answer).rowGap) || 0;
      return [...answer.children].reduce((sum, child) => sum + child.offsetHeight, 0) + gap * (answer.children.length - 1);
    }));
    box.style.minHeight = `${Math.max(414, Math.ceil(tallest) + 82)}px`;
  };
  new ResizeObserver(fit).observe(box);
  document.fonts?.ready.then(fit);
});

// "Companies that trust us" slider: arrows scroll a card at a time and switch off at either end; the bar fills as it scrolls.
const track = document.querySelector('.trust__track');
if (track) {
  const prev = document.querySelector('.trust__prev');
  const next = document.querySelector('.trust__next');
  const bar = document.querySelector('.trust__nav i');
  const step = () => (track.querySelector('.trust-card')?.offsetWidth || 312) + 10;
  prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    if (prev) prev.disabled = track.scrollLeft <= 1;
    if (next) next.disabled = track.scrollLeft >= max - 1;
    // The bar fills from empty at the start to full at the end.
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, track.scrollLeft / max) : 1})`;
  };
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

// Service plans: the billing period applies its discount to every price.
document.querySelectorAll('.periods').forEach((group) => {
  const buttons = [...group.querySelectorAll('.periods__btn')];
  const plans = group.closest('.plans');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((other) => {
        other.classList.toggle('is-active', other === button);
        other.setAttribute('aria-pressed', String(other === button));
      });
      const discount = Number(button.dataset.discount) / 100;
      plans.querySelectorAll('.plan__price strong').forEach((price) => {
        price.textContent = `$ ${Math.round(Number(price.dataset.base) * (1 - discount))}`;
      });
      plans.querySelectorAll('.plan__period').forEach((period) => { period.textContent = button.dataset.label; });
    });
  });
});

// Blog: the grid/list switch (categories, search and pages are under "Blog posts" below).
const view = document.querySelector('.blog__view');
view?.addEventListener('click', () => {
  const list = view.getAttribute('aria-pressed') !== 'true';
  view.setAttribute('aria-pressed', String(list));
  view.setAttribute('aria-label', list ? 'Show as a grid' : 'Show as a list');
  document.querySelector('.blog__grid')?.classList.toggle('is-list', list);
});

// The forms are part of the layout only: they are not connected to a backend.
document.querySelectorAll('.request').forEach((form) => {
  form.addEventListener('submit', (event) => event.preventDefault());
});

// Consultation modal: buttons marked data-modal open the "Get in touch" form.
const modal = document.querySelector('#consult');
if (modal && typeof modal.showModal === 'function') {
  document.querySelectorAll('[data-modal]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      closeMenu();
      modal.showModal();
    });
  });
  modal.querySelector('[data-modal-close]')?.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });
}

// Blog posts (posts.js) ----------------------------------------------------------
// The home page shows the four newest, the blog lists them by category with search, sorting and pages,
// and the article page shows the post named in ?id= with three related ones.
const posts = (window.AZERUX_POSTS || []).slice().sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
const escapeHtml = (text) => String(text).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
const postUrl = (post) => `article.html?id=${encodeURIComponent(post.id)}`;
const metaIcon = (name) => `<img src="assets/icon-${name}.svg" alt="" width="10" height="10" />`;
const postMeta = (post) => `<ul class="meta"><li>${metaIcon('date')}${post.date.split('-').reverse().join('.')}</li><li>${metaIcon('clock')}${post.time}</li><li>${metaIcon('views')}${post.views}</li></ul>`;
const postCard = (post, kind = '') => {
  const url = postUrl(post);
  const more = kind === 'row' ? '' : `<a class="btn btn--line" href="${url}"><span>Learn more</span><img src="assets/arrow-white.svg" alt="" width="16" height="16" /></a>`;
  return `<article class="post${kind ? ` post--${kind}` : ''}"><a class="post__img" href="${url}" tabindex="-1"><img src="${post.img}" alt="" loading="lazy" /></a>`
    + `<div class="post__body">${postMeta(post)}<h3><a href="${url}">${escapeHtml(post.title)}</a></h3><p>${escapeHtml(post.excerpt)}</p>${more}</div></article>`;
};

const latestGrid = document.querySelector('.latest__grid');
if (latestGrid && posts.length >= 4) {
  latestGrid.innerHTML = postCard(posts[0], 'big') + `<div class="latest__list">${posts.slice(1, 4).map((post) => postCard(post, 'row')).join('')}</div>`;
}

const blogGrid = document.querySelector('.blog__grid');
if (blogGrid && posts.length) {
  // No pages: the grid shows 6 cards and adds the next 6 whenever its end comes into view.
  const state = { category: 'All', query: '', newestFirst: true, shown: 0 };
  const perPage = 6;
  const more = document.querySelector('.blog__more');
  const chips = [...document.querySelectorAll('.chip')];
  let found = [];
  const loadMore = () => {
    if (state.shown >= found.length) return;
    const next = found.slice(state.shown, state.shown + perPage);
    state.shown += next.length;
    blogGrid.insertAdjacentHTML('beforeend', next.map((post) => postCard(post)).join(''));
    // Still at the end (a tall screen or a short batch): keep filling until the end is out of view.
    requestAnimationFrame(() => {
      if (more && more.getBoundingClientRect().top < innerHeight + 300) loadMore();
    });
  };
  const renderBlog = () => {
    const query = state.query.trim().toLowerCase();
    found = posts
      .filter((post) => state.category === 'All' || post.cat === state.category)
      .filter((post) => !query || `${post.title} ${post.excerpt}`.toLowerCase().includes(query));
    if (!state.newestFirst) found.reverse();
    state.shown = 0;
    blogGrid.innerHTML = found.length ? '' : '<p class="blog__empty">No articles match your search.</p>';
    loadMore();
  };
  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((other) => {
      other.classList.toggle('is-active', other === chip);
      other.setAttribute('aria-pressed', String(other === chip));
    });
    state.category = chip.textContent.trim();
    renderBlog();
  }));
  document.querySelector('.search input')?.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderBlog();
  });
  document.querySelector('.sort select')?.addEventListener('change', (event) => {
    state.newestFirst = event.target.selectedIndex === 0;
    renderBlog();
  });
  if (more) new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadMore();
  }, { rootMargin: '0px 0px 300px 0px' }).observe(more);
  renderBlog();
}

const articleBody = document.querySelector('.article__content');
if (articleBody && posts.length) {
  const id = new URLSearchParams(location.search).get('id');
  const post = posts.find((item) => item.id === id) || posts.find((item) => item.id === 'we-are-launching') || posts[0];
  const [intro, ...rest] = post.body;
  const block = (part) => {
    if (Array.isArray(part)) return `<ol>${part.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`;
    if (part.startsWith('## ')) return `<h2>${escapeHtml(part.slice(3))}</h2>`;
    return `<p>${escapeHtml(part)}</p>`;
  };
  articleBody.innerHTML = `<h1>${escapeHtml(post.title)}</h1>${block(intro)}`
    + `<img class="article__banner" src="${post.banner || post.img}" width="1280" height="500" alt="" />${rest.map(block).join('')}`;
  const topMeta = document.querySelector('.article__top .meta');
  if (topMeta) topMeta.outerHTML = postMeta(post);
  document.title = `${post.title} — Azerux`;
  const related = document.querySelector('.related__grid');
  if (related) {
    const others = posts.filter((item) => item !== post);
    const picks = [...others.filter((item) => item.cat === post.cat), ...others.filter((item) => item.cat !== post.cat)].slice(0, 3);
    related.innerHTML = picks.map((item) => postCard(item, 'small')).join('');
  }
}

// Blocks fade up as they enter the viewport; siblings are staggered.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = [
  'main .title', '.eyebrow', '.lead', '.switch', '.solution', '.stat', '.faq__box', '.benefit', '.benefits__logo', '.trust-card',
  'main > .wrap > .touch', '.post', '.socials__item', '.partners__logos li', '.page-hero__inner > *', '.service__intro', '.service__h',
  '.why-card', '.features', '.closing', '.cta__inner > *', '.why-use__label', '.problem', '.periods', '.plan', '.trial', '.how__diagram',
  '.article .wrap > *', '.legal .wrap > *', '.footer__grid > *',
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
    if (element.closest('.modal, .reveal, .hero')) return;
    const siblings = [...element.parentElement.children].filter((child) => child.matches(revealTargets));
    element.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(element), 6) * 0.08}s`);
    element.classList.add('reveal');
    observer.observe(element);
  });
}
