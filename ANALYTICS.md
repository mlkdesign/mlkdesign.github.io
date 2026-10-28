# Portfolio analytics

- Account: 366698090
- GA4 property: Jack Milka — Portfolio (561189501)
- Web stream: Jack Milka Portfolio — Web (16222209980)
- Measurement ID: G-4RJRW3679Y
- Website: https://mlkdesign.github.io/milka-cv/
- Reporting time zone: Poland; currency: USD.

## Consent

analytics.js runs on index.html and case.html. It reuses the existing localStorage preference `jack-milka-cookie-preference` (`accepted` / `declined`). Unknown/missing values require an explicit choice. Closing the banner grants no consent. Google scripts only load after acceptance (Basic Consent Mode). Advertising storage, ad user data and ad personalization stay denied; Google Signals is disabled. Cookie settings at the bottom of both pages reopens the banner. Declining after acceptance disables collection, clears GA cookies and reloads to stop the loaded tag. Other open tabs reload when the preference changes.

No form values are sent to GA. Page URLs retain only a valid case project ID; other query parameters and hashes are excluded. Referrer queries/hashes are excluded. Enhanced Measurement is off to avoid duplicate automatic form/download events.

## Events

| Event | Trigger |
| --- | --- |
| page_view | Once per page load after consent |
| cv_download | Click on an enabled CV download |
| cv_unavailable | Click on the currently disabled CV button |
| contact_form_open | Contact CTA click |
| contact_form_submit | Valid form submission, before request |
| generate_lead | Formspree returned success without errors |
| contact_form_error | Failed request / server rejection / timeout |
| case_click | Portfolio case link click, project_id 1–5 |
| case_view | Case page opened, once after consent, project_id 1–5 |
| case_visit | Case external/preview link click |

CV PDF is currently absent and its hero link is disabled. This integration preserves that behavior; a disabled click never counts as a download. The experience CV link is hidden.

## Verification

Use `?analytics_debug=1` on the portfolio, or `?project=5&analytics_debug=1` on a case. Accept cookies, perform actions, and inspect GA4 Admin → DebugView and Reports → Realtime. Debug mode is opt-in per URL and is omitted for ordinary visits. Do not send a real contact request merely to test analytics; use a mocked response locally for success/failure paths.

Only branch milka-cv is changed. Its existing Pages workflow assembles main at / and milka-cv at /milka-cv/; main is not modified.
