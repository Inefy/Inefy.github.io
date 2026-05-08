const canvas = document.querySelector("#gameCanvas");
const stage = document.querySelector("#gameStage");
const scoreValue = document.querySelector("#scoreValue");
const bestValue = document.querySelector("#bestValue");
const roundStatus = document.querySelector("#roundStatus");
const gameMenu = document.querySelector("#gameMenu");
const menuTitle = document.querySelector("#menuTitle");
const menuMeta = document.querySelector("#menuMeta");
const startButton = document.querySelector("#startButton");
const restartButton = document.querySelector("#restartButton");
const pauseButton = document.querySelector("#pauseButton");
const fullscreenButton = document.querySelector("#fullscreenButton");

const ctx = canvas.getContext("2d");
const WORLD_WIDTH = 960;
const WORLD_HEIGHT = 540;
const GROUND_HEIGHT = 78;
const PLAYER_X = 238;
const PLAYER_RADIUS = 22;
const PIPE_WIDTH = 86;
const PIPE_GAP_START = 226;
const PIPE_GAP_MIN = PLAYER_RADIUS * 2 + 8;
const PIPE_INTERVAL_START = 1.78;
const PIPE_INTERVAL_MIN = 1.08;
const GRAVITY = 1020;
const FLAP_VELOCITY = -340;
const PIPE_SPEED_START = 160;
const PIPE_SPEED_GAIN = 14.8;
const BEST_KEY = "flappy-workbench-best";
const PIPE_WARNING_DISTANCE = 235;
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let viewport = {
  dpr: 1,
  width: 1,
  height: 1,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  cameraX: 0,
  visibleWorldWidth: WORLD_WIDTH
};

let state = "idle";
let player;
let pipes;
let particles;
let floaters;
let score;
let best;
let spawnTimer;
let groundOffset;
let lastTime;
let idleTime;
let shakeTime;
let shakePower;
let flashTime;
let audioContext;
let prefersReducedMotion = reducedMotionQuery.matches;

function syncMotionPreference(event = reducedMotionQuery) {
  prefersReducedMotion = event.matches;

  if (prefersReducedMotion) {
    particles = [];
    floaters = [];
    shakeTime = 0;
    shakePower = 0;
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
    const stored = Number.parseInt(window.localStorage.getItem(BEST_KEY) || "0", 10);
    return Number.isFinite(stored) ? stored : 0;
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

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function difficultyForScore(value) {
  const pace = 1 - Math.exp(-value / 12);
  const speed = PIPE_SPEED_START + value * PIPE_SPEED_GAIN + Math.log1p(value) * 36;

  return {
    pace,
    speed,
    gap: Math.round(lerp(PIPE_GAP_START, PIPE_GAP_MIN, pace)),
    interval: lerp(PIPE_INTERVAL_START, PIPE_INTERVAL_MIN, pace),
    centerSwing: lerp(36, 78, pace),
    centerNoise: lerp(42, 82, pace)
  };
}

function resetRun(nextState = "idle") {
  player = {
    x: PLAYER_X,
    y: WORLD_HEIGHT * 0.48,
    vy: 0,
    rotation: 0
  };
  pipes = [];
  particles = [];
  floaters = [];
  score = 0;
  spawnTimer = 0.82;
  groundOffset = 0;
  lastTime = 0;
  idleTime = 0;
  shakeTime = 0;
  shakePower = 0;
  flashTime = 0;
  state = nextState;
  updateHud(nextState === "playing" ? "Running" : "Ready");
  setMenu(nextState === "idle", "Flappy Workbench", "Start Run", best ? `Best ${best}` : "Ready");
}

function startRun() {
  primeAudio();
  resetRun("playing");
  flap();
}

function flap() {
  if (state === "idle" || state === "over") {
    startRun();
    return;
  }

  if (state !== "playing") return;

  player.vy = FLAP_VELOCITY;
  spawnWingBurst();
  playTone(520, 0.035, "triangle", 0.045);
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
  if (roundStatus && statusText) roundStatus.textContent = statusText;
  if (pauseButton) {
    pauseButton.textContent = state === "paused" ? "Resume" : "Pause";
    pauseButton.disabled = state !== "playing" && state !== "paused";
    pauseButton.setAttribute("aria-pressed", state === "paused" ? "true" : "false");
  }
}

function spawnPipe() {
  const difficulty = difficultyForScore(score);
  const minCenter = difficulty.gap / 2 + 58;
  const maxCenter = WORLD_HEIGHT - GROUND_HEIGHT - difficulty.gap / 2 - 58;
  const sequence = score + pipes.length;
  const wave = Math.sin(sequence * 0.82) * difficulty.centerSwing;
  const random = (Math.random() - 0.5) * difficulty.centerNoise;
  const center = clamp(255 + wave + random, minCenter, maxCenter);
  const top = center - difficulty.gap / 2;
  const x = spawnX();

  pipes.push({
    x,
    previousX: x,
    top,
    gap: difficulty.gap,
    width: PIPE_WIDTH,
    pace: difficulty.pace,
    scored: false
  });
}

function spawnX() {
  return viewport.cameraX + viewport.visibleWorldWidth + 88;
}

function spawnWingBurst() {
  if (prefersReducedMotion) return;

  for (let i = 0; i < 7; i += 1) {
    particles.push({
      x: player.x - 12,
      y: player.y + 6,
      vx: -70 - Math.random() * 70,
      vy: 40 - Math.random() * 110,
      life: 0.28 + Math.random() * 0.22,
      size: 3 + Math.random() * 4,
      color: i % 2 === 0 ? "#f5c45b" : "#fff7e8"
    });
  }
}

function spawnScoreBurst() {
  if (prefersReducedMotion) return;

  for (let i = 0; i < 16; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 150;
    particles.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.46 + Math.random() * 0.34,
      size: 3 + Math.random() * 5,
      color: i % 2 === 0 ? "#6de1a6" : "#f5c45b"
    });
  }
}

function updatePlaying(dt) {
  const difficulty = difficultyForScore(score);
  const speed = difficulty.speed;
  player.vy += GRAVITY * dt;
  player.y += player.vy * dt;
  player.rotation = Math.max(-0.55, Math.min(0.9, player.vy / 620));

  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnPipe();
    spawnTimer += difficulty.interval;
  }

  pipes.forEach((pipe) => {
    pipe.previousX = pipe.x;
    pipe.x -= speed * dt;

    if (!pipe.scored && pipe.x + pipe.width < player.x - PLAYER_RADIUS) {
      pipe.scored = true;
      score += 1;
      let statusText = "Nice";
      if (score > best) {
        best = score;
        writeBest(best);
        statusText = "New best";
      }
      if (score > 0 && score % 5 === 0) {
        statusText = "Pace up";
        addFloater("PACE UP", player.x + 68, player.y + 24, "#f5c45b", 22);
        playTone(960, 0.05, "square", 0.035);
      }
      spawnScoreBurst();
      addFloater("+1", player.x + 34, player.y - 20, "#6de1a6", 32);
      playTone(740 + Math.min(score, 12) * 18, 0.07, "sine", 0.055);
      updateHud(statusText);
    }
  });

  pipes = pipes.filter((pipe) => pipe.x + pipe.width > -40);
  groundOffset = (groundOffset + speed * dt) % 56;

  if (player.y - PLAYER_RADIUS < 0) {
    player.y = PLAYER_RADIUS;
    player.vy = Math.max(0, player.vy);
  }

  if (player.y + PLAYER_RADIUS > WORLD_HEIGHT - GROUND_HEIGHT) {
    endRun();
    return;
  }

  if (pipes.some(hitPipe)) {
    endRun();
  }
}

function hitPipe(pipe) {
  const birdLeft = player.x - PLAYER_RADIUS + 4;
  const birdRight = player.x + PLAYER_RADIUS - 4;
  const birdTop = player.y - PLAYER_RADIUS + 4;
  const birdBottom = player.y + PLAYER_RADIUS - 4;
  const previousX = pipe.previousX ?? pipe.x;
  const pipeLeft = Math.min(previousX, pipe.x);
  const pipeRight = Math.max(previousX + pipe.width, pipe.x + pipe.width);
  const gapTop = pipe.top;
  const gapBottom = pipe.top + pipe.gap;

  const overlapsX = birdRight > pipeLeft && birdLeft < pipeRight;
  if (!overlapsX) return false;

  return birdTop < gapTop || birdBottom > gapBottom;
}

function endRun() {
  if (state === "over") return;
  state = "over";
  shakeTime = prefersReducedMotion ? 0 : 0.28;
  shakePower = prefersReducedMotion ? 0 : 12;
  flashTime = prefersReducedMotion ? 0 : 0.18;
  playTone(170, 0.12, "sawtooth", 0.06);
  playTone(86, 0.18, "triangle", 0.045);
  updateHud(score > 0 ? "Run over" : "Try again");
  setMenu(true, score > 0 ? `Score ${score}` : "Try again", "Restart", score >= best && score > 0 ? "Best run" : `Best ${best}`);

  for (let i = 0; i < 22; i += 1) {
    if (prefersReducedMotion) break;

    particles.push({
      x: player.x,
      y: player.y,
      vx: -110 + Math.random() * 220,
      vy: -160 + Math.random() * 210,
      life: 0.55 + Math.random() * 0.42,
      size: 3 + Math.random() * 7,
      color: i % 3 === 0 ? "#ff6f4f" : "#f5c45b"
    });
  }
}

function updateParticles(dt) {
  particles.forEach((particle) => {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 620 * dt;
    particle.life -= dt;
  });
  particles = particles.filter((particle) => particle.life > 0);
}

function addFloater(text, x, y, color, size) {
  if (prefersReducedMotion) return;

  floaters.push({
    text,
    x,
    y,
    vy: -42,
    life: 0.72,
    color,
    size
  });
}

function updateFloaters(dt) {
  floaters.forEach((floater) => {
    floater.y += floater.vy * dt;
    floater.life -= dt;
  });
  floaters = floaters.filter((floater) => floater.life > 0);
}

function primeAudio() {
  try {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;
    audioContext ||= new AudioContextCtor();
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
  } catch {
    audioContext = null;
  }
}

function playTone(frequency, duration, type, gainValue) {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.03);
}

function resizeCanvas() {
  const rect = stage.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  const worldAspect = WORLD_WIDTH / WORLD_HEIGHT;
  const stageAspect = width / height;
  const portraitCrop = stageAspect < Math.min(1.2, worldAspect);
  const scale = portraitCrop ? height / WORLD_HEIGHT : Math.min(width / WORLD_WIDTH, height / WORLD_HEIGHT);
  const visibleWorldWidth = width / scale;
  const cameraX = portraitCrop
    ? Math.max(0, Math.min(WORLD_WIDTH - visibleWorldWidth, PLAYER_X - visibleWorldWidth * 0.28))
    : 0;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  viewport = {
    dpr,
    width,
    height,
    scale,
    offsetX: portraitCrop ? -cameraX * scale : Math.max(0, (width - WORLD_WIDTH * scale) / 2),
    offsetY: portraitCrop ? 0 : Math.max(0, (height - WORLD_HEIGHT * scale) / 2),
    cameraX,
    visibleWorldWidth
  };
}

function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0f1314";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const shake = !prefersReducedMotion && shakeTime > 0 ? Math.sin(shakeTime * 95) * shakePower : 0;
  ctx.setTransform(
    viewport.dpr * viewport.scale,
    0,
    0,
    viewport.dpr * viewport.scale,
    viewport.dpr * (viewport.offsetX + shake),
    viewport.dpr * (viewport.offsetY + shake * 0.36)
  );

  drawSky();
  pipes.forEach(drawPipe);
  drawGround();
  if (!prefersReducedMotion) drawParticles();
  drawPlayer();
  if (!prefersReducedMotion) {
    drawFloaters();
    drawFlash();
  }
}

function drawSky() {
  const sky = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
  sky.addColorStop(0, "#315173");
  sky.addColorStop(0.58, "#5f8790");
  sky.addColorStop(1, "#223230");
  ctx.fillStyle = sky;
  ctx.fillRect(-180, 0, WORLD_WIDTH + 360, WORLD_HEIGHT);

  ctx.fillStyle = "rgba(245, 196, 91, 0.88)";
  ctx.beginPath();
  ctx.arc(790, 92, 39, 0, Math.PI * 2);
  ctx.fill();

  drawCloud(138, 96, 0.8);
  drawCloud(485, 142, 1.05);
  drawCloud(730, 206, 0.72);

  drawHill("#244840", 0, 468, [
    [0, 442],
    [130, 390],
    [270, 430],
    [420, 378],
    [590, 448],
    [760, 406],
    [960, 440]
  ]);
  drawHill("#1e3532", 0, 492, [
    [0, 472],
    [170, 448],
    [330, 486],
    [510, 430],
    [690, 488],
    [865, 454],
    [960, 468]
  ]);
}

function drawCloud(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(255, 247, 232, 0.34)";
  ctx.beginPath();
  ctx.arc(0, 16, 23, 0, Math.PI * 2);
  ctx.arc(28, 4, 29, 0, Math.PI * 2);
  ctx.arc(64, 17, 24, 0, Math.PI * 2);
  ctx.rect(0, 15, 64, 25);
  ctx.fill();
  ctx.restore();
}

function drawHill(color, startX, baseY, points) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX, baseY);
  points.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.lineTo(WORLD_WIDTH, baseY);
  ctx.closePath();
  ctx.fill();
}

function drawPipe(pipe) {
  const bottomY = pipe.top + pipe.gap;
  const bottomHeight = WORLD_HEIGHT - GROUND_HEIGHT - bottomY;
  const approaching = pipe.x > PLAYER_X && pipe.x - PLAYER_X < PIPE_WARNING_DISTANCE && state === "playing";

  drawPipeSegment(pipe.x, 0, pipe.width, pipe.top, true, approaching);
  drawPipeSegment(pipe.x, bottomY, pipe.width, bottomHeight, false, approaching);
}

function drawPipeSegment(x, y, width, height, capAtBottom, approaching) {
  const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
  gradient.addColorStop(0, approaching ? "#289e78" : "#1d8f62");
  gradient.addColorStop(0.42, approaching ? "#8cf0ba" : "#6de1a6");
  gradient.addColorStop(1, "#146246");
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  ctx.fillRect(x + 10, y + 10, 8, Math.max(0, height - 20));

  ctx.strokeStyle = "rgba(7, 16, 13, 0.56)";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, width, height);

  const capY = capAtBottom ? y + height - 20 : y;
  ctx.fillStyle = approaching ? "#83e9ad" : "#5fd796";
  ctx.fillRect(x - 10, capY, width + 20, 24);
  ctx.strokeRect(x - 10, capY, width + 20, 24);
}

function drawGround() {
  const y = WORLD_HEIGHT - GROUND_HEIGHT;
  ctx.fillStyle = "#29372c";
  ctx.fillRect(-180, y, WORLD_WIDTH + 360, GROUND_HEIGHT);

  ctx.fillStyle = "#3c573c";
  for (let x = -224 - groundOffset; x < WORLD_WIDTH + 224; x += 56) {
    ctx.fillRect(x, y + 12, 38, 7);
  }

  ctx.fillStyle = "#1d261f";
  ctx.fillRect(-180, y + 44, WORLD_WIDTH + 360, GROUND_HEIGHT - 44);
}

function drawParticles() {
  particles.forEach((particle) => {
    ctx.globalAlpha = Math.max(0, Math.min(1, particle.life * 2.4));
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawPlayer() {
  const bob = !prefersReducedMotion && (state === "idle" || state === "paused") ? Math.sin(idleTime * 3.4) * 7 : 0;
  ctx.save();
  ctx.translate(player.x, player.y + bob);
  ctx.rotate(player.rotation);

  const bodyGradient = ctx.createRadialGradient(-7, -9, 4, 0, 0, PLAYER_RADIUS + 7);
  bodyGradient.addColorStop(0, "#fff7c4");
  bodyGradient.addColorStop(0.45, "#f5c45b");
  bodyGradient.addColorStop(1, "#ff8a4f");

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(7, 16, 13, 0.48)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#ff6f4f";
  ctx.beginPath();
  ctx.ellipse(-12, 5, 17, 8, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#101315";
  ctx.beginPath();
  ctx.arc(7, -7, 3.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff7e8";
  ctx.beginPath();
  ctx.arc(8, -8, 1.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f26f3e";
  ctx.beginPath();
  ctx.moveTo(18, -1);
  ctx.lineTo(34, 5);
  ctx.lineTo(18, 11);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawFloaters() {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  floaters.forEach((floater) => {
    ctx.globalAlpha = Math.max(0, Math.min(1, floater.life * 1.8));
    ctx.fillStyle = floater.color;
    ctx.font = `900 ${floater.size}px Inter, system-ui, sans-serif`;
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(7, 16, 13, 0.46)";
    ctx.strokeText(floater.text, floater.x, floater.y);
    ctx.fillText(floater.text, floater.x, floater.y);
  });
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawFlash() {
  if (flashTime <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(0.34, flashTime * 1.8);
  ctx.fillStyle = "#ff6f4f";
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  ctx.restore();
}

function tick(time) {
  const dt = Math.min(0.033, (time - (lastTime || time)) / 1000 || 0);
  lastTime = time;

  if (state === "playing") {
    updatePlaying(dt);
  }

  if (!prefersReducedMotion) {
    idleTime += dt;
  }
  if (!prefersReducedMotion && (state === "idle" || state === "paused")) {
    groundOffset = (groundOffset + 24 * dt) % 56;
  }
  if (!prefersReducedMotion && shakeTime > 0) {
    shakeTime = Math.max(0, shakeTime - dt);
    shakePower *= 0.9;
  }
  if (!prefersReducedMotion && flashTime > 0) {
    flashTime = Math.max(0, flashTime - dt);
  }
  if (!prefersReducedMotion) {
    updateParticles(dt);
    updateFloaters(dt);
  } else {
    particles = [];
    floaters = [];
    shakeTime = 0;
    flashTime = 0;
  }
  draw();
}

stage.addEventListener("pointerdown", (event) => {
  if (event.target === startButton) return;
  event.preventDefault();
  flap();
});

startButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  primeAudio();
  if (state === "paused") {
    togglePause();
    return;
  }
  startRun();
});

restartButton?.addEventListener("click", () => startRun());
pauseButton?.addEventListener("click", togglePause);
fullscreenButton?.addEventListener("click", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
    return;
  }
  document.documentElement.requestFullscreen?.();
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.key === "ArrowUp") {
    event.preventDefault();
    flap();
  }
  if (event.key.toLowerCase() === "p") {
    togglePause();
  }
  if (event.key.toLowerCase() === "r") {
    startRun();
  }
});

window.addEventListener("resize", resizeCanvas);

best = readBest();
resizeCanvas();
resetRun();
window.setInterval(() => tick(performance.now()), 1000 / 60);
draw();
