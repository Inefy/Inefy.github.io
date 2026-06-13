(() => {
  const year = document.querySelector("#year");
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const primaryNav = document.querySelector("#primary-nav");
  const mobileNavQuery = window.matchMedia("(max-width: 760px)");
  let copyEmailAnnouncementTimer = 0;

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
        } catch {
          button.textContent = "Copy failed";
          announceCopyEmail(status, `Could not copy ${email}. Use the Email Zac link instead.`);
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

  function initScrollReveal() {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sections = Array.from(document.querySelectorAll("main > section"))
      .filter((section) => !section.classList.contains("home-hero"));
    if (!sections.length) return;

    document.body.classList.add("reveal-enabled");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });

    sections.forEach((section) => observer.observe(section));
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

  function initSpotlightCards() {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    const cards = document.querySelectorAll(
      ".project-card, .selected-work-card, .strength-card, .lab-card, .resume-card, .work-card, .note-card, .case-study-listing, .supporting-work-grid article, .what-card, .hero-terminal, .quick-profile"
    );

    cards.forEach((card) => {
      if (card.querySelector(":scope > .spot-layer")) return;

      const layer = document.createElement("span");
      layer.className = "spot-layer";
      layer.setAttribute("aria-hidden", "true");
      card.appendChild(layer);
      card.classList.add("spot-card");

      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      });
    });
  }

  function initScrollProgress() {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    let ticking = false;

    function sync() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bar.style.setProperty("--scroll-p", progress.toFixed(4));
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(sync);
      }
    }, { passive: true });

    window.addEventListener("resize", () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(sync);
      }
    }, { passive: true });

    sync();
  }

  function initBackToTop() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "back-to-top";
    button.setAttribute("aria-label", "Back to top");
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(button);

    let ticking = false;

    function sync() {
      button.classList.toggle("is-visible", window.scrollY > 680);
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(sync);
      }
    }, { passive: true });

    button.addEventListener("click", () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });

    sync();
  }

  function initCommandPalette() {
    const header = document.querySelector(".site-header");
    if (!header || document.querySelector(".cmdk-overlay")) return;

    const ua = navigator.userAgent || "";
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || ua);
    const modLabel = isMac ? "⌘" : "Ctrl";

    const ICON = {
      search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
      page: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h6"/></svg>',
      project: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M8 21h8"/></svg>',
      play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/></svg>',
      mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/></svg>',
      copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
      external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>'
    };

    const items = [
      { group: "Pages", label: "Home", desc: "Portfolio overview", icon: "page", type: "link", href: "index.html", keywords: "start front" },
      { group: "Pages", label: "Work", desc: "Selected projects index", icon: "page", type: "link", href: "work.html", keywords: "projects portfolio" },
      { group: "Pages", label: "About", desc: "Background and approach", icon: "page", type: "link", href: "about.html", keywords: "bio who" },
      { group: "Pages", label: "Resume", desc: "Compact experience scan", icon: "page", type: "link", href: "resume.html", keywords: "cv experience hire" },
      { group: "Pages", label: "Contact", desc: "Ways to reach me", icon: "page", type: "link", href: "contact.html", keywords: "email hire reach" },
      { group: "Pages", label: "Case studies", desc: "Deep dives on builds", icon: "page", type: "link", href: "case-studies.html", keywords: "writeups detail" },
      { group: "Pages", label: "Build notes", desc: "Implementation notes", icon: "page", type: "link", href: "notes.html", keywords: "blog notes" },
      { group: "Pages", label: "Interactive Lab", desc: "Small experiments", icon: "page", type: "link", href: "interactive-lab.html", keywords: "experiments demos" },
      { group: "Pages", label: "Changelog", desc: "Site updates", icon: "page", type: "link", href: "changelog.html", keywords: "updates history" },

      { group: "Projects", label: "TraverseOps", desc: "Map-first field-operations UI", icon: "project", type: "link", href: "traverseops-case-study.html", keywords: "map maplibre internal tools assets" },
      { group: "Projects", label: "TraverseOps demo", desc: "Live sample app", icon: "project", type: "link", href: "traverseops-demo.html", keywords: "map demo live" },
      { group: "Projects", label: "MovieBot", desc: "Python / Twitch / OBS automation", icon: "project", type: "link", href: "moviebot-case-study.html", keywords: "python twitch obs bot" },
      { group: "Projects", label: "Web Paint", desc: "Canvas drawing tool", icon: "project", type: "link", href: "web-paint-case-study.html", keywords: "canvas draw" },
      { group: "Projects", label: "Web Paint (live tool)", desc: "Open the editor", icon: "project", type: "link", href: "paint.html", keywords: "canvas draw live" },
      { group: "Projects", label: "Movie Library", desc: "Public-domain voting catalog", icon: "project", type: "link", href: "movie-library.html", keywords: "catalog movies vote" },
      { group: "Projects", label: "Movie Night", desc: "Stream + chat + bot page", icon: "project", type: "link", href: "movie-night.html", keywords: "stream twitch" },

      { group: "Play", label: "2048", desc: "Tile-merge puzzle", icon: "play", type: "link", href: "2048.html", keywords: "game puzzle" },
      { group: "Play", label: "Snake Lab", desc: "Classic snake", icon: "play", type: "link", href: "snake-lab.html", keywords: "game snake" },
      { group: "Play", label: "Brick Breaker", desc: "Paddle and bricks", icon: "play", type: "link", href: "brick-breaker.html", keywords: "game breakout arkanoid" },
      { group: "Play", label: "Asteroid Drift", desc: "Space shooter", icon: "play", type: "link", href: "asteroid-drift.html", keywords: "game space asteroids" },
      { group: "Play", label: "Minefield Sweep", desc: "Minesweeper", icon: "play", type: "link", href: "minefield-sweep.html", keywords: "game minesweeper" },
      { group: "Play", label: "Mini Golf", desc: "Putt-putt physics", icon: "play", type: "link", href: "mini-golf.html", keywords: "game golf" },
      { group: "Play", label: "Flappy Workbench", desc: "Flap through gaps", icon: "play", type: "link", href: "flappy-workbench.html", keywords: "game flappy bird" },

      { group: "Actions", label: "Copy email", desc: "hello@zacbatten.me", icon: "copy", type: "copy", value: "hello@zacbatten.me", keywords: "contact clipboard" },
      { group: "Actions", label: "Email Zac", desc: "Open mail client", icon: "mail", type: "link", href: "mailto:hello@zacbatten.me", keywords: "contact" },
      { group: "Actions", label: "GitHub", desc: "github.com/Inefy", icon: "external", type: "external", href: "https://github.com/Inefy", keywords: "code source repo" }
    ];

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "cmdk-trigger";
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Open command menu");
    trigger.innerHTML =
      '<span class="cmdk-trigger-icon" aria-hidden="true">' + ICON.search + "</span>" +
      '<span class="cmdk-trigger-label">Search</span>' +
      '<span class="cmdk-kbd" aria-hidden="true">' + modLabel + "K</span>";
    const navEl = header.querySelector(".nav-toggle") || header.querySelector(".nav");
    header.insertBefore(trigger, navEl);

    const overlay = document.createElement("div");
    overlay.className = "cmdk-overlay";
    const panel = document.createElement("div");
    panel.className = "cmdk-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "Command menu");

    const inputId = "cmdk-input";
    const listId = "cmdk-list";
    panel.innerHTML =
      '<div class="cmdk-search">' +
        '<span class="cmdk-search-icon" aria-hidden="true">' + ICON.search + "</span>" +
        '<input id="' + inputId + '" class="cmdk-input" type="text" role="combobox" autocomplete="off" ' +
          'spellcheck="false" placeholder="Jump to a page, project, or game…" ' +
          'aria-expanded="true" aria-controls="' + listId + '" aria-label="Search the site">' +
      "</div>" +
      '<ul id="' + listId + '" class="cmdk-list" role="listbox" aria-label="Results"></ul>' +
      '<div class="cmdk-footer" aria-hidden="true">' +
        "<span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>" +
        "<span><kbd>↵</kbd> open</span>" +
        "<span><kbd>esc</kbd> close</span>" +
      "</div>";
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const input = panel.querySelector("#" + inputId);
    const list = panel.querySelector("#" + listId);

    const status = document.createElement("span");
    status.className = "sr-only";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    document.body.appendChild(status);

    let visible = [];
    let activeIndex = 0;
    let lastFocused = null;
    let isOpen = false;

    function matches(item, q) {
      if (!q) return true;
      const hay = (item.label + " " + (item.desc || "") + " " + (item.group || "") + " " + (item.keywords || "")).toLowerCase();
      return q.split(/\s+/).every((part) => hay.includes(part));
    }

    function render() {
      const q = input.value.trim().toLowerCase();
      const results = items.filter((it) => matches(it, q));
      visible = results;
      list.innerHTML = "";

      if (!results.length) {
        const empty = document.createElement("li");
        empty.className = "cmdk-empty";
        empty.textContent = "No matches. Try “work”, “python”, or “game”.";
        list.appendChild(empty);
        input.removeAttribute("aria-activedescendant");
        return;
      }

      let lastGroup = null;
      results.forEach((it, i) => {
        if (it.group !== lastGroup) {
          const gl = document.createElement("li");
          gl.className = "cmdk-group-label";
          gl.setAttribute("role", "presentation");
          gl.textContent = it.group;
          list.appendChild(gl);
          lastGroup = it.group;
        }
        const li = document.createElement("li");
        li.className = "cmdk-option";
        li.id = "cmdk-opt-" + i;
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", "false");
        li.innerHTML =
          '<span class="cmdk-option-icon" aria-hidden="true">' + (ICON[it.icon] || ICON.page) + "</span>" +
          '<span class="cmdk-option-label">' + it.label +
            (it.desc ? '<span class="cmdk-option-desc">' + it.desc + "</span>" : "") +
          "</span>" +
          '<span class="cmdk-option-hint" aria-hidden="true">↵</span>';
        li.addEventListener("mousemove", () => setActive(i));
        li.addEventListener("click", () => activate(i));
        list.appendChild(li);
      });

      activeIndex = 0;
      setActive(0);
    }

    function setActive(i) {
      if (!visible.length) return;
      activeIndex = (i + visible.length) % visible.length;
      const options = list.querySelectorAll(".cmdk-option");
      options.forEach((el, idx) => {
        const on = idx === activeIndex;
        el.classList.toggle("is-active", on);
        el.setAttribute("aria-selected", on ? "true" : "false");
        if (on) {
          input.setAttribute("aria-activedescendant", el.id);
          el.scrollIntoView({ block: "nearest" });
        }
      });
    }

    function activate(i) {
      const it = visible[i];
      if (!it) return;
      if (it.type === "copy") {
        const value = it.value;
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(value).then(
            function () { status.textContent = "Copied " + value + " to the clipboard."; },
            function () { status.textContent = "Could not copy. Try the Email Zac action."; }
          );
        }
        close();
        return;
      }
      if (it.type === "external") {
        window.open(it.href, "_blank", "noopener,noreferrer");
        close();
        return;
      }
      window.location.href = it.href;
    }

    function open() {
      if (isOpen) return;
      isOpen = true;
      lastFocused = document.activeElement;
      input.value = "";
      render();
      overlay.classList.add("is-open");
      document.body.classList.add("cmdk-open");
      trigger.setAttribute("aria-expanded", "true");
      window.requestAnimationFrame(function () { input.focus(); });
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      overlay.classList.remove("is-open");
      document.body.classList.remove("cmdk-open");
      trigger.setAttribute("aria-expanded", "false");
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      } else {
        trigger.focus();
      }
    }

    trigger.addEventListener("click", open);

    overlay.addEventListener("mousedown", function (event) {
      if (event.target === overlay) close();
    });

    input.addEventListener("input", render);

    input.addEventListener("keydown", function (event) {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setActive(activeIndex + 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          setActive(activeIndex - 1);
          break;
        case "Home":
          event.preventDefault();
          setActive(0);
          break;
        case "End":
          event.preventDefault();
          setActive(visible.length - 1);
          break;
        case "Enter":
          event.preventDefault();
          activate(activeIndex);
          break;
        case "Escape":
          event.preventDefault();
          close();
          break;
        case "Tab":
          event.preventDefault();
          break;
        default:
          break;
      }
    });

    document.addEventListener("keydown", function (event) {
      const key = (event.key || "").toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        if (isOpen) { close(); } else { open(); }
        return;
      }
      if (key === "/" && !isOpen) {
        const t = event.target;
        const tag = t && t.tagName ? t.tagName.toLowerCase() : "";
        const typing = tag === "input" || tag === "textarea" || tag === "select" || (t && t.isContentEditable);
        if (!typing) {
          event.preventDefault();
          open();
        }
      }
    });
  }

  initMobileNavigation();
  initSkipLinks();
  initCopyEmailButtons();
  initScrollReveal();
  initHeaderScrollState();
  initSpotlightCards();
  initScrollProgress();
  initBackToTop();
  initCommandPalette();
})();
