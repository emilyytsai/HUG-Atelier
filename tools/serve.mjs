// Local preview server: `npm run serve`, then open http://localhost:8080
// Serves the site/ folder read-only, with the headers from site/_headers.
//
// `npm run serve -- --lan` also lets a tablet on the same network open it.
// That is plain http: use it only on your own hotspot, never on venue or
// guest wifi. For events, the hosted https link is safer and works offline.
import { createServer } from "node:http";
import { createReadStream, realpathSync, statSync } from "node:fs";
import { extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { isIP } from "node:net";
import { networkInterfaces } from "node:os";
import { readHeaders } from "./sync-headers.mjs";

const ROOT = realpathSync(fileURLToPath(new URL("../site", import.meta.url)));
const PORT = Number(process.env.PORT) || 8080;
const LAN = process.argv.includes("--lan");
const HOST = LAN ? "0.0.0.0" : "127.0.0.1";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
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

// Checked against the normalised path, after "..", "%2f" and the like are resolved.
const PUBLIC =
  /^(?:index\.html|products\.js|sw\.js|manifest\.webmanifest|robots\.txt|assets\/(?:css\/[^/]+\.css|js\/[^/]+\.js|fonts\/[^/]+\.(?:woff2|txt)|icons\/[^/]+\.(?:svg|png)|products\/(?:[^/]+\/)*[^/]+\.(?:webp|avif|jpe?g|png)))$/i;

// Same headers as the hosted site, minus the https-only ones.
const SITE = readHeaders().find((b) => b.path === "/*").headers;
const HEADERS = { ...SITE };
delete HEADERS["Strict-Transport-Security"];
HEADERS["Content-Security-Policy"] = HEADERS["Content-Security-Policy"]
  .split(";")
  .map((d) => d.trim())
  .filter((d) => d && !d.startsWith("upgrade-insecure-requests"))
  .join("; ");

// Only answer to this machine's own names or plain IP addresses. Blocks DNS
// rebinding, where a web page points its own domain at this server.
function hostAllowed(host = "") {
  const name = host.replace(/:\d+$/, "").replace(/^\[|\]$/g, "").toLowerCase();
  return name === "localhost" || isIP(name) !== 0;
}

function send(res, status, body = "") {
  res.writeHead(status, { ...HEADERS, "Content-Type": "text/plain; charset=utf-8" }).end(body);
}

function locate(rawUrl) {
  let path;
  try {
    path = decodeURIComponent(new URL(rawUrl, "http://x").pathname);
  } catch {
    return null;
  }
  if (path.includes("\0") || path.includes("\\")) return null;
  if (path === "/") path = "/index.html";
  const file = resolve(ROOT, `.${path}`);
  const rel = relative(ROOT, file).split(sep).join("/");
  if (!rel || rel.startsWith("..") || rel.split("/").some((part) => part.startsWith("."))) return null;
  if (!PUBLIC.test(rel)) return null;
  try {
    const real = realpathSync(file);
    if (!real.startsWith(ROOT + sep)) return null; // symlink pointing outside site/
    const info = statSync(real);
    return info.isFile() ? { file: real, size: info.size } : null;
  } catch {
    return null;
  }
}

createServer((req, res) => {
  if (!hostAllowed(req.headers.host)) return send(res, 421, "Misdirected request");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return send(res, 405, "Method not allowed");
  }
  const found = locate(req.url);
  if (!found) return send(res, 404, "Not found");
  res.writeHead(200, {
    ...HEADERS,
    "Content-Type": TYPES[extname(found.file).toLowerCase()] || "application/octet-stream",
    "Content-Length": found.size,
    "Cache-Control": "no-cache",
  });
  if (req.method === "HEAD") return res.end();
  createReadStream(found.file)
    .on("error", () => res.destroy())
    .pipe(res);
})
  .on("clientError", (_, socket) => socket.destroy())
  .listen(PORT, HOST, () => {
    console.log(`HUG Atelier on http://localhost:${PORT}`);
    if (LAN) {
      const ips = Object.values(networkInterfaces())
        .flat()
        .filter((n) => n && n.family === "IPv4" && !n.internal)
        .map((n) => `http://${n.address}:${PORT}`);
      console.log(`LAN mode: on the tablet, open ${ips.join(" or ") || "http://<this-computer's-ip>:" + PORT}`);
      console.log("Use your own hotspot only. On shared wifi, anyone nearby can read or alter what the tablet sees.");
    }
  });
