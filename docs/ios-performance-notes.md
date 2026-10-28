# iOS stutter: suspected causes (not yet fixed)

Reported: choppy/stuttering transitions and flow on iOS mobile. Investigated
but not addressed yet. Ranked by likely impact.

1. **Whole-catalog eager preload.** `preload(allImages)` in
   `site/assets/js/app.js` (near the "Load every photo early" comment) decodes
   every product photo across the entire catalog on idle, not just the
   pieces a visitor has actually opened - about 130 photos (~17 MB) plus the
   24-frame orbit sequence. Photos are full-resolution originals (e.g.
   1600x2000px) with no smaller/responsive variant, so decoded-bitmap memory
   use is much higher than the screen needs. iOS Safari's per-tab memory
   ceiling is tighter than desktop; this is the top suspect for jank that
   shows up a few seconds after load or whenever the device is already under
   memory pressure.

2. **`.ambient img` panel glow.** `src/styles.css` - `filter: blur(80px)
   saturate(1.1); scale: 1.3;` on the blurred backdrop behind the piece
   panel. `renderPiece()` sets `el.ambientImg.src` fresh on every piece
   open/step, so this heavy filter is recomputed on every transition.

3. **Multiple `backdrop-filter: blur(20px)` "glass" elements** (back button,
   photo dots, spec badges) rendered simultaneously, some fading/scaling
   during the same transition as #2.

4. **Continuous canvas redraw for the light-orbit effect**
   (`loadOrbit`/`loopOrbit`/`drawOrbit` in app.js). Runs an uncapped
   `requestAnimationFrame` loop doing full-size `drawImage` alpha-blends on a
   2D canvas (sized to `devicePixelRatio`) for as long as an orbiting piece
   is on screen - competes with the main thread during gestures.

5. **View Transitions API + the above.** The open/close/step morph
   (`transition()` in app.js, using `document.startViewTransition`) is
   supported in Safari but is known to be heavier there than in
   Chromium/Firefox, especially layered on top of #2/#3.

None of these are correctness bugs - each is individually reasonable, but
they stack on top of each other during the same transitions, and iOS is far
less forgiving of that stacking than desktop or Android.

## Possible directions (not decided yet)

- Preload only the opened piece's images + its immediate neighbours, instead
  of the whole catalog; serve a smaller resized variant for the main view.
- Drop or lighten the `.ambient` blur radius, or cache/skip recomputing it
  when the photo hasn't actually changed.
- Pause the orbit `requestAnimationFrame` loop during active touch
  gestures (swipe/drag/zoom), not just on `is-zoomed`/`is-dragging`.
- Re-check whether `startViewTransition` is worth keeping on iOS specifically,
  given the composited-blur combination above.
