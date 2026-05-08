const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const body = document.body;
const localTime = document.querySelector("#local-time");
const vibeButton = document.querySelector("#shuffle-vibe");
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll("[data-tags]");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileNavQuery = window.matchMedia("(max-width: 760px)");
let prefersReducedMotion = reducedMotionQuery.matches;
const twitchPlayers = document.querySelectorAll("[data-twitch-player]");
const twitchChats = document.querySelectorAll("[data-twitch-chat]");
const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector("[data-nav-toggle]");
const primaryNav = document.querySelector("#primary-nav");

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

function syncMotionPreference(event = reducedMotionQuery) {
  prefersReducedMotion = event.matches;

  if (prefersReducedMotion) {
    body.style.removeProperty("--mouse-x");
    body.style.removeProperty("--mouse-y");
  }
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
  link.textContent = type === "chat" ? "Open chat" : "Open stream";

  assist.append(label, link);
  container.appendChild(assist);
}

function mountTwitchEmbed(container, type, parentQuery, isPlainPublicHttp) {
  const channel = safeTwitchChannel(container.dataset.channel || "zurra3");

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

  twitchPlayers.forEach((container) => {
    mountTwitchEmbed(container, "stream", parentQuery, isPlainPublicHttp);
  });

  twitchChats.forEach((container) => {
    mountTwitchEmbed(container, "chat", parentQuery, isPlainPublicHttp);
  });
}

initMobileNavigation();
updateLocalTime();
window.setInterval(updateLocalTime, 15000);
mountTwitchEmbeds();
syncPressedState(filterButtons);
syncMotionPreference();

if (reducedMotionQuery.addEventListener) {
  reducedMotionQuery.addEventListener("change", syncMotionPreference);
} else {
  reducedMotionQuery.addListener(syncMotionPreference);
}

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

window.addEventListener("pointermove", (event) => {
  if (prefersReducedMotion) return;
  body.style.setProperty("--mouse-x", `${event.clientX}px`);
  body.style.setProperty("--mouse-y", `${event.clientY}px`);
});
