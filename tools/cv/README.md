# CV build

`cv.html` is the single source for all PDFs (`?lang=en` / `?lang=uk` / `?lang=ru`); all text lives in its `CONTENT` object.
Fonts are static Noto Sans weights in `fonts/` so the PDFs embed real TrueType fonts with Cyrillic.

Rebuild after editing (macOS, Google Chrome installed):

```bash
mkdir -p /tmp/cv-deps && (cd /tmp/cv-deps && npm init -y >/dev/null && npm i puppeteer-core@23.11.1 pdf-lib@1.17.1)
CV_DEPS=/tmp/cv-deps node tools/cv/build.mjs
```

Outputs: `assets/cv/Jack-Milka-CV-EN.pdf`, `assets/cv/Jack-Milka-CV-UA.pdf` and `assets/cv/Jack-Milka-CV-RU.pdf`.
The site links EN (English site) and UA (Ukrainian site) directly, so the browser's own PDF viewer shows them;
RU is kept in the repository but not linked. Keep each CV at two pages; the build prints the page count.
Add `CV_PREVIEW_DIR=/some/folder` to also render JPEG page previews for a visual check.
