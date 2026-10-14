/*
 * HUG Atelier: the collection
 * ---------------------------
 * This is the only file you edit to change what the lookbook shows.
 * Save it, then reload the page.
 *
 * Add a piece     Copy one { ... }, block (from { to },) and paste it where
 *                 you want it. Order here = order on screen.
 * Remove a piece  Delete its block, or set  hidden: true  to keep it for later.
 * Photos          Put them in the  assets/products/  folder next to this file.
 *                 Name them in lowercase with dashes, e.g. coral-drop.webp.
 *                 Portrait 4:5 works best (for example 1600 x 2000 px).
 *                 The first photo is the main one; add more for detail views.
 *
 * Every line inside a block ends with a comma, and so does every block  },
 * the last one too. Text goes between straight quotes "like this", not
 * curly ones.
 *
 * Fields
 *   name     Required. Shown as the title. Under 30 characters reads best.
 *   images   Required. One or more photos: ["assets/products/name.webp"].
 *            A bare file name like "name.webp" also works.
 *   alt      Optional. Short description of the photo for screen readers.
 *   ref      Optional. Small reference above the title: "N° 014", or just
 *            the number 14, which shows as N° 014.
 *   badges   Optional. Replaces the default badges for this piece only.
 *            A badge can point at a spot on the main photo:
 *            { label: "Luxury-Grade Silver", at: [0.5, 0.08] }
 *            at = [across, down], from 0 to 1. To find the numbers, open the
 *            page from your computer, open the piece, and Option-click (Mac)
 *            or Alt-click (Windows) the spot. The line is copied for you.
 *   hidden   Optional. true hides the piece without deleting it.
 *   id       Optional. Name used in the page link (#tidal-strand). Made from
 *            the name if left out.
 *
 * Checking your work: open index.html from your computer (or add ?check to
 * the address). If something is wrong, a note on screen says what and where.
 * For line numbers, use  npm run serve  or  npm run check-products.
 */

window.HUG_ATELIER = {
  settings: {
    autoRotateSeconds: 4,   // time each piece stays in the carousel (2 to 60)
    idleReturnSeconds: 90,  // back to the carousel after this long untouched (0 = never)
    zoom: 2,                // how close the hover zoom gets in the piece view (1.2 to 4)
  },

  // Badges shown on every piece unless the piece lists its own.
  defaultBadges: ["Luxury-Grade Silver", "Organic Shape", "Freshwater Pearls"],

  pieces: [
    {
      name: "Tidal Strand",
      ref: "N° 001",
      images: ["assets/products/tidal-strand.webp", "assets/products/tidal-strand-detail.webp"],
      alt: "A long strand of baroque freshwater pearls with a silver clasp, laid in a loose loop",
      badges: [
        { label: "Luxury-Grade Silver", at: [0.54, 0.095] },
        { label: "Organic Shape", at: [0.15, 0.45] },
        { label: "Freshwater Pearls", at: [0.45, 0.86] },
      ],
    },
    {
      name: "Selene Pendant",
      ref: "N° 002",
      images: ["assets/products/selene-pendant.webp"],
      alt: "A flat baroque pearl on a fine silver chain, on dark slate",
    },
    {
      name: "Halo Ring",
      ref: "N° 003",
      images: ["assets/products/halo-ring.webp"],
      alt: "A single pearl set on a slim silver band",
    },
    {
      name: "Moon Drop Earrings",
      ref: "N° 004",
      images: ["assets/products/moon-drop.webp"],
      alt: "A pair of long baroque pearl drops on silver hooks",
    },
    {
      name: "Petal Cluster Studs",
      ref: "N° 005",
      images: ["assets/products/petal-studs.webp"],
      alt: "Two studs, each a cluster of small pearls on a silver base",
      badges: ["Luxury-Grade Silver", "Organic Shape", "Freshwater Pearls", "Cluster Setting"],
    },
    {
      name: "Shoreline Bracelet",
      ref: "N° 006",
      images: ["assets/products/shoreline-bracelet.webp"],
      alt: "A bracelet of pearls with small silver spacer beads",
    },
    {
      name: "Undertow Lariat",
      ref: "N° 007",
      images: ["assets/products/undertow-lariat.webp"],
      alt: "A silver Y-necklace with stationed pearls and a long pearl drop",
    },
  ],
};
