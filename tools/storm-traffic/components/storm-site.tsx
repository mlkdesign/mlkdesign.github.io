"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { copy, jobs, bonuses, type Lang } from "@/lib/content";
import assets from "@/lib/assets.json";
import Lightning from "./lightning";
import ApplicationForm from "./application-form";

const A = assets as Record<string, string>;
const asset = (id: string, name: string) => A[`${id}_${name}`];
// Copy marks the emphasised words of a line with **…**, as in the design.
const emphasis = (text: string) =>
  text.split("**").map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
const hrefs = [
  "#home",
  "#about",
  "#offer",
  "#partners",
  "#vacancies",
  "#contacts",
];
function Art({
  id,
  name,
  className = "",
  alt = "",
  ...props
}: {
  id: string;
  name: string;
  className?: string;
  alt?: string;
  loading?: "lazy" | "eager";
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={asset(id, name)}
      className={className}
      alt={alt}
      loading="lazy"
      {...props}
    />
  );
}
function Logo() {
  return (
    <span className="logo-art" aria-label="Storm Traffic">
      <span className="logo-storm">
        <Art id="74:50606" name="imgGroup3" />
      </span>
      <span className="logo-traffic">
        <Art id="74:50606" name="imgGroup4" />
      </span>
      <span className="logo-swoosh">
        <Art id="74:50606" name="imgVector" />
      </span>
      <span className="logo-eyes">
        <Art id="74:50606" name="imgFrame3" />
        <span className="eye-right">
          <Art id="74:50606" name="imgSubtract" />
        </span>
        <span className="eye-left">
          <Art id="74:50606" name="imgSubtract1" />
        </span>
      </span>
    </span>
  );
}
function Telegram() {
  return (
    <a
      className="telegram"
      href="https://t.me/ST_Hiring"
      target="_blank"
      rel="noreferrer"
    >
      <Art id="74:50606" name="imgTelegram1" />
      Telegram
    </a>
  );
}
function Title({
  small,
  children,
}: {
  small: string;
  children: React.ReactNode;
}) {
  return (
    <h2 className="section-title">
      <span>{small}</span>
      {children}
    </h2>
  );
}

export default function StormSite({
  referral = false,
}: {
  referral?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Lang>("ru"),
    [paused, setPaused] = useState(false),
    [modal, setModal] = useState<"details" | "cv" | "privacy" | null>(null),
    [selected, setSelected] = useState(""),
    [menu, setMenu] = useState(false),
    [active, setActive] = useState("home"),
    [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    mobileMenu = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLElement | null>(null),
    siteRoot = useRef<HTMLDivElement>(null);
  const t = copy[lang];
  const busyChange = useCallback((value: boolean) => setBusy(value), []);
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("storm-language");
    if (saved === "en" || saved === "ru" || saved === "uk") setLang(saved);
    setPaused(localStorage.getItem("storm-paused") === "true");
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("storm-language", lang);
  }, [lang]);
  useEffect(() => {
    localStorage.setItem("storm-paused", String(paused));
  }, [paused]);
  useEffect(() => {
    const root = siteRoot.current!;
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            reveal.unobserve(e.target);
          }
        }),
      { threshold: 0.09 },
    );
    root.querySelectorAll(".reveal").forEach((e) => reveal.observe(e));
    const benefits = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          e.target.classList.toggle("is-active", e.isIntersecting);
        }),
      { rootMargin: "-38% 0px -38% 0px" },
    );
    root.querySelectorAll(".benefit-row").forEach((e) => benefits.observe(e));
    const sections = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-15% 0px -50% 0px" },
    );
    root
      .querySelectorAll("section[id],footer[id]")
      .forEach((e) => sections.observe(e));
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const scroll = () => {
      if (raf || paused || m.matches) return;
      raf = requestAnimationFrame(() => {
        root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          const rect = el.parentElement!.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < innerHeight) {
            const delta =
              (innerHeight / 2 - rect.top - rect.height / 2) *
              Number(el.dataset.parallax);
            el.style.setProperty(
              "--parallax",
              `${Math.max(-55, Math.min(55, delta))}px`,
            );
          }
        });
        raf = 0;
      });
    };
    addEventListener("scroll", scroll, { passive: true });
    scroll();
    return () => {
      reveal.disconnect();
      benefits.disconnect();
      sections.disconnect();
      removeEventListener("scroll", scroll);
      cancelAnimationFrame(raf);
    };
  }, [paused, referral]);
  useEffect(() => {
    const previous = document.body.style.overflow;
    if (modal || menu) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [modal, menu]);
  useEffect(() => {
    if (!mounted) return;
    const d = menu ? mobileMenu.current : modal ? dialog.current : null;
    siteRoot.current!.inert = !!d;
    if (!d) return;
    const focusable = () =>
      Array.from(
        d.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
        ),
      ).filter((el) => el.getClientRects().length > 0);
    const frame = requestAnimationFrame(() =>
      focusable()[0]?.focus({ preventScroll: true }),
    );
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (!busy) {
          if (menu) setMenu(false);
          else setModal(null);
          requestAnimationFrame(() => {
            siteRoot.current!.inert = false;
            (menu
              ? siteRoot.current!.querySelector<HTMLButtonElement>(
                  ".menu-toggle",
                )
              : trigger.current
            )?.focus({ preventScroll: true });
          });
        }
      }
      if (e.key === "Tab") {
        const nodes = focusable();
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", key);
      siteRoot.current!.inert = false;
    };
  }, [modal, menu, mounted, busy]);
  function open(kind: "details" | "cv" | "privacy", job = "") {
    trigger.current = document.activeElement as HTMLElement;
    setSelected(job);
    setModal(kind);
  }
  function close() {
    if (busy) return;
    setModal(null);
    requestAnimationFrame(() => trigger.current?.focus());
  }
  function recommend(job: string) {
    setSelected(job);
    document.getElementById("recommend")?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    setTimeout(
      () => document.getElementById("ref-name")?.focus({ preventScroll: true }),
      500,
    );
  }
  const nav = () =>
    t.nav.map((label, i) => (
      <a
        key={hrefs[i]}
        className={active === hrefs[i].slice(1) ? "active" : ""}
        aria-current={active === hrefs[i].slice(1) ? "location" : undefined}
        href={(referral ? "/" : "") + hrefs[i]}
        onClick={() => setMenu(false)}
      >
        {label}
      </a>
    ));
  const language = () => (
    <select
      className="language"
      value={lang}
      aria-label={lang === "ru" ? "Язык" : lang === "uk" ? "Мова" : "Language"}
      onChange={(e) => setLang(e.target.value as Lang)}
    >
      <option value="ru">RU</option>
      <option value="en">EN</option>
      <option value="uk">UA</option>
    </select>
  );
  const contactButton = (className = "") => (
    <a
      className={`button ${className}`}
      href="https://t.me/ST_Hiring"
      target="_blank"
      rel="noreferrer"
    >
      {t.contact}
    </a>
  );
  const jobCards = (ref = false) => (
    <div className={`vacancy-grid ${ref ? "ref-vacancies" : ""}`}>
      {jobs.map((job, i) => (
        <article
          className={`vacancy-card reveal ${ref && i === 1 ? "featured" : ""}`}
          key={job}
        >
          {ref && <Art id="420:2877" name="imgX" className="card-x" />}
          {!ref && (
            <div className="job-tags">
              <span>{t.remote}</span>
              <span>{t.full}</span>
            </div>
          )}
          <h3>{job}</h3>
          {ref && (
            <div className="bonus">
              <div>
                <span>{t.bonus}</span>
                <strong>${bonuses[i]}</strong>
              </div>
              <p>{t.payment}</p>
            </div>
          )}
          <div className="job-actions">
            {!ref && (
              <button
                className="button outline"
                onClick={() => open("details", job)}
              >
                {t.details}
                <span aria-hidden="true">→</span>
              </button>
            )}
            <button
              className="button"
              onClick={() => (ref ? recommend(job) : open("cv", job))}
            >
              {ref ? t.recommend : t.apply}
            </button>
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <div
      ref={siteRoot}
      className={`site ${paused ? "motion-paused" : ""} lang-${lang}`}
    >
      <a className="skip-link" href="#main">
        {t.skip}
      </a>
      <header className="header">
        <a href="/" aria-label="STORM TRAFFIC">
          <Logo />
        </a>
        <nav aria-label={t.nav[0]}>{nav()}</nav>
        <div className="header-tools">
          {language()}
          <Telegram />
          <button
            className="menu-toggle"
            onClick={() => setMenu(true)}
            aria-label={t.menu}
            aria-expanded={menu}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      <main id="main">
        {referral ? (
          <>
            <section className="referral-hero textured" id="home">
              <Art
                id="420:2760"
                name="imgRefferal"
                className="referral-word"
                loading="eager"
              />
              <Art
                id="420:2760"
                name="imgGroup57"
                className="referral-emblem"
                loading="eager"
              />
              <h1>
                <span>{t.refHero}</span>
                {t.upTo}
              </h1>
              <button className="button" onClick={() => recommend("")}>
                {t.recommend}
              </button>
              <Art
                id="420:2760"
                name="imgImg47781"
                className="ref-money money-left"
              />
              <Art
                id="420:2760"
                name="imgImg47781"
                className="ref-money money-right"
              />
              <div className="hero-strips">
                <p>{emphasis(t.strap)}</p>
                <p>{emphasis(t.money)}</p>
              </div>
            </section>
            <section className="referral-explainer section-pad" id="about">
              <div className="reveal">
                <Title small={t.refWhat}>{t.refProgram}</Title>
              </div>
              <div className="ref-flow reveal">
                <Art id="420:2877" name="imgX" className="ref-x" />
                <h3>
                  <Art id="420:2837" name="imgStroke" className="stroke stroke-a" />
                  <Art id="420:2838" name="imgStroke" className="stroke stroke-b" />
                  <span>{t.advise}</span>
                </h3>
                <p className="ref-hire">{t.hire}</p>
                <h3 className="ref-flow__second">
                  <Art id="420:2837" name="imgStroke" className="stroke stroke-a" />
                  <Art id="420:2838" name="imgStroke" className="stroke stroke-b" />
                  <span>{t.reward}</span>
                </h3>
              </div>
            </section>
            <section className="ref-intro section-pad reveal" aria-hidden="true">
              <Art id="420:2936" name="imgBand" />
            </section>
            <section
              className="careers section-pad referral-careers"
              id="vacancies"
            >
              <Title small={t.current}>{t.vacancies}</Title>
              {jobCards(true)}
              <a className="button centered" href="/#vacancies">
                {t.nav[4]}
              </a>
            </section>
            <section className="steps section-pad textured" id="steps">
              <div className="section-heading reveal">
                <Title small={t.stepsLabel}>{t.stepsTitle}</Title>
                <p>{t.questions}</p>
              </div>
              <ol>
                {t.steps.map(([title, body], i) => (
                  <li className="reveal" key={title}>
                    <span className="step-number">0{i + 1}</span>
                    <h3>{title}</h3>
                    <p>{emphasis(body)}</p>
                  </li>
                ))}
              </ol>
            </section>
            <section className="recommend-section section-pad" id="recommend">
              <div className="recommend-art reveal">
                <Art
                  id="420:3126"
                  name="imgImg47981"
                  className="recommend-woman"
                />
                <Art
                  id="420:3126"
                  name="imgImg47991"
                  className="recommend-bill"
                />
              </div>
              <div className="recommend-fields">
                <div className="recommend-title">
                  <Art id="420:3126" name="imgVector" className="recommend-brush" />
                  <Title
                    small={
                      lang === "en"
                        ? "Recommend"
                        : lang === "uk"
                          ? "Порекомендуй"
                          : "Порекомендуй"
                    }
                  >
                    {lang === "en"
                      ? "A candidate"
                      : lang === "uk"
                        ? "Кандидата"
                        : "Кандидата"}
                  </Title>
                </div>
                <p>{t.formIntro}</p>
                <ApplicationForm lang={lang} referral selected={selected} />
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="home-hero textured" id="home">
              <h1 className="hero-title">
                <span className="storm">
                  S<em>TOR</em>M
                </span>
                <span className="traffic">TRAFFIC</span>
              </h1>
              <div className="hero-contact">
                <Art id="hero" name="imgBarcode" loading="eager" />
                <p>{emphasis(t.hero)}</p>
                {contactButton()}
              </div>
              <div className="hero-graffiti">
                <Art id="hero" name="imgSocial" loading="eager" />
              </div>
              <Lightning paused={paused} />
              <div className="hero-strips">
                <p>{emphasis(t.strap)}</p>
                <p>{emphasis(t.money)}</p>
              </div>
            </section>
            <section className="about section-pad" id="about">
              <div className="about-heading reveal">
                <Title small={t.notJust}>{t.strong}</Title>
                <div className="type-cloud" aria-hidden="true">
                  TRAFFIC MONEY GAMBLING FINANCE CRYPTO INVESTMENT BITCOIN RISKS
                  BLOCKCHAIN CASINO DIVERSIFICATION ETHEREUM JACKPOT FINTECH
                  CAPITALIZATION POKER MARKET LOTTERY DECENTRALIZATION
                </div>
                <Art id="74:50624" name="imgGroup" className="about-cross" />
              </div>
              <div className="stats">
                {[
                  "imgImg47501",
                  "imgImg47541",
                  "imgImg47543",
                  "imgImg47542",
                ].map((name, i) => (
                  <div className="stat reveal" key={name}>
                    <Art id="74:50624" name={name} />
                    <div className="stat-caption">
                      <strong>
                        {["30", "70", "5", "65"][i]}
                        {i === 0 && <em>K</em>}
                      </strong>
                      <span>{t.stats[i]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="we-are section-pad">
              <div className="we-art">
                <Art
                  id="74:50627"
                  name="imgImg47771"
                  className="we-woman reveal"
                  alt={
                    lang === "en"
                      ? "Illustrated Storm Traffic team character"
                      : lang === "uk"
                        ? "Ілюстрований персонаж Storm Traffic"
                        : "Иллюстрированный персонаж Storm Traffic"
                  }
                />
                {Array.from({ length: 6 }, (_, i) => (
                  <Art
                    key={i}
                    id="74:50627"
                    name="imgImg47781"
                    className={`flying-bill bill-${i}`}
                    style={
                      {
                        "--bill-rotate": `${[-20, 15, 45, -15, 20, 35][i]}deg`,
                      } as React.CSSProperties
                    }
                    {...{ "data-parallax": String((i % 2 ? 1 : -1) * 0.08) }}
                  />
                ))}
              </div>
              <div className="we-copy reveal">
                <h2>
                  <span>{t.checks}</span>
                  <strong>{t.millions}</strong>
                </h2>
                <p>{t.grow}</p>
                <h3 className="brush-title">
                  {t.giants.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h3>
                {contactButton()}
              </div>
            </section>
            <section className="benefits section-pad textured">
              <div className="section-heading reveal">
                <Title small={t.why}>{t.best}</Title>
                <div className="angry-eyes">
                  <Art id="74:50628" name="imgGroup37" />
                  <Art id="74:50628" name="imgGroup38" />
                </div>
              </div>
              <ol>
                {t.benefits.map(([title, body], i) => (
                  <li className="benefit-row reveal" key={title} tabIndex={0}>
                    <span>0{i + 1}</span>
                    <h3>{title}</h3>
                    <p>{emphasis(body)}</p>
                  </li>
                ))}
              </ol>
            </section>
            <section className="buyers section-pad">
              <div className="buyers-heading reveal">
                <span>{t.fly}</span>
                <h2>{t.buyers}</h2>
              </div>
              <Art id="74:50638" name="imgImg47981" className="buyers-woman" />
              <Art
                id="74:50638"
                name="imgImg47991"
                className="buyers-bill one"
              />
              <Art
                id="74:50638"
                name="imgImg47991"
                className="buyers-bill two"
              />
              <div className="buyers-notes">
                {t.notes.map((note, i) => (
                  <p key={note} className={`note-${i}`}>
                    <b aria-hidden="true">×</b>
                    {note}
                  </p>
                ))}
              </div>
              <div className="buyers-banner">
                <p>{t.joinPitch}</p>
                {contactButton("light-button")}
                <Art id="74:50638" name="imgFrame9" />
              </div>
            </section>
            <section className="offers section-pad" id="offer">
              <div className="section-heading reveal">
                <Title small={t.what}>{t.offer}</Title>
                <p>{t.offerIntro}</p>
              </div>
              <div className="offer-list">
                {t.offers.map(([title, body], i) => (
                  <article className="offer-item reveal" key={title}>
                    <div className="offer-icon">
                      <Art
                        id="74:50639"
                        name={`imgImg4741${i === 0 ? "1" : i === 1 ? "2" : i === 2 ? "3" : "4"}`}
                      />
                    </div>
                    <div>
                      <h3>{title}</h3>
                      <ul>
                        {body.split("\n").map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="careers section-pad textured" id="vacancies">
              <Title small={t.looking}>{t.join}</Title>
              {jobCards()}
              <a className="button centered" href="/referral">
                {t.referral}
              </a>
            </section>
          </>
        )}
        <section className="intrigue reveal" aria-label={t.intrigue}>
          {lang === "ru" ? (
            <>
              <Art id="74:50702" name="imgText" className="intrigue-top" />
              <Art
                id="74:50702"
                name="imgIntrigueLiquid"
                className="intrigue-liquid"
              />
            </>
          ) : (
            <img
              className="intrigue-localized"
              src={`/assets/intrigue-${lang}.svg`}
              alt=""
              loading="lazy"
            />
          )}
        </section>
        <section className="partners section-pad" id="partners">
          <div className="partners-heading">
            <h2>
              S<em>TOR</em>M TRAFFIC
            </h2>
            <div>
              <p>{t.partners}</p>
              <p>{t.partnersMore}</p>
            </div>
          </div>
          <div className="partner-marquee" aria-label={t.nav[3]}>
            {[0, 1].map((repeat) => (
              <div
                className="partner-track"
                key={repeat}
                aria-hidden={repeat === 1}
              >
                {[
                  "imgGroup1",
                  "img2",
                  "img3",
                  "img4",
                  "img5",
                  "img6",
                  "imgBiamobet1",
                  "img7",
                  "img31",
                  "img8",
                  "img9",
                  "img10",
                  "img11",
                  "img12",
                  "img13",
                  "img14",
                  "img15",
                  "img16",
                ].map((name, i) => (
                  <Art
                    id="12:2274"
                    key={name}
                    name={name}
                    alt={
                      repeat === 0
                        ? [
                            "Parimatch",
                            "Betway",
                            "Rizk",
                            "Mr Green",
                            "The Lotter",
                            "Coral",
                            "Dunder",
                            "BiamoBet",
                            "Winline",
                            "Partner",
                            "Foxy Games",
                            "Friday",
                            "Mr Q",
                            "LeoVegas",
                            "Ladbrokes",
                            "Casumo",
                            "Betsson",
                            "GGPoker",
                          ][i]
                        : ""
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer id="contacts" className="footer section-pad">
        <div className="footer-topline" aria-hidden="true">
          {t.footerLine}
        </div>
        <div className="footer-layout">
          <nav aria-label={t.nav[5]}>
            {nav()}
            <a href="/referral">{t.referral}</a>
            <button onClick={() => open("privacy")}>{t.privacy}</button>
          </nav>
          <div className="footer-social">
            <h2>{t.socials}</h2>
            <div className="social-links">
              <a
                href="https://www.instagram.com/storm.traffic/"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <Art id="33:13935" name="imgGroup" />
              </a>
              <a
                href="https://www.facebook.com/"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
              >
                <Art id="33:13935" name="imgGroup1" />
              </a>
              <a
                href="https://www.youtube.com/"
                aria-label="YouTube"
                target="_blank"
                rel="noreferrer"
              >
                <Art id="33:13935" name="imgYoutube1" />
              </a>
            </div>
            <a href="mailto:work@storm-traffic.com">work@storm-traffic.com</a>
          </div>
          <div className="footer-right">
            <Telegram />
            <button
              className="motion-toggle"
              onClick={() => setPaused(!paused)}
              aria-pressed={paused}
            >
              {paused ? "▶" : "Ⅱ"} {paused ? t.play : t.pause}
            </button>
          </div>
        </div>
        <Art id="33:13935" name="imgGroup11" className="footer-eyes" />
        <p className="copyright">©2023 Storm-traffic.com</p>
      </footer>
      {mounted &&
        createPortal(
          <>
            <dialog
              ref={mobileMenu}
              open={menu}
              aria-modal="true"
              className="mobile-menu"
              aria-label={t.menu}
              onCancel={() => setMenu(false)}
              onClose={() => setMenu(false)}
            >
              <div className="mobile-menu-header">
                <a href="/">
                  <Logo />
                </a>
                <button
                  className="close-button"
                  onClick={() => setMenu(false)}
                  aria-label={t.close}
                >
                  ×
                </button>
              </div>
              <nav>
                {nav()}
                <a href="/referral" onClick={() => setMenu(false)}>
                  {t.referral}
                </a>
              </nav>
              <div className="mobile-menu-bottom">
                <Telegram />
                {language()}
                <a href="mailto:work@storm-traffic.com">
                  work@storm-traffic.com
                </a>
              </div>
              <Art id="33:13935" name="imgGroup11" className="menu-eyes" />
            </dialog>
            {modal && (
              <div
                className="modal-backdrop"
                onClick={close}
                aria-hidden="true"
              />
            )}
            <dialog
              ref={dialog}
              open={!!modal}
              aria-modal="true"
              className={`modal modal-${modal}`}
              aria-labelledby="modal-title"
              onCancel={(e) => {
                if (busy) e.preventDefault();
                else setModal(null);
              }}
              onClose={() => {
                setModal(null);
                trigger.current?.focus();
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  const r = e.currentTarget.getBoundingClientRect();
                  if (
                    e.clientX < r.left ||
                    e.clientX > r.right ||
                    e.clientY < r.top ||
                    e.clientY > r.bottom
                  )
                    close();
                }
              }}
            >
              <button
                className="close-button"
                onClick={close}
                disabled={busy}
                aria-label={t.close}
              >
                ×
              </button>
              {modal === "details" && (
                <>
                  <div className="vacancy-details">
                    <aside>
                      <h2 id="modal-title">{selected}</h2>
                      <button className="button" onClick={() => setModal("cv")}>
                        {t.sendCV}
                      </button>
                      <p>{t.review}</p>
                      <Art
                        id="415:247"
                        name="imgFrame81"
                        className="details-art"
                      />
                    </aside>
                    <div>
                      <h3>{t.expectations}</h3>
                      <ul>
                        <li>
                          {selected.startsWith("TEAM LEAD")
                            ? t.leadReq
                            : t.buyerReq}
                        </li>
                        {t.requirements.map((req) => (
                          <li key={req}>{req}</li>
                        ))}
                        <li>
                          {selected.includes("FACEBOOK")
                            ? "Facebook Ads / Meta Business Suite"
                            : "Google Ads / PPC / UAC"}
                        </li>
                      </ul>
                      <h3>{t.conditions}</h3>
                      <ul>
                        {t.jobOffer.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="modal-contacts">
                    <div>
                      <h3>{t.socials}</h3>
                      <Telegram />
                    </div>
                    <div>
                      <h3>{t.write}</h3>
                      <a href="mailto:work@storm-traffic.com">
                        work@storm-traffic.com
                      </a>
                    </div>
                  </div>
                </>
              )}
              {modal === "cv" && (
                <>
                  <h2 id="modal-title">{t.sendCV}</h2>
                  <p className="modal-intro">{t.review}</p>
                  <ApplicationForm
                    lang={lang}
                    selected={selected}
                    onBusy={busyChange}
                  />
                </>
              )}
              {modal === "privacy" && (
                <>
                  <h2 id="modal-title">{t.privacy}</h2>
                  <p>
                    {lang === "ru"
                      ? "Это портфолио-проект. Формы работают в деморежиме: данные и файлы не отправляются и не сохраняются."
                      : lang === "uk"
                        ? "Це портфоліо-проєкт. Форми працюють у деморежимі: дані та файли не надсилаються й не зберігаються."
                        : "This is a portfolio project. Forms run in demo mode: no data or files are transmitted or stored."}
                  </p>
                </>
              )}
            </dialog>
          </>,
          document.body,
        )}
    </div>
  );
}
