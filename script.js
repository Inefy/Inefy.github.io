const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const body = document.body;
const localTime = document.querySelector("#local-time");
const vibeButton = document.querySelector("#shuffle-vibe");
const ideaButton = document.querySelector("#idea-button");
const ideaOutput = document.querySelector("#idea-output");
const focusOutput = document.querySelector("#focus-output");
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll("[data-tags]");
const counters = document.querySelectorAll("[data-count]");
const modeButtons = document.querySelectorAll("[data-idea-mode]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

const focusLines = [
  "tuning MovieBot, polishing the site, and catching the next tiny automation idea",
  "turning stream chores into buttons with brighter feedback",
  "keeping the projects small enough to finish and weird enough to remember",
  "writing down the setup details before they disappear"
];

const ideas = {
  mixed: [
    "Build a desk-status page that turns GitHub activity, stream setup, and notes into one tiny cockpit.",
    "Make a browser widget that pulls a random project note and asks: ship, archive, or automate?",
    "Create a one-click pre-stream checklist that leaves a timestamped log when everything is ready.",
    "Prototype a tiny game where power-ups are named after the last five commits."
  ],
  stream: [
    "Build a Twitch overlay that makes chat votes feel like part of movie night instead of a side panel.",
    "Make an OBS scene cue helper with a big status light for the next transition.",
    "Create a chat-triggered intermission board with movie-night stats and inside jokes.",
    "Prototype a stream deck page that groups buttons by what can go wrong."
  ],
  automation: [
    "Make a tiny desktop command palette for the setup steps you always hunt for.",
    "Create a helper that turns messy project notes into setup cards future-you can use.",
    "Build a script that notices repeated file chores and offers a reusable command.",
    "Make a weekly repo sweep that lists stale branches, missing READMEs, and easy cleanup wins."
  ],
  web: [
    "Create a GitHub Pages build log that turns repo updates into short public notes.",
    "Build a personal status badge generator for project cards, readmes, and stream panels.",
    "Prototype a tiny interactive timeline of tools, experiments, and the problem that started each one.",
    "Make a web toy that shuffles project ideas by energy level: 20 minutes, one night, weekend."
  ]
};

let activeIdeaMode = "mixed";
let focusIndex = 0;

function updateLocalTime() {
  if (!localTime) return;
  localTime.textContent = new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function setCounterFinals() {
  counters.forEach((counter) => {
    counter.textContent = counter.dataset.count;
  });
}

function pickDifferent(items, current) {
  const pool = items.filter((item) => item !== current);
  return pool[Math.floor(Math.random() * pool.length)] || items[0];
}

updateLocalTime();
window.setInterval(updateLocalTime, 15000);

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

if (ideaButton && ideaOutput) {
  ideaButton.addEventListener("click", () => {
    const current = ideaOutput.textContent;
    ideaOutput.textContent = pickDifferent(ideas[activeIdeaMode], current);
  });
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeIdeaMode = button.dataset.ideaMode;
    modeButtons.forEach((item) => item.classList.toggle("active", item === button));
    if (ideaOutput) {
      ideaOutput.textContent = pickDifferent(ideas[activeIdeaMode], ideaOutput.textContent);
    }
  });
});

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

if (prefersReducedMotion) {
  setCounterFinals();
} else {
  window.addEventListener("pointermove", (event) => {
    body.style.setProperty("--mouse-x", `${event.clientX}px`);
    body.style.setProperty("--mouse-y", `${event.clientY}px`);
  });

  if (focusOutput) {
    window.setInterval(() => {
      focusIndex = (focusIndex + 1) % focusLines.length;
      focusOutput.textContent = focusLines[focusIndex];
    }, 5000);
  }

  if (counters.length > 0) {
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
}
