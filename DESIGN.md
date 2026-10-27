# Jack Milka personal portfolio interface contract

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

- `main` remains the original studio website. No merge or hosting changes are part of this work.
- Experience uses native `details`/`summary`, hairline separators and the existing type scale. Measured 350 ms disclosure transitions respect reduced motion; native controls remain functional without JavaScript.
- The supplied three experience entries describe practice areas, not invented employers or dated jobs.
- The 5+ years and 30+ projects totals are provisional and require the owner's confirmation.
- Add the genuine `assets/Jack-Milka-CV.pdf`, then remove `hidden` from the prepared CV link. No placeholder PDF is shipped.
- English is the first-visit default. The existing reload-based EN/UK mechanism remains, with a personal storage key shared by the home and case pages.
- Metadata has no personal canonical URL or `og:url` until a real hosting destination is agreed. Relative social images must be made absolute for that destination when deploying.
- Case forms use the same endpoint, validation, loading, success and retry flow as the original home form. No test inquiry is sent to the owner during verification.

## Verification — 2026-10-27

- JavaScript syntax checks and `git diff --check` pass.
- DOM checks pass for both languages, all five case routes, local asset references, section anchors, form labels, metadata and the hidden CV link.
- Selected-work image markup, card order and case routes match `main`; existing image files and `case.css` are unchanged.
- Both form handlers pass mocked validation, loading, duplicate-submit prevention, failure/retry and success checks. No live inquiry was submitted; delivery to the mailbox is not verified. The existing Formspree URL responds with HTTP 405 to GET, consistent with a POST-only endpoint.
- Native Chrome smoke check: animated hero, Experience disclosure, mobile navigation, Ukrainian language persistence into a case, modal and empty-form validation.
- Experience screenshots inspected at 375, 430, 768, 1024, 1440 and 1920 CSS px. Mobile Ukrainian hero and desktop English hero also inspected.
- Existing Matter.js delta warning observed; physics timings preserved. Full Lighthouse/axe and cross-browser checks were not run.
