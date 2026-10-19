# Bulk product import

`products-import.csv` is the bulk-entry template for adding pieces to `site/products.js`: one row per piece, specs and photo filenames in, ready to turn into `pieces` blocks.

## Columns

| Column | What goes in it |
| --- | --- |
| `sku` | Supplier or internal code. Becomes `ref`. |
| `name` | Display name. Brand voice — never invented by an agent, always written by a person. |
| `category` | Must match a name in `products.js`'s `categories` list. |
| `pearl_type`, `pearl_shape`, `pearl_color`, `pearl_size_mm` | Pearl specs, become badges. `pearl_size_mm` becomes its own badge, e.g. "8.0 - 9.0mm". |
| `material`, `stone` | Mounting specs, become badges. |
| `price_usd` | Retail price. Becomes `price` in `products.js` (a number), shown on the piece view as "$120". See pricing rules below. |
| `photos` | Semicolon-separated source filenames to copy into `site/assets/products/`. |
| `alt` | Screen-reader description. Brand voice, same as `name`. |
| `notes` | Anything that needs a human's attention before the row goes live. |

## Pricing rules (set 2026-10-19)

- **The price shown on the lookbook is the retail price, never supplier cost.** If a source sheet turns out to hold cost, convert before it reaches this file.
- **Exchange rate is fixed at 26,000 VND = 1 USD** for converting a VND source price. Confirm this still holds before reusing it; it is not pulled live.
- **Round the USD price up to the nearest even whole number**, no decimals. 148.08 → 150. 163.46 → 164.
- **Every price gets confirmed with Roby line by line before import**, never assumed correct from a source sheet or OCR extraction. Price is client-facing money; treat every figure as unverified until he says otherwise.

## When source sheets disagree (set 2026-10-19)

Catalog 1 Price.pdf and `fix of inventory_7-5-2025.csv` are two independent supplier sheets and don't always agree — found 13 disagreements across pearl shape and material for the 40 live pieces (e.g. Catalog 1 says "Luxury-Grade Silver," the inventory sheet says "Gold-plated Luxury-Grade Silver" for the same SKU; several shapes disagree too — Round vs. Baroque, Baroque vs. Droplets, etc.).

**`fix of inventory_7-5-2025.csv` wins** on pearl shape and material whenever the two disagree. Catalog 1 still wins on price (the inventory sheet has none) and pearl size (same). Don't assume agreement on a field just because this round didn't flag one — re-check if either source gets updated.

## Photo sourcing

When pulling photos from a supplier export, check whether more than one copy of the source folder exists (e.g. an "Old" and a "Fixed" version). A "Fixed" folder may itself carry an unresolved SKU-to-photo mismatch — don't trust folder names alone; confirm the filename's SKU matches the row before copying.

## To do

- **Remove all watermarks from supplier photos** before any of them ship on the live site. Flagged 2026-10-19, not yet done. Confirmed visible in the local preview build — "HOANG GIA PEARLS" branding burned into the photo, plus a cropped SKU label.
- **Supplier photos are low resolution.** `npm run check-products` flagged several below the site's 1600 × 2000 target (some as low as 800 × 800). Needs real photography or upscaled/re-shot photos before launch, not just a resize.
- **Name each product individually.** The 40-piece local preview currently shows the SKU (e.g. "C1830") standing in for a name on every piece. Real names, written by a person, before this goes live.
