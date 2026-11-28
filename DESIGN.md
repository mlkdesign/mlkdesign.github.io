# MLK.STUDIO interface contract

## Direction

- Mode: production, preserve.
- Register: personal portfolio / creative studio.
- Anchor: the existing MLK.STUDIO Swiss-minimal visual language: monochrome surfaces, Noto Sans 300, wide tracking, hairline rules, square corner markers and restrained motion.
- Scope: targeted evolution of social links and the project-request modal. Keep the existing information architecture, copy voice, field names and layout system intact.

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

## Project-request modal layout

- Alignment: the form starts on the menu line — the modal's first column ends where the header brand column ends (`--page-inset` + 36 % of the inner width), with the same 15 px gap as the navigation.
- Left column: no image. Instagram, LinkedIn, Behance, Upwork, Telegram and WhatsApp are square tiles on a faint grid like the team section (columns counted from the right edge of the tile area, which keeps a `--contacts-gap` before the form; rows centred, cell `min(125px, 25cqw, 15cqh)`), placed unevenly via `--k` (column from the right) and `--r` (row from the centre).
- Tiles: icon above the network name; black at 10 % with black icon and text at rest, solid black with white icon and text on hover and keyboard focus.
- Fields: name and email share one row from 1101 px; project details stay full width.
- Notice: to the right of the submit button (below it on mobile), with the send status underneath, a short privacy notice links to `/privacy-policy/` (new tab, so the form keeps its input). There is no consent checkbox: replies rely on pre-contract steps at the visitor's request.
- Mobile (≤ 800 px): form first, tiles below it in a staggered three-column checkerboard.
- The same markup is used on the home page and the case pages, and both send to the same Formspree endpoint.

## Legal pages and privacy

- `/privacy-policy/` and `/legal/` share `legal.css` and `legal.js`; both languages live in the page and `html[lang]` shows one (English without JavaScript). The language preference is the site's `mlk-language`.
- Default language: Ukrainian for visitors whose browser language is Ukrainian or whose time zone is in Ukraine, English elsewhere; a stored choice always wins.
- The site sets no cookies and loads no analytics, so there is no cookie banner. Adding analytics or any tracker requires a consent banner first (off by default, equal Accept / Reject, Cookie Settings link) and an update to the policy.
- Noto Sans 300 is self-hosted (`assets/fonts/NotoSans-300.woff2`, Latin + Cyrillic subset) so pages make no requests to Google Fonts.
- Legal links (Privacy Policy, Legal Information) sit at the bottom of the closing call-to-action on every page.
- Never publish the registered address, RNOKPP or other personal identifiers without the owner's confirmation.

## Home social-links row

- Content: the same six networks as the project-request tiles: Instagram, LinkedIn, Behance, Upwork, Telegram and WhatsApp, using the same 16 px monochrome SVG family and accessible names.
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

## Floating panels and the closing block

- The case offer ("Like this project?") and the cookie banner sit 15 px from the viewport edges. While the orange closing block scrolls into view they lift by its visible height (`--footer-overlap`, set in JS), so they stay inside the dark area.

## Awards

- Preserve the Swiss grid and existing typography. The heading sits above the certificates at the main right-column anchor, using the Selected works heading scale and reveal animation; only the small introduction remains on the left.
- Keep three 300 px portrait tiles in a row (930 px including gaps) until the right column runs out of room; only then scale the three columns down to fit. Do not change tile size with page scroll. At 800 px and below, use a native horizontal scroll strip with 300 px cards (82vw on narrow phones), a glimpse of the next card, proximity snapping and no buttons. Keep the gallery keyboard-focusable and retain the existing localized section label.
- TopDesignKing uses the official transparent ribbon-neon.png, displayed at 120 px instead of 80 px. Its tile uses rgba(255,255,255,0.1), matching the unheated logo pixels at the bottom of the site. Never use a fixed embed or fixed award badge.
- Dates: MR.BONE 2026-11-20 and MLK.STUDIO 2026-10-31 from the supplied WD Awards PDFs; TopDesignKing 2026-11-19 supplied directly by the owner on 2026-11-19.
- Keep certificate 1.06 scale and ribbon scale/10-degree hover and focus motion, visible keyboard focus and reduced-motion handling. English fallback and Ukrainian use the existing translation bindings.
- Add Awards to desktop, mobile and project-form navigation. Apply the same section to studio, personal portfolio and generated Upwork editions through their existing build/deployment process.

## Banana Padel case

- Studio website only for now. Add Banana Padel as the third Selected works card and the third entry in related projects, keeping the existing portfolio layout and transitions.
- Use the supplied portrait cover as-is. The case uses the existing sticky information column and long-form story styles, with English and Ukrainian copy covering product design, iOS/Android development, the admin panel and marketing website. Add screenshots later; do not fabricate them or invent technology choices or delivery metrics.
- Both project destination buttons say View on App Store (localized in Ukrainian) and open the owner-supplied Apple listing, never the marketing website. Keep a static canonical URL, project metadata and image description.
