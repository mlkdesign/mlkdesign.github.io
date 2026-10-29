// Language switch for the legal pages: same stored preference as the rest of the site.
const languagePreferenceKey = 'mlk-language';
const UKRAINE_TIME_ZONES = ['Europe/Kyiv', 'Europe/Kiev', 'Europe/Uzhgorod', 'Europe/Zaporozhye', 'Europe/Simferopol'];

const defaultLanguage = () => {
  const browserLanguage = (navigator.language || '').toLowerCase();
  let timeZone = '';
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    // Older browsers: rely on the browser language only.
  }
  return browserLanguage.startsWith('uk') || UKRAINE_TIME_ZONES.includes(timeZone) ? 'uk' : 'en';
};

let language = defaultLanguage();
try {
  const stored = localStorage.getItem(languagePreferenceKey);
  if (stored === 'uk' || stored === 'en') language = stored;
} catch {
  // Storage unavailable: keep the default.
}

const applyLanguage = (next) => {
  language = next;
  document.documentElement.lang = next;
  const title = document.querySelector(`meta[name="title-${next}"]`)?.content;
  if (title) document.title = title;
  document.querySelectorAll('[data-language]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.language === next));
  });
};

applyLanguage(language);

document.querySelectorAll('[data-language]').forEach((button) => {
  button.addEventListener('click', () => {
    const next = button.dataset.language;
    try {
      localStorage.setItem(languagePreferenceKey, next);
    } catch {
      // The switch still applies to this page.
    }
    applyLanguage(next);
  });
});
