/* ==========================================================================
   terrain.js — animated topographic contour field.

   Renders a live elevation map behind the hero: a 3D value-noise field sampled
   on a grid, traced into contour lines with marching squares, drifting slowly
   through the third dimension so the terrain evolves.

   Why this and not a decorative gradient: the work on this site is field
   operations, maps, and canvas rendering. The background is a demonstration of
   the thing it is decorating.

   Budget: one field evaluation per frame, capped at 24fps, paused when
   off-screen or when the tab is hidden. Static single frame under
   prefers-reduced-motion or on small viewports.
   ========================================================================== */

(() => {
  "use strict";

  const canvas = document.querySelector("[data-terrain]");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const smallScreen = window.matchMedia("(max-width: 640px)");

  // ---- value noise ---------------------------------------------------------
  // Deterministic hash -> smooth 3D value noise. No dependency, no tables.

  function hash(x, y, z) {
    let h = x * 374761393 + y * 668265263 + z * 2147483647;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) & 0x7fffffff) / 0x7fffffff;
  }

  const fade = (t) => t * t * (3 - 2 * t);

  function noise3(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);

    const c000 = hash(xi, yi, zi),         c100 = hash(xi + 1, yi, zi);
    const c010 = hash(xi, yi + 1, zi),     c110 = hash(xi + 1, yi + 1, zi);
    const c001 = hash(xi, yi, zi + 1),     c101 = hash(xi + 1, yi, zi + 1);
    const c011 = hash(xi, yi + 1, zi + 1), c111 = hash(xi + 1, yi + 1, zi + 1);

    const x00 = c000 + (c100 - c000) * xf;
    const x10 = c010 + (c110 - c010) * xf;
    const x01 = c001 + (c101 - c001) * xf;
    const x11 = c011 + (c111 - c011) * xf;

    const y0 = x00 + (x10 - x00) * yf;
    const y1 = x01 + (x11 - x01) * yf;

    return y0 + (y1 - y0) * zf;
  }

  // Two octaves is enough to read as terrain and cheap enough to animate.
  function elevation(x, y, z) {
    return noise3(x, y, z) * 0.65 + noise3(x * 2.3, y * 2.3, z * 1.7) * 0.35;
  }

  // ---- field + contours ---------------------------------------------------

  const CELL = 15;          // px between samples
  const LEVELS = 10;        // contour lines
  const SCALE = 0.0022;     // noise frequency in px space
  const DRIFT = 0.045;      // z units per second

  let cols = 0, rows = 0, field = null, dpr = 1;
  let cssW = 0, cssH = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = rect.width;
    cssH = rect.height;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    cols = Math.ceil(cssW / CELL) + 1;
    rows = Math.ceil(cssH / CELL) + 1;
    field = new Float32Array(cols * rows);
    return true;
  }

  function sampleField(z) {
    for (let j = 0; j < rows; j++) {
      const wy = j * CELL * SCALE;
      for (let i = 0; i < cols; i++) {
        field[j * cols + i] = elevation(i * CELL * SCALE, wy, z);
      }
    }
  }

  // Marching squares. For each cell, the four corner values above/below the
  // threshold give a 4-bit case; linear interpolation places the crossings.
  function traceLevel(threshold, path) {
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = field[j * cols + i];            // top-left
        const b = field[j * cols + i + 1];        // top-right
        const c = field[(j + 1) * cols + i + 1];  // bottom-right
        const d = field[(j + 1) * cols + i];      // bottom-left

        let code = 0;
        if (a > threshold) code |= 8;
        if (b > threshold) code |= 4;
        if (c > threshold) code |= 2;
        if (d > threshold) code |= 1;
        if (code === 0 || code === 15) continue;

        const x0 = i * CELL, y0 = j * CELL;
        const t = (p, q) => (threshold - p) / (q - p || 1e-6);

        // Crossing point on each edge, when that edge is crossed.
        const top    = () => [x0 + CELL * t(a, b), y0];
        const right  = () => [x0 + CELL, y0 + CELL * t(b, c)];
        const bottom = () => [x0 + CELL * t(d, c), y0 + CELL];
        const left   = () => [x0, y0 + CELL * t(a, d)];

        let seg;
        switch (code) {
          case 1: case 14: seg = [left(), bottom()]; break;
          case 2: case 13: seg = [bottom(), right()]; break;
          case 3: case 12: seg = [left(), right()]; break;
          case 4: case 11: seg = [top(), right()]; break;
          case 6: case 9:  seg = [top(), bottom()]; break;
          case 7: case 8:  seg = [left(), top()]; break;
          // Saddles: draw both crossings rather than guessing connectivity.
          case 5:  path.moveTo(...left());  path.lineTo(...top());
                   path.moveTo(...bottom()); path.lineTo(...right()); continue;
          case 10: path.moveTo(...left());  path.lineTo(...bottom());
                   path.moveTo(...top());   path.lineTo(...right()); continue;
          default: continue;
        }
        path.moveTo(seg[0][0], seg[0][1]);
        path.lineTo(seg[1][0], seg[1][1]);
      }
    }
  }

  // Colours come from the stylesheet so the terrain follows the theme. Cached
  // because getComputedStyle forces a style resolve, and this runs per frame.
  let palette = null;

  function readPalette() {
    const cs = getComputedStyle(document.documentElement);
    const pick = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
    palette = {
      cool: pick("--terrain-line", "rgba(108,194,232,0.42)"),
      warm: pick("--terrain-peak", "rgba(195,241,79,0.5)")
    };
    return palette;
  }

  function draw(z) {
    sampleField(z);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const { cool, warm } = palette || readPalette();

    for (let n = 0; n < LEVELS; n++) {
      const threshold = 0.28 + (n / (LEVELS - 1)) * 0.42;
      const path = new Path2D();
      traceLevel(threshold, path);

      // Higher ground reads brighter and heavier, like a real relief map.
      const t = n / (LEVELS - 1);
      ctx.strokeStyle = t > 0.72 ? warm : cool;
      ctx.globalAlpha = 0.22 + t * 0.55;
      ctx.lineWidth = t > 0.72 ? 1.15 : 0.75;
      ctx.stroke(path);
    }

    ctx.globalAlpha = 1;
  }

  // ---- loop ---------------------------------------------------------------

  let raf = 0, last = 0, z = Math.random() * 100, visible = true;
  const FRAME_MS = 1000 / 24;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (now - last < FRAME_MS) return;
    z += ((now - last) / 1000) * DRIFT;
    last = now;
    draw(z);
  }

  function start() {
    if (raf || !visible) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function isStatic() {
    return reduceMotion.matches || smallScreen.matches;
  }

  function render() {
    if (!resize()) return;
    if (isStatic()) {
      stop();
      draw(z);
    } else {
      start();
    }
  }

  // Only animate while the hero is actually on screen.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible && !isStatic()) start();
        else stop();
      },
      { rootMargin: "80px" }
    ).observe(canvas);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (visible && !isStatic()) start();
  });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(render, 160);
  });

  const onPrefChange = () => render();
  if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", onPrefChange);
  if (smallScreen.addEventListener) smallScreen.addEventListener("change", onPrefChange);

  // Theme flip invalidates the cached palette; redraw immediately if paused.
  new MutationObserver(() => {
    readPalette();
    if (isStatic() || !raf) draw(z);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  render();
})();
