// Static export for hosts without a server (GitHub Pages): prerenders both pages to HTML and
// bundles the client code that hydrates them. Paths are relative, so the folder works under any URL.
//
//   node scripts/build-static.mjs <out-dir>
import { build } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.resolve(process.argv[2] || path.join(root, "static"));
const tmp = path.join(root, ".static-tmp");
const VERSION = Date.now().toString(36);

// Root-absolute URLs from the Next app → paths relative to the exported folder (index.html and referral.html sit side by side).
const relativize = (text) =>
  text
    .replace(/(["'`(])\/(assets|fonts)\//g, "$1$2/")
    .replace(/(href[=:]\s*")\/referral"/g, '$1referral.html"')
    .replace(/(href[=:]\s*")\/#/g, "$1index.html#")
    .replace(/(href[=:]\s*")\/"/g, '$1index.html"')
    .replace(/\?\s*"\/"\s*:\s*""/g, '?"index.html":""');

const common = {
  bundle: true,
  jsx: "automatic",
  loader: { ".json": "json" },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
  tsconfig: path.join(root, "tsconfig.json"),
};

await rm(tmp, { recursive: true, force: true });
await mkdir(tmp, { recursive: true });

// 1. Client bundle: hydrates whichever page the HTML declares.
await writeFile(
  path.join(tmp, "client.tsx"),
  `import { hydrateRoot } from "react-dom/client";
import StormSite from "@/components/storm-site";
const el = document.getElementById("root")!;
hydrateRoot(el, <StormSite referral={el.dataset.page === "referral"} />);
`,
);
await build({ ...common, entryPoints: [path.join(tmp, "client.tsx")], outfile: path.join(tmp, "app.js"), minify: true, format: "esm", platform: "browser" });

// 2. Server-side render bundle, used only here to produce the HTML.
await writeFile(
  path.join(tmp, "render.tsx"),
  `import { renderToString } from "react-dom/server";
import StormSite from "@/components/storm-site";
export const render = (referral: boolean) => renderToString(<StormSite referral={referral} />);
`,
);
await build({ ...common, entryPoints: [path.join(tmp, "render.tsx")], outfile: path.join(tmp, "render.mjs"), format: "esm", platform: "node", packages: "external" });

// 3. Styles: fonts + globals in one file.
await writeFile(path.join(tmp, "styles.css"), `@import "../app/fonts.css";\n@import "../app/globals.css";\n`);
await build({ ...common, entryPoints: [path.join(tmp, "styles.css")], outfile: path.join(tmp, "style.css"), minify: true, external: ["/assets/*", "/fonts/*"] });

const { render } = await import(pathToFileURL(path.join(tmp, "render.mjs")).href);

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(path.join(root, "public/assets"), path.join(out, "assets"), { recursive: true });
await cp(path.join(root, "public/fonts"), path.join(out, "fonts"), { recursive: true });
await cp(path.join(root, "public/favicon.svg"), path.join(out, "favicon.svg"));
await writeFile(path.join(out, "app.js"), relativize(await readFile(path.join(tmp, "app.js"), "utf8")));
await writeFile(path.join(out, "style.css"), relativize(await readFile(path.join(tmp, "style.css"), "utf8")));

const pages = [
  {
    file: "index.html",
    referral: false,
    title: "STORM TRAFFIC — media buying team",
    description: "STORM TRAFFIC is a strong media buying team: quality traffic in Gambling, Finance and Crypto, open vacancies and a referral program.",
  },
  {
    file: "referral.html",
    referral: true,
    title: "Referral program — STORM TRAFFIC",
    description: "Recommend a media buyer or team to STORM TRAFFIC. Earn a referral bonus of up to $5000. Explore vacancies and recommend a candidate.",
  },
];
for (const page of pages) {
  const body = relativize(render(page.referral));
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#151516" />
    <meta name="robots" content="noindex" />
    <title>${page.title}</title>
    <meta name="description" content="${page.description}" />
    <link rel="icon" href="favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="style.css?v=${VERSION}" />
  </head>
  <body>
    <div id="root" data-page="${page.referral ? "referral" : "home"}">${body}</div>
    <script type="module" src="app.js?v=${VERSION}"></script>
  </body>
</html>
`;
  await writeFile(path.join(out, page.file), html);
}
await rm(tmp, { recursive: true, force: true });
console.log(`Static site written to ${out}`);
