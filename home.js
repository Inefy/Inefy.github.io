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

  function initTerminalTyping() {
    const terminal = document.querySelector(".hero-terminal");
    const termBody = terminal ? terminal.querySelector(".terminal-body") : null;
    if (!terminal || !termBody) return;

    const original = termBody.innerHTML;
    let timers = [];

    function restore() {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
      termBody.innerHTML = original;
    }

    function run() {
      restore();
      try {
      const lines = Array.from(termBody.querySelectorAll("p"));
      if (!lines.length) return;

      const model = lines.map((line) => {
        const isCmd = line.classList.contains("t-cmd");
        const isFinalPrompt = !!line.querySelector(".terminal-cursor");
        let text = "";

        if (isFinalPrompt) {
          text = "";
        } else if (isCmd) {
          text = (line.textContent || "").replace(/^\s*\$\s*/, "");
          const prompt = line.querySelector(".prompt");
          line.textContent = "";
          if (prompt) {
            line.appendChild(prompt);
            line.appendChild(document.createTextNode(" "));
          } else {
            line.appendChild(document.createTextNode("$ "));
          }
        } else {
          text = line.textContent;
          line.textContent = "";
        }

        line.style.visibility = "hidden";
        return { line, isCmd, isFinalPrompt, text };
      });

      const cursor = document.createElement("span");
      cursor.className = "terminal-cursor";
      cursor.setAttribute("aria-hidden", "true");

      const safety = window.setTimeout(restore, 9000);
      timers.push(safety);

      let li = 0;

      function typeLine() {
        if (li >= model.length) {
          if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
          window.clearTimeout(safety);
          return;
        }

        const m = model[li];
        m.line.style.visibility = "visible";

        if (m.isFinalPrompt) {
          li += 1;
          timers.push(window.setTimeout(typeLine, 140));
          return;
        }

        if (m.isCmd) {
          m.line.appendChild(cursor);
          let ci = 0;
          (function typeChar() {
            if (ci < m.text.length) {
              cursor.insertAdjacentText("beforebegin", m.text.charAt(ci));
              ci += 1;
              timers.push(window.setTimeout(typeChar, 26 + Math.random() * 36));
            } else {
              if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
              li += 1;
              timers.push(window.setTimeout(typeLine, 300));
            }
          })();
        } else {
          m.line.textContent = m.text;
          li += 1;
          timers.push(window.setTimeout(typeLine, 240));
        }
      }

      typeLine();
      } catch (err) {
        restore();
      }
    }

    // Small replay control (outside the aria-hidden title bar) so the
    // typing sequence can be watched again on demand.
    const replay = document.createElement("button");
    replay.type = "button";
    replay.className = "terminal-replay";
    replay.title = "Replay animation";
    replay.setAttribute("aria-label", "Replay terminal animation");
    replay.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>';
    replay.addEventListener("click", () => {
      if (reducedMotionQuery.matches) return;
      run();
    });
    terminal.appendChild(replay);

    if (!reducedMotionQuery.matches) run();
  }

  syncMotionPreference();
  addMediaListener(reducedMotionQuery, syncMotionPreference);
  addMediaListener(finePointerQuery, syncPointerGlow);
  addMediaListener(desktopPointerQuery, syncPointerGlow);
  initRotatingWord();
  initCountUp();
  initTerminalTyping();
})();
