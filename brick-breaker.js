const canvas = document.querySelector("#gameCanvas");
const stage = document.querySelector("#gameStage");
const scoreValue = document.querySelector("#scoreValue");
const bestValue = document.querySelector("#bestValue");
const livesValue = document.querySelector("#livesValue");
const levelValue = document.querySelector("#levelValue");
const roundStatus = document.querySelector("#roundStatus");
const brickProgressFill = document.querySelector("#brickProgressFill");
const powerValue = document.querySelector("#powerValue");
const gameMenu = document.querySelector("#gameMenu");
const menuTitle = document.querySelector("#menuTitle");
const menuMeta = document.querySelector("#menuMeta");
const startButton = document.querySelector("#startButton");
const restartButton = document.querySelector("#restartButton");
const pauseButton = document.querySelector("#pauseButton");
const fullscreenButton = document.querySelector("#fullscreenButton");
const gameAnnouncement = document.querySelector("#gameAnnouncement");

const ctx = canvas.getContext("2d");
const WORLD_WIDTH = 960;
const WORLD_HEIGHT = 620;
const BEST_KEY = "inefy-brick-breaker-best";
const LEGACY_BEST_KEYS = ["brick-breaker-best"];
const START_LIVES = 3;
const MAX_LIVES = 5;
const MAX_LEVEL = 5;
const BALL_RADIUS = 9;
const PADDLE_Y = 560;
const POWER_DROP_CHANCE = 0.24;
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const POWER_TYPES = {
  wide: { label: "Wide", color: "#68b7ff", duration: 13 },
  slow: { label: "Slow", color: "#6de1a6", duration: 9 },
  shield: { label: "Shield", color: "#f5c45b", duration: 0 },
  life: { label: "+Life", color: "#ff7ac3", duration: 0 },
  bonus: { label: "+Score", color: "#a78bfa", duration: 0 }
};

let viewport = {
  dpr: 1,
  width: 1,
  height: 1,
  scale: 1,
  offsetX: 0,
  offsetY: 0
};

let state = "idle";
let pausedFrom = "serve";
let score = 0;
let best = readBest();
let lives = START_LIVES;
let level = 1;
let bricks = [];
let remainingBricks = 0;
let totalBricks = 0;
let lastTime = 0;
let pulseTime = 0;
let flashTime = 0;
let screenShake = 0;
let audioContext = null;
let pointerActive = false;
let touchMove = 0;
let particles = [];
let powerUps = [];
let activePowers = {
  wide: 0,
  slow: 0,
  shield: 0
};
let prefersReducedMotion = reducedMotionQuery.matches;
let gameAnnouncementTimer = 0;

function syncMotionPreference(event = reducedMotionQuery) {
  prefersReducedMotion = event.matches;

  if (prefersReducedMotion) {
    particles = [];
    ball.trail = [];
    flashTime = 0;
    screenShake = 0;
  }
}

if (reducedMotionQuery.addEventListener) {
  reducedMotionQuery.addEventListener("change", syncMotionPreference);
} else {
  reducedMotionQuery.addListener(syncMotionPreference);
}

const keys = {
  left: false,
  right: false
};

const paddle = {
  x: 0,
  y: PADDLE_Y,
  width: 138,
  height: 18,
  speed: 620,
  targetX: WORLD_WIDTH / 2
};

const ball = {
  x: WORLD_WIDTH / 2,
  y: PADDLE_Y - BALL_RADIUS - 2,
  vx: 0,
  vy: 0,
  speed: 420,
  radius: BALL_RADIUS,
  trail: []
};

function readBest() {
  try {
    return [BEST_KEY, ...LEGACY_BEST_KEYS].reduce((currentBest, key) => {
      const value = Number.parseInt(window.localStorage.getItem(key) || "0", 10);
      return Number.isFinite(value) ? Math.max(currentBest, value) : currentBest;
    }, 0);
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

function setMenu(visible, title = "", buttonText = "Start Game", metaText = "") {
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
  if (livesValue) livesValue.textContent = String(lives);
  if (levelValue) levelValue.textContent = String(level);
  if (roundStatus && statusText) roundStatus.textContent = statusText;
  if (brickProgressFill) {
    const cleared = totalBricks ? ((totalBricks - remainingBricks) / totalBricks) * 100 : 0;
    const progress = clamp(cleared, 0, 100);
    brickProgressFill.style.width = `${progress.toFixed(1)}%`;
    brickProgressFill.parentElement?.setAttribute("aria-valuenow", String(Math.round(progress)));
  }
  if (powerValue) powerValue.textContent = activePowerSummary();
  document.body.dataset.gameState = state;
  if (pauseButton) {
    pauseButton.textContent = state === "paused" ? "Resume" : "Pause";
    pauseButton.disabled = state === "idle" || state === "over" || state === "won";
    pauseButton.setAttribute("aria-pressed", state === "paused" ? "true" : "false");
  }
}

function announceGame(message) {
  if (!gameAnnouncement || !message) return;

  window.clearTimeout(gameAnnouncementTimer);
  gameAnnouncement.textContent = "";
  gameAnnouncementTimer = window.setTimeout(() => {
    gameAnnouncement.textContent = message;
  }, 20);
}

function ballSpeedForLevel() {
  return 420 + (level - 1) * 34;
}

function maxBallSpeed() {
  return activePowers.slow > 0 ? Math.min(540, ballSpeedForLevel() * 1.04) : 660;
}

function basePaddleWidthForLevel() {
  return Math.max(98, 146 - (level - 1) * 10);
}

function paddleWidthForLevel() {
  const baseWidth = basePaddleWidthForLevel();
  return activePowers.wide > 0 ? Math.min(218, Math.round(baseWidth * 1.45)) : baseWidth;
}

function syncPaddleWidth() {
  const center = paddle.x + paddle.width / 2 || WORLD_WIDTH / 2;
  paddle.width = paddleWidthForLevel();
  paddle.x = clamp(center - paddle.width / 2, 24, WORLD_WIDTH - paddle.width - 24);
  paddle.targetX = clamp(center, 24 + paddle.width / 2, WORLD_WIDTH - 24 - paddle.width / 2);
}

function activePowerSummary() {
  const active = [];
  if (activePowers.wide > 0) active.push(`Wide ${Math.ceil(activePowers.wide)}`);
  if (activePowers.slow > 0) active.push(`Slow ${Math.ceil(activePowers.slow)}`);
  if (activePowers.shield > 0) active.push("Shield");
  return active.length ? active.join(" / ") : "None";
}

function clearPowerState() {
  powerUps = [];
  activePowers = { wide: 0, slow: 0, shield: 0 };
  syncPaddleWidth();
}

function resetBallOnPaddle() {
  paddle.width = paddleWidthForLevel();
  paddle.x = clamp(paddle.x || (WORLD_WIDTH - paddle.width) / 2, 24, WORLD_WIDTH - paddle.width - 24);
  paddle.targetX = paddle.x + paddle.width / 2;
  ball.radius = BALL_RADIUS;
  ball.speed = ballSpeedForLevel();
  ball.x = paddle.x + paddle.width / 2;
  ball.y = paddle.y - ball.radius - 3;
  ball.vx = 0;
  ball.vy = 0;
  ball.trail = [];
}

function resetGame(nextState = "idle") {
  score = 0;
  lives = START_LIVES;
  level = 1;
  particles = [];
  powerUps = [];
  activePowers = { wide: 0, slow: 0, shield: 0 };
  flashTime = 0;
  screenShake = 0;
  paddle.x = (WORLD_WIDTH - paddleWidthForLevel()) / 2;
  buildLevel();
  resetBallOnPaddle();
  state = nextState;
  updateHud(nextState === "idle" ? "Ready" : "Launch");
  setMenu(nextState === "idle", "Brick Breaker", "Start Game", best ? `Best ${best}` : "Ready");
}

function startGame() {
  primeAudio();
  resetGame("serve");
  setMenu(false);
  updateHud("Launch");
  announceGame(`Brick Breaker started. Level ${level}. ${lives} lives.`);
}

function restartGame() {
  startGame();
}

function togglePause() {
  if (state === "playing" || state === "serve") {
    pausedFrom = state;
    state = "paused";
    keys.left = false;
    keys.right = false;
    pointerActive = false;
    updateHud("Paused");
    setMenu(true, "Paused", "Resume", `Score ${score}`);
    announceGame(`Game paused. Score ${score}.`);
    return;
  }

  if (state === "paused") {
    state = pausedFrom;
    updateHud(state === "serve" ? "Launch" : "Running");
    setMenu(false);
    primeAudio();
    announceGame(`Game resumed. Score ${score}.`);
  }
}

function buildLevel() {
  bricks = [];
  const columns = 10;
  const rows = Math.min(8, 4 + level);
  const marginX = 54;
  const gap = 9;
  const top = 76;
  const width = (WORLD_WIDTH - marginX * 2 - gap * (columns - 1)) / columns;
  const height = 28;
  const palette = ["#68b7ff", "#6de1a6", "#f5c45b", "#ff7ac3", "#a78bfa"];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const skip = level >= 3 && row > 1 && (col + row + level) % 7 === 0;
      if (skip) continue;
      const maxHits = 1 + (row >= rows - 2 ? 1 : 0) + (level >= 4 && row % 3 === 0 ? 1 : 0);
      bricks.push({
        x: marginX + col * (width + gap),
        y: top + row * (height + gap),
        width,
        height,
        hits: maxHits,
        maxHits,
        color: palette[(row + level) % palette.length],
        value: 40 + level * 8 + row * 5
      });
    }
  }

  remainingBricks = bricks.length;
  totalBricks = bricks.length;
}

function launchBall() {
  if (state !== "serve") return;
  const offset = (paddle.targetX - WORLD_WIDTH / 2) / WORLD_WIDTH;
  const angle = clamp(offset * 0.8, -0.56, 0.56);
  ball.speed = activePowers.slow > 0 ? ballSpeedForLevel() * 0.8 : ballSpeedForLevel();
  ball.vx = Math.sin(angle) * ball.speed;
  ball.vy = -Math.cos(angle) * ball.speed;
  state = "playing";
  updateHud("Running");
  announceGame(`Ball launched. Score ${score}.`);
  playTone(420, 0.06, "triangle", 0.04);
}

function handleAction() {
  if (state === "idle" || state === "over" || state === "won") {
    startGame();
    return;
  }

  if (state === "serve") {
    primeAudio();
    launchBall();
    return;
  }

  if (state === "playing" || state === "paused") togglePause();
}

function updateGame(dt) {
  if (!prefersReducedMotion) {
    pulseTime += dt;
    flashTime = Math.max(0, flashTime - dt);
    screenShake = Math.max(0, screenShake - dt * 28);
    updateParticles(dt);
  } else {
    flashTime = 0;
    screenShake = 0;
    particles = [];
    ball.trail = [];
  }
  if (state === "playing") {
    updatePowerTimers(dt);
    updatePowerUps(dt);
  }
  if (state === "playing" || state === "serve") {
    updatePaddle(dt);
  }

  if (state === "serve") {
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius - 3;
    ball.trail = [];
  }

  if (state !== "playing") return;
  const maxTravel = ball.radius * 0.75;
  const steps = Math.max(1, Math.ceil((Math.hypot(ball.vx, ball.vy) * dt) / maxTravel));
  const stepDt = dt / steps;
  for (let i = 0; i < steps; i += 1) {
    moveBall(stepDt);
    if (state !== "playing") break;
  }
}

function updatePaddle(dt) {
  let move = 0;
  if (keys.left) move -= 1;
  if (keys.right) move += 1;
  move += touchMove;

  if (move !== 0) {
    paddle.x += clamp(move, -1, 1) * paddle.speed * dt;
    paddle.targetX = paddle.x + paddle.width / 2;
  } else if (pointerActive) {
    const targetLeft = paddle.targetX - paddle.width / 2;
    paddle.x += (targetLeft - paddle.x) * Math.min(1, dt * 18);
  }

  paddle.x = clamp(paddle.x, 24, WORLD_WIDTH - paddle.width - 24);
  paddle.targetX = clamp(paddle.targetX, 24 + paddle.width / 2, WORLD_WIDTH - 24 - paddle.width / 2);
}

function moveBall(dt) {
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.trail.unshift({ x: ball.x, y: ball.y });
  if (ball.trail.length > 10) ball.trail.pop();

  if (ball.x - ball.radius < 18) {
    ball.x = 18 + ball.radius;
    ball.vx = Math.abs(ball.vx);
    playTone(260, 0.025, "sine", 0.025);
  }

  if (ball.x + ball.radius > WORLD_WIDTH - 18) {
    ball.x = WORLD_WIDTH - 18 - ball.radius;
    ball.vx = -Math.abs(ball.vx);
    playTone(260, 0.025, "sine", 0.025);
  }

  if (ball.y - ball.radius < 20) {
    ball.y = 20 + ball.radius;
    ball.vy = Math.abs(ball.vy);
    playTone(280, 0.025, "sine", 0.025);
  }

  if (activePowers.shield > 0 && ball.vy > 0 && ball.y + ball.radius >= WORLD_HEIGHT - 28) {
    ball.y = WORLD_HEIGHT - 28 - ball.radius;
    ball.vy = -Math.abs(ball.vy);
    activePowers.shield = 0;
    screenShake = Math.max(screenShake, 4);
    spawnPaddleSpark(ball.x, WORLD_HEIGHT - 30);
    updateHud("Shield save");
    announceGame("Shield saved the ball.");
    playTone(520, 0.08, "triangle", 0.04);
  }

  if (ball.y - ball.radius > WORLD_HEIGHT) {
    loseLife();
    return;
  }

  const paddleHit = circleRectCollision(ball, paddle);
  if (ball.vy > 0 && paddleHit.hit) {
    ball.y = paddle.y - ball.radius - 0.1;
    const offset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
    const angle = clamp(offset, -1, 1) * 1.13;
    const speed = Math.min(maxBallSpeed(), Math.hypot(ball.vx, ball.vy) * 1.012);
    ball.vx = Math.sin(angle) * speed;
    ball.vy = -Math.cos(angle) * speed;
    spawnPaddleSpark(ball.x, paddle.y);
    playTone(360 + Math.abs(offset) * 90, 0.04, "triangle", 0.035);
  }

  for (const brick of bricks) {
    if (brick.hits <= 0) continue;
    const hit = circleRectCollision(ball, brick);
    if (!hit.hit) continue;
    damageBrick(brick, hit);
    break;
  }
}

function circleRectCollision(circle, rect) {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.height);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  const distanceSq = dx * dx + dy * dy;
  if (distanceSq > circle.radius * circle.radius) return { hit: false, nx: 0, ny: 0 };

  if (dx === 0 && dy === 0) {
    const left = Math.abs(circle.x - rect.x);
    const right = Math.abs(rect.x + rect.width - circle.x);
    const top = Math.abs(circle.y - rect.y);
    const bottom = Math.abs(rect.y + rect.height - circle.y);
    const min = Math.min(left, right, top, bottom);
    if (min === left) return { hit: true, nx: -1, ny: 0 };
    if (min === right) return { hit: true, nx: 1, ny: 0 };
    if (min === top) return { hit: true, nx: 0, ny: -1 };
    return { hit: true, nx: 0, ny: 1 };
  }

  if (Math.abs(dx) > Math.abs(dy)) return { hit: true, nx: Math.sign(dx), ny: 0 };
  return { hit: true, nx: 0, ny: Math.sign(dy) };
}

function damageBrick(brick, hit) {
  if (hit.nx !== 0) ball.vx = Math.abs(ball.vx) * hit.nx;
  if (hit.ny !== 0) ball.vy = Math.abs(ball.vy) * hit.ny;
  brick.hits -= 1;
  flashTime = 0.12;
  screenShake = Math.max(screenShake, 2.4);
  spawnBrickBurst(brick, hit);
  playTone(470 + (brick.maxHits - brick.hits) * 65, 0.035, "square", 0.03);

  if (brick.hits <= 0) {
    remainingBricks -= 1;
    score += brick.value;
    if (score > best) {
      best = score;
      writeBest(best);
      updateHud("New best");
    } else {
      updateHud("Hit");
    }

    if (remainingBricks > 0) maybeSpawnPowerUp(brick);
    if (remainingBricks <= 0) clearLevel();
  } else {
    score += Math.floor(brick.value / 4);
    if (score > best) {
      best = score;
      writeBest(best);
    }
    updateHud("Cracked");
  }
}

function clearLevel() {
  if (level >= MAX_LEVEL) {
    finishGame();
    return;
  }

  level += 1;
  powerUps = [];
  buildLevel();
  resetBallOnPaddle();
  state = "serve";
  flashTime = 0.28;
  updateHud(`Level ${level}`);
  announceGame(`Level ${level} started. Score ${score}.`);
  playTone(650, 0.12, "triangle", 0.045);
}

function finishGame() {
  state = "won";
  clearPowerState();
  updateHud("Board cleared");
  setMenu(true, "Board Cleared", "Run Again", `Score ${score} / Best ${best}`);
  announceGame(`Board cleared. Final score ${score}. Best ${best}.`);
  playTone(760, 0.2, "triangle", 0.05);
}

function loseLife() {
  lives -= 1;
  screenShake = 8;
  spawnBallDrop();
  clearPowerState();
  if (lives <= 0) {
    state = "over";
    updateHud("Game over");
    setMenu(true, "Game Over", "Try Again", `Score ${score} / Best ${best}`);
    announceGame(`Game over. Final score ${score}. Best ${best}.`);
    playTone(120, 0.18, "sawtooth", 0.055);
    return;
  }

  resetBallOnPaddle();
  state = "serve";
  updateHud("Launch");
  announceGame(`Life lost. ${lives} ${lives === 1 ? "life" : "lives"} remaining.`);
  playTone(170, 0.12, "sawtooth", 0.035);
}

function maybeSpawnPowerUp(brick) {
  const cleared = totalBricks - remainingBricks;
  const boostedDrop = cleared > 0 && cleared % 12 === 0;
  if (Math.random() > POWER_DROP_CHANCE + (boostedDrop ? 0.22 : 0)) return;

  const options = ["wide", "wide", "slow", "slow", "shield", "shield", "bonus"];
  if (lives < MAX_LIVES) options.push("life");
  const type = options[Math.floor(Math.random() * options.length)];
  spawnPowerUp(type, brick.x + brick.width / 2, brick.y + brick.height / 2);
}

function spawnPowerUp(type, x, y) {
  powerUps.push({
    type,
    x,
    y,
    vy: 112 + level * 9 + Math.random() * 36,
    radius: 16,
    spin: Math.random() * Math.PI * 2,
    age: 0
  });
}

function updatePowerTimers(dt) {
  const before = activePowerSummary();
  const hadWide = activePowers.wide > 0;
  activePowers.wide = Math.max(0, activePowers.wide - dt);
  activePowers.slow = Math.max(0, activePowers.slow - dt);
  if (hadWide && activePowers.wide === 0) syncPaddleWidth();
  if (before !== activePowerSummary()) updateHud();
}

function updatePowerUps(dt) {
  for (let i = powerUps.length - 1; i >= 0; i -= 1) {
    const powerUp = powerUps[i];
    powerUp.age += dt;
    powerUp.y += powerUp.vy * dt;
    powerUp.vy += 18 * dt;
    powerUp.spin += dt * 4.5;

    if (powerUpHitsPaddle(powerUp)) {
      powerUps.splice(i, 1);
      activatePowerUp(powerUp);
    } else if (powerUp.y - powerUp.radius > WORLD_HEIGHT + 34) {
      powerUps.splice(i, 1);
    }
  }
}

function powerUpHitsPaddle(powerUp) {
  return (
    powerUp.x + powerUp.radius >= paddle.x &&
    powerUp.x - powerUp.radius <= paddle.x + paddle.width &&
    powerUp.y + powerUp.radius >= paddle.y &&
    powerUp.y - powerUp.radius <= paddle.y + paddle.height
  );
}

function activatePowerUp(powerUp) {
  const type = powerUp.type;
  let statusText = POWER_TYPES[type]?.label || "Power";

  if (type === "wide") {
    activePowers.wide = Math.max(activePowers.wide, POWER_TYPES.wide.duration);
    syncPaddleWidth();
    statusText = "Wide paddle";
  } else if (type === "slow") {
    activePowers.slow = Math.max(activePowers.slow, POWER_TYPES.slow.duration);
    normalizeBallSpeed(Math.min(Math.hypot(ball.vx, ball.vy) || ballSpeedForLevel(), ballSpeedForLevel() * 0.74));
    statusText = "Slow ball";
  } else if (type === "shield") {
    activePowers.shield = 1;
    statusText = "Shield up";
  } else if (type === "life") {
    if (lives < MAX_LIVES) {
      lives += 1;
      statusText = "Extra life";
    } else {
      score += 120;
      statusText = "Life banked";
    }
  } else if (type === "bonus") {
    score += 150 + level * 30;
    statusText = "Bonus";
  }

  if (score > best) {
    best = score;
    writeBest(best);
  }
  spawnPowerCollect(powerUp);
  updateHud(statusText);
  announceGame(`${statusText}. Score ${score}.`);
  playTone(type === "life" ? 690 : 560, 0.08, "triangle", 0.04);
}

function normalizeBallSpeed(targetSpeed) {
  const speed = Math.hypot(ball.vx, ball.vy);
  if (speed <= 0) return;
  ball.vx = (ball.vx / speed) * targetSpeed;
  ball.vy = (ball.vy / speed) * targetSpeed;
}

function spawnPowerCollect(powerUp) {
  if (prefersReducedMotion) return;

  const color = POWER_TYPES[powerUp.type]?.color || "#fff7e8";
  for (let i = 0; i < 16; i += 1) {
    const angle = (i / 16) * Math.PI * 2;
    const speed = 42 + Math.random() * 112;
    particles.push({
      x: powerUp.x,
      y: powerUp.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.28 + Math.random() * 0.24,
      size: 2.2 + Math.random() * 3.6,
      color
    });
  }
}

function spawnBrickBurst(brick) {
  if (prefersReducedMotion) return;

  const x = brick.x + brick.width / 2;
  const y = brick.y + brick.height / 2;
  const count = brick.hits <= 1 ? 18 : 9;
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 42 + Math.random() * 170;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.34 + Math.random() * 0.28,
      size: 2.4 + Math.random() * 4,
      color: brick.color
    });
  }
}

function spawnPaddleSpark(x, y) {
  if (prefersReducedMotion) return;

  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.3;
    const speed = 52 + Math.random() * 120;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.24 + Math.random() * 0.2,
      size: 2 + Math.random() * 3.2,
      color: i % 2 === 0 ? "#68b7ff" : "#fff7e8"
    });
  }
}

function spawnBallDrop() {
  if (prefersReducedMotion) return;

  for (let i = 0; i < 20; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 45 + Math.random() * 160;
    particles.push({
      x: ball.x,
      y: Math.min(ball.y, WORLD_HEIGHT - 16),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.38 + Math.random() * 0.32,
      size: 2.5 + Math.random() * 4,
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
    particle.vx *= 0.986;
    particle.vy = particle.vy * 0.986 + 26 * dt;
    if (particle.life <= 0) particles.splice(i, 1);
  }
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
  viewport.scale = Math.min(viewport.width / WORLD_WIDTH, viewport.height / WORLD_HEIGHT);
  viewport.offsetX = Math.floor((viewport.width - WORLD_WIDTH * viewport.scale) / 2);
  viewport.offsetY = Math.floor((viewport.height - WORLD_HEIGHT * viewport.scale) / 2);
  draw();
}

function loop(time) {
  const dt = Math.min(0.05, (time - lastTime) / 1000 || 0);
  lastTime = time;
  updateGame(dt);
  draw();
  requestAnimationFrame(loop);
}

function draw() {
  ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
  ctx.clearRect(0, 0, viewport.width, viewport.height);
  drawBackdrop();

  const shakeX = !prefersReducedMotion && screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
  const shakeY = !prefersReducedMotion && screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
  ctx.save();
  ctx.translate(viewport.offsetX + shakeX, viewport.offsetY + shakeY);
  ctx.scale(viewport.scale, viewport.scale);
  drawArena();
  drawShield();
  drawBricks();
  drawPowerUps();
  drawPaddle();
  drawBall();
  if (!prefersReducedMotion) drawParticles();
  if (state === "serve") drawServePreview();
  if (!prefersReducedMotion && flashTime > 0) drawFlash();
  ctx.restore();
}

function drawBackdrop() {
  const gradient = ctx.createLinearGradient(0, 0, viewport.width, viewport.height);
  gradient.addColorStop(0, "#07101a");
  gradient.addColorStop(0.56, "#0e141c");
  gradient.addColorStop(1, "#151019");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  const glow = ctx.createRadialGradient(viewport.width * 0.52, viewport.height * 0.44, 0, viewport.width * 0.52, viewport.height * 0.44, viewport.width * 0.64);
  glow.addColorStop(0, "rgba(104, 183, 255, 0.14)");
  glow.addColorStop(0.42, "rgba(245, 196, 91, 0.05)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, viewport.width, viewport.height);
}

function drawArena() {
  const courtGradient = ctx.createLinearGradient(18, 18, WORLD_WIDTH - 18, WORLD_HEIGHT - 18);
  courtGradient.addColorStop(0, "rgba(104, 183, 255, 0.08)");
  courtGradient.addColorStop(0.5, "rgba(255, 247, 232, 0.015)");
  courtGradient.addColorStop(1, "rgba(255, 122, 195, 0.07)");
  ctx.fillStyle = courtGradient;
  roundRect(18, 18, WORLD_WIDTH - 36, WORLD_HEIGHT - 36, 18);
  ctx.fill();

  ctx.save();
  ctx.shadowColor = "rgba(104, 183, 255, 0.22)";
  ctx.shadowBlur = 30;
  ctx.fillStyle = "#0b121a";
  roundRect(16, 16, WORLD_WIDTH - 32, WORLD_HEIGHT - 32, 18);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255, 247, 232, 0.22)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  const railGradient = ctx.createLinearGradient(16, 0, 56, 0);
  railGradient.addColorStop(0, "rgba(104, 183, 255, 0.34)");
  railGradient.addColorStop(1, "rgba(104, 183, 255, 0)");
  ctx.fillStyle = railGradient;
  roundRect(18, 28, 18, WORLD_HEIGHT - 56, 9);
  ctx.fill();

  const rightRail = ctx.createLinearGradient(WORLD_WIDTH - 16, 0, WORLD_WIDTH - 56, 0);
  rightRail.addColorStop(0, "rgba(255, 122, 195, 0.3)");
  rightRail.addColorStop(1, "rgba(255, 122, 195, 0)");
  ctx.fillStyle = rightRail;
  roundRect(WORLD_WIDTH - 36, 28, 18, WORLD_HEIGHT - 56, 9);
  ctx.fill();

  const floorGlow = ctx.createLinearGradient(0, WORLD_HEIGHT - 120, 0, WORLD_HEIGHT - 22);
  floorGlow.addColorStop(0, "rgba(245, 196, 91, 0)");
  floorGlow.addColorStop(1, "rgba(245, 196, 91, 0.1)");
  ctx.fillStyle = floorGlow;
  roundRect(28, WORLD_HEIGHT - 132, WORLD_WIDTH - 56, 106, 14);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 247, 232, 0.025)";
  for (let x = 48; x < WORLD_WIDTH - 48; x += 48) {
    ctx.fillRect(x, 24, 1, WORLD_HEIGHT - 48);
  }
  for (let y = 56; y < WORLD_HEIGHT - 40; y += 48) {
    ctx.fillRect(24, y, WORLD_WIDTH - 48, 1);
  }
}

function drawBricks() {
  for (const brick of bricks) {
    if (brick.hits <= 0) continue;
    const damage = 1 - brick.hits / brick.maxHits;
    ctx.save();
    ctx.shadowColor = brick.color;
    ctx.shadowBlur = 10;
    const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x + brick.width, brick.y + brick.height);
    gradient.addColorStop(0, blendColor(brick.color, "#fff7e8", 0.28 - damage * 0.12));
    gradient.addColorStop(1, blendColor(brick.color, "#07101a", 0.24 + damage * 0.18));
    ctx.fillStyle = gradient;
    roundRect(brick.x, brick.y, brick.width, brick.height, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 247, 232, 0.22)";
    ctx.lineWidth = 1;
    ctx.stroke();
    if (brick.hits > 1) {
      ctx.fillStyle = "rgba(7, 11, 16, 0.36)";
      ctx.fillRect(brick.x + 8, brick.y + brick.height - 7, (brick.width - 16) * (brick.hits / brick.maxHits), 3);
    }
    ctx.restore();
  }
}

function drawShield() {
  if (activePowers.shield <= 0) return;
  const y = WORLD_HEIGHT - 28;
  const alpha = prefersReducedMotion ? 0.64 : 0.54 + Math.sin(pulseTime * 7) * 0.16;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(245, 196, 91, 0.65)";
  ctx.shadowBlur = 18;
  const gradient = ctx.createLinearGradient(108, y, WORLD_WIDTH - 108, y);
  gradient.addColorStop(0, "rgba(245, 196, 91, 0)");
  gradient.addColorStop(0.2, "#f5c45b");
  gradient.addColorStop(0.8, "#68b7ff");
  gradient.addColorStop(1, "rgba(104, 183, 255, 0)");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(108, y);
  ctx.lineTo(WORLD_WIDTH - 108, y);
  ctx.stroke();
  ctx.restore();
}

function drawPowerUps() {
  for (const powerUp of powerUps) {
    const def = POWER_TYPES[powerUp.type] || POWER_TYPES.bonus;
    const width = 68;
    const height = 27;
    const x = powerUp.x - width / 2;
    const y = powerUp.y - height / 2;
    const bob = Math.sin(powerUp.age * 8) * 2;

    ctx.save();
    ctx.translate(0, bob);
    ctx.shadowColor = def.color;
    ctx.shadowBlur = 16;
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, blendColor(def.color, "#fff7e8", 0.36));
    gradient.addColorStop(1, blendColor(def.color, "#07101a", 0.18));
    ctx.fillStyle = gradient;
    roundRect(x, y, width, height, 13);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 247, 232, 0.32)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#07101a";
    ctx.font = "900 11px JetBrains Mono, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(powerLabel(powerUp.type), powerUp.x, powerUp.y + 0.5);
    ctx.restore();
  }
}

function powerLabel(type) {
  if (type === "wide") return "WIDE";
  if (type === "slow") return "SLOW";
  if (type === "shield") return "SAFE";
  if (type === "life") return "+LIFE";
  return "+PTS";
}

function drawPaddle() {
  ctx.save();
  ctx.fillStyle = "rgba(104, 183, 255, 0.08)";
  roundRect(130, paddle.y + paddle.height + 13, WORLD_WIDTH - 260, 6, 3);
  ctx.fill();

  ctx.shadowColor = "rgba(104, 183, 255, 0.4)";
  ctx.shadowBlur = 18;
  const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.width, paddle.y + paddle.height);
  gradient.addColorStop(0, "#68b7ff");
  gradient.addColorStop(0.5, "#fff7e8");
  gradient.addColorStop(1, "#f5c45b");
  ctx.fillStyle = gradient;
  roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 9);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(7, 11, 16, 0.42)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawBall() {
  if (!prefersReducedMotion) {
    for (let i = ball.trail.length - 1; i >= 0; i -= 1) {
      const t = i / Math.max(1, ball.trail.length - 1);
      const point = ball.trail[i];
      ctx.globalAlpha = 0.12 + (1 - t) * 0.22;
      ctx.fillStyle = "#68b7ff";
      ctx.beginPath();
      ctx.arc(point.x, point.y, ball.radius * (0.5 + (1 - t) * 0.28), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.save();
  ctx.shadowColor = "rgba(245, 196, 91, 0.62)";
  ctx.shadowBlur = 18;
  const gradient = ctx.createRadialGradient(ball.x - 3, ball.y - 4, 1, ball.x, ball.y, ball.radius * 1.4);
  gradient.addColorStop(0, "#fff7e8");
  gradient.addColorStop(0.55, "#f5c45b");
  gradient.addColorStop(1, "#ff7ac3");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
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

function drawServePreview() {
  const alpha = prefersReducedMotion ? 0.68 : 0.55 + Math.sin(pulseTime * 5) * 0.18;
  const offset = (paddle.targetX - WORLD_WIDTH / 2) / WORLD_WIDTH;
  const angle = clamp(offset * 0.8, -0.56, 0.56);
  const endX = ball.x + Math.sin(angle) * 96;
  const endY = ball.y - Math.cos(angle) * 96;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#fff7e8";
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(ball.x, ball.y - ball.radius - 5);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = "#68b7ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius + 10 + (prefersReducedMotion ? 0 : Math.sin(pulseTime * 6) * 3), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawFlash() {
  const alpha = clamp(flashTime / 0.28, 0, 1);
  ctx.fillStyle = `rgba(104, 183, 255, ${alpha * 0.08})`;
  ctx.fillRect(18, 18, WORLD_WIDTH - 36, WORLD_HEIGHT - 36);
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

function screenToWorld(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left - viewport.offsetX) / viewport.scale;
  const y = (clientY - rect.top - viewport.offsetY) / viewport.scale;
  return { x, y };
}

function setPaddleTargetFromClient(clientX, clientY) {
  const point = screenToWorld(clientX, clientY);
  paddle.targetX = clamp(point.x, 24 + paddle.width / 2, WORLD_WIDTH - 24 - paddle.width / 2);
  pointerActive = true;
}

function primeAudio() {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  if (!audioContext) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    audioContext = new Audio();
  }
  if (audioContext.state === "suspended") audioContext.resume();
}

function playTone(frequency, duration, type = "sine", volume = 0.035) {
  if (!audioContext) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * 0.7), now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function handleKeyDown(event) {
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    event.preventDefault();
    keys.left = true;
    pointerActive = false;
  }
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    event.preventDefault();
    keys.right = true;
    pointerActive = false;
  }
  if (event.code === "Space") {
    event.preventDefault();
    primeAudio();
    handleAction();
  }
  if (event.code === "KeyP" || event.code === "Escape") {
    if (state === "playing" || state === "serve" || state === "paused") {
      event.preventDefault();
      togglePause();
    }
  }
  if (event.code === "Enter") {
    event.preventDefault();
    primeAudio();
    if (state === "paused") togglePause();
    else handleAction();
  }
}

function handleKeyUp(event) {
  if (event.code === "ArrowLeft" || event.code === "KeyA") keys.left = false;
  if (event.code === "ArrowRight" || event.code === "KeyD") keys.right = false;
}

function bindEvents() {
  window.addEventListener("resize", resize);
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  canvas.addEventListener("pointermove", (event) => {
    event.preventDefault();
    setPaddleTargetFromClient(event.clientX, event.clientY);
  });
  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    setPaddleTargetFromClient(event.clientX, event.clientY);
    primeAudio();
    if (state === "idle" || state === "over" || state === "won") startGame();
    else if (state === "serve") launchBall();
  });
  canvas.addEventListener("pointerleave", () => {
    pointerActive = false;
  });

  startButton?.addEventListener("click", () => {
    primeAudio();
    state === "paused" ? togglePause() : startGame();
  });
  restartButton?.addEventListener("click", restartGame);
  pauseButton?.addEventListener("click", togglePause);
  fullscreenButton?.addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  });

  document.querySelectorAll("[data-control]").forEach((button) => {
    const control = button.dataset.control;
    const startMove = () => {
      pointerActive = false;
      touchMove = control === "left" ? -1 : control === "right" ? 1 : 0;
    };
    const stopMove = () => {
      if (control === "left" || control === "right") touchMove = 0;
    };
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      primeAudio();
      if (control === "launch") handleAction();
      else startMove();
    });
    button.addEventListener("pointerup", stopMove);
    button.addEventListener("pointercancel", stopMove);
    button.addEventListener("pointerleave", stopMove);
  });
}

function getState() {
  return {
    state,
    score,
    best,
    lives,
    level,
    remainingBricks,
    totalBricks,
    powers: { ...activePowers },
    powerUps: powerUps.map((powerUp) => ({ type: powerUp.type, x: powerUp.x, y: powerUp.y })),
    paddle: { x: paddle.x, y: paddle.y, width: paddle.width, height: paddle.height },
    ball: { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy },
    bricks: bricks.map((brick) => ({
      x: brick.x,
      y: brick.y,
      width: brick.width,
      height: brick.height,
      hits: brick.hits,
      maxHits: brick.maxHits
    }))
  };
}

function init() {
  bindEvents();
  resetGame("idle");
  resize();
  requestAnimationFrame((time) => {
    lastTime = time;
    loop(time);
  });
  window.brickBreaker = {
    start: startGame,
    reset: resetGame,
    launch: launchBall,
    movePaddle: (x) => {
      pointerActive = true;
      paddle.targetX = clamp(x, 24 + paddle.width / 2, WORLD_WIDTH - 24 - paddle.width / 2);
    },
    getState
  };
}

init();
