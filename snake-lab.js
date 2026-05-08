const canvas = document.querySelector("#gameCanvas");
const stage = document.querySelector("#gameStage");
const scoreValue = document.querySelector("#scoreValue");
const bestValue = document.querySelector("#bestValue");
const lengthValue = document.querySelector("#lengthValue");
const paceValue = document.querySelector("#paceValue");
const roundStatus = document.querySelector("#roundStatus");
const gameMenu = document.querySelector("#gameMenu");
const menuTitle = document.querySelector("#menuTitle");
const menuMeta = document.querySelector("#menuMeta");
const startButton = document.querySelector("#startButton");
const restartButton = document.querySelector("#restartButton");
const pauseButton = document.querySelector("#pauseButton");
const fullscreenButton = document.querySelector("#fullscreenButton");

const ctx = canvas.getContext("2d");
const GRID = 24;
const MAX_CELLS = GRID * GRID;
const START_LENGTH = 4;
const BEST_KEY = "snake-lab-best";
const STEP_START = 138;
const STEP_MIN = 58;
const STEP_GAIN = 3.6;
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let viewport = {
  dpr: 1,
  width: 1,
  height: 1,
  cell: 1,
  board: 1,
  offsetX: 0,
  offsetY: 0
};

let state = "idle";
let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 16, y: 12 };
let score = 0;
let best = readBest();
let eaten = 0;
let accumulator = 0;
let lastTime = 0;
let pulseTime = 0;
let flashTime = 0;
let audioContext = null;
let touchStart = null;
let particles = [];
let prefersReducedMotion = reducedMotionQuery.matches;

function syncMotionPreference(event = reducedMotionQuery) {
  prefersReducedMotion = event.matches;

  if (prefersReducedMotion) {
    particles = [];
    flashTime = 0;
  }
}

if (reducedMotionQuery.addEventListener) {
  reducedMotionQuery.addEventListener("change", syncMotionPreference);
} else {
  reducedMotionQuery.addListener(syncMotionPreference);
}

function readBest() {
  try {
    const value = Number.parseInt(window.localStorage.getItem(BEST_KEY) || "0", 10);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function writeBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Best score is optional; private browsing can block localStorage.
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resetRun(nextState = "idle") {
  const center = Math.floor(GRID / 2);
  snake = Array.from({ length: START_LENGTH }, (_, index) => ({ x: center - index, y: center }));
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  eaten = 0;
  accumulator = 0;
  flashTime = 0;
  particles = [];
  state = nextState;
  placeFood();
  updateHud(nextState === "playing" ? "Running" : "Ready");
  setMenu(nextState === "idle", "Snake Lab", "Start Run", best ? `Best ${best}` : "Ready");
}

function startRun() {
  primeAudio();
  resetRun("playing");
  setMenu(false);
}

function restartRun() {
  startRun();
}

function togglePause() {
  if (state === "playing") {
    state = "paused";
    updateHud("Paused");
    setMenu(true, "Paused", "Resume", `Score ${score}`);
    return;
  }

  if (state === "paused") {
    state = "playing";
    updateHud("Running");
    setMenu(false);
    primeAudio();
  }
}

function setMenu(visible, title = "", buttonText = "Start Run", metaText = "") {
  if (!gameMenu) return;
  gameMenu.hidden = !visible;
  if (menuTitle) menuTitle.textContent = title;
  if (startButton) startButton.textContent = buttonText;
  if (menuMeta) {
    menuMeta.textContent = metaText;
    menuMeta.hidden = !metaText;
  }
}

function updateHud(statusText) {
  if (scoreValue) scoreValue.textContent = String(score);
  if (bestValue) bestValue.textContent = String(best);
  if (lengthValue) lengthValue.textContent = String(snake.length);
  if (paceValue) paceValue.textContent = `${(STEP_START / stepInterval()).toFixed(1)}x`;
  if (roundStatus && statusText) roundStatus.textContent = statusText;
  document.body.dataset.gameState = state;
  if (pauseButton) {
    pauseButton.textContent = state === "paused" ? "Resume" : "Pause";
    pauseButton.disabled = state !== "playing" && state !== "paused";
    pauseButton.setAttribute("aria-pressed", state === "paused" ? "true" : "false");
  }
}

function stepInterval() {
  return Math.max(STEP_MIN, STEP_START - eaten * STEP_GAIN);
}

function canStartFromCurrentState() {
  return state === "idle" || state === "over" || state === "won";
}

function setDirection(x, y) {
  if (canStartFromCurrentState()) {
    resetRun("playing");
    setMenu(false);
  }

  if (state !== "playing") return;
  if (x === -direction.x && y === -direction.y) return;
  nextDirection = { x, y };
}

function updatePlaying() {
  direction = nextDirection;
  const head = snake[0];
  const next = { x: head.x + direction.x, y: head.y + direction.y };
  const ate = food && next.x === food.x && next.y === food.y;
  const bodyToCheck = ate ? snake : snake.slice(0, -1);
  const hitSelf = bodyToCheck.some((segment) => segment.x === next.x && segment.y === next.y);
  const hitWall = next.x < 0 || next.y < 0 || next.x >= GRID || next.y >= GRID;

  if (hitWall || hitSelf) {
    endRun();
    return;
  }

  snake.unshift(next);
  if (ate) {
    eaten += 1;
    score += 10 + Math.floor(eaten / 5) * 5;
    if (score > best) {
      best = score;
      writeBest(best);
      updateHud("New best");
    } else {
      updateHud(eaten % 5 === 0 ? "Faster" : "Scored");
    }
    flashTime = 0.18;
    spawnEatBurst(next.x, next.y);
    playTone(560 + eaten * 8, 0.05, "triangle", 0.05);
    if (snake.length >= MAX_CELLS) {
      finishRun();
      return;
    }
    placeFood();
  } else {
    snake.pop();
  }

  updateHud();
}

function endRun() {
  state = "over";
  spawnCrashBurst(snake[0]);
  updateHud("Game over");
  setMenu(true, "Game Over", "Try Again", `Score ${score} / Best ${best}`);
  playTone(110, 0.16, "sawtooth", 0.06);
}

function finishRun() {
  state = "won";
  food = null;
  updateHud("Grid cleared");
  setMenu(true, "Grid Cleared", "Run Again", `Score ${score} / Best ${best}`);
  playTone(720, 0.18, "triangle", 0.05);
}

function placeFood() {
  const open = [];
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      if (!snake.some((segment) => segment.x === x && segment.y === y)) open.push({ x, y });
    }
  }
  food = open.length ? open[Math.floor(Math.random() * open.length)] : null;
}

function resize() {
  const rect = stage.getBoundingClientRect();
  viewport.dpr = Math.min(window.devicePixelRatio || 1, 2);
  viewport.width = Math.max(1, Math.floor(rect.width));
  viewport.height = Math.max(1, Math.floor(rect.height));
  canvas.width = Math.floor(viewport.width * viewport.dpr);
  canvas.height = Math.floor(viewport.height * viewport.dpr);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
  ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
  const usable = Math.min(viewport.width, viewport.height) - 28;
  viewport.cell = Math.max(8, Math.floor(usable / GRID));
  viewport.board = viewport.cell * GRID;
  viewport.offsetX = Math.floor((viewport.width - viewport.board) / 2);
  viewport.offsetY = Math.floor((viewport.height - viewport.board) / 2);
  draw();
}

function loop(time) {
  const dt = Math.min(0.08, (time - lastTime) / 1000 || 0);
  lastTime = time;
  if (!prefersReducedMotion) {
    pulseTime += dt;
    flashTime = Math.max(0, flashTime - dt);
    updateParticles(dt);
  } else {
    flashTime = 0;
    particles = [];
  }

  if (state === "playing") {
    accumulator += dt * 1000;
    const interval = stepInterval();
    while (accumulator >= interval) {
      updatePlaying();
      accumulator -= interval;
    }
  }

  draw();
  requestAnimationFrame(loop);
}

function draw() {
  ctx.clearRect(0, 0, viewport.width, viewport.height);
  drawBackdrop();
  drawBoard();
  drawFood();
  drawSnake();
  if (!prefersReducedMotion) {
    drawParticles();
    if (flashTime > 0) drawFlash();
  }
}

function drawBackdrop() {
  const gradient = ctx.createLinearGradient(0, 0, viewport.width, viewport.height);
  gradient.addColorStop(0, "#081011");
  gradient.addColorStop(0.5, "#0f1719");
  gradient.addColorStop(1, "#15131b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  const glow = ctx.createRadialGradient(viewport.width * 0.5, viewport.height * 0.45, 0, viewport.width * 0.5, viewport.height * 0.45, viewport.width * 0.62);
  glow.addColorStop(0, "rgba(109, 225, 166, 0.12)");
  glow.addColorStop(0.42, "rgba(104, 183, 255, 0.05)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, viewport.width, viewport.height);
}

function drawBoard() {
  const { offsetX, offsetY, board, cell } = viewport;
  ctx.save();
  ctx.shadowColor = "rgba(109, 225, 166, 0.22)";
  ctx.shadowBlur = 28;
  ctx.fillStyle = "#0b1213";
  roundRect(offsetX - 12, offsetY - 12, board + 24, board + 24, 16);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255, 247, 232, 0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  const boardGradient = ctx.createLinearGradient(offsetX, offsetY, offsetX + board, offsetY + board);
  boardGradient.addColorStop(0, "#111d1e");
  boardGradient.addColorStop(0.56, "#0f191a");
  boardGradient.addColorStop(1, "#12171d");
  ctx.fillStyle = boardGradient;
  roundRect(offsetX, offsetY, board, board, 6);
  ctx.fill();

  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      if ((x + y) % 2 === 0) {
        ctx.fillStyle = "rgba(255, 247, 232, 0.025)";
        ctx.fillRect(offsetX + x * cell, offsetY + y * cell, cell, cell);
      }
    }
  }

  ctx.strokeStyle = "rgba(109, 225, 166, 0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID; i += 1) {
    const p = offsetX + i * cell;
    const q = offsetY + i * cell;
    ctx.beginPath();
    ctx.moveTo(p, offsetY);
    ctx.lineTo(p, offsetY + board);
    ctx.moveTo(offsetX, q);
    ctx.lineTo(offsetX + board, q);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(245, 196, 91, 0.34)";
  ctx.lineWidth = 2;
  const tick = Math.max(10, cell * 1.2);
  [
    [offsetX, offsetY, 1, 1],
    [offsetX + board, offsetY, -1, 1],
    [offsetX, offsetY + board, 1, -1],
    [offsetX + board, offsetY + board, -1, -1]
  ].forEach(([x, y, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y + sy * tick);
    ctx.lineTo(x, y);
    ctx.lineTo(x + sx * tick, y);
    ctx.stroke();
  });
}

function drawFood() {
  if (!food) return;
  const { offsetX, offsetY, cell } = viewport;
  const cx = offsetX + food.x * cell + cell / 2;
  const cy = offsetY + food.y * cell + cell / 2;
  const pulse = prefersReducedMotion ? 1 : 0.82 + Math.sin(pulseTime * 7) * 0.12;
  const radius = cell * 0.28 * pulse;

  ctx.save();
  ctx.shadowColor = "rgba(245, 196, 91, 0.55)";
  ctx.shadowBlur = cell * 0.75;
  ctx.fillStyle = "rgba(245, 196, 91, 0.16)";
  ctx.beginPath();
  ctx.arc(cx, cy, cell * 0.52, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f5c45b";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "rgba(255, 247, 232, 0.72)";
  ctx.beginPath();
  ctx.arc(cx - radius * 0.25, cy - radius * 0.28, Math.max(2, radius * 0.22), 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake() {
  const { offsetX, offsetY, cell } = viewport;
  ctx.save();
  ctx.shadowColor = "rgba(109, 225, 166, 0.3)";
  ctx.shadowBlur = Math.max(8, cell * 0.32);
  for (let i = snake.length - 1; i >= 0; i -= 1) {
    const segment = snake[i];
    const x = offsetX + segment.x * cell;
    const y = offsetY + segment.y * cell;
    const inset = i === 0 ? 2 : 3;
    const t = i / Math.max(1, snake.length - 1);
    ctx.fillStyle = i === 0 ? "#7cf0b6" : blendColor("#68b7ff", "#6de1a6", 1 - t * 0.82);
    roundRect(x + inset, y + inset, cell - inset * 2, cell - inset * 2, Math.max(5, cell * 0.22));
    ctx.fill();
    ctx.shadowBlur = Math.max(4, cell * 0.12);
    ctx.strokeStyle = "rgba(7, 16, 13, 0.44)";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (i % 2 === 0 && i !== 0) {
      ctx.fillStyle = "rgba(255, 247, 232, 0.18)";
      const dot = Math.max(1.5, cell * 0.06);
      ctx.beginPath();
      ctx.arc(x + cell * 0.5, y + cell * 0.5, dot, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  drawHead();
}

function drawHead() {
  const { offsetX, offsetY, cell } = viewport;
  const head = snake[0];
  const cx = offsetX + head.x * cell + cell / 2;
  const cy = offsetY + head.y * cell + cell / 2;
  const side = { x: -direction.y, y: direction.x };
  const forward = direction;
  const eyeA = {
    x: cx + side.x * cell * 0.19 + forward.x * cell * 0.18,
    y: cy + side.y * cell * 0.19 + forward.y * cell * 0.18
  };
  const eyeB = {
    x: cx - side.x * cell * 0.19 + forward.x * cell * 0.18,
    y: cy - side.y * cell * 0.19 + forward.y * cell * 0.18
  };
  ctx.fillStyle = "#07100d";
  [eyeA, eyeB].forEach((eye) => {
    ctx.beginPath();
    ctx.arc(eye.x, eye.y, Math.max(2.2, cell * 0.075), 0, Math.PI * 2);
    ctx.fill();
  });
}

function spawnEatBurst(gridX, gridY) {
  if (prefersReducedMotion) return;

  const { offsetX, offsetY, cell } = viewport;
  const x = offsetX + gridX * cell + cell / 2;
  const y = offsetY + gridY * cell + cell / 2;
  for (let i = 0; i < 18; i += 1) {
    const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.28;
    const speed = 42 + Math.random() * 112;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.34 + Math.random() * 0.28,
      size: 2.4 + Math.random() * 3.8,
      color: i % 3 === 0 ? "#f5c45b" : i % 3 === 1 ? "#6de1a6" : "#fff7e8"
    });
  }
}

function spawnCrashBurst(head) {
  if (prefersReducedMotion) return;
  if (!head) return;
  const { offsetX, offsetY, cell } = viewport;
  const x = offsetX + head.x * cell + cell / 2;
  const y = offsetY + head.y * cell + cell / 2;
  for (let i = 0; i < 28; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 52 + Math.random() * 190;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.42 + Math.random() * 0.42,
      size: 2.5 + Math.random() * 4.8,
      color: i % 2 === 0 ? "#ff6f4f" : "#f5c45b"
    });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.985;
    particle.vy *= 0.985;
    if (particle.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (const particle of particles) {
    const alpha = clamp(particle.life / 0.62, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFlash() {
  const alpha = clamp(flashTime / 0.18, 0, 1);
  ctx.fillStyle = `rgba(109, 225, 166, ${alpha * 0.08})`;
  ctx.fillRect(0, 0, viewport.width, viewport.height);
}

function roundRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function blendColor(a, b, amount) {
  const ca = parseInt(a.slice(1), 16);
  const cb = parseInt(b.slice(1), 16);
  const ar = (ca >> 16) & 255;
  const ag = (ca >> 8) & 255;
  const ab = ca & 255;
  const br = (cb >> 16) & 255;
  const bg = (cb >> 8) & 255;
  const bb = cb & 255;
  const r = Math.round(ar + (br - ar) * amount);
  const g = Math.round(ag + (bg - ag) * amount);
  const blue = Math.round(ab + (bb - ab) * amount);
  return `rgb(${r}, ${g}, ${blue})`;
}

function primeAudio() {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  if (!audioContext) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    audioContext = new Audio();
  }
  if (audioContext.state === "suspended") audioContext.resume();
}

function playTone(frequency, duration, type = "sine", volume = 0.04) {
  if (!audioContext) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * 0.68), now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function handleKey(event) {
  const map = {
    ArrowUp: [0, -1],
    KeyW: [0, -1],
    ArrowDown: [0, 1],
    KeyS: [0, 1],
    ArrowLeft: [-1, 0],
    KeyA: [-1, 0],
    ArrowRight: [1, 0],
    KeyD: [1, 0]
  };
  if (map[event.code]) {
    event.preventDefault();
    primeAudio();
    setDirection(...map[event.code]);
  }
  if (event.code === "Space") {
    event.preventDefault();
    if (state === "playing" || state === "paused") togglePause();
    else startRun();
  }
  if (event.code === "Enter" && state !== "playing") {
    event.preventDefault();
    state === "paused" ? togglePause() : startRun();
  }
}

function handleTouchStart(event) {
  const touch = event.changedTouches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
}

function handleTouchEnd(event) {
  if (!touchStart) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  touchStart = null;
  if (Math.hypot(dx, dy) < 18) {
    if (canStartFromCurrentState()) startRun();
    return;
  }
  primeAudio();
  if (Math.abs(dx) > Math.abs(dy)) setDirection(Math.sign(dx), 0);
  else setDirection(0, Math.sign(dy));
}

function bindEvents() {
  window.addEventListener("resize", resize);
  window.addEventListener("keydown", handleKey);
  canvas.addEventListener("click", () => {
    if (canStartFromCurrentState()) startRun();
  });
  canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
  canvas.addEventListener("touchend", handleTouchEnd, { passive: true });
  startButton?.addEventListener("click", () => {
    state === "paused" ? togglePause() : startRun();
  });
  restartButton?.addEventListener("click", restartRun);
  pauseButton?.addEventListener("click", togglePause);
  fullscreenButton?.addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  });
  document.querySelectorAll("[data-dir]").forEach((button) => {
    const dirs = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0]
    };
    button.addEventListener("click", () => {
      primeAudio();
      setDirection(...dirs[button.dataset.dir]);
    });
  });
}

function init() {
  bindEvents();
  resetRun("idle");
  resize();
  requestAnimationFrame((time) => {
    lastTime = time;
    loop(time);
  });
  window.snakeLab = {
    start: startRun,
    reset: resetRun,
    setDirection,
    getState: () => ({ state, score, best, length: snake.length, food: food ? { ...food } : null, snake: snake.map((segment) => ({ ...segment })) })
  };
}

init();
