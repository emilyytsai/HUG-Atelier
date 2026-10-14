# HUG Atelier

A visual lookbook for presenting HUG Atelier pearl jewelry in person: an auto-rotating carousel and a split-screen view of each piece. No shop, no forms, no tracking. It runs on any modern browser and keeps working offline once loaded.

## Open it

| How | Steps | Offline copy |
| --- | --- | --- |
| Straight from the folder | Double-click `index.html` | No |
| On this computer | `npm run serve`, then open http://localhost:8080 | Yes |
| On a tablet, same wifi | `npm run serve -- --lan`, then open `http://<computer-ip>:8080` on the tablet | No (needs https) |
| Hosted (recommended for events) | Drag the folder onto [Netlify Drop](https://app.netlify.com/drop) (leave out `node_modules` if present), or push to Vercel or Cloudflare Pages | Yes |

The local server needs [Node.js](https://nodejs.org) 18 or newer. Nothing else needs installing to view or edit the collection.

## Edit the collection

Everything shown comes from one file: **`products.js`**. Edit it in any text editor, save, reload the page.

### Add a piece

1. Put the photo in `assets/products/`, for example `assets/products/coral-drop.webp`.
2. Copy an existing block in `products.js` and change it:

```js
{
  name: "Coral Drop Earrings",
  ref: "N° 008",
  images: ["assets/products/coral-drop.webp"],
  alt: "Two baroque pearl drops on silver hooks"
},
```

Order in the list is the order on screen. Keep the comma between blocks.

### Remove or pause a piece

Delete its block, or add `hidden: true` to keep it for later:

```js
{ name: "Halo Ring", hidden: true, images: ["assets/products/halo-ring.webp"] },
```

### Change the badges

Every piece shows the three default badges (`defaultBadges` near the top of `products.js`). Give a piece its own list to override them:

```js
badges: ["Luxury-Grade Silver", "Organic Shape", "Freshwater Pearls", "Cluster Setting"]
```

Use `badges: []` for none.

### Add detail photos

List more than one photo. The first is the main photo; the others appear as dots under the photo in the piece view.

```js
images: ["assets/products/tidal-strand.webp", "assets/products/tidal-strand-detail.webp"]
```

### Settings

At the top of `products.js`:

| Setting | Default | What it does |
| --- | --- | --- |
| `autoRotateSeconds` | `4` | Time each piece stays in the carousel |
| `idleReturnSeconds` | `90` | Return to the carousel after this long untouched. `0` turns it off |
| `zoom` | `2` | How close the hover zoom gets in the piece view |

### Photo guidelines

- Portrait, 4:5 (for example 1600 × 2000 px). Other shapes are cropped to fit.
- WebP or JPEG, ideally under 400 KB each. Any photo editor can export these; [Squoosh](https://squoosh.app) does it in the browser.
- Keep the piece near the centre; the edges get cropped on phones.

### If something does not show

A piece with no name or no photo is skipped rather than breaking the page. Open the browser console (right-click › Inspect › Console) to see which piece and why. A missing photo shows a soft blank frame and a console line with the exact file name it looked for. File names are case-sensitive once hosted.

## Presenting

| Action | Mouse / keyboard | Touch |
| --- | --- | --- |
| Next / previous piece | ← → keys | Swipe the carousel |
| Open a piece | Click a photo, or Enter | Tap a photo |
| Inspect closely | Hover over the large photo | Press and drag on the photo |
| Back to carousel | Back button, Esc | Back button |
| Full screen | F, or double-click the logo | Add to Home Screen (opens without browser bars) |

The carousel pauses while the pointer is over it. The screen stays awake while the page is open (on browsers that allow it), and the piece view returns to the carousel after 90 seconds untouched. Every piece has its own link (`…/#tidal-strand`) so you can open the page straight on a piece.

**At the event:** open the hosted link once on the tablet while online and add it to the Home Screen. All pieces are then stored on the device, so a weak venue connection does not matter.

## Change the design

Styles live in `src/styles.css` (Tailwind CSS v4). After editing it:

```sh
npm install      # once
npm run build    # writes assets/css/app.css
```

Editing `products.js` never needs a build.

## Security

The site has no server code, logins, forms, cookies, analytics or third-party requests, which removes most of the usual risks. What remains is covered:

- A strict Content Security Policy allows only files from the site itself (`index.html`, plus `_headers` / `vercel.json` for hosts).
- Text from `products.js` is inserted as plain text, never as HTML. Photo paths must be local files or `https://` links.
- Fonts are self-hosted; nothing is loaded from other domains, so viewers are not tracked.
- Pages ask search engines not to index them (`robots.txt`, `noindex`).
- The local server only serves the site files, read-only, and only to this computer unless `--lan` is used.

If the collection must stay private (unreleased pieces), turn on password protection at the host (Netlify, Vercel and Cloudflare all offer it). Photos linked from another domain also need that domain added to `img-src` in the policy in `index.html` and `_headers`.

## Files

```
index.html               page structure
products.js              the collection (edit this)
assets/products/         product photos
assets/css/app.css       built styles (do not edit; built from src/styles.css)
assets/js/app.js         carousel, piece view, zoom, offline
assets/fonts/            Bodoni Moda and Jost (SIL Open Font License)
sw.js                    offline copy
_headers, vercel.json    security headers for hosting
tools/serve.mjs          local preview server
tools/placeholder-photography/   Blender script that made the placeholder renders
```

The current product photos are studio renders made with `tools/placeholder-photography/render.py`. Replace them with real photography using the same file names, or new names in `products.js`.
