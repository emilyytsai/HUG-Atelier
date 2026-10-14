// Checks site/products.js before publishing: `npm run check-products`
// - the file reads without typos
// - every photo exists, with the exact same capital letters (Macs ignore
//   case, hosting does not, so this catches photos that vanish once online)
// - photos are a sensible size and close to portrait 4:5
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const SITE = fileURLToPath(new URL("../site/", import.meta.url));
const file = join(SITE, "products.js");
let problems = 0;
let advice = 0;
const warn = (text) => {
  problems++;
  console.log(`  ✗ ${text}`);
};
// Worth fixing, but the photo still shows: does not fail a deploy.
const hint = (text) => {
  advice++;
  console.log(`  ! ${text}`);
};

// products.js runs in an empty context with no access to this computer, and
// only plain data (JSON) comes back out.
let catalog;
try {
  const ctx = vm.createContext(Object.create(null), { codeGeneration: { strings: false, wasm: false }, microtaskMode: "afterEvaluate" });
  vm.runInContext("var window = {};", ctx);
  new vm.Script(readFileSync(file, "utf8"), { filename: "products.js" }).runInContext(ctx, { timeout: 1000 });
  catalog = JSON.parse(vm.runInContext("JSON.stringify(window.HUG_ATELIER) || 'null'", ctx, { timeout: 1000 }));
} catch (err) {
  const where = (err.stack || "").match(/products\.js:(\d+)/);
  console.log(`✗ products.js has a mistake${where ? ` near line ${where[1]}` : ""}: ${err.message}`);
  console.log("  Usually a missing comma, bracket or straight quote on that line or just above it.");
  process.exit(1);
}
if (!catalog || !Array.isArray(catalog.pieces)) {
  console.log("✗ products.js should set window.HUG_ATELIER = { ..., pieces: [ ... ] }");
  process.exit(1);
}

function exactExists(rel) {
  let dir = SITE;
  for (const part of rel.split("/")) {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return "missing";
    }
    if (!entries.includes(part)) {
      return entries.some((e) => e.toLowerCase() === part.toLowerCase()) ? "case" : "missing";
    }
    dir = join(dir, part);
  }
  return "ok";
}

function size(path) {
  const b = readFileSync(path);
  if (b.toString("ascii", 1, 4) === "PNG") return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i < b.length - 9; ) {
      if (b[i] !== 0xff) return null;
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + b.readUInt16BE(i + 2);
    }
    return null;
  }
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const kind = b.toString("ascii", 12, 16);
    if (kind === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (kind === "VP8L") return [1 + (((b[22] & 0x3f) << 8) | b[21]), 1 + (((b[24] & 0xf) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6))];
    if (kind === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  }
  return null;
}

const shown = catalog.pieces.filter((p) => p && p.hidden !== true);
console.log(`Checking ${shown.length} pieces in products.js\n`);
for (const [n, p] of catalog.pieces.entries()) {
  if (!p || p.hidden === true) continue;
  const label = typeof p.name === "string" && p.name.trim() ? p.name.trim() : `Piece ${n + 1}`;
  console.log(label);
  if (!p.name) warn("has no name");
  const list = Array.isArray(p.images) ? p.images : p.images ? [p.images] : p.image ? [p.image] : [];
  if (!list.length) warn("has no photo");
  for (const raw of list) {
    let rel = String(raw).trim().replace(/^\.\//, "").replace(/^\/+/, "").replace(/^site\//, "");
    if (!rel.includes("/")) rel = `assets/products/${rel}`;
    if (!/^assets\/products\/.+\.(webp|avif|jpe?g|png)$/i.test(rel) || /[%\\?#]/.test(rel) || rel.split("/").includes("..")) {
      warn(`${raw}: photos must be .webp, .jpg, .png or .avif files in assets/products/`);
      continue;
    }
    const found = exactExists(rel);
    if (found === "missing") {
      warn(`${rel}: file not found`);
      continue;
    }
    if (found === "case") {
      const real = readdirSync(join(SITE, dirname(rel))).find((e) => e.toLowerCase() === basename(rel).toLowerCase());
      warn(`${rel}: capital letters differ from the file (${real}). It will not show once hosted.`);
      continue;
    }
    const path = join(SITE, rel);
    const kb = Math.round(statSync(path).size / 1024);
    if (kb > 600) hint(`${rel}: ${kb} KB is heavy for a tablet; aim for under 400 KB`);
    const wh = size(path);
    if (wh) {
      const [w, h] = wh;
      if (Math.abs(w / h - 0.8) > 0.08) hint(`${rel}: ${w} × ${h} is not close to portrait 4:5, so the edges will be cropped`);
      if (w < 1000) hint(`${rel}: ${w} px wide looks soft on a tablet; aim for 1600 × 2000`);
    }
  }
}
console.log(
  problems
    ? `\n${problems} thing${problems > 1 ? "s" : ""} to fix.`
    : advice
      ? `\nEverything will show. ${advice} suggestion${advice > 1 ? "s" : ""} above.`
      : "\nAll good.",
);
process.exit(problems ? 1 : 0);
