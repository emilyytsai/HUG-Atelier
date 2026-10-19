# HUG Atelier

A visual lookbook for presenting HUG Atelier pearl jewelry in person: an auto-rotating carousel and a split-screen view of each piece. No shop, no forms, no tracking. It runs in any modern browser and keeps working offline once loaded.

Everything the public sees is in the **`site/`** folder. The rest of this repository is tooling.

## Open it

| How | Steps | Offline copy |
| --- | --- | --- |
| Hosted (best for events) | Sign in to Netlify, then drag the `site` folder onto [Netlify Drop](https://app.netlify.com/drop); or connect this repository to Netlify, Vercel or Cloudflare Pages (publish folder: `site`) | Yes |
| Straight from the folder | Double-click `site/index.html` | No |
| On this computer | `npm run serve`, then open http://localhost:8080 | Yes |

The local server needs [Node.js](https://nodejs.org) 18 or newer. Nothing needs installing to view or edit the collection.

## Edit the collection

Everything shown comes from one file: **`site/products.js`**. Edit it, save, reload the page.

**Opening the file:**

- **Any computer:** [VS Code](https://code.visualstudio.com) is free and underlines mistakes in red.
- **Mac, TextEdit:** choose Format › Make Plain Text, then TextEdit › Settings and untick "Smart quotes". Curly quotes break the file.
- **Windows:** right-click › Open with › Notepad. Double-clicking a `.js` file tries to run it instead of opening it.

**Two rules prevent almost every mistake:** every line inside a block ends with a comma, and so does every block `},` (the last one too). Text goes between straight quotes `"like this"`.

### Add a piece

1. Put the photo in `site/assets/products/`, for example `site/assets/products/coral-drop.webp`.
2. Copy an existing block in `products.js` and change it:

```js
{
  name: "Coral Drop Earrings",
  ref: "Nº 034",
  category: "Earrings",
  images: ["assets/products/coral-drop.webp"],
  alt: "Two baroque pearl drops on silver hooks",
},
```

Photo paths start with `assets/products/` (no `site/`); a bare file name like `"coral-drop.webp"` also works. Order in the list is the order on screen.

### Categories and the main carousel

Below the main carousel, the page scrolls down to one carousel per category. Each one loops, and the Categories bubble at the top right lists them all. The categories and their order are set near the top of `products.js`:

```js
categories: ["Rings", "Earrings", "Strings", "Pendants", "Chokers", "Bracelets", "Misc"],
```

- Rename, reorder, add or remove categories in that list. A category with no pieces is not shown.
- Each piece names its category with `category: "Rings",` (spelled as in the list).
- `featured: true,` puts a piece in the main carousel at the top as well. If no piece is featured, the main carousel shows them all.

The current pieces are placeholders: the same few renders, mirrored or cropped, under made-up names.

### Remove or pause a piece

Delete its block, or add `hidden: true` to keep it for later:

```js
{ name: "Halo Ring", hidden: true, images: ["assets/products/halo-ring.webp"] },
```

`hidden` only takes a piece off the screen. Its name stays in `products.js` and its photo stays downloadable by anyone who knows the address. Keep unreleased pieces and their photos out of the `site` folder until launch.

### Change the badges

Every piece shows the three default badges (`defaultBadges` near the top of `products.js`). Give a piece its own list to override them, or `badges: []` for none:

```js
badges: ["Luxury-Grade Silver", "Organic Shape", "Freshwater Pearls", "Cluster Setting"],
```

A badge can also point at a spot on the main photo. Tapping it glides the zoom there, so "Luxury-Grade Silver" can show the clasp:

```js
badges: [
  { label: "Luxury-Grade Silver", at: [0.5, 0.08] },
  "Organic Shape",
],
```

`at` is `[across, down]` from 0 to 1: `[0, 0]` is the top-left corner of the photo, `[0.5, 0.5]` the centre. To find the numbers, open the page from your computer, open the piece, and Option-click (Mac) or Alt-click (Windows) the spot on the photo. A ready-made line such as `{ label: "", at: [0.42, 0.61] },` appears on screen and is copied; paste it into `badges` and type the label between the quotes.

### Add detail photos

List more than one photo, up to 12. The first is the main photo, shown in the carousels. In the piece view the photos move on by themselves (every 4 seconds; see `photoSeconds` below), and they can be swiped, or picked with the dots under the photo.

```js
images: ["assets/products/tidal-strand.webp", "assets/products/tidal-strand-detail.webp", "assets/products/tidal-strand-close.webp"],
```

### Moving light (optional)

A piece can show its light slowly circling it while nobody touches the photo, so the pearls' lustre moves (Halo Ring does this now). It needs a set of photos of the piece from the same spot, with only the light moved a little between each, saved as `name-00.webp`, `name-01.webp` and so on:

```js
orbit: { frames: 24, files: "assets/products/orbit/halo-ring-##.webp" },
```

`##` stands for the frame number. Any touch or hover on the photo returns to the still photo straight away.

### Settings

At the top of `products.js`:

| Setting | Default | What it does |
| --- | --- | --- |
| `autoRotateSeconds` | `4` | Time each piece stays in the carousel |
| `photoSeconds` | `4` | Time each photo shows in the piece view before the next. `0` stays on the main photo |
| `idleReturnSeconds` | `90` | Return to the carousel after this long untouched. `0` turns it off |
| `zoom` | `2` | How close the hover zoom gets in the piece view |

### Photo guidelines

- Name files in lowercase with dashes and no spaces: `coral-drop.webp`, not `Coral Drop.WEBP`.
- Portrait, 4:5 (for example 1600 × 2000 px). Other shapes are cropped to fit.
- `.webp`, `.jpg`, `.png` or `.avif`, ideally under 400 KB each. Any photo editor can export these; [Squoosh](https://squoosh.app) does it in the browser.
- Keep the piece near the centre; the edges get cropped on phones.
- Names: keep them under about 30 characters. The two typefaces do not include every Vietnamese accent (for example ọ, ỗ), so those letters show in a fallback font; names in English or without those accents look best.
- To change a photo, you can save over it with the same name; the new one shows on the next reload.

### For the real photo shoot

The layout is built around photos that match each other:

- One seamless cream backdrop for every piece, a touch darker than the page (about `#EEE8E0`), so each frame still reads as a print on the cream page.
- One soft key light from the upper left, so shadows fall the same way in every photo.
- Shot at 4:5, with the piece inside the central ~60% of the frame. Tablets, phones and wide screens crop the edges differently.
- At least 2400 × 3000 px and sharp, so the zoom and the loupe show real nacre and orient, not enlarged pixels.
- A dark backdrop only for a deliberate chapter of the collection. The page adapts (darker glass over dark photos), but a mixed set looks unplanned.

### Check your work

Open `site/index.html` from your computer (or `npm run serve`). If anything in `products.js` is wrong, a note in the corner of the screen says what and where:

- a typo that stops the file from loading, with its line number when opened through `npm run serve` (a page opened straight from the folder cannot see line numbers)
- a misspelled field (`hiden` → "Did you mean hidden?")
- a photo that is missing or has the wrong name
- text that was too long and got shortened

On the hosted site the notes stay hidden from clients; add `?check` to the address to see them there (for example `https://your-site/?check`).

Before publishing, `npm run check-products` shows the same notes and also confirms that every photo's name matches its file exactly, including capital letters. Macs ignore the difference but hosting does not, so a photo can show on your Mac and vanish online. It also lists photos in the folder that no piece uses (they are still public once hosted).

To run it: on a Mac, right-click the project folder › New Terminal at Folder; on Windows, right-click › Open in Terminal. Then type `npm run check-products` and press Enter. It needs [Node.js](https://nodejs.org).

### Publish an update

- **Netlify:** open your site › Deploys, then drag the `site` folder onto the page. Dropping onto Netlify Drop again creates a new address and the tablet's Home Screen link would still point at the old one.
- **Connected to GitHub (Netlify, Vercel or Cloudflare Pages):** commit and push; the site updates in a minute.

The tablet picks up the update the next time it opens the lookbook online.

## Presenting

| Action | Mouse / keyboard | Touch |
| --- | --- | --- |
| Next / previous piece | ← → keys, a sideways trackpad swipe, or drag | Swipe the carousel; in the piece view, the arrows, or swipe the large photo past its last photo |
| More photos of a piece | Wait, click the dots, or swipe sideways on a trackpad over the photo | Wait, swipe the large photo, or tap the dots |
| Browse a category | Scroll down, or pick it from the Categories bubble (top right); drag a row, swipe it on a trackpad, or use its arrows | Scroll down, or tap the bubble (top right); swipe a row |
| Open a piece | Click a photo, or Enter | Tap a photo |
| Inspect closely | Hover over the large photo | Touch and hold the photo; a loupe appears above your finger |
| Show a detail | Click a badge with a dot | Tap a badge with a dot |
| Look closer | | Pinch the large photo |
| See every piece | Click the counter (01 / 07), or G | Tap the counter |
| Back to carousel | Back button, Esc | Back button, or pull the photo down |
| Full screen | F, or double-click the logo | Add to Home Screen (opens without browser bars) |

In the piece view, the arrows and swipes step through the pieces of the carousel it was opened from (the main one, a category, or the index), and Back returns there. A swipe on the large photo goes through the piece's photos first, then on to the next piece. The bar in the current dot shows how long until the next photo; it holds while the photo is zoomed or touched. The main carousel pauses while the pointer is over the photo on show, or while it is scrolled out of view. On pieces with a moving light, the light starts circling after a moment untouched. The screen stays awake while the page is open (where the browser allows it), and after 90 seconds untouched the piece view closes and the page glides back to the top. Every piece has its own link (`…/#tidal-strand`).

### At the event

1. Open the hosted link on the tablet while online, then **Add to Home Screen**. All pieces are now stored on the device, so a weak venue connection does not matter.
2. On iPad, turn on **Guided Access** (Settings › Accessibility) with a passcode, and triple-click to lock the tablet to the lookbook. Because the screen stays awake, this stops anyone from leaving the lookbook for your mail or photos.
3. Turn on a **Focus** mode so message previews do not appear in front of clients.

## Change the design

Styles live in `src/styles.css` (Tailwind CSS v4). After editing it:

```sh
npm install      # once
npm run build    # writes site/assets/css/app.css
```

Editing `products.js` never needs a build.

## Security

There is no server code, login, form, cookie, analytics or third-party request, which removes most of the usual risks. What remains is covered:

- **Strict Content Security Policy:** only the site's own files may load, with Trusted Types on. `site/_headers` is the single source. `npm run headers` copies it into `vercel.json` and `index.html`, and `npm run check` fails if any copy has drifted.
- **Catalog text** from `products.js` is inserted as plain text, never as HTML. Photo paths must be image files inside `assets/products/`.
- **Fonts are self-hosted.** Nothing loads from other domains, so viewers are not tracked.
- **Search engines are asked not to index** the site (`robots.txt`, `noindex`).
- **The local server** serves only the site's files, read-only, to this computer only. It refuses requests addressed to other domain names.

Keep in mind:

- **The site is public to anyone with the link.** To keep it private (unreleased pieces, prices in photos), turn on access control at the host. [Cloudflare Access](https://www.cloudflare.com/zero-trust/products/access/) has a free tier; Netlify and Vercel password protection need a paid plan. An unusual web address is not a secret: new domains and subdomains appear in public certificate logs.
- **Protect the hosting and GitHub accounts with two-factor sign-in.** Whoever controls them controls what the tablet shows. Keep the GitHub repository private: deleted photos stay in its history.
- **If you turn on host sign-in (Cloudflare Access and similar),** set the session to last longer than the event, so the tablet is not signed out mid-show. The offline copy covers short outages either way.
- **Use HTTPS hosting, not GitHub Pages.** GitHub Pages cannot send the security headers above.
- **Use LAN mode only on your own network.** `npm run serve -- --lan` lets a tablet on the same network open the lookbook, over plain http. On venue or guest wifi, someone nearby could alter what the tablet shows. Use your own hotspot, or better, the hosted link.

`npm audit` reports a "high" issue in a file-matching library used only by the Tailwind build tool on your computer. It never reaches the published site and takes no outside input, so it needs no action. Do not run `npm audit fix --force`; it downgrades the build tool.

## Files

```
site/                     everything that gets published
  index.html              page structure
  products.js             the collection (edit this)
  assets/products/        product photos
  assets/css/app.css      built styles (do not edit; built from src/styles.css)
  assets/js/app.js        carousel, piece view, zoom, gestures, offline
  assets/fonts/           Bodoni Moda and Jost (SIL Open Font License)
  sw.js                   offline copy
  _headers                security headers (single source)
src/styles.css            design source (Tailwind CSS v4)
tools/serve.mjs           local preview server
tools/sync-headers.mjs    keeps security headers in step (npm run headers / npm run check)
tools/check-products.mjs  checks products.js and its photos (npm run check-products)
tools/placeholder-photography/   Blender script that made the placeholder renders
netlify.toml, vercel.json host settings (publish the site folder)
```

The current product photos are studio renders made with `tools/placeholder-photography/render.py`. Replace them with real photography using the same file names, or new names in `products.js`.
