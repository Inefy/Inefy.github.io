(() => {
  const body = document.body;
  const localTime = document.querySelector("#local-time");
  const vibeButton = document.querySelector("#shuffle-vibe");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll("[data-tags]");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointerQuery = window.matchMedia("(pointer: fine)");
  const desktopPointerQuery = window.matchMedia("(min-width: 761px)");
  const pointerGlowClass = "pointer-glow-enabled";
  let prefersReducedMotion = reducedMotionQuery.matches;
  let pointerGlowFrame = 0;
  let pointerGlowX = 0;
  let pointerGlowY = 0;
  let pointerGlowListening = false;

  const palettes = [
    {
      name: "Workbench glow",
      colors: ["#ff6f4f", "#f5c45b", "#6de1a6", "#68b7ff", "#bd92ff"]
    },
    {
      name: "Arcade solder",
      colors: ["#ff4f8b", "#ffd166", "#08f7a6", "#45d6ff", "#a78bfa"]
    },
    {
      name: "Movie night",
      colors: ["#ff8a5c", "#f6d365", "#7bd88f", "#8ec5ff", "#f0abfc"]
    },
    {
      name: "Terminal mint",
      colors: ["#f07167", "#f8d66d", "#8cffc1", "#7cc7ff", "#c4a7ff"]
    }
  ];

  function syncPressedState(buttons) {
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
    });
  }

  function updateLocalTime() {
    if (!localTime) return;
    localTime.textContent = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/St_Johns",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short"
    }).format(new Date());
  }

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

  function initPointerGlow() {
    syncPointerGlow();
    addMediaListener(finePointerQuery, syncPointerGlow);
    addMediaListener(desktopPointerQuery, syncPointerGlow);
  }

  if (localTime) {
    updateLocalTime();
    window.setInterval(updateLocalTime, 15000);
  }

  syncPressedState(filterButtons);
  syncMotionPreference();

  addMediaListener(reducedMotionQuery, syncMotionPreference);

  if (vibeButton) {
    vibeButton.addEventListener("click", () => {
      const palette = palettes[Math.floor(Math.random() * palettes.length)];
      const [ember, gold, mint, blue, violet] = palette.colors;

      body.style.setProperty("--ember", ember);
      body.style.setProperty("--gold", gold);
      body.style.setProperty("--mint", mint);
      body.style.setProperty("--blue", blue);
      body.style.setProperty("--violet", violet);
      vibeButton.textContent = palette.name;
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => item.classList.toggle("active", item === button));
      syncPressedState(filterButtons);
      projectCards.forEach((card) => {
        const tags = card.dataset.tags.split(" ");
        card.classList.toggle("hidden", filter !== "all" && !tags.includes(filter));
      });
    });
  });

  initPointerGlow();
})();
