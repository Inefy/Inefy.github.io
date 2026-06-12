(() => {
  const body = document.body;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointerQuery = window.matchMedia("(pointer: fine)");
  const desktopPointerQuery = window.matchMedia("(min-width: 761px)");
  const pointerGlowClass = "pointer-glow-enabled";
  let prefersReducedMotion = reducedMotionQuery.matches;
  let pointerGlowFrame = 0;
  let pointerGlowX = 0;
  let pointerGlowY = 0;
  let pointerGlowListening = false;

  function addMediaListener(query, callback) {
    if (query.addEventListener) {
      query.addEventListener("change", callback);
    } else {
      query.addListener(callback);
    }
  }

  function canUsePointerGlow() {
    return finePointerQuery.matches && desktopPointerQuery.matches && !prefersReducedMotion;
  }

  function resetPointerGlow() {
    if (pointerGlowFrame) {
      window.cancelAnimationFrame(pointerGlowFrame);
      pointerGlowFrame = 0;
    }
    body.classList.remove(pointerGlowClass);
    body.style.removeProperty("--mouse-x");
    body.style.removeProperty("--mouse-y");
  }

  function updatePointerGlow() {
    if (!canUsePointerGlow()) {
      resetPointerGlow();
      return;
    }

    body.style.setProperty("--mouse-x", `${pointerGlowX}px`);
    body.style.setProperty("--mouse-y", `${pointerGlowY}px`);
    pointerGlowFrame = 0;
  }

  function handlePointerGlow(event) {
    if (!canUsePointerGlow()) return;

    pointerGlowX = event.clientX;
    pointerGlowY = event.clientY;

    if (!pointerGlowFrame) {
      pointerGlowFrame = window.requestAnimationFrame(updatePointerGlow);
    }
  }

  function syncPointerGlow() {
    if (canUsePointerGlow()) {
      body.classList.add(pointerGlowClass);

      if (!pointerGlowListening) {
        window.addEventListener("pointermove", handlePointerGlow, { passive: true });
        pointerGlowListening = true;
      }
      return;
    }

    if (pointerGlowListening) {
      window.removeEventListener("pointermove", handlePointerGlow);
      pointerGlowListening = false;
    }

    resetPointerGlow();
  }

  function syncMotionPreference(event = reducedMotionQuery) {
    prefersReducedMotion = event.matches;
    syncPointerGlow();

    if (prefersReducedMotion) {
      body.style.removeProperty("--mouse-x");
      body.style.removeProperty("--mouse-y");
    }
  }

  function initRotatingWord() {
    const el = document.querySelector(".rotating-word");
    if (!el || prefersReducedMotion) return;

    let words = [];
    try {
      words = JSON.parse(el.dataset.words || "[]");
    } catch {
      return;
    }
    if (!Array.isArray(words) || words.length < 2) return;

    let index = Math.max(0, words.indexOf(el.textContent.trim()));

    window.setInterval(() => {
      if (reducedMotionQuery.matches) return;
      el.classList.add("is-out");
      window.setTimeout(() => {
        index = (index + 1) % words.length;
        el.textContent = words[index];
        el.classList.remove("is-out");
      }, 270);
    }, 3100);
  }

  function initCountUp() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        const target = Number(entry.target.dataset.count) || 0;
        if (reducedMotionQuery.matches || target <= 0) {
          entry.target.textContent = String(target);
          return;
        }

        const started = performance.now();
        const duration = 950;

        function tick(now) {
          const progress = Math.min(1, (now - started) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          entry.target.textContent = String(Math.round(eased * target));
          if (progress < 1) window.requestAnimationFrame(tick);
        }

        window.requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });

    counters.forEach((counter) => observer.observe(counter));
  }

  syncMotionPreference();
  addMediaListener(reducedMotionQuery, syncMotionPreference);
  addMediaListener(finePointerQuery, syncPointerGlow);
  addMediaListener(desktopPointerQuery, syncPointerGlow);
  initRotatingWord();
  initCountUp();
})();
