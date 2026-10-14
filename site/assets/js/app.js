/* HUG Atelier lookbook. Reads the collection from products.js. */
(() => {
  "use strict";

  const LOG = "HUG Atelier:";

  // ------------------------------------------------------------ catalog ---

  // catalog.js reads products.js and notes anything that looks wrong. Notes go
  // to the console, and on screen when the page is opened from this computer
  // or with ?check in the address.
  const catalog = window.HUG_readCatalog
    ? window.HUG_readCatalog(window.HUG_ATELIER, window.HUG_ATELIER_ERROR)
    : {
        settings: Object.freeze({ rotateMs: 4000, idleMs: 90000, zoom: 2 }),
        pieces: Object.freeze([]),
        notes: ["assets/js/catalog.js did not load. Check that it is in the assets/js folder."],
      };
  const { settings, pieces } = catalog;
  const notes = catalog.notes.map((n) => (typeof n === "string" ? n : n.text));
  notes.forEach((text) => console.warn(LOG, text));
  const note = (text) => {
    notes.push(text);
    console.warn(LOG, text);
  };

  // --------------------------------------------------------------- dom ---

  const $ = (id) => document.getElementById(id);
  const el = {
    root: document.documentElement,
    showcase: $("showcase"),
    logo: $("logo"),
    stage: $("stage"),
    track: $("track"),
    captionName: $("caption-name"),
    progress: $("progress"),
    counter: $("counter"),
    focus: $("focus"),
    media: $("media"),
    mediaImg: $("media-img"),
    lens: $("lens"),
    lensImg: $("lens-img"),
    index: $("index"),
    indexGrid: $("index-grid"),
    indexBack: $("index-back"),
    dots: $("dots"),
    panel: $("panel"),
    ambientImg: $("ambient-img"),
    ref: $("piece-ref"),
    name: $("piece-name"),
    badges: $("badges"),
    nav: $("nav"),
    focusCounter: $("focus-counter"),
    back: $("back"),
  };

  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)");
  const canMorph = () => typeof document.startViewTransition === "function" && !motionQuery.matches;
  const pad = (n) => String(n).padStart(2, "0");
  const hashId = () => {
    try {
      return decodeURIComponent(location.hash.slice(1));
    } catch {
      return "";
    }
  };
  const count = pieces.length;

  const state = {
    view: "showcase",
    active: 0,
    focus: -1,
    image: 0,
    holds: new Set(),
    busy: false,
    fromIndex: false,
  };

  // ------------------------------------------------------------- images ---

  function setImage(img, src, alt) {
    const frame = img.parentElement;
    frame.classList.remove("is-missing");
    img.alt = alt;
    if (img.getAttribute("src") !== src) img.src = src;
  }

  const missing = new Set();
  function watchImage(img) {
    img.addEventListener("error", () => {
      img.parentElement.classList.add("is-missing");
      const src = img.getAttribute("src");
      if (missing.has(src)) return;
      missing.add(src);
      note(`Photo not found: ${src}. Check the file is in assets/products/ and the name matches exactly, including capital letters.`);
      showNotes();
    });
    img.addEventListener("load", () => img.parentElement.classList.remove("is-missing"));
  }

  // ----------------------------------------------------------- carousel ---

  const slides = pieces.map((piece, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "slide";
    button.setAttribute("aria-roledescription", "slide");
    button.setAttribute("aria-label", `${piece.name}, ${i + 1} of ${count}`);
    const frame = document.createElement("span");
    frame.className = "slide-frame";
    const img = document.createElement("img");
    img.alt = "";
    img.draggable = false;
    img.decoding = "async";
    if (i < 3) img.fetchPriority = i === 0 ? "high" : "auto";
    watchImage(img);
    frame.append(img);
    button.append(frame);
    setImage(img, piece.images[0], "");
    button.addEventListener("click", () => {
      if (drag.suppressClick) return;
      open(i);
    });
    el.track.append(button);
    return { button, frame, img };
  });

  if (!count) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = window.HUG_ATELIER
      ? "No pieces to show. Add one in products.js."
      : "products.js needs a fix.";
    el.stage.append(empty);
    el.showcase.querySelector(".meta").hidden = true;
  }

  function offsetOf(i) {
    let o = (((i - state.active) % count) + count) % count;
    if (o > count / 2) o -= count;
    return o;
  }

  const OPACITY = [1, 0.46, 0.14];

  function layout(instant = false) {
    const jumped = [];
    slides.forEach(({ button }, i) => {
      const o = offsetOf(i);
      const prev = button.dataset.o === undefined ? o : Number(button.dataset.o);
      const jump = Math.abs(o - prev) > 1;
      const reach = Math.abs(o);
      if (instant || jump) {
        button.classList.add("no-anim");
        jumped.push(button);
      }
      button.dataset.o = String(o);
      button.style.setProperty("--o", String(o));
      button.style.setProperty("--s", o === 0 ? "1" : "0.84");
      button.style.setProperty("--a", String(OPACITY[reach] ?? 0));
      button.classList.toggle("is-active", o === 0);
      button.classList.toggle("is-far", reach > 1);
      button.tabIndex = o === 0 ? 0 : -1;
      if (reach > 1) button.setAttribute("aria-hidden", "true");
      else button.removeAttribute("aria-hidden");
    });
    if (jumped.length) {
      void el.track.offsetWidth;
      requestAnimationFrame(() => requestAnimationFrame(() => jumped.forEach((b) => b.classList.remove("no-anim"))));
    }
  }

  function caption(instant = false) {
    if (!count) return;
    const piece = pieces[state.active];
    el.counter.textContent = `${pad(state.active + 1)} / ${pad(count)}`;
    const name = el.captionName;
    name.getAnimations().forEach((a) => a.cancel());
    if (instant || motionQuery.matches) {
      name.textContent = piece.name;
      return;
    }
    const out = name.animate(
      [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-6px)" }],
      { duration: 300, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" },
    );
    out.onfinish = () => {
      name.textContent = piece.name;
      name.animate(
        [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
        { duration: 800, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" },
      );
    };
  }

  function go(delta, instant = false) {
    if (count < 2) return;
    state.active = (((state.active + delta) % count) + count) % count;
    layout(instant);
    caption(instant);
    restartTimer();
  }

  // Auto-rotation is driven by the progress line itself: when it fills, advance.
  let timer = null;
  function restartTimer() {
    if (timer) timer.cancel();
    timer = null;
    if (count < 2) return;
    timer = el.progress.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration: settings.rotateMs,
      easing: "linear",
      fill: "forwards",
    });
    timer.onfinish = () => {
      if (state.view === "showcase") go(1);
    };
    syncTimer();
  }
  function syncTimer() {
    if (!timer) return;
    const paused = state.view !== "showcase" || state.holds.size > 0 || document.hidden;
    if (paused && timer.playState === "running") timer.pause();
    else if (!paused && timer.playState === "paused") timer.play();
  }
  function hold(reason, on) {
    if (on) state.holds.add(reason);
    else state.holds.delete(reason);
    syncTimer();
  }

  el.stage.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && hold("hover", true));
  el.stage.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && hold("hover", false));
  el.stage.addEventListener("focusin", (e) => {
    let visible = false;
    try {
      visible = e.target.matches(":focus-visible");
    } catch {
      /* older browser */
    }
    hold("keyboard", visible);
  });
  el.stage.addEventListener("focusout", () => hold("keyboard", false));
  document.addEventListener("visibilitychange", syncTimer);

  // Swipe / drag the carousel.
  const drag = { id: null, x: 0, y: 0, dx: 0, t: 0, moved: false, suppressClick: false };

  el.stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || count < 2 || state.view !== "showcase") return;
    Object.assign(drag, { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, t: performance.now(), moved: false });
    hold("drag", true);
  });
  el.stage.addEventListener("pointermove", (e) => {
    if (e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      drag.moved = true;
      el.stage.setPointerCapture(e.pointerId);
      el.track.classList.add("is-dragging");
    }
    drag.dx = dx;
    el.track.style.setProperty("--drag", `${dx}px`);
  });
  const endDrag = (e) => {
    if (e.pointerId !== drag.id) return;
    drag.id = null;
    hold("drag", false);
    if (!drag.moved) return;
    const speed = Math.abs(drag.dx) / Math.max(1, performance.now() - drag.t);
    const width = slides[0].button.offsetWidth;
    el.track.classList.remove("is-dragging");
    el.track.style.setProperty("--drag", "0px");
    if (Math.abs(drag.dx) > width * 0.18 || speed > 0.6) go(drag.dx < 0 ? 1 : -1);
    else restartTimer();
    drag.suppressClick = true;
    setTimeout(() => (drag.suppressClick = false), 0);
  };
  el.stage.addEventListener("pointerup", endDrag);
  el.stage.addEventListener("pointercancel", endDrag);

  // -------------------------------------------------------------- focus ---

  const ZOOM_DELAY = 120;
  const LENS_ZOOM = 2.6;
  const zoom = { on: false, x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, raf: 0, delay: 0, anchor: null, badge: -1 };
  el.media.style.setProperty("--zoom", String(settings.zoom));
  watchImage(el.mediaImg);

  function renderPiece(i, imageIndex = 0) {
    const piece = pieces[i];
    state.focus = i;
    state.image = imageIndex;
    resetDrag();
    setImage(el.mediaImg, piece.images[imageIndex], piece.alt);
    el.ambientImg.src = piece.images[0];
    el.ref.textContent = piece.ref;
    el.ref.hidden = !piece.ref;
    el.name.textContent = piece.name;
    el.badges.replaceChildren(...piece.badges.map(renderBadge));
    el.ref.style.setProperty("--i", "0");
    el.name.style.setProperty("--i", "1");
    renderDots(piece);
    el.focusCounter.textContent = `${pad(i + 1)} / ${pad(count)}`;
    el.nav.hidden = count < 2;
    el.focus.classList.remove("is-in");
    void el.focus.offsetWidth;
    el.focus.classList.add("is-in");
    preload(piece.images);
    scheduleOrbit();
  }

  // Badges with a spot on the photo become buttons that glide the zoom there.
  function renderBadge(badge, k) {
    const li = document.createElement("li");
    li.className = "rise";
    li.style.setProperty("--i", String(k + 2));
    const tag = document.createElement(badge.at ? "button" : "span");
    tag.className = "badge glass";
    if (badge.at) {
      tag.type = "button";
      tag.setAttribute("aria-pressed", "false");
      const pip = document.createElement("span");
      pip.className = "pip";
      pip.setAttribute("aria-hidden", "true");
      tag.append(pip);
      tag.addEventListener("click", () => showDetail(k));
    }
    tag.append(badge.label);
    li.append(tag);
    return li;
  }

  function showDetail(k) {
    const badge = pieces[state.focus].badges[k];
    if (!badge || !badge.at) return;
    if (zoom.badge === k) {
      endZoom();
      return scheduleOrbit(2500);
    }
    stopOrbit();
    if (state.image !== 0) showImage(0);
    // Slide the crop window toward the spot first: in a frame narrower or
    // taller than the photo, the spot may sit in the part that is cropped off.
    el.mediaImg.style.objectPosition = `${(badge.at[0] * 100).toFixed(1)}% ${(badge.at[1] * 100).toFixed(1)}%`;
    const { x, y } = toFrame(badge.at, badge.at);
    const wasZoomed = zoom.on;
    endZoom(false, true);
    zoom.badge = k;
    zoom.tx = x;
    zoom.ty = y;
    if (!wasZoomed) {
      zoom.x = x;
      zoom.y = y;
      el.mediaImg.style.setProperty("--ox", `${(x * 100).toFixed(2)}%`);
      el.mediaImg.style.setProperty("--oy", `${(y * 100).toFixed(2)}%`);
    }
    // Then bring the spot to the centre, as far as the frame's edges allow.
    const z = settings.zoom;
    const shift = (p) => Math.min((z - 1) * p, Math.max(-(z - 1) * (1 - p), 0.5 - p));
    el.mediaImg.style.setProperty("--sx", `${(shift(x) * el.media.clientWidth).toFixed(1)}px`);
    el.mediaImg.style.setProperty("--sy", `${(shift(y) * el.media.clientHeight).toFixed(1)}px`);
    zoom.on = true;
    el.media.classList.add("is-zoomed", "is-detail");
    const tags = el.badges.querySelectorAll(".badge");
    tags.forEach((b) => b.matches("button") && b.setAttribute("aria-pressed", String(b === tags[k])));
    if (!zoom.raf) zoom.raf = requestAnimationFrame(tick);
  }

  // Photo coordinates (0-1 of the whole photo) to frame coordinates. The frame
  // crops the photo to fill it; `crop` is the object-position (0-1, default
  // centred) that decides which part is cropped.
  function toFrame([x, y], crop = [0.5, 0.5]) {
    const img = el.mediaImg;
    const w = el.media.clientWidth;
    const h = el.media.clientHeight;
    const nw = img.naturalWidth || 4;
    const nh = img.naturalHeight || 5;
    const k = Math.max(w / nw, h / nh);
    const fx = ((w - nw * k) * crop[0] + x * nw * k) / w;
    const fy = ((h - nh * k) * crop[1] + y * nh * k) / h;
    return { x: Math.min(1, Math.max(0, fx)), y: Math.min(1, Math.max(0, fy)) };
  }

  function renderDots(piece) {
    const many = piece.images.length > 1;
    el.dots.hidden = !many;
    if (!many) return el.dots.replaceChildren();
    el.dots.replaceChildren(
      ...piece.images.map((_, k) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "dot";
        b.setAttribute("aria-label", `Photo ${k + 1} of ${piece.images.length}`);
        b.setAttribute("aria-current", String(k === state.image));
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          showImage(k);
        });
        b.addEventListener("pointerdown", (e) => e.stopPropagation());
        return b;
      }),
    );
  }

  function showImage(k) {
    const piece = pieces[state.focus];
    if (!piece || k === state.image) return;
    state.image = k;
    if (zoom.badge >= 0) endZoom();
    scheduleOrbit();
    [...el.dots.children].forEach((d, n) => d.setAttribute("aria-current", String(n === k)));
    const img = el.mediaImg;
    img.getAnimations().forEach((a) => a.cancel());
    const swap = () => setImage(img, piece.images[k], piece.alt);
    if (motionQuery.matches) return swap();
    img.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: "ease-in", fill: "forwards" }).onfinish = () => {
      swap();
      const reveal = () => img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" });
      img.decode().then(reveal, reveal);
    };
  }

  function showView(view) {
    state.view = view;
    if (view !== "focus") stopOrbit();
    el.showcase.hidden = view === "focus";
    el.showcase.inert = view !== "showcase";
    el.focus.hidden = view !== "focus";
    el.index.hidden = view !== "index";
    syncTimer();
    bumpIdle();
  }

  function transition(kind, update) {
    if (!canMorph()) {
      update();
      return Promise.resolve();
    }
    el.root.dataset.vt = kind;
    const t = document.startViewTransition(update);
    return t.finished.catch(() => {}).finally(() => {
      if (el.root.dataset.vt === kind) delete el.root.dataset.vt;
      if (pendingRoute) {
        pendingRoute = false;
        setTimeout(route, 0);
      }
    });
  }

  // Open a piece, morphing from the photo that was tapped (carousel or index).
  function open(i, { push = true, animate = true, from = null } = {}) {
    if (state.busy || !pieces[i]) return;
    if (state.view === "focus") return step(i - state.focus);
    const piece = pieces[i];
    if (push) history.pushState({ hug: piece.id, pushed: true }, "", `#${piece.id}`);
    endZoom(true);
    const frame = from || slides[i].frame;
    state.fromIndex = Boolean(from);
    const update = () => {
      if (state.active !== i) {
        state.active = i;
        layout(true);
        caption(true);
      }
      renderPiece(i);
      showView("focus");
      el.media.classList.add("glint");
      frame.style.viewTransitionName = "";
      el.media.style.viewTransitionName = "hero";
      el.back.focus({ preventScroll: true });
    };
    if (animate && canMorph()) {
      state.busy = true;
      frame.style.viewTransitionName = "hero";
      el.mediaImg.src = piece.images[0];
      transition("open", update).finally(() => {
        el.media.style.viewTransitionName = "";
        state.busy = false;
      });
    } else {
      update();
      el.media.style.viewTransitionName = "";
      if (animate) {
        el.focus.classList.remove("is-entering");
        void el.focus.offsetWidth;
        el.focus.classList.add("is-entering");
      }
    }
  }

  function close({ animate = true } = {}) {
    if (state.view !== "focus" || state.busy) return;
    const i = state.focus;
    endZoom(true);
    const toIndex = state.fromIndex && Boolean(indexFrames[i]);
    state.fromIndex = false;
    const frame = toIndex ? indexFrames[i] : slides[i].frame;
    const update = () => {
      state.active = i;
      layout(true);
      caption(true);
      resetDrag();
      showView(toIndex ? "index" : "showcase");
      el.media.style.viewTransitionName = "";
      frame.style.viewTransitionName = "hero";
      if (toIndex) {
        frame.scrollIntoView({ block: "nearest" });
        el.indexBack.focus({ preventScroll: true });
      } else if (el.focus.contains(document.activeElement)) document.activeElement.blur();
    };
    const done = () => {
      frame.style.viewTransitionName = "";
      state.busy = false;
      if (toIndex) return;
      // Pauses set before the piece opened may be stale now (pointer moved away).
      state.holds.delete("keyboard");
      state.holds.delete("drag");
      if (!el.stage.matches(":hover")) state.holds.delete("hover");
      restartTimer();
    };
    if (animate && canMorph()) {
      state.busy = true;
      el.media.style.viewTransitionName = "hero";
      transition("close", update).finally(done);
    } else {
      update();
      done();
    }
  }

  function step(delta) {
    if (state.view !== "focus" || count < 2 || state.busy || !delta) return;
    const i = (((state.focus + delta) % count) + count) % count;
    history.replaceState({ hug: pieces[i].id, pushed: history.state?.pushed }, "", `#${pieces[i].id}`);
    endZoom(true);
    if (!canMorph()) return renderPiece(i);
    state.busy = true;
    el.media.style.viewTransitionName = "hero";
    transition(delta > 0 ? "next" : "prev", () => renderPiece(i)).finally(() => {
      el.media.style.viewTransitionName = "";
      state.busy = false;
    });
  }

  function back() {
    if (state.view === "index") return closeIndex();
    if (state.view !== "focus") return;
    if (history.state && history.state.hug && history.state.pushed) history.back();
    else {
      history.replaceState(null, "", location.pathname + location.search);
      close();
    }
  }

  // Entries this page created carry pushed: true, so Back can use history.back().
  let pendingRoute = false;
  function route() {
    if (state.busy) {
      pendingRoute = true;
      return;
    }
    const id = hashId();
    const i = id ? pieces.findIndex((p) => p.id === id) : -1;
    if (i < 0) return close();
    if (state.view === "focus") {
      if (i !== state.focus) step(i - state.focus);
    } else open(i, { push: false });
  }
  window.addEventListener("popstate", route);

  el.back.addEventListener("click", back);
  el.nav.addEventListener("click", (e) => {
    const b = e.target.closest("[data-step]");
    if (b) step(Number(b.dataset.step));
  });

  // -------------------------------------------------------------- index ---

  // Every piece at once, for jumping straight to the one a client asks about.
  let indexFrames = [];
  function buildIndex() {
    if (indexFrames.length) return;
    el.indexGrid.replaceChildren(
      ...pieces.map((piece, i) => {
        const li = document.createElement("li");
        li.className = "index-item-wrap";
        const b = document.createElement("button");
        b.type = "button";
        b.className = "index-item";
        b.style.setProperty("--i", String(i));
        const frame = document.createElement("span");
        frame.className = "index-frame";
        const img = document.createElement("img");
        img.alt = "";
        img.draggable = false;
        img.decoding = "async";
        watchImage(img);
        img.src = piece.images[0];
        frame.append(img);
        const name = document.createElement("span");
        name.className = "index-name";
        name.textContent = piece.name;
        b.append(frame, name);
        if (piece.ref) {
          const ref = document.createElement("span");
          ref.className = "index-ref";
          ref.textContent = piece.ref;
          b.append(ref);
        }
        b.addEventListener("click", () => open(i, { from: frame }));
        indexFrames.push(frame);
        li.append(b);
        return li;
      }),
    );
  }
  // The carousel photo morphs into its place in the grid, and back.
  function openIndex() {
    if (state.busy || state.view !== "showcase" || !count) return;
    buildIndex();
    const from = slides[state.active].frame;
    const to = indexFrames[state.active];
    indexFrames.forEach((f) => f.parentElement.classList.toggle("is-hero", f === to));
    const update = () => {
      showView("index");
      el.index.scrollTop = 0;
      to.scrollIntoView({ block: "nearest" });
      el.index.classList.remove("is-in");
      void el.index.offsetWidth;
      el.index.classList.add("is-in");
      from.style.viewTransitionName = "";
      to.style.viewTransitionName = "hero";
      el.indexBack.focus({ preventScroll: true });
    };
    if (!canMorph()) return update();
    state.busy = true;
    el.index.classList.add("is-morphing");
    from.style.viewTransitionName = "hero";
    transition("index", update).finally(() => {
      to.style.viewTransitionName = "";
      el.index.classList.remove("is-morphing");
      state.busy = false;
    });
  }
  function closeIndex() {
    if (state.view !== "index" || state.busy) return;
    const from = indexFrames[state.active];
    const to = slides[state.active].frame;
    const update = () => {
      showView("showcase");
      from.style.viewTransitionName = "";
      to.style.viewTransitionName = "hero";
    };
    const done = () => {
      to.style.viewTransitionName = "";
      state.busy = false;
      if (!el.stage.matches(":hover")) state.holds.delete("hover");
      restartTimer();
    };
    if (!canMorph() || !from) {
      update();
      return done();
    }
    state.busy = true;
    from.style.viewTransitionName = "hero";
    transition("index", update).finally(done);
  }
  el.counter.addEventListener("click", openIndex);
  el.indexBack.addEventListener("click", closeIndex);

  // --------------------------------------------------------------- zoom ---

  // Mouse: the photo zooms toward the cursor and follows it smoothly.
  function aim(e) {
    const r = el.media.getBoundingClientRect();
    zoom.tx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    zoom.ty = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    el.media.style.setProperty("--lx", `${e.clientX - r.left}px`);
    el.media.style.setProperty("--ly", `${e.clientY - r.top}px`);
  }
  function tick() {
    const ease = motionQuery.matches ? 1 : zoom.badge >= 0 ? 0.05 : 0.09;
    zoom.x += (zoom.tx - zoom.x) * ease;
    zoom.y += (zoom.ty - zoom.y) * ease;
    el.mediaImg.style.setProperty("--ox", `${(zoom.x * 100).toFixed(2)}%`);
    el.mediaImg.style.setProperty("--oy", `${(zoom.y * 100).toFixed(2)}%`);
    const moving = Math.abs(zoom.tx - zoom.x) > 0.0005 || Math.abs(zoom.ty - zoom.y) > 0.0005;
    zoom.raf = zoom.on || moving ? requestAnimationFrame(tick) : 0;
  }
  function startZoom(e) {
    if (state.busy) return;
    aim(e);
    if (!zoom.on) {
      zoom.x = zoom.tx;
      zoom.y = zoom.ty;
    }
    zoom.on = true;
    el.media.classList.add("is-zoomed");
    if (!zoom.raf) zoom.raf = requestAnimationFrame(tick);
  }
  function endZoom(now = false, keepCrop = false) {
    clearTimeout(zoom.delay);
    if (!keepCrop) el.mediaImg.style.removeProperty("object-position");
    zoom.delay = 0;
    zoom.anchor = null;
    zoom.on = false;
    if (zoom.badge >= 0) {
      zoom.badge = -1;
      el.badges.querySelectorAll("button.badge").forEach((b) => b.setAttribute("aria-pressed", "false"));
      el.mediaImg.style.removeProperty("--sx");
      el.mediaImg.style.removeProperty("--sy");
    }
    el.media.classList.remove("is-zoomed", "is-detail");
    if (now) {
      cancelAnimationFrame(zoom.raf);
      zoom.raf = 0;
    }
  }

  // Zoom starts only once the mouse really moves over the photo, so opening a
  // piece with the cursor resting on the left half does not jump straight in.
  el.media.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    if (zoom.badge >= 0) {
      zoom.badge = -1;
      el.media.classList.remove("is-detail");
      el.badges.querySelectorAll("button.badge").forEach((b) => b.setAttribute("aria-pressed", "false"));
      el.mediaImg.style.removeProperty("--sx");
      el.mediaImg.style.removeProperty("--sy");
      el.mediaImg.style.removeProperty("object-position");
    }
    aim(e);
    if (zoom.on || zoom.delay || state.busy || !fineHover.matches) return;
    if (!zoom.anchor) {
      zoom.anchor = [e.clientX, e.clientY];
      return;
    }
    if (Math.hypot(e.clientX - zoom.anchor[0], e.clientY - zoom.anchor[1]) < 6) return;
    zoom.delay = setTimeout(() => {
      zoom.delay = 0;
      startZoom(e);
    }, ZOOM_DELAY);
  });
  el.media.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") endZoom();
  });
  el.media.addEventListener("contextmenu", (e) => e.preventDefault());
  el.media.addEventListener("animationend", (e) => {
    if (e.animationName === "glint") el.media.classList.remove("glint");
  });

  // Touch: hold for the loupe, swipe sideways through the pieces, pull down
  // to go back, pinch to look closer. One finger is decided by its first
  // movement; a second finger always means pinch.
  const touch = { id: null, x0: 0, y0: 0, dx: 0, dy: 0, mode: "", timer: 0, rect: null, trail: [] };
  const fingers = new Map();
  const pinch = { d0: 1, mx: 0, my: 0 };
  const peeks = [$("peek-prev"), $("peek-next")];
  const wrap = (i) => ((i % count) + count) % count;

  // Instantly put the photo, its frame and the panel back to rest.
  function resetDrag() {
    el.media.classList.add("is-dragging");
    clearDrag();
    void el.media.offsetWidth;
    el.media.classList.remove("is-dragging", "is-swiping");
  }
  // Same, but animated back (a gesture that did not go far enough).
  function settle() {
    el.media.classList.remove("is-dragging");
    clearDrag();
    setTimeout(() => el.media.classList.remove("is-swiping"), 480);
  }
  function clearDrag() {
    ["--sx", "--sy", "--ps"].forEach((v) => el.mediaImg.style.removeProperty(v));
    ["--dx", "--py", "--pscale"].forEach((v) => el.media.style.removeProperty(v));
    el.focus.style.removeProperty("--fade");
  }

  function showLens(x, y) {
    el.lensImg.src = el.mediaImg.currentSrc || el.mediaImg.src;
    el.lensImg.style.width = `${touch.rect.width}px`;
    el.lensImg.style.height = `${touch.rect.height}px`;
    moveLens(x, y);
    el.lens.classList.add("is-on");
  }
  function moveLens(x, y) {
    const r = touch.rect;
    const px = Math.min(r.width, Math.max(0, x - r.left));
    const py = Math.min(r.height, Math.max(0, y - r.top));
    const size = el.lens.offsetWidth;
    const half = size / 2;
    // Float above the finger; slide to the side near the top edge.
    let lx = px - half;
    let ly = py - half - size * 0.85;
    if (ly < 8) {
      ly = Math.max(8, py - half);
      lx = px < r.width / 2 ? px + size * 0.45 : px - size * 1.45;
    }
    lx = Math.min(r.width - size - 8, Math.max(8, lx));
    el.lens.style.translate = `${lx.toFixed(1)}px ${ly.toFixed(1)}px`;
    el.lensImg.style.transform = `translate3d(${(half - px * LENS_ZOOM).toFixed(1)}px, ${(half - py * LENS_ZOOM).toFixed(1)}px, 0) scale(${LENS_ZOOM})`;
  }
  function hideLens() {
    el.lens.classList.remove("is-on");
  }

  // Speed over the last ~90 ms, so a flick counts even after a slow start.
  function velocity() {
    const t = touch.trail;
    if (t.length < 2) return { vx: 0, vy: 0 };
    const a = t[0];
    const b = t[t.length - 1];
    const dt = Math.max(1, b.t - a.t);
    return { vx: (b.x - a.x) / dt, vy: (b.y - a.y) / dt };
  }

  function startSwipe() {
    peeks[0].src = pieces[wrap(state.focus - 1)].images[0];
    peeks[1].src = pieces[wrap(state.focus + 1)].images[0];
    el.media.classList.add("is-swiping", "is-dragging");
  }
  // Finish the slide the finger started, then swap in the new piece.
  function commitSwipe(dir) {
    const i = wrap(state.focus + dir);
    const width = touch.rect.width;
    state.busy = true;
    endZoom(true);
    el.media.classList.remove("is-dragging");
    el.media.style.setProperty("--dx", `${-dir * (width + 2)}px`);
    el.focus.style.setProperty("--fade", "0.6");
    history.replaceState({ hug: pieces[i].id, pushed: history.state?.pushed }, "", `#${pieces[i].id}`);
    setTimeout(() => {
      setImage(el.mediaImg, pieces[i].images[0], pieces[i].alt);
      const swap = () => {
        renderPiece(i);
        state.busy = false;
      };
      el.mediaImg.decode().then(swap, swap);
    }, 470);
  }

  function startPinch() {
    clearTimeout(touch.timer);
    hideLens();
    endZoom(true);
    const [a, b] = [...fingers.values()];
    const r = el.media.getBoundingClientRect();
    touch.rect = r;
    pinch.d0 = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
    pinch.mx = (a.x + b.x) / 2;
    pinch.my = (a.y + b.y) / 2;
    if (touch.mode === "swipe" || touch.mode === "pull") clearDrag();
    el.media.classList.remove("is-swiping");
    el.media.classList.add("is-dragging");
    el.mediaImg.style.setProperty("--ox", `${(((pinch.mx - r.left) / r.width) * 100).toFixed(2)}%`);
    el.mediaImg.style.setProperty("--oy", `${(((pinch.my - r.top) / r.height) * 100).toFixed(2)}%`);
    touch.mode = "pinch";
  }
  function movePinch() {
    const [a, b] = [...fingers.values()];
    const scale = Math.min(4, Math.max(1, Math.hypot(a.x - b.x, a.y - b.y) / pinch.d0));
    el.mediaImg.style.setProperty("--ps", scale.toFixed(4));
    el.mediaImg.style.setProperty("--sx", `${((a.x + b.x) / 2 - pinch.mx).toFixed(1)}px`);
    el.mediaImg.style.setProperty("--sy", `${((a.y + b.y) / 2 - pinch.my).toFixed(1)}px`);
  }

  el.media.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" || e.target.closest(".dots")) return;
    fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    el.media.setPointerCapture(e.pointerId);
    if (state.busy) return;
    if (fingers.size === 2 && touch.mode !== "done") return startPinch();
    if (fingers.size > 1 || touch.id !== null) return;
    if (zoom.badge >= 0) endZoom();
    Object.assign(touch, {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      dx: 0,
      dy: 0,
      mode: "wait",
      rect: el.media.getBoundingClientRect(),
      trail: [{ t: performance.now(), x: e.clientX, y: e.clientY }],
    });
    const at = { x: e.clientX, y: e.clientY };
    touch.timer = setTimeout(() => {
      if (touch.mode !== "wait") return;
      touch.mode = "lens";
      showLens(at.x, at.y);
    }, 200);
  });

  el.media.addEventListener("pointermove", (e) => {
    if (!fingers.has(e.pointerId)) return;
    fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touch.mode === "pinch") return movePinch();
    if (e.pointerId !== touch.id) return;
    const now = performance.now();
    touch.trail.push({ t: now, x: e.clientX, y: e.clientY });
    while (touch.trail.length > 2 && now - touch.trail[0].t > 90) touch.trail.shift();
    touch.dx = e.clientX - touch.x0;
    touch.dy = e.clientY - touch.y0;
    if (touch.mode === "wait") {
      if (Math.hypot(touch.dx, touch.dy) < 10) return;
      clearTimeout(touch.timer);
      if (Math.abs(touch.dx) > Math.abs(touch.dy) && count > 1) {
        touch.mode = "swipe";
        startSwipe();
      } else if (touch.dy > 0) {
        touch.mode = "pull";
        el.media.classList.add("is-dragging");
      } else {
        touch.mode = "lens";
        showLens(e.clientX, e.clientY);
      }
    }
    const width = touch.rect.width;
    if (touch.mode === "lens") moveLens(e.clientX, e.clientY);
    else if (touch.mode === "swipe") {
      el.media.style.setProperty("--dx", `${touch.dx.toFixed(1)}px`);
      el.focus.style.setProperty("--fade", Math.min(0.6, (Math.abs(touch.dx) / width) * 0.9).toFixed(3));
    } else if (touch.mode === "pull") {
      const d = Math.max(0, touch.dy);
      const p = Math.min(1, d / 360);
      el.media.style.setProperty("--py", `${(d * 0.6).toFixed(1)}px`);
      el.media.style.setProperty("--pscale", (1 - p * 0.22).toFixed(4));
      el.focus.style.setProperty("--fade", (p * 0.85).toFixed(3));
    }
  });

  const touchEnd = (e) => {
    if (!fingers.has(e.pointerId)) return;
    fingers.delete(e.pointerId);
    const cancelled = e.type === "pointercancel";
    if (touch.mode === "pinch" || touch.mode === "done") {
      // Spring back once every finger has lifted.
      touch.mode = fingers.size ? "done" : "";
      if (!fingers.size) {
        touch.id = null;
        settle();
      }
      return;
    }
    if (e.pointerId !== touch.id) return;
    clearTimeout(touch.timer);
    const { mode, dx, dy, rect } = touch;
    const { vx, vy } = velocity();
    touch.id = null;
    touch.mode = "";
    if (mode === "lens") hideLens();
    else if (mode === "swipe") {
      const far = Math.abs(dx) > rect.width * 0.22;
      const flick = Math.abs(vx) > 0.45 && Math.sign(vx) === Math.sign(dx);
      if (!cancelled && (far || flick)) commitSwipe(dx < 0 ? 1 : -1);
      else settle();
    } else if (mode === "pull") {
      if (!cancelled && (dy > 120 || (dy > 30 && vy > 0.5))) back();
      else settle();
    }
  };
  el.media.addEventListener("pointerup", touchEnd);
  el.media.addEventListener("pointercancel", touchEnd);

  // -------------------------------------------------------------- orbit ---

  // When a piece has light-orbit frames and nobody is touching the photo, the
  // light slowly circles it so the pearls' lustre moves. Consecutive frames are
  // cross-faded, so 24 frames read as continuous motion.
  const orbit = { canvas: $("orbit"), ctx: null, frames: [], src: null, raf: 0, timer: 0, start: 0, on: false };
  const ORBIT_FPS = 4.5;

  function loadOrbit(list) {
    if (orbit.src === list) return;
    orbit.src = list;
    orbit.frames = list
      ? list.map((src) => {
          const img = new Image();
          img.decoding = "async";
          img.src = src;
          return img;
        })
      : [];
  }
  function orbitReady() {
    return orbit.frames.length > 1 && orbit.frames.every((img) => img.complete && img.naturalWidth);
  }
  function stopOrbit() {
    clearTimeout(orbit.timer);
    cancelAnimationFrame(orbit.raf);
    orbit.raf = 0;
    orbit.on = false;
    el.media.classList.remove("is-orbiting");
  }
  function scheduleOrbit(wait = 1600) {
    stopOrbit();
    const piece = pieces[state.focus];
    if (!piece || !piece.orbit || state.view !== "focus" || state.image !== 0 || motionQuery.matches) return;
    loadOrbit(piece.orbit);
    orbit.timer = setTimeout(startOrbit, wait);
  }
  function startOrbit() {
    if (zoom.on || touch.mode || state.busy || state.view !== "focus") return scheduleOrbit(2500);
    if (!orbitReady()) return scheduleOrbit(800);
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    orbit.canvas.width = Math.round(el.media.clientWidth * ratio);
    orbit.canvas.height = Math.round(el.media.clientHeight * ratio);
    orbit.ctx = orbit.canvas.getContext("2d");
    orbit.start = performance.now();
    orbit.on = true;
    drawOrbit(orbit.start);
    el.media.classList.add("is-orbiting");
    orbit.raf = requestAnimationFrame(loopOrbit);
  }
  function drawCover(img, alpha) {
    const { width: cw, height: ch } = orbit.canvas;
    const k = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * k;
    const dh = img.naturalHeight * k;
    orbit.ctx.globalAlpha = alpha;
    orbit.ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }
  function drawOrbit(now) {
    const n = orbit.frames.length;
    const t = ((now - orbit.start) / 1000) * ORBIT_FPS;
    const f = Math.floor(t) % n;
    drawCover(orbit.frames[f], 1);
    drawCover(orbit.frames[(f + 1) % n], t - Math.floor(t));
  }
  function loopOrbit(now) {
    if (!orbit.on) return;
    drawOrbit(now);
    orbit.raf = requestAnimationFrame(loopOrbit);
  }
  // Any touch or hover on the photo hands it back to the still photo and zoom.
  ["pointerdown", "pointermove"].forEach((type) =>
    el.media.addEventListener(type, () => {
      if (orbit.on || orbit.timer) scheduleOrbit(4000);
    }),
  );

  // Light moves across the glass as the pointer moves, like a lamp over nacre.
  let sheenFrame = 0;
  window.addEventListener(
    "pointermove",
    (e) => {
      if (sheenFrame || motionQuery.matches || e.pointerType !== "mouse") return;
      sheenFrame = requestAnimationFrame(() => {
        sheenFrame = 0;
        const angle = 140 + (e.clientX / innerWidth) * 140 + (e.clientY / innerHeight) * 60;
        el.root.style.setProperty("--sheen", `${angle.toFixed(1)}deg`);
      });
    },
    { passive: true },
  );

  // ----------------------------------------------------------- keyboard ---

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key;
    if (key === "f" || key === "F") return toggleFullscreen();
    if (state.view === "showcase") {
      if (key === "ArrowRight" || key === "ArrowLeft") {
        go(key === "ArrowRight" ? 1 : -1);
        if (el.stage.contains(document.activeElement)) slides[state.active].button.focus({ preventScroll: true });
      } else if (key === "Enter" && (document.activeElement === document.body || !document.activeElement)) open(state.active);
      else if (key === "g" || key === "G") openIndex();
      else return;
    } else if (state.view === "index") {
      if (key === "Escape" || key === "Backspace" || key === "g" || key === "G") closeIndex();
      else return;
    } else {
      if (key === "ArrowRight") step(1);
      else if (key === "ArrowLeft") step(-1);
      else if (key === "Escape" || key === "Backspace") back();
      else return;
    }
    e.preventDefault();
  });

  // ----------------------------------------------------- presentation ---

  function toggleFullscreen() {
    const d = document;
    const isOn = d.fullscreenElement || d.webkitFullscreenElement;
    const root = d.documentElement;
    try {
      if (isOn) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else (root.requestFullscreen || root.webkitRequestFullscreen)?.call(root);
    } catch {
      /* not supported on this device */
    }
  }
  el.logo.addEventListener("dblclick", toggleFullscreen);

  // Keep the screen awake while presenting.
  let wakeLock = null;
  async function stayAwake() {
    if (wakeLock || !("wakeLock" in navigator) || document.visibilityState !== "visible") return;
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => (wakeLock = null));
    } catch {
      /* needs a user gesture or is blocked; try again on the next touch */
    }
  }
  document.addEventListener("visibilitychange", stayAwake);
  window.addEventListener("pointerdown", stayAwake, { passive: true });

  // Return to the carousel when the piece view is left alone.
  let idleTimer = 0;
  function bumpIdle() {
    clearTimeout(idleTimer);
    if (settings.idleMs && state.view !== "showcase") idleTimer = setTimeout(back, settings.idleMs);
  }
  ["pointerdown", "pointermove", "keydown", "wheel"].forEach((t) =>
    window.addEventListener(t, bumpIdle, { passive: true }),
  );

  // Load every photo early so nothing appears half-loaded mid-presentation.
  const preloaded = new Set();
  function preload(list) {
    list.forEach((src) => {
      if (preloaded.has(src)) return;
      preloaded.add(src);
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }
  const allImages = [...new Set(pieces.flatMap((p) => [...p.images, ...(p.orbit || [])]))];
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 600));
  idle(() => preload(allImages));

  // Offline copy for venues with weak wifi (needs https or localhost).
  const secure = location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname);
  if ("serviceWorker" in navigator && secure) {
    // Trusted Types: the only script URL this page may ever load as a worker.
    const workerUrl = window.trustedTypes
      ? window.trustedTypes
          .createPolicy("hug-sw", {
            createScriptURL: (url) => {
              if (url !== "sw.js") throw new TypeError("Blocked script URL");
              return url;
            },
          })
          .createScriptURL("sw.js")
      : "sw.js";
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register(workerUrl)
        .then(() => navigator.serviceWorker.ready)
        .then((reg) => reg.active && reg.active.postMessage({ type: "precache", urls: allImages }))
        .catch(() => {});
    });
  }

  // -------------------------------------------------------------- check ---

  // When the owner opens the page from their own computer (or adds ?check),
  // problems in products.js are listed on screen, since tablets have no console.
  const checking =
    location.protocol === "file:" ||
    ["localhost", "127.0.0.1"].includes(location.hostname) ||
    new URLSearchParams(location.search).has("check");
  let panel = null;
  function showNotes() {
    if (!checking || !notes.length) return;
    if (!panel) {
      panel = document.createElement("aside");
      panel.className = "check glass";
      panel.setAttribute("role", "status");
      const head = document.createElement("div");
      head.className = "check-head";
      const title = document.createElement("strong");
      title.textContent = "products.js";
      const shut = document.createElement("button");
      shut.type = "button";
      shut.className = "check-close";
      shut.setAttribute("aria-label", "Close");
      shut.textContent = "×";
      shut.addEventListener("click", () => {
        panel.hidden = true;
      });
      head.append(title, shut);
      panel.append(head, document.createElement("ul"));
      document.body.append(panel);
    }
    panel.hidden = false;
    panel.querySelector("ul").replaceChildren(
      ...notes.map((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        return li;
      }),
    );
  }

  // Option/Alt-click on the large photo gives the numbers for a badge's "at".
  el.media.addEventListener("click", (e) => {
    if (!checking || !e.altKey || state.focus < 0 || state.image !== 0) return;
    e.preventDefault();
    const img = el.mediaImg;
    const r = img.getBoundingClientRect();
    const u = ((e.clientX - r.left) / r.width) * el.media.clientWidth;
    const v = ((e.clientY - r.top) / r.height) * el.media.clientHeight;
    const w = el.media.clientWidth;
    const h = el.media.clientHeight;
    const k = Math.max(w / (img.naturalWidth || 4), h / (img.naturalHeight || 5));
    const x = (u - (w - img.naturalWidth * k) / 2) / (img.naturalWidth * k);
    const y = (v - (h - img.naturalHeight * k) / 2) / (img.naturalHeight * k);
    const line = `{ label: "", at: [${x.toFixed(2)}, ${y.toFixed(2)}] },`;
    note(`Spot on "${pieces[state.focus].name}", copied: ${line}`);
    if (navigator.clipboard) navigator.clipboard.writeText(line).catch(() => {});
    showNotes();
  });

  // --------------------------------------------------------------- boot ---

  layout(true);
  caption(true);
  showNotes();
  stayAwake();
  const startId = hashId();
  const startAt = pieces.findIndex((p) => p.id === startId);
  if (startAt >= 0) {
    state.active = startAt;
    layout(true);
    caption(true);
    open(startAt, { push: false, animate: false });
  }
  restartTimer();
})();
