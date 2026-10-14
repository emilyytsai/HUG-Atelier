/*
 * HUG Atelier: the collection
 * ---------------------------
 * This is the only file you edit to change what the lookbook shows.
 * Save it, then reload the page.
 *
 * Add a piece     Copy one { ... } block, paste it where you want it in the
 *                 list, and change its details. Order here = order on screen.
 * Remove a piece  Delete its block, or set  hidden: true  to keep it for later.
 * Photos          Put them in  assets/products/  and use the file name below.
 *                 Portrait 4:5 works best (for example 1600 x 2000 px).
 *                 The first photo is the main one; add more for detail views.
 *
 * Fields
 *   name     Required. Shown as the title.
 *   images   Required. One or more photos, first one is the main photo.
 *   alt      Optional. Short description of the photo for screen readers.
 *   ref      Optional. Small reference code above the title, e.g. "N° 014".
 *   badges   Optional. Replaces the default badges for this piece only.
 *   hidden   Optional. true hides the piece without deleting it.
 *   id       Optional. Name used in the page link (#tidal-strand). Made from
 *            the name if left out.
 *
 * Mistakes are safe: a piece with a missing name or photo is skipped and the
 * browser console (right click > Inspect > Console) says which one and why.
 */

window.HUG_ATELIER = {
  settings: {
    autoRotateSeconds: 4,   // time each piece stays in the carousel
    idleReturnSeconds: 90,  // return to the carousel after this long untouched (0 = never)
    zoom: 2                 // how close the hover zoom gets in the piece view
  },

  // Badges shown on every piece unless the piece lists its own.
  defaultBadges: ["Luxury-Grade Silver", "Organic Shape", "Freshwater Pearls"],

  pieces: [
    {
      name: "Tidal Strand",
      ref: "N° 001",
      images: ["assets/products/tidal-strand.webp", "assets/products/tidal-strand-detail.webp"],
      alt: "A long strand of baroque freshwater pearls with a silver clasp, laid in a loose loop"
    },
    {
      name: "Selene Pendant",
      ref: "N° 002",
      images: ["assets/products/selene-pendant.webp"],
      alt: "A flat baroque pearl on a fine silver chain, on dark slate"
    },
    {
      name: "Halo Ring",
      ref: "N° 003",
      images: ["assets/products/halo-ring.webp"],
      alt: "A single pearl set on a slim silver band"
    },
    {
      name: "Moon Drop Earrings",
      ref: "N° 004",
      images: ["assets/products/moon-drop.webp"],
      alt: "A pair of long baroque pearl drops on silver hooks"
    },
    {
      name: "Petal Cluster Studs",
      ref: "N° 005",
      images: ["assets/products/petal-studs.webp"],
      alt: "Two studs, each a cluster of small pearls on a silver base",
      badges: ["Luxury-Grade Silver", "Organic Shape", "Freshwater Pearls", "Cluster Setting"]
    },
    {
      name: "Shoreline Bracelet",
      ref: "N° 006",
      images: ["assets/products/shoreline-bracelet.webp"],
      alt: "A bracelet of pearls with small silver spacer beads"
    },
    {
      name: "Undertow Lariat",
      ref: "N° 007",
      images: ["assets/products/undertow-lariat.webp"],
      alt: "A silver Y-necklace with stationed pearls and a long pearl drop"
    }
  ]
};
