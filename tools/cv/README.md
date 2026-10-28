# CV build

`cv.html` is the single source for both PDFs (`?lang=en` / `?lang=ru`); all text lives in its `CONTENT` object.
Fonts are static Noto Sans weights in `fonts/` so the PDFs embed real TrueType fonts with Cyrillic.

Rebuild after editing (macOS, Google Chrome installed):

```bash
mkdir -p /tmp/cv-deps && (cd /tmp/cv-deps && npm init -y >/dev/null && npm i puppeteer-core@23.11.1 pdf-lib@1.17.1)
CV_DEPS=/tmp/cv-deps node tools/cv/build.mjs
```

Outputs: `assets/cv/Jack-Milka-CV-EN.pdf`, `assets/cv/Jack-Milka-CV-RU.pdf`, page previews in `assets/cv/preview/`
(used by the `/cv/` viewer on phones and browsers without a built-in PDF viewer) and `assets/cv/pages.json`.
Keep each CV at two pages; the build prints the page count.
