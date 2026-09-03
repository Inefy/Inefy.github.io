(() => {
  const year = document.querySelector("#year");

  const THEME_KEY = "theme";
  const THEME_COLORS = { dark: "#09182a", light: "#f8f6f1" };
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    const next = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    if (themeColorMeta) themeColorMeta.setAttribute("content", THEME_COLORS[next]);
    return next;
  }

  function storedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  }

  // Apply the saved theme as soon as this (deferred) script runs.
  applyTheme(storedTheme() === "dark" ? "dark" : "light");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  function initSkipLinks() {
    document.querySelectorAll(".skip-link[href^='#']").forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href").slice(1);
        const target = document.getElementById(targetId);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ block: "start" });

        try {
          target.focus({ preventScroll: true });
        } catch {
          target.focus();
        }

        if (window.history?.pushState) {
          window.history.pushState(null, "", `#${targetId}`);
        }
      });
    });
  }

  function initHoverPrefetch() {
    if (navigator.connection && navigator.connection.saveData) return;

    const seen = new Set();

    function prefetch(href) {
      if (seen.has(href)) return;
      seen.add(href);
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      document.head.appendChild(link);
    }

    function onIntent(event) {
      const anchor = event.target.closest && event.target.closest("a[href]");
      if (!anchor) return;
      const raw = anchor.getAttribute("href") || "";
      if (!raw || raw.charAt(0) === "#" || raw.indexOf("mailto:") === 0 || raw.indexOf("tel:") === 0) return;

      let url;
      try {
        url = new URL(raw, window.location.href);
      } catch (err) {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (!/\.html?$/.test(url.pathname)) return;
      if (url.pathname === window.location.pathname) return;
      prefetch(url.href);
    }

    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
  }

  // The toggle lives in the markup so it cannot shift layout on load and so
  // no-JS visitors still see a consistent header. This only wires it up.
  function initThemeToggle() {
    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;

    function syncLabel() {
      const isLight = document.documentElement.dataset.theme === "light";
      const label = isLight ? "Switch to dark theme" : "Switch to light theme";
      btn.setAttribute("aria-label", label);
      btn.setAttribute("aria-pressed", String(isLight));
      btn.title = label;
    }

    btn.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* storage may be unavailable; theme still applies for this session */
      }
      syncLabel();
    });

    syncLabel();
  }

  function initPrintButtons() {
    document.querySelectorAll("[data-print-page]").forEach((button) => {
      button.addEventListener("click", () => window.print());
    });
  }

  function initContactDialog() {
    const dialog = document.querySelector("[data-contact-dialog]");
    const openers = document.querySelectorAll("[data-contact-open]");
    const closeButton = dialog?.querySelector("[data-contact-close]");
    if (!dialog || !openers.length || !closeButton) return;

    const closeDialog = () => {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    };

    openers.forEach((opener) => {
      opener.addEventListener("click", () => {
        if (typeof dialog.showModal === "function") {
          dialog.showModal();
        } else {
          dialog.setAttribute("open", "");
        }
        dialog.querySelector("input:not([type='hidden'])")?.focus();
      });
    });

    closeButton.addEventListener("click", closeDialog);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener("close", () => openers[0].focus());
  }

  /* ------------------------------------------------------------------------
     Motion layer.
     Budget: at most two moving things per viewport, everything gated on
     prefers-reduced-motion, everything IntersectionObserver-driven so nothing
     runs on a scroll handler.
     ------------------------------------------------------------------------ */

  const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal on scroll. Elements opt in with [data-reveal]; stagger comes from an
  // inline --reveal-delay so the markup controls its own rhythm.
  function initReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (!motionOK || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    items.forEach((el) => io.observe(el));
  }

  // Section rail. Built from the page's own landmarks so no page needs markup.
  // Hero crosshair. Pointer position drives two CSS variables; no layout reads.
  // Marquee needs its content duplicated once for a seamless -50% loop.
  // Newfoundland clock on the contact page.
  function initReadouts() {
    const clock = document.querySelector("[data-readout-time]");
    if (!clock) return;

    let fmt;
    try {
      fmt = new Intl.DateTimeFormat("en-CA", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/St_Johns"
      });
    } catch {
      return;
    }

    const paint = () => {
      clock.textContent = `${fmt.format(new Date())} NT`;
    };
    paint();
    window.setInterval(paint, 30000);
  }

  function initCapeSpearSequence() {
    const scene = document.querySelector("[data-cape-spear-sequence]");
    if (!scene) return;

    const frames = Array.from({ length: 9 }, (_, index) =>
      `assets/cape-spear-animated-frame-${String(index).padStart(4, "0")}.png`
    );
    frames.slice(1).forEach((src) => {
      const preload = new Image();
      preload.decoding = "async";
      preload.src = src;
    });

    let frame = 0;
    const frameDuration = 6000 / frames.length;
    window.setInterval(() => {
      frame = (frame + 1) % frames.length;
      scene.src = frames[frame];
    }, frameDuration);
  }

  initSkipLinks();
  initThemeToggle();
  initHoverPrefetch();
  initPrintButtons();
  initContactDialog();
  initReveal();
  initReadouts();
  initCapeSpearSequence();
})();
