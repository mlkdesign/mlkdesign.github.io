# MLK.STUDIO interface contract

## Direction

- Mode: production, preserve.
- Register: personal portfolio / creative studio.
- Anchor: the existing MLK.STUDIO Swiss-minimal visual language: monochrome surfaces, Noto Sans 300, wide tracking, hairline rules, square corner markers and restrained motion.
- Scope: targeted evolution of the project-request modal only. Keep the existing information architecture, copy voice, field names and social links intact while enabling real form delivery.

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

## Project-request delivery

- Delivery: submit the existing three-field form to the verified Formspree endpoint `https://formspree.io/f/meaajpvl`, configured to notify `milka19051995@gmail.com`; keep the modal open so the visitor always receives an in-context result.
- Validation: name, email and project details are required. Validate only on submit, use the browser's field-level guidance and add one concise form-level message.
- Progress: while a request is being sent, disable the submit button, set the form's busy state and change both rolling button labels to the localized sending text.
- Success: reset the fields only after a confirmed successful response and show a persistent localized status beside the button.
- Failure: preserve all entered values and show a localized retry message that also points to the existing Telegram and WhatsApp links.
- Accessibility: expose status changes through a pre-rendered `role="status"` live region, keep native form semantics, and never rely on color alone to communicate state.
- Security: rely on Formspree's submission filtering and keep credentials or private keys out of the repository; the public form endpoint is the only service identifier stored in the page.
