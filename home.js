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

  syncMotionPreference();
  addMediaListener(reducedMotionQuery, syncMotionPreference);
  addMediaListener(finePointerQuery, syncPointerGlow);
  addMediaListener(desktopPointerQuery, syncPointerGlow);
})();
