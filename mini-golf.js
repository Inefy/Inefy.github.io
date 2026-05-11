(() => {
  "use strict";

  const WORLD_WIDTH = 960;
  const WORLD_HEIGHT = 600;
  const BALL_RADIUS = 10;
  const MAX_POWER = 620;
  const STOP_SPEED = 9;
  const FRICTION = 0.986;
  const ROUGH_FRICTION = 0.972;
  const SAND_FRICTION = 0.935;
  const BOUNCE = 0.76;
  const COURSE_BOUNCE = 0.68;
  const COURSE_EDGE_DAMPING = 0.9;
  const COURSE_EDGE_SAMPLES = 20;
  const AIM_START_RADIUS = 36;
  const SPINNER_BOUNCE = 0.86;
  const BEST_KEY = "inefy-mini-golf-best-total";
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const LEVELS = [
    {
      name: "Meadow Gate",
      par: 2,
      tee: { x: 118, y: 304 },
      hole: { x: 840, y: 304 },
      fairways: [
        { x: 64, y: 220, w: 832, h: 168, r: 82 }
      ],
      walls: [
        { x: 438, y: 118, w: 34, h: 150 },
        { x: 438, y: 340, w: 34, h: 142 }
      ],
      sand: [
        { x: 642, y: 246, w: 84, h: 116, r: 42 }
      ],
      water: [],
      bumpers: [],
      spinners: []
    },
    {
      name: "Brook Bend",
      par: 3,
      tee: { x: 128, y: 480 },
      hole: { x: 812, y: 132 },
      fairways: [
        { x: 76, y: 390, w: 408, h: 126, r: 62 },
        { x: 372, y: 116, w: 126, h: 400, r: 62 },
        { x: 392, y: 88, w: 468, h: 126, r: 62 }
      ],
      walls: [
        { x: 288, y: 220, w: 34, h: 190 },
        { x: 560, y: 214, w: 34, h: 190 },
        { x: 466, y: 302, w: 98, h: 30 }
      ],
      sand: [
        { x: 640, y: 82, w: 96, h: 76, r: 38 }
      ],
      water: [
        { x: 122, y: 246, w: 170, h: 88, r: 44 }
      ],
      bumpers: [],
      spinners: [
        { x: 434, y: 298, length: 128, width: 18, speed: 1.15, phase: 0.2 }
      ]
    },
    {
      name: "Fountain Split",
      par: 4,
      tee: { x: 102, y: 296 },
      hole: { x: 852, y: 296 },
      fairways: [
        { x: 62, y: 98, w: 836, h: 136, r: 66 },
        { x: 62, y: 366, w: 836, h: 136, r: 66 },
        { x: 64, y: 226, w: 142, h: 148, r: 64 },
        { x: 754, y: 226, w: 142, h: 148, r: 64 }
      ],
      walls: [
        { x: 302, y: 230, w: 34, h: 140 },
        { x: 624, y: 230, w: 34, h: 140 }
      ],
      sand: [
        { x: 202, y: 120, w: 84, h: 84, r: 42 },
        { x: 674, y: 396, w: 92, h: 76, r: 38 }
      ],
      water: [
        { x: 386, y: 238, w: 188, h: 124, r: 56 }
      ],
      bumpers: [
        { x: 482, y: 166, r: 24 },
        { x: 482, y: 434, r: 24 }
      ],
      spinners: [
        { x: 482, y: 300, length: 180, width: 18, speed: -1.05, phase: 0.5 }
      ]
    },
    {
      name: "Clover Switchback",
      par: 4,
      tee: { x: 132, y: 118 },
      hole: { x: 822, y: 484 },
      fairways: [
        { x: 76, y: 76, w: 536, h: 112, r: 54 },
        { x: 500, y: 76, w: 116, h: 330, r: 54 },
        { x: 248, y: 294, w: 370, h: 112, r: 54 },
        { x: 248, y: 294, w: 112, h: 230, r: 54 },
        { x: 250, y: 412, w: 640, h: 112, r: 54 }
      ],
      walls: [
        { x: 212, y: 206, w: 242, h: 30 },
        { x: 650, y: 182, w: 32, h: 220 },
        { x: 394, y: 444, w: 34, h: 72 }
      ],
      sand: [
        { x: 506, y: 292, w: 84, h: 86, r: 38 }
      ],
      water: [
        { x: 82, y: 322, w: 116, h: 132, r: 54 }
      ],
      bumpers: [
        { x: 548, y: 136, r: 22 },
        { x: 312, y: 350, r: 22 }
      ],
      spinners: [
        { x: 560, y: 240, length: 138, width: 18, speed: 1.25, phase: 0.9 },
        { x: 548, y: 468, length: 116, width: 16, speed: -1.1, phase: 0.1 }
      ]
    },
    {
      name: "Golden Spiral",
      par: 5,
      tee: { x: 110, y: 502 },
      hole: { x: 842, y: 98 },
      fairways: [
        { x: 68, y: 452, w: 806, h: 96, r: 46 },
        { x: 778, y: 174, w: 96, h: 374, r: 46 },
        { x: 256, y: 174, w: 618, h: 96, r: 46 },
        { x: 256, y: 174, w: 96, h: 236, r: 46 },
        { x: 256, y: 314, w: 378, h: 96, r: 46 },
        { x: 538, y: 74, w: 96, h: 336, r: 46 },
        { x: 538, y: 74, w: 352, h: 96, r: 46 }
      ],
      walls: [
        { x: 194, y: 388, w: 448, h: 28 },
        { x: 682, y: 282, w: 30, h: 138 },
        { x: 388, y: 282, w: 108, h: 28 },
        { x: 456, y: 90, w: 30, h: 166 },
        { x: 694, y: 172, w: 30, h: 80 }
      ],
      sand: [
        { x: 720, y: 450, w: 88, h: 72, r: 36 },
        { x: 574, y: 326, w: 80, h: 70, r: 34 }
      ],
      water: [
        { x: 88, y: 116, w: 128, h: 206, r: 58 }
      ],
      bumpers: [
        { x: 832, y: 332, r: 22 },
        { x: 306, y: 360, r: 20 },
        { x: 590, y: 120, r: 20 }
      ],
      spinners: [
        { x: 828, y: 362, length: 146, width: 18, speed: 1.35, phase: 0.6 },
        { x: 588, y: 224, length: 124, width: 16, speed: -1.2, phase: 0.2 }
      ]
    }
  ];

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const gameHud = document.querySelector(".game-hud");
  const gameMenu = document.getElementById("gameMenu");
  const menuKicker = document.getElementById("menuKicker");
  const menuTitle = document.getElementById("menuTitle");
  const menuMeta = document.getElementById("menuMeta");
  const startButton = document.getElementById("startButton");
  const restartLevelButton = document.getElementById("restartLevelButton");
  const pauseButton = document.getElementById("pauseButton");
  const restartTouchButton = document.getElementById("restartTouchButton");
  const pauseTouchButton = document.getElementById("pauseTouchButton");
  const resetRunButton = document.getElementById("resetRunButton");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const previousHoleButton = document.getElementById("previousHoleButton");
  const nextHoleButton = document.getElementById("nextHoleButton");
  const levelValue = document.getElementById("levelValue");
  const strokesValue = document.getElementById("strokesValue");
  const parValue = document.getElementById("parValue");
  const totalValue = document.getElementById("totalValue");
  const bestValue = document.getElementById("bestValue");
  const roundStatus = document.getElementById("roundStatus");
  const gameAnnouncement = document.getElementById("gameAnnouncement");
  const courseName = document.getElementById("courseName");
  const progressFill = document.getElementById("courseProgressFill");
  const progressBar = document.querySelector(".course-progress");
  const powerValue = document.getElementById("powerValue");
  const powerFill = document.getElementById("powerFill");
  const powerMeter = document.querySelector(".power-meter");
  const surfaceValue = document.getElementById("surfaceValue");
  const scorecardList = document.getElementById("scorecardList");

  let levelIndex = 0;
  let state = "menu";
  let pausedFrom = "ready";
  let ball = createBall(LEVELS[0].tee);
  let levelStrokes = 0;
  let scorecard = [];
  let lastSafePosition = { ...LEVELS[0].tee };
  let isAiming = false;
  let aimPointer = null;
  let lastTime = 0;
  let animationFrame = 0;
  let worldTime = 0;
  let particles = [];
  let trail = [];
  let prefersReducedMotion = reducedMotionQuery.matches;
  let gameAnnouncementTimer = 0;

  function syncMotionPreference(event = reducedMotionQuery) {
    prefersReducedMotion = event.matches;

    if (prefersReducedMotion) {
      particles = [];
      trail = [{ x: ball.x, y: ball.y }];
    }
  }

  if (reducedMotionQuery.addEventListener) {
    reducedMotionQuery.addEventListener("change", syncMotionPreference);
  } else {
    reducedMotionQuery.addListener(syncMotionPreference);
  }

  function createBall(point) {
    return {
      x: point.x,
      y: point.y,
      vx: 0,
      vy: 0,
      r: BALL_RADIUS
    };
  }

  function activeLevel() {
    return LEVELS[levelIndex];
  }

  function readBest() {
    try {
      const stored = window.localStorage.getItem(BEST_KEY);
      if (stored === null) {
        return null;
      }

      const value = Number(stored);
      return Number.isFinite(value) && value > 0 ? value : null;
    } catch {
      return null;
    }
  }

  function writeBest(value) {
    try {
      window.localStorage.setItem(BEST_KEY, String(value));
    } catch {
      // Best score persistence is optional.
    }
  }

  function formatBest(value) {
    return value === null ? "--" : String(value);
  }

  function completedTotal() {
    return scorecard.reduce((total, strokes) => total + (Number(strokes) || 0), 0);
  }

  function runTotal() {
    return scorecard[levelIndex] === undefined ? completedTotal() + levelStrokes : completedTotal();
  }

  function levelResultText(strokes, par) {
    const delta = strokes - par;
    if (delta <= -2) {
      return "Eagle";
    }
    if (delta === -1) {
      return "Birdie";
    }
    if (delta === 0) {
      return "Par";
    }
    if (delta === 1) {
      return "Bogey";
    }
    return `+${delta}`;
  }

  function surfaceLabel(surface) {
    if (surface === "sand") {
      return "Sand";
    }
    if (surface === "rough") {
      return "Rough";
    }
    if (surface === "water") {
      return "Water";
    }
    return "Fairway";
  }

  function renderScorecard() {
    const fragment = document.createDocumentFragment();

    LEVELS.forEach((level, index) => {
      const item = document.createElement("li");
      const score = scorecard[index];
      const isCurrent = index === levelIndex;

      item.className = "scorecard-hole";
      item.classList.toggle("current", isCurrent);
      item.classList.toggle("complete", score !== undefined);
      item.classList.toggle("under", score !== undefined && score < level.par);
      item.classList.toggle("over", score !== undefined && score > level.par);
      item.setAttribute("aria-label", `Hole ${index + 1}, par ${level.par}${score === undefined ? "" : `, ${score} strokes`}`);

      const number = document.createElement("span");
      number.className = "scorecard-hole-number";
      number.textContent = String(index + 1);

      const value = document.createElement("strong");
      value.textContent = score === undefined ? `P${level.par}` : String(score);

      item.append(number, value);
      fragment.appendChild(item);
    });

    scorecardList.textContent = "";
    scorecardList.appendChild(fragment);
  }

  function showMenu({ kicker, title, meta, button }) {
    menuKicker.textContent = kicker;
    menuTitle.textContent = title;
    menuMeta.textContent = meta;
    startButton.textContent = button;
    gameMenu.classList.remove("is-hidden");
  }

  function hideMenu() {
    gameMenu.classList.add("is-hidden");
  }

  function updateHud(statusText = roundStatus.textContent || "Ready") {
    const level = activeLevel();
    const progress = Math.round((scorecard.length / LEVELS.length) * 100);
    const best = readBest();
    const total = runTotal();
    const parDelta = levelStrokes - level.par;
    const surface = surfaceAtBall(level);

    levelValue.textContent = `${levelIndex + 1}/5`;
    strokesValue.textContent = String(levelStrokes);
    parValue.textContent = String(level.par);
    totalValue.textContent = String(total);
    bestValue.textContent = formatBest(best);
    roundStatus.textContent = statusText;
    courseName.textContent = level.name;
    progressFill.style.width = `${progress}%`;
    progressBar.setAttribute("aria-valuenow", String(progress));
    document.body.dataset.gameState = state;
    document.body.dataset.surface = surface;
    gameHud.dataset.result = parDelta < 0 ? "under" : parDelta > 0 ? "over" : "even";

    const percent = isAiming ? Math.round((currentAimPower().power / MAX_POWER) * 100) : 0;
    powerValue.textContent = `${percent}%`;
    powerFill.style.width = `${percent}%`;
    powerMeter.setAttribute("aria-valuenow", String(percent));
    surfaceValue.textContent = surfaceLabel(surface);
    renderScorecard();
    previousHoleButton.disabled = levelIndex === 0 || state === "moving" || state === "paused";
    nextHoleButton.disabled = state !== "level-complete";
    [pauseButton, pauseTouchButton].forEach((button) => {
      if (!button) {
        return;
      }

      button.textContent = state === "paused" ? "Resume" : "Pause";
      button.disabled = state !== "ready" && state !== "moving" && state !== "paused";
      button.setAttribute("aria-pressed", state === "paused" ? "true" : "false");
    });
  }

  function announceGame(message) {
    if (!gameAnnouncement || !message) {
      return;
    }

    window.clearTimeout(gameAnnouncementTimer);
    gameAnnouncement.textContent = "";
    gameAnnouncementTimer = window.setTimeout(() => {
      gameAnnouncement.textContent = message;
    }, 20);
  }

  function resetLevel(index = levelIndex, options = {}) {
    levelIndex = Math.max(0, Math.min(LEVELS.length - 1, index));
    scorecard = scorecard.slice(0, levelIndex);
    const level = activeLevel();
    ball = createBall(level.tee);
    lastSafePosition = { ...level.tee };
    particles = [];
    trail = [{ x: ball.x, y: ball.y }];
    levelStrokes = 0;
    isAiming = false;
    aimPointer = null;
    state = options.menu ? "menu" : "ready";
    pausedFrom = "ready";
    hideMenu();
    if (options.menu) {
      showMenu({
        kicker: "Five hole course",
        title: "Mini Golf",
        meta: "Clear five holes with the fewest strokes.",
        button: "Start Round"
      });
    }
    updateHud(options.menu ? "Ready" : "Line up shot");
  }

  function resetRun(showStartMenu = false) {
    scorecard = [];
    resetLevel(0, { menu: showStartMenu });
  }

  function beginRound() {
    if (state === "run-complete") {
      resetRun(false);
      announceGame(`New Mini Golf round started. Hole ${levelIndex + 1}, par ${activeLevel().par}.`);
    } else if (state === "level-complete") {
      nextLevel();
    } else if (state === "paused") {
      resumeRound();
    } else if (state === "moving") {
      hideMenu();
      updateHud("Rolling");
    } else {
      state = "ready";
      hideMenu();
      updateHud("Line up shot");
      announceGame(`Mini Golf started. Hole ${levelIndex + 1}, par ${activeLevel().par}.`);
    }
  }

  function canPause() {
    return state === "ready" || state === "moving";
  }

  function pauseRound() {
    if (!canPause()) {
      return false;
    }

    pausedFrom = state;
    state = "paused";
    isAiming = false;
    aimPointer = null;
    showMenu({
      kicker: `Hole ${levelIndex + 1}`,
      title: "Paused",
      meta: `${levelStrokes} strokes / par ${activeLevel().par}`,
      button: "Resume"
    });
    updateHud("Paused");
    announceGame(`Game paused. Hole ${levelIndex + 1}, ${levelStrokes} ${levelStrokes === 1 ? "stroke" : "strokes"}.`);
    return true;
  }

  function resumeRound() {
    if (state !== "paused") {
      return false;
    }

    state = pausedFrom === "moving" ? "moving" : "ready";
    hideMenu();
    updateHud(state === "moving" ? "Rolling" : "Line up shot");
    announceGame(`Game resumed. Hole ${levelIndex + 1}.`);
    return true;
  }

  function togglePause() {
    return state === "paused" ? resumeRound() : pauseRound();
  }

  function nextLevel() {
    if (state !== "level-complete") {
      return false;
    }

    if (levelIndex >= LEVELS.length - 1) {
      state = "run-complete";
      return false;
    }

    resetLevel(levelIndex + 1);
    announceGame(`Hole ${levelIndex + 1} ready. Par ${activeLevel().par}.`);
    return true;
  }

  function previousLevel() {
    if (levelIndex === 0 || state === "moving") {
      return false;
    }

    resetLevel(levelIndex - 1);
    return true;
  }

  function canShoot() {
    return (state === "ready" || state === "menu") && speed() <= STOP_SPEED;
  }

  function speed() {
    return Math.hypot(ball.vx, ball.vy);
  }

  function limitBallSpeed(maxSpeed = 760) {
    const currentSpeed = speed();
    if (currentSpeed > maxSpeed) {
      ball.vx = (ball.vx / currentSpeed) * maxSpeed;
      ball.vy = (ball.vy / currentSpeed) * maxSpeed;
    }
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function screenToWorld(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (WORLD_WIDTH / rect.width),
      y: (event.clientY - rect.top) * (WORLD_HEIGHT / rect.height)
    };
  }

  function capturePointer(event) {
    try {
      canvas.setPointerCapture?.(event.pointerId);
    } catch {
      // Synthetic or cancelled pointer events may not have active capture state.
    }
  }

  function releasePointer(event) {
    try {
      canvas.releasePointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture is an enhancement; aiming still works without it.
    }
  }

  function currentAimPower() {
    if (!isAiming || !aimPointer) {
      return { dx: 0, dy: 0, length: 0, power: 0 };
    }

    const dx = ball.x - aimPointer.x;
    const dy = ball.y - aimPointer.y;
    const length = Math.hypot(dx, dy);
    return {
      dx,
      dy,
      length,
      power: Math.min(MAX_POWER, length * 3.15)
    };
  }

  function shootFromVector(dx, dy, powerOverride) {
    const length = Math.hypot(dx, dy);
    if (length < 5 || !canShoot()) {
      return false;
    }

    const power = Math.min(MAX_POWER, powerOverride ?? length * 3.15);
    if (power < 24) {
      return false;
    }

    hideMenu();
    lastSafePosition = { x: ball.x, y: ball.y };
    trail = [{ x: ball.x, y: ball.y }];
    ball.vx = (dx / length) * power;
    ball.vy = (dy / length) * power;
    levelStrokes += 1;
    state = "moving";
    isAiming = false;
    aimPointer = null;
    updateHud("Rolling");
    announceGame(`Shot ${levelStrokes}. Ball rolling.`);
    return true;
  }

  function hazardReset() {
    spawnParticles(ball.x, ball.y, "#58d7e5", 20, 130);
    ball.x = lastSafePosition.x;
    ball.y = lastSafePosition.y;
    ball.vx = 0;
    ball.vy = 0;
    trail = [{ x: ball.x, y: ball.y }];
    levelStrokes += 1;
    state = "ready";
    isAiming = false;
    aimPointer = null;
    updateHud("Water penalty");
    announceGame(`Water penalty. Stroke ${levelStrokes}. Ball reset to previous safe position.`);
  }

  function completeLevel() {
    if (state === "level-complete" || state === "run-complete") {
      return;
    }

    ball.vx = 0;
    ball.vy = 0;
    levelStrokes = Math.max(1, levelStrokes);
    spawnParticles(activeLevel().hole.x, activeLevel().hole.y, "#f5c45b", 28, 170);
    ball.x = activeLevel().hole.x;
    ball.y = activeLevel().hole.y;
    scorecard[levelIndex] = levelStrokes;

    if (levelIndex === LEVELS.length - 1) {
      state = "run-complete";
      const total = completedTotal();
      const best = readBest();
      if (best === null || total < best) {
        writeBest(total);
      }
      showMenu({
        kicker: "Course clear",
        title: "Round Complete",
        meta: `${total} strokes / par ${LEVELS.reduce((sum, level) => sum + level.par, 0)}`,
        button: "Play Again"
      });
      updateHud("Course clear");
      announceGame(`Course clear. Total ${total} strokes.`);
      return;
    }

    state = "level-complete";
    const result = levelResultText(levelStrokes, activeLevel().par);
    showMenu({
      kicker: `Hole ${levelIndex + 1} clear`,
      title: result,
      meta: `${levelStrokes} strokes / par ${activeLevel().par}`,
      button: "Next Hole"
    });
    updateHud(`${result} on ${activeLevel().name}`);
    announceGame(`Hole ${levelIndex + 1} complete. ${result}. ${levelStrokes} strokes.`);
  }

  function inRoundedRect(point, rect) {
    const radius = rect.r || 0;
    if (!radius) {
      return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
    }

    const innerX = clamp(point.x, rect.x + radius, rect.x + rect.w - radius);
    const innerY = clamp(point.y, rect.y + radius, rect.y + rect.h - radius);
    return Math.hypot(point.x - innerX, point.y - innerY) <= radius ||
      (point.x >= rect.x + radius && point.x <= rect.x + rect.w - radius && point.y >= rect.y && point.y <= rect.y + rect.h) ||
      (point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y + radius && point.y <= rect.y + rect.h - radius);
  }

  function pointInAnyZone(point, zones) {
    return zones.some((zone) => inRoundedRect(point, zone));
  }

  function isInAnyZone(zones) {
    const point = { x: ball.x, y: ball.y };
    return pointInAnyZone(point, zones);
  }

  function courseZones(level) {
    return [...level.fairways, ...level.sand, ...level.water];
  }

  function pointOnCourse(level, point, zones = courseZones(level)) {
    return pointInAnyZone(point, zones);
  }

  function isBallOnCourse(level, candidate = ball, zones = courseZones(level)) {
    if (!pointOnCourse(level, candidate, zones)) {
      return false;
    }

    for (let index = 0; index < COURSE_EDGE_SAMPLES; index += 1) {
      const angle = (Math.PI * 2 * index) / COURSE_EDGE_SAMPLES;
      const probe = {
        x: candidate.x + Math.cos(angle) * candidate.r,
        y: candidate.y + Math.sin(angle) * candidate.r
      };

      if (!pointOnCourse(level, probe, zones)) {
        return false;
      }
    }

    return true;
  }

  function courseBoundaryNormal(level, zones = courseZones(level)) {
    let nx = 0;
    let ny = 0;

    for (let index = 0; index < COURSE_EDGE_SAMPLES; index += 1) {
      const angle = (Math.PI * 2 * index) / COURSE_EDGE_SAMPLES;
      const directionX = Math.cos(angle);
      const directionY = Math.sin(angle);
      const probe = {
        x: ball.x + directionX * ball.r,
        y: ball.y + directionY * ball.r
      };

      if (!pointOnCourse(level, probe, zones)) {
        nx -= directionX;
        ny -= directionY;
      }
    }

    const normalLength = Math.hypot(nx, ny);
    if (normalLength > 0.001) {
      return { x: nx / normalLength, y: ny / normalLength };
    }

    const currentSpeed = speed();
    if (currentSpeed > 0.001) {
      return { x: -ball.vx / currentSpeed, y: -ball.vy / currentSpeed };
    }

    return { x: 0, y: -1 };
  }

  function resolveCourseBoundary(level, previousPosition) {
    const zones = courseZones(level);
    if (isBallOnCourse(level, ball, zones)) {
      return false;
    }

    const normal = courseBoundaryNormal(level, zones);
    const previousBall = { x: previousPosition.x, y: previousPosition.y, r: ball.r };
    const fallbackBall = { x: lastSafePosition.x, y: lastSafePosition.y, r: ball.r };
    const teeBall = { x: level.tee.x, y: level.tee.y, r: ball.r };

    if (isBallOnCourse(level, previousBall, zones)) {
      ball.x = previousPosition.x;
      ball.y = previousPosition.y;
    } else if (isBallOnCourse(level, fallbackBall, zones)) {
      ball.x = lastSafePosition.x;
      ball.y = lastSafePosition.y;
    } else if (isBallOnCourse(level, teeBall, zones)) {
      ball.x = level.tee.x;
      ball.y = level.tee.y;
    }

    const velocityNormal = ball.vx * normal.x + ball.vy * normal.y;
    if (velocityNormal < 0) {
      ball.vx -= (1 + COURSE_BOUNCE) * velocityNormal * normal.x;
      ball.vy -= (1 + COURSE_BOUNCE) * velocityNormal * normal.y;
    }

    ball.vx *= COURSE_EDGE_DAMPING;
    ball.vy *= COURSE_EDGE_DAMPING;

    if (Math.abs(velocityNormal) > 140) {
      spawnParticles(ball.x, ball.y, "#d8ffe2", 6, 80);
    }

    return true;
  }

  function surfaceAtBall(level = activeLevel()) {
    if (isInAnyZone(level.water)) {
      return "water";
    }
    if (isInAnyZone(level.sand)) {
      return "sand";
    }
    if (isInAnyZone(level.fairways)) {
      return "fairway";
    }
    return "rough";
  }

  function frictionForSurface(surface) {
    if (surface === "sand") {
      return SAND_FRICTION;
    }
    if (surface === "rough") {
      return ROUGH_FRICTION;
    }
    return FRICTION;
  }

  function statusForSurface(surface, stopped = false) {
    if (surface === "sand") {
      return stopped ? "Sand lie" : "Sand trap";
    }
    if (surface === "rough") {
      return stopped ? "Rough lie" : "Rough";
    }
    return stopped ? "Line up shot" : "Rolling";
  }

  function resolveBounds() {
    if (ball.x < ball.r) {
      ball.x = ball.r;
      ball.vx = Math.abs(ball.vx) * BOUNCE;
    } else if (ball.x > WORLD_WIDTH - ball.r) {
      ball.x = WORLD_WIDTH - ball.r;
      ball.vx = -Math.abs(ball.vx) * BOUNCE;
    }

    if (ball.y < ball.r) {
      ball.y = ball.r;
      ball.vy = Math.abs(ball.vy) * BOUNCE;
    } else if (ball.y > WORLD_HEIGHT - ball.r) {
      ball.y = WORLD_HEIGHT - ball.r;
      ball.vy = -Math.abs(ball.vy) * BOUNCE;
    }
  }

  function resolveWall(rect) {
    const closestX = clamp(ball.x, rect.x, rect.x + rect.w);
    const closestY = clamp(ball.y, rect.y, rect.y + rect.h);
    let dx = ball.x - closestX;
    let dy = ball.y - closestY;
    let distanceSq = dx * dx + dy * dy;

    if (distanceSq >= ball.r * ball.r) {
      return;
    }

    let nx;
    let ny;
    let distanceValue = Math.sqrt(distanceSq);

    if (distanceValue === 0) {
      const left = Math.abs(ball.x - rect.x);
      const right = Math.abs(ball.x - (rect.x + rect.w));
      const top = Math.abs(ball.y - rect.y);
      const bottom = Math.abs(ball.y - (rect.y + rect.h));
      const minSide = Math.min(left, right, top, bottom);
      if (minSide === left) {
        nx = -1;
        ny = 0;
        ball.x = rect.x - ball.r;
      } else if (minSide === right) {
        nx = 1;
        ny = 0;
        ball.x = rect.x + rect.w + ball.r;
      } else if (minSide === top) {
        nx = 0;
        ny = -1;
        ball.y = rect.y - ball.r;
      } else {
        nx = 0;
        ny = 1;
        ball.y = rect.y + rect.h + ball.r;
      }
    } else {
      nx = dx / distanceValue;
      ny = dy / distanceValue;
      const overlap = ball.r - distanceValue;
      ball.x += nx * overlap;
      ball.y += ny * overlap;
    }

    const velocityNormal = ball.vx * nx + ball.vy * ny;
    if (velocityNormal < 0) {
      ball.vx -= (1 + BOUNCE) * velocityNormal * nx;
      ball.vy -= (1 + BOUNCE) * velocityNormal * ny;
    }
  }

  function resolveBumper(bumper) {
    const dx = ball.x - bumper.x;
    const dy = ball.y - bumper.y;
    const minDistance = ball.r + bumper.r;
    const distanceValue = Math.hypot(dx, dy);

    if (distanceValue >= minDistance || distanceValue === 0) {
      return;
    }

    const nx = dx / distanceValue;
    const ny = dy / distanceValue;
    const overlap = minDistance - distanceValue;
    ball.x += nx * overlap;
    ball.y += ny * overlap;

    const velocityNormal = ball.vx * nx + ball.vy * ny;
    if (velocityNormal < 0) {
      ball.vx -= 1.9 * velocityNormal * nx;
      ball.vy -= 1.9 * velocityNormal * ny;
      if (velocityNormal < -55) {
        spawnParticles(ball.x, ball.y, "#f5c45b", 8, 95);
      }
    }
  }

  function spinnerGeometry(spinner) {
    const angle = spinner.phase + worldTime * spinner.speed;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const half = spinner.length / 2;

    return {
      angle,
      dx,
      dy,
      radius: spinner.width / 2,
      a: { x: spinner.x - dx * half, y: spinner.y - dy * half },
      b: { x: spinner.x + dx * half, y: spinner.y + dy * half }
    };
  }

  function closestPointOnSegment(point, a, b) {
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const denominator = abx * abx + aby * aby || 1;
    const t = clamp(((point.x - a.x) * abx + (point.y - a.y) * aby) / denominator, 0, 1);
    return {
      x: a.x + abx * t,
      y: a.y + aby * t,
      t
    };
  }

  function resolveSpinner(spinner) {
    const geometry = spinnerGeometry(spinner);
    const closest = closestPointOnSegment(ball, geometry.a, geometry.b);
    let dx = ball.x - closest.x;
    let dy = ball.y - closest.y;
    let distanceValue = Math.hypot(dx, dy);
    const minDistance = ball.r + geometry.radius;

    if (distanceValue >= minDistance) {
      return;
    }

    if (distanceValue === 0) {
      dx = -geometry.dy;
      dy = geometry.dx;
      distanceValue = 1;
    }

    const nx = dx / distanceValue;
    const ny = dy / distanceValue;
    const overlap = minDistance - distanceValue;
    ball.x += nx * overlap;
    ball.y += ny * overlap;

    const armX = closest.x - spinner.x;
    const armY = closest.y - spinner.y;
    const spinVx = -armY * spinner.speed;
    const spinVy = armX * spinner.speed;
    const relativeVx = ball.vx - spinVx;
    const relativeVy = ball.vy - spinVy;
    const velocityNormal = relativeVx * nx + relativeVy * ny;

    if (velocityNormal < 0) {
      ball.vx -= (1 + SPINNER_BOUNCE) * velocityNormal * nx;
      ball.vy -= (1 + SPINNER_BOUNCE) * velocityNormal * ny;
      ball.vx += spinVx * 0.18;
      ball.vy += spinVy * 0.18;
      spawnParticles(ball.x, ball.y, "#ff8fc6", 10, 115);
    }
  }

  function spawnParticles(x, y, color, count = 12, force = 100) {
    if (prefersReducedMotion) {
      return;
    }

    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speedValue = force * (0.35 + Math.random() * 0.75);
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speedValue,
        vy: Math.sin(angle) * speedValue,
        size: 2.5 + Math.random() * 4.5,
        life: 0.45 + Math.random() * 0.35,
        maxLife: 0.8,
        color
      });
    }
  }

  function updateParticles(dt) {
    particles.forEach((particle) => {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= Math.pow(0.9, dt * 60);
      particle.vy = particle.vy * Math.pow(0.9, dt * 60) + 36 * dt;
    });
    particles = particles.filter((particle) => particle.life > 0);
  }

  function recordTrail() {
    if (prefersReducedMotion) {
      trail = [{ x: ball.x, y: ball.y }];
      return;
    }

    const lastPoint = trail[trail.length - 1];
    if (!lastPoint || distance(lastPoint, ball) > 10) {
      trail.push({ x: ball.x, y: ball.y });
    }

    if (trail.length > 32) {
      trail = trail.slice(trail.length - 32);
    }
  }

  function updatePhysics(dt) {
    if (state !== "moving") {
      return;
    }

    const level = activeLevel();
    const steps = Math.max(1, Math.ceil(speed() * dt / 12));
    const stepDt = dt / steps;

    for (let step = 0; step < steps; step += 1) {
      const previousPosition = { x: ball.x, y: ball.y };
      ball.x += ball.vx * stepDt;
      ball.y += ball.vy * stepDt;

      resolveBounds();

      if (isInAnyZone(level.water)) {
        hazardReset();
        return;
      }

      level.walls.forEach(resolveWall);
      level.bumpers.forEach(resolveBumper);
      level.spinners.forEach(resolveSpinner);
      resolveCourseBoundary(level, previousPosition);
      limitBallSpeed();

      if (isInAnyZone(level.water)) {
        hazardReset();
        return;
      }

      const cupDistance = distance(ball, level.hole);
      if (cupDistance < 18) {
        ball.vx *= 0.9;
        ball.vy *= 0.9;
        if (speed() < 155) {
          completeLevel();
          return;
        }
      }
    }

    recordTrail();
    const surface = surfaceAtBall(level);
    const friction = frictionForSurface(surface);
    const frictionPower = Math.pow(friction, dt * 60);
    ball.vx *= frictionPower;
    ball.vy *= frictionPower;

    if (speed() <= STOP_SPEED) {
      ball.vx = 0;
      ball.vy = 0;
      state = "ready";
      updateHud(statusForSurface(surface, true));
    } else {
      updateHud(statusForSurface(surface));
    }
  }

  function roundRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function drawRoundedZones(zones, fill, stroke) {
    zones.forEach((zone) => {
      roundRect(ctx, zone.x, zone.y, zone.w, zone.h, zone.r || 0);
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }

  function drawCourseEdge(level) {
    ctx.save();
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(0, 0, 0, 0.34)";
    ctx.shadowBlur = 7;
    ctx.strokeStyle = "rgba(5, 12, 12, 0.42)";
    ctx.lineWidth = 8;
    level.fairways.forEach((zone) => {
      roundRect(ctx, zone.x, zone.y, zone.w, zone.h, zone.r || 0);
      ctx.stroke();
    });
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(216, 255, 226, 0.28)";
    ctx.lineWidth = 3;
    level.fairways.forEach((zone) => {
      roundRect(ctx, zone.x + 1.5, zone.y + 1.5, zone.w - 3, zone.h - 3, Math.max(4, (zone.r || 0) - 1.5));
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawTeeMarker() {
    const tee = activeLevel().tee;

    ctx.save();
    ctx.beginPath();
    ctx.arc(tee.x, tee.y, 22, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(tee.x, tee.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#f5c45b";
    ctx.fill();

    ctx.font = "800 14px system-ui, sans-serif";
    ctx.fillStyle = "rgba(247, 251, 247, 0.72)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TEE", tee.x, tee.y + 34);
    ctx.restore();
  }

  function drawSpinner(spinner) {
    const geometry = spinnerGeometry(spinner);

    ctx.save();
    ctx.translate(spinner.x, spinner.y);
    ctx.rotate(geometry.angle);
    const gradient = ctx.createLinearGradient(-spinner.length / 2, 0, spinner.length / 2, 0);
    gradient.addColorStop(0, "#ff8fc6");
    gradient.addColorStop(0.5, "#f5c45b");
    gradient.addColorStop(1, "#58d7e5");
    roundRect(ctx, -spinner.length / 2, -spinner.width / 2, spinner.length, spinner.width, spinner.width / 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.38)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, spinner.width * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = "#071013";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.stroke();
    ctx.restore();
  }

  function drawCourse() {
    const level = activeLevel();
    const grassGradient = ctx.createLinearGradient(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    grassGradient.addColorStop(0, "#123a25");
    grassGradient.addColorStop(0.48, "#174b30");
    grassGradient.addColorStop(1, "#102b24");
    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    for (let x = -WORLD_HEIGHT; x < WORLD_WIDTH; x += 44) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + WORLD_HEIGHT, WORLD_HEIGHT);
      ctx.stroke();
    }
    ctx.restore();

    drawCourseEdge(level);
    drawRoundedZones(level.fairways, "rgba(109, 225, 166, 0.32)", "rgba(214, 255, 226, 0.16)");
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    level.fairways.forEach((zone) => {
      roundRect(ctx, zone.x + 8, zone.y + 8, zone.w - 16, zone.h - 16, Math.max(8, (zone.r || 20) - 8));
      ctx.strokeStyle = "rgba(225, 255, 233, 0.08)";
      ctx.lineWidth = 8;
      ctx.stroke();
    });
    ctx.restore();

    drawRoundedZones(level.sand, "rgba(245, 196, 91, 0.58)", "rgba(255, 244, 189, 0.24)");
    drawRoundedZones(level.water, "rgba(88, 215, 229, 0.5)", "rgba(181, 246, 255, 0.28)");

    level.water.forEach((zone) => {
      ctx.save();
      roundRect(ctx, zone.x + 8, zone.y + 9, zone.w - 16, zone.h - 18, Math.max(8, (zone.r || 20) - 8));
      ctx.clip();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 3;
      for (let y = zone.y + 20; y < zone.y + zone.h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(zone.x + 12, y);
        ctx.bezierCurveTo(zone.x + 48, y - 12, zone.x + 78, y + 12, zone.x + 116, y);
        ctx.bezierCurveTo(zone.x + 148, y - 10, zone.x + zone.w - 48, y + 12, zone.x + zone.w - 12, y);
        ctx.stroke();
      }
      ctx.restore();
    });

    ctx.fillStyle = "rgba(7, 15, 17, 0.9)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = 2;
    level.walls.forEach((wall) => {
      roundRect(ctx, wall.x, wall.y, wall.w, wall.h, 9);
      ctx.fill();
      ctx.stroke();
    });

    level.bumpers.forEach((bumper) => {
      const gradient = ctx.createRadialGradient(bumper.x - 8, bumper.y - 8, 4, bumper.x, bumper.y, bumper.r);
      gradient.addColorStop(0, "#fff6b5");
      gradient.addColorStop(0.42, "#f5c45b");
      gradient.addColorStop(1, "#8c5c1c");
      ctx.beginPath();
      ctx.arc(bumper.x, bumper.y, bumper.r, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    level.spinners.forEach(drawSpinner);
    drawTeeMarker();
  }

  function drawHole() {
    const hole = activeLevel().hole;

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(hole.x, hole.y, 16, 0, Math.PI * 2);
    ctx.fillStyle = "#020607";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(hole.x, hole.y, 19, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = "#f7fbf7";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(hole.x + 24, hole.y);
    ctx.lineTo(hole.x + 24, hole.y - 66);
    ctx.stroke();

    ctx.fillStyle = "#ff8fc6";
    ctx.beginPath();
    ctx.moveTo(hole.x + 27, hole.y - 66);
    ctx.lineTo(hole.x + 78, hole.y - 50);
    ctx.lineTo(hole.x + 27, hole.y - 34);
    ctx.closePath();
    ctx.fill();
  }

  function drawBall() {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(ball.x + 5, ball.y + 8, ball.r + 4, ball.r * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.restore();

    const gradient = ctx.createRadialGradient(ball.x - 4, ball.y - 5, 2, ball.x, ball.y, ball.r + 4);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.58, "#f1fff8");
    gradient.addColorStop(1, "#93c8b2");
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "rgba(5, 17, 16, 0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawTrail() {
    if (prefersReducedMotion || trail.length < 2) {
      return;
    }

    ctx.save();
    trail.forEach((point, index) => {
      const alpha = (index + 1) / trail.length;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3 + alpha * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.18})`;
      ctx.fill();
    });
    ctx.restore();
  }

  function drawParticles() {
    if (prefersReducedMotion || particles.length === 0) {
      return;
    }

    ctx.save();
    particles.forEach((particle) => {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    });
    ctx.restore();
  }

  function drawAim() {
    if (!isAiming || !aimPointer) {
      return;
    }

    const aim = currentAimPower();
    if (aim.length < 3) {
      return;
    }

    const nx = aim.dx / aim.length;
    const ny = aim.dy / aim.length;
    const guideLength = Math.min(180, aim.power * 0.34);

    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(245, 196, 91, 0.86)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(ball.x + nx * guideLength, ball.y + ny * guideLength);
    ctx.stroke();

    ctx.strokeStyle = "rgba(4, 17, 18, 0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(aimPointer.x, aimPointer.y);
    ctx.stroke();

    for (let i = 1; i <= 5; i += 1) {
      const dotDistance = (guideLength / 5) * i;
      ctx.beginPath();
      ctx.arc(ball.x + nx * dotDistance, ball.y + ny * dotDistance, Math.max(3, 7 - i), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 196, 91, ${0.85 - i * 0.11})`;
      ctx.fill();
    }
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    drawCourse();
    drawHole();
    drawAim();
    drawTrail();
    drawParticles();
    drawBall();
  }

  function loop(timestamp) {
    const dt = Math.min(0.033, ((timestamp - lastTime) || 16.7) / 1000);
    lastTime = timestamp;

    if (state !== "paused") {
      worldTime += dt;
      updatePhysics(dt);
      if (!prefersReducedMotion) {
        updateParticles(dt);
      } else {
        particles = [];
      }
    }

    render();
    animationFrame = window.requestAnimationFrame(loop);
  }

  function resizeCanvas() {
    const ratio = Math.min(Math.max(1, window.devicePixelRatio || 1), 2);
    canvas.width = Math.round(WORLD_WIDTH * ratio);
    canvas.height = Math.round(WORLD_HEIGHT * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    render();
  }

  function handlePointerDown(event) {
    if (!canShoot()) {
      return;
    }

    event.preventDefault();
    const point = screenToWorld(event);
    if (state === "menu") {
      hideMenu();
      state = "ready";
    }
    if (distance(point, ball) > AIM_START_RADIUS) {
      updateHud("Drag from ball to aim");
      return;
    }
    isAiming = true;
    aimPointer = point;
    updateHud("Aiming");
    capturePointer(event);
  }

  function handlePointerMove(event) {
    if (!isAiming) {
      return;
    }

    event.preventDefault();
    aimPointer = screenToWorld(event);
    updateHud("Aiming");
  }

  function handlePointerUp(event) {
    if (!isAiming) {
      return;
    }

    event.preventDefault();
    const aim = currentAimPower();
    releasePointer(event);
    shootFromVector(aim.dx, aim.dy, aim.power);
    if (state === "ready") {
      isAiming = false;
      aimPointer = null;
      updateHud("Line up shot");
    }
  }

  function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    if (key === " " || key === "enter") {
      if (!gameMenu.classList.contains("is-hidden")) {
        event.preventDefault();
        beginRound();
      }
    } else if (key === "p" || key === "escape") {
      if (state === "ready" || state === "moving" || state === "paused") {
        event.preventDefault();
        togglePause();
      }
    } else if (key === "r") {
      event.preventDefault();
      resetLevel(levelIndex);
    } else if (key === "n" && state === "level-complete") {
      event.preventDefault();
      nextLevel();
    }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      updateHud("Fullscreen blocked");
    }
  }

  function bindEvents() {
    startButton.addEventListener("click", beginRound);
    restartLevelButton.addEventListener("click", () => resetLevel(levelIndex));
    restartTouchButton.addEventListener("click", () => resetLevel(levelIndex));
    pauseButton.addEventListener("click", togglePause);
    pauseTouchButton.addEventListener("click", togglePause);
    resetRunButton.addEventListener("click", () => resetRun(true));
    previousHoleButton.addEventListener("click", previousLevel);
    nextHoleButton.addEventListener("click", nextLevel);
    fullscreenButton.addEventListener("click", toggleFullscreen);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", resizeCanvas);
  }

  function getState() {
    return {
      levelIndex,
      level: levelIndex + 1,
      levelName: activeLevel().name,
      state,
      pausedFrom,
      strokes: levelStrokes,
      scorecard: [...scorecard],
      total: runTotal(),
      best: readBest(),
      ball: { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy },
      aimPower: currentAimPower().power,
      surface: surfaceAtBall(),
      particles: particles.length,
      trailLength: trail.length
    };
  }

  function debugSetBall(x, y, vx = 0, vy = 0) {
    ball.x = x;
    ball.y = y;
    ball.vx = vx;
    ball.vy = vy;
    trail = [{ x: ball.x, y: ball.y }];
    state = Math.hypot(vx, vy) > STOP_SPEED ? "moving" : "ready";
    hideMenu();
    updateHud(state === "moving" ? "Rolling" : "Line up shot");
  }

  function debugTick(seconds) {
    const frames = Math.ceil(seconds / 0.016);
    for (let i = 0; i < frames; i += 1) {
      worldTime += 0.016;
      updatePhysics(0.016);
      updateParticles(0.016);
    }
    render();
  }

  window.miniGolf = {
    newRun: resetRun,
    resetLevel,
    nextLevel,
    previousLevel,
    pause: togglePause,
    shoot: shootFromVector,
    debugSetBall,
    debugTick,
    completeLevel,
    getState
  };

  resizeCanvas();
  bindEvents();
  resetRun(true);
  window.cancelAnimationFrame(animationFrame);
  animationFrame = window.requestAnimationFrame(loop);
})();
