/*
 * HUG Atelier: the collection
 * ---------------------------
 * This is the only file you edit to change what the lookbook shows.
 * Save it, then reload the page.
 *
 * Add a piece     Copy one { ... }, block (from { to },) and paste it where
 *                 you want it. Order here = order on screen, in the main
 *                 carousel and in each category carousel.
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
 *   ref      Optional. Small reference above the title: "Nº 014", or just
 *            the number 14, which shows as Nº 014.
 *   badges   Optional. Replaces the default badges for this piece only.
 *            A badge can point at a spot on the main photo:
 *            { label: "Luxury-Grade Silver", at: [0.5, 0.08] }
 *            at = [across, down], from 0 to 1. To find the numbers, open the
 *            page from your computer, open the piece, and Option-click (Mac)
 *            or Alt-click (Windows) the spot. The line is copied for you.
 *   orbit    Optional. Frames of the main photo with the light moving
 *            around the piece; while nobody touches the photo, the light
 *            slowly circles it. { frames: 24, files: "assets/products/orbit/name-##.webp" }
 *            (## is the frame number: 00, 01, ...).
 *   category Optional. Which category carousel it appears in; must match a
 *            name in the categories list below, e.g. "Rings".
 *   featured Optional. true puts it in the main carousel at the top. If no
 *            piece is featured, the main carousel shows every piece.
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
    autoRotateSeconds: 4,   // time each piece stays in the main carousel (2 to 60)
    idleReturnSeconds: 90,  // back to the top after this long untouched (0 = never)
    zoom: 2,                // how close the hover zoom gets in the piece view (1.2 to 4)
  },

  // Badges shown on every piece unless the piece lists its own.
  defaultBadges: ["Luxury-Grade Silver", "Organic Shape", "Freshwater Pearls"],

  // One carousel per category, in this order, below the main carousel.
  categories: ["Rings", "Earrings", "Strings", "Pendants", "Chokers", "Bracelets", "Misc"],

  // Placeholder pieces: the photos are stand-in renders, repeated on purpose.
  pieces: [
    {
      name: "Tidal Strand",
      ref: "Nº 001",
      category: "Strings",
      featured: true,
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
      ref: "Nº 002",
      category: "Pendants",
      featured: true,
      images: ["assets/products/selene-pendant.webp"],
      alt: "A flat baroque pearl on a fine silver chain, on dark slate",
    },
    {
      name: "Halo Ring",
      ref: "Nº 003",
      category: "Rings",
      featured: true,
      images: ["assets/products/halo-ring.webp"],
      alt: "A single pearl set on a slim silver band",
      orbit: { frames: 24, files: "assets/products/orbit/halo-ring-##.webp" },
    },
    {
      name: "Moon Drop Earrings",
      ref: "Nº 004",
      category: "Earrings",
      featured: true,
      images: ["assets/products/moon-drop.webp"],
      alt: "A pair of long baroque pearl drops on silver hooks",
    },
    {
      name: "Petal Cluster Studs",
      ref: "Nº 005",
      category: "Earrings",
      featured: true,
      images: ["assets/products/petal-studs.webp"],
      alt: "Two studs, each a cluster of small pearls on a silver base",
      badges: ["Luxury-Grade Silver", "Organic Shape", "Freshwater Pearls", "Cluster Setting"],
    },
    {
      name: "Shoreline Bracelet",
      ref: "Nº 006",
      category: "Bracelets",
      featured: true,
      images: ["assets/products/shoreline-bracelet.webp"],
      alt: "A bracelet of pearls with small silver spacer beads",
    },
    {
      name: "Undertow Lariat",
      ref: "Nº 007",
      category: "Misc",
      featured: true,
      images: ["assets/products/undertow-lariat.webp"],
      alt: "A silver Y-necklace with stationed pearls and a long pearl drop",
    },
    {
      name: "Crescent Ring",
      ref: "Nº 008",
      category: "Rings",
      images: ["assets/products/halo-ring-mirror.webp"],
      alt: "A single pearl on a slim silver band",
    },
    {
      name: "Solitaire Ring",
      ref: "Nº 009",
      category: "Rings",
      images: ["assets/products/halo-ring-close.webp"],
      alt: "A single pearl on a slim silver band, close up",
    },
    {
      name: "Duet Ring",
      ref: "Nº 010",
      category: "Rings",
      images: ["assets/products/halo-ring.webp"],
      alt: "A pearl ring on a silver band",
    },
    {
      name: "Tide Pool Ring",
      ref: "Nº 011",
      category: "Rings",
      images: ["assets/products/halo-ring-mirror.webp"],
      alt: "A pearl ring on a silver band",
    },
    {
      name: "Moonlet Drops",
      ref: "Nº 012",
      category: "Earrings",
      images: ["assets/products/moon-drop-mirror.webp"],
      alt: "Baroque pearl drops on silver hooks",
    },
    {
      name: "Comet Drops",
      ref: "Nº 013",
      category: "Earrings",
      images: ["assets/products/moon-drop-close.webp"],
      alt: "Baroque pearl drops on silver hooks, close up",
    },
    {
      name: "Bloom Studs",
      ref: "Nº 014",
      category: "Earrings",
      images: ["assets/products/petal-studs-mirror.webp"],
      alt: "Pearl cluster studs on silver",
    },
    {
      name: "Petite Petal Studs",
      ref: "Nº 015",
      category: "Earrings",
      images: ["assets/products/petal-studs-close.webp"],
      alt: "Pearl cluster studs on silver, close up",
    },
    {
      name: "Opera Strand",
      ref: "Nº 016",
      category: "Strings",
      images: ["assets/products/tidal-strand-mirror.webp"],
      alt: "A long strand of baroque pearls",
    },
    {
      name: "Princess Strand",
      ref: "Nº 017",
      category: "Strings",
      images: ["assets/products/tidal-strand-close.webp"],
      alt: "A strand of baroque pearls, close up",
    },
    {
      name: "Graduated Strand",
      ref: "Nº 018",
      category: "Strings",
      images: ["assets/products/tidal-strand-detail.webp"],
      alt: "Baroque pearls on a strand, close up",
    },
    {
      name: "Matinee Strand",
      ref: "Nº 019",
      category: "Strings",
      images: ["assets/products/tidal-strand.webp"],
      alt: "A strand of baroque pearls with a silver clasp",
    },
    {
      name: "Luna Pendant",
      ref: "Nº 020",
      category: "Pendants",
      images: ["assets/products/selene-pendant-mirror.webp"],
      alt: "A baroque pearl on a fine silver chain",
    },
    {
      name: "Eclipse Pendant",
      ref: "Nº 021",
      category: "Pendants",
      images: ["assets/products/selene-pendant-close.webp"],
      alt: "A baroque pearl pendant, close up",
    },
    {
      name: "Plumb Pendant",
      ref: "Nº 022",
      category: "Pendants",
      images: ["assets/products/undertow-lariat-close.webp"],
      alt: "A pearl drop on a silver chain",
    },
    {
      name: "Nocturne Pendant",
      ref: "Nº 023",
      category: "Pendants",
      images: ["assets/products/selene-pendant.webp"],
      alt: "A baroque pearl on a fine silver chain",
    },
    {
      name: "Collar Choker",
      ref: "Nº 024",
      category: "Chokers",
      images: ["assets/products/tidal-strand-close.webp"],
      alt: "A short strand of baroque pearls",
    },
    {
      name: "Ripple Choker",
      ref: "Nº 025",
      category: "Chokers",
      images: ["assets/products/shoreline-bracelet-close.webp"],
      alt: "A close circle of pearls with silver spacers",
    },
    {
      name: "Harbour Choker",
      ref: "Nº 026",
      category: "Chokers",
      images: ["assets/products/tidal-strand-mirror.webp"],
      alt: "A short strand of baroque pearls",
    },
    {
      name: "Spindle Choker",
      ref: "Nº 027",
      category: "Chokers",
      images: ["assets/products/shoreline-bracelet-mirror.webp"],
      alt: "A circle of pearls with silver spacers",
    },
    {
      name: "Sandbar Bracelet",
      ref: "Nº 028",
      category: "Bracelets",
      images: ["assets/products/shoreline-bracelet-mirror.webp"],
      alt: "Pearls with small silver spacer beads",
    },
    {
      name: "Spindrift Bracelet",
      ref: "Nº 029",
      category: "Bracelets",
      images: ["assets/products/shoreline-bracelet-close.webp"],
      alt: "Pearls with silver spacers, close up",
    },
    {
      name: "Estuary Bracelet",
      ref: "Nº 030",
      category: "Bracelets",
      images: ["assets/products/shoreline-bracelet.webp"],
      alt: "A bracelet of pearls with silver spacers",
    },
    {
      name: "Current Lariat",
      ref: "Nº 031",
      category: "Misc",
      images: ["assets/products/undertow-lariat-mirror.webp"],
      alt: "A silver Y-necklace with stationed pearls",
    },
    {
      name: "Cluster Brooch",
      ref: "Nº 032",
      category: "Misc",
      images: ["assets/products/petal-studs-close.webp"],
      alt: "A cluster of pearls on silver",
    },
    {
      name: "Drop Pin",
      ref: "Nº 033",
      category: "Misc",
      images: ["assets/products/moon-drop-close.webp"],
      alt: "A baroque pearl drop on silver",
    },
  ],
};
