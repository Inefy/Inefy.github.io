(() => {
  "use strict";

  const WORLD_WIDTH = 960;
  const WORLD_HEIGHT = 600;
  const BEST_KEY = "inefy-asteroid-drift-best";
  const SHIP_RADIUS = 15;
  const MAX_SPEED = 430;
  const THRUST = 360;
  const TURN_SPEED = 4.4;
  const DRAG = 0.992;
  const BULLET_SPEED = 560;
  const BULLET_LIFE = 0.88;
  const FIRE_COOLDOWN = 0.16;
  const SHIELD_DRAIN = 42;
  const SHIELD_RECHARGE = 18;
  const START_LIVES = 3;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const gameMenu = document.getElementById("gameMenu");
  const menuKicker = document.getElementById("menuKicker");
  const menuTitle = document.getElementById("menuTitle");
  const menuMeta = document.getElementById("menuMeta");
  const startButton = document.getElementById("startButton");
  const restartButton = document.getElementById("restartButton");
  const pauseButton = document.getElementById("pauseButton");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const scoreValue = document.getElementById("scoreValue");
  const bestValue = document.getElementById("bestValue");
  const waveValue = document.getElementById("waveValue");
  const livesValue = document.getElementById("livesValue");
  const shieldValue = document.getElementById("shieldValue");
  const roundStatus = document.getElementById("roundStatus");
  const fieldName = document.getElementById("fieldName");
  const waveProgressFill = document.getElementById("waveProgressFill");
  const waveProgress = document.querySelector(".wave-progress");
  const chargeFill = document.getElementById("chargeFill");
  const chargeMeter = document.querySelector(".charge-meter");
  const chargeValue = document.getElementById("chargeValue");

  const keys = new Set();
  const touch = {
    left: false,
    right: false,
    thrust: false,
    fire: false,
    shield: false
  };

  let state = "menu";
  let score = 0;
  let wave = 1;
  let lives = START_LIVES;
  let startingAsteroids = 0;
  let startingAsteroidWork = 0;
  let fireTimer = 0;
  let shield = 100;
  let shieldActive = false;
  let respawnTimer = 0;
  let waveTimer = 0;
  let lastTime = 0;
  let animationFrame = 0;
  let ship = createShip();
  let bullets = [];
  let asteroids = [];
  let particles = [];
  let stars = [];
  let backgroundPhase = 0;
  let prefersReducedMotion = reducedMotionQuery.matches;

  function syncMotionPreference(event = reducedMotionQuery) {
    prefersReducedMotion = event.matches;

    if (prefersReducedMotion) {
      particles = [];
      backgroundPhase = 0;
    }
  }

  if (reducedMotionQuery.addEventListener) {
    reducedMotionQuery.addEventListener("change", syncMotionPreference);
  } else {
    reducedMotionQuery.addListener(syncMotionPreference);
  }

  function createShip() {
    return {
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 2,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      invulnerable: 2.2,
      thrusting: false
    };
  }

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function readBest() {
    try {
      const stored = window.localStorage.getItem(BEST_KEY);
      const value = Number(stored);
      return Number.isFinite(value) && value > 0 ? value : 0;
    } catch {
      return 0;
    }
  }

  function writeBest(value) {
    try {
      window.localStorage.setItem(BEST_KEY, String(value));
    } catch {
      // Best score persistence is optional.
    }
  }

  function updateBest() {
    const best = readBest();
    if (score > best) {
      writeBest(score);
    }
  }

  function clearInputState() {
    keys.clear();
    Object.keys(touch).forEach((control) => {
      touch[control] = false;
    });
  }

  function asteroidWork(size) {
    if (size >= 3) {
      return 7;
    }
    if (size === 2) {
      return 3;
    }
    return 1;
  }

  function remainingAsteroidWork() {
    return asteroids.reduce((total, asteroid) => total + asteroidWork(asteroid.size), 0);
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

  function fieldLabel() {
    if (wave >= 7) {
      return "Deep belt";
    }
    if (wave >= 4) {
      return "Broken orbit";
    }
    return "Outer belt";
  }

  function updateHud(status = roundStatus.textContent || "Ready") {
    const progress = startingAsteroidWork > 0 ? clamp(Math.round((1 - remainingAsteroidWork() / startingAsteroidWork) * 100), 0, 100) : 0;
    const charge = Math.round(clamp((FIRE_COOLDOWN - fireTimer) / FIRE_COOLDOWN, 0, 1) * 100);

    scoreValue.textContent = String(score);
    bestValue.textContent = String(Math.max(readBest(), score));
    waveValue.textContent = String(wave);
    livesValue.textContent = String(lives);
    shieldValue.textContent = `${Math.round(shield)}%`;
    roundStatus.textContent = status;
    fieldName.textContent = fieldLabel();
    waveProgressFill.style.width = `${progress}%`;
    waveProgress.setAttribute("aria-valuenow", String(progress));
    chargeFill.style.width = `${charge}%`;
    chargeMeter.setAttribute("aria-valuenow", String(charge));
    chargeValue.textContent = charge >= 100 ? "Ready" : `${charge}%`;
    document.body.dataset.gameState = state;
    document.body.dataset.shield = String(shieldActive);
    pauseButton.textContent = state === "paused" ? "Resume" : "Pause";
  }

  function buildStars() {
    stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * WORLD_HEIGHT,
      size: randomRange(0.8, 2.3),
      alpha: randomRange(0.22, 0.78),
      drift: randomRange(0.08, 0.32)
    }));
  }

  function asteroidShape(size) {
    const points = 11 + Math.floor(Math.random() * 4);
    return Array.from({ length: points }, (_, index) => {
      const angle = (Math.PI * 2 * index) / points;
      return {
        angle,
        radius: randomRange(0.72, 1.18) * size
      };
    });
  }

  function createAsteroid(size = 3, x, y, speedBoost = 1) {
    const radius = size === 3 ? 48 : size === 2 ? 30 : 18;
    let spawnX = x;
    let spawnY = y;

    if (spawnX === undefined || spawnY === undefined) {
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) {
        spawnX = randomRange(0, WORLD_WIDTH);
        spawnY = -radius;
      } else if (edge === 1) {
        spawnX = WORLD_WIDTH + radius;
        spawnY = randomRange(0, WORLD_HEIGHT);
      } else if (edge === 2) {
        spawnX = randomRange(0, WORLD_WIDTH);
        spawnY = WORLD_HEIGHT + radius;
      } else {
        spawnX = -radius;
        spawnY = randomRange(0, WORLD_HEIGHT);
      }
    }

    const targetAngle = Math.atan2(WORLD_HEIGHT / 2 - spawnY, WORLD_WIDTH / 2 - spawnX) + randomRange(-0.8, 0.8);
    const speed = randomRange(40, 92 + wave * 8) * speedBoost;

    return {
      x: spawnX,
      y: spawnY,
      vx: Math.cos(targetAngle) * speed,
      vy: Math.sin(targetAngle) * speed,
      radius,
      size,
      angle: randomRange(0, Math.PI * 2),
      spin: randomRange(-1.3, 1.3),
      shape: asteroidShape(radius)
    };
  }

  function startWave(nextWave = wave) {
    wave = nextWave;
    asteroids = [];
    bullets = [];
    particles = [];
    fireTimer = 0;
    waveTimer = 0;
    startingAsteroids = 4 + Math.min(7, wave);
    startingAsteroidWork = 0;

    for (let i = 0; i < startingAsteroids; i += 1) {
      const asteroid = createAsteroid(3);
      asteroids.push(asteroid);
      startingAsteroidWork += asteroidWork(asteroid.size);
    }

    updateHud(`Wave ${wave}`);
  }

  function resetGame(showStart = false) {
    score = 0;
    wave = 1;
    lives = START_LIVES;
    shield = 100;
    shieldActive = false;
    respawnTimer = 0;
    clearInputState();
    ship = createShip();
    buildStars();
    startWave(1);
    state = showStart ? "menu" : "playing";
    if (showStart) {
      showMenu({
        kicker: "Vector arcade",
        title: "Asteroid Drift",
        meta: "Outer belt signal locked.",
        button: "Launch Ship"
      });
      updateHud("Ready");
    } else {
      hideMenu();
      updateHud("Drifting");
    }
  }

  function beginGame() {
    if (state === "over") {
      resetGame(false);
      return;
    }

    if (state === "paused") {
      state = "playing";
      clearInputState();
      hideMenu();
      updateHud("Drifting");
      return;
    }

    state = "playing";
    ship = createShip();
    ship.invulnerable = 3;
    clearInputState();
    hideMenu();
    updateHud("Drifting");
  }

  function togglePause() {
    if (state === "menu" || state === "over") {
      return;
    }

    if (state === "paused") {
      state = "playing";
      clearInputState();
      hideMenu();
      updateHud("Drifting");
    } else {
      state = "paused";
      clearInputState();
      showMenu({
        kicker: `Wave ${wave}`,
        title: "Paused",
        meta: `${score} points / best ${Math.max(readBest(), score)}`,
        button: "Resume"
      });
      updateHud("Paused");
    }
  }

  function wrapObject(object, margin = 0) {
    if (object.x < -margin) {
      object.x = WORLD_WIDTH + margin;
    } else if (object.x > WORLD_WIDTH + margin) {
      object.x = -margin;
    }

    if (object.y < -margin) {
      object.y = WORLD_HEIGHT + margin;
    } else if (object.y > WORLD_HEIGHT + margin) {
      object.y = -margin;
    }
  }

  function limitShipSpeed() {
    const speed = Math.hypot(ship.vx, ship.vy);
    if (speed > MAX_SPEED) {
      ship.vx = (ship.vx / speed) * MAX_SPEED;
      ship.vy = (ship.vy / speed) * MAX_SPEED;
    }
  }

  function fireBullet() {
    if (fireTimer > 0 || state !== "playing" || respawnTimer > 0) {
      return false;
    }

    const noseX = ship.x + Math.cos(ship.angle) * 20;
    const noseY = ship.y + Math.sin(ship.angle) * 20;
    bullets.push({
      x: noseX,
      y: noseY,
      vx: ship.vx + Math.cos(ship.angle) * BULLET_SPEED,
      vy: ship.vy + Math.sin(ship.angle) * BULLET_SPEED,
      life: BULLET_LIFE,
      radius: 3
    });
    fireTimer = FIRE_COOLDOWN;
    spawnParticles(noseX, noseY, "#f5c45b", 6, 120);
    return true;
  }

  function spawnParticles(x, y, color, count = 14, force = 150) {
    if (prefersReducedMotion) {
      return;
    }

    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = force * (0.2 + Math.random() * 0.9);
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: randomRange(0.34, 0.76),
        maxLife: 0.76,
        size: randomRange(1.8, 4.6),
        color
      });
    }
  }

  function splitAsteroid(asteroid) {
    const points = asteroid.size === 3 ? 60 : asteroid.size === 2 ? 95 : 150;
    score += points;
    spawnParticles(asteroid.x, asteroid.y, asteroid.size === 1 ? "#f5c45b" : "#68b7ff", 18, 160);

    if (asteroid.size > 1) {
      const nextSize = asteroid.size - 1;
      asteroids.push(createAsteroid(nextSize, asteroid.x, asteroid.y, 1.18));
      asteroids.push(createAsteroid(nextSize, asteroid.x, asteroid.y, 1.18));
    }
  }

  function hitShip() {
    if (ship.invulnerable > 0 || respawnTimer > 0 || shieldActive) {
      return;
    }

    lives -= 1;
    spawnParticles(ship.x, ship.y, "#ff766a", 34, 220);
    if (lives <= 0) {
      state = "over";
      updateBest();
      showMenu({
        kicker: "Signal lost",
        title: "Run Over",
        meta: `${score} points / wave ${wave}`,
        button: "New Run"
      });
      updateHud("Run over");
      return;
    }

    ship = createShip();
    respawnTimer = 1.5;
    updateHud("Ship restored");
  }

  function controlActive(name) {
    if (name === "left") {
      return keys.has("arrowleft") || keys.has("a") || touch.left;
    }
    if (name === "right") {
      return keys.has("arrowright") || keys.has("d") || touch.right;
    }
    if (name === "thrust") {
      return keys.has("arrowup") || keys.has("w") || touch.thrust;
    }
    if (name === "fire") {
      return keys.has(" ") || keys.has("enter") || touch.fire;
    }
    if (name === "shield") {
      return keys.has("shift") || keys.has("s") || touch.shield;
    }
    return false;
  }

  function updateShip(dt) {
    if (respawnTimer > 0) {
      respawnTimer -= dt;
      ship.invulnerable = Math.max(ship.invulnerable, respawnTimer);
      return;
    }

    if (controlActive("left")) {
      ship.angle -= TURN_SPEED * dt;
    }
    if (controlActive("right")) {
      ship.angle += TURN_SPEED * dt;
    }

    ship.thrusting = controlActive("thrust");
    if (ship.thrusting) {
      ship.vx += Math.cos(ship.angle) * THRUST * dt;
      ship.vy += Math.sin(ship.angle) * THRUST * dt;
      spawnParticles(ship.x - Math.cos(ship.angle) * 17, ship.y - Math.sin(ship.angle) * 17, "#58d7e5", 2, 70);
    }

    shieldActive = controlActive("shield") && shield > 0 && state === "playing";
    if (shieldActive) {
      shield = Math.max(0, shield - SHIELD_DRAIN * dt);
    } else {
      shield = Math.min(100, shield + SHIELD_RECHARGE * dt);
    }

    ship.vx *= Math.pow(DRAG, dt * 60);
    ship.vy *= Math.pow(DRAG, dt * 60);
    limitShipSpeed();
    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;
    wrapObject(ship, SHIP_RADIUS);
    ship.invulnerable = Math.max(0, ship.invulnerable - dt);
  }

  function updateBullets(dt) {
    if (controlActive("fire")) {
      fireBullet();
    }

    fireTimer = Math.max(0, fireTimer - dt);
    bullets.forEach((bullet) => {
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      bullet.life -= dt;
      wrapObject(bullet, bullet.radius);
    });
    bullets = bullets.filter((bullet) => bullet.life > 0);
  }

  function updateAsteroids(dt) {
    asteroids.forEach((asteroid) => {
      asteroid.x += asteroid.vx * dt;
      asteroid.y += asteroid.vy * dt;
      asteroid.angle += asteroid.spin * dt;
      wrapObject(asteroid, asteroid.radius);
    });
  }

  function updateParticles(dt) {
    particles.forEach((particle) => {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= Math.pow(0.92, dt * 60);
      particle.vy *= Math.pow(0.92, dt * 60);
    });
    particles = particles.filter((particle) => particle.life > 0);
  }

  function handleCollisions() {
    for (let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
      const bullet = bullets[bulletIndex];
      let hitIndex = -1;
      for (let asteroidIndex = 0; asteroidIndex < asteroids.length; asteroidIndex += 1) {
        const asteroid = asteroids[asteroidIndex];
        if (distance(bullet, asteroid) < bullet.radius + asteroid.radius * 0.86) {
          hitIndex = asteroidIndex;
          break;
        }
      }

      if (hitIndex >= 0) {
        const asteroid = asteroids.splice(hitIndex, 1)[0];
        bullets.splice(bulletIndex, 1);
        splitAsteroid(asteroid);
      }
    }

    if (state !== "playing" || respawnTimer > 0) {
      return;
    }

    for (const asteroid of asteroids) {
      if (distance(ship, asteroid) < SHIP_RADIUS + asteroid.radius * 0.8) {
        if (shieldActive) {
          shield = Math.max(0, shield - 24);
          spawnParticles(asteroid.x, asteroid.y, "#6de1a6", 16, 150);
          const pushX = asteroid.x - ship.x;
          const pushY = asteroid.y - ship.y;
          const pushDistance = Math.hypot(pushX, pushY);
          const normalX = pushDistance > 0.001 ? pushX / pushDistance : Math.cos(ship.angle + Math.PI);
          const normalY = pushDistance > 0.001 ? pushY / pushDistance : Math.sin(ship.angle + Math.PI);
          asteroid.x += normalX * 10;
          asteroid.y += normalY * 10;
          asteroid.vx += normalX * 220;
          asteroid.vy += normalY * 220;
        } else {
          hitShip();
        }
        break;
      }
    }
  }

  function updateWave(dt) {
    if (state !== "playing") {
      return null;
    }

    if (asteroids.length === 0) {
      waveTimer += dt;
      if (waveTimer > 1.2) {
        wave += 1;
        ship.invulnerable = Math.max(ship.invulnerable, 1.2);
        startWave(wave);
        return `Wave ${wave}`;
      } else {
        return "Wave clear";
      }
    }
    return null;
  }

  function update(dt) {
    if (!prefersReducedMotion) {
      backgroundPhase += dt;
    } else {
      particles = [];
      backgroundPhase = 0;
    }
    if (state !== "playing") {
      if (!prefersReducedMotion) {
        updateParticles(dt);
      }
      return;
    }

    updateShip(dt);
    updateBullets(dt);
    updateAsteroids(dt);
    if (!prefersReducedMotion) {
      updateParticles(dt);
    }
    handleCollisions();
    if (state !== "playing") {
      updateBest();
      return;
    }
    const waveStatus = updateWave(dt);
    updateBest();
    updateHud(waveStatus || (ship.thrusting ? "Thrusting" : shieldActive ? "Shielding" : "Drifting"));
  }

  function drawBackground() {
    const gradient = ctx.createRadialGradient(WORLD_WIDTH * 0.5, WORLD_HEIGHT * 0.44, 80, WORLD_WIDTH * 0.5, WORLD_HEIGHT * 0.44, WORLD_WIDTH * 0.78);
    gradient.addColorStop(0, "#0d1b2d");
    gradient.addColorStop(0.52, "#08101c");
    gradient.addColorStop(1, "#03060c");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    ctx.save();
    ctx.globalAlpha = 0.18;
    const beltGradient = ctx.createLinearGradient(0, WORLD_HEIGHT * 0.15, WORLD_WIDTH, WORLD_HEIGHT * 0.92);
    beltGradient.addColorStop(0, "rgba(88, 215, 229, 0)");
    beltGradient.addColorStop(0.42, "rgba(88, 215, 229, 0.18)");
    beltGradient.addColorStop(0.56, "rgba(255, 143, 198, 0.13)");
    beltGradient.addColorStop(1, "rgba(245, 196, 91, 0)");
    ctx.fillStyle = beltGradient;
    ctx.translate(0, prefersReducedMotion ? 0 : Math.sin(backgroundPhase * 0.35) * 10);
    ctx.rotate(-0.12);
    ctx.fillRect(-120, WORLD_HEIGHT * 0.38, WORLD_WIDTH + 240, 96);
    ctx.restore();

    ctx.save();
    stars.forEach((star) => {
      const x = prefersReducedMotion ? star.x : (star.x + backgroundPhase * star.drift * 18) % WORLD_WIDTH;
      const y = prefersReducedMotion ? star.y : (star.y + backgroundPhase * star.drift * 5) % WORLD_HEIGHT;
      ctx.globalAlpha = star.alpha;
      ctx.beginPath();
      ctx.arc(x, y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = star.size > 1.7 ? "#dff4ff" : "#89c8ff";
      ctx.fill();
    });
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = "#68b7ff";
    ctx.lineWidth = 1;
    for (let x = -WORLD_HEIGHT; x < WORLD_WIDTH; x += 54) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + WORLD_HEIGHT, WORLD_HEIGHT);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWrapped(drawFn, object, margin) {
    drawFn(object.x, object.y);
    if (object.x < margin) drawFn(object.x + WORLD_WIDTH, object.y);
    if (object.x > WORLD_WIDTH - margin) drawFn(object.x - WORLD_WIDTH, object.y);
    if (object.y < margin) drawFn(object.x, object.y + WORLD_HEIGHT);
    if (object.y > WORLD_HEIGHT - margin) drawFn(object.x, object.y - WORLD_HEIGHT);
  }

  function drawShipAt(x, y) {
    if (respawnTimer > 0) {
      return;
    }

    const blink = ship.invulnerable > 0 && Math.floor(ship.invulnerable * 10) % 2 === 0;
    if (blink) {
      return;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ship.angle + Math.PI / 2);

    const shipGlow = ctx.createRadialGradient(0, 0, 8, 0, 0, 42);
    shipGlow.addColorStop(0, "rgba(104, 183, 255, 0.24)");
    shipGlow.addColorStop(1, "rgba(104, 183, 255, 0)");
    ctx.fillStyle = shipGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fill();

    if (shieldActive || ship.invulnerable > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, shieldActive ? 28 : 24, 0, Math.PI * 2);
      ctx.strokeStyle = shieldActive ? "rgba(109, 225, 166, 0.72)" : "rgba(104, 183, 255, 0.34)";
      ctx.lineWidth = shieldActive ? 4 : 2;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(16, 18);
    ctx.lineTo(0, 10);
    ctx.lineTo(-16, 18);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, -22, 0, 20);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.48, "#68b7ff");
    gradient.addColorStop(1, "#ff8fc6");
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.78)";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (ship.thrusting) {
      ctx.beginPath();
      ctx.moveTo(-7, 18);
      ctx.lineTo(0, 34 + Math.random() * 8);
      ctx.lineTo(7, 18);
      ctx.closePath();
      const thrustGradient = ctx.createLinearGradient(0, 18, 0, 42);
      thrustGradient.addColorStop(0, "rgba(88, 215, 229, 0.92)");
      thrustGradient.addColorStop(0.46, "rgba(245, 196, 91, 0.9)");
      thrustGradient.addColorStop(1, "rgba(255, 143, 198, 0.2)");
      ctx.fillStyle = thrustGradient;
      ctx.fill();
    }

    ctx.restore();
  }

  function drawAsteroid(asteroid) {
    drawWrapped((x, y) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(asteroid.angle);
      ctx.beginPath();
      asteroid.shape.forEach((point, index) => {
        const px = Math.cos(point.angle) * point.radius;
        const py = Math.sin(point.angle) * point.radius;
        if (index === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      });
      ctx.closePath();
      const gradient = ctx.createRadialGradient(-asteroid.radius * 0.3, -asteroid.radius * 0.25, 4, 0, 0, asteroid.radius * 1.2);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.34)");
      gradient.addColorStop(0.36, "rgba(104, 183, 255, 0.18)");
      gradient.addColorStop(1, "rgba(255, 143, 198, 0.08)");
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.shadowBlur = asteroid.size === 1 ? 16 : 10;
      ctx.shadowColor = asteroid.size === 1 ? "rgba(245, 196, 91, 0.28)" : "rgba(104, 183, 255, 0.16)";
      ctx.strokeStyle = asteroid.size === 1 ? "rgba(245, 196, 91, 0.78)" : "rgba(190, 221, 255, 0.58)";
      ctx.lineWidth = asteroid.size === 3 ? 3 : 2;
      ctx.stroke();
      ctx.restore();
    }, asteroid, asteroid.radius);
  }

  function drawBullets() {
    bullets.forEach((bullet) => {
      drawWrapped((x, y) => {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(245, 196, 91, 0.56)";
        ctx.beginPath();
        ctx.arc(x, y, bullet.radius + 1, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245, 196, 91, 0.95)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, bullet.radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(245, 196, 91, 0.22)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }, bullet, 10);
    });
  }

  function drawParticles() {
    particles.forEach((particle) => {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 10;
      ctx.shadowColor = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
      ctx.restore();
    });
  }

  function render() {
    ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    drawBackground();
    asteroids.forEach(drawAsteroid);
    drawBullets();
    drawParticles();
    drawWrapped(drawShipAt, ship, 28);
  }

  function loop(timestamp) {
    const dt = Math.min(0.033, ((timestamp - lastTime) || 16.7) / 1000);
    lastTime = timestamp;
    update(dt);
    render();
    animationFrame = window.requestAnimationFrame(loop);
  }

  function resizeCanvas() {
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(WORLD_WIDTH * ratio);
    canvas.height = Math.round(WORLD_HEIGHT * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    render();
  }

  function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "arrowup", " ", "enter"].includes(key)) {
      event.preventDefault();
    }

    if ((key === " " || key === "enter") && state !== "playing") {
      beginGame();
      return;
    }

    if (key === "p" || key === "escape") {
      event.preventDefault();
      togglePause();
      return;
    }

    if (key === "r") {
      event.preventDefault();
      resetGame(false);
      return;
    }

    keys.add(key);
  }

  function handleKeyUp(event) {
    keys.delete(event.key.toLowerCase());
  }

  function bindTouchControls() {
    document.querySelectorAll("[data-control]").forEach((button) => {
      const control = button.dataset.control;
      const activate = (event) => {
        event.preventDefault();
        touch[control] = true;
        if (control === "fire") {
          fireBullet();
        }
      };
      const deactivate = (event) => {
        event.preventDefault();
        touch[control] = false;
      };
      button.addEventListener("pointerdown", activate);
      button.addEventListener("pointerup", deactivate);
      button.addEventListener("pointerleave", deactivate);
      button.addEventListener("pointercancel", deactivate);
    });
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
    startButton.addEventListener("click", beginGame);
    restartButton.addEventListener("click", () => resetGame(false));
    pauseButton.addEventListener("click", togglePause);
    fullscreenButton.addEventListener("click", toggleFullscreen);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", resizeCanvas);
    bindTouchControls();
  }

  function debugTick(seconds) {
    const frames = Math.ceil(seconds / 0.016);
    for (let i = 0; i < frames; i += 1) {
      update(0.016);
    }
    render();
  }

  function debugSpawnAsteroid(size = 3, x = ship.x + 120, y = ship.y) {
    const asteroid = createAsteroid(size, x, y, 0.6);
    asteroid.vx = -40;
    asteroid.vy = 0;
    asteroids.push(asteroid);
    startingAsteroids = Math.max(startingAsteroids, asteroids.length);
    startingAsteroidWork += asteroidWork(asteroid.size);
    updateHud("Debug rock");
    return asteroid;
  }

  function debugSetShip(x, y, vx = 0, vy = 0) {
    const next = typeof x === "object" && x !== null ? x : { x, y, vx, vy };
    ship.x = Number.isFinite(next.x) ? next.x : ship.x;
    ship.y = Number.isFinite(next.y) ? next.y : ship.y;
    ship.vx = Number.isFinite(next.vx) ? next.vx : 0;
    ship.vy = Number.isFinite(next.vy) ? next.vy : 0;
    ship.angle = Number.isFinite(next.angle) ? next.angle : ship.angle;
    ship.invulnerable = Number.isFinite(next.invulnerable) ? Math.max(0, next.invulnerable) : 0;
    respawnTimer = 0;
    updateHud("Debug ship");
  }

  function debugClearWave() {
    asteroids = [];
    const status = updateWave(2);
    updateHud(status || "Wave clear");
  }

  function getState() {
    return {
      state,
      score,
      best: readBest(),
      wave,
      lives,
      shield: Math.round(shield),
      shieldActive,
      asteroids: asteroids.length,
      bullets: bullets.length,
      particles: particles.length,
      ship: {
        x: ship.x,
        y: ship.y,
        vx: ship.vx,
        vy: ship.vy,
        angle: ship.angle,
        invulnerable: ship.invulnerable
      },
      charge: Math.round(clamp((FIRE_COOLDOWN - fireTimer) / FIRE_COOLDOWN, 0, 1) * 100)
    };
  }

  window.asteroidDrift = {
    start: beginGame,
    restart: resetGame,
    pause: togglePause,
    fire: fireBullet,
    debugTick,
    debugSpawnAsteroid,
    debugSetShip,
    debugClearWave,
    getState
  };

  resizeCanvas();
  bindEvents();
  resetGame(true);
  window.cancelAnimationFrame(animationFrame);
  animationFrame = window.requestAnimationFrame(loop);
})();
