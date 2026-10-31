#!/usr/bin/env python3
"""Generate the static Serenity Consultancy Services site (Figma "Consulting") into serenity/.

English translation of the design copy; layout and assets follow the Figma frames.
Pages: home, 9 service pages (one template), contract support, relocation, ready-made companies,
two articles and one country template rendered for every jurisdiction listed on the home page.

Run from the repository root:  python3 tools/serenity/build.py
"""
import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'serenity'

# ---------------------------------------------------------------------------
# Navigation and shared copy
# ---------------------------------------------------------------------------
NAV = [
    ('about', 'About us', 'index.html#about'),
    ('relocation', 'Relocation', 'relocation.html'),
    ('companies', 'Turnkey companies', 'ready-made-companies.html'),
    ('map', 'Registration map', 'index.html#registration'),
    ('articles', 'Articles', 'index.html#articles'),
    ('services', 'Solutions and services', 'services/company-registration.html'),
]

SERVICES = [
    ('company-registration', 'Company registration'),
    ('corporate-tax-planning', 'Corporate and tax planning'),
    ('legal-consulting', 'General legal consulting'),
    ('crypto-licensing', 'Crypto licensing and individual projects'),
    ('betting-gambling', 'Betting and gambling solutions'),
    ('bank-accounts', 'Opening accounts'),
    ('trademark-registration', 'Trademark registration'),
    ('fintech', 'Fintech'),
    ('foreign-trade', 'Foreign trade support'),
]

# (slug, name, hero image or None). Order follows the four columns on the home page.
COUNTRIES = [
    [('england', 'England', 'england'), ('scotland', 'Scotland', 'scotland'), ('ireland', 'Ireland', 'ireland'),
     ('saint-vincent', 'SVG (Saint Vincent and the Grenadines)', 'saint-vincent'), ('uae', 'UAE', 'uae'),
     ('turkey', 'Turkey', 'turkey'), ('hungary', 'Hungary', 'hungary'), ('netherlands', 'Netherlands', 'netherlands'),
     ('armenia', 'Armenia', 'armenia'), ('ukraine', 'Ukraine', None)],
    [('georgia', 'Georgia', 'georgia'), ('russia', 'Russia', None), ('kazakhstan', 'Kazakhstan', 'kazakhstan'),
     ('lithuania', 'Lithuania', 'lithuania'), ('latvia', 'Latvia', 'latvia'), ('estonia', 'Estonia', 'estonia'),
     ('kyrgyzstan', 'Kyrgyzstan', 'kyrgyzstan'), ('italy', 'Italy', 'italy'), ('egypt', 'Egypt', None), ('china', 'China', 'china')],
    [('hong-kong', 'Hong Kong', 'hong-kong'), ('australia', 'Australia', 'australia'), ('singapore', 'Singapore', None),
     ('mauritius', 'Mauritius', 'mauritius'), ('portugal', 'Portugal', 'portugal'), ('chile', 'Chile', None),
     ('colombia', 'Colombia', 'colombia'), ('usa', 'USA', None), ('norway', 'Norway', None), ('belize', 'Belize', 'belize')],
    [('curacao', 'Curaçao', 'curacao'), ('gibraltar', 'Gibraltar', 'gibraltar'), ('malta', 'Malta', 'malta'),
     ('nevis', 'Nevis', None), ('seychelles', 'Seychelles', 'seychelles'), ('bulgaria', 'Bulgaria', 'bulgaria'),
     ('denmark', 'Denmark', None), ('macedonia', 'Macedonia', None), ('cyprus', 'Cyprus', 'cyprus'), ('malaysia', 'Malaysia', None)],
]
# Map dots carry the Russian layer names from Figma; tools/serenity/map-dots.json holds their positions (% of the map).
MAP_DOTS = json.loads((Path(__file__).with_name('map-dots.json')).read_text())
DOT_SLUGS = {
    'США': 'usa', 'Нидерланды': 'netherlands', 'Россия': 'russia', 'Латвия': 'latvia', 'Эстония': 'estonia', 'Литва': 'lithuania',
    'Дания': 'denmark', 'Казахстан': 'kazakhstan', 'Киргизия': 'kyrgyzstan', 'Австралия': 'australia', 'Китай': 'china',
    'Гонконг': 'hong-kong', 'Сингапур': 'singapore', 'Малайзия': 'malaysia', 'Маврикий': 'mauritius', 'Сейшелы': 'seychelles',
    'ОАЭ': 'uae', 'Турция': 'turkey', 'Кипр': 'cyprus', 'Болгария': 'bulgaria', 'Македония': 'macedonia', 'Италия': 'italy',
    'Мальта': 'malta', 'Португалия': 'portugal', 'Гибраалтар': 'gibraltar', 'Египет': 'egypt', 'Армения': 'armenia',
    'Грузия': 'georgia', 'Венгрия': 'hungary', 'Англия': 'england', 'Ирландия': 'ireland', 'Шотландия': 'scotland',
    'Норвегия': 'norway', 'СВГСентВинсентиГренадины': 'saint-vincent', 'Белиз': 'belize', 'Чили': 'chile',
    'Колумбия': 'colombia', 'Кюрасао': 'curacao', 'Невис': 'nevis', 'Украина': 'ukraine',
}

# Short form used inside sentences ("register a company in …").
IN_NAME = {'saint-vincent': 'Saint Vincent and the Grenadines', 'uae': 'the UAE', 'usa': 'the USA', 'netherlands': 'the Netherlands'}

ARTICLE_CARDS = [
    ('articles/cyprus-levy-fee.html', 'article-1.webp', 'article-card__img--cliff', 'What is the levy fee in Cyprus?',
     'Owners of Cypriot companies must pay the levy fee in Cyprus every year. Because of this, at the beginning of every summer we receive many questions about what it is and how to pay it.'),
    ('articles/multipass.html', 'article-2.webp', '', 'MultiPass',
     'You can open an account abroad with the MultiPass payment system. MultiPass is a British payment system formerly known as DynaPay. The MultiPass head office is in London (United Kingdom).'),
]


CURRENT = ' aria-current="page"'


def map_dots(key, r):
    """Country dots over a map image: each grows into a name pill on hover/focus and links to the country page."""
    names = {slug: name for column in COUNTRIES for slug, name, _ in column}
    dots = []
    for i, dot in enumerate(MAP_DOTS[key]):
        slug = DOT_SLUGS[dot['ru']]
        dots.append(f'<a class="map-dot" href="{r}countries/{slug}.html" style="left: {dot["x"]}%; top: {dot["y"]}%; --i: {i}">'
                    f'<span>{e(names[slug])}</span></a>')
    return '<nav class="map-dots" aria-label="Jurisdictions on the map">' + ''.join(dots) + '</nav>'


def e(text):
    return escape(text, quote=True)


def head(r, title, description):
    return f'''<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#151418" />
    <meta name="robots" content="noindex" />
    <title>{e(title)}</title>
    <meta name="description" content="{e(description)}" />
    <link rel="preload" href="{r}assets/fonts/outfit.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="{r}style.css?v=20261031-2" />
    <script>document.documentElement.classList.add('js');</script>
  </head>
  <body>
'''


def header(r, active=None):
    links = '\n'.join(
        f'          <a href="{r}{href}"{CURRENT if key == active else ""}>{label}</a>'
        for key, label, href in NAV)
    return f'''    <header class="header">
      <div class="wrap header__inner">
        <a class="header__logo" href="{r}index.html" aria-label="Serenity — home"><img src="{r}assets/logo.svg" alt="Serenity" width="158" height="40" /></a>
        <nav class="nav" aria-label="Main">
{links}
        </nav>
        <a class="btn btn--green header__chat" href="#request" data-modal><img src="{r}assets/icon-phone.svg" alt="" width="24" height="24" />Chat with a specialist</a>
        <button class="burger" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </header>
'''


def footer(r):
    menu = '\n'.join(f'            <li><a href="{r}{href}">{label}</a></li>' for _, label, href in NAV)
    return f'''    <footer class="footer">
      <div class="wrap footer__grid">
        <div>
          <a class="footer__logo" href="{r}index.html"><img src="{r}assets/logo.svg" alt="Serenity" width="158" height="40" loading="lazy" /></a>
          <p class="footer__tagline">Comprehensive legal<br />and financial services</p>
        </div>
        <div>
          <p class="footer__title">Menu</p>
          <ul class="footer__menu">
{menu}
          </ul>
        </div>
        <div>
          <p class="footer__title">Contact us</p>
          <ul class="footer__contacts">
            <li><a href="tel:+380570000000"><img src="{r}assets/footer-phone.svg" alt="" width="24" height="24" loading="lazy" />+38 057 000 00 00</a></li>
            <li><a href="mailto:mail@gmail.com"><img src="{r}assets/footer-mail.svg" alt="" width="24" height="24" loading="lazy" />mail@gmail.com</a></li>
            <li><a href="#"><img src="{r}assets/footer-send.svg" alt="" width="24" height="24" loading="lazy" />t.me</a></li>
          </ul>
        </div>
        <div>
          <p class="footer__title">Follow us</p>
          <ul class="footer__contacts">
            <li><a href="#"><img src="{r}assets/footer-send.svg" alt="" width="24" height="24" loading="lazy" />Telegram channel</a></li>
          </ul>
        </div>
      </div>
      <p class="footer__bar">2022 Website developed and maintained.</p>
    </footer>
    <dialog class="modal" id="consult" aria-labelledby="consult-title">
      <button class="modal__close" type="button" aria-label="Close" data-modal-close>&times;</button>
{request_form(r, '<span id="consult-title">Get a consultation from our specialist <em>within 24 hours</em></span>', form_id='consult-form')}    </dialog>
    <script src="{r}main.js?v=20261031-1" defer></script>
  </body>
</html>
'''


def request_form(r, title_html, lead=None, variant='', form_id='request'):
    lead_html = f'\n          <p class="request__lead">{lead}</p>' if lead else ''
    tall = ' request--tall' if lead else ''
    return f'''        <form class="request{tall}{variant}" id="{form_id}" action="#" novalidate>
          <h2 class="request__title title-40">{title_html}</h2>{lead_html}
          <div class="request__row">
            <input class="request__field" type="email" name="email" placeholder="E-mail" aria-label="E-mail" autocomplete="email" />
            <input class="request__field" type="text" name="name" placeholder="Your name" aria-label="Your name" autocomplete="name" />
          </div>
          <div class="request__message">
            <input type="text" name="message" placeholder="Brief description" aria-label="Brief description" />
            <button class="btn btn--dark" type="submit">Send</button>
          </div>
          <img class="request__mailbox" src="{r}assets/mailbox.webp" alt="" loading="lazy" />
        </form>
'''


SERVICE_FORM = ('To get information about this service, please fill in the contact form',
                'Our specialists will contact you to discuss further and offer possible solutions.')


def registration(r):
    cols = []
    for column in COUNTRIES:
        items = '\n'.join(f'              <li><a href="{r}countries/{slug}.html">{e(name)}</a></li>' for slug, name, _ in column)
        cols.append(f'            <li>\n              <ul>\n{items}\n              </ul>\n            </li>')
    return f'''      <section class="wrap registration" id="registration">
        <div>
          <h2 class="title-40">Company<br />registration</h2>
          <img class="registration__map" src="{r}assets/map-small.svg" alt="World map of the jurisdictions we work in" width="400" height="196" loading="lazy" />
        </div>
        <div>
          <p class="registration__label">Jurisdictions</p>
          <ul class="registration__cols">
{chr(10).join(cols)}
          </ul>
        </div>
      </section>
'''


def article_track(r):
    cards = []
    for i in range(5):
        href, img, cls, title, text = ARTICLE_CARDS[i % 2]
        cards.append(f'''          <a class="article-card" href="{r}{href}">
            <img class="{cls}" src="{r}assets/{img}" alt="" width="325" height="217" loading="lazy" />
            <div class="article-card__body">
              <h3>{e(title)}</h3>
              <p>{e(text)}</p>
            </div>
          </a>''')
    return f'''      <section class="wrap articles" id="articles">
        <div class="articles__head">
          <h2 class="display">Articles</h2>
          <div class="articles__nav">
            <button class="arrow-btn articles__prev" type="button" aria-label="Previous articles" disabled><img class="arrow-btn__off" src="{r}assets/arrow.svg" alt="" width="59" height="60" /><img class="arrow-btn__on" src="{r}assets/arrow-active.svg" alt="" width="59" height="60" /></button>
            <button class="arrow-btn arrow-btn--active articles__next" type="button" aria-label="Next articles"><img class="arrow-btn__off" src="{r}assets/arrow.svg" alt="" width="59" height="60" /><img class="arrow-btn__on" src="{r}assets/arrow-active.svg" alt="" width="59" height="60" /></button>
          </div>
        </div>
        <div class="articles__track">
{chr(10).join(cards)}
        </div>
        <div class="articles__scroll" aria-hidden="true"><span class="articles__thumb"></span></div>
      </section>
'''


def write(path, html):
    target = OUT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html)
    return path


# ---------------------------------------------------------------------------
# Home
# ---------------------------------------------------------------------------
def build_home():
    r = ''
    offers = [(f'services/{slug}.html', label) for slug, label in SERVICES] + [('#request', 'Individual request')]
    rows = '\n'.join(f'''            <li>
              <a class="offer-row{" is-active" if i == 1 else ""}" href="{href}"{" data-modal" if href == "#request" else ""}>
                <span>{e(label)}</span>
                <span class="arrow-btn" aria-hidden="true"><img class="arrow-btn__off" src="assets/arrow.svg" alt="" width="59" height="60" /><img class="arrow-btn__on" src="assets/arrow-active.svg" alt="" width="59" height="60" /></span>
              </a>
            </li>''' for i, (href, label) in enumerate(offers))
    advantages = [
        ('Offshore zones', 'As a rule, they have no currency control and do not impose strict financial reporting requirements'),
        ('No taxation', 'If the business is conducted outside the country of registration'),
        ('Broad opportunities', 'For international trade'),
        ('Confidentiality', 'In many countries company registers are closed'),
        ('Reduced or preferential rates', 'Taxation'),
    ]
    cards = '\n'.join(f'''          <article class="glass advantage">
            <img class="glass__dot" src="assets/dot.svg" alt="" width="16" height="16" />
            <h3>{e(t)}</h3>
            <p>{e(d)}</p>
          </article>''' for t, d in advantages)
    partners = '\n'.join('            <img src="assets/partner-logo.svg" alt="Partner logo" width="217" height="90" loading="lazy" />' for _ in range(4))
    html = head(r, 'Serenity Consultancy Services — company registration worldwide',
                'Company registration worldwide and legal consulting 24/7: corporate, tax, licensing and relocation services.')
    html += header(r)
    html += f'''    <main>
      <section class="home-hero">
        <img class="glow" src="assets/glow.svg" alt="" style="left: calc(50% + 240px); top: -415px" />
        <div class="home-hero__map"><div class="map-layer home-hero__layer"><img src="assets/hero-map.svg" alt="" width="932" height="453" />{map_dots('hero-map', r)}</div></div>
        <div class="wrap home-hero__text">
          <h1 class="home-hero__title">Company registration<br /><span class="home-hero__accent">all over </span><span class="green">the world</span></h1>
          <p class="home-hero__subtitle">Legal consulting 24/7</p>
          <a class="btn btn--green" href="#">Our Telegram channel</a>
        </div>
      </section>

      <section class="wrap about" id="about">
        <img class="glow" src="assets/glow.svg" alt="" style="left: -636px; top: -300px" />
        <h2 class="display">About the company</h2>
        <div class="about__card-wrap">
          <picture><source media="(max-width: 767px)" srcset="assets/logo-mark-mobile.svg" /><img class="about__mark" src="assets/logo-mark.svg" alt="" width="314" height="75" /></picture>
          <div class="about__card">
            <h3 class="about__card-title">Serenity Consultancy<br />Services</h3>
            <p>A group of companies whose representatives and partners provide comprehensive legal and financial services in most countries of the world: company registration and maintenance, startup support and licensing. With our professionals you can easily and quickly register a company anywhere in the world, obtain the necessary licences and get legal support 24/7. We vouch for the quality of our services, because your success is our status.</p>
          </div>
        </div>

        <div class="advantages">
          <img class="glow" src="assets/glow.svg" alt="" style="left: 474px; top: -271px" />
          <div class="advantages__head">
            <h2 class="title-40"><span class="green">Advantages</span> of opening<br />a company abroad</h2>
            <p class="advantages__lead">Sooner or later, an entrepreneur who is growing and seeking to expand their business starts thinking about entering the international market. What are the advantages of opening a company abroad?</p>
          </div>
          <div class="advantages__cards">
{cards}
          </div>
          <div class="advantages__art" aria-hidden="true">
            <img class="advantages__paper" src="assets/paper.webp" alt="" loading="lazy" />
            <img class="advantages__stamp" src="assets/stamp.webp" alt="" loading="lazy" />
            <img class="advantages__column" src="assets/column.png" alt="" loading="lazy" />
          </div>
        </div>
      </section>

      <section class="offers">
        <img class="offers__bg" src="assets/offers-bg.webp" alt="" loading="lazy" />
        <div class="wrap">
          <h2 class="display">We offer</h2>
          <div class="offers__body">
            <div class="offers__desk" aria-hidden="true">
              <img class="offers__desk-img" src="assets/desk.webp" alt="" loading="lazy" />
              <span class="offers__screen"></span>
              <img class="offers__screen-logo" src="assets/logo-mark.svg" alt="" />
            </div>
            <ul class="offers__list">
{rows}
            </ul>
          </div>
        </div>
      </section>

      <section class="wrap turnkey">
        <a class="turnkey__pill turnkey__pill--1" href="ready-made-companies.html"><img src="assets/icon-check.svg" alt="" width="42" height="42" />Ready-made companies<br />for sale</a>
        <a class="turnkey__pill turnkey__pill--2" href="relocation.html"><img src="assets/icon-send.svg" alt="" width="42" height="42" />Relocation</a>
        <a class="turnkey__pill turnkey__pill--3" href="contract-support.html"><img src="assets/icon-blank.svg" alt="" width="42" height="42" />Contract<br />support</a>
        <h2 class="turnkey__title"><img class="turnkey__keys" src="assets/keys.webp" alt="" loading="lazy" />Everything<br /><span class="green">turnkey</span></h2>
      </section>

      <div class="wrap home-form">
{request_form(r, 'Get a consultation from our specialist <span>within 24 hours</span>')}      </div>

      <section class="partners">
        <img class="glow" src="assets/glow-partners.svg" alt="" style="left: -427px; top: -392px" />
        <div class="wrap partners__inner">
          <h2 class="title-40">Our<br /><span class="green">partners</span></h2>
          <div class="partners__logos">
{partners}
          </div>
        </div>
      </section>

{article_track(r)}
{registration(r)}    </main>
'''
    html += footer(r)
    return write('index.html', html)


# ---------------------------------------------------------------------------
# Services
# ---------------------------------------------------------------------------
REG_TEXT = ('Registering a foreign company is usually highly specific and labour-intensive depending on the country, and owning a company '
            'abroad often involves various difficulties that require constant attention from the business owner. Serenity Consultancy '
            'Services specialists will take on part of your business concerns and help with any difficulties at the stages of setting up, '
            'managing and running your company.')

STEPS = [
    ('step-1.svg', 'Initial consultation, prepayment',
     'Fill in a consultation request. Within 24 hours a specialist will contact you and help determine the type of licence and the procedure'),
    ('step-2.svg', 'Collecting documents, preparation and submission',
     'Our specialists will prepare all the licence application documents, as well as all the necessary answers for the regulator'),
    ('step-3.svg', 'Interaction with the regulator',
     'Based on the review of the application, there is an additional stage of information requests and compliance checks on the beneficiaries'),
    ('step-4.svg', 'Obtaining the licence and ongoing support',
     'After the licence has been obtained, we can additionally prepare all the necessary documentation for the project'),
]


def p(text, cls=''):
    cls_attr = f' class="{cls}"' if cls else ''
    return f'<p{cls_attr}>{text}</p>'


def numbered(n, text, bold=False):
    body = f'<span>{text}</span>' if not bold else f'<strong>{text}</strong>'
    return f'<div class="numbered"><b>{n}.</b>{body}</div>'


def service_body(slug, img):
    """Blocks inside the light service card (after the title), in design order."""
    if slug == 'company-registration':
        return [img, p(REG_TEXT), p('We offer a full range of corporate services for businesses, saving you valuable time and money. '
                                    'To get information about this service, please fill in the contact form below. Our specialists will '
                                    'contact you to discuss further and offer possible solutions.')]
    if slug == 'corporate-tax-planning':
        note = ''.join(p(t) for t in [
            'Analysis of the current situation at the company and of all processes and circumstances that may affect its tax liabilities;',
            'Selection and agreement with the company’s management of the most acceptable and optimal taxation scheme — legal and taking into account all the specifics of the particular business;',
            'Consulting, providing the necessary assistance in implementing the proposed scheme, adjusting the accounting policy, carrying out organisational changes and preparing contract documentation;',
            'Information and methodological support for accounting and tax records, and monitoring of changes in legislation.'])
        return [
            p('Tax planning is the creation of a tax optimisation system that makes the most of the possibilities of tax law to reduce the tax burden on a business.'),
            img, p(REG_TEXT),
            '<div class="service-card__group"><h2 class="service-card__h">Serenity Consultancy Services tax optimisation services include:</h2>'
            + numbered(1, 'Strategic tax planning aimed at a long-term effect of the schemes implemented and at solving large-scale tasks')
            + numbered(2, 'Current tax planning that makes it possible to reduce the tax burden of specific transactions') + '</div>',
            '<div class="service-card__note"><h3>Measures to reduce the tax burden on a business carried out by our specialists include:</h3>'
            f'<div>{note}</div></div>',
        ]
    if slug == 'legal-consulting':
        return [img, p('As part of our legal consulting service, our specialists work on a wide range of issues the client needs to resolve. '
                       'We do not limit ourselves to a narrow list of industries, as the company has enough specialists for the team to '
                       'successfully handle almost any task facing legal entities.')]
    if slug == 'crypto-licensing':
        return [p('What is a crypto licence? It is a permit issued by government authorities to companies that intend to run a business '
                  'related to crypto assets and offer the related services in the country.'), img,
                p('A crypto licence abroad can only be obtained in countries where the status of cryptocurrencies has been established and a '
                  'legal framework regulating market conduct and issuer requirements is in place. Serenity Consultancy Services specialists '
                  'will handle all the difficulties of the application.')]
    if slug == 'betting-gambling':
        return [
            p('What is betting? Financial betting is another way to earn on the Forex market, both when exchange rates rise and when they '
              'fall. Financial betting differs somewhat from well-known trading. Trading means making a profit from the difference in '
              'exchange rates when buying and selling. Betting is a completely different way of earning.'),
            p('The word betting comes from the English “bet”. A person bets on the Forex market that the rate of one currency will rise or '
              'fall against another. If the forecast comes true, the person receives money.'),
            img,
            p('What is gambling? Gambling is a niche for people who like to take risks, whose goal is to have fun and possibly earn some '
              'money. To run a full-fledged online casino, the owner first of all needs to obtain a gambling licence, which guarantees '
              'financial stability and security and makes it possible to legally run and develop gambling projects. An online casino '
              'gambling licence is a document that permits online business in the gambling industry: bingo, all kinds of lotteries, '
              'options, online bookmaking and internet casinos.'),
            p('A gambling licence is issued by a special regulatory body that sets out the requirements the owner of a gambling business '
              'must meet. The compliance standards mainly concern the company’s financial accounting, audit, the functionality of its '
              'games and a detailed description of its activities.'),
        ]
    if slug == 'bank-accounts':
        return [img, p('Today, opening a bank account involves many difficulties and can take from 3 to 12 months. The list and number of '
                       'documents, including those confirming real economic activity, can be considerable. Fortunately, traditional banks '
                       'are no longer the only solution available to businesses. Serenity Consultancy Services specialists will help you '
                       'open the account you need anywhere in the world.')]
    if slug == 'trademark-registration':
        items = [
            ('Security.', 'By registering a trademark you protect yourself from the actions of unscrupulous competitors towards your brand. '
             'Any attempts to copy your brand are considered illegal use of intellectual property and are prosecuted by law.'),
            ('New opportunities.', 'You get the opportunity to franchise your company. A registered trademark is also a mandatory condition '
             'for entry into the customs register of intellectual property — a state-protected list of goods subject to special checks for '
             'counterfeits. No one has the right to import or export your goods without your permission! Moreover, at 90% of exhibitions '
             'held both in our country and abroad, a registered trademark is a mandatory requirement for participation.'),
            ('Profit.', 'If anyone wants to use your logo, company name or any other trademark, they cannot do so without your involvement. '
             'You can sell your trademark.'),
            ('Guarantees.', 'A trademark can be included in the company’s share capital as an intangible asset. It can be sold, pledged or '
             'put up for auction.'),
            ('Prestige.', 'Have you noticed the ® and ™ symbols next to the name of a company, product or logo? These symbols indicate that '
             'the brand has passed a uniqueness check, is properly registered and is protected by the state. Unauthorised use of these '
             'symbols is unlawful and prosecuted by law.'),
        ]
        group = ''.join(numbered(i, t, bold=True) + p(d) for i, (t, d) in enumerate(items, 1))
        return [p('First of all, trademark registration means “registering ownership”. Just as you own property and cars, rights to a brand '
                  'are registered the same way. Otherwise it is impossible to prove that it is your property, let alone punish infringers '
                  'who encroach on it.'), img,
                f'<div class="service-card__group"><h2 class="service-card__h">Trademark owners have a number of advantages:</h2>{group}</div>']
    if slug == 'fintech':
        return [
            '<div class="service-card__group"><h2 class="service-card__h">What is fintech?</h2>'
            + p('The 21st century can be called the century of innovation. Everyone understands how quickly and how far technology has '
                'advanced. Progress has not bypassed the financial sector either, so the market offers a huge number of solutions that make '
                'working with money easier — whether electronic money, cash or cryptocurrency. Every entrepreneur wants to make payments as '
                'convenient as possible while keeping security high.', 'service-card__justify') + '</div>',
            img,
            p('The set of innovations in financial services is called “fintech” for short. The concept covers everything from developments '
              'in artificial intelligence to biometrics. Because of the importance of making any means of payment accessible, the high risk '
              'of fraud and its great relevance, this sector is developing and improving rapidly, making customers’ lives better.',
              'service-card__justify'),
            '<div class="service-card__group"><h2 class="service-card__h">Developing fintech solutions</h2>'
            + p('Developing fintech solutions is one of the priority areas in the policies of successful states. Market competition, better '
                'than any external regulator, pushes private companies to develop in this direction. Thanks to active research in this '
                'sector and the emergence of interesting IT solutions, cash has almost fallen out of use. People simply do not need it.',
                'service-card__justify') + '</div>',
            p('In just a few decades, trade and production have changed beyond recognition. Now we all use Face ID to access our wallets, '
              'book rooms on the other side of the world in a couple of clicks, and some even buy cars with cryptocurrency.',
              'service-card__justify'),
            '<div class="service-card__bullets"><h3>The priority segments for the further development of fintech are:</h3><ul>'
            '<li>Security</li><li>Development of neural networks and artificial intelligence</li><li>Biometrics</li>'
            '<li>Reducing costs in finance</li></ul>'
            + p('We offer the best products in the fintech segment in almost all current areas.') + '</div>',
        ]
    if slug == 'foreign-trade':
        return [img, p(CONTRACT_1), p(CONTRACT_2)]
    raise KeyError(slug)


CONTRACT_1 = ('Our team of lawyers provides comprehensive contract support for projects, from licence agreements to foreign trade '
              'support, taking into account the current situation in the world. We develop convenient contract frameworks for IT startups.')
CONTRACT_2 = ('Contract support also includes a range of services for analysing documents (proofreading, interpretation, preparing '
              'protocols of disagreement) and drafting them (drawing up and developing contracts of any kind), as well as identifying legal '
              'and business risks. Documentation can also be translated into foreign languages (bilingual contracts).')


def process_section(r):
    steps = '\n'.join(f'''          <article class="step">
            <div class="step__icon"><img src="{r}assets/{icon}" alt="" width="150" height="150" loading="lazy" /></div>
            <h3>{e(t)}</h3>
            <p>{e(d)}</p>
          </article>''' for icon, t, d in STEPS)
    return f'''      <section class="process">
        <img class="process__bg" src="{r}assets/offers-bg.webp" alt="" loading="lazy" />
        <div class="wrap process__grid">
{steps}
        </div>
      </section>
'''


def build_service(index, slug, label):
    r = '../'
    menu = '\n'.join(
        f'''            <li><a class="service-menu__item" href="{s}.html"{CURRENT if s == slug else ""}><span>{e(l)}</span><span class="arrow-btn" aria-hidden="true"><img src="{r}assets/arrow.svg" alt="" width="59" height="60" /></span></a></li>'''
        for s, l in SERVICES)
    img = f'<img class="service-card__image" src="{r}assets/service-{index}.webp" alt="" width="800" height="237" loading="lazy" />'
    blocks = '\n          '.join(service_body(slug, img))
    extras = []
    if slug == 'company-registration':
        extras.append(f'''      <section class="wrap service-map" aria-label="Jurisdictions on the map">
        <div class="map-layer"><img src="{r}assets/service-map.svg" alt="World map with our jurisdictions" width="1360" height="661" loading="lazy" />{map_dots('service-map', r)}</div>
      </section>
''')
    if slug in ('crypto-licensing', 'betting-gambling', 'bank-accounts'):
        extras.append(process_section(r))
    if slug == 'trademark-registration':
        extras.append('      <p class="wrap title-36 service-closing">Serenity Consultancy Services specialists will help you register your trademark.</p>\n')
    title = label if slug != 'crypto-licensing' else 'Crypto licences and individual projects'
    html = head(r, f'{label} — Serenity Consultancy Services', f'{label}: Serenity Consultancy Services solutions and services.')
    html += header(r, 'services')
    html += f'''    <main class="page-top stack">
      <img class="glow" src="{r}assets/glow.svg" alt="" style="left: -352px; top: -31px" />
      <div class="wrap service-layout">
        <aside class="service-menu">
          <p class="service-menu__title">We offer</p>
          <ul class="service-menu__list">
{menu}
          </ul>
          <a class="glass service-menu__request" href="#request" data-modal><img class="glass__dot" src="{r}assets/dot.svg" alt="" width="16" height="16" /><img src="{r}assets/icon-chat.svg" alt="" width="42" height="42" />Individual request</a>
        </aside>
        <article class="service-card">
          <div class="service-card__head">
            <h1 class="service-card__title">{e(title)}</h1>
            <span class="service-card__icon" aria-hidden="true"><img class="service-card__paper" src="{r}assets/service-paper.webp" alt="" /><img class="service-card__pen" src="{r}assets/service-pen.webp" alt="" /></span>
          </div>
          {blocks}
        </article>
      </div>
{''.join(extras)}      <div class="wrap">
{request_form(r, SERVICE_FORM[0], SERVICE_FORM[1])}      </div>
    </main>
'''
    html += footer(r)
    return write(f'services/{slug}.html', html)


# ---------------------------------------------------------------------------
# Landing pages
# ---------------------------------------------------------------------------
def landing(path, active, title, description, hero_html, body_html):
    r = ''
    html = head(r, f'{title} — Serenity Consultancy Services', description)
    html += header(r, active)
    html += f'''    <main>
{hero_html}{body_html}      <div class="wrap" style="margin-top: 70px">
{request_form(r, SERVICE_FORM[0], SERVICE_FORM[1])}      </div>
      <div style="height: 70px"></div>
    </main>
'''
    html += footer(r)
    return write(path, html)


def build_contracts():
    hero = '''      <section class="landing-hero">
        <img class="landing-hero__img landing-hero__img--narrow" src="assets/hero-contracts.webp" alt="" width="946" height="688" />
        <div class="wrap landing-hero__title"><h1 class="display">Contract<br />support</h1></div>
      </section>
'''
    body = f'''      <div class="wrap landing-copy">
        <p>{CONTRACT_1}</p>
        <p class="landing-box">{CONTRACT_2}</p>
      </div>
'''
    return landing('contract-support.html', None, 'Contract support', CONTRACT_1, hero, body)


def build_relocation():
    hero = '''      <section class="landing-hero landing-hero--short">
        <img class="landing-hero__img" src="assets/hero-relocation.webp" alt="" width="1600" height="688" />
        <div class="wrap landing-hero__title"><h1 class="display">Relocation</h1></div>
      </section>
'''
    body = '''      <div class="wrap landing-copy">
        <div>
          <p>Changing your place of residence is a very important decision that requires serious preparation. You need to weigh all the pros and cons of the chosen country, because the procedure for obtaining a residence permit, permanent residence and citizenship differs everywhere. Countries around the world offer different grounds for obtaining permission to live there, one of which may suit you perfectly.</p>
          <br />
          <p>The right grounds and a sound strategy will save you time and nerves, making the move more pleasant and minimising the chance of refusal. Citizenship by investment, a residence permit based on a business in the country, permanent residence after a certain period of continuous residence, family reunification or something else?</p>
        </div>
        <p class="title-36 green" style="text-align: left">The USA, Europe or an offshore jurisdiction far out in the ocean? The Serenity Consultancy Services team will help you make the right choice and understand all the details of obtaining citizenship</p>
      </div>
'''
    return landing('relocation.html', 'relocation', 'Relocation',
                   'Relocation support: residence permits, permanent residence and citizenship.', hero, body)


def build_companies():
    cards = [('company-1.webp', 'Jute mill', '$ 23 800'), ('company-2.webp', 'Creative alys', '$ 40 500'),
             ('company-3.webp', 'Madison', '$ 102 000'), ('company-4.webp', 'Roselin', '$ 60 600')]
    items = '\n'.join(f'''          <article class="company">
            <img src="assets/{img}" alt="{e(name)} logo" width="325" height="170" loading="lazy" />
            <div class="company__body">
              <h3>{e(name)}</h3>
              <dl>
                <div><dt>Registration date:</dt><dd>28.06.2020</dd></div>
                <div><dt>Jurisdiction:</dt><dd>England</dd></div>
                <div><dt>Business type:</dt><dd>Business</dd></div>
                <div><dt>Accounts:</dt><dd>Many</dd></div>
                <div><dt>Assets:</dt><dd>Even more</dd></div>
              </dl>
              <div class="company__price">{price}<a class="arrow-btn arrow-btn--active" href="#request" data-modal aria-label="Ask about {e(name)}"><img src="assets/arrow-active.svg" alt="" width="59" height="60" /></a></div>
            </div>
          </article>''' for img, name, price in cards)
    hero = '''      <section class="landing-hero">
        <img class="landing-hero__img" src="assets/hero-companies.webp" alt="" width="1600" height="688" />
        <div class="wrap landing-hero__title"><h1 class="display">Ready-made companies<br />for sale</h1></div>
      </section>
'''
    body = f'''      <div class="wrap landing-copy">
        <p class="title-36 green" style="text-align: left">Our specialists will help you acquire your own company with an open account</p>
        <p>Already have your own business and need to expand its scope? To avoid wasting time and effort on registering a legal entity, you can buy a ready-made company.</p>
        <div>
          <p>After the purchase you will have a fully ready company with the package of documents required for full operation. We are ready to offer ready-made companies at a good price with a fast transaction.</p>
          <br />
          <p>The companies are already registered; you only need to register the ownership to the new owner and change the director. The client will receive all the papers needed for the legal entity to operate.</p>
          <br />
          <p>Ready-made companies are in demand among entrepreneurs who need to take part in a tender but whose own company does not meet the participant requirements. Since the company already has an account, you will not have to spend time opening one.</p>
        </div>
      </div>
      <section class="companies">
        <div class="wrap">
          <div class="companies__head">
            <h2 class="display">Current<br />offers</h2>
            <p>on companies under our management, prepared for sale</p>
          </div>
          <div class="companies__grid">
{items}
          </div>
          <div class="companies__more"><a class="btn btn--green" href="#request" data-modal>See more</a></div>
        </div>
      </section>
'''
    return landing('ready-made-companies.html', 'companies', 'Ready-made companies for sale',
                   'Ready-made companies for sale with an open account.', hero, body)


# ---------------------------------------------------------------------------
# Articles
# ---------------------------------------------------------------------------
def article_page(path, title, hero_img, description, body, with_articles):
    r = '../'
    html = head(r, f'{title} — Serenity Consultancy Services', description)
    html += header(r, 'articles')
    html += f'''    <main>
      <section class="article-hero">
        <img src="{r}assets/{hero_img}" alt="" width="1600" height="600" />
        <div class="wrap"><h1>{e(title)}</h1></div>
      </section>
      <div class="sheet">
      <article class="wrap article">
{body}
      </article>
      <div class="wrap" style="margin-top: 70px">
{request_form(r, SERVICE_FORM[0], SERVICE_FORM[1])}      </div>
{article_track(r) if with_articles else ''}      <div style="height: 70px"></div>
      </div>
    </main>
'''
    html += footer(r)
    return write(path, html)


def callout(label, text, slim=True, r='../'):
    return (f'<div class="glass callout{" callout--slim" if slim else ""}"><img class="glass__dot" src="{r}assets/dot.svg" alt="" width="24" height="24" />'
            f'<h3>{label}</h3><p>{text}</p></div>')


def build_levy():
    body = f'''        <p>Owners of Cypriot companies must pay the levy fee in Cyprus every year. Because of this, at the beginning of every summer we receive many questions about what it is and how to pay it.</p>
        <div class="article__split">
          <img class="article__photo" src="../assets/article-pen.webp" alt="" width="670" height="400" loading="lazy" />
          <div class="article__qa">
            <div><h3>What is it?</h3><p><b>Serenity Consultancy Services</b> is happy to offer its company registration services in Cyprus. Write to us and we will send you our unique offer.</p></div>
            <div><h3>What is the levy fee?</h3><p><b>The levy fee in Cyprus</b> is an annual state corporate fee that must be paid on time by all companies registered in Cyprus, whether or not they have been active.</p></div>
          </div>
        </div>
        {callout('Interesting:', 'Company registration in Cyprus originally became popular because of the favourable business climate and attractive conditions for doing business. Cyprus has a strategically advantageous location, a loyal tax system with preferential conditions and many other advantages.', slim=False)}
        <p>The levy fee in Cyprus is 350 EUR. The fee was introduced in 2011 with the adoption of a new law, under which all registered resident companies in Cyprus must pay this amount to the state budget.</p>
        <h2>When must a company pay the levy fee in Cyprus?</h2>
        <div class="article__text">
          <p>Companies in Cyprus must pay the levy fee no later than 30 June each year.</p>
          <p>However, the following factors should be taken into account:</p>
          <ul>
            <li>If a company is registered after 30 June, the newly created company does not have to pay the annual fee for its first year;</li>
            <li>Companies in liquidation that started before the end of June do not have to pay the levy fee for the current year;</li>
            <li>Under the Companies Law of the Republic of Cyprus, organisations registered in the jurisdiction pay the fee to the Department of the Registrar.</li>
          </ul>
        </div>
        <h2>Penalties for not paying the levy fee in Cyprus</h2>
        <div class="article__split">
          <div class="article__text">
            <p>For non-payment or late payment of the levy fee in Cyprus, the following penalties are imposed on the company:</p>
            <ul>
              <li>10% if the delay is up to 2 calendar months (until 31.08 — 385 EUR);</li>
              <li>30% if the payment is delayed by 2 to 5 months (until 30.11 — 490 EUR in total).</li>
            </ul>
          </div>
          {callout('Important:', 'Non-payment of the annual fee may also lead to the company being struck off the Cyprus Register of Companies.')}
        </div>
        <p>Thus, a company in Cyprus must fulfil its obligation to pay the levy fee. This fee is the most important contribution for the full functioning of the company and for keeping it active.</p>
        <h2>Do you need to be present in person to pay the levy fee?</h2>
        <div class="article__text">
          <p>You do not have to visit the jurisdiction in person to pay the levy fee in Cyprus. The fee can be paid in one of the following ways:</p>
          <ul>
            <li>By debit/credit card online via JCC (for 2018 and later);</li>
            <li>On the official website of the Registrar of Companies — via DRCOR electronic filing.</li>
          </ul>
        </div>
        {callout('Interesting:', 'The website also lets you check the current status of all paid/overdue annual fee amounts for any Cypriot company.')}
        <p>At the cash desk of the Registrar of Companies in cash or by cheque.</p>
        <h2>Conclusion</h2>
        <div class="article__text">
          <p>Thus, the levy fee in Cyprus of 350 EUR is paid by all companies registered in Cyprus, whether or not they carry out any activity.</p>
          <p>Failure to pay the levy fee exposes the company to penalties, the inability to obtain important documents (for example, a Certificate of Good Standing) and even removal from the Register.</p>
          <p>The levy fee in Cyprus is extremely important, and it is essential to remember all the rules for collecting it. <b>Serenity Consultancy Services</b> helps more than 50 companies pay the levy fee every year. If you also need our help, write to our specialists.</p>
        </div>'''
    return article_page('articles/cyprus-levy-fee.html', 'What is the levy fee in Cyprus?', 'hero-article-1.webp',
                        'What the levy fee in Cyprus is, when it is due, penalties and how to pay it.', body, True)


def build_multipass():
    benefits = [
        ('Possibility to open a multi-currency account', 'MultiPass offers accounts in more than 30 world currencies.'),
        ('Possibility for non-residents to open an account', 'Non-residents can open an account with MultiPass just like residents; they only need to provide additional documents.'),
        ('Remote procedure', 'The whole account opening procedure at MultiPass is remote: you do not need to travel to the United Kingdom.'),
        ('Fast account opening', 'A MultiPass account will be ready in 1–2 weeks depending on the case, and sometimes opening an account takes just 24 hours.'),
        ('Convenient online account management', 'A MultiPass account is very easy to manage online through your personal dashboard.'),
        ('Unique IBAN', 'The account holder at MultiPass receives a unique IBAN for transfers to the USA, the EU and the United Kingdom.'),
        ('Communication with a personal manager', 'Any questions related to both opening and managing a MultiPass account can be resolved directly with a personal manager'),
    ]
    items = ''.join(numbered(i, t, bold=False) + p(d) for i, (t, d) in enumerate(benefits, 1))
    body = f'''        <h2>Summary</h2>
        <div class="summary">
          <div><h3>Where is the head office?</h3><p>London, United Kingdom</p></div>
          <div><h3>Can non-residents open an account?</h3><p>Yes</p></div>
          <div><h3>Can an account be opened remotely?</h3><p>Yes</p></div>
          <div><h3>How long does it take to open an account?</h3><p>From a few days to a few weeks</p></div>
          <div><h3>Possibility to open multi-currency accounts</h3><p>Available</p></div>
        </div>
        <h2>What is MultiPass?</h2>
        <div class="article__text">
          <p>You can open an account abroad with the MultiPass payment system. MultiPass is a British payment system formerly known as DynaPay.</p>
          <p>The MultiPass head office is in London (United Kingdom). The payment system has been operating since 2017 and successfully opens accounts for companies all over the world. MultiPass is convenient online banking that is part of the international holding DYNINNO Group, founded in 2004.</p>
        </div>
        <h2>Why open an account with MultiPass?</h2>
        <p>MultiPass offers a number of advantages that may attract business owners. This payment system offers a single account for all of a business’s international payment needs.</p>
        <div class="benefits"><h3>Let’s look at some of the advantages in more detail:</h3>{items}</div>
        <h2>How to open an account with MultiPass?</h2>
        <div class="article__text">
          <p>To open an account with MultiPass, you need to go to their website and provide the necessary information and documents.</p>
          <p>The exact list of required documents will depend on the details of your application. As a rule, after you provide basic details about your company, MultiPass staff will request a specific list of documents. There is no single list, because every company has its own specifics, such as its type of activity, company structure, residency of the founders and the geography of payments (where payments will come from and go to).</p>
          <p>Alternatively, you can entrust opening a foreign account with MultiPass to professionals. <b>Serenity Consultancy Services</b> is happy to offer you support throughout the process from the company’s lawyers. With the support of our company, your application will be prepared correctly and submitted as quickly as possible. All you need to do to start the process is fill in a questionnaire and provide the package of documents requested by our specialist, and we will do all the work for you.</p>
        </div>
        <h2>Conclusion</h2>
        <div class="article__text">
          <p>With <b>MultiPass</b>, opening an account abroad becomes not only possible but also very simple. A MultiPass account lets you run an international business without obstacles while giving you access to useful tools: a multi-currency account, convenient online account management and communication with a personal manager.</p>
          <p>You can open an account abroad with MultiPass <b>on your own</b>, but if you need help, write to the specialists at <b>Serenity Consultancy Services</b> — we will be happy to guide you through the entire account opening process.</p>
        </div>'''
    return article_page('articles/multipass.html', 'MultiPass', 'hero-article-2.webp',
                        'Opening an account abroad with the MultiPass payment system.', body, False)


# ---------------------------------------------------------------------------
# Country template (England copy; the country name is swapped for each jurisdiction)
# ---------------------------------------------------------------------------
def build_country(slug, name, image):
    r = '../'
    n = IN_NAME.get(slug, name)
    docs = ['Certificate of Incorporation', 'Articles of Association', 'Memorandum of Association',
            'Minutes of the first Meeting', 'Resolution of shareholders', 'Share Certificate',
            'Apostille of documents (on request)', 'Company seal (on request)', 'Power of attorney (on request)']
    doc_items = '\n'.join(f'          <p class="doc"><img class="glass__dot" src="{r}assets/dot.svg" alt="" width="16" height="16" />{e(d)}</p>' for d in docs)
    hero_img = (f'<img class="country-hero__img" src="{r}assets/countries/{image}.webp" alt="" width="1600" height="600" />'
                if image else '')
    html = head(r, f'Company registration in {n} — Serenity Consultancy Services',
                f'Commercial offer for company registration in {n}: legal forms, taxation, registration procedure and annual maintenance.')
    html += header(r, 'map')
    html += f'''    <main class="country">
      <section class="country-hero">
        {hero_img}
        <div class="wrap country-hero__text">
          <h1>Commercial offer for company registration<span>in {e(n)}</span></h1>
        </div>
      </section>
      <div class="sheet sheet--light">

      <section class="wrap country-section">
        <h2 class="title-48">General information</h2>
        <div class="article__text">
          <p>{e(name)} is one of the largest financial and cultural centres of the modern world. Having your own business in this jurisdiction is prestigious and respectable. As a rule, such a company does not raise doubts among partners.</p>
          <p>Many people mistakenly believe that {e(n)} is an offshore zone — this is not the case. {e(name)} is a low-tax jurisdiction. The specifics of local legislation make it possible to significantly optimise financial flows outside the jurisdiction.</p>
        </div>
        <h2 class="title-48">Types of legal forms available for registration in {e(n)}</h2>
      </section>

      <section class="wrap country-forms">
        <div class="legal-form">
          <h3>LTD (Limited Company)</h3>
          <dl>
            <div><dt>Requirements:</dt><dd>An office in {e(n)} is required (we provide a correspondence address service in London). In business practice the most common share capital for a company in {e(n)} is 1,000 pounds sterling (paying up the share capital is optional).</dd></div>
            <div><dt>Shareholders:</dt><dd><span>The minimum number of shareholders is one</span><span>(individuals or legal entities).</span></dd></div>
            <div><dt>Directors:</dt><dd><span>The minimum number of directors is one (an individual).</span><span>Citizenship and residency do not matter.</span><span>The director and the shareholder can be the same person.</span></dd></div>
            <div><dt>Important:</dt><dd><span>We offer nominee shareholder and director services for doing business.</span><span>{e(name)} has an open register of shareholders and directors. The information is publicly available.</span></dd></div>
          </dl>
        </div>
        <div>
          <div class="legal-form">
            <h3>LP (Limited Partnership)</h3>
            <dl>
              <div><dt>Requirements:</dt><dd>An office in {e(n)} is required (we provide a correspondence address service in London).</dd></div>
              <div><dt>Report:</dt><dd>Partnerships in {e(n)} do not file an annual report.</dd></div>
              <div><dt>Important:</dt><dd>An LP in {e(n)} is not a separate legal entity, meaning that tax is paid not by the partnership but by each partner separately in their own jurisdiction. The partnership’s profit can be distributed proportionally between the partners, and they must declare it in their own country.</dd></div>
            </dl>
          </div>
          <p class="country-note">* Please note that {e(n)} has concluded a large number of double taxation treaties with other countries.</p>
        </div>
      </section>

      <section class="wrap country-section" style="margin-top: 20px">
        <h2 class="title-48">Taxation</h2>
        <div class="tax-row"><b>LTD</b><div><p>It is a resident from the moment the company is registered.</p><p>It pays corporate tax on an extraterritorial basis. That is, if your company is registered in {e(n)}, it pays profit tax on its activities both in {e(n)} and abroad.</p><p>The corporate tax rate in {e(n)} is 19% for 2021/22.</p><p>The VAT rate in {e(n)} is 20%.</p></div></div>
        <div class="tax-row"><b>LP</b><div><p>The limited partnership itself is not subject to taxation in {e(n)}.</p><p>The LP’s profit is distributed between its partners, who must pay taxes in the country of their tax residence.</p><p>If the partnership has foreign participants and does not operate in {e(n)}, it has no tax obligations there, and the participants must fulfil their tax obligations themselves in the country of their residence.</p></div></div>
      </section>

      <section class="country-band">
        <div class="wrap">
          <h2 class="title-48">Registration procedure</h2>
          <div class="country-band__grid">
            <div>
              <p><b>1. Before registering a company, you need to determine:</b></p><br />
              <ol>
                <li>The company name to check its uniqueness (at least three names). It must end with an indication of the legal form (“Limited” or “Ltd”).</li>
                <li>The company structure (director, shareholder, beneficiary, attorney).</li>
                <li>The amount of share capital and the distribution of shares between shareholders.</li>
                <li>The company’s type of activity (SIC).</li>
              </ol>
            </div>
            <div><p><b>2. Documents must be provided for directors/shareholders/beneficiaries/attorneys:</b></p><br /><p>A copy of the passport with the registration page, as well as documents confirming the address (UB).</p></div>
            <div><p><b>3. Submitting the company registration application</b></p><br /><p><i>(registering a new company takes about three working days)</i><b>.</b></p></div>
          </div>
        </div>
      </section>

      <section class="wrap" style="margin-top: 70px">
        <h2 class="title-48">The set of documents handed over to the client after registering a company in {e(n)} includes:</h2>
        <div class="docs">
{doc_items}
        </div>
      </section>

      <section class="country-band">
        <div class="wrap">
          <h2 class="title-48">Limited Partnership registration procedure in {e(n)}:</h2>
          <div class="country-band__grid country-band__grid--two">
            <div>
              <p><b>1. Before registration, you need to determine:</b></p><br />
              <ul>
                <li>The company name to check its uniqueness (at least three names). It must end with an indication of the legal form (“Limited” or “Ltd”).</li>
                <li>The company structure (director, shareholder, beneficiary, attorney).</li>
                <li>The amount of share capital and the distribution of shares between shareholders.</li>
                <li>The company’s type of activity (SIC).</li>
              </ul>
            </div>
            <div>
              <p><b>2. Documents must be provided for the partners: a copy of the passport with the registration page, as well as documents confirming the address (UB).</b></p><br /><br />
              <p><b>3. Submitting the registration application</b><br /><i>(registration takes about 2 weeks).</i></p>
            </div>
          </div>
        </div>
      </section>

      <section class="wrap reporting">
        <div class="country-section" style="padding-top: 0">
          <h2 class="title-48">Reporting</h2>
          <div class="article__text">
            <p>Every company in {e(n)} must file an annual return with Companies House every year.</p>
            <p>If the annual return is not filed, the Registrar may assume that the company in {e(n)} is no longer doing business and strike it off the register, as well as impose fines and penalties.</p>
          </div>
        </div>
        <img src="{r}assets/report.webp" alt="" width="555" height="268" loading="lazy" />
      </section>

      <section class="wrap country-section" style="padding-top: 70px">
        <h2 class="title-48">Annual maintenance</h2>
        <ul class="service-list" style="margin-top: 0">
          <li>1. Legal address costs</li>
          <li>2. Administrative services of a professional agent (annual compliance)</li>
          <li>3. Nominee service costs</li>
          <li>4. Help with preparing the annual return (no audit required)</li>
          <li>5. Annual company renewal</li>
        </ul>
      </section>

      <div class="wrap country-form">
{request_form(r, 'Get a consultation from our specialist:', variant=' request--dark')}      </div>
      <div class="country-reg">
{registration(r)}      </div>
      </div>
    </main>
'''
    html += footer(r)
    return write(f'countries/{slug}.html', html)


def main():
    written = [build_home()]
    written += [build_service(i, slug, label) for i, (slug, label) in enumerate(SERVICES, 1)]
    written += [build_contracts(), build_relocation(), build_companies(), build_levy(), build_multipass()]
    for column in COUNTRIES:
        written += [build_country(slug, name, image) for slug, name, image in column]
    print(f'{len(written)} pages written to serenity/')


if __name__ == '__main__':
    main()
