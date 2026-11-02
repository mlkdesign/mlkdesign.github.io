// Cookie settings for the studio pages: the "Cookie Settings" button in the footer opens a panel that turns
// Microsoft Clarity's cookies on or off. Clarity runs by default (see the privacy policy); a "declined" choice is
// also applied right after the Clarity snippet in each page's <head>, before Clarity loads.
(() => {
  const key = 'mlk-cookie-preference';
  const copy = {
    en: {
      title: 'Cookie settings',
      text: 'Microsoft Clarity helps us see how visitors use the site: heatmaps and session recordings. It is on by default; you can turn it off here.',
      accept: 'accept',
      decline: 'decline',
      close: 'Close cookie settings',
    },
    uk: {
      title: 'Налаштування cookie',
      text: 'Microsoft Clarity допомагає нам бачити, як відвідувачі користуються сайтом: теплові карти й записи сесій. Його ввімкнено за замовчуванням; тут його можна вимкнути.',
      accept: 'прийняти',
      decline: 'відхилити',
      close: 'Закрити налаштування cookie',
    },
  };

  const consent = (state) => window.clarity?.('consentv2', { ad_Storage: 'denied', analytics_Storage: state });
  const clearCookies = () => {
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^_cl(ck|sk)$/.test(name)) continue;
      for (const domain of ['', `;domain=${location.hostname}`, `;domain=.${location.hostname}`]) {
        document.cookie = `${name}=;max-age=0;path=/${domain};SameSite=Lax`;
      }
    }
  };

  const style = document.createElement('style');
  style.textContent = `
    .cookie-panel { position: fixed; right: 15px; bottom: calc(15px + env(safe-area-inset-bottom, 0px)); z-index: 9998; width: min(560px, calc(100% - 30px)); box-sizing: border-box; padding: 15px 40px 15px 15px; border: 1px solid rgba(255,255,255,.1); background: rgba(20,20,20,.72); -webkit-backdrop-filter: blur(32px); backdrop-filter: blur(32px); color: #fff; font-family: "Noto Sans", "Helvetica Neue", Arial, sans-serif; opacity: 0; visibility: hidden; transform: translate3d(0, 30px, 0); transition: transform .5s cubic-bezier(.2,.8,.2,1), opacity .4s, visibility 0s linear .5s; }
    .cookie-panel.is-visible { opacity: 1; visibility: visible; transform: none; transition-delay: 0s; }
    .cookie-panel__title { margin: 0; font-size: 22px; font-weight: 300; line-height: 1.1; letter-spacing: -.03em; }
    .cookie-panel__text { margin: .6rem 0 1rem; color: rgba(255,255,255,.65); font-size: .85rem; font-weight: 300; line-height: 1.45; }
    .cookie-panel__actions { display: flex; gap: 10px; }
    .cookie-panel__actions button { min-width: 112px; height: 40px; padding: 0 1.2rem; border: 1px solid rgba(255,255,255,.3); border-radius: 0; background: transparent; color: rgba(255,255,255,.7); font-family: inherit; font-size: .82rem; font-weight: 300; line-height: 1; letter-spacing: .12em; cursor: pointer; transition: border-color .3s, color .3s, background-color .3s; }
    .cookie-panel__actions button:hover, .cookie-panel__actions button:focus-visible { border-color: #fff; color: #fff; }
    .cookie-panel__actions button[aria-pressed="true"] { border-color: #ff5a1f; background: #ff5a1f; color: #fff; }
    .cookie-panel__close { position: absolute; top: 12px; right: 12px; width: 24px; height: 24px; padding: 0; border: 0; background: transparent; color: rgba(255,255,255,.6); font-family: inherit; font-size: 20px; font-weight: 300; line-height: 1; cursor: pointer; }
    .cookie-panel__close:hover, .cookie-panel__close:focus-visible { color: #fff; }
    @media (max-width: 800px) { .cookie-panel__actions button { flex: 1 1 0; } }
  `;
  document.head.append(style);

  let panel;
  const read = () => { try { return localStorage.getItem(key); } catch { return null; } };
  const open = () => {
    const t = copy[document.documentElement.lang === 'uk' ? 'uk' : 'en'];
    panel?.remove();
    panel = document.createElement('section');
    panel.className = 'cookie-panel';
    panel.setAttribute('aria-label', t.title);
    panel.innerHTML = `<h2 class="cookie-panel__title"></h2><p class="cookie-panel__text"></p>
      <div class="cookie-panel__actions"><button type="button" data-choice="accepted"></button><button type="button" data-choice="declined"></button></div>
      <button class="cookie-panel__close" type="button">×</button>`;
    panel.querySelector('.cookie-panel__title').textContent = t.title;
    panel.querySelector('.cookie-panel__text').textContent = t.text;
    panel.querySelector('.cookie-panel__close').setAttribute('aria-label', t.close);
    const saved = read() === 'declined' ? 'declined' : 'accepted';
    panel.querySelectorAll('[data-choice]').forEach((button) => {
      button.textContent = t[button.dataset.choice === 'accepted' ? 'accept' : 'decline'];
      button.setAttribute('aria-pressed', String(button.dataset.choice === saved));
      button.addEventListener('click', () => {
        const choice = button.dataset.choice;
        try { localStorage.setItem(key, choice); } catch { /* Applies to this visit only. */ }
        consent(choice === 'accepted' ? 'granted' : 'denied');
        if (choice === 'declined') clearCookies();
        close();
      });
    });
    panel.querySelector('.cookie-panel__close').addEventListener('click', close);
    document.body.append(panel);
    requestAnimationFrame(() => panel.classList.add('is-visible'));
    panel.querySelector('[aria-pressed="true"]').focus({ preventScroll: true });
  };
  const close = () => panel?.classList.remove('is-visible');

  document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('[data-cookie-settings]')) open();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
})();
