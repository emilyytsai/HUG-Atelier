// Local preview server: `npm run serve`, then open http://localhost:8080
// Serves this folder read-only with the same security headers as _headers.
// Add `-- --lan` to reach it from a tablet on the same wifi.
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.argv.includes("--lan") ? "0.0.0.0" : "127.0.0.1";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

// Only what the site needs is served; tooling and dotfiles stay private.
const PUBLIC = /^\/(?:index\.html|products\.js|sw\.js|manifest\.webmanifest|robots\.txt|assets\/.+)$/;

const HEADERS = {
  "Content-Security-Policy":
    "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; manifest-src 'self'; worker-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self), screen-wake-lock=(self)",
  "X-Robots-Tag": "noindex, nofollow",
};

createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  let path;
  try {
    path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  if (path === "/") path = "/index.html";
  const file = normalize(join(ROOT, path));
  if (!PUBLIC.test(path) || path.includes("\0") || !file.startsWith(ROOT + sep)) {
    res.writeHead(404, HEADERS).end("Not found");
    return;
  }
  let info;
  try {
    info = statSync(file);
  } catch {
    info = null;
  }
  if (!info || !info.isFile()) {
    res.writeHead(404, HEADERS).end("Not found");
    return;
  }
  res.writeHead(200, {
    ...HEADERS,
    "Content-Type": TYPES[extname(file).toLowerCase()] || "application/octet-stream",
    "Content-Length": info.size,
    "Cache-Control": "no-cache",
  });
  if (req.method === "HEAD") res.end();
  else createReadStream(file).pipe(res);
}).listen(PORT, HOST, () => {
  console.log(`HUG Atelier on http://${HOST === "0.0.0.0" ? "<this-computer's-ip>" : "localhost"}:${PORT}`);
});
