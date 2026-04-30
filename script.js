const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const body = document.body;
const localTime = document.querySelector("#local-time");
const vibeButton = document.querySelector("#shuffle-vibe");
const ideaButton = document.querySelector("#idea-button");
const ideaOutput = document.querySelector("#idea-output");
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll("[data-tags]");
const counters = document.querySelectorAll("[data-count]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const palettes = [
  ["#f26b4f", "#f4bc5f", "#72d6a0", "#79a8ff"],
  ["#ff8a5c", "#f6d365", "#68e1fd", "#9be15d"],
  ["#ef5da8", "#ffd166", "#06d6a0", "#8ec5ff"],
  ["#ff6b6b", "#f7c948", "#4ecdc4", "#b8a1ff"]
];

const ideas = [
  "Build a Twitch overlay that makes chat votes feel like part of movie night.",
  "Make a tiny desktop command palette for the stream buttons you always hunt for.",
  "Create a GitHub Pages build log that turns repo updates into short notes.",
  "Prototype a browser mini-game that borrows its power-ups from commit messages.",
  "Make an OBS scene checklist that remembers the last setup that actually worked.",
  "Build a tool that turns messy project notes into setup cards future-you can use."
];

function updateLocalTime() {
  if (!localTime) return;
  localTime.textContent = new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

updateLocalTime();
window.setInterval(updateLocalTime, 15000);

if (vibeButton) {
  vibeButton.addEventListener("click", () => {
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    body.style.setProperty("--ember", palette[0]);
    body.style.setProperty("--gold", palette[1]);
    body.style.setProperty("--mint", palette[2]);
    body.style.setProperty("--blue", palette[3]);
  });
}

if (ideaButton && ideaOutput) {
  ideaButton.addEventListener("click", () => {
    const current = ideaOutput.textContent;
    const pool = ideas.filter((idea) => idea !== current);
    ideaOutput.textContent = pool[Math.floor(Math.random() * pool.length)];
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    projectCards.forEach((card) => {
      const tags = card.dataset.tags.split(" ");
      card.classList.toggle("hidden", filter !== "all" && !tags.includes(filter));
    });
  });
});

if (!prefersReducedMotion && counters.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const target = entry.target;
      const end = Number(target.dataset.count);
      let current = 0;
      const step = () => {
        current += 1;
        target.textContent = String(current);
        if (current < end) {
          window.requestAnimationFrame(step);
        }
      };

      step();
      observer.unobserve(target);
    });
  }, { threshold: 0.5 });

  counters.forEach((counter) => observer.observe(counter));
}
