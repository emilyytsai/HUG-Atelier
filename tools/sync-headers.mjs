// Keeps every copy of the security headers in step with site/_headers.
//   npm run headers   rewrite vercel.json and the policy tag in index.html
//   npm run check     fail if any copy has drifted (no files changed)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const at = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const check = process.argv.includes("--check");

export function readHeaders() {
  const blocks = [];
  let current = null;
  for (const line of readFileSync(at("site/_headers"), "utf8").split("\n")) {
    if (/^\s*#/.test(line) || !line.trim()) continue;
    if (/^\S/.test(line)) {
      current = { path: line.trim(), headers: {} };
      blocks.push(current);
    } else if (current) {
      const i = line.indexOf(":");
      current.headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return blocks;
}

// A <meta> policy cannot carry frame-ancestors, and upgrade-insecure-requests
// would break plain-http local previews, so both stay header-only.
export function metaPolicy(csp) {
  return csp
    .split(";")
    .map((d) => d.trim())
    .filter((d) => d && !/^(frame-ancestors|upgrade-insecure-requests)\b/.test(d))
    .join("; ");
}

function expected() {
  const blocks = readHeaders();
  const vercel = {
    outputDirectory: "site",
    headers: blocks.map((b) => ({
      source: b.path === "/*" ? "/(.*)" : b.path,
      headers: Object.entries(b.headers).map(([key, value]) => ({ key, value })),
    })),
  };
  const csp = blocks.find((b) => b.path === "/*").headers["Content-Security-Policy"];
  const html = readFileSync(at("site/index.html"), "utf8").replace(
    /(<meta http-equiv="Content-Security-Policy" content=")[^"]*(")/,
    `$1${metaPolicy(csp)}$2`,
  );
  return { "vercel.json": `${JSON.stringify(vercel, null, 2)}\n`, "site/index.html": html };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let drift = 0;
  for (const [file, text] of Object.entries(expected())) {
    let current = "";
    try {
      current = readFileSync(at(file), "utf8");
    } catch {}
    if (current === text) continue;
    if (check) {
      console.error(`${file} is out of step with site/_headers. Run: npm run headers`);
      drift++;
    } else {
      writeFileSync(at(file), text);
      console.log(`updated ${file}`);
    }
  }
  if (drift) process.exit(1);
  if (check) console.log("Security headers match everywhere.");
}
