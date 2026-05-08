(() => {
  "use strict";

  const SIZE = 4;
  const TARGET_TILE = 2048;
  const BEST_KEY = "inefy-2048-best";
  const SAVE_KEY = "inefy-2048-save-v1";
  const DIRECTIONS = new Set(["up", "right", "down", "left"]);

  const boardEl = document.getElementById("gameBoard");
  const tileLayer = document.getElementById("tileLayer");
  const gameMenu = document.getElementById("gameMenu");
  const menuTitle = document.getElementById("menuTitle");
  const menuMeta = document.getElementById("menuMeta");
  const startButton = document.getElementById("startButton");
  const continueButton = document.getElementById("continueButton");
  const undoButton = document.getElementById("undoButton");
  const restartButton = document.getElementById("restartButton");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const scoreValue = document.getElementById("scoreValue");
  const bestValue = document.getElementById("bestValue");
  const topTileValue = document.getElementById("topTileValue");
  const movesValue = document.getElementById("movesValue");
  const roundStatus = document.getElementById("roundStatus");
  const scoreChip = document.querySelector(".score-chip.current");

  let grid = createGrid();
  let score = 0;
  let best = readStoredNumber(BEST_KEY);
  let moves = 0;
  let state = "idle";
  let hasWon = false;
  let keepPlaying = false;
  let lastSnapshot = null;
  let newTileKey = "";
  let mergedKeys = new Set();
  let pointerStart = null;
  let hasSavedGame = false;
  let scorePulseTimer = 0;
  let boardFeedbackTimer = 0;

  function createGrid() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  function cloneGrid(source) {
    return source.map((row) => row.slice());
  }

  function readStoredNumber(key) {
    try {
      const value = Number(window.localStorage.getItem(key));
      return Number.isFinite(value) && value > 0 ? value : 0;
    } catch {
      return 0;
    }
  }

  function writeStoredNumber(key, value) {
    try {
      window.localStorage.setItem(key, String(value));
    } catch {
      // Private browsing and strict storage settings can reject writes.
    }
  }

  function saveGame() {
    try {
      window.localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
          grid,
          score,
          moves,
          state,
          hasWon,
          keepPlaying,
          savedAt: Date.now()
        })
      );
    } catch {
      // Saving is a convenience; gameplay should continue if storage is blocked.
    }
  }

  function loadGame() {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      if (!isValidGrid(parsed.grid)) {
        return null;
      }

      const loadedGrid = normalizeGrid(parsed.grid);
      const loadedHasWon = Boolean(parsed.hasWon);
      const loadedKeepPlaying = Boolean(parsed.keepPlaying);

      return {
        grid: loadedGrid,
        score: Math.max(0, Number(parsed.score) || 0),
        moves: Math.max(0, Number(parsed.moves) || 0),
        state: normalizeSavedState(parsed.state, loadedGrid, loadedHasWon, loadedKeepPlaying),
        hasWon: loadedHasWon,
        keepPlaying: loadedKeepPlaying
      };
    } catch {
      return null;
    }
  }

  function normalizeSavedState(savedState, loadedGrid, loadedHasWon, loadedKeepPlaying) {
    if (!canMove(loadedGrid)) {
      return "over";
    }

    if (
      (savedState === "won" || !savedState)
      && loadedHasWon
      && !loadedKeepPlaying
      && getTopTile(loadedGrid) >= TARGET_TILE
    ) {
      return "won";
    }

    return "playing";
  }

  function isTileValue(value) {
    const numberValue = Number(value);
    return Number.isSafeInteger(numberValue)
      && numberValue >= 0
      && (numberValue === 0 || Number.isInteger(Math.log2(numberValue)));
  }

  function isValidGrid(candidate) {
    return Array.isArray(candidate)
      && candidate.length === SIZE
      && candidate.every((row) => Array.isArray(row)
        && row.length === SIZE
        && row.every(isTileValue));
  }

  function normalizeGrid(candidate) {
    return candidate.map((row) => row.map((value) => Math.max(0, Math.floor(Number(value) || 0))));
  }

  function hasAnyTile(source = grid) {
    return source.some((row) => row.some((value) => value > 0));
  }

  function cellKey(row, col) {
    return `${row}-${col}`;
  }

  function formatNumber(value) {
    return Number(value).toLocaleString("en-US");
  }

  function formatMoveCount(value) {
    return `${formatNumber(value)} ${value === 1 ? "move" : "moves"}`;
  }

  function getTopTile(source = grid) {
    return source.reduce((top, row) => Math.max(top, ...row), 0);
  }

  function getEmptyCells(source = grid) {
    const cells = [];

    for (let row = 0; row < SIZE; row += 1) {
      for (let col = 0; col < SIZE; col += 1) {
        if (source[row][col] === 0) {
          cells.push({ row, col });
        }
      }
    }

    return cells;
  }

  function addRandomTile() {
    const emptyCells = getEmptyCells();
    if (emptyCells.length === 0) {
      return null;
    }

    const pickedCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[pickedCell.row][pickedCell.col] = Math.random() < 0.9 ? 2 : 4;
    newTileKey = cellKey(pickedCell.row, pickedCell.col);
    return pickedCell;
  }

  function readLine(source, direction, index) {
    if (direction === "left") {
      return source[index].slice();
    }

    if (direction === "right") {
      return source[index].slice().reverse();
    }

    const line = [];
    for (let offset = 0; offset < SIZE; offset += 1) {
      const row = direction === "up" ? offset : SIZE - 1 - offset;
      line.push(source[row][index]);
    }
    return line;
  }

  function positionFor(direction, index, offset) {
    if (direction === "left") {
      return { row: index, col: offset };
    }

    if (direction === "right") {
      return { row: index, col: SIZE - 1 - offset };
    }

    if (direction === "up") {
      return { row: offset, col: index };
    }

    return { row: SIZE - 1 - offset, col: index };
  }

  function writeLine(target, direction, index, line) {
    line.forEach((value, offset) => {
      const position = positionFor(direction, index, offset);
      target[position.row][position.col] = value;
    });
  }

  function slideLine(values) {
    const compacted = values.filter((value) => value > 0);
    const line = [];
    const mergedOffsets = [];
    let gained = 0;

    for (let index = 0; index < compacted.length; index += 1) {
      const value = compacted[index];
      const nextValue = compacted[index + 1];

      if (value === nextValue) {
        const mergedValue = value * 2;
        line.push(mergedValue);
        gained += mergedValue;
        mergedOffsets.push(line.length - 1);
        index += 1;
      } else {
        line.push(value);
      }
    }

    while (line.length < SIZE) {
      line.push(0);
    }

    return { line, gained, mergedOffsets };
  }

  function gridsAreEqual(first, second) {
    for (let row = 0; row < SIZE; row += 1) {
      for (let col = 0; col < SIZE; col += 1) {
        if (first[row][col] !== second[row][col]) {
          return false;
        }
      }
    }

    return true;
  }

  function canMove(source = grid) {
    if (getEmptyCells(source).length > 0) {
      return true;
    }

    for (let row = 0; row < SIZE; row += 1) {
      for (let col = 0; col < SIZE; col += 1) {
        const value = source[row][col];
        if (source[row + 1]?.[col] === value || source[row]?.[col + 1] === value) {
          return true;
        }
      }
    }

    return false;
  }

  function makeSnapshot() {
    return {
      grid: cloneGrid(grid),
      score,
      moves,
      hasWon,
      keepPlaying,
      state: "playing"
    };
  }

  function canUndo() {
    return Boolean(lastSnapshot) && state !== "idle";
  }

  function restoreSnapshot(snapshot) {
    grid = cloneGrid(snapshot.grid);
    score = snapshot.score;
    moves = snapshot.moves;
    hasWon = snapshot.hasWon;
    keepPlaying = snapshot.keepPlaying;
    state = snapshot.state;
    hasSavedGame = false;
    lastSnapshot = null;
    newTileKey = "";
    mergedKeys = new Set();
    render();
    hideMenu();
    updateHud("Move undone");
    saveGame();
    boardEl.focus({ preventScroll: true });
  }

  function render() {
    const fragment = document.createDocumentFragment();

    tileLayer.textContent = "";

    for (let row = 0; row < SIZE; row += 1) {
      for (let col = 0; col < SIZE; col += 1) {
        const value = grid[row][col];
        if (value === 0) {
          continue;
        }

        const tile = document.createElement("div");
        tile.className = `tile tile-x-${col} tile-y-${row}`;
        tile.dataset.value = String(value);
        tile.textContent = formatNumber(value);

        if (value >= 1024) {
          tile.classList.add("large");
        }

        if (value >= 16384) {
          tile.classList.add("xlarge");
        }

        if (value > TARGET_TILE) {
          tile.classList.add("tile-super");
        }

        const key = cellKey(row, col);
        if (key === newTileKey) {
          tile.classList.add("is-new");
        }

        if (mergedKeys.has(key)) {
          tile.classList.add("is-merged");
        }

        fragment.appendChild(tile);
      }
    }

    tileLayer.appendChild(fragment);
    boardEl.setAttribute(
      "aria-label",
      `2048 board. Score ${score}. Top tile ${getTopTile()}. Use arrow keys, WASD, swipe, or the direction buttons.`
    );
  }

  function updateHud(statusText) {
    const topTile = getTopTile();
    scoreValue.textContent = formatNumber(score);
    bestValue.textContent = formatNumber(best);
    topTileValue.textContent = formatNumber(topTile || 2);
    movesValue.textContent = formatNumber(moves);
    roundStatus.textContent = statusText;
    document.body.dataset.gameState = state;
    undoButton.disabled = !canUndo();
  }

  function flashScore(gained) {
    if (!scoreChip || gained <= 0) {
      return;
    }

    window.clearTimeout(scorePulseTimer);
    scoreChip.dataset.gain = `+${formatNumber(gained)}`;
    scoreChip.classList.remove("is-bumped");
    void scoreChip.offsetWidth;
    scoreChip.classList.add("is-bumped");
    scorePulseTimer = window.setTimeout(() => {
      scoreChip.classList.remove("is-bumped");
      scoreChip.removeAttribute("data-gain");
    }, 620);
  }

  function flashBoard(className) {
    window.clearTimeout(boardFeedbackTimer);
    boardEl.classList.remove("is-shaking", "is-celebrating");
    void boardEl.offsetWidth;
    boardEl.classList.add(className);
    boardFeedbackTimer = window.setTimeout(() => {
      boardEl.classList.remove(className);
    }, className === "is-celebrating" ? 1100 : 360);
  }

  function showMenu({ title, meta, primaryLabel, showContinue = false }) {
    menuTitle.textContent = title;
    menuMeta.textContent = meta;
    startButton.textContent = primaryLabel;
    continueButton.hidden = !showContinue;
    gameMenu.classList.remove("is-hidden");
  }

  function hideMenu() {
    gameMenu.classList.add("is-hidden");
  }

  function updateBest() {
    if (score > best) {
      best = score;
      writeStoredNumber(BEST_KEY, best);
    }
  }

  function evaluateBoard(statusText) {
    updateBest();

    if (getTopTile() >= TARGET_TILE && !hasWon && !keepPlaying) {
      hasWon = true;
      state = "won";
      showMenu({
        title: "2048 Reached",
        meta: `Score ${formatNumber(score)} with ${formatMoveCount(moves)}`,
        primaryLabel: "New Game",
        showContinue: true
      });
      flashBoard("is-celebrating");
      updateHud("2048 reached");
      saveGame();
      return;
    }

    if (!canMove()) {
      state = "over";
      showMenu({
        title: "No Moves",
        meta: `Final score ${formatNumber(score)}`,
        primaryLabel: "Try Again"
      });
      updateHud("Board full");
      saveGame();
      return;
    }

    if (state === "playing") {
      hideMenu();
      updateHud(statusText);
    } else if (state === "idle") {
      showMenu({
        title: "2048",
        meta: hasSavedGame ? `Saved score ${formatNumber(score)}` : "Reach the luminous tile",
        primaryLabel: hasSavedGame ? "Resume Game" : "Start Game"
      });
      updateHud("Ready");
    }

    saveGame();
  }

  function startFreshGame({ idle = false } = {}) {
    grid = createGrid();
    score = 0;
    moves = 0;
    hasWon = false;
    keepPlaying = false;
    lastSnapshot = null;
    newTileKey = "";
    mergedKeys = new Set();
    addRandomTile();
    addRandomTile();
    state = idle ? "idle" : "playing";
    hasSavedGame = false;
    render();

    if (idle) {
      showMenu({
        title: "2048",
        meta: "Reach the luminous tile",
        primaryLabel: "Start Game"
      });
      updateHud("Ready");
    } else {
      hideMenu();
      updateHud("Playing");
      saveGame();
      boardEl.focus({ preventScroll: true });
    }
  }

  function activateGame() {
    if (state === "over" || state === "won") {
      startFreshGame();
      return;
    }

    if (!hasAnyTile()) {
      startFreshGame();
      return;
    }

    state = "playing";
    hasSavedGame = false;
    hideMenu();
    updateHud("Playing");
    saveGame();
    boardEl.focus({ preventScroll: true });
  }

  function continueGame() {
    keepPlaying = true;
    state = "playing";
    hideMenu();
    updateHud("Keep going");
    saveGame();
    boardEl.focus({ preventScroll: true });
  }

  function handleMove(direction) {
    if (!DIRECTIONS.has(direction)) {
      return false;
    }

    if (state === "idle") {
      activateGame();
    }

    if (state !== "playing") {
      return false;
    }

    const before = cloneGrid(grid);
    const next = createGrid();
    const previousSnapshot = makeSnapshot();
    const moveMergedKeys = new Set();
    let gained = 0;

    for (let index = 0; index < SIZE; index += 1) {
      const result = slideLine(readLine(before, direction, index));
      writeLine(next, direction, index, result.line);
      gained += result.gained;

      result.mergedOffsets.forEach((offset) => {
        const position = positionFor(direction, index, offset);
        moveMergedKeys.add(cellKey(position.row, position.col));
      });
    }

    if (gridsAreEqual(before, next)) {
      flashBoard("is-shaking");
      updateHud("No move");
      return false;
    }

    grid = next;
    score += gained;
    moves += 1;
    lastSnapshot = previousSnapshot;
    mergedKeys = moveMergedKeys;
    newTileKey = "";
    addRandomTile();
    render();
    flashScore(gained);
    evaluateBoard(gained > 0 ? `+${formatNumber(gained)}` : "Moved");
    return true;
  }

  function handlePointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    pointerStart = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY
    };
    boardEl.setPointerCapture?.(event.pointerId);
  }

  function handlePointerUp(event) {
    if (!pointerStart || pointerStart.id !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    const distance = Math.max(Math.abs(deltaX), Math.abs(deltaY));
    pointerStart = null;

    if (distance < 24) {
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      handleMove(deltaX > 0 ? "right" : "left");
    } else {
      handleMove(deltaY > 0 ? "down" : "up");
    }
  }

  function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    const keyMap = {
      arrowup: "up",
      w: "up",
      arrowright: "right",
      d: "right",
      arrowdown: "down",
      s: "down",
      arrowleft: "left",
      a: "left"
    };

    if (keyMap[key]) {
      event.preventDefault();
      handleMove(keyMap[key]);
      return;
    }

    if ((key === "enter" || key === " ") && !gameMenu.classList.contains("is-hidden")) {
      event.preventDefault();
      activateGame();
    }

    if (key === "z" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      undoMove();
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

  function setGridForTest(nextGrid, options = {}) {
    if (!isValidGrid(nextGrid)) {
      throw new Error("setGrid expects a 4x4 grid of non-negative numbers.");
    }

    grid = normalizeGrid(nextGrid);
    score = Math.max(0, Number(options.score) || 0);
    moves = Math.max(0, Number(options.moves) || 0);
    hasWon = Boolean(options.hasWon);
    keepPlaying = Boolean(options.keepPlaying);
    state = options.state || "playing";
    lastSnapshot = null;
    newTileKey = "";
    mergedKeys = new Set();
    hasSavedGame = false;
    render();
    evaluateBoard(options.status || "Debug board");
  }

  function undoMove() {
    if (!canUndo()) {
      return false;
    }

    restoreSnapshot(lastSnapshot);
    return true;
  }

  function restoreLoadedGame(savedGame) {
    grid = savedGame.grid;
    score = savedGame.score;
    moves = savedGame.moves;
    state = savedGame.state;
    hasWon = savedGame.hasWon;
    keepPlaying = savedGame.keepPlaying;
    lastSnapshot = null;
    newTileKey = "";
    mergedKeys = new Set();
    hasSavedGame = false;
    render();

    if (state === "won") {
      showMenu({
        title: "2048 Reached",
        meta: `Score ${formatNumber(score)} with ${formatMoveCount(moves)}`,
        primaryLabel: "New Game",
        showContinue: true
      });
      updateHud("2048 reached");
      return;
    }

    if (state === "over" || !canMove()) {
      state = "over";
      showMenu({
        title: "No Moves",
        meta: `Final score ${formatNumber(score)}`,
        primaryLabel: "Try Again"
      });
      updateHud("Board full");
      return;
    }

    state = "idle";
    hasSavedGame = true;
    showMenu({
      title: "2048",
      meta: `Saved score ${formatNumber(score)}`,
      primaryLabel: "Resume Game"
    });
    updateHud("Ready");
  }

  function bindEvents() {
    startButton.addEventListener("click", activateGame);
    continueButton.addEventListener("click", continueGame);
    undoButton.addEventListener("click", undoMove);
    restartButton.addEventListener("click", () => startFreshGame());
    fullscreenButton.addEventListener("click", toggleFullscreen);
    boardEl.addEventListener("pointerdown", handlePointerDown);
    boardEl.addEventListener("pointerup", handlePointerUp);
    boardEl.addEventListener("pointercancel", () => {
      pointerStart = null;
    });
    document.addEventListener("keydown", handleKeyDown);
    document.querySelectorAll(".touch-pad button[data-dir]").forEach((button) => {
      button.addEventListener("click", () => handleMove(button.dataset.dir));
    });
  }

  function initialize() {
    const savedGame = loadGame();
    if (savedGame && hasAnyTile(savedGame.grid)) {
      restoreLoadedGame(savedGame);
    } else {
      startFreshGame({ idle: true });
    }

    bindEvents();
  }

  window.tile2048 = {
    start: activateGame,
    restart: () => startFreshGame(),
    continue: continueGame,
    move: handleMove,
    undo: undoMove,
    setGrid: setGridForTest,
    evaluate: () => evaluateBoard("Checked"),
    getState: () => ({
      grid: cloneGrid(grid),
      score,
      best,
      moves,
      state,
      hasWon,
      keepPlaying,
      topTile: getTopTile(),
      canMove: canMove(),
      tileCount: SIZE * SIZE - getEmptyCells().length
    })
  };

  initialize();
})();
