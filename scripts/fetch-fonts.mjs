import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../src/assets/fonts");
mkdirSync(outDir, { recursive: true });

const FONTS_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&family=Caveat:wght@400;600&display=swap";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function attr(block, name) {
  const m = new RegExp(`${name}\\s*:\\s*([^;]+);`).exec(block);
  return m ? m[1].trim() : "";
}

async function download(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

const css = await (
  await fetch(FONTS_CSS_URL, { headers: { "User-Agent": UA } })
).text();

const blockRe = /@font-face\s*{([^}]*)}/g;
const urlRe = (block) => /url\(([^)]+)\)/.exec(block);

const seen = new Map();
const faces = [];

for (let m = blockRe.exec(css); m; m = blockRe.exec(css)) {
  const block = m[1];
  const family = attr(block, "font-family").replace(/['"]/g, "");
  const weight = attr(block, "font-weight") || "400";
  const style = attr(block, "font-style") || "normal";
  const range = attr(block, "unicode-range");
  const urlMatch = urlRe(block);
  if (!urlMatch || !family) continue;
  if (!range.includes("U+0000-00FF")) continue;

  const key = `${family}|${weight}|${style}`;
  if (seen.has(key)) continue;

  const slug = family.replace(/\s+/g, "");
  const filename =
    `${slug}-${weight}${style !== "normal" ? "-italic" : ""}.woff2`;
  const srcUrl = urlMatch[1].replace(/^["']|["']$/g, "");

  const buf = await download(srcUrl);
  writeFileSync(resolve(outDir, filename), buf);
  seen.set(key, filename);

  faces.push(
    `@font-face {\n  font-family: "${family}";\n  font-style: ${style};\n  font-weight: ${weight};\n  font-display: swap;\n  src: url("./${filename}") format("woff2");\n}`
  );
}

if (faces.length === 0) {
  throw new Error("No se encontraron @font-face en la respuesta de Google Fonts");
}

const cssOut = faces.join("\n\n") + "\n";
writeFileSync(resolve(outDir, "fonts.css"), cssOut);
console.log(`fuentes descargadas -> ${outDir}`);
for (const [k, f] of seen) console.log(`  ${k} -> ${f}`);