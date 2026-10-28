# iOS stutter: suspected causes

Reported: choppy/stuttering transitions and flow on iOS mobile. Ranked by
likely impact. Items below are marked fixed or still open.

1. **Fixed - whole-catalog eager preload.** `idle(() => { preload(allImages);
   buildIndex(); })` in `site/assets/js/app.js` used to decode every product
   photo across the entire catalog on idle, not just the pieces a visitor had
   actually opened - about 130 photos (~17 MB) plus the 24-frame orbit
   sequence, all full-resolution originals (e.g. 1600x2000px). Now only
   `buildIndex()` runs on idle; a piece's own photos still preload the moment
   it's opened (`preload(piece.images)` in `renderPiece`), and the service
   worker's separate offline precache (byte-fetch only, no decode) is
   untouched.

2. **Fixed - `.ambient` panel glow re-decoding the full photo.** The blurred
   backdrop behind the piece panel (`filter: blur(80px)`) used to load the
   full-resolution original into a second `<img>` on every piece open/step.
   It's now a `<canvas>` that draws a small (480px max) copy of the already
   -loading photo, and caches the decoded `Image` per piece so a revisit
   redraws instantly instead of decoding again. (First attempt exported this
   as a `data:` URL `<img src>` - the site's own `img-src 'self'` CSP
   correctly blocked that; the canvas approach needs no such URL.)

3. **Fixed - light-orbit loop not stopped during the close slide.**
   `slideHome()` (the new slide-back-to-first-photo step before closing,
   added for a different fix) didn't call `stopOrbit()`, unlike every other
   piece-view transition. Orbit itself was already well-gated elsewhere -
   any touch/pointer on the photo already calls `scheduleOrbit()`, which
   stops it immediately - this was specifically the one path that didn't.

4. **Open - multiple `backdrop-filter: blur(20px)` "glass" elements**
   (back button, photo dots, spec badges) rendered simultaneously, some
   fading/scaling during the same transition as #2. No code change yet;
   reducing this likely means reducing how many glass elements animate at
   once, which is a design call, not a free optimization.

5. **Open - View Transitions API on Safari.** The open/close/step morph
   (`transition()` in app.js, using `document.startViewTransition`) is
   supported in Safari but known to be heavier there than in
   Chromium/Firefox. Worth re-measuring now that #1-#3 are fixed; if iOS is
   still rough, the remaining option is a simpler, non-morphed transition
   specifically on Safari - a real platform difference, not a free win.

## Deferred by choice

**Serving a smaller resized photo to phones (`srcset`).** Cards and the
piece view currently serve the same full-resolution original (e.g.
1600x2000px) to every screen size. Fixing this properly needs a new
image-resize step (e.g. `sharp` as a dependency) generating ~250-300 extra
`.webp` files and touching every template that renders a photo. Scoped out
as a separate, bigger follow-up rather than bundling it with the smaller
fixes above.
