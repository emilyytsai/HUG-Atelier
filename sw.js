/*
 * Offline copy of the lookbook, so a weak venue connection never shows a
 * blank screen. Pages, scripts and styles try the network first (edits show
 * up on the next reload); photos and fonts come from the local copy first
 * and refresh in the background.
 *
 * Bump VERSION after large changes to clear old copies on every device.
 */
const VERSION = "v1";
const SHELL = `hug-shell-${VERSION}`;
const MEDIA = `hug-media-${VERSION}`;

const CORE = [
  "./",
  "index.html",
  "products.js",
  "assets/css/app.css",
  "assets/js/app.js",
  "assets/fonts/bodoni-moda-latin.woff2",
  "assets/fonts/bodoni-moda-latin-ext.woff2",
  "assets/fonts/jost-latin.woff2",
  "assets/fonts/jost-latin-ext.woff2",
  "assets/icons/icon.svg",
  "manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== MEDIA).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const sameOrigin = (url) => url.origin === self.location.origin;
const isMedia = (url) => /\.(?:webp|avif|jpe?g|png|gif|svg|woff2?)$/i.test(url.pathname);

// The page sends its photo list so every piece is stored after one visit.
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "precache" || !Array.isArray(data.urls)) return;
  const urls = data.urls
    .slice(0, 200)
    .map((u) => {
      try {
        return new URL(u, self.location.href);
      } catch {
        return null;
      }
    })
    .filter((u) => u && sameOrigin(u) && isMedia(u));
  event.waitUntil(
    caches.open(MEDIA).then((cache) =>
      Promise.all(
        urls.map((u) =>
          cache.match(u).then((hit) => hit || fetch(u).then((res) => res.ok && cache.put(u, res)).catch(() => {})),
        ),
      ),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!sameOrigin(url)) return;

  if (isMedia(url)) {
    event.respondWith(
      caches.open(MEDIA).then((cache) =>
        cache.match(req).then((hit) => {
          const fresh = fetch(req)
            .then((res) => {
              if (res.ok && res.type === "basic") cache.put(req, res.clone());
              return res;
            })
            .catch(() => hit);
          if (hit) event.waitUntil(fresh);
          return hit || fresh;
        }),
      ),
    );
    return;
  }

  // Network first, but never wait more than 3 s on a weak connection.
  const network = fetch(req);
  event.waitUntil(
    network
      .then((res) => res.ok && res.type === "basic" && caches.open(SHELL).then((c) => c.put(req, res.clone())))
      .catch(() => {}),
  );
  const slow = new Promise((resolve) => setTimeout(resolve, 3000));
  event.respondWith(
    Promise.race([network.catch(() => null), slow]).then(
      (res) =>
        res ||
        caches
          .match(req, { ignoreSearch: true })
          .then((hit) => hit || (req.mode === "navigate" ? caches.match("index.html") : null))
          .then((hit) => hit || network),
    ),
  );
});
