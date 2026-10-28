# MLK.DESIGN personal portfolio interface contract

## Direction

- Mode: production, preserve.
- Register: personal portfolio.
- Anchor: the existing MLK.STUDIO Swiss-minimal visual language: monochrome surfaces, Noto Sans 300, wide tracking, hairline rules, square corner markers and restrained motion.
- Scope: personalize the original site exclusively on `milka-cv`. Preserve typography, animations, portfolio images, case content and the original layout system. Services becomes Skills, About becomes About me, and Experience replaces Team.

## Existing tokens

| Role | Token |
| --- | --- |
| Site background | `#0b0b0b` |
| Dark-surface text | `#f4efe3` |
| Modal background | `#ffffff` |
| Modal text | `#0a0a0a` |
| Muted modal text | `rgba(10, 10, 10, 0.58)` |
| Modal hairline | `rgba(10, 10, 10, 0.24)` |
| Brand accent | `#ff5a1f` |
| Link resting opacity | `0.6` on dark and light surfaces |
| Link hover/focus opacity | `1` on dark and light surfaces |
| Typeface | `"Noto Sans", "Helvetica Neue", Arial, sans-serif`, weight 300 |
| Spacing base | 4 px, using the established `rem` and `clamp()` scale |
| Radius | 0 for form and contact controls |
| Motion | 200–400 ms with `cubic-bezier(0.2, 0.8, 0.2, 1)`; disabled where the existing mobile/reduced-motion rules require it |

## Contact social-links row

- Location and layout: retain the existing social-media row at the bottom of the project-request modal, including its flex wrapping, spacing and text-roll hover treatment.
- Anatomy: Instagram, LinkedIn, Behance, Upwork, Telegram and WhatsApp are equal-priority native links. Every link receives a 16 px monochrome inline SVG from the same icon family while retaining its visible text label.
- Responsive behavior: preserve the existing wrapping row on desktop, tablet and mobile; do not introduce a separate direct-contact panel, borders or a second layout system.
- Interaction: keep the established opacity and rolling-text hover/focus animation, add a restrained pressed state and a visible keyboard focus ring. Existing mobile and reduced-motion behavior remains authoritative.
- Accessibility: every link has a descriptive accessible name; decorative SVGs are hidden from assistive technology; external links use `target="_blank"` and `rel="noopener noreferrer"`.
- No custom widget is introduced; native anchor keyboard behavior is retained.

## Home social-links row

- Content: mirror the Contact row with Instagram, LinkedIn, Behance, Upwork, Telegram and WhatsApp, using the same 16 px monochrome SVG family and accessible names.
- Desktop layout: preserve the hero grid anchor by keeping Instagram in the left column and distributing the remaining five links across the right side; the last link remains right-aligned.
- Responsive layout: below the safe single-row width, allow the six links to wrap with balanced spacing and no horizontal overflow.
- Interaction: all text and icons inherit the row's monochrome color and move from the global resting opacity to full opacity on hover and keyboard focus.

## Link contrast states

- Native links across dark and white surfaces use one global opacity contract: `0.6` at rest and `1` on hover or `:focus-visible`.
- Component-specific color transitions may add motion or framing, but must not override the full-opacity hover/focus result.
- Active and disabled states remain intentionally dimmer and are not treated as hover states.

## Project-request delivery

- Delivery: submit the existing three-field form to the verified Formspree endpoint `https://formspree.io/f/meaajpvl`, configured to notify `milka19051995@gmail.com`; keep the modal open so the visitor always receives an in-context result.
- Validation: name, email and project details are required. Validate only on submit, use the browser's field-level guidance and add one concise form-level message.
- Progress: while a request is being sent, disable the submit button, set the form's busy state and change both rolling button labels to the localized sending text.
- Success: reset the fields only after a confirmed successful response and show a persistent localized status beside the button.
- Failure: preserve all entered values and show a localized retry message that also points to the existing Telegram and WhatsApp links.
- Accessibility: expose status changes through a pre-rendered `role="status"` live region, keep native form semantics, and never rely on color alone to communicate state.
- Security: rely on Formspree's submission filtering and keep credentials or private keys out of the repository; the public form endpoint is the only service identifier stored in the page.

## Personal branch contract

- `main` remains the original studio website. No merge is performed. The personal branch publishes a combined GitHub Pages artifact after explicit owner authorization.
- Experience uses native `details`/`summary`, hairline separators and the existing type scale. Measured 350 ms disclosure transitions respect reduced motion; native controls remain functional without JavaScript.
- Experience contains five owner-supplied professional records after the requested removal of the studio entry in descending start-year order, preserving the supplied order for ties. Roles and company names stay in English; dates and descriptions are localized.
- The 5+ years and 30+ projects totals are provisional and require the owner's confirmation.
- CV: the hero `view CV` button opens `/cv/` in a new tab (EN default, EN/RU switch without reload, download of the selected PDF). PDFs are `assets/cv/Jack-Milka-CV-{EN,RU}.pdf`, generated from `tools/cv/` (see its README). Desktop browsers with a built-in PDF viewer embed the PDF; touch devices and browsers without one get page previews plus `open PDF`. The Experience CV link stays hidden to avoid a duplicate entry point.
- English is the first-visit default. The existing reload-based EN/UK mechanism remains, with a personal storage key shared by the home and case pages.
- Personal production URL: `https://mlkdesign.github.io/milka-cv/`. Canonical, Open Graph URLs and social images use this destination; case metadata preserves the project query parameter.
- Case forms use the same endpoint, validation, loading, success and retry flow as the original home form. No test inquiry is sent to the owner during verification.

## Verification — 2026-10-27

- JavaScript syntax checks and `git diff --check` pass.
- DOM checks pass for both languages, all five case routes, local asset references, section anchors, form labels, metadata and the hidden CV link.
- Selected-work image markup, card order and case routes match `main`; existing image files and `case.css` are unchanged.
- Both form handlers pass mocked validation, loading, duplicate-submit prevention, failure/retry and success checks. No live inquiry was submitted; delivery to the mailbox is not verified. The existing Formspree URL responds with HTTP 405 to GET, consistent with a POST-only endpoint.
- Native Chrome smoke check: animated hero, Experience disclosure, mobile navigation, Ukrainian language persistence into a case, modal and empty-form validation.
- Experience screenshots inspected at 375, 430, 768, 1024, 1440 and 1920 CSS px. Mobile Ukrainian hero and desktop English hero also inspected.
- Existing Matter.js delta warning observed; physics timings preserved. Full Lighthouse/axe and cross-browser checks were not run.

## GitHub Pages publication

- `.github/workflows/pages.yml` on `milka-cv` publishes tracked `main` content at `/` and tracked personal content at `/milka-cv/`. No local untracked files are uploaded.
- Pushes to `milka-cv` trigger this combined publication. The original `main` branch and its workflow remain untouched.
- The deployment environment allows `milka-cv` in addition to its existing rules.
- A future deployment from the unchanged workflow on `main` replaces the complete Pages artifact and removes `/milka-cv/`. Re-run this workflow with `milka-cv` selected to restore the personal path. A permanent unified deployment trigger requires a separately authorized workflow change on `main`.

## Targeted personal-site corrections

- Experience summary and disclosure use the same CSS grid: `--col-split` and the established 15 px gutter on desktop. Mobile keeps period/company metadata above full-width role and description, aligned to `--page-inset`.
- All three rolling-text mask families clip their own paint and use equal 1em row boxes. Existing easing, transform direction and transition durations are retained.
- Pixel canvases on home and cases render `MLK.DESIGN` at both viewport sizes; only text and required glyphs change.
- The hero CV link uses the genuine PDF path and download attribute. While the PDF is absent, `aria-disabled` and a click guard prevent a broken download; a localized title explains availability. Remove `aria-disabled` and `title` once the genuine PDF is added. The Experience CV link remains hidden until then.
- Ukrainian About heading starts with `Євгеній Мілка —`; English copy is unchanged.
- QA: existing DOM/localization/case/form checks pass. Native Chrome screenshots inspected at 375, 768, 1440 and 1920 px with an expanded Experience row; CV click stays on the page, EN/UK switches, focused Telegram text stays inside its mask. Console shows only the pre-existing Matter.js delta warning.

## Skills and professional experience update

- Ukrainian Skills 01 and 03 retain `UI/UX & Product Design` and `Motion & Interaction`; all descriptions and tags retain their existing translations.
- The remaining experience records and exact periods come from the owner’s brief. The MLK.STUDIO employment record was removed at the owner’s request. Zexter specialization and Unique Media remote/freelance/USA details appear inside their disclosures.
- Verified Zexter LinkedIn: `https://www.linkedin.com/company/zexter-tech` (the company profile links to `www.zexter.com`). Freelancehunt links use the owner-provided destination.
- X-IT links use the owner-confirmed `https://x-it.io` and `https://www.linkedin.com/company/x-it/`; the LinkedIn company profile points to that website. Unique Media links remain pending confirmation of the exact company identity; no guessed links are published.
- Disclosure links reuse the existing rolling social-link text masks and a small decorative outbound arrow. Section columns, native details controls and 350 ms disclosure animation are unchanged.
- QA: six bilingual rows and all six confirmed links pass DOM checks. Chrome verified matching role/description X-coordinates and no role overflow at 375, 768, 1440 and 1920 px. All six rows open and close; subsequent content moves by the disclosure height; browser console has no errors.

## Heading shuffle and MLK.DESIGN branding

- All interface brand links on home and case pages read `MLK.DESIGN`; personal names and SEO remain Jack Milka / Євгеній Мілка.
- Experience title uses the same `--col-split` grid and 15 px gutter as the other main headings. Employment rows retain their existing X-coordinates.
- Six main-page headings opt into `data-shuffle`. The original per-character implementation retains its 45 ms tick and 600 ms duration and starts on each character’s existing reveal delay.
- Reveal and shuffle share a single once-only visibility gate after the stair preloader. The sticky Contact heading also waits until `page-surface` no longer covers it.
- Character widths stay locked while shuffled. Translation resets cancel observers, reveal frames, active shuffles and pending timers before replacing text. Reduced motion shows final text and cancels active work.
- X-IT specialization is `Mobile App Design` in both languages, with the owner-provided mobile-app description. Its dates and links remain unchanged.
- QA: deterministic animation checks cover preloader gating, off-screen headings, covered sticky footer, original timings, no replay, mid-animation language reset and reduced-motion cancellation. Chrome verified all six headings, stable dimensions, no errors and equal heading X-coordinates at 375, 768, 1440 and 1920 px.

## Responsive selected-work cards

- Cards retain portrait 4:5 proportions. Desktop width uses `clamp(280px, 28vw, 480px)`, limiting the largest cards to 480 × 600 px. Mobile width uses `clamp(260px, 82vw, 350px)` for a visible next-card preview on phones.
- Card height depends on card width, so tall browser windows no longer stretch the gallery covers. The existing images, order, hover effects and case transitions are retained.
- Previous/next measure the rendered card width plus the actual CSS column gap on every click. Native smooth scrolling and boundary button states remain unchanged, including after resizing.
- QA: Chrome checked 375, 768, 1024, 1280, 1440, 1920 and 3840 px; 1280 px cards remain identical at 800 and 1400 px viewport heights. Desktop/mobile next and previous traverse the full gallery, clamp at both ends and update disabled states. No browser console errors.
