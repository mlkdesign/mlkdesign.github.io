// Basic Consent Mode: no Google requests until an explicit Accept.
(() => {
  const id = 'G-4RJRW3679Y';
  const key = 'jack-milka-cookie-preference';
  const params = new URLSearchParams(location.search);
  const project = /^[1-5]$/.test(params.get('project')) ? params.get('project') : null;
  const isCase = location.pathname.endsWith('/case.html');
  const pageLocation = location.origin + location.pathname + (isCase && project ? `?project=${project}` : '');
  const debug = params.get('analytics_debug') === '1';
  const caseNames = { 1: 'MR.BONE', 2: 'Storm Traffic', 3: 'Black Ring', 4: 'Serenity', 5: 'Kowalski & Partners' };
  const pageTitle = isCase ? `${caseNames[project] || 'Case study'} — Jack Milka` : document.title;
  let accepted = false;
  let loaded = false;
  let caseSent = false;
  const readPreference = () => { try { return localStorage.getItem(key); } catch { return null; } };
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  const track = (name, details = {}) => {
    if (!accepted) return;
    gtag('event', name, { ...details, ...(project ? { project_id: project } : {}), ...(debug ? { debug_mode: true } : {}) });
  };
  // Only fixed event names/parameters are accepted; never pass form values.
  window.portfolioAnalytics = { track };
  const apply = (preference) => {
    accepted = preference === 'accepted';
    window[`ga-disable-${id}`] = !accepted;
    document.body.dataset.cookiePreference = preference || '';
    if (!accepted) return;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    if (!loaded) {
      loaded = true;
      gtag('js', new Date());
      let referrer = '';
      try { const ref = new URL(document.referrer); referrer = ref.origin + ref.pathname; } catch { /* No referrer. */ }
      gtag('config', id, { page_location: pageLocation, page_title: pageTitle, page_referrer: referrer, send_page_view: true, allow_google_signals: false, allow_ad_personalization_signals: false, ...(debug ? { debug_mode: true } : {}) });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.append(script);
    }
    if (isCase && project && !caseSent) { caseSent = true; track('case_view'); }
  };
  const banner = document.querySelector('.cookie-banner');
  const show = () => { banner?.classList.add('is-visible'); banner?.setAttribute('aria-hidden', 'false'); };
  const hide = () => { banner?.classList.remove('is-visible'); banner?.setAttribute('aria-hidden', 'true'); };
  const clearCookies = () => {
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const path of ['/', '/milka-cv', '/milka-cv/']) {
        for (const domain of ['', `;domain=${location.hostname}`, `;domain=.${location.hostname}`]) {
          document.cookie = `${name}=;max-age=0;path=${path}${domain};SameSite=Lax`;
        }
      }
    }
  };
  document.querySelectorAll('[data-cookie-choice]').forEach(button => button.addEventListener('click', () => {
    const choice = button.dataset.cookieChoice;
    const wasLoaded = loaded;
    try { localStorage.setItem(key, choice); } catch { /* Apply to this visit even without storage. */ }
    apply(choice);
    hide();
    if (choice === 'declined') {
      clearCookies();
      // A clean document also stops an already loaded tag's automatic timers.
      if (wasLoaded) location.reload();
    }
  }));
  document.querySelector('[data-cookie-close]')?.addEventListener('click', hide);
  document.querySelector('[data-cookie-settings]')?.addEventListener('click', show);
  window.addEventListener('storage', event => {
    if (event.key === key) location.reload();
  });
  const saved = readPreference();
  apply(saved);
  if (!['accepted', 'declined'].includes(saved)) window.setTimeout(show, 3000);
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest('a, button') : null;
    if (!target) return;
    if (target.matches('[data-hero-cv], [data-cv-link]')) {
      track(target.getAttribute('aria-disabled') === 'true' ? 'cv_unavailable' : 'cv_download', { placement: target.hasAttribute('data-hero-cv') ? 'hero' : 'experience' });
    }
    if (target.matches('[data-open-form]')) track('contact_form_open');
    if (target.matches('[data-case-link]')) {
      const caseId = new URL(target.href).searchParams.get('project');
      if (/^[1-5]$/.test(caseId)) track('case_click', { project_id: caseId });
    }
    if (target.matches('[data-case-visit]')) track('case_visit');
  }, true);
})();
