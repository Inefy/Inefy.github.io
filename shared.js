(() => {
  const year = document.querySelector("#year");
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const primaryNav = document.querySelector("#primary-nav");
  // Must match the nav collapse breakpoint in site.css.
  const mobileNavQuery = window.matchMedia("(max-width: 900px)");
  let copyEmailAnnouncementTimer = 0;
  let showToast = () => {};

  const THEME_KEY = "theme";
  const THEME_COLORS = { dark: "#0c0f10", light: "#f3f0e7" };
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
  applyTheme(storedTheme() === "light" ? "light" : "dark");

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

  function ensureCopyEmailStatus() {
    let status = document.querySelector("[data-copy-email-status]");
    if (status) {
      if (!status.id) {
        status.id = "copy-email-status";
      }
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      status.setAttribute("aria-atomic", "true");
      return status;
    }

    status = document.createElement("span");
    status.id = "copy-email-status";
    status.className = "sr-only";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    status.dataset.copyEmailStatus = "true";
    document.body.appendChild(status);
    return status;
  }

  function announceCopyEmail(status, message) {
    if (!status || !message) return;

    window.clearTimeout(copyEmailAnnouncementTimer);
    status.textContent = "";
    copyEmailAnnouncementTimer = window.setTimeout(() => {
      status.textContent = message;
    }, 20);
  }

  async function copyTextToClipboard(value) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch {
        throw new Error("Clipboard write blocked");
      }
    }

    throw new Error("Clipboard API unavailable");
  }

  function initCopyEmailButtons() {
    const buttons = document.querySelectorAll("[data-copy-email]");
    if (!buttons.length) return;

    const status = ensureCopyEmailStatus();

    buttons.forEach((button) => {
      button.setAttribute("aria-describedby", status.id);
      if (!button.getAttribute("aria-label")) {
        button.setAttribute("aria-label", "Copy email address to clipboard");
      }

      button.addEventListener("click", async () => {
        if (button.dataset.copying === "true") return;

        const email = button.dataset.copyEmail || "hello@zacbatten.me";
        const originalText = button.dataset.originalText || button.textContent.trim() || "Copy email";
        button.dataset.originalText = originalText;
        button.dataset.copying = "true";
        button.setAttribute("aria-busy", "true");
        announceCopyEmail(status, `Copying ${email} to the clipboard.`);

        try {
          await copyTextToClipboard(email);
          button.textContent = "Copied email";
          announceCopyEmail(status, `Copied ${email} to the clipboard. You can paste it into your email app.`);
          showToast(`Copied ${email}`);
        } catch {
          button.textContent = "Copy failed";
          announceCopyEmail(status, `Could not copy ${email}. Use the Email Zac link instead.`);
          showToast("Could not copy — use the Email link instead");
        }

        window.clearTimeout(Number(button.dataset.resetTimer));
        button.dataset.resetTimer = String(window.setTimeout(() => {
          button.textContent = button.dataset.originalText || "Copy email";
          button.dataset.copying = "false";
          button.removeAttribute("aria-busy");
        }, 2200));
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

  function initNavGroups() {
    const groups = Array.from(document.querySelectorAll("[data-nav-group]"));
    if (!groups.length) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    function closeAll(except) {
      groups.forEach((group) => {
        if (group !== except && group.open) group.open = false;
      });
    }

    groups.forEach((group) => {
      const summary = group.querySelector("summary");
      let hoverTimer = 0;

      // Only one group open at a time.
      group.addEventListener("toggle", () => {
        if (group.open) closeAll(group);
      });

      // Desktop: open on hover intent, close shortly after the pointer leaves
      // (unless focus is still inside, so keyboard users aren't interrupted).
      group.addEventListener("pointerenter", () => {
        if (!finePointer.matches) return;
        window.clearTimeout(hoverTimer);
        group.open = true;
      });
      group.addEventListener("pointerleave", () => {
        if (!finePointer.matches) return;
        window.clearTimeout(hoverTimer);
        hoverTimer = window.setTimeout(() => {
          if (!group.contains(document.activeElement)) group.open = false;
        }, 150);
      });

      // Choosing a destination closes the menu.
      group.querySelectorAll(".nav-menu a").forEach((link) => {
        link.addEventListener("click", () => { group.open = false; });
      });

      // Escape closes and returns focus to the trigger.
      group.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && group.open) {
          group.open = false;
          if (summary) summary.focus();
        }
      });
    });

    // A click anywhere outside an open group dismisses it.
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-nav-group]")) return;
      closeAll(null);
    });

    // Reset open state when crossing the desktop / mobile boundary.
    if (finePointer.addEventListener) {
      finePointer.addEventListener("change", () => closeAll(null));
    }
  }

  function initActiveNav() {
    const nav = document.querySelector("#primary-nav");
    if (!nav) return;

    const current = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

    // Deeper "Work" destinations keep the grouped Work tab marked active.
    const workPages = new Set([
      "work.html", "case-studies.html", "case-study-template.html",
      "traverseops-case-study.html", "traverseops-demo.html",
      "moviebot-case-study.html", "web-paint-case-study.html",
      "movie-library.html", "movie-night.html", "interactive-lab.html",
      "notes.html", "changelog.html", "2048.html", "snake-lab.html",
      "brick-breaker.html", "asteroid-drift.html", "minefield-sweep.html",
      "mini-golf.html", "flappy-workbench.html", "paint.html"
    ]);

    // Exact-match highlight on any nav link, including grouped sub-links.
    nav.querySelectorAll("a").forEach((link) => {
      link.removeAttribute("aria-current");
      const href = (link.getAttribute("href") || "").split("/").pop().toLowerCase();
      if (href && (href === current || (current === "" && href === "index.html"))) {
        link.setAttribute("aria-current", "page");
      }
    });

    // Light up the grouped Work disclosure for any work-section page.
    const group = nav.querySelector("[data-nav-group]");
    if (group) {
      group.classList.toggle("is-active", workPages.has(current));
    }
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

  function initPageToc() {
    const main = document.querySelector(".case-template-main");
    const sidebar = document.querySelector(".case-template-sidebar");
    if (!main || !sidebar) return;

    const items = [];
    main.querySelectorAll("section.case-template-section").forEach((sec) => {
      const h = sec.querySelector("h2[id]");
      if (h) items.push({ id: h.id, text: h.textContent.trim(), section: sec });
    });
    if (items.length < 4) return;

    const nav = document.createElement("nav");
    nav.className = "page-toc";
    nav.setAttribute("aria-label", "On this page");

    const title = document.createElement("p");
    title.className = "page-toc-title";
    title.textContent = "On this page";
    nav.appendChild(title);

    const ul = document.createElement("ul");
    const linkById = new Map();
    let currentId = null;

    function setActive(id) {
      if (id === currentId || !linkById.has(id)) return;
      currentId = id;
      linkById.forEach((a, key) => {
        const on = key === id;
        a.classList.toggle("is-active", on);
        if (on) {
          a.setAttribute("aria-current", "true");
          if (sidebar.scrollHeight > sidebar.clientHeight + 4) {
            const top = a.offsetTop;
            const bottom = top + a.offsetHeight;
            if (top < sidebar.scrollTop || bottom > sidebar.scrollTop + sidebar.clientHeight) {
              sidebar.scrollTop = Math.max(0, top - sidebar.clientHeight / 2);
            }
          }
        } else {
          a.removeAttribute("aria-current");
        }
      });
    }

    items.forEach((it) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#" + it.id;
      a.textContent = it.text;
      a.addEventListener("click", () => setActive(it.id));
      li.appendChild(a);
      ul.appendChild(li);
      linkById.set(it.id, a);
    });
    nav.appendChild(ul);
    sidebar.insertBefore(nav, sidebar.firstChild);

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((obsEntries) => {
        const visible = obsEntries.filter((en) => en.isIntersecting);
        if (!visible.length) return;
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const h = visible[0].target.querySelector("h2[id]");
        if (h) setActive(h.id);
      }, { rootMargin: "-84px 0px -64% 0px", threshold: 0 });
      items.forEach((it) => observer.observe(it.section));
    } else {
      setActive(items[0].id);
    }
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

  function initToasts() {
    let container = null;

    showToast = function (message, { duration = 2600 } = {}) {
      if (!message) return;

      if (!container) {
        container = document.createElement("div");
        container.className = "toast-region";
        container.setAttribute("role", "status");
        container.setAttribute("aria-live", "polite");
        document.body.appendChild(container);
      }

      while (container.children.length >= 3) {
        container.removeChild(container.firstChild);
      }

      const toast = document.createElement("div");
      toast.className = "toast";
      toast.textContent = message;
      container.appendChild(toast);

      window.requestAnimationFrame(() => toast.classList.add("is-visible"));

      window.setTimeout(() => {
        toast.classList.remove("is-visible");
        window.setTimeout(() => toast.remove(), 260);
      }, duration);
    };
  }

  function initImageLightbox() {
    const images = Array.from(document.querySelectorAll(
      ".project-visual img, .lab-card-visual img, .screenshot-gallery__item img, .media-proof__frame img, .case-study-image-frame img"
    )).filter((img) => !img.closest("a"));
    if (!images.length) return;

    let overlay = null;
    let overlayImg = null;
    let overlayCaption = null;
    let closeButton = null;
    let lastFocused = null;

    function isOpen() {
      return !!overlay && overlay.classList.contains("is-open");
    }

    function close() {
      if (!isOpen()) return;
      overlay.classList.remove("is-open");
      document.body.classList.remove("lightbox-open");
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    function build() {
      if (overlay) return;

      overlay = document.createElement("div");
      overlay.className = "lightbox-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", "Enlarged image");
      overlay.innerHTML =
        '<figure class="lightbox-figure">' +
          '<img class="lightbox-image" alt="">' +
          '<figcaption class="lightbox-caption"></figcaption>' +
        "</figure>" +
        '<button type="button" class="lightbox-close" aria-label="Close enlarged image">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        "</button>";
      document.body.appendChild(overlay);

      overlayImg = overlay.querySelector(".lightbox-image");
      overlayCaption = overlay.querySelector(".lightbox-caption");
      closeButton = overlay.querySelector(".lightbox-close");

      closeButton.addEventListener("click", close);
      overlay.addEventListener("mousedown", (event) => {
        if (event.target === overlay || event.target.classList.contains("lightbox-figure")) close();
      });

      document.addEventListener("keydown", (event) => {
        if (!isOpen()) return;
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        } else if (event.key === "Tab") {
          // The close button is the only control inside the dialog.
          event.preventDefault();
          closeButton.focus();
        }
      });
    }

    function open(img) {
      build();
      lastFocused = document.activeElement;
      overlayImg.src = img.currentSrc || img.src;
      overlayImg.alt = img.alt || "";
      overlayCaption.textContent = img.alt || "";
      overlayCaption.hidden = !img.alt;
      overlay.classList.add("is-open");
      document.body.classList.add("lightbox-open");
      closeButton.focus();
    }

    images.forEach((img) => {
      img.classList.add("lightbox-zoomable");
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", img.alt ? "Enlarge image: " + img.alt : "Enlarge image");
      img.addEventListener("click", () => open(img));
      img.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(img);
        }
      });
    });
  }

  function initHeadingAnchors() {
    const headings = document.querySelectorAll(".case-template-main h2[id]");
    if (!headings.length) return;

    headings.forEach((heading) => {
      if (heading.querySelector(".heading-anchor")) return;

      const anchor = document.createElement("a");
      anchor.className = "heading-anchor";
      anchor.href = "#" + heading.id;
      anchor.setAttribute("aria-label", "Copy link to section: " + heading.textContent.trim());
      anchor.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7.1-7.1L11.7 5"/>' +
          '<path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7.1 7.1L12.3 19"/>' +
        "</svg>";

      anchor.addEventListener("click", () => {
        const url = window.location.origin + window.location.pathname + "#" + heading.id;
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(url).then(
            () => showToast("Section link copied"),
            () => showToast("Could not copy link")
          );
        }
      });

      heading.classList.add("has-heading-anchor");
      heading.appendChild(anchor);
    });
  }

  function initLabFilters() {
    const archive = document.querySelector("#lab-archive");
    const grid = document.querySelector(".archive-lab-grid");
    if (!archive || !grid) return;

    const cards = Array.from(grid.querySelectorAll(".lab-card")).filter((card) => card.id);
    if (cards.length < 4) return;

    // Reuse the skill-map cards as the filter taxonomy.
    const groups = [];
    document.querySelectorAll(".lab-skill-card").forEach((skill) => {
      const heading = skill.querySelector("h3");
      const ids = Array.from(skill.querySelectorAll('a[href^="#"]')).map((a) => a.getAttribute("href").slice(1));
      if (heading && ids.length) {
        groups.push({ name: heading.textContent.trim(), ids: new Set(ids) });
      }
    });
    if (!groups.length) return;

    const bar = document.createElement("div");
    bar.className = "lab-filter-bar";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Filter experiments by skill");

    const count = document.createElement("span");
    count.className = "lab-filter-count";

    const status = document.createElement("span");
    status.className = "sr-only";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    let activeButton = null;

    function apply(group, button) {
      if (activeButton) activeButton.setAttribute("aria-pressed", "false");
      activeButton = button;
      button.setAttribute("aria-pressed", "true");

      let shown = 0;
      cards.forEach((card) => {
        const show = !group || group.ids.has(card.id);
        card.classList.toggle("is-filtered-out", !show);
        if (show) shown += 1;
      });

      grid.classList.remove("is-filtering");
      void grid.offsetWidth; // restart the entrance animation
      grid.classList.add("is-filtering");

      count.textContent = shown + " of " + cards.length + " shown";
      status.textContent = "Showing " + shown + " of " + cards.length + " experiments" +
        (group ? " for " + group.name + "." : ".");
    }

    function makeButton(label, group) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lab-filter-chip";
      button.textContent = label;
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => apply(group, button));
      return button;
    }

    const allButton = makeButton("All", null);
    bar.appendChild(allButton);
    groups.forEach((group) => bar.appendChild(makeButton(group.name, group)));
    bar.appendChild(count);

    const headingBlock = archive.querySelector(".section-heading");
    if (headingBlock) {
      headingBlock.insertAdjacentElement("afterend", bar);
    } else {
      archive.insertAdjacentElement("afterbegin", bar);
    }
    document.body.appendChild(status);

    apply(null, allButton);
  }

  function initPrintButtons() {
    document.querySelectorAll("[data-print-page]").forEach((button) => {
      button.addEventListener("click", () => window.print());
    });
  }

  function initLocalTime() {
    const el = document.querySelector("[data-local-time]");
    if (!el) return;

    let formatter;
    try {
      formatter = new Intl.DateTimeFormat("en-CA", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/St_Johns"
      });
    } catch {
      return;
    }

    function tick() {
      el.textContent = formatter.format(new Date()) + " NT";
    }

    tick();
    window.setInterval(tick, 30000);
  }

  initToasts();
  initMobileNavigation();
  initSkipLinks();
  initCopyEmailButtons();
  initHeaderScrollState();
  initThemeToggle();
  initNavGroups();
  initActiveNav();
  initHoverPrefetch();
  initPageToc();
  initImageLightbox();
  initHeadingAnchors();
  initLabFilters();
  initPrintButtons();
  initLocalTime();
})();
