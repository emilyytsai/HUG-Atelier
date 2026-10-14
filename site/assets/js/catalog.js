/* HUG Atelier: reads products.js into a clean collection and notes anything
   that looks wrong. Shared by the page (app.js) and by
   tools/check-products.mjs, so both always agree. No page access here. */
(function (root) {
  "use strict";

  const DEFAULT_BADGES = ["Luxury-Grade Silver", "Organic Shape", "Freshwater Pearls"];
  const PIECE_KEYS = ["name", "images", "image", "alt", "ref", "badges", "hidden", "id"];
  const SETTING_KEYS = ["autoRotateSeconds", "idleReturnSeconds", "zoom"];
  const PHOTO = /^assets\/products\/(?:[^/]+\/)*[^/]+\.(?:webp|avif|jpe?g|png)$/i;

  // "Did you mean": typos in field names would otherwise be ignored silently.
  function distance(a, b) {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const keep = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = keep;
      }
    }
    return row[b.length];
  }

  function readCatalog(source, loadError) {
    // Serious notes mean something will not show; the rest are advice.
    const notes = [];
    const note = (text, serious = false) => notes.push({ text, serious });

    if (!source || typeof source !== "object") {
      note(
        loadError
          ? `products.js has a mistake${loadError.line ? ` near line ${loadError.line}` : ""}: usually a missing comma, bracket or straight quote " ${
              loadError.line
                ? "on that line or just above it"
                : "where you last edited. (Run npm run serve or npm run check-products to see the line number.)"
            } Nothing can show until it is fixed.`
          : "products.js did not load. Check that the file is next to index.html and is named products.js.",
        true,
      );
      source = null;
    }

    const checkKeys = (obj, known, where) => {
      if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
      Object.keys(obj).forEach((key) => {
        if (known.includes(key)) return;
        const near = known.find((k) => k.toLowerCase() === key.toLowerCase() || distance(k.toLowerCase(), key.toLowerCase()) <= 2);
        note(`${where}: "${key}" is not a known field${near ? `. Did you mean "${near}"?` : ". It is ignored."}`);
      });
    };

    const clampNum = (value, min, max, fallback, label) => {
      if (value === undefined) return fallback;
      const n = typeof value === "string" ? parseFloat(value) : Number(value);
      if (!Number.isFinite(n)) {
        note(`settings: ${label} should be a number, like ${fallback}. Using ${fallback}.`);
        return fallback;
      }
      const kept = Math.min(max, Math.max(min, n));
      if (kept !== n) note(`settings: ${label} goes from ${min} to ${max}. Using ${kept}.`);
      return kept;
    };

    // Long text is cut at a word, with a note, rather than mid-word.
    const cleanText = (value, max, where) => {
      if (typeof value === "number") value = String(value);
      if (typeof value !== "string") return "";
      const text = value.replace(/\s+/g, " ").trim();
      if (text.length <= max) return text;
      const cut = (text.slice(0, max + 1).replace(/\s+\S*$/, "") || text.slice(0, max)).replace(/[\s,;:.\-–—]+$/, "");
      if (where) note(`${where} is longer than ${max} characters and was shortened to "${cut}".`);
      return cut;
    };

    // A badge is plain text, or { label, at: [across, down] } pointing at a
    // spot on the main photo, both from 0 to 1.
    const cleanBadges = (value, where) => {
      if (value === undefined || value === null) return null;
      if (typeof value === "string") value = value.split(",");
      if (!Array.isArray(value)) {
        note(`${where}: badges should be a list like ["Luxury-Grade Silver", "Organic Shape"]. Using the default badges.`);
        return null;
      }
      const list = value
        .map((b) => {
          const label = cleanText(typeof b === "string" ? b : b && b.label, 40, `${where}: the badge`);
          if (!label) return null;
          let at = null;
          if (b && typeof b === "object" && b.at !== undefined) {
            const ok = Array.isArray(b.at) && b.at.length >= 2 && b.at.slice(0, 2).every((n) => Number.isFinite(Number(n)));
            if (!ok) note(`${where}: badge "${label}" has an "at" that is not [across, down], like [0.5, 0.2].`);
            else {
              const [x, y] = b.at.slice(0, 2).map(Number);
              if (x < 0 || x > 1 || y < 0 || y > 1) note(`${where}: badge "${label}": "at" numbers go from 0 to 1, like [0.5, 0.2].`);
              at = Object.freeze([Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y))]);
            }
          }
          return Object.freeze({ label, at });
        })
        .filter(Boolean);
      if (list.length > 8) note(`${where}: only the first 8 badges are shown.`);
      return list.slice(0, 8);
    };

    const slugify = (value) =>
      cleanText(value, 80)
        .replace(/[đĐ]/g, "d")
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "piece";

    // Photos must be image files inside assets/products/. Common slips are
    // forgiven (a bare file name, "./", "site/"); anything else (other sites,
    // data:, "..", odd characters) is refused before it reaches the page.
    const safeSrc = (value) => {
      if (typeof value !== "string") return null;
      let s = value.trim().replace(/^\.\//, "").replace(/^\/+/, "").replace(/^site\//, "");
      if (s && !s.includes("/")) s = `assets/products/${s}`;
      if (!s || s.length > 300 || /[\u0000-\u001f\u007f\\?#%"'<>`]/.test(s)) return null;
      if (s.split("/").some((part) => part === ".." || part === ".")) return null;
      return PHOTO.test(s) ? s : null;
    };

    if (source) checkKeys(source, ["settings", "defaultBadges", "pieces"], "products.js");
    const s = (source && source.settings) || {};
    checkKeys(s, SETTING_KEYS, "settings");
    const settings = Object.freeze({
      rotateMs: clampNum(s.autoRotateSeconds, 2, 60, 4, "autoRotateSeconds") * 1000,
      idleMs: clampNum(s.idleReturnSeconds, 0, 3600, 90, "idleReturnSeconds") * 1000,
      zoom: clampNum(s.zoom, 1.2, 4, 2, "zoom"),
    });

    const pieces = [];
    const seen = new Set();
    const fallback = cleanBadges(source && source.defaultBadges, "defaultBadges") || cleanBadges(DEFAULT_BADGES, "");
    if (source && !Array.isArray(source.pieces)) note("products.js: pieces should be a list: pieces: [ { ... }, { ... }, ]", true);

    ((source && Array.isArray(source.pieces) && source.pieces) || []).forEach((p, n) => {
      const where = `Piece ${n + 1}${p && typeof p.name === "string" && p.name.trim() ? ` ("${p.name.trim()}")` : ""}`;
      if (!p || typeof p !== "object" || Array.isArray(p)) return note(`${where} is not a { ... } block. Skipped.`, true);
      if (p.hidden === true) return;
      checkKeys(p, PIECE_KEYS, where);
      if (p.hidden !== undefined && typeof p.hidden !== "boolean") note(`${where}: hidden should be true or false, without quotes.`);
      if (p.hidden === "true") return;

      const name = cleanText(p.name, 90, `${where}: the name`);
      if (!name) return note(`${where} has no name. Skipped.`, true);
      if (name.length > 40) note(`${where}: the name is ${name.length} characters and will wrap onto several lines. Under 30 reads best.`);

      let list = Array.isArray(p.images) ? p.images : typeof p.images === "string" ? p.images.split(",") : p.image ? [p.image] : [];
      list = list.filter((src) => !(typeof src === "string" && !src.trim()));
      list.forEach((src) => {
        if (safeSrc(src)) return;
        const text = JSON.stringify(src);
        if (typeof src === "string" && src.includes("\\")) note(`${where}: the photo ${text} uses \\. Use / instead, like "assets/products/name.webp".`, true);
        else note(`${where}: the photo ${text} was skipped. Photos are .webp, .jpg, .png or .avif files in assets/products/, written like "assets/products/name.webp".`, true);
      });
      const images = list.map(safeSrc).filter(Boolean);
      if (images.length > 12) note(`${where}: only the first 12 photos are shown.`);
      if (!images.length) return note(`${where} has no usable photo. Skipped.`, true);

      let id = slugify(p.id || name);
      for (let k = 2; seen.has(id); k++) id = `${slugify(p.id || name)}-${k}`;
      seen.add(id);
      const ref = typeof p.ref === "number" ? `N° ${String(p.ref).padStart(3, "0")}` : cleanText(p.ref, 40, `${where}: ref`);
      pieces.push(
        Object.freeze({
          id,
          name,
          ref,
          alt: cleanText(p.alt, 240, `${where}: alt`) || name,
          images: Object.freeze(images.slice(0, 12)),
          badges: Object.freeze(cleanBadges(p.badges, where) ?? fallback),
        }),
      );
    });

    return { settings, pieces: Object.freeze(pieces), notes };
  }

  root.HUG_readCatalog = readCatalog;
})(typeof window !== "undefined" ? window : globalThis);
