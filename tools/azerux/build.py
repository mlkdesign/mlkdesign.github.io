#!/usr/bin/env python3
"""Generate the static AZERUX site (Figma "AZERUX", dark theme) into azerux/.

Pages: home, six service pages (one template, copy in services.json), five DDoS protection pages
(one template built from the "Website DDoS Protection" frame), blog, article, privacy policy and terms of use.
Copy is taken from the Figma frames; legal texts are in legal.json.

Run from the repository root:  python3 tools/azerux/build.py
"""
import json
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'azerux'
DATA = Path(__file__).resolve().parent
SERVICES = json.loads((DATA / 'services.json').read_text())
LEGAL = json.loads((DATA / 'legal.json').read_text())

VERSION = '20261030-2'
CURRENT = ' aria-current="page"'

# Home card copy and image for every service (the cards on the home page link to the service pages).
SERVICE_CARDS = {
    'managed-security-services': ('These services offer 24/7 security monitoring and management to detect and respond to incidents. '
                                  'MSSP is becoming increasingly important as many companies seek external resources to manage their security.',
                                  'svc-managed'),
    'penetration-testing': ('Penetration testing, or “pentesting,” helps identify vulnerabilities in systems and applications by simulating '
                            'hacker attacks. This service is in demand for assessing the effectiveness of current security measures.',
                            'svc-pentest'),
    'employee-security-training': ('In light of the increasing number of attacks targeting people (e.g., phishing), training employees to '
                                   'recognize threats and follow best security practices is critically important for reducing risks.',
                                   'svc-training'),
    'identity-and-access-management': ('These solutions help control access to data and systems, which is critical for protecting sensitive '
                                       'information. This includes multi-factor authentication and access rights management.', 'svc-iam'),
    'cloud-security': ('With the increasing use of cloud technologies, services related to securing cloud resources and data are becoming '
                       'more relevant. This includes solutions for securing data and applications in the cloud.', 'svc-cloud'),
    'incident-response': ('These services quickly respond to cyberattacks, minimizing damage and restoring business operations.',
                          'svc-incident'),
}

# DDoS protection pages share the "Website DDoS Protection" layout; the hero copy comes from each page's frame.
# **text** marks the medium-weight words of the eyebrow line.
PROTECTION = [
    ('website', 'Website Protection', 'Free **CDN** • **No hidden** charges', 'Website Azerux Protection',
     'Swiftly Address Cyber Threats and Minimize Impact', 'lock'),
    ('network', 'Network Protection', 'Protection at **L3-L4** • **L7** OSI', 'Network DDoS Protection',
     'No charge for mitigated DDoS attacks', 'globe'),
    ('hosting', 'Hosting', 'DDoS protection • **Free CDN** • No traffic limits', 'DDoS Protected Hosting',
     'Save up to 20% by opting for 3/6/12 months billing period', 'svc-cloud'),
    ('vds-vps', 'VDS/VPS', 'DDoS protection • **KVM** • **99.95%+ SLA**', 'DDoS Protected VDS/VPS',
     'Rent and manage a KVM-based virtual dedicated server with 99.95%+ SLA availability, including DDoS protection against all known attacks',
     'svc-iam'),
    ('dedicated', 'Dedicated Server', 'DDoS protection • **Dedicated** hardware', 'DDoS Protected Dedicated Servers',
     'Rent a dedicated server with protection against all known DDoS attacks', 'svc-incident'),
]
MENU_PROTECTION = ['website', 'network', 'vds-vps', 'dedicated']

FAQ = [
    ('What is a DDoS attack?',
     'A DDoS (Distributed Denial of Service) attack floods a website, server or network with junk traffic from many sources at once, '
     'so that legitimate users can no longer reach it.'),
    ('What are the risks of DDoS attacks?',
     'DDoS-Guard mitigates the impact of malicious bots and spam of feedback forms, as well as reports vulnerabilities and threats from '
     'the OWASP Top-10 list. In our blog, you can find a <a href="{r}blog.html">list of the most popular threats</a> that DDoS-Guard helps '
     'protect from. In case of an attack of unknown type or large in volume, our engineers will ensure timely adaptation of the scrubbing '
     'system to minimize the malicious impact.'),
    ('What cyber threats do DDoS-Guard services protect from?',
     'Volumetric and protocol attacks at L3–L4, application-layer attacks at L7, malicious bots, spam of feedback forms and threats '
     'from the OWASP Top-10 list.'),
    ('How does the DDoS protection system work?',
     'We use Reverse Proxy technology with a DNS A record change: all traffic passes through our scrubbing network, malicious requests '
     'are filtered out, and only legitimate traffic reaches your protected IP and web server.'),
    ('How does DDoS-Guard provide high-quality services?',
     'A proprietary scrubbing network, interconnected Tier III data centers around the world, 24/7 monitoring by our engineers and '
     'detailed statistics on mitigated attacks in the Client Area.'),
]

TAGS = [
    ['Data Protection', 'Vulnerability Assessment', 'Access Control', 'DDoS Protection', 'Risk Management', 'Cyber Threats',
     'IT Security', 'Compliance Solutions', 'Server Security', 'Firewall Management'],
    ['Cybersecurity', 'MSSP', 'Penetration Testing', 'Security Training', 'IAM Solutions', 'Cloud Security', 'Incident Response',
     'Threat Management', 'Website Protection', 'Network Security'],
]

SOCIALS = [
    ('x', 'asgardcyber', 'https://x.com/'),
    ('instagram', 'instagram.com', 'https://instagram.com/'),
    ('reddit', 'cyberasgard', 'https://www.reddit.com/'),
    ('linkedin', 'cyberasgard', 'https://www.linkedin.com/'),
    ('mail', 'sales@azerux.com', 'mailto:sales@azerux.com'),
]

PARTNERS = ['casumo', 'coral', 'dunder', 'foxy', 'mrq', 'leovegas', 'ladbrokes', 'ladbrokes', 'betway', 'lotter']

TRUST = [('hackernoon', 'logo-hackernoon.webp', 'HackerNoon'), ('techbullion', 'logo-techbullion.webp', 'TechBullion'),
         ('analytics', 'logo-analytics.webp', 'Analytics Insight'), ('coinpedia', 'logo-coinpedia.svg', 'CoinPedia'),
         ('lacrypto', 'logo-lacrypto.svg', 'Cointribune')]
QUOTE = ('“We’ve been using their managed security services for over a year, and the level of protection and monitoring is '
         'top-notch. Their team is always responsive and proactive. Highly recommend them for anyone serious about cybersecurity”')

POST_TITLE = 'DDoS-Guard and FirstVDS: IP Transit and Network Security'
POST_TEXT = ('FirstVDS wanted to transfer client traffic that passes through the FirstVDS network to the secure network of DDoS-Guard '
             'with the help of our proprietary scrubbing equipment. As a result, we implemented IP Transit and Network')


def e(text):
    return escape(text, quote=True)


def strong(text):
    """**word** → medium-weight span (the design mixes light and medium weights in one line)."""
    return re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', e(text))


def arrow(r, dark=False):
    return f'<img src="{r}assets/{"arrow-dark" if dark else "arrow-white"}.svg" alt="" width="16" height="16" />'


def btn(r, label, href='#', cls='btn--blue', modal=False, dark_arrow=False, extra=''):
    data = ' data-modal' if modal else ''
    return f'<a class="btn {cls}" href="{href}"{data}{extra}><span>{e(label)}</span>{arrow(r, dark_arrow)}</a>'


def head(r, title, description):
    return f'''<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#121212" />
    <meta name="robots" content="noindex" />
    <title>{e(title)}</title>
    <meta name="description" content="{e(description)}" />
    <link rel="icon" href="{r}assets/logo-mark.svg" type="image/svg+xml" />
    <link rel="preload" href="{r}assets/fonts/ibm-plex-sans.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="{r}style.css?v={VERSION}" />
    <script>document.documentElement.classList.add('js');</script>
  </head>
  <body>
'''


def logo(r):
    return (f'<a class="logo" href="{r}index.html" aria-label="Azerux — home">'
            f'<img src="{r}assets/logo-mark.svg" alt="" width="38" height="40" /><span>Azerux</span></a>')


def service_links(r, cls=''):
    return '\n'.join(f'<a{cls} href="{r}services/{s["slug"]}.html">{e(s["name"])}</a>' for s in SERVICES)


def protection_links(r, cls=''):
    names = {slug: label for slug, label, *_ in PROTECTION}
    return '\n'.join(f'<a{cls} href="{r}protection/{slug}.html">{e(names[slug])}</a>' for slug in MENU_PROTECTION)


def header(r, active=None):
    def cur(key):
        return CURRENT if key == active else ''
    chevron = f'<img src="{r}assets/chevron.svg" alt="" width="16" height="16" />'
    return f'''    <header class="header">
      <div class="wrap header__inner">
        {logo(r)}
        <nav class="nav" aria-label="Main">
          <div class="nav__drop">
            <button class="nav__link" type="button" aria-expanded="false"{cur("services")}>Services {chevron}</button>
            <div class="nav__menu"><p>Services:</p>{service_links(r)}</div>
          </div>
          <div class="nav__drop">
            <button class="nav__link" type="button" aria-expanded="false"{cur("protection")}>Protection {chevron}</button>
            <div class="nav__menu"><p>Protection:</p>{protection_links(r)}</div>
          </div>
          <a class="nav__link" href="{r}index.html#achievements">About Us</a>
          <a class="nav__link" href="{r}index.html#faq">FAQ</a>
          <a class="nav__link" href="{r}blog.html"{cur("blog")}>Blog</a>
          <a class="nav__link" href="#contact">Contact us</a>
        </nav>
        <div class="header__tools">
          <a class="header__phone" href="tel:+380661234567"><img src="{r}assets/icon-phone.svg" alt="" width="10" height="10" /><span>+38 (066) 123-45-67</span></a>
          <span class="lang"><img src="{r}assets/flag-uk.svg" alt="" width="16" height="16" />Eng{chevron}</span>
          <span class="theme" aria-hidden="true"><img src="{r}assets/icon-moon.svg" alt="" width="16" height="16" /></span>
          <a class="btn btn--line btn--sm" href="#" data-modal>Sign in</a>
          <a class="btn btn--blue btn--sm" href="#" data-modal>Log in</a>
        </div>
        <a class="header__call" href="tel:+380661234567" aria-label="Call +38 (066) 123-45-67"><img src="{r}assets/icon-phone.svg" alt="" width="18" height="18" /></a>
        <button class="burger" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </header>
'''


def social_icon(r, kind, size=50):
    icons = {
        'x': f'<span class="soc soc--x"><img src="{r}assets/x-logo.svg" alt="" width="25" height="23" /></span>',
        'instagram': f'<span class="soc soc--ig"><img src="{r}assets/instagram-logo.svg" alt="" width="52" height="52" /></span>',
        'reddit': f'<img class="soc" src="{r}assets/reddit.svg" alt="" width="50" height="50" />',
        'linkedin': f'<img class="soc" src="{r}assets/linkedin.svg" alt="" width="50" height="50" />',
        'telegram': f'<span class="soc soc--tg"><img src="{r}assets/telegram.svg" alt="" width="16" height="16" /></span>',
        'mail': f'<span class="soc soc--mail"><img src="{r}assets/mail-white.svg" alt="" width="23" height="17" /></span>',
    }
    return icons[kind]


def contact_section(r):
    external = ' target="_blank" rel="noopener"'
    items = '\n'.join(f'          <a class="socials__item" href="{href}"{"" if href.startswith("mailto") else external}>'
                      f'{social_icon(r, kind)}<span>{e(label)}</span></a>' for kind, label, href in SOCIALS)
    return f'''    <section class="contact-us" id="contact">
      <div class="wrap">
        <h2 class="title">Contact us</h2>
        <p class="lead">Join our online community to learn more about our services, engage with experts, and stay informed about emerging threats and security trends.</p>
        <div class="socials">
{items}
        </div>
      </div>
    </section>
'''


def footer(r):
    partners = ''.join(f'<li><img src="{r}assets/p-{p}.svg" alt="{p.capitalize()}" loading="lazy" /></li>' for p in PARTNERS)
    follow = ''.join(f'<a href="{href}" target="_blank" rel="noopener" aria-label="{label}">{social_icon(r, kind)}</a>'
                     for kind, label, href in [('x', 'X', 'https://x.com/'), ('instagram', 'Instagram', 'https://instagram.com/'),
                                               ('telegram', 'Telegram', 'https://t.me/'), ('linkedin', 'LinkedIn', 'https://www.linkedin.com/')])
    return f'''    <section class="partners">
      <div class="wrap">
        <h2 class="title">Our partners</h2>
        <ul class="partners__logos">{partners}</ul>
      </div>
    </section>
  </main>
  <footer class="footer">
    <div class="wrap footer__grid">
      <div class="footer__brand">
        {logo(r)}
        <p>Ensuring consistent on-line avaibility to prevent customer loss.</p>
        <a href="mailto:sales@azerux.com"><img src="{r}assets/f-mail.svg" alt="" width="10" height="8" />sales@azerux.com</a>
        <a href="tel:+380661234567"><img src="{r}assets/f-phone.svg" alt="" width="10" height="10" />+38 (066) 123-45-67</a>
      </div>
      <nav class="footer__col" aria-label="Menu">
        <p>Menu:</p>
        <a href="{r}index.html#solutions">Products &amp; Solutions</a>
        <a href="{r}blog.html">Knowledge Base</a>
        <a href="{r}index.html#achievements">About Us</a>
        <a href="{r}blog.html">Blog</a>
        <a href="#contact">Contact us</a>
      </nav>
      <nav class="footer__col" aria-label="Services">
        <p>Services:</p>
        {service_links(r)}
      </nav>
      <nav class="footer__col" aria-label="DDoS Attack Protection">
        <p>DDoS Attack Protection:</p>
        {protection_links(r)}
      </nav>
      <div class="footer__help">
        <p>How we can help you?</p>
        <p class="footer__muted">Fill in the form and contact us today to secure your business and achieve peace of mind!</p>
        <form class="subscribe request">
          <input type="email" name="email" placeholder="Your e-mail" aria-label="Your e-mail" required />
          <button class="btn btn--blue" type="submit" aria-label="Send">{arrow(r)}</button>
        </form>
        <p>Follow us:</p>
        <div class="footer__follow">{follow}</div>
      </div>
    </div>
    <div class="footer__bottom">
      <div class="wrap">
        <span>©2024 azerux.com</span>
        <span class="footer__legal"><a href="{r}privacy-policy.html">Privacy Policy</a><a href="{r}terms-of-use.html">Terms of Use</a></span>
      </div>
    </div>
  </footer>
  <dialog class="modal" id="consult" aria-label="Get in touch with us">
    <button class="modal__close" type="button" data-modal-close aria-label="Close"></button>
{touch_card(r, form_id="consult-form", modal=True)}
  </dialog>
  <script src="{r}main.js?v={VERSION}" defer></script>
  </body>
</html>
'''


def tags_marquee(r):
    rows = []
    for i, row in enumerate(TAGS):
        items = ''.join(f'<li>{e(tag)}</li>' for tag in row)
        rows.append(f'<ul class="tags__row tags__row--{i + 1}">{items}{items}</ul>')
    return '<div class="tags" aria-hidden="true">' + ''.join(rows) + '</div>'


def touch_card(r, form_id='touch-form', modal=False):
    tag = 'div' if modal else 'section'
    attrs = '' if modal else ' id="get-in-touch"'
    return f'''    <{tag} class="touch"{attrs}>
      <div class="touch__art"><img class="touch__shadow" src="{r}assets/hacker-shadow.webp" alt="" loading="lazy" /><img class="touch__img" src="{r}assets/hacker.webp" alt="" width="614" height="564" loading="lazy" /></div>
      <div class="touch__body">
        <h2>Get in Touch with Us!</h2>
        <p>We're here to help! Whether you have questions about our services, need support, or want to discuss how we can assist with your security needs, don't hesitate to reach out. Fill out the form below or contact us directly, and one of our experts will get back to you as soon as possible.</p>
        <form class="touch__form request" id="{form_id}">
          <input type="text" name="name" placeholder="Your name" aria-label="Your name" required />
          <input type="tel" name="phone" placeholder="Phone number" aria-label="Phone number" />
          <input type="email" name="email" placeholder="E-mail" aria-label="E-mail" required />
          <button class="btn btn--blue" type="submit"><span>Get consult</span>{arrow(r)}</button>
          <label class="check"><input type="checkbox" checked required /><span></span>
            <em>By clicking <b>“Get consult”</b>, you agree to our <a href="{r}terms-of-use.html">Terms</a> and have read an acknowledge the <a href="{r}privacy-policy.html">Global Privacy Statement</a>.</em></label>
        </form>
      </div>
      {tags_marquee(r)}
      <p class="touch__note">We look forward to connecting with you!</p>
    </{tag}>
'''


def faq(r, narrow=False):
    items = []
    for i, (q, a) in enumerate(FAQ):
        on = i == 1
        items.append(f'''          <div class="faq__item{" is-open" if on else ""}">
            <button class="faq__q" type="button" aria-expanded="{str(on).lower()}" aria-controls="faq-a{i}"><span>{e(q)}</span><i></i></button>
            <div class="faq__a" id="faq-a{i}" role="region"><h3>{e(q)}</h3><p>{a.format(r=r)}</p>{btn(r, "Get consult", modal=True)}</div>
          </div>''')
    return f'''    <section class="faq{" faq--narrow" if narrow else ""}" id="faq">
      <div class="wrap">
        <h2 class="title">Frequently Asked Questions</h2>
        <div class="faq__box">
          <div class="faq__list">
{chr(10).join(items)}
          </div>
        </div>
      </div>
    </section>
'''


def benefits(r, items, title='Benefits'):
    def card(icon, name, text, side):
        return (f'<article class="benefit benefit--{side}"><img src="{r}assets/{icon}" alt="" width="40" height="40" />'
                f'<div><h3>{e(name)}</h3><p>{e(text)}</p></div></article>')
    left = ''.join(card(*item, 'left') for item in items[:3])
    right = ''.join(card(*item, 'right') for item in items[3:])
    return f'''    <section class="benefits">
      <div class="wrap">
        <h2 class="title">{e(title)}</h2>
        <div class="benefits__grid">
          <div class="benefits__col">{left}</div>
          <img class="benefits__logo" src="{r}assets/logo-3d.webp" alt="" width="771" height="800" loading="lazy" />
          <div class="benefits__col">{right}</div>
        </div>
      </div>
    </section>
'''


def post_meta(r):
    return (f'<ul class="meta"><li><img src="{r}assets/icon-date.svg" alt="" width="10" height="10" />03.11.2024</li>'
            f'<li><img src="{r}assets/icon-clock.svg" alt="" width="10" height="10" />15:36</li>'
            f'<li><img src="{r}assets/icon-views.svg" alt="" width="10" height="10" />356</li></ul>')


def post_card(r, cls='post', image='blog-photo.webp', more=True):
    link = btn(r, 'Learn more', f'{r}article.html', 'btn--line') if more else ''
    return (f'<article class="{cls}"><a class="post__img" href="{r}article.html" tabindex="-1"><img src="{r}assets/{image}" alt="" loading="lazy" /></a>'
            f'<div class="post__body">{post_meta(r)}<h3><a href="{r}article.html">{e(POST_TITLE)}</a></h3><p>{e(POST_TEXT)}</p>{link}</div></article>')


def write(path, html):
    target = OUT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html)
    return path


# ---------------------------------------------------------------------------
# Home
# ---------------------------------------------------------------------------
def solution_card(r, href, title, text, image, badge=False):
    new = '<span class="badge">new</span>' if badge else ''
    return f'''          <a class="solution" href="{href}">
            <img class="solution__bg" src="{r}assets/card-bg.webp" alt="" loading="lazy" />
            <h3>{e(title)}</h3>{new}
            <p>{e(text)}</p>
            <span class="btn btn--line solution__more"><span>Learn more</span>{arrow(r)}</span>
            <img class="solution__img" src="{r}assets/{image}.webp" alt="" loading="lazy" />
          </a>'''


HOME_BENEFITS = [
    ('icon-shield.svg', 'Protection from Attacks', 'Mitigating large-scale attacks on network infrastructure and targeted attacks on applications'),
    ('b-scrub.svg', 'Proprietary Scrubbing Network', 'DDoS-Guard traffic scrubbing network keeps network equipment, servers, and connections from being overloaded'),
    ('icon-datacenters.svg', 'Interconnected Data Centers', 'Highly-available and secure Tier III data centers around the world'),
    ('icon-no-charges.svg', 'No Hidden Charges', 'Pay only for the selected service plan, as the final charge doesn’t depend on the size or amount of attacks'),
    ('icon-loadbal.svg', 'Content Delivery Network', 'Accelerating the load of client sites and optimizing web servers by distributing content worldwide'),
    ('b-analytics.svg', 'Analytics and Reports', 'Complete statistics and detailed information on mitigated attacks in the Client Area'),
]


def build_home():
    r = ''
    services = '\n'.join(solution_card(r, f'services/{s["slug"]}.html', s['name'], *SERVICE_CARDS[s['slug']], badge=i == 0)
                         for i, s in enumerate(SERVICES))
    protection = '\n'.join(solution_card(r, f'protection/{slug}.html', label, sub, image)
                           for slug, label, _, _, sub, image in PROTECTION)
    trust = '\n'.join(f'''          <article class="trust-card">
            <img class="trust-card__logo" src="assets/{img}" alt="{e(name)}" loading="lazy" />
            <p>{e(QUOTE)}</p>
            {btn(r, "Read article", "blog.html", "btn--ghost")}
          </article>''' for _, img, name in TRUST)
    html = head(r, 'Azerux — Reliable protection against DDoS attacks',
                'Azerux provides managed security services, penetration testing and DDoS protection for websites, networks and servers.')
    html += header(r)
    html += f'''  <main>
    <section class="hero">
      <img class="hero__lines" src="assets/hero-lines.svg" alt="" />
      <img class="hero__word" src="assets/hero-wordmark.svg" alt="" />
      <img class="hero__blob hero__blob--1" src="assets/logo-3d.webp" alt="" />
      <img class="hero__blob hero__blob--2" src="assets/logo-3d.webp" alt="" />
      <img class="hero__logo" src="assets/logo-3d.webp" alt="" width="821" height="871" fetchpriority="high" />
      <div class="wrap hero__inner">
        <div class="slider-nav hero__nav" aria-hidden="true"><img src="assets/arrow-left.svg" alt="" width="24" height="24" /><span><i></i></span><img src="assets/arrow-right.svg" alt="" width="24" height="24" /></div>
        <p class="hero__tagline">Ensuring consistent on-line avaibility to prevent customer loss</p>
        <h1 class="hero__title">Reliable <b>protection</b> against DDoS <b>attacks</b></h1>
        {btn(r, "Join us", "#", modal=True)}
      </div>
    </section>

    <section class="solutions" id="solutions">
      <div class="wrap">
        <p class="eyebrow">our <b>Solutions</b></p>
        <h2 class="title">At Cyber Asgard, we provide a full range of <b>cybersecurity services</b></h2>
        <p class="lead">Our expert team ensures your systems, data, and infrastructure remain secure, allowing you to focus on growth and innovation with peace of mind.</p>
        <div class="switch" role="tablist" aria-label="Solutions">
          <button class="switch__btn is-active" type="button" role="tab" aria-selected="true" aria-controls="tab-services" id="tab-services-btn">Services</button>
          <button class="switch__btn" type="button" role="tab" aria-selected="false" aria-controls="tab-protection" id="tab-protection-btn">DDoS Attack Protection</button>
        </div>
        <div class="solutions__grid" id="tab-services" role="tabpanel" aria-labelledby="tab-services-btn">
{services}
        </div>
        <div class="solutions__grid solutions__grid--five" id="tab-protection" role="tabpanel" aria-labelledby="tab-protection-btn" hidden>
{protection}
        </div>
        <button class="btn btn--line solutions__all" type="button"><span>See all</span><img src="assets/chevron-2.svg" alt="" width="16" height="16" /></button>
      </div>
    </section>

    <section class="achievements" id="achievements">
      <img class="achievements__lines" src="assets/achieve-lines.svg" alt="" loading="lazy" />
      <div class="wrap">
        <p class="eyebrow">our <b>Achievements</b></p>
        <h2 class="title">We know how to <b>keep you safe</b></h2>
        <div class="stats">
          <div class="stat"><strong>1550+</strong><span>Successful investigations</span></div>
          <div class="stat stat--big"><strong>$ 1 000 000</strong><span>Saved for companies</span><img src="assets/achieve-wave-1.svg" alt="" loading="lazy" /><img src="assets/achieve-wave-2.svg" alt="" loading="lazy" /></div>
          <div class="stat"><strong>600+</strong><span>Enterprise customers</span></div>
          <div class="stat"><strong>60</strong><span>Countries</span></div>
          <div class="stat"><strong>1550+</strong><span>Successful investigations</span></div>
          <div class="stat stat--wide"><strong>7</strong><span>Unique Digital Crime Resistance Centers</span></div>
        </div>
      </div>
    </section>

{faq(r)}
{benefits(r, HOME_BENEFITS)}
    <section class="trust">
      <div class="wrap">
        <h2 class="title">Companies that trust us</h2>
        <div class="trust__track" tabindex="0" aria-label="Companies that trust us">
{trust}
        </div>
        <div class="slider-nav trust__nav">
          <button class="trust__prev" type="button" aria-label="Previous" disabled><img src="assets/arrow-left.svg" alt="" width="24" height="24" /></button>
          <span><i></i></span>
          <button class="trust__next" type="button" aria-label="Next"><img src="assets/arrow-right.svg" alt="" width="24" height="24" /></button>
        </div>
      </div>
    </section>

    <div class="wrap">
{touch_card(r)}
    </div>

    <section class="latest">
      <div class="wrap">
        <h2 class="title">Our latest blog</h2>
        <div class="latest__grid">
          {post_card(r, 'post post--big', 'blog-template.webp')}
          <div class="latest__list">
            {post_card(r, 'post post--row', 'blog-template.webp', more=False)}
            {post_card(r, 'post post--row', 'blog-template.webp', more=False)}
            {post_card(r, 'post post--row', 'blog-template.webp', more=False)}
          </div>
        </div>
        {btn(r, "View blog", "blog.html", "btn--blue latest__all")}
      </div>
    </section>

{contact_section(r)}'''
    html += footer(r)
    return write('index.html', html)


# ---------------------------------------------------------------------------
# Inner pages
# ---------------------------------------------------------------------------
def page_hero(r, eyebrow, title, subtitle, button, image, href='#', modal=True):
    sub = f'<p class="page-hero__sub">{e(subtitle)}</p>' if subtitle else ''
    return f'''    <section class="page-hero">
      <img class="page-hero__word" src="{r}assets/hero-wordmark.svg" alt="" />
      <div class="page-hero__art">
        <img class="page-hero__img page-hero__img--sm" src="{r}assets/{image}.webp" alt="" />
        <img class="page-hero__img page-hero__img--main" src="{r}assets/{image}.webp" alt="" fetchpriority="high" />
        <img class="page-hero__img page-hero__img--xs" src="{r}assets/{image}.webp" alt="" />
      </div>
      <div class="wrap wrap--narrow page-hero__inner">
        <p class="page-hero__eyebrow">{strong(eyebrow)}</p>
        <h1>{e(title)}</h1>
        {sub}
        {btn(r, button, href, modal=modal)}
      </div>
    </section>
'''


def cta_band(r, title, text):
    return f'''    <section class="cta">
      <div class="wrap wrap--narrow cta__inner">
        <h2>{e(title)}</h2>
        <p>{e(text)}</p>
        {btn(r, "Join us", "#", "btn--white", modal=True, dark_arrow=True)}
      </div>
      <img class="cta__img" src="{r}assets/hacker.webp" alt="" loading="lazy" />
    </section>
'''


def tags_band(r):
    return f'    <section class="tags-band">{tags_marquee(r)}</section>\n'


def build_service(s):
    r = '../'
    text, image = SERVICE_CARDS[s['slug']]
    cards = []
    for i, c in enumerate(s['cards']):
        side = 'left' if i < 3 else 'right'
        cards.append(f'<article class="why-card why-card--{side}"><img src="{r}assets/icons/{c["icon"]}.svg" alt="" width="50" height="50" />'
                     f'<div><h3>{e(c["title"])}</h3><p>{e(c["text"])}</p></div></article>')
    features = ''.join(f'<li><b>{e(f["label"])}:</b> {e(f.get("text", ""))}</li>' for f in s['features'])
    html = head(r, f'{s["name"]} — Azerux', s['subtitle'])
    html += header(r, 'services')
    html += f'''  <main>
{page_hero(r, s["eyebrow"].replace("Free CDN", "Free **CDN**").replace("No hidden", "**No hidden**"), s["name"], s["subtitle"], "Join us", "lock")}
    <section class="service">
      <div class="wrap wrap--narrow">
        <p class="service__intro">{e(s["intro"])}</p>
        <h2 class="service__h">{e(s["why"])}</h2>
        <div class="why-grid">
          <div class="why-grid__col">{"".join(cards[:3])}</div>
          <div class="why-grid__col">{"".join(cards[3:])}</div>
        </div>
        <div class="features">
          <img class="features__img" src="{r}assets/logo-3d.webp" alt="" loading="lazy" />
          <div>
            <h2 class="service__h">{e(s["features_title"])}</h2>
            <ul class="features__list">{features}</ul>
          </div>
        </div>
        <div class="closing">
          <h2>{e(s["closing_title"])}</h2>
          <p>{e(s["closing"])}</p>
          <img class="closing__img" src="{r}assets/{image}.webp" alt="" loading="lazy" />
        </div>
      </div>
    </section>
{tags_band(r)}{faq(r, narrow=True)}{cta_band(r, s["cta_title"], s["cta"])}{contact_section(r)}'''
    html += footer(r)
    return write(f'services/{s["slug"]}.html', html)


PLANS = [
    ('Basic', '', [('1 domain ', 'under protection'), ('Support response time ', 'up to 6 hours'), ('Block/Allow lists ', 'up to 3 rules each')],
     'Key advantages:', ['Geo-blocking', 'Free SSL certificate']),
    ('Normal', 'top', [('1 domain ', 'under protection'), ('Support response time ', 'up to 40 minutes'), ('Block/Allow lists ', 'up to 5 rules each')],
     None, ['Dedicated IP-address', 'Custom SSL certificate']),
    ('Medium', 'white', [('1 domain ', 'under protection'), ('Support response time ', 'up to 30 minutes'), ('Block/Allow lists ', 'up to 15 rules each')],
     None, ['L7 attacks reports', 'Load balancing up to 5 servers']),
    ('Premium', 'blue', [('1 domain ', 'under protection'), ('Support response time ', 'up to 15 minutes'), ('Block/Allow lists ', 'up to 50 rules each')],
     None, ['Traffic Corrector System', 'Incident alerts']),
    ('Enterprise', 'orange', [('1 domain ', 'under protection'), ('Support response time ', 'up to 10 minutes'), ('Block/Allow lists ', 'up to 100 rules each')],
     None, ['OWASP TOP-10 protection', 'Bot Mitigation, WAF activation']),
]
PERIODS = [('monthly', 'Monthly', 0), ('quarterly', 'Quarterly', 5), ('semi-annually', 'Semi-annualy', 10), ('annually', 'Annualy', 15)]

DDOS_BENEFITS = [
    ('b-dns.svg', 'DNS Hosting', 'Our customers have free access to DNS hosting management'),
    ('b-scrub.svg', 'Traffic Scrubbing', 'Manage and create unique protection rules for traffic scrubbing'),
    ('b-noip.svg', 'No IP Blocking', 'L7 protection right from the first request and without IP blocking'),
    ('b-analytics.svg', 'Analytics and Reports', 'Complete statistics and detailed information on mitigated attacks in the Client Area'),
    ('icon-loadbal.svg', 'Load Balancing', 'Distributing your traffic among multiple DDoS‑Guard web servers to reduce the load'),
    ('b-ssl.svg', 'SSL Certificates', 'Use free Let’s Encrypt certificates or upload a custom one'),
]


def plan_card(r, name, variant, rows, extra_title, extras):
    check = f'<img src="{r}assets/check-blue.svg" alt="" width="16" height="16" />'
    items = ''.join(f'<li>{check}<span>{e(a)}<b>{e(b)}</b></span></li>' for a, b in rows)
    extra = ''.join(f'<li>{check}<span>{e(x)}</span></li>' for x in extras)
    head_title = e(extra_title) if extra_title else 'All <b>Basic</b> features +'
    top = '<span class="plan__top">Top</span>' if variant == 'top' else ''
    deco = ''
    if variant == 'blue':
        deco = f'<img class="plan__deco" src="{r}assets/plan-premium-deco.svg" alt="" />'
    elif variant == 'orange':
        deco = f'<img class="plan__deco" src="{r}assets/plan-enterprise-deco.svg" alt="" />'
    return f'''          <article class="plan plan--{variant or "basic"}">{top}
            <div class="plan__price">{deco}<span>{e(name)}</span><strong data-base="100">$ 100</strong><small class="plan__period">Monthly</small></div>
            <ul class="plan__list">{items}</ul>
            <div class="plan__extra"><p>{head_title}</p><ul>{extra}</ul></div>
            {btn(r, "Activate", "#", modal=True)}
          </article>'''


def build_protection(slug, label, eyebrow, title, subtitle, image):
    r = '../'
    periods = ''.join(
        f'<button class="periods__btn{" is-active" if i == 0 else ""}" type="button" aria-pressed="{str(i == 0).lower()}" data-discount="{d}" data-label="{e(name)}">'
        f'{e(name)}{f"<i>–{d}%</i>" if d else ""}</button>' for i, (_, name, d) in enumerate(PERIODS))
    plans = '\n'.join(plan_card(r, *p) for p in PLANS)
    html = head(r, f'{title} — Azerux', subtitle)
    html += header(r, 'protection')
    html += f'''  <main>
{page_hero(r, eyebrow, title, subtitle, "Choose plan", image, "#plans", modal=False)}
    <section class="why-use">
      <div class="wrap wrap--narrow">
        <h2 class="title">Why Use Azerux Protection</h2>
        <div class="why-use__grid">
          <h3 class="why-use__label"><img src="{r}assets/icon-shield.svg" alt="" width="25" height="30" />Website protection</h3>
          <h3 class="why-use__label"><img src="{r}assets/icon-shield.svg" alt="" width="25" height="30" />Website protection <span>+ CDN</span></h3>
          <article class="problem">
            <h4>Inaccessible site</h4><p>Because of DDoS attacks, the site stops functioning, which leads to customers and profit loss.</p>
            <h4>Solution is DDoS-Guard protection</h4><p>DDoS-Guard L7 protection system stops all known types of attacks. Your IP address and server location will be hidden from attackers.</p>
            <img class="problem__img" src="{r}assets/svc-incident.webp" alt="" loading="lazy" />
          </article>
          <article class="problem">
            <h4>Slow loading</h4><p>One of the key indicators of a website performance is its load speed. Slow websites have a higher bounce rate.</p>
            <h4>Solution is DDoS-Guard protection</h4><p>CDN speeds up website loading with optimising and caching. Up to 91% of content is downloaded by users from the cache on our server.</p>
            <img class="problem__img problem__img--globe" src="{r}assets/globe.webp" alt="" loading="lazy" />
          </article>
        </div>
      </div>
    </section>

    <section class="plans" id="plans">
      <div class="wrap">
        <h2 class="title">Service Plans</h2>
        <p class="lead">Price is fixed — it won't change based on the number or strength of DDoS attacks</p>
        <div class="periods" role="group" aria-label="Billing period">{periods}</div>
        <div class="plans__grid">
{plans}
        </div>
        <div class="trial">
          <div><h2>3-day trial for everyone</h2><p>Try the Basic protection for free right now — no calls, emails, or approvals needed</p></div>
          {btn(r, "Try for free", "#", "btn--white", modal=True, dark_arrow=True)}
        </div>
      </div>
    </section>

{benefits(r, DDOS_BENEFITS)}
    <section class="how">
      <div class="wrap">
        <h2 class="title">How Azerux Protection Works</h2>
        <p class="lead">Our company uses the Reverse Proxy technology with DNS A records change</p>
        <p class="how__label">DDoS-Guard Protection</p>
        <div class="toggle" aria-hidden="true"><span class="is-active">On</span><span>Off</span></div>
        <div class="how__diagram"><img src="{r}assets/how-diagram.webp" width="1600" height="349" loading="lazy"
          alt="Legitimate bots and users reach the web server through the Internet and the protected IP; traffic from attacking bots is stopped before the protected IP." /></div>
      </div>
    </section>
{tags_band(r)}{faq(r, narrow=True)}{cta_band(r, "Get Started Today!", "Activate the website DDoS protection or use the 3-day trial to try it out")}{contact_section(r)}'''
    html += footer(r)
    return write(f'protection/{slug}.html', html)


def build_blog():
    r = ''
    chips = ''.join(f'<button class="chip{" is-active" if name == "Protection" else ""}" type="button" aria-pressed="{str(name == "Protection").lower()}">{name}</button>'
                    for name in ['News', 'Security', 'Case studies', 'Protection', 'Infrastructure'])
    posts = '\n'.join(f'          {post_card(r)}' for _ in range(6))
    html = head(r, 'Blog — Azerux', 'News, case studies and articles about cybersecurity and DDoS protection from Azerux.')
    html += header(r, 'blog')
    html += f'''  <main class="page">
    <section class="blog">
      <div class="wrap wrap--blog">
        <h1 class="title">Our latest blog</h1>
        <div class="blog__bar">
          <div class="chips">{chips}</div>
          <div class="blog__tools">
            <label class="search"><input type="search" placeholder="Search" aria-label="Search" /><img src="assets/b-analytics.svg" alt="" width="16" height="16" /></label>
            <label class="sort">Sort: <select aria-label="Sort"><option>Last on top</option><option>First on top</option></select></label>
            <button class="blog__view" type="button" aria-pressed="false" aria-label="Show as a list"><i></i><i></i><i></i><i></i></button>
          </div>
        </div>
        <div class="blog__grid">
{posts}
        </div>
        <nav class="pager" aria-label="Pages">
          <a href="#" aria-label="Previous page">‹</a><a href="#" aria-current="page">1</a><a href="#">2</a><a href="#">3</a><a href="#" aria-label="Next page">›</a>
        </nav>
      </div>
    </section>
{contact_section(r)}'''
    html += footer(r)
    return write('blog.html', html)


def build_article():
    r = ''
    related = ''.join(post_card(r, 'post post--small') for _ in range(3))
    html = head(r, 'We’re Launching! — Azerux', 'Azerux launches comprehensive protection from cyber threats for businesses of any size.')
    html += header(r, 'blog')
    html += f'''  <main class="page">
    <article class="article">
      <div class="wrap wrap--narrow">
        <div class="article__top">
          <a class="btn btn--line btn--back" href="blog.html"><img src="assets/arrow-white.svg" alt="" width="16" height="16" /><span>Back</span></a>
          {post_meta(r)}
        </div>
        <h1>We’re Launching!</h1>
        <p>Today, cybersecurity is not just a necessity—it’s the foundation for business success. We’re excited to announce the launch of our company, specializing in comprehensive protection from cyber threats. Our solutions cover all areas of security: from network monitoring and threat detection to risk management and employee training.</p>
        <img class="article__banner" src="assets/article-banner.webp" width="1280" height="500" alt="We’re launching! Cybersecurity, MSSP, cloud security, DDoS protection, penetration testing and security training." />
        <p>Our approach combines the latest technologies, rapid response, and tailored solutions for businesses of any size.</p>
        <h2>We offer a broad range of services, including:</h2>
        <ol>
          <li>Security Audits and Risk Assessments</li>
          <li>Cloud Security and Network Management</li>
          <li>Threat Detection and Mitigation</li>
          <li>Employee Cyber Hygiene Training</li>
        </ol>
        <p>We are ready to be your reliable partner in cybersecurity so you can focus on growing your business without fear of cyber threats.</p>
        <h2>Conclusion</h2>
        <p>As cyber threats continue to evolve, the importance of robust network security and reliable IP transit solutions cannot be overstated. DDoS-Guard and FirstVDS are well-positioned to help businesses navigate these challenges, offering complementary services that enhance security and performance. By investing in these solutions, companies can protect their digital assets and ensure business continuity in an increasingly hostile online environment.</p>
        <p>In today’s digital landscape, where cyber threats are becoming increasingly prevalent and sophisticated, the need for reliable network infrastructure protection and quality IP transit solutions is critical for many businesses. DDoS-Guard and FirstVDS are two companies that offer services in the realms of network security and IP transit, ensuring business reliability and resilience amidst growing threats.</p>
      </div>
    </article>
    <section class="related">
      <div class="wrap wrap--narrow">
        <h2 class="title">You may be interested</h2>
        <div class="related__grid">{related}</div>
        <a class="btn btn--blue btn--back related__back" href="blog.html"><img src="assets/arrow-white.svg" alt="" width="16" height="16" /><span>Back to blog</span></a>
      </div>
    </section>
{contact_section(r)}'''
    html += footer(r)
    return write('article.html', html)


def legal_page(path, title, blocks):
    r = ''
    body = []
    open_list = None
    for b in blocks:
        kind, text = next(iter(b.items()))
        tag = {'li': 'ul', 'ol': 'ol'}.get(kind)
        if open_list and tag != open_list:
            body.append(f'</{open_list}>')
            open_list = None
        if tag and not open_list:
            body.append(f'<{tag}>')
            open_list = tag
        if kind == 'h':
            body.append(f'<h2>{e(text)}</h2>')
        elif tag:
            body.append(f'<li>{e(text)}</li>')
        else:
            body.append(f'<p>{e(text)}</p>')
    if open_list:
        body.append(f'</{open_list}>')
    html = head(r, f'{title} — Azerux', f'{title} of the Azerux website.')
    html += header(r)
    html += f'''  <main class="page">
    <article class="legal">
      <div class="wrap wrap--narrow">
        <h1 class="title">{e(title)}</h1>
        {"".join(body)}
      </div>
    </article>
{contact_section(r)}'''
    html += footer(r)
    return write(path, html)


def main():
    written = [build_home()]
    written += [build_service(s) for s in SERVICES]
    written += [build_protection(*p) for p in PROTECTION]
    written += [build_blog(), build_article(),
                legal_page('privacy-policy.html', 'Privacy Policy', LEGAL['privacy']),
                legal_page('terms-of-use.html', 'Terms of Use', LEGAL['terms'])]
    print(f'{len(written)} pages written to azerux/')


if __name__ == '__main__':
    main()
