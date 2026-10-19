/*
 * HUG Atelier: the collection
 * ---------------------------
 * Real names, specs and confirmed prices (see per-piece comments) for the
 * 40 named Catalog 1 pieces. Photos are still the placeholder studio
 * renders, reused across same-category pieces, until real photography
 * replaces them -- see import/README.md for the open to-dos (watermarks,
 * resolution, and the 3 pieces -- E8121, E8156, P8156 -- still unnamed).
 *
 * Add a piece     Copy one { ... }, block (from { to },) and paste it where
 *                 you want it. Order here = order on screen, in the main
 *                 carousel and in each category carousel.
 * Remove a piece  Delete its block, or set  hidden: true  to keep it for later.
 * Photos          Put them in the  assets/products/  folder next to this file.
 *                 Name them in lowercase with dashes, e.g. coral-drop.webp.
 *                 Portrait 4:5 works best (for example 1600 x 2000 px).
 *                 The first photo is the main one. Add more and the piece
 *                 view moves through them on its own; they can be swiped too.
 *
 * Every line inside a block ends with a comma, and so does every block  },
 * the last one too. Text goes between straight quotes "like this", not
 * curly ones.
 */

window.HUG_ATELIER = {
  settings: {
    autoRotateSeconds: 4,
    photoSeconds: 4,
    idleReturnSeconds: 90,
    zoom: 2,
  },

  defaultBadges: ["Luxury-Grade Silver", "Organic Shape", "Freshwater Pearls"],

  categories: ["Rings", "Earrings", "Strings", "Pendants", "Chokers", "Bracelets", "Misc"],

  pieces: [
    {
      name: "Sun Blossom Ring",
      ref: "R8121",
      category: "Rings",
      images: ["assets/products/halo-ring.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $60 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Solitaire Freshwater Ring",
      ref: "R6010",
      category: "Rings",
      images: ["assets/products/halo-ring-close.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White"],
      // price: $68 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Bow Knot Ring",
      ref: "R6181",
      category: "Rings",
      images: ["assets/products/halo-ring-mirror.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $76 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Iris Ring",
      ref: "R8165",
      category: "Rings",
      images: ["assets/products/halo-ring.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White"],
      // price: $156 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Glittering Iris Ring",
      ref: "R8166",
      category: "Rings",
      images: ["assets/products/halo-ring-close.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $160 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Angled Solitaire Freshwater Ring",
      ref: "R8168",
      category: "Rings",
      images: ["assets/products/halo-ring-mirror.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White"],
      // price: $156 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "White Shimmer Ring",
      ref: "R8162",
      category: "Rings",
      images: ["assets/products/halo-ring.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $100 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Infinite 8 Ring",
      ref: "R8149",
      category: "Rings",
      images: ["assets/products/halo-ring-close.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $102 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Heart Stud Earrings",
      ref: "E8017",
      category: "Earrings",
      images: ["assets/products/moon-drop.webp"],
      alt: "dome freshwater pearl, white -- placeholder photo",
      badges: ["PS Silver", "Dome Pearl", "Freshwater Pearls", "White"],
      // price: $44 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Satellite Stud Earrings",
      ref: "EF146",
      category: "Earrings",
      images: ["assets/products/moon-drop-close.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $52 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Freshwater Pebble Drop Earrings",
      ref: "EF228",
      category: "Earrings",
      images: ["assets/products/moon-drop-mirror.webp"],
      alt: "baroque freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Baroque Pearl", "Freshwater Pearls", "White"],
      // price: $38 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Harp Hoop Drop Earrings",
      ref: "E5324",
      category: "Earrings",
      images: ["assets/products/petal-studs.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White"],
      // price: $96 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Bow Knot Threader Earrings",
      ref: "E6181",
      category: "Earrings",
      images: ["assets/products/petal-studs-close.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $88 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Blossom Drop Earrings",
      ref: "E6214",
      category: "Earrings",
      images: ["assets/products/petal-studs-mirror.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $110 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Gem Shadow Bulb Earrings",
      ref: "EF094",
      category: "Earrings",
      images: ["assets/products/moon-drop.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $52 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Iris Bulb Earrings",
      ref: "E8165",
      category: "Earrings",
      images: ["assets/products/moon-drop-close.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White"],
      // price: $184 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Glittering Iris Bulb Earrings",
      ref: "E8166",
      category: "Earrings",
      images: ["assets/products/moon-drop-mirror.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $172 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Simple Freshwater Bulb Earrings",
      ref: "E8168",
      category: "Earrings",
      images: ["assets/products/petal-studs.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White"],
      // price: $184 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Gem Drop Earrings",
      ref: "E8162",
      category: "Earrings",
      images: ["assets/products/petal-studs-close.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $128 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Infinite 8 Earrings",
      ref: "E8149",
      category: "Earrings",
      images: ["assets/products/petal-studs-mirror.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $114 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Heart Lock String",
      ref: "C1830",
      category: "Strings",
      images: ["assets/products/tidal-strand.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Silver", "Round Pearl", "Freshwater Pearls", "White"],
      // price: $164 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Baby Beads String",
      ref: "CF015",
      category: "Strings",
      images: ["assets/products/tidal-strand-detail.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Silver", "Round Pearl", "Freshwater Pearls", "White"],
      // price: $88 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Ascendant String",
      ref: "CF023",
      category: "Strings",
      images: ["assets/products/tidal-strand-close.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Silver", "Round Pearl", "Freshwater Pearls", "White"],
      // price: $180 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Seaside Chain",
      ref: "CF176",
      category: "Strings",
      images: ["assets/products/tidal-strand-mirror.webp"],
      alt: "baroque freshwater pearl, multicolor -- placeholder photo",
      badges: ["Silver", "Baroque Pearl", "Freshwater Pearls", "Multicolor"],
      // price: $96 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Shoreline Pebbles Chain",
      ref: "CF180",
      category: "Strings",
      images: ["assets/products/tidal-strand.webp"],
      alt: "baroque freshwater pearl, multicolor -- placeholder photo",
      badges: ["Silver", "Baroque Pearl", "Freshwater Pearls", "Multicolor"],
      // price: $150 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Petite Ascendant String",
      ref: "CF229",
      category: "Strings",
      images: ["assets/products/tidal-strand-detail.webp"],
      alt: "teardrop freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Teardrop Pearl", "Freshwater Pearls", "White"],
      // price: $118 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Variety String",
      ref: "CF259",
      category: "Strings",
      images: ["assets/products/tidal-strand-close.webp"],
      alt: "baroque freshwater pearl, multicolor -- placeholder photo",
      badges: ["Silver", "Baroque Pearl", "Freshwater Pearls", "Multicolor"],
      // price: $46 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Snowdrop Simple Necklace",
      ref: "N1820",
      category: "Pendants",
      images: ["assets/products/selene-pendant.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $50 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Sun Mount Simple Necklace",
      ref: "NF194",
      category: "Pendants",
      images: ["assets/products/selene-pendant-close.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White"],
      // price: $46 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Pebble Line Necklace",
      ref: "NF239",
      category: "Pendants",
      images: ["assets/products/selene-pendant-mirror.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White"],
      // price: $42 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Bunnie Necklace",
      ref: "NF330",
      category: "Pendants",
      images: ["assets/products/selene-pendant.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White"],
      // price: $42 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Sun Blossom Pendant",
      ref: "P8121",
      category: "Pendants",
      images: ["assets/products/selene-pendant-close.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $46 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Pearl Drop Pendant",
      ref: "P5324",
      category: "Pendants",
      images: ["assets/products/selene-pendant-mirror.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White"],
      // price: $60 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Bow Knot Pendant",
      ref: "P6181",
      category: "Pendants",
      images: ["assets/products/selene-pendant.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $80 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Iris Pendant",
      ref: "P8165",
      category: "Pendants",
      images: ["assets/products/selene-pendant-close.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White"],
      // price: $192 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Glittering Iris Pendant",
      ref: "P8166",
      category: "Pendants",
      images: ["assets/products/selene-pendant-mirror.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $204 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Angle Mount Pendant",
      ref: "P8168",
      category: "Pendants",
      images: ["assets/products/selene-pendant.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White"],
      // price: $192 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Gem Mount Pendant",
      ref: "P8162",
      category: "Pendants",
      images: ["assets/products/selene-pendant-close.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $142 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Infinite 8 Pendant",
      ref: "P8149",
      category: "Pendants",
      images: ["assets/products/selene-pendant-mirror.webp"],
      alt: "round freshwater pearl, white -- placeholder photo",
      badges: ["Luxury-Grade Silver", "Round Pearl", "Freshwater Pearls", "White", "Cubic Zirconia"],
      // price: $96 (confirmed retail; not yet a renderable field on the site)
    },
    {
      name: "Chain Linked Bracelet",
      ref: "WF040",
      category: "Bracelets",
      images: ["assets/products/shoreline-bracelet.webp"],
      alt: "baroque freshwater pearl, multicolor -- placeholder photo",
      badges: ["Silver", "Baroque Pearl", "Freshwater Pearls", "Multicolor"],
      // price: $154 (confirmed retail; not yet a renderable field on the site)
    },
  ],
};
