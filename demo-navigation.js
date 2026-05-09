(() => {
  function syncProxy(proxy) {
    const target = document.getElementById(proxy.dataset.demoProxy);
    if (!target) {
      proxy.disabled = true;
      return;
    }

    proxy.disabled = target.disabled;
    const pressed = target.getAttribute("aria-pressed");
    if (pressed === null) {
      proxy.removeAttribute("aria-pressed");
    } else {
      proxy.setAttribute("aria-pressed", pressed);
    }

    const label = target.textContent.trim();
    if (label) {
      proxy.textContent = label;
    }
  }

  function bindProxies() {
    document.querySelectorAll("[data-demo-proxy]").forEach((proxy) => {
      const target = document.getElementById(proxy.dataset.demoProxy);
      syncProxy(proxy);

      proxy.addEventListener("click", (event) => {
        event.preventDefault();
        const currentTarget = document.getElementById(proxy.dataset.demoProxy);
        if (!currentTarget || currentTarget.disabled) {
          syncProxy(proxy);
          return;
        }
        currentTarget.click();
        syncProxy(proxy);
      });

      if (target) {
        const observer = new MutationObserver(() => syncProxy(proxy));
        observer.observe(target, {
          attributes: true,
          attributeFilter: ["aria-pressed", "disabled"],
          childList: true,
          characterData: true,
          subtree: true
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindProxies, { once: true });
  } else {
    bindProxies();
  }
})();
