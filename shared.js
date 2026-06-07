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

  initMobileNavigation();
  initSkipLinks();
  initCopyEmailButtons();
})();
