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
  const pauseButton = document.getElementById("pauseButton");
  const flagModeButton = document.getElementById("flagModeButton");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const minesLeftValue = document.getElementById("minesLeftValue");
  const timeValue = document.getElementById("timeValue");
  const bestValue = document.getElementById("bestValue");
  const clearedValue = document.getElementById("clearedValue");
  const roundStatus = document.getElementById("roundStatus");
  const gameAnnouncement = document.getElementById("gameAnnouncement");
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
  let pausedFocusIndex = 0;
  let focusedCellIndex = 0;
  let announcementTimer = 0;

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

  function cellPosition(index) {
    return `row ${rowOf(index) + 1}, column ${colOf(index) + 1}`;
  }

  function normalizeCellIndex(index) {
    const value = Number(index);
    return Math.max(0, Math.min(cells.length - 1, Number.isFinite(value) ? value : 0));
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

  function announce(message) {
    if (!gameAnnouncement || !message) {
      return;
    }

    window.clearTimeout(announcementTimer);
    gameAnnouncement.textContent = "";
    announcementTimer = window.setTimeout(() => {
      gameAnnouncement.textContent = message;
    }, 20);
  }

  function cellAnnouncement(index, action) {
    const cell = cells[index];
    const position = cellPosition(index);

    if (!cell) {
      return "";
    }

    if (action === "flagged") {
      return `Flag placed at ${position}. ${minesLeft()} mines left.`;
    }

    if (action === "unflagged") {
      return `Flag removed at ${position}. ${minesLeft()} mines left.`;
    }

    if (cell.mine) {
      return `Mine revealed at ${position}. Field lost.`;
    }

    if (cell.adjacent === 0) {
      return `Cleared ${position}. Empty area revealed. ${clearPercent()} percent cleared.`;
    }

    return `Revealed ${position}. ${cell.adjacent} nearby ${cell.adjacent === 1 ? "mine" : "mines"}. ${clearPercent()} percent cleared.`;
  }

  function updateHud(statusText) {
    minesLeftValue.textContent = String(minesLeft());
    timeValue.textContent = formatTime(seconds);
    bestValue.textContent = formatTime(readBest());
    clearedValue.textContent = `${clearPercent()}%`;
    roundStatus.textContent = statusText;
    document.body.dataset.gameState = state;
    document.body.dataset.flagMode = String(flagMode);
    pauseButton.textContent = state === "paused" ? "Resume" : "Pause";
    pauseButton.disabled = state !== "playing" && state !== "paused";
    pauseButton.setAttribute("aria-pressed", state === "paused" ? "true" : "false");
    flagModeButton.textContent = flagMode ? "Flag Mode On" : "Flag Mode";
    flagModeButton.setAttribute("aria-pressed", String(flagMode));
    flagModeButton.setAttribute(
      "aria-label",
      flagMode
        ? "Flag mode on. Cell clicks place or remove flags."
        : "Flag mode off. Cell clicks reveal hidden cells."
    );
    flagModeButton.disabled = state === "paused";
  }

  function setActiveDifficultyButton() {
    difficultyButtons.forEach((button) => {
      const selected = button.dataset.difficulty === currentDifficulty;
      const details = DIFFICULTIES[button.dataset.difficulty];
      button.classList.toggle("active", selected);
      button.setAttribute("aria-checked", String(selected));
      button.setAttribute(
        "aria-label",
        `${details.label} difficulty, ${details.rows} by ${details.cols}, ${details.mines} mines${selected ? ", selected" : ""}`
      );
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
    pausedFocusIndex = 0;
    focusedCellIndex = 0;
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
    announce(`${config().label} field ready. ${config().rows} rows, ${config().cols} columns, ${mineTotal} mines.`);
  }

  function startField() {
    if (state === "won" || state === "lost") {
      resetBoard(currentDifficulty, false);
    }

    if (state === "paused") {
      resumeField();
      return;
    }

    hideMenu();
    updateHud(state === "idle" ? "Ready" : "Sweeping");
    focusCell(0);
    announce(`Focus moved to ${cellPosition(0)}. Use arrow keys to move, Enter or Space to reveal, and F to flag.`);
  }

  function pauseField() {
    if (state !== "playing") {
      return false;
    }

    const activeIndex = Number(document.activeElement?.dataset?.index);
    pausedFocusIndex = Number.isFinite(activeIndex) ? activeIndex : 0;
    stopTimer();
    state = "paused";
    window.clearTimeout(longPressTimer);
    showMenu({
      kicker: "Paused",
      title: "Minefield Paused",
      meta: `${config().label} / ${formatTime(seconds)}`,
      button: "Resume"
    });
    updateHud("Paused");
    announce(`Paused at ${formatTime(seconds)}.`);
    return true;
  }

  function resumeField() {
    if (state !== "paused") {
      return false;
    }

    state = "playing";
    hideMenu();
    startTimer();
    updateHud("Sweeping");
    focusCell(pausedFocusIndex);
    announce(`Resumed. Focus returned to ${cellPosition(pausedFocusIndex)}.`);
    return true;
  }

  function togglePause() {
    return state === "paused" ? resumeField() : pauseField();
  }

  function revealCell(index) {
    const cell = cells[index];
    if (!cell || state === "won" || state === "lost" || state === "paused" || cell.flagged) {
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
      announce(cellAnnouncement(index, "revealed"));
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
      announce(`Check flags around ${cellPosition(index)}. ${cell.adjacent} ${cell.adjacent === 1 ? "flag is" : "flags are"} needed.`);
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
    if (!cell || cell.revealed || state === "won" || state === "lost" || state === "paused") {
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
    announce(cellAnnouncement(index, cell.flagged ? "flagged" : "unflagged"));
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
    announce(`Field cleared in ${formatTime(seconds)}. New best is ${formatTime(readBest())}.`);
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
    announce(cellAnnouncement(hitIndex, "revealed"));
  }

  function cellLabel(cell, index) {
    const position = `Row ${rowOf(index) + 1}, column ${colOf(index) + 1}`;

    if (cell.wrongFlag) {
      return `${position}. Wrong flag. This cell did not contain a mine.`;
    }

    if (cell.flagged && !cell.revealed) {
      return `${position}. Flagged hidden cell. Press F${flagMode ? " or Enter" : ""} to remove the flag.`;
    }

    if (!cell.revealed) {
      return flagMode
        ? `${position}. Hidden cell. Flag mode is on. Press Enter, Space, or F to place a flag.`
        : `${position}. Hidden cell. Press Enter or Space to reveal. Press F to flag.`;
    }

    if (cell.mine) {
      return `${position}. Revealed mine.`;
    }

    if (cell.adjacent === 0) {
      return `${position}. Revealed clear cell with no nearby mines.`;
    }

    return `${position}. Revealed clear cell with ${cell.adjacent} nearby ${cell.adjacent === 1 ? "mine" : "mines"}. Press Enter or Space to chord when matching flags are placed.`;
  }

  function syncCellTabIndexes() {
    boardEl.querySelectorAll(".cell").forEach((button) => {
      const selected = Number(button.dataset.index) === focusedCellIndex;
      button.tabIndex = selected ? 0 : -1;
    });
  }

  function renderBoard() {
    const active = config();
    const fragment = document.createDocumentFragment();

    boardShell.style.setProperty("--cols", active.cols);
    boardShell.style.setProperty("--rows", active.rows);
    boardEl.style.setProperty("--cols", active.cols);
    boardEl.style.setProperty("--rows", active.rows);
    boardEl.setAttribute(
      "aria-label",
      flagMode
        ? `${active.label} minefield, ${active.rows} by ${active.cols}, ${mineTotal} mines. Flag mode is on. Use arrow keys to move, Enter or Space to toggle a flag, and F to toggle a flag.`
        : `${active.label} minefield, ${active.rows} by ${active.cols}, ${mineTotal} mines. Use arrow keys to move, Enter or Space to reveal, and F to flag.`
    );
    boardEl.textContent = "";
    focusedCellIndex = normalizeCellIndex(focusedCellIndex);

    cells.forEach((cell, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cell";
      button.dataset.index = String(index);
      button.setAttribute("aria-label", cellLabel(cell, index));
      button.setAttribute("aria-keyshortcuts", "Enter Space F ArrowUp ArrowRight ArrowDown ArrowLeft");
      button.tabIndex = index === focusedCellIndex ? 0 : -1;

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
        focusedCellIndex = index;
        if (suppressClickIndex === index) {
          suppressClickIndex = -1;
          syncCellTabIndexes();
          return;
        }
        handlePrimaryAction(index);
      });

      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        focusedCellIndex = index;
        toggleFlag(index);
      });

      button.addEventListener("focus", () => {
        focusedCellIndex = index;
        syncCellTabIndexes();
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
    if (state === "paused") {
      updateHud("Paused");
      return;
    }

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
    focusedCellIndex = normalizeCellIndex(index);
    syncCellTabIndexes();
    const button = boardEl.querySelector(`[data-index="${focusedCellIndex}"]`);
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
      if (["arrowup", "arrowright", "arrowdown", "arrowleft", "enter", " "].includes(event.key.toLowerCase())) {
        event.preventDefault();
        focusCell(focusedCellIndex);
      }
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
    } else if (key === "p" || key === "escape") {
      event.preventDefault();
      togglePause();
    }
  }

  function handlePageKeyDown(event) {
    if (event.defaultPrevented) {
      return;
    }

    const key = event.key.toLowerCase();
    if ((key === "p" || key === "escape") && (state === "playing" || state === "paused")) {
      event.preventDefault();
      togglePause();
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
    announce(`${config().label} difficulty selected. ${config().rows} by ${config().cols}, ${mineTotal} mines.`);
  }

  function handleDifficultyKeyDown(event) {
    const focusedIndex = difficultyButtons.indexOf(event.currentTarget);
    const currentIndex = focusedIndex >= 0
      ? focusedIndex
      : difficultyButtons.findIndex((button) => button.dataset.difficulty === currentDifficulty);
    let nextIndex = currentIndex;

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + difficultyButtons.length) % difficultyButtons.length;
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % difficultyButtons.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = difficultyButtons.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextButton = difficultyButtons[nextIndex];
    setDifficulty(nextButton.dataset.difficulty);
    nextButton.focus();
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
    focusedCellIndex = normalizeCellIndex(options.focusIndex);
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
    pauseButton.addEventListener("click", togglePause);
    flagModeButton.addEventListener("click", () => {
      flagMode = !flagMode;
      updateHud(flagMode ? "Flag mode" : "Sweep mode");
      renderBoard();
      announce(flagMode ? "Flag mode on. Cell clicks now place or remove flags." : "Flag mode off. Cell clicks now reveal cells.");
      focusCell(0);
    });
    fullscreenButton.addEventListener("click", toggleFullscreen);
    window.addEventListener("keydown", handlePageKeyDown);
    boardEl.addEventListener("keydown", handleBoardKeyDown);
    boardEl.addEventListener("contextmenu", (event) => event.preventDefault());
    difficultyButtons.forEach((button) => {
      button.addEventListener("click", () => setDifficulty(button.dataset.difficulty));
      button.addEventListener("keydown", handleDifficultyKeyDown);
    });
  }

  window.minefieldSweep = {
    newGame: resetBoard,
    start: startField,
    setDifficulty,
    reveal: revealCell,
    flag: toggleFlag,
    pause: togglePause,
    chord: chordCell,
    debugSetMines,
    getState
  };

  resetBoard(currentDifficulty, true);
  bindEvents();
})();
