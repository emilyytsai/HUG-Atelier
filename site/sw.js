/*
 * Offline copy of the lookbook, so a weak venue connection never shows a
 * blank screen. Pages, scripts, styles and photos try the network first, so
 * edits show up on the next reload, and fall back to the stored copy when the
 * connection is slow or gone. Fonts and icons come from the stored copy.
 *
 * Bump VERSION after large changes to clear old copies on every device.
 */
const VERSION = "v7";
const SHELL = `hug-shell-${VERSION}`;
const MEDIA = `hug-media-${VERSION}`;

const CORE = [
  "./",
  "index.html",
  "products.js",
  "assets/css/app.css",
  "assets/js/guard.js",
  "assets/js/catalog.js",
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
      // Only this site's own old copies; other apps on the same domain are left alone.
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("hug-") && k !== SHELL && k !== MEDIA).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const sameOrigin = (url) => url.origin === self.location.origin;
const isMedia = (url) => /\.(?:webp|avif|jpe?g|png|gif|svg|woff2?)$/i.test(url.pathname);

// The page sends its photo list so every piece is stored after one visit, and
// photos of pieces taken out of products.js are dropped from the device.
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
  const keep = new Set(urls.map((u) => u.href));
  event.waitUntil(
    caches.open(MEDIA).then((cache) =>
      Promise.all([
        ...urls.map((u) =>
          cache.match(u).then((hit) => hit || fetch(u).then((res) => res.ok && cache.put(u, res)).catch(() => {})),
        ),
        cache.keys().then((reqs) =>
          Promise.all(
            reqs
              .filter((r) => /\/assets\/products\//.test(new URL(r.url).pathname) && !keep.has(r.url))
              .map((r) => cache.delete(r)),
          ),
        ),
      ]),
    ),
  );
});

// Network first, falling back to the stored copy after `wait` ms (or at once
// when offline). The stored copy is refreshed whenever the network answers.
function networkFirst(event, cacheName, wait) {
  const req = event.request;
  const network = fetch(req);
  event.waitUntil(
    network
      .then((res) => res.ok && res.type === "basic" && caches.open(cacheName).then((c) => c.put(req, res.clone())))
      .catch(() => {}),
  );
  // An error page from the host (404, 5xx, an expired sign-in) never replaces
  // a good stored copy mid-event.
  const fresh = network.then((res) => (res.ok && res.type === "basic" ? res : null), () => null);
  const slow = new Promise((resolve) => setTimeout(resolve, wait));
  return Promise.race([fresh, slow]).then(
    (res) =>
      res ||
      caches
        .match(req, { ignoreSearch: true })
        .then((hit) => hit || (req.mode === "navigate" ? caches.match("index.html") : null))
        .then((hit) => hit || network),
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!sameOrigin(url)) return;

  // Product photos: fresh when online, so a photo replaced under the same
  // name shows on the next reload; stored copy on a weak connection.
  if (/\/assets\/products\//.test(url.pathname)) {
    event.respondWith(networkFirst(event, MEDIA, 1500));
    return;
  }

  // Fonts and icons never change: stored copy first.
  if (isMedia(url)) {
    event.respondWith(
      caches.open(MEDIA).then((cache) =>
        cache.match(req).then(
          (hit) =>
            hit ||
            fetch(req).then((res) => {
              if (res.ok && res.type === "basic") cache.put(req, res.clone());
              return res;
            }),
        ),
      ),
    );
    return;
  }

  // Page, scripts, styles, products.js: network first, never more than 3 s.
  event.respondWith(networkFirst(event, SHELL, 3000));
});
