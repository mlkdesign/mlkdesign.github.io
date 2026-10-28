// Builds assets/cv/Jack-Milka-CV-{EN,RU}.pdf from tools/cv/cv.html and
// renders page previews (assets/cv/preview/*.jpg) for the mobile viewer.
// Usage: see tools/cv/README.md.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const deps = createRequire(join(resolve(process.env.CV_DEPS || here), 'package.json'));
const puppeteer = deps('puppeteer-core');
const { PDFDocument, PDFName, PDFString } = deps('pdf-lib');

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = join(root, 'assets/cv');
const PREVIEW = join(OUT, 'preview');
mkdirSync(PREVIEW, { recursive: true });

const META = {
  en: { file: 'Jack-Milka-CV-EN.pdf', lang: 'en-US', title: 'Jack Milka — CV — UI/UX & Digital Product Designer', subject: 'Curriculum vitae of Jack Milka, UI/UX & Digital Product Designer' },
  ru: { file: 'Jack-Milka-CV-RU.pdf', lang: 'ru-RU', title: 'Jack Milka — Резюме — UI/UX и продуктовый дизайнер', subject: 'Резюме Jack Milka, UI/UX и продуктовый дизайнер' },
};

const footer = `
  <div style="width:100%;padding:0 16mm;display:flex;justify-content:space-between;font:6.5pt Helvetica,Arial,sans-serif;letter-spacing:0.12em;color:#8a8a8a;">
    <span>JACK MILKA — MLK.DESIGN</span>
    <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
  </div>`;

const pageCounts = {};
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  for (const [lang, meta] of Object.entries(META)) {
    const page = await browser.newPage();
    await page.goto(`${pathToFileURL(join(here, 'cv.html')).href}?lang=${lang}`, { waitUntil: 'networkidle0' });
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
    const target = join(OUT, meta.file);
    writeFileSync(target, await doc.save());
    pageCounts[lang] = doc.getPageCount();
    console.log(`${meta.file}: ${doc.getPageCount()} pages, ${(readFileSync(target).length / 1024).toFixed(0)} KB`);

    // Page previews for browsers that cannot show every page of an embedded PDF (iOS).
    readdirSync(PREVIEW).filter((f) => f.startsWith(`${lang}-`)).forEach((f) => rmSync(join(PREVIEW, f)));
    execFileSync('swift', [join(here, 'render-pages.swift'), target, PREVIEW, lang], { stdio: 'inherit' });
  }
} finally {
  await browser.close();
}
// The /cv/ viewer reads this to know how many preview pages to show.
writeFileSync(join(OUT, 'pages.json'), `${JSON.stringify(pageCounts)}\n`);
