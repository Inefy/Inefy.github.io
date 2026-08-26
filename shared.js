(() => {
  const year = document.querySelector("#year");
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const primaryNav = document.querySelector("#primary-nav");
  // Must match the nav collapse breakpoint in site.css.
  const mobileNavQuery = window.matchMedia("(max-width: 900px)");

  const THEME_KEY = "theme";
  const THEME_COLORS = { dark: "#09182a", light: "#f8f6f1" };
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  const SHARED_NAV_VERSION = "20260824-sharednav2";
  const SHARED_NAV_ITEMS = [
    { label: "Work", href: `work.html?v=${SHARED_NAV_VERSION}` },
    { label: "About", href: `about.html?v=${SHARED_NAV_VERSION}` },
    { label: "Skills", href: `index.html?v=${SHARED_NAV_VERSION}#skills` },
    { label: "Contact", href: `index.html?v=${SHARED_NAV_VERSION}#contact` }
  ];

  function renderSharedNavigation() {
    if (!primaryNav) return;

    const fragment = document.createDocumentFragment();
    SHARED_NAV_ITEMS.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.label;
      fragment.appendChild(link);
    });

    primaryNav.replaceChildren(fragment);
  }

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

  function isMobileNavOpen() {
    return navToggle?.getAttribute("aria-expanded") === "true";
  }

  function setNavToggleLabel(isOpen) {
    if (!navToggle) return;

    const label = isOpen ? "Close" : "Menu";
    const accessibleLabel = isOpen ? "Close navigation menu" : "Open navigation menu";
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", accessibleLabel);
    navToggle.querySelector(".nav-toggle-text").textContent = label;
  }

  function openMobileNav() {
    if (!siteHeader || !navToggle || !primaryNav) return;

    primaryNav.hidden = false;
    siteHeader.classList.add("nav-open");
    setNavToggleLabel(true);
  }

  function closeMobileNav({ returnFocus = false } = {}) {
    if (!siteHeader || !navToggle || !primaryNav) return;

    siteHeader.classList.remove("nav-open");
    setNavToggleLabel(false);

    if (mobileNavQuery.matches) {
      primaryNav.hidden = true;
    }

    if (returnFocus) {
      navToggle.focus();
    }
  }

  function syncMobileNav(event = mobileNavQuery) {
    if (!siteHeader || !navToggle || !primaryNav) return;

    siteHeader.classList.add("nav-enhanced");

    if (event.matches) {
      if (!isMobileNavOpen()) {
        primaryNav.hidden = true;
      }
    } else {
      primaryNav.hidden = false;
      siteHeader.classList.remove("nav-open");
      setNavToggleLabel(false);
    }
  }

  function initMobileNavigation() {
    if (!siteHeader || !navToggle || !primaryNav) return;

    setNavToggleLabel(false);
    syncMobileNav();

    navToggle.addEventListener("click", () => {
      if (isMobileNavOpen()) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    primaryNav.addEventListener("click", (event) => {
      if (mobileNavQuery.matches && event.target.closest("a")) {
        closeMobileNav();
      }
    });

    document.addEventListener("click", (event) => {
      if (!mobileNavQuery.matches || !isMobileNavOpen() || siteHeader.contains(event.target)) return;
      closeMobileNav();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isMobileNavOpen()) {
        closeMobileNav({ returnFocus: true });
      }
    });

    if (mobileNavQuery.addEventListener) {
      mobileNavQuery.addEventListener("change", syncMobileNav);
    } else {
      mobileNavQuery.addListener(syncMobileNav);
    }
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

  function initHeaderScrollState() {
    if (!siteHeader) return;

    let ticking = false;

    function sync() {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 14);
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(sync);
      }
    }, { passive: true });

    sync();
  }

  function initActiveNav() {
    const nav = document.querySelector("#primary-nav");
    if (!nav) return;

    const current = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

    // Every page that sits under Work keeps that tab marked.
    const workPages = new Set([
      "work.html", "dwellsmart.html", "traverseops-demo.html", "movie-library.html", "movie-night.html",
      "paint.html",
      "2048.html", "snake-lab.html", "brick-breaker.html", "asteroid-drift.html",
      "minefield-sweep.html", "mini-golf.html", "flappy-workbench.html",
      "pocket-legends.html"
    ]);

    nav.querySelectorAll("a").forEach((link) => {
      link.removeAttribute("aria-current");
      let targetUrl;
      try {
        targetUrl = new URL(link.getAttribute("href") || "", window.location.href);
      } catch {
        return;
      }
      const href = targetUrl.pathname.split("/").pop().toLowerCase();
      if (!href) return;
      const matchingSection = targetUrl.hash && targetUrl.hash === window.location.hash;
      if ((href === current || (current === "" && href === "index.html")) && (!targetUrl.hash || matchingSection)) {
        link.setAttribute("aria-current", "page");
      } else if (href === "work.html" && workPages.has(current)) {
        link.setAttribute("aria-current", "true");
      }
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
    window.setInterval(() => {
      frame = (frame + 1) % frames.length;
      scene.src = frames[frame];
    }, 420);
  }

  renderSharedNavigation();
  initMobileNavigation();
  initSkipLinks();
  initHeaderScrollState();
  initThemeToggle();
  initActiveNav();
  initHoverPrefetch();
  initPrintButtons();
  initReveal();
  initReadouts();
  initCapeSpearSequence();
})();
