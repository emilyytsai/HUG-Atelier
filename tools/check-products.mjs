// Checks site/products.js before publishing: `npm run check-products`
// - the same notes the page shows (it runs the page's own site/assets/js/catalog.js)
// - every photo exists, with the exact same capital letters (Macs ignore
//   case, hosting does not, so this catches photos that vanish once online)
// - photos are a sensible size and close to portrait 4:5
// Exits with an error only when something will not show, so a deploy that
// runs this stops before publishing a broken lookbook.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const SITE = fileURLToPath(new URL("../site/", import.meta.url));
let problems = 0;
let advice = 0;
const fail = (text) => {
  problems++;
  console.log(`  ✗ ${text}`);
};
// Worth fixing, but everything still shows: does not fail a deploy.
const hint = (text) => {
  advice++;
  console.log(`  ! ${text}`);
};

// products.js and catalog.js run in an empty context with no access to this
// computer; only plain data (JSON) comes back out.
const ctx = vm.createContext(Object.create(null), {
  codeGeneration: { strings: false, wasm: false },
  microtaskMode: "afterEvaluate",
});
const run = (code, filename) => new vm.Script(code, { filename }).runInContext(ctx, { timeout: 1000 });
run("var window = {};", "setup.js");
try {
  run(readFileSync(join(SITE, "products.js"), "utf8"), "products.js");
} catch (err) {
  const where = (err.stack || "").match(/products\.js:(\d+)/);
  console.log(`✗ products.js has a mistake${where ? ` near line ${where[1]}` : ""}: ${err.message}`);
  console.log("  Usually a missing comma, bracket or straight quote on that line or just above it.");
  process.exit(1);
}
run(readFileSync(join(SITE, "assets/js/catalog.js"), "utf8"), "catalog.js");
const { pieces, notes } = JSON.parse(run("JSON.stringify(window.HUG_readCatalog(window.HUG_ATELIER, null))", "read.js"));

console.log(`products.js: ${pieces.length} piece${pieces.length === 1 ? "" : "s"} will show\n`);
if (notes.length) {
  console.log("Notes (the page shows these too)");
  notes.forEach((n) => (n.serious ? fail : hint)(n.text));
  console.log("");
}
if (!pieces.length) fail("no pieces would show");

function exactExists(rel) {
  let dir = SITE;
  for (const part of rel.split("/")) {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return "missing";
    }
    if (!entries.includes(part)) return entries.some((e) => e.toLowerCase() === part.toLowerCase()) ? "case" : "missing";
    dir = join(dir, part);
  }
  return "ok";
}

function dimensions(path) {
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

const used = new Set();
for (const piece of pieces) {
  console.log(piece.name);
  for (const rel of piece.images) {
    used.add(rel);
    const found = exactExists(rel);
    if (found === "missing") {
      fail(`${rel}: file not found`);
      continue;
    }
    if (found === "case") {
      const real = readdirSync(join(SITE, dirname(rel))).find((e) => e.toLowerCase() === basename(rel).toLowerCase());
      fail(`${rel}: the capital letters differ from the file (${real}). It shows on a Mac but not once hosted.`);
      continue;
    }
    const path = join(SITE, rel);
    const kb = Math.round(statSync(path).size / 1024);
    if (kb > 600) hint(`${rel}: ${kb} KB is heavy for a tablet; aim for under 400 KB`);
    const wh = dimensions(path);
    if (wh) {
      const [w, h] = wh;
      if (Math.abs(w / h - 0.8) > 0.08) hint(`${rel}: ${w} × ${h} is not close to portrait 4:5, so the edges will be cropped`);
      if (w < 1000) hint(`${rel}: ${w} px wide looks soft on a tablet; aim for 1600 × 2000`);
    }
  }
}

// Photos in the folder that no piece uses are still public once hosted.
const unused = readdirSync(join(SITE, "assets/products")).filter(
  (f) => !f.startsWith(".") && !used.has(`assets/products/${f}`) && statSync(join(SITE, "assets/products", f)).isFile(),
);
if (unused.length) {
  console.log("\nIn assets/products/ but not shown (still downloadable once hosted)");
  unused.forEach((f) => hint(f));
}

console.log(
  problems
    ? `\n${problems} thing${problems > 1 ? "s" : ""} to fix.`
    : advice
      ? `\nEverything will show. ${advice} suggestion${advice > 1 ? "s" : ""} above.`
      : "\nAll good.",
);
process.exit(problems ? 1 : 0);
