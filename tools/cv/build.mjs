// Builds assets/cv/Jack-Milka-CV-{EN,UA,RU}.pdf and the contact-free upwork/Jack-Milka-CV.pdf from tools/cv/cv.html.
// Set CV_PREVIEW_DIR to also render JPEG page previews there for review.
// Usage: see tools/cv/README.md.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const deps = createRequire(join(resolve(process.env.CV_DEPS || here), 'package.json'));
const puppeteer = deps('puppeteer-core');
const { PDFDocument, PDFName, PDFString } = deps('pdf-lib');

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PREVIEW = process.env.CV_PREVIEW_DIR;
if (PREVIEW) mkdirSync(PREVIEW, { recursive: true });

// key: preview prefix · query: cv.html parameters · file: output path from the repository root.
const META = {
  en: { query: 'lang=en', file: 'assets/cv/Jack-Milka-CV-EN.pdf', lang: 'en-US', title: 'Jack Milka — CV — UI/UX & Digital Product Designer', subject: 'Curriculum vitae of Jack Milka, UI/UX & Digital Product Designer' },
  ru: { query: 'lang=ru', file: 'assets/cv/Jack-Milka-CV-RU.pdf', lang: 'ru-RU', title: 'Jack Milka — Резюме — UI/UX и продуктовый дизайнер', subject: 'Резюме Jack Milka, UI/UX и продуктовый дизайнер' },
  uk: { query: 'lang=uk', file: 'assets/cv/Jack-Milka-CV-UA.pdf', lang: 'uk-UA', title: 'Jack Milka — Резюме — UI/UX та продуктовий дизайнер', subject: 'Резюме Jack Milka, UI/UX та продуктовий дизайнер' },
  // Upwork edition: no personal contacts, links point into the /upwork/ copy of the site.
  upwork: { query: 'lang=en&edition=upwork', file: 'upwork/Jack-Milka-CV.pdf', lang: 'en-US', title: 'Jack Milka — CV — UI/UX & Digital Product Designer', subject: 'Curriculum vitae of Jack Milka, UI/UX & Digital Product Designer' },
};

const footer = `
  <div style="width:100%;padding:0 16mm;display:flex;justify-content:space-between;font:6.5pt Helvetica,Arial,sans-serif;letter-spacing:0.12em;color:#8a8a8a;">
    <span>JACK MILKA — MLK.DESIGN</span>
    <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
  </div>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  for (const [key, meta] of Object.entries(META)) {
    const page = await browser.newPage();
    await page.goto(`${pathToFileURL(join(here, 'cv.html')).href}?${meta.query}`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('body[data-ready="true"]');
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({
      format: 'A4',
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: footer,
      tagged: true,
      outline: false,
    });
    await page.close();

    const doc = await PDFDocument.load(pdf);
    doc.setTitle(meta.title, { showInWindowTitleBar: true });
    doc.setAuthor('Jack Milka');
    doc.setSubject(meta.subject);
    doc.setKeywords(['Jack Milka', 'UI/UX', 'Product Design', 'CV', 'MLK.DESIGN']);
    doc.setCreator('MLK.DESIGN');
    doc.setProducer('MLK.DESIGN');
    doc.setLanguage(meta.lang);
    doc.catalog.set(PDFName.of('Lang'), PDFString.of(meta.lang));
    const target = join(root, meta.file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, await doc.save());
    console.log(`${meta.file}: ${doc.getPageCount()} pages, ${(readFileSync(target).length / 1024).toFixed(0)} KB`);

    if (PREVIEW) execFileSync('swift', [join(here, 'render-pages.swift'), target, PREVIEW, key], { stdio: 'inherit' });
  }
} finally {
  await browser.close();
}
