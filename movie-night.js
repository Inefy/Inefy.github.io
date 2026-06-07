(() => {
  const twitchPlayers = document.querySelectorAll("[data-twitch-player]");
  const twitchChats = document.querySelectorAll("[data-twitch-chat]");
  const previewPosterImages = document.querySelectorAll(".movie-preview-posters img");

  function getTwitchParents() {
    const knownParents = ["zacbatten.me", "www.zacbatten.me", "inefy.github.io", "localhost", "127.0.0.1"];
    const host = window.location.hostname;
    const parents = host ? [host, ...knownParents] : knownParents;
    return [...new Set(parents)].map((parent) => `parent=${encodeURIComponent(parent)}`).join("&");
  }

  function isLocalHost() {
    return ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
  }

  function safeTwitchChannel(value) {
    return /^[a-zA-Z0-9_]{1,25}$/.test(value) ? value : "zurra3";
  }

  function renderTwitchFallback(container, channel, type, detail) {
    if (container.querySelector(".embed-fallback")) return;

    const fallback = document.createElement("div");
    fallback.className = "embed-fallback";
    fallback.dataset.auto = "true";

    const inner = document.createElement("div");
    inner.className = "embed-fallback-inner";

    const title = document.createElement("strong");
    title.textContent = type === "chat"
      ? "Twitch chat is not visible here."
      : "Twitch stream is not visible here.";

    const message = document.createElement("p");
    message.textContent = detail || "If the panel stays blank, open Twitch directly. Some browsers and network settings block embedded Twitch frames.";

    const link = document.createElement("a");
    link.className = "button primary";
    link.href = type === "chat"
      ? `https://www.twitch.tv/popout/${encodeURIComponent(channel)}/chat?popout=`
      : `https://www.twitch.tv/${encodeURIComponent(channel)}`;
    link.rel = "noopener noreferrer";
    link.target = "_blank";
    link.textContent = type === "chat" ? "Open chat" : "Open stream";

    inner.append(title, message, link);
    fallback.appendChild(inner);
    container.appendChild(fallback);
  }

  function renderTwitchAssist(container, channel, type) {
    if (container.querySelector(".embed-assist")) return;

    const assist = document.createElement("div");
    assist.className = "embed-assist";

    const label = document.createElement("span");
    label.textContent = "Panel blank?";

    const link = document.createElement("a");
    link.href = type === "chat"
      ? `https://www.twitch.tv/popout/${encodeURIComponent(channel)}/chat?popout=`
      : `https://www.twitch.tv/${encodeURIComponent(channel)}`;
    link.rel = "noopener noreferrer";
    link.target = "_blank";
    link.textContent = type === "chat" ? "Open chat" : "Open stream";

    assist.append(label, link);
    container.appendChild(assist);
  }

  function renderTwitchLoadPrompt(container, channel, type, onLoad) {
    if (container.querySelector(".embed-fallback[data-loader]")) return;

    container.classList.add("embed-pending");

    const fallback = document.createElement("div");
    fallback.className = "embed-fallback";
    fallback.dataset.loader = "true";

    const inner = document.createElement("div");
    inner.className = "embed-fallback-inner";

    const title = document.createElement("strong");
    title.textContent = type === "chat" ? "Load Twitch chat?" : "Load Twitch stream?";

    const message = document.createElement("p");
    message.textContent = "Twitch embeds are loaded only when requested so the page stays fast and avoids unnecessary third-party requests.";

    const actions = document.createElement("div");
    actions.className = "embed-fallback-actions";

    const loadButton = document.createElement("button");
    loadButton.className = "button primary";
    loadButton.type = "button";
    loadButton.textContent = type === "chat" ? "Load chat" : "Load stream";
    loadButton.addEventListener("click", () => {
      fallback.remove();
      onLoad();
    });

    const link = document.createElement("a");
    link.className = "button secondary";
    link.href = type === "chat"
      ? `https://www.twitch.tv/popout/${encodeURIComponent(channel)}/chat?popout=`
      : `https://www.twitch.tv/${encodeURIComponent(channel)}`;
    link.rel = "noopener noreferrer";
    link.target = "_blank";
    link.textContent = type === "chat" ? "Open chat" : "Open stream";

    actions.append(loadButton, link);
    inner.append(title, message, actions);
    fallback.appendChild(inner);
    container.appendChild(fallback);
  }

  function mountTwitchEmbed(container, type, parentQuery, isPlainPublicHttp) {
    const channel = safeTwitchChannel(container.dataset.channel || "zurra3");
    container.classList.remove("embed-pending");

    if (isPlainPublicHttp) {
      renderTwitchFallback(container, channel, type, "Twitch embeds require HTTPS on public pages. Open Twitch directly from here.");
      return;
    }

    let loaded = false;
    const iframe = document.createElement("iframe");
    iframe.title = `${channel} Twitch ${type}`;
    iframe.src = type === "chat"
      ? `https://www.twitch.tv/embed/${encodeURIComponent(channel)}/chat?darkpopout&${parentQuery}`
      : `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&autoplay=false&muted=false&${parentQuery}`;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.sandbox = "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms";

    if (type === "stream") {
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
    }

    iframe.addEventListener("load", () => {
      loaded = true;
      container.classList.add("embed-loaded");
      container.querySelector(".embed-fallback[data-auto]")?.remove();
    });

    iframe.addEventListener("error", () => {
      renderTwitchFallback(container, channel, type);
    });

    window.setTimeout(() => {
      if (!loaded) {
        renderTwitchFallback(container, channel, type);
      }
    }, 4500);

    container.appendChild(iframe);
    renderTwitchAssist(container, channel, type);
  }

  function mountTwitchEmbeds() {
    const isPlainPublicHttp = window.location.protocol !== "https:" && !isLocalHost();
    const parentQuery = getTwitchParents();
    const embeds = [
      ...Array.from(twitchPlayers, (container) => ({ container, type: "stream" })),
      ...Array.from(twitchChats, (container) => ({ container, type: "chat" }))
    ];

    if (!embeds.length) return;

    const mount = (entry) => {
      if (entry.container.dataset.embedMounted === "true") return;
      entry.container.dataset.embedMounted = "true";
      mountTwitchEmbed(entry.container, entry.type, parentQuery, isPlainPublicHttp);
    };

    embeds.forEach((entry) => {
      const channel = safeTwitchChannel(entry.container.dataset.channel || "zurra3");
      renderTwitchLoadPrompt(entry.container, channel, entry.type, () => mount(entry));
    });
  }

  function initMoviePreviewPosters() {
    previewPosterImages.forEach((image) => {
      const tile = image.closest(".movie-preview-tile");

      const markLoaded = () => {
        tile?.classList.add("is-loaded");
      };

      const markMissing = () => {
        tile?.classList.add("is-missing");
        image.remove();
      };

      if (image.complete) {
        if (image.naturalWidth > 0) {
          markLoaded();
        } else {
          markMissing();
        }
        return;
      }

      image.addEventListener("load", markLoaded, { once: true });
      image.addEventListener("error", markMissing, { once: true });
    });
  }

  initMoviePreviewPosters();
  mountTwitchEmbeds();
})();
