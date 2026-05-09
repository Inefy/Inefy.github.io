(() => {
  const year = document.querySelector("#year");
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const primaryNav = document.querySelector("#primary-nav");
  const mobileNavQuery = window.matchMedia("(max-width: 760px)");

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
    if (status) return status;

    status = document.createElement("span");
    status.className = "sr-only";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    status.dataset.copyEmailStatus = "true";
    document.body.appendChild(status);
    return status;
  }

  async function copyTextToClipboard(value) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch {
        // Fall back for browsers that expose the Clipboard API but block writes.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.inset = "0 auto auto 0";
    textarea.style.width = "1px";
    textarea.style.height = "1px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, value.length);

    let didCopy = false;
    try {
      didCopy = document.execCommand("copy");
    } finally {
      textarea.remove();
    }

    if (!didCopy) {
      throw new Error("Email copy failed");
    }

    return didCopy;
  }

  function initCopyEmailButtons() {
    const buttons = document.querySelectorAll("[data-copy-email]");
    if (!buttons.length) return;

    const status = ensureCopyEmailStatus();

    buttons.forEach((button) => {
      button.addEventListener("click", async () => {
        const email = button.dataset.copyEmail || "hello@zacbatten.me";
        const originalText = button.dataset.originalText || button.textContent.trim() || "Copy email";
        button.dataset.originalText = originalText;
        button.disabled = true;

        try {
          await copyTextToClipboard(email);
          button.textContent = "Copied";
          status.textContent = `Email address copied: ${email}.`;
        } catch {
          button.textContent = "Copy failed";
          status.textContent = "Could not copy the email address. Use the Email Zac link instead.";
        }

        window.clearTimeout(Number(button.dataset.resetTimer));
        button.dataset.resetTimer = String(window.setTimeout(() => {
          button.textContent = button.dataset.originalText || "Copy email";
          button.disabled = false;
        }, 2200));
      });
    });
  }

  initMobileNavigation();
  initSkipLinks();
  initCopyEmailButtons();
})();
