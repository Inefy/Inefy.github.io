(() => {
  "use strict";

  const DIFFICULTIES = {
    scout: { label: "Scout", rows: 9, cols: 9, mines: 10 },
    ranger: { label: "Ranger", rows: 16, cols: 16, mines: 40 },
    warden: { label: "Warden", rows: 16, cols: 24, mines: 72 }
  };

  const BEST_PREFIX = "inefy-minefield-best-";
  const DIFFICULTY_KEY = "inefy-minefield-difficulty";
  const LONG_PRESS_MS = 420;

  const boardEl = document.getElementById("mineBoard");
  const boardShell = document.querySelector(".board-shell");
  const gameMenu = document.getElementById("gameMenu");
  const menuKicker = document.getElementById("menuKicker");
  const menuTitle = document.getElementById("menuTitle");
  const menuMeta = document.getElementById("menuMeta");
  const startButton = document.getElementById("startButton");
  const newGameButton = document.getElementById("newGameButton");
  const flagModeButton = document.getElementById("flagModeButton");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const minesLeftValue = document.getElementById("minesLeftValue");
  const timeValue = document.getElementById("timeValue");
  const bestValue = document.getElementById("bestValue");
  const clearedValue = document.getElementById("clearedValue");
  const roundStatus = document.getElementById("roundStatus");
  const difficultyButtons = Array.from(document.querySelectorAll("[data-difficulty]"));

  let currentDifficulty = readDifficulty();
  let cells = [];
  let mineTotal = DIFFICULTIES[currentDifficulty].mines;
  let revealedCount = 0;
  let flagsUsed = 0;
  let state = "idle";
  let minesPlaced = false;
  let flagMode = false;
  let seconds = 0;
  let timerId = 0;
  let timerStartedAt = 0;
  let longPressTimer = 0;
  let suppressClickIndex = -1;

  function readDifficulty() {
    try {
      const stored = window.localStorage.getItem(DIFFICULTY_KEY);
      return DIFFICULTIES[stored] ? stored : "scout";
    } catch {
      return "scout";
    }
  }

  function writeDifficulty(key) {
    try {
      window.localStorage.setItem(DIFFICULTY_KEY, key);
    } catch {
      // Difficulty persistence is optional.
    }
  }

  function bestKey() {
    return `${BEST_PREFIX}${currentDifficulty}`;
  }

  function readBest() {
    try {
      const stored = window.localStorage.getItem(bestKey());
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
      window.localStorage.setItem(bestKey(), String(value));
    } catch {
      // Best time persistence is optional.
    }
  }

  function config() {
    return DIFFICULTIES[currentDifficulty];
  }

  function totalCells() {
    return config().rows * config().cols;
  }

  function createCells() {
    return Array.from({ length: totalCells() }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      wrongFlag: false,
      adjacent: 0
    }));
  }

  function rowOf(index) {
    return Math.floor(index / config().cols);
  }

  function colOf(index) {
    return index % config().cols;
  }

  function indexOf(row, col) {
    return row * config().cols + col;
  }

  function neighbors(index) {
    const row = rowOf(index);
    const col = colOf(index);
    const result = [];

    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
        if (rowOffset === 0 && colOffset === 0) {
          continue;
        }

        const nextRow = row + rowOffset;
        const nextCol = col + colOffset;
        if (nextRow >= 0 && nextRow < config().rows && nextCol >= 0 && nextCol < config().cols) {
          result.push(indexOf(nextRow, nextCol));
        }
      }
    }

    return result;
  }

  function placeMines(safeIndex) {
    const blocked = new Set([safeIndex, ...neighbors(safeIndex)]);
    const available = cells.map((_, index) => index).filter((index) => !blocked.has(index));
    const targetMines = Math.min(mineTotal, available.length);
    const picked = new Set();

    while (picked.size < targetMines) {
      const index = available[Math.floor(Math.random() * available.length)];
      picked.add(index);
    }

    picked.forEach((index) => {
      cells[index].mine = true;
    });

    calculateAdjacency();
    minesPlaced = true;
  }

  function calculateAdjacency() {
    cells.forEach((cell, index) => {
      cell.adjacent = cell.mine
        ? 0
        : neighbors(index).filter((neighborIndex) => cells[neighborIndex].mine).length;
    });
  }

  function startTimer() {
    if (timerId || state === "won" || state === "lost") {
      return;
    }

    timerStartedAt = Date.now() - seconds * 1000;
    timerId = window.setInterval(() => {
      seconds = Math.floor((Date.now() - timerStartedAt) / 1000);
      updateHud("Sweeping");
    }, 250);
  }

  function syncElapsedTime() {
    if (timerId && timerStartedAt) {
      seconds = Math.max(seconds, Math.floor((Date.now() - timerStartedAt) / 1000));
    }
  }

  function stopTimer() {
    syncElapsedTime();
    window.clearInterval(timerId);
    timerId = 0;
  }

  function formatTime(value) {
    if (value === null || value === undefined) {
      return "--";
    }

    if (value < 60) {
      return `${value}s`;
    }

    const minutes = Math.floor(value / 60);
    const remainingSeconds = value % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  function updateBestTime() {
    seconds = Math.max(1, seconds);
    const best = readBest();
    if (best === null || seconds < best) {
      writeBest(seconds);
    }
  }

  function minesLeft() {
    return mineTotal - flagsUsed;
  }

  function clearPercent() {
    const clearable = Math.max(1, cells.length - mineTotal);
    return Math.floor((revealedCount / clearable) * 100);
  }

  function updateHud(statusText) {
    minesLeftValue.textContent = String(minesLeft());
    timeValue.textContent = formatTime(seconds);
    bestValue.textContent = formatTime(readBest());
    clearedValue.textContent = `${clearPercent()}%`;
    roundStatus.textContent = statusText;
    document.body.dataset.gameState = state;
    document.body.dataset.flagMode = String(flagMode);
    flagModeButton.setAttribute("aria-pressed", String(flagMode));
  }

  function setActiveDifficultyButton() {
    difficultyButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.difficulty === currentDifficulty);
    });
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

  function difficultyMeta() {
    const active = config();
    return `${active.label} field / ${mineTotal} mines`;
  }

  function resetBoard(difficultyKey = currentDifficulty, showStartMenu = true) {
    stopTimer();
    currentDifficulty = DIFFICULTIES[difficultyKey] ? difficultyKey : "scout";
    writeDifficulty(currentDifficulty);
    mineTotal = config().mines;
    cells = createCells();
    revealedCount = 0;
    flagsUsed = 0;
    state = "idle";
    minesPlaced = false;
    seconds = 0;
    suppressClickIndex = -1;
    window.clearTimeout(longPressTimer);
    boardShell.classList.remove("is-cleared");
    setActiveDifficultyButton();
    renderBoard();

    if (showStartMenu) {
      showMenu({
        kicker: "Logic field",
        title: "Minefield Sweep",
        meta: difficultyMeta(),
        button: "Start Field"
      });
    } else {
      hideMenu();
    }

    updateHud("Ready");
  }

  function startField() {
    if (state === "won" || state === "lost") {
      resetBoard(currentDifficulty, false);
    }

    hideMenu();
    updateHud(state === "idle" ? "Ready" : "Sweeping");
    focusCell(0);
  }

  function revealCell(index) {
    const cell = cells[index];
    if (!cell || state === "won" || state === "lost" || cell.flagged) {
      return false;
    }

    if (cell.revealed) {
      return chordCell(index);
    }

    if (!minesPlaced) {
      placeMines(index);
    }

    if (state === "idle") {
      state = "playing";
      startTimer();
    }

    if (cell.mine) {
      cell.revealed = true;
      loseField(index);
      return true;
    }

    floodReveal(index);
    if (revealedCount >= cells.length - mineTotal) {
      winField();
    } else {
      renderBoard();
      updateHud("Sweeping");
      focusCell(index);
    }
    return true;
  }

  function floodReveal(startIndex) {
    const queue = [startIndex];
    const queued = new Set(queue);

    while (queue.length > 0) {
      const index = queue.shift();
      const cell = cells[index];
      if (!cell || cell.revealed || cell.flagged || cell.mine) {
        continue;
      }

      cell.revealed = true;
      revealedCount += 1;

      if (cell.adjacent === 0) {
        neighbors(index).forEach((neighborIndex) => {
          if (!queued.has(neighborIndex)) {
            queued.add(neighborIndex);
            queue.push(neighborIndex);
          }
        });
      }
    }
  }

  function chordCell(index) {
    const cell = cells[index];
    if (!cell?.revealed || cell.adjacent === 0 || state !== "playing") {
      return false;
    }

    const nearby = neighbors(index);
    const flagged = nearby.filter((neighborIndex) => cells[neighborIndex].flagged).length;
    if (flagged !== cell.adjacent) {
      updateHud("Check flags");
      return false;
    }

    let changed = false;
    for (const neighborIndex of nearby) {
      const neighbor = cells[neighborIndex];
      if (!neighbor.revealed && !neighbor.flagged) {
        changed = revealCell(neighborIndex) || changed;
        if (state === "lost") {
          return true;
        }
      }
    }

    if (changed && state === "playing") {
      renderBoard();
      updateHud("Sweeping");
      focusCell(index);
    }
    return changed;
  }

  function toggleFlag(index) {
    const cell = cells[index];
    if (!cell || cell.revealed || state === "won" || state === "lost") {
      return false;
    }

    if (!cell.flagged && flagsUsed >= mineTotal) {
      updateHud("No flags left");
      return false;
    }

    cell.flagged = !cell.flagged;
    flagsUsed += cell.flagged ? 1 : -1;
    renderBoard();
    updateHud(cell.flagged ? "Flagged" : "Unflagged");
    focusCell(index);
    return true;
  }

  function winField() {
    state = "won";
    stopTimer();
    cells.forEach((cell) => {
      if (cell.mine && !cell.flagged) {
        cell.flagged = true;
      }
    });
    flagsUsed = mineTotal;
    updateBestTime();
    boardShell.classList.remove("is-cleared");
    void boardShell.offsetWidth;
    boardShell.classList.add("is-cleared");
    renderBoard();
    showMenu({
      kicker: "Field clear",
      title: "Cleared",
      meta: `${config().label} / ${formatTime(seconds)}`,
      button: "New Field"
    });
    updateHud("Cleared");
  }

  function loseField(hitIndex) {
    state = "lost";
    stopTimer();
    cells.forEach((cell, index) => {
      if (cell.mine) {
        cell.revealed = true;
      }
      if (cell.flagged && !cell.mine) {
        cell.wrongFlag = true;
      }
      if (index === hitIndex) {
        cell.hit = true;
      }
    });
    renderBoard();
    showMenu({
      kicker: "Signal lost",
      title: "Mine Hit",
      meta: difficultyMeta(),
      button: "New Field"
    });
    updateHud("Mine hit");
  }

  function cellLabel(cell, index) {
    const row = rowOf(index) + 1;
    const col = colOf(index) + 1;

    if (cell.wrongFlag) {
      return `Row ${row}, column ${col}, wrong flag`;
    }

    if (cell.flagged && !cell.revealed) {
      return `Row ${row}, column ${col}, flagged`;
    }

    if (!cell.revealed) {
      return `Row ${row}, column ${col}, hidden`;
    }

    if (cell.mine) {
      return `Row ${row}, column ${col}, mine`;
    }

    if (cell.adjacent === 0) {
      return `Row ${row}, column ${col}, clear`;
    }

    return `Row ${row}, column ${col}, ${cell.adjacent} nearby`;
  }

  function renderBoard() {
    const active = config();
    const fragment = document.createDocumentFragment();

    boardShell.style.setProperty("--cols", active.cols);
    boardShell.style.setProperty("--rows", active.rows);
    boardEl.style.setProperty("--cols", active.cols);
    boardEl.style.setProperty("--rows", active.rows);
    boardEl.setAttribute("aria-rowcount", String(active.rows));
    boardEl.setAttribute("aria-colcount", String(active.cols));
    boardEl.setAttribute("aria-label", `${active.label} minefield, ${active.rows} by ${active.cols}, ${mineTotal} mines`);
    boardEl.textContent = "";

    cells.forEach((cell, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cell";
      button.dataset.index = String(index);
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-label", cellLabel(cell, index));

      if (cell.revealed) {
        button.classList.add("revealed");
      }

      if (cell.wrongFlag) {
        button.classList.add("wrong-flag");
        button.textContent = "!";
      } else if (cell.flagged && !cell.revealed) {
        button.classList.add("flagged");
      } else if (cell.mine && cell.revealed) {
        button.classList.add(cell.hit ? "mine-hit" : "mine-revealed");
      } else if (cell.revealed && cell.adjacent > 0) {
        button.classList.add(`n${cell.adjacent}`);
        button.textContent = String(cell.adjacent);
      } else if (cell.revealed) {
        button.classList.add("empty");
      }

      button.addEventListener("click", (event) => {
        event.preventDefault();
        if (suppressClickIndex === index) {
          suppressClickIndex = -1;
          return;
        }
        handlePrimaryAction(index);
      });

      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        toggleFlag(index);
      });

      button.addEventListener("pointerdown", (event) => {
        if (event.pointerType !== "mouse") {
          window.clearTimeout(longPressTimer);
          longPressTimer = window.setTimeout(() => {
            suppressClickIndex = index;
            toggleFlag(index);
          }, LONG_PRESS_MS);
        }
      });

      button.addEventListener("pointerup", () => {
        window.clearTimeout(longPressTimer);
      });

      button.addEventListener("pointercancel", () => {
        window.clearTimeout(longPressTimer);
      });

      fragment.appendChild(button);
    });

    boardEl.appendChild(fragment);
  }

  function handlePrimaryAction(index) {
    if (!gameMenu.classList.contains("is-hidden") && state !== "won" && state !== "lost") {
      hideMenu();
    }

    if (flagMode) {
      toggleFlag(index);
    } else {
      revealCell(index);
    }
  }

  function focusCell(index) {
    const button = boardEl.querySelector(`[data-index="${index}"]`);
    button?.focus({ preventScroll: true });
  }

  function focusByOffset(index, rowOffset, colOffset) {
    const row = Math.max(0, Math.min(config().rows - 1, rowOf(index) + rowOffset));
    const col = Math.max(0, Math.min(config().cols - 1, colOf(index) + colOffset));
    focusCell(indexOf(row, col));
  }

  function handleBoardKeyDown(event) {
    const target = event.target.closest?.(".cell");
    if (!target) {
      return;
    }

    const index = Number(target.dataset.index);
    const key = event.key.toLowerCase();

    if (key === "arrowup") {
      event.preventDefault();
      focusByOffset(index, -1, 0);
    } else if (key === "arrowright") {
      event.preventDefault();
      focusByOffset(index, 0, 1);
    } else if (key === "arrowdown") {
      event.preventDefault();
      focusByOffset(index, 1, 0);
    } else if (key === "arrowleft") {
      event.preventDefault();
      focusByOffset(index, 0, -1);
    } else if (key === "enter" || key === " ") {
      event.preventDefault();
      handlePrimaryAction(index);
    } else if (key === "f") {
      event.preventDefault();
      toggleFlag(index);
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

  function setDifficulty(key) {
    resetBoard(key, true);
  }

  function debugSetMines(mineIndices, options = {}) {
    if (options.difficulty && DIFFICULTIES[options.difficulty]) {
      currentDifficulty = options.difficulty;
      writeDifficulty(currentDifficulty);
    }

    cells = createCells();
    mineTotal = Math.min(mineIndices.length, cells.length);
    mineIndices.slice(0, mineTotal).forEach((index) => {
      if (cells[index]) {
        cells[index].mine = true;
      }
    });
    calculateAdjacency();
    revealedCount = 0;
    flagsUsed = 0;
    seconds = Math.max(0, Number(options.seconds) || 0);
    minesPlaced = true;
    state = options.state || "playing";
    boardShell.classList.remove("is-cleared");
    hideMenu();
    setActiveDifficultyButton();
    renderBoard();
    updateHud(options.status || "Debug field");
  }

  function getState() {
    return {
      difficulty: currentDifficulty,
      rows: config().rows,
      cols: config().cols,
      mines: mineTotal,
      flagsUsed,
      minesLeft: minesLeft(),
      revealedCount,
      state,
      minesPlaced,
      flagMode,
      seconds,
      best: readBest(),
      cells: cells.map((cell) => ({
        mine: cell.mine,
        revealed: cell.revealed,
        flagged: cell.flagged,
        adjacent: cell.adjacent,
        wrongFlag: cell.wrongFlag || false
      }))
    };
  }

  function bindEvents() {
    startButton.addEventListener("click", startField);
    newGameButton.addEventListener("click", () => resetBoard(currentDifficulty, false));
    flagModeButton.addEventListener("click", () => {
      flagMode = !flagMode;
      updateHud(flagMode ? "Flag mode" : "Sweep mode");
      focusCell(0);
    });
    fullscreenButton.addEventListener("click", toggleFullscreen);
    boardEl.addEventListener("keydown", handleBoardKeyDown);
    boardEl.addEventListener("contextmenu", (event) => event.preventDefault());
    difficultyButtons.forEach((button) => {
      button.addEventListener("click", () => setDifficulty(button.dataset.difficulty));
    });
  }

  window.minefieldSweep = {
    newGame: resetBoard,
    start: startField,
    setDifficulty,
    reveal: revealCell,
    flag: toggleFlag,
    chord: chordCell,
    debugSetMines,
    getState
  };

  resetBoard(currentDifficulty, true);
  bindEvents();
})();
