#!/usr/bin/env python3
"""Generate the contact-free, English-only Upwork edition of the site into upwork/.

The edition is a copy of index.html, case.html, pandawin.html, app.js and case.js with:
- no personal contact details (email, messengers, social profiles, Freelancehunt profile, project form);
- every "contact me" / project-form action turned into a link to upwork/Jack-Milka-CV.pdf;
- no language switcher (English only);
- shared CSS, images and analytics loaded from the personal site at /milka-cv/.

The deploy workflow publishes this folder at https://mlkdesign.github.io/upwork/ (site root, next to /milka-cv/),
so shared files are referenced as ../milka-cv/… To preview locally, serve a folder where upwork/ and milka-cv/
(this repository) sit side by side.

Run from the repository root after changing the main pages:  python3 tools/upwork/build.py
The CV PDF itself comes from tools/cv/build.mjs (the "upwork" edition).
Every rewrite is asserted, so a markup change in the main site fails loudly instead of leaking contacts.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'upwork'
BASE_URL = 'https://mlkdesign.github.io/upwork/'
SHARED = '../milka-cv/'  # personal site, relative to /upwork/
CV = 'Jack-Milka-CV.pdf'
CV_LINK = f'href="{CV}" target="_blank" rel="noopener"'
CLARITY = '''  <script type="text/javascript">
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "z63mgu0wkw");
    </script>'''

# Anything matching these must not survive in the generated edition.
FORBIDDEN = [
    r'mailto:', r'milka19051995', r'mlkdesignweb', r't\.me/', r'wa\.me/', r'EugeneMilka', r'380\s?73', r'instagram\.com',
    r'linkedin\.com/in/', r'behance\.net(?!/gallery/257750803/)', r'upwork\.com/freelancers', r'freelancehunt\.com/freelancer',
    r'formspree',
]
# Markup that must be gone from the generated pages (JS may still mention these selectors).
FORBIDDEN_MARKUP = [r'data-open-form', r'class="language-switcher"', r'data-language=', r'class="form-modal"', r'class="social-links"']


def replace_once(text, old, new, label):
    count = text.count(old)
    assert count == 1, f'{label}: expected 1 match, found {count}: {old[:70]!r}'
    return text.replace(old, new)


def element_span(text, start, tag):
    """Return (start, end) of the element whose opening tag begins at `start`."""
    depth = 0
    pattern = re.compile(rf'<(/?){tag}\b[^>]*>', re.I)
    for match in pattern.finditer(text, start):
        depth += -1 if match.group(1) else 1
        if depth == 0:
            return start, match.end()
    raise AssertionError(f'unclosed <{tag}> at {start}')


def remove_elements(text, opening_regex, tag, label, expected=None):
    """Remove every element whose opening tag matches `opening_regex` (plus its leading indentation)."""
    removed = 0
    while True:
        match = re.search(opening_regex, text)
        if not match:
            break
        line_start = text.rfind('\n', 0, match.start()) + 1
        start = line_start if text[line_start:match.start()].strip() == '' else match.start()
        _, end = element_span(text, match.start(), tag)
        if text[end:end + 1] == '\n':
            end += 1
        text = text[:start] + text[end:]
        removed += 1
    assert removed and (expected is None or removed == expected), f'{label}: removed {removed}'
    return text


def retag_as_cv_link(text, opening_regex, label):
    """Turn a <button ... data-open-form> into an <a> that opens the CV."""
    match = re.search(opening_regex, text)
    assert match, f'{label}: not found'
    start, end = element_span(text, match.start(), 'button')
    element = text[start:end]
    opening = re.match(r'<button\b([^>]*)>', element)
    attrs = re.sub(r'\s*type="button"|\s*data-open-form', '', opening.group(1))
    element = f'<a{attrs} {CV_LINK}>' + element[opening.end():-len('</button>')] + '</a>'
    return text[:start] + element + text[end:]


def common_html(text, page, label):
    # Shared files live one level up.
    text = re.sub(r'(href|src)="assets/', rf'\1="{SHARED}assets/', text)
    text = re.sub(r'href="(style|case)\.css', rf'href="{SHARED}\1.css', text)
    text = text.replace('src="analytics.js', f'src="{SHARED}analytics.js')

    # Address, indexing and social metadata of this edition.
    text = re.sub(r'https://mlkdesign\.github\.io/milka-cv/(?!assets/)([^"]*)', lambda m: BASE_URL + m.group(1), text)
    text = text.replace(f'{BASE_URL}index.html', BASE_URL)
    text = replace_once(text, '<meta name="viewport"', '<meta name="robots" content="noindex" />\n    <meta name="viewport"', label)
    # The language switcher used to push "contact me" to the right edge; the CV link takes over that role.
    # The case-page CTA becomes a link, so it must not pick up link underlining, and the site-wide resting
    # opacity for links must not show it before its entrance animation starts.
    # The Privacy Policy row copies the studio site's .contact-cta__legal rules (that CSS is not in the personal style.css).
    text = replace_once(text, '</head>', '  <style>.nav-menu .book { margin-left: auto; } a.case-start { text-decoration: none; }'
                        ' .case-info__copy.has-sequence:not(.is-sequence-visible) > a.case-start { opacity: 0; }'
                        ' .contact-cta__legal { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem;'
                        ' font-size: 0.72rem; letter-spacing: 0.08em; }'
                        ' .contact-cta__legal a { color: #fff; text-decoration: none; }</style>\n  </head>', label)
    # Microsoft Clarity for this edition (its own project, separate from the studio's); see the privacy policy.
    text = replace_once(text, '</head>', CLARITY + '\n  </head>', label)

    # English only, no contact routes.
    text = remove_elements(text, r'<div class="language-switcher"', 'div', f'{label} language switcher')
    text = remove_elements(text, r'<div class="mobile-menu-modal__socials">', 'div', f'{label} mobile socials', 1)
    text = remove_elements(text, r'<div class="form-modal"', 'div', f'{label} form modal', 1)

    # "contact me" in the navigation becomes the CV.
    text = replace_once(text, '<a class="book" href="#" data-open-form>', f'<a class="book" {CV_LINK}>', f'{label} nav CV')
    text = re.sub(r'(<a class="book"[^>]*>\s*<span class="nav-link-mask">\s*<span class="nav-link-line"[^>]*>)contact me(</span>\s*<span class="nav-link-line"[^>]*>)contact me',
                  r'\1view CV\2view CV', text, count=1)
    text = re.sub(r'<a href="#" data-open-form>(<span class="mobile-menu-modal__label"[^>]*>)contact me</span></a>',
                  rf'<a {CV_LINK}>\1view CV</span></a>', text, count=1)

    # Remaining form triggers (footer CTA, works card) open the CV instead.
    text = text.replace('href="#" data-open-form', CV_LINK)
    text = re.sub(r'(<span class="btn__line"[^>]*>)get in touch(</span>)', r'\1view CV\2', text)

    # A Privacy Policy link under the closing call to action, where the studio site has its legal links.
    actions = text.find('<div class="contact-cta__actions">')
    assert actions >= 0, f'{label}: closing call to action'
    _, end = element_span(text, actions, 'div')
    text = (text[:end] + '\n        <nav class="contact-cta__legal" aria-label="Legal">'
            '\n          <a href="privacy-policy/">Privacy Policy</a>\n        </nav>' + text[end:])
    return text


def build_index():
    label = 'index.html'
    text = common_html((ROOT / 'index.html').read_text(), 'index', label)
    text = re.sub(r', "sameAs": \[[^\]]*\]', '', text, count=1)
    text = remove_elements(text, r'<div class="social-links"', 'div', 'hero social links', 1)
    # Freelancehunt links to the platform itself, not to the personal profile.
    text, swapped = re.subn(r'href="https://freelancehunt\.com/freelancer/[^"]*" data-experience-link="profile"',
                            'href="https://freelancehunt.com" data-experience-link="website"', text)
    assert swapped == 1, f'Freelancehunt link: {swapped}'
    text = re.sub(r'(data-experience-link="website"[^>]*>\s*<span class="social-link-mask"><span class="social-link-line">)View profile(</span><span class="social-link-line">)View profile',
                  r'\1View website\2View website', text)
    text = re.sub(r'(<a class="btn interactive" )href="[^"]*"( target="_blank" rel="noopener" data-fade data-hero-cv)', rf'\1href="{CV}"\2', text, count=1)
    text = re.sub(r'(<a class="btn interactive experience-cv" )href="[^"]*"', rf'\1href="{CV}"', text, count=1)
    text = replace_once(text, '<span>your project could be next</span>', '<span>view my CV</span>', label)
    return text


def build_case(name):
    label = name
    text = common_html((ROOT / name).read_text(), 'case', label)
    text = retag_as_cv_link(text, r'<button class="case-start corner-frame" type="button" data-open-form>', f'{label} case start')
    text = retag_as_cv_link(text, r'<button class="case-offer__button case-offer__button--primary" type="button" data-open-form>', f'{label} offer button')
    text = replace_once(text, '<span data-case-i18n="worksCta">your project could be next</span>', '<span data-case-i18n="worksCta">view my CV</span>', label)
    return text


def drop_contact_strings(text, label):
    """Remove translation entries that carry messenger handles or phone numbers."""
    text, removed = re.subn(r'\n\s*"(telegramContact|whatsappContact)": "[^"]*",?', '', text)
    assert removed >= 2, f'{label}: contact strings {removed}'
    return text


def build_app_js():
    text = (ROOT / 'app.js').read_text()
    label = 'app.js'
    text = replace_once(text, '"cvFile": "assets/cv/Jack-Milka-CV-EN.pdf"', f'"cvFile": "{CV}"', label)
    text = re.sub(r"(['\"])assets/", rf"\1{SHARED}assets/", text)
    text = replace_once(text, '"navContact": "contact me"', '"navContact": "view CV"', label)
    text = replace_once(text, '"worksCta": "your project could be next"', '"worksCta": "view my CV"', label)
    text = replace_once(text, '"finalButton": "get in touch"', '"finalButton": "view CV"', label)
    # English only: ignore the language stored by the main site on the same origin.
    text = replace_once(text, "  const storedLanguage = localStorage.getItem(languagePreferenceKey);\n  if (storedLanguage === 'uk' || storedLanguage === 'en') {",
                        "  const storedLanguage = 'en'; // Upwork edition is English only.\n  if (storedLanguage === 'uk' || storedLanguage === 'en') {", label)
    text = drop_contact_strings(text, label)
    return '// Generated by tools/upwork/build.py from app.js — edit the source, then regenerate.\n' + text


def build_case_js():
    text = (ROOT / 'case.js').read_text()
    label = 'case.js'
    text = re.sub(r"(['\"])assets/", rf"\1{SHARED}assets/", text)
    # Kowalski, Serenity, Azerux, MR.BONE, Storm Traffic and Black Ring demos live in /milka-cv/.
    text = replace_once(text, "visitUrl: 'Kowalski%20%26%20Partners/'", f"visitUrl: '{SHARED}Kowalski%20%26%20Partners/'", label)
    text = replace_once(text, "visitUrl: 'serenity/'", f"visitUrl: '{SHARED}serenity/'", label)
    text = replace_once(text, "visitUrl: 'azerux/'", f"visitUrl: '{SHARED}azerux/'", label)
    text = replace_once(text, "visitUrl: 'mrbone/'", f"visitUrl: '{SHARED}mrbone/'", label)
    text = replace_once(text, "visitUrl: 'storm-traffic/'", f"visitUrl: '{SHARED}storm-traffic/'", label)
    text = replace_once(text, "visitUrl: 'blackring/'", f"visitUrl: '{SHARED}blackring/'", label)
    text = replace_once(text, "'https://mlkdesign.github.io/milka-cv/');", f"'{BASE_URL}');", label)
    text = replace_once(text, '"navContact": "contact me"', '"navContact": "view CV"', label)
    text = replace_once(text, '"startProject": "let\'s work together"', '"startProject": "view my CV"', label)
    text = replace_once(text, '"offerDescription": "Let’s build something just as strong for you."', '"offerDescription": "My CV covers experience, skills and selected work."', label)
    text = replace_once(text, '"finalButton": "get in touch"', '"finalButton": "view CV"', label)
    text = replace_once(text, '"worksCta": "your project could be next"', '"worksCta": "view my CV"', label)
    # Without a public site to show, drop the "visit this site" button instead of opening the image.
    text = replace_once(text, '    else visitLink.href = activeProject.visitUrl || activeProject.image;',
                        '    else if (activeProject.visitUrl) visitLink.href = activeProject.visitUrl;\n    else visitLink.remove();', label)
    text = replace_once(text, "  const storedLanguage = localStorage.getItem(languagePreferenceKey);\n  if (storedLanguage === 'uk' || storedLanguage === 'en') {",
                        "  const storedLanguage = 'en'; // Upwork edition is English only.\n  if (storedLanguage === 'uk' || storedLanguage === 'en') {", label)
    text = drop_contact_strings(text, label)
    return '// Generated by tools/upwork/build.py from case.js — edit the source, then regenerate.\n' + text


PRIVACY_DATE = '31 October 2026'


def build_privacy():
    """The Upwork edition's own privacy policy: the studio policy's layout and stylesheet, no direct contact routes."""
    return f'''<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="robots" content="noindex" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#0b0b0b" />
    <meta name="color-scheme" content="dark" />
    <title>Privacy Policy — Jack Milka</title>
    <meta name="description" content="How the Upwork edition of Jack Milka’s portfolio handles personal data while you browse it." />
    <link rel="canonical" href="{BASE_URL}privacy-policy/" />
    <link rel="icon" href="../../milka-cv/assets/jm-favicon.svg" type="image/svg+xml" />
    <link rel="preload" href="../../milka-cv/assets/fonts/NotoSans-300.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="../../milka-cv/legal.css?v=20261031" />
  {CLARITY}
  </head>
  <body>
    <header class="legal-header">
      <a class="legal-brand" href="../">MLK.DESIGN</a>
      <nav class="legal-header__links" aria-label="Legal">
        <a class="legal-header__back" href="../">back to portfolio</a>
        <a href="./" aria-current="page">privacy</a>
      </nav>
    </header>

    <main class="legal-main" lang="en">
      <div class="legal-hero">
        <p class="legal-hero__label">privacy policy</p>
        <div class="legal-hero__body">
          <h1 class="legal-title">Privacy Policy</h1>
          <p class="legal-intro">This policy explains what personal data this portfolio receives while you browse it, why, who helps process it and what rights you have. It describes how this edition of the website actually works today.</p>
          <p class="legal-dates">Effective from {PRIVACY_DATE} · Last updated {PRIVACY_DATE}</p>
        </div>
      </div>

      <section class="legal-section" id="introduction">
        <p class="legal-section__index">01</p>
        <div class="legal-section__body">
          <h2>Introduction</h2>
          <p>This is the Upwork edition of the portfolio of Jack Milka (Yevhenii Milka), a UI/UX and digital product designer, at {BASE_URL}. It shows case studies and a CV for clients who found Jack on Upwork.</p>
          <p>The website has no contact form and no accounts. You cannot buy services, pay or sign contracts on it; all communication and work happen on Upwork.</p>
        </div>
      </section>

      <section class="legal-section" id="controller">
        <p class="legal-section__index">02</p>
        <div class="legal-section__body">
          <h2>Data Controller</h2>
          <dl class="legal-facts">
            <div><dt>Controller</dt><dd>Yevhenii Milka, Individual Entrepreneur (ФОП Мілка Євгеній Володимирович)</dd></div>
            <div><dt>Country of registration</dt><dd>Ukraine</dd></div>
            <div><dt>Privacy questions</dt><dd>Through Upwork messages, on the Upwork job or contract where you received the link to this portfolio</dd></div>
          </dl>
        </div>
      </section>

      <section class="legal-section" id="information">
        <p class="legal-section__index">03</p>
        <div class="legal-section__body">
          <h2>Information We Collect</h2>
          <h3>Technical data</h3>
          <p>When you open the website, our hosting provider (GitHub Pages) and the services that deliver the site’s JavaScript libraries (unpkg.com, esm.sh) receive your IP address and browser information, as any web server does. Opening the CV works the same way.</p>
          <h3>Visit statistics (Google Analytics)</h3>
          <p>Only after you click “accept” in the cookie banner, Google Analytics 4 records which pages you view, the device, browser and approximate location it derives from your connection, and clicks on a fixed set of elements: opening a case study, opening a project’s live site and opening the CV.</p>
          <h3>Visit statistics (Microsoft Clarity)</h3>
          <p>Microsoft Clarity records how visitors use the pages: clicks, scrolling and mouse movement, which it turns into heatmaps and session recordings, together with the pages viewed, the device, the browser and the approximate location it derives from your connection. Clarity does not wait for the cookie banner.</p>
          <p>We do not use advertising pixels or build advertising profiles.</p>
          <h3>Messages on Upwork</h3>
          <p>What you send through Upwork is processed by Upwork under its own privacy policy. This website does not receive it.</p>
        </div>
      </section>

      <section class="legal-section" id="use">
        <p class="legal-section__index">04</p>
        <div class="legal-section__body">
          <h2>How We Use Information</h2>
          <ul>
            <li>To understand which work and pages interest visitors (Google Analytics, only with your consent).</li>
            <li>To see how visitors use the site and fix what gets in their way (Microsoft Clarity).</li>
            <li>To keep the website secure and working.</li>
          </ul>
          <p>We do not use this data for marketing, and we do not sell or rent personal data.</p>
        </div>
      </section>

      <section class="legal-section" id="legal-basis">
        <p class="legal-section__index">05</p>
        <div class="legal-section__body">
          <h2>Legal Basis</h2>
          <p>We process personal data under the Law of Ukraine “On Personal Data Protection” and, where it applies to you, the EU General Data Protection Regulation (GDPR).</p>
          <table class="legal-table">
            <thead><tr><th>Purpose</th><th>Basis</th></tr></thead>
            <tbody>
              <tr><td>Hosting and security of the website</td><td>Legitimate interest in a safe, working website — GDPR Art. 6(1)(f)</td></tr>
              <tr><td>Visit statistics (Google Analytics)</td><td>Your consent, given in the cookie banner — GDPR Art. 6(1)(a); Art. 11 of the Ukrainian law. You can withdraw it at any time.</td></tr>
              <tr><td>Visit statistics (Microsoft Clarity)</td><td>Legitimate interest in understanding how the website is used and improving it — GDPR Art. 6(1)(f). You can object at any time or block the Clarity cookies in your browser.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="legal-section" id="third-parties">
        <p class="legal-section__index">06</p>
        <div class="legal-section__body">
          <h2>Third-Party Services</h2>
          <table class="legal-table">
            <thead><tr><th>Service</th><th>What it does</th><th>Data it receives</th></tr></thead>
            <tbody>
              <tr><td>GitHub Pages (GitHub, Inc., USA)</td><td>Hosts the website</td><td>IP address and browser data of every visitor; GitHub keeps visitor IP addresses in logs for security purposes</td></tr>
              <tr><td>unpkg.com, esm.sh</td><td>Deliver the open-source JavaScript libraries the site uses for animation and scrolling</td><td>IP address and browser data when the page loads</td></tr>
              <tr><td>Google Analytics 4 (Google)</td><td>Visit statistics, after you accept</td><td>A random visitor ID stored in cookies, pages viewed, device and browser data, approximate location, the fixed interaction events described above. Google signals and ad personalisation are switched off.</td></tr>
              <tr><td>Microsoft Clarity (Microsoft Corporation, USA)</td><td>Heatmaps and session recordings</td><td>Clicks, scrolling and mouse movement, pages viewed, device and browser data, approximate location derived from the IP address, a random visitor ID stored in cookies</td></tr>
            </tbody>
          </table>
          <p>Fonts are served from this website itself. There are no embedded videos, social widgets or CAPTCHA. Links to project sites, company pages and Behance only take you there when you click them.</p>
        </div>
      </section>

      <section class="legal-section" id="retention">
        <p class="legal-section__index">07</p>
        <div class="legal-section__body">
          <h2>Data Retention</h2>
          <ul>
            <li><strong>Hosting and delivery logs</strong> — kept by the providers listed above under their own retention rules.</li>
            <li><strong>Google Analytics</strong> — keeps event data for the retention period set in our account (2 months, the GA4 default), then deletes it.</li>
            <li><strong>Microsoft Clarity</strong> — keeps recordings and statistics for the retention periods Microsoft sets for the service, then deletes them.</li>
          </ul>
        </div>
      </section>

      <section class="legal-section" id="transfers">
        <p class="legal-section__index">08</p>
        <div class="legal-section__body">
          <h2>International Data Transfers</h2>
          <p>The controller is based in Ukraine. GitHub, Google and Microsoft process data in the United States and other countries. These providers state that they protect international transfers with the EU–U.S. Data Privacy Framework and/or the European Commission’s Standard Contractual Clauses. Ukraine does not currently have an EU adequacy decision.</p>
        </div>
      </section>

      <section class="legal-section" id="rights">
        <p class="legal-section__index">09</p>
        <div class="legal-section__body">
          <h2>Your Rights</h2>
          <p>Depending on the law that applies to you, you can ask us to:</p>
          <ul>
            <li>tell you whether we process your data and give you a copy (access);</li>
            <li>correct inaccurate or incomplete data;</li>
            <li>delete your data where there is no reason to keep it;</li>
            <li>restrict processing while a question about it is being resolved;</li>
            <li>stop processing based on our legitimate interest (objection);</li>
            <li>withdraw consent at any time, where processing is based on consent.</li>
          </ul>
          <p>Send your request through Upwork messages. We reply within one month and may ask you to confirm that the request comes from you. You can withdraw your analytics consent yourself at any time with the “cookie settings” link at the bottom of every page.</p>
          <p>You can also complain to a supervisory authority: in the EU/EEA, to the data protection authority of the country where you live or work; in Ukraine, to the Ukrainian Parliament Commissioner for Human Rights. You can also go to court.</p>
        </div>
      </section>

      <section class="legal-section" id="security">
        <p class="legal-section__index">10</p>
        <div class="legal-section__body">
          <h2>Security</h2>
          <p>The website is served only over HTTPS and does not ask you for any personal information. No method of transmitting or storing data is completely secure, so we cannot guarantee absolute security.</p>
        </div>
      </section>

      <section class="legal-section" id="cookies">
        <p class="legal-section__index">11</p>
        <div class="legal-section__body">
          <h2>Cookies &amp; Analytics</h2>
          <p>Google Analytics is off by default: until you click “accept”, the analytics script is not loaded and nothing is sent to Google. “decline” keeps it off and the site works the same. You can change or withdraw your choice at any time with the “cookie settings” link at the bottom of the page; withdrawing deletes the analytics cookies.</p>
          <p>Microsoft Clarity runs without waiting for the banner and can set the cookies below; Microsoft may also set its own cookies on its clarity.ms domain. You can block or delete them in your browser settings, and the site works the same without them.</p>
          <table class="legal-table">
            <thead><tr><th>Name</th><th>Purpose</th><th>Kept for</th></tr></thead>
            <tbody>
              <tr><td>_ga</td><td>Google Analytics: tells visits from different browsers apart (set only after you accept)</td><td>Up to 2 years</td></tr>
              <tr><td>_ga_4RJRW3679Y</td><td>Google Analytics: keeps the state of the current visit (set only after you accept)</td><td>Up to 2 years</td></tr>
              <tr><td>_clck</td><td>Microsoft Clarity: keeps the same random visitor ID across visits</td><td>Up to 1 year</td></tr>
              <tr><td>_clsk</td><td>Microsoft Clarity: joins the pages you view into one session</td><td>1 day</td></tr>
            </tbody>
          </table>
          <h3>Local storage</h3>
          <table class="legal-table">
            <thead><tr><th>Name</th><th>Purpose</th><th>Kept for</th></tr></thead>
            <tbody>
              <tr><td>jack-milka-cookie-preference</td><td>Remembers your analytics choice</td><td>Until you change it or clear your browser data</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="legal-section" id="contact">
        <p class="legal-section__index">12</p>
        <div class="legal-section__body">
          <h2>Questions &amp; Updates</h2>
          <p>For any question about your data, send a message through Upwork.</p>
          <p>We update this policy when the way the website works changes. The date at the top shows the latest version.</p>
          <p>Effective from {PRIVACY_DATE}. Last updated {PRIVACY_DATE}.</p>
        </div>
      </section>
    </main>

    <footer class="legal-footer">
      <a href="./">Privacy Policy</a>
      <a href="../">Back to the portfolio</a>
      <span class="legal-footer__copy">© 2026 Jack Milka</span>
    </footer>
  </body>
</html>
'''


def main():
    OUT.mkdir(exist_ok=True)
    outputs = {
        'index.html': build_index(),
        'case.html': build_case('case.html'),
        'pandawin.html': build_case('pandawin.html'),
        'app.js': build_app_js(),
        'case.js': build_case_js(),
        'privacy-policy/index.html': build_privacy(),
    }
    for name, text in outputs.items():
        for pattern in FORBIDDEN + (FORBIDDEN_MARKUP if name.endswith('.html') else []):
            hit = re.search(pattern, text)
            assert not hit, f'{name}: contact data left: {text[max(0, hit.start() - 60):hit.end() + 40]!r}'
        (OUT / name).parent.mkdir(parents=True, exist_ok=True)
        (OUT / name).write_text(text)
        print(f'upwork/{name}')


if __name__ == '__main__':
    main()
