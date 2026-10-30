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
    text = replace_once(text, '</head>', '  <style>.nav-menu .book { margin-left: auto; } a.case-start { text-decoration: none; }'
                        ' .case-info__copy.has-sequence:not(.is-sequence-visible) > a.case-start { opacity: 0; }</style>\n  </head>', label)

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
    # Behance galleries belong to the personal profile (PandaWin's stays: it is the project's public showcase);
    # Kowalski, Serenity and Azerux demos live in /milka-cv/.
    text, removed = re.subn(r"\n    visitUrl: 'https://www\.behance\.net/gallery/(?!257750803/)[^']*',", '', text)
    assert removed == 2, f'{label}: Behance visit links {removed}'
    text = replace_once(text, "visitUrl: 'Kowalski%20%26%20Partners/'", f"visitUrl: '{SHARED}Kowalski%20%26%20Partners/'", label)
    text = replace_once(text, "visitUrl: 'serenity/'", f"visitUrl: '{SHARED}serenity/'", label)
    text = replace_once(text, "visitUrl: 'azerux/'", f"visitUrl: '{SHARED}azerux/'", label)
    text = replace_once(text, "'https://mlkdesign.github.io/milka-cv/');", f"'{BASE_URL}');", label)
    text = replace_once(text, '"navContact": "contact me"', '"navContact": "view CV"', label)
    text = replace_once(text, '"startProject": "let\'s work together"', '"startProject": "view my CV"', label)
    text = replace_once(text, '"offerDescription": "Let’s build something just as strong for you."', '"offerDescription": "My CV covers experience, skills and selected work."', label)
    text = replace_once(text, '"finalButton": "get in touch"', '"finalButton": "view CV"', label)
    # Without a public site to show, drop the "visit this site" button instead of opening the image.
    text = replace_once(text, '  if (visitLink) visitLink.href = activeProject.visitUrl || activeProject.image;',
                        '  if (visitLink && activeProject.visitUrl) visitLink.href = activeProject.visitUrl;\n  else visitLink?.remove();', label)
    text = replace_once(text, "  const storedLanguage = localStorage.getItem(languagePreferenceKey);\n  if (storedLanguage === 'uk' || storedLanguage === 'en') {",
                        "  const storedLanguage = 'en'; // Upwork edition is English only.\n  if (storedLanguage === 'uk' || storedLanguage === 'en') {", label)
    text = drop_contact_strings(text, label)
    return '// Generated by tools/upwork/build.py from case.js — edit the source, then regenerate.\n' + text


def main():
    OUT.mkdir(exist_ok=True)
    outputs = {
        'index.html': build_index(),
        'case.html': build_case('case.html'),
        'pandawin.html': build_case('pandawin.html'),
        'app.js': build_app_js(),
        'case.js': build_case_js(),
    }
    for name, text in outputs.items():
        for pattern in FORBIDDEN + (FORBIDDEN_MARKUP if name.endswith('.html') else []):
            hit = re.search(pattern, text)
            assert not hit, f'{name}: contact data left: {text[max(0, hit.start() - 60):hit.end() + 40]!r}'
        (OUT / name).write_text(text)
        print(f'upwork/{name}')


if __name__ == '__main__':
    main()
