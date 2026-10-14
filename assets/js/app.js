/* HUG Atelier lookbook. Reads the collection from products.js. */
(() => {
  "use strict";

  const DEFAULT_BADGES = ["Luxury-Grade Silver", "Organic Shape", "Freshwater Pearls"];
  const LOG = "HUG Atelier:";

  // ------------------------------------------------------------ catalog ---

  const source = window.HUG_ATELIER && typeof window.HUG_ATELIER === "object" ? window.HUG_ATELIER : {};
  if (!window.HUG_ATELIER) console.warn(LOG, "products.js did not load or has a typo. Nothing to show.");

  const clampNum = (value, min, max, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  };
  const cleanText = (value, max) =>
    typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
  const cleanList = (value, max) =>
    Array.isArray(value) ? value.map((v) => cleanText(v, max)).filter(Boolean).slice(0, 8) : null;
  const slugify = (value) =>
    cleanText(value, 80)
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "piece";

  // Photos must be files next to the site (relative paths) or https links.
  // Anything else (javascript:, data:, //host) is refused.
  const safeSrc = (value) => {
    const s = cleanText(value, 500);
    if (!s || /[\s"'<>\\`]/.test(s)) return null;
    if (/^https:\/\/[^/]/i.test(s)) return s;
    if (/^[a-z][a-z0-9+.-]*:/i.test(s) || s.startsWith("//")) return null;
    return s;
  };

  const s = source.settings || {};
  const settings = Object.freeze({
    rotateMs: clampNum(s.autoRotateSeconds, 2, 60, 4) * 1000,
    idleMs: clampNum(s.idleReturnSeconds, 0, 3600, 90) * 1000,
    zoom: clampNum(s.zoom, 1.2, 4, 2),
  });

  const pieces = (() => {
    const out = [];
    const seen = new Set();
    const fallback = cleanList(source.defaultBadges, 40) || DEFAULT_BADGES;
    if (!Array.isArray(source.pieces)) {
      if (window.HUG_ATELIER) console.warn(LOG, "pieces should be a list: pieces: [ { ... }, { ... } ]");
      return out;
    }
    source.pieces.forEach((p, n) => {
      const where = `piece ${n + 1} in products.js`;
      if (!p || typeof p !== "object") return console.warn(LOG, `${where} is not a { ... } block. Skipped.`);
      if (p.hidden === true) return;
      const name = cleanText(p.name, 90);
      if (!name) return console.warn(LOG, `${where} has no name. Skipped.`);
      const list = Array.isArray(p.images) ? p.images : p.image ? [p.image] : [];
      const images = list.map(safeSrc).filter(Boolean).slice(0, 12);
      if (images.length < list.length) console.warn(LOG, `"${name}": a photo path was refused. Use a file in assets/products/ or an https:// link.`);
      if (!images.length) return console.warn(LOG, `"${name}" has no photo. Skipped.`);
      let id = slugify(p.id || name);
      for (let k = 2; seen.has(id); k++) id = `${slugify(p.id || name)}-${k}`;
      seen.add(id);
      out.push(Object.freeze({
        id,
        name,
        ref: cleanText(p.ref, 40),
        alt: cleanText(p.alt, 240) || name,
        images: Object.freeze(images),
        badges: Object.freeze(cleanList(p.badges, 40) ?? fallback),
      }));
    });
    return Object.freeze(out);
  })();

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
  };

  // ------------------------------------------------------------- images ---

  function setImage(img, src, alt) {
    const frame = img.parentElement;
    frame.classList.remove("is-missing");
    img.alt = alt;
    if (img.getAttribute("src") !== src) img.src = src;
  }

  function watchImage(img) {
    img.addEventListener("error", () => {
      img.parentElement.classList.add("is-missing");
      console.warn(LOG, `photo not found: ${img.getAttribute("src")}. Check the file name in products.js.`);
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
    empty.textContent = "No pieces to show. Add one in products.js.";
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
  const zoom = { on: false, x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, raf: 0, delay: 0, pointer: null, anchor: null };
  el.media.style.setProperty("--zoom", String(settings.zoom));
  watchImage(el.mediaImg);

  function renderPiece(i, imageIndex = 0) {
    const piece = pieces[i];
    state.focus = i;
    state.image = imageIndex;
    setImage(el.mediaImg, piece.images[imageIndex], piece.alt);
    el.ambientImg.src = piece.images[0];
    el.ref.textContent = piece.ref;
    el.ref.hidden = !piece.ref;
    el.name.textContent = piece.name;
    el.badges.replaceChildren(
      ...piece.badges.map((label, k) => {
        const li = document.createElement("li");
        li.className = "badge glass rise";
        li.style.setProperty("--i", String(k + 2));
        li.textContent = label;
        return li;
      }),
    );
    el.ref.style.setProperty("--i", "0");
    el.name.style.setProperty("--i", "1");
    renderDots(piece);
    el.focusCounter.textContent = `${pad(i + 1)} / ${pad(count)}`;
    el.nav.hidden = count < 2;
    el.focus.classList.remove("is-in");
    void el.focus.offsetWidth;
    el.focus.classList.add("is-in");
    preload(piece.images);
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
    el.showcase.hidden = view !== "showcase";
    el.showcase.inert = view !== "showcase";
    el.focus.hidden = view !== "focus";
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

  function open(i, { push = true, animate = true } = {}) {
    if (state.busy || !pieces[i]) return;
    if (state.view === "focus") return step(i - state.focus);
    const piece = pieces[i];
    if (push) history.pushState({ hug: piece.id, pushed: true }, "", `#${piece.id}`);
    endZoom(true);
    const frame = slides[i].frame;
    const update = () => {
      renderPiece(i);
      showView("focus");
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
    const frame = slides[i].frame;
    const update = () => {
      state.active = i;
      layout(true);
      caption(true);
      showView("showcase");
      el.media.style.viewTransitionName = "";
      frame.style.viewTransitionName = "hero";
      if (el.focus.contains(document.activeElement)) document.activeElement.blur();
    };
    const done = () => {
      frame.style.viewTransitionName = "";
      state.busy = false;
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

  // Hover zoom (mouse) or press-and-hold zoom (touch), following the pointer.
  function aim(e) {
    const r = el.media.getBoundingClientRect();
    zoom.tx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    zoom.ty = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    el.media.style.setProperty("--lx", `${e.clientX - r.left}px`);
    el.media.style.setProperty("--ly", `${e.clientY - r.top}px`);
  }
  function tick() {
    const ease = motionQuery.matches ? 1 : 0.09;
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
  function endZoom(now = false) {
    clearTimeout(zoom.delay);
    zoom.delay = 0;
    zoom.anchor = null;
    zoom.on = false;
    zoom.pointer = null;
    el.media.classList.remove("is-zoomed");
    if (now) {
      cancelAnimationFrame(zoom.raf);
      zoom.raf = 0;
    }
  }

  // Zoom starts only once the mouse really moves over the photo, so opening a
  // piece with the cursor resting on the left half does not jump straight in.
  el.media.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") {
      if (e.pointerId === zoom.pointer) aim(e);
      return;
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
  el.media.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    zoom.pointer = e.pointerId;
    el.media.setPointerCapture(e.pointerId);
    startZoom(e);
  });
  const touchEnd = (e) => {
    if (e.pointerId === zoom.pointer) endZoom();
  };
  el.media.addEventListener("pointerup", touchEnd);
  el.media.addEventListener("pointercancel", touchEnd);
  el.media.addEventListener("contextmenu", (e) => e.preventDefault());

  // Light moves across the glass as the pointer moves, like a lamp over nacre.
  let sheenFrame = 0;
  window.addEventListener(
    "pointermove",
    (e) => {
      if (sheenFrame || motionQuery.matches) return;
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
    if (settings.idleMs && state.view === "focus") idleTimer = setTimeout(back, settings.idleMs);
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
  const allImages = [...new Set(pieces.flatMap((p) => p.images))];
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 600));
  idle(() => preload(allImages));

  // Offline copy for venues with weak wifi (needs https or localhost).
  const secure = location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname);
  if ("serviceWorker" in navigator && secure) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then((reg) => reg.active && reg.active.postMessage({ type: "precache", urls: allImages }))
        .catch(() => {});
    });
  }

  // --------------------------------------------------------------- boot ---

  layout(true);
  caption(true);
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
