const paintApp = document.querySelector(".paint-app");
const canvas = document.querySelector("#paintCanvas");
const context = canvas.getContext("2d", { willReadFrequently: true });
const canvasStage = document.querySelector("#canvasStage");
const selectionBox = document.querySelector("#selectionBox");
const canvasResizeHandle = document.querySelector("#canvasResizeHandle");
const toolStatus = document.querySelector("#toolStatus");
const paintAnnouncement = document.querySelector("#paintAnnouncement");
const cursorStatus = document.querySelector("#cursorStatus");
const canvasSizeStatus = document.querySelector("#canvasSizeStatus");
const zoomStatus = document.querySelector("#zoomStatus");
const primaryColorPreview = document.querySelector("#primaryColorPreview");
const zoomInput = document.querySelector("#zoomInput");
const swatches = document.querySelector("#swatches");
const newCanvasButton = document.querySelector("#newCanvasButton");
const openButton = document.querySelector("#openButton");
const pasteButton = document.querySelector("#pasteButton");
const saveButton = document.querySelector("#saveButton");
const clearButton = document.querySelector("#clearButton");
const undoButton = document.querySelector("#undoButton");
const redoButton = document.querySelector("#redoButton");
const cutButton = document.querySelector("#cutButton");
const copyButton = document.querySelector("#copyButton");
const cloudButton = document.querySelector("#cloudButton");
const minimizeButton = document.querySelector("#minimizeButton");
const fullscreenButton = document.querySelector("#fullscreenButton");
const closeButton = document.querySelector("#closeButton");
const imageOpenInput = document.querySelector("#imageOpenInput");
const zoomOutButton = document.querySelector("#zoomOutButton");
const zoomInButton = document.querySelector("#zoomInButton");
const fitButton = document.querySelector("#fitButton");
const viewZoomOutButton = document.querySelector("#viewZoomOutButton");
const viewZoomInButton = document.querySelector("#viewZoomInButton");
const viewFitButton = document.querySelector("#viewFitButton");
const resetViewButton = document.querySelector("#resetViewButton");
const fullscreenRibbonButton = document.querySelector("#fullscreenRibbonButton");
const canvasWidthInput = document.querySelector("#canvasWidthInput");
const canvasHeightInput = document.querySelector("#canvasHeightInput");
const applyCanvasSizeButton = document.querySelector("#applyCanvasSizeButton");
const resetCanvasSizeButton = document.querySelector("#resetCanvasSizeButton");
const homeCanvasWidthInput = document.querySelector("#homeCanvasWidthInput");
const homeCanvasHeightInput = document.querySelector("#homeCanvasHeightInput");
const homeApplyCanvasSizeButton = document.querySelector("#homeApplyCanvasSizeButton");
const homeResetCanvasSizeButton = document.querySelector("#homeResetCanvasSizeButton");
const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));
const toolButtons = Array.from(document.querySelectorAll("[data-tool]"));
const shapeButtons = Array.from(document.querySelectorAll("[data-shape]"));
const sizeButtons = Array.from(document.querySelectorAll("[data-size]"));
const palette = [
  "#000000", "#ffffff", "#7f1d1d", "#dc2626", "#f97316",
  "#facc15", "#16a34a", "#22c55e", "#0ea5e9", "#2563eb",
  "#1e1b4b", "#7c3aed", "#db2777", "#f9a8d4", "#9ca3af",
  "#475569", "#92400e", "#f5deb3", "#14b8a6", "#a3e635"
];
const state = {
  activeTool: "pencil",
  activeShape: "",
  color: "#000000",
  brushSize: 12,
  brushStyle: "round",
  isDrawing: false,
  history: [],
  historyIndex: -1,
  lastPoint: null,
  startPoint: null,
  draft: null,
  selectionRect: null,
  selectionStart: null,
  isSelecting: false,
  zoom: 100,
  canvasRect: null,
  pendingPoint: null,
  frameRequest: 0
};
const maxHistory = 24;
const allowedImageTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp", "image/avif"]);
const maxImageBytes = 16 * 1024 * 1024;
const maxImagePixels = 48000000;
let cloudTimer = 0;
let resizeDrag = null;
let resizeFrame = 0;
let paintAnnouncementTimer = 0;

function announcePaint(message) {
  if (!paintAnnouncement || !message) return;

  window.clearTimeout(paintAnnouncementTimer);
  paintAnnouncement.textContent = "";
  paintAnnouncementTimer = window.setTimeout(() => {
    paintAnnouncement.textContent = message;
  }, 20);
}

function saveHistory() {
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(context.getImageData(0, 0, canvas.width, canvas.height));
  if (state.history.length > maxHistory) state.history.shift();
  state.historyIndex = state.history.length - 1;
}

function restoreHistory(index) {
  const snapshot = state.history[index];
  if (!snapshot) return;
  context.putImageData(snapshot, 0, 0);
}

function initializeCanvas() {
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  syncCanvasSizeUi();
  saveHistory();
}

function syncCanvasSizeUi() {
  canvasWidthInput.value = canvas.width;
  canvasHeightInput.value = canvas.height;
  homeCanvasWidthInput.value = canvas.width;
  homeCanvasHeightInput.value = canvas.height;
  canvasSizeStatus.textContent = `▣ ${canvas.width} × ${canvas.height}px`;
  canvasStage.style.setProperty("--canvas-aspect", `${canvas.width} / ${canvas.height}`);
  canvasStage.style.width = "";
}

function showCloudStatus(label) {
  cloudButton.textContent = label;
  window.clearTimeout(cloudTimer);
  cloudTimer = window.setTimeout(() => {
    cloudButton.textContent = "Save local";
  }, 1600);
}

function drawImageToCanvas(image) {
  const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = (canvas.width - width) / 2;
  const y = (canvas.height - height) / 2;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, x, y, width, height);
  clearSelection();
  saveHistory();
  announcePaint(`Image opened on canvas. Canvas is ${canvas.width} by ${canvas.height} pixels.`);
}

function isSafeImageBlob(blob) {
  return allowedImageTypes.has(blob.type) && blob.size <= maxImageBytes;
}

function loadImageBlob(blob) {
  if (!isSafeImageBlob(blob)) {
    showCloudStatus("!");
    announcePaint("Image could not be opened. Choose a supported image under 16 megabytes.");
    return;
  }

  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    if (!image.width || !image.height || image.width * image.height > maxImagePixels) {
      URL.revokeObjectURL(url);
      showCloudStatus("!");
      announcePaint("Image could not be opened because it is too large.");
      return;
    }

    drawImageToCanvas(image);
    URL.revokeObjectURL(url);
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    showCloudStatus("!");
    announcePaint("Image could not be opened.");
  };
  image.src = url;
}

function canvasToBlob(source = canvas) {
  return new Promise((resolve) => source.toBlob(resolve, "image/png"));
}

function selectedCanvas() {
  if (!state.selectionRect) return canvas;

  const { x, y, width, height } = state.selectionRect;
  const output = document.createElement("canvas");
  output.width = Math.max(1, width);
  output.height = Math.max(1, height);
  output.getContext("2d").drawImage(canvas, x, y, width, height, 0, 0, width, height);
  return output;
}

async function copyCanvasToClipboard() {
  const source = selectedCanvas();
  const blob = await canvasToBlob(source);
  if (!blob) return false;

  if (navigator.clipboard && window.ClipboardItem) {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  }

  downloadCanvas(source, state.selectionRect ? "web-paint-selection.png" : "web-paint.png");
  return false;
}

async function pasteFromClipboard() {
  if (!navigator.clipboard || !navigator.clipboard.read) {
    announcePaint("Clipboard image paste is unavailable. Choose an image file to open.");
    imageOpenInput.click();
    return;
  }

  const items = await navigator.clipboard.read();
  for (const item of items) {
    const imageType = item.types.find((type) => type.startsWith("image/"));
    if (imageType) {
      loadImageBlob(await item.getType(imageType));
      return;
    }
  }

  if (navigator.clipboard.readText) {
    const text = await navigator.clipboard.readText();
    if (text) {
      clearSelection();
      configureBrush();
      context.font = `${Math.max(18, state.brushSize * 4)}px Inter, sans-serif`;
      context.fillText(text, 80, 110);
      saveHistory();
      announcePaint("Clipboard text pasted onto the canvas.");
      return;
    }
  }

  announcePaint("No image or text was available on the clipboard. Choose an image file to open.");
  imageOpenInput.click();
}

function getCanvasPoint(event) {
  const rect = state.canvasRect || canvas.getBoundingClientRect();
  return {
    x: Math.round((event.clientX - rect.left) * (canvas.width / rect.width)),
    y: Math.round((event.clientY - rect.top) * (canvas.height / rect.height))
  };
}

function configureBrush() {
  const size = state.activeTool === "pencil" ? Math.max(1, Math.round(state.brushSize / 3)) : state.brushSize;
  context.lineWidth = size;
  context.lineCap = state.brushStyle === "round" ? "round" : "butt";
  context.lineJoin = state.brushStyle === "round" ? "round" : "miter";
  context.strokeStyle = state.activeTool === "eraser" ? "#ffffff" : state.color;
  context.fillStyle = state.color;
}

function drawLine(fromPoint, toPoint) {
  configureBrush();
  context.beginPath();
  context.moveTo(fromPoint.x, fromPoint.y);
  context.lineTo(toPoint.x, toPoint.y);
  context.stroke();
}

function roundedRectPath(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
}

function drawShape(fromPoint, toPoint, shape) {
  configureBrush();
  const x = Math.min(fromPoint.x, toPoint.x);
  const y = Math.min(fromPoint.y, toPoint.y);
  const width = Math.abs(toPoint.x - fromPoint.x);
  const height = Math.abs(toPoint.y - fromPoint.y);
  context.beginPath();

  if (shape === "line") {
    drawLine(fromPoint, toPoint);
    return;
  }

  if (shape === "rectangle") {
    context.strokeRect(x, y, width, height);
    return;
  }

  if (shape === "rounded-rectangle") {
    roundedRectPath(x, y, width, height, 18);
  } else if (shape === "circle") {
    context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
  } else if (shape === "triangle") {
    context.moveTo(fromPoint.x + (toPoint.x - fromPoint.x) / 2, fromPoint.y);
    context.lineTo(toPoint.x, toPoint.y);
    context.lineTo(fromPoint.x, toPoint.y);
    context.closePath();
  } else if (shape === "right-triangle") {
    context.moveTo(fromPoint.x, fromPoint.y);
    context.lineTo(fromPoint.x, toPoint.y);
    context.lineTo(toPoint.x, toPoint.y);
    context.closePath();
  } else if (shape === "star") {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const outer = Math.max(width, height) / 2;
    const inner = outer / 2.3;
    for (let i = 0; i < 10; i += 1) {
      const radius = i % 2 === 0 ? outer : inner;
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      const pointX = centerX + Math.cos(angle) * radius;
      const pointY = centerY + Math.sin(angle) * radius;
      if (i === 0) context.moveTo(pointX, pointY);
      else context.lineTo(pointX, pointY);
    }
    context.closePath();
  } else if (shape === "polygon") {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.max(width, height) / 2;
    for (let i = 0; i < 6; i += 1) {
      const angle = -Math.PI / 2 + i * Math.PI / 3;
      const pointX = centerX + Math.cos(angle) * radius;
      const pointY = centerY + Math.sin(angle) * radius;
      if (i === 0) context.moveTo(pointX, pointY);
      else context.lineTo(pointX, pointY);
    }
    context.closePath();
  }

  context.stroke();
}

function rgbToHex(red, green, blue) {
  return `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgba(hex) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
    255
  ];
}

function colorsMatch(data, index, target) {
  return data[index] === target[0]
    && data[index + 1] === target[1]
    && data[index + 2] === target[2]
    && data[index + 3] === target[3];
}

function floodFill(point) {
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  const startX = Math.max(0, Math.min(canvas.width - 1, point.x));
  const startY = Math.max(0, Math.min(canvas.height - 1, point.y));
  const startIndex = (startY * canvas.width + startX) * 4;
  const target = [
    data[startIndex],
    data[startIndex + 1],
    data[startIndex + 2],
    data[startIndex + 3]
  ];
  const replacement = hexToRgba(state.color);
  if (target.every((value, index) => value === replacement[index])) return false;

  const stack = new Int32Array(canvas.width * canvas.height);
  const visited = new Uint8Array(canvas.width * canvas.height);
  let stackLength = 0;
  const firstPosition = startY * canvas.width + startX;
  stack[stackLength] = firstPosition;
  visited[firstPosition] = 1;
  stackLength += 1;

  while (stackLength) {
    stackLength -= 1;
    const position = stack[stackLength];
    const x = position % canvas.width;
    const y = Math.floor(position / canvas.width);
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
    const index = (y * canvas.width + x) * 4;
    if (!colorsMatch(data, index, target)) continue;
    data[index] = replacement[0];
    data[index + 1] = replacement[1];
    data[index + 2] = replacement[2];
    data[index + 3] = replacement[3];
    if (x + 1 < canvas.width) {
      const next = y * canvas.width + x + 1;
      if (!visited[next]) {
        stack[stackLength] = next;
        visited[next] = 1;
        stackLength += 1;
      }
    }
    if (x > 0) {
      const next = y * canvas.width + x - 1;
      if (!visited[next]) {
        stack[stackLength] = next;
        visited[next] = 1;
        stackLength += 1;
      }
    }
    if (y + 1 < canvas.height) {
      const next = (y + 1) * canvas.width + x;
      if (!visited[next]) {
        stack[stackLength] = next;
        visited[next] = 1;
        stackLength += 1;
      }
    }
    if (y > 0) {
      const next = (y - 1) * canvas.width + x;
      if (!visited[next]) {
        stack[stackLength] = next;
        visited[next] = 1;
        stackLength += 1;
      }
    }
  }

  context.putImageData(image, 0, 0);
  return true;
}

function pickColor(point) {
  const pixel = context.getImageData(point.x, point.y, 1, 1).data;
  setColor(rgbToHex(pixel[0], pixel[1], pixel[2]));
}

function titleCase(value) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function syncActiveControls() {
  toolButtons.forEach((button) => {
    const isActive = button.dataset.tool === state.activeTool && !state.activeShape;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  shapeButtons.forEach((button) => {
    const isActive = button.dataset.shape === state.activeShape;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function setTool(tool) {
  if (tool !== "select") clearSelection();
  state.activeTool = tool;
  state.activeShape = "";
  toolStatus.textContent = `Tool: ${titleCase(tool)}`;
  syncActiveControls();
}

function setShape(shape) {
  clearSelection();
  state.activeTool = "shape";
  state.activeShape = shape;
  toolStatus.textContent = `Tool: ${titleCase(shape)}`;
  syncActiveControls();
}

function setColor(color) {
  state.color = color;
  primaryColorPreview.style.background = color;
  swatches.querySelectorAll(".swatch").forEach((button) => {
    const isActive = button.dataset.color === color;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function setBrushSize(size) {
  state.brushSize = Number(size);
  sizeButtons.forEach((button) => {
    const isActive = Number(button.dataset.size) === state.brushSize;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function clearCanvas() {
  clearSelection();
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  saveHistory();
  announcePaint("Canvas cleared.");
}

function downloadCanvas(source = canvas, filename = "web-paint.png") {
  const link = document.createElement("a");
  link.download = filename;
  link.href = source.toDataURL("image/png");
  link.click();
}

function setZoom(value) {
  state.zoom = Math.max(50, Math.min(200, Number(value)));
  zoomInput.value = state.zoom;
  canvasStage.style.transform = `scale(${state.zoom / 100})`;
  zoomStatus.textContent = `${state.zoom}%`;
  state.canvasRect = null;
}

function saveToBrowserStorage() {
  try {
    localStorage.setItem("webPaintAutosave", canvas.toDataURL("image/png"));
    showCloudStatus("✓");
    announcePaint("Canvas saved in this browser.");
  } catch {
    showCloudStatus("!");
    announcePaint("Canvas could not be saved in this browser.");
  }
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await paintApp.requestFullscreen();
    return;
  }

  await document.exitFullscreen();
}

function setActiveTab(tab) {
  paintApp.dataset.activeTab = tab;
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function clampedCanvasSize(value) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return 1024;
  return Math.max(64, Math.min(4096, number));
}

function resizeCanvas(width, height) {
  const nextWidth = clampedCanvasSize(width);
  const nextHeight = clampedCanvasSize(height);
  if (nextWidth === canvas.width && nextHeight === canvas.height) {
    syncCanvasSizeUi();
    return;
  }
  const snapshot = document.createElement("canvas");
  snapshot.width = canvas.width;
  snapshot.height = canvas.height;
  snapshot.getContext("2d").drawImage(canvas, 0, 0);

  clearSelection();
  canvas.width = nextWidth;
  canvas.height = nextHeight;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const preservedWidth = Math.min(snapshot.width, canvas.width);
  const preservedHeight = Math.min(snapshot.height, canvas.height);
  context.drawImage(snapshot, 0, 0, preservedWidth, preservedHeight, 0, 0, preservedWidth, preservedHeight);
  state.history = [];
  state.historyIndex = -1;
  state.canvasRect = null;
  syncCanvasSizeUi();
  saveHistory();
  announcePaint(`Canvas resized to ${canvas.width} by ${canvas.height} pixels.`);
}

function startCanvasResize(event) {
  event.preventDefault();
  event.stopPropagation();
  const rect = canvasStage.getBoundingClientRect();
  resizeDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startWidth: canvas.width,
    startHeight: canvas.height,
    visualWidth: rect.width,
    visualHeight: rect.height,
    nextWidth: canvas.width,
    nextHeight: canvas.height,
    nextVisualWidth: rect.width
  };
  canvasStage.classList.add("is-resizing");
  canvasResizeHandle.setPointerCapture(event.pointerId);
}

function previewCanvasResize(event) {
  if (!resizeDrag) return;
  const widthPerPixel = resizeDrag.startWidth / resizeDrag.visualWidth;
  const heightPerPixel = resizeDrag.startHeight / resizeDrag.visualHeight;
  const nextWidth = clampedCanvasSize(Math.round(resizeDrag.startWidth + (event.clientX - resizeDrag.startX) * widthPerPixel));
  const nextHeight = clampedCanvasSize(Math.round(resizeDrag.startHeight + (event.clientY - resizeDrag.startY) * heightPerPixel));
  const maxVisualWidth = Math.max(180, window.innerWidth - 220);
  resizeDrag.nextWidth = nextWidth;
  resizeDrag.nextHeight = nextHeight;
  resizeDrag.nextVisualWidth = Math.min(maxVisualWidth, Math.max(180, resizeDrag.visualWidth + (event.clientX - resizeDrag.startX)));

  if (resizeFrame) return;
  resizeFrame = window.requestAnimationFrame(() => {
    resizeFrame = 0;
    renderResizePreview();
  });
}

function renderResizePreview() {
  if (!resizeDrag) return;
  canvasWidthInput.value = resizeDrag.nextWidth;
  canvasHeightInput.value = resizeDrag.nextHeight;
  homeCanvasWidthInput.value = resizeDrag.nextWidth;
  homeCanvasHeightInput.value = resizeDrag.nextHeight;
  canvasSizeStatus.textContent = `▣ ${resizeDrag.nextWidth} × ${resizeDrag.nextHeight}px`;
  canvasStage.style.setProperty("--canvas-aspect", `${resizeDrag.nextWidth} / ${resizeDrag.nextHeight}`);
  canvasStage.style.width = `${resizeDrag.nextVisualWidth}px`;
}

function finishCanvasResize(event) {
  if (!resizeDrag) return;
  if (event.pointerId !== resizeDrag.pointerId) return;
  if (canvasResizeHandle.hasPointerCapture(event.pointerId)) {
    canvasResizeHandle.releasePointerCapture(event.pointerId);
  }
  if (resizeFrame) {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = 0;
    renderResizePreview();
  }
  const nextWidth = resizeDrag.nextWidth;
  const nextHeight = resizeDrag.nextHeight;
  resizeDrag = null;
  canvasStage.classList.remove("is-resizing");
  resizeCanvas(nextWidth, nextHeight);
}

function handleCanvasResizeKeydown(event) {
  const step = event.shiftKey ? 128 : 16;
  const keyAdjustments = {
    ArrowUp: [0, -step],
    ArrowRight: [step, 0],
    ArrowDown: [0, step],
    ArrowLeft: [-step, 0]
  };
  const adjustment = keyAdjustments[event.key];
  if (!adjustment) return;

  event.preventDefault();
  resizeCanvas(canvas.width + adjustment[0], canvas.height + adjustment[1]);
}

function normalizedRect(fromPoint, toPoint) {
  const x = Math.max(0, Math.min(fromPoint.x, toPoint.x));
  const y = Math.max(0, Math.min(fromPoint.y, toPoint.y));
  const right = Math.min(canvas.width, Math.max(fromPoint.x, toPoint.x));
  const bottom = Math.min(canvas.height, Math.max(fromPoint.y, toPoint.y));
  return {
    x,
    y,
    width: Math.max(0, right - x),
    height: Math.max(0, bottom - y)
  };
}

function updateSelectionBox(rect) {
  if (!rect || rect.width < 2 || rect.height < 2) {
    selectionBox.hidden = true;
    return;
  }

  selectionBox.hidden = false;
  selectionBox.style.left = `${(rect.x / canvas.width) * 100}%`;
  selectionBox.style.top = `${(rect.y / canvas.height) * 100}%`;
  selectionBox.style.width = `${(rect.width / canvas.width) * 100}%`;
  selectionBox.style.height = `${(rect.height / canvas.height) * 100}%`;
}

function clearSelection() {
  state.selectionRect = null;
  state.selectionStart = null;
  state.isSelecting = false;
  selectionBox.hidden = true;
}

function startDrawing(event) {
  event.preventDefault();
  canvas.setPointerCapture(event.pointerId);
  state.canvasRect = canvas.getBoundingClientRect();
  const point = getCanvasPoint(event);

  if (state.activeTool === "picker") {
    pickColor(point);
    return;
  }

  if (state.activeTool === "fill") {
    if (floodFill(point)) saveHistory();
    return;
  }

  if (state.activeTool === "text") {
    const text = window.prompt("Text to place on the canvas:");
    if (!text) return;
    configureBrush();
    context.font = `${Math.max(16, state.brushSize * 4)}px Inter, sans-serif`;
    context.fillText(text, point.x, point.y);
    saveHistory();
    return;
  }

  if (state.activeTool === "select") {
    state.isSelecting = true;
    state.selectionStart = point;
    state.selectionRect = null;
    updateSelectionBox(null);
    return;
  }

  if (!["pencil", "brush", "eraser", "shape"].includes(state.activeTool)) return;
  state.isDrawing = true;
  state.lastPoint = point;
  state.startPoint = point;
  state.draft = context.getImageData(0, 0, canvas.width, canvas.height);
  if (["pencil", "brush", "eraser"].includes(state.activeTool)) drawLine(point, point);
}

function continueDrawing(event) {
  const point = getCanvasPoint(event);
  cursorStatus.textContent = `✣ ${point.x}, ${point.y}px`;
  if (state.isSelecting && state.selectionStart) {
    state.selectionRect = normalizedRect(state.selectionStart, point);
    updateSelectionBox(state.selectionRect);
    return;
  }
  if (!state.isDrawing || !state.lastPoint) return;
  state.pendingPoint = point;

  if (state.frameRequest) return;
  state.frameRequest = window.requestAnimationFrame(() => {
    state.frameRequest = 0;
    renderPendingPoint();
  });
}

function renderPendingPoint() {
  const point = state.pendingPoint;
  state.pendingPoint = null;
  if (!point || !state.isDrawing || !state.lastPoint) return;

  if (["pencil", "brush", "eraser"].includes(state.activeTool)) {
    drawLine(state.lastPoint, point);
    state.lastPoint = point;
    return;
  }

  context.putImageData(state.draft, 0, 0);
  if (state.activeTool === "shape") drawShape(state.startPoint, point, state.activeShape);
}

function stopDrawing() {
  if (state.isSelecting) {
    state.isSelecting = false;
    if (!state.selectionRect || state.selectionRect.width < 2 || state.selectionRect.height < 2) {
      clearSelection();
    }
    return;
  }
  if (!state.isDrawing) return;
  if (state.frameRequest) {
    window.cancelAnimationFrame(state.frameRequest);
    state.frameRequest = 0;
    renderPendingPoint();
  }
  state.isDrawing = false;
  state.lastPoint = null;
  state.startPoint = null;
  state.draft = null;
  state.canvasRect = null;
  saveHistory();
}

function renderPalette() {
  swatches.replaceChildren();
  palette.forEach((color) => {
    const button = document.createElement("button");
    button.className = "swatch";
    button.type = "button";
    button.dataset.color = color;
    button.style.setProperty("--swatch", color);
    button.setAttribute("aria-label", `Select color ${color}`);
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => setColor(color));
    swatches.appendChild(button);
  });
  setColor(state.color);
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab));
});
toolButtons.forEach((button) => {
  button.addEventListener("click", () => setTool(button.dataset.tool));
});
shapeButtons.forEach((button) => {
  button.addEventListener("click", () => setShape(button.dataset.shape));
});
sizeButtons.forEach((button) => {
  button.addEventListener("click", () => setBrushSize(button.dataset.size));
});

canvas.addEventListener("pointerdown", startDrawing);
canvas.addEventListener("pointermove", continueDrawing);
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointerleave", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);
canvasResizeHandle.addEventListener("pointerdown", startCanvasResize);
canvasResizeHandle.addEventListener("pointermove", previewCanvasResize);
canvasResizeHandle.addEventListener("pointerup", finishCanvasResize);
canvasResizeHandle.addEventListener("pointercancel", finishCanvasResize);
canvasResizeHandle.addEventListener("keydown", handleCanvasResizeKeydown);
clearButton.addEventListener("click", clearCanvas);
newCanvasButton.addEventListener("click", clearCanvas);
openButton.addEventListener("click", () => imageOpenInput.click());
imageOpenInput.addEventListener("change", () => {
  const [file] = imageOpenInput.files;
  if (file) loadImageBlob(file);
  imageOpenInput.value = "";
});
pasteButton.addEventListener("click", async () => {
  try {
    await pasteFromClipboard();
  } catch {
    imageOpenInput.click();
  }
});
saveButton.addEventListener("click", () => {
  downloadCanvas();
  announcePaint("Canvas exported as web-paint.png.");
});
copyButton.addEventListener("click", async () => {
  try {
    const copiedToClipboard = await copyCanvasToClipboard();
    showCloudStatus("✓");
    announcePaint(copiedToClipboard ? "Canvas copied to clipboard." : "Clipboard unavailable, so the canvas was downloaded as a PNG.");
  } catch {
    showCloudStatus("!");
    announcePaint("Canvas could not be copied.");
  }
});
cutButton.addEventListener("click", async () => {
  try {
    const copiedToClipboard = await copyCanvasToClipboard();
    if (state.selectionRect) {
      const { x, y, width, height } = state.selectionRect;
      context.fillStyle = "#ffffff";
      context.fillRect(x, y, width, height);
      clearSelection();
      saveHistory();
    } else {
      clearCanvas();
    }
    showCloudStatus("✓");
    announcePaint(copiedToClipboard ? "Selection cut and copied to clipboard." : "Canvas cut and downloaded as a PNG.");
  } catch {
    showCloudStatus("!");
    announcePaint("Canvas could not be cut.");
  }
});
cloudButton.addEventListener("click", saveToBrowserStorage);
minimizeButton.addEventListener("click", () => {
  paintApp.classList.toggle("is-minimized");
  const isMinimized = paintApp.classList.contains("is-minimized");
  minimizeButton.textContent = isMinimized ? "Show tools" : "Hide tools";
  minimizeButton.setAttribute("aria-expanded", String(!isMinimized));
});
fullscreenButton.addEventListener("click", async () => {
  try {
    await toggleFullscreen();
    fullscreenButton.textContent = document.fullscreenElement ? "Exit full" : "Fullscreen";
  } catch {
    setZoom(100);
  }
});
closeButton.addEventListener("click", () => {
  window.location.href = "interactive-lab.html";
});
undoButton.addEventListener("click", () => {
  if (state.historyIndex <= 0) return;
  state.historyIndex -= 1;
  restoreHistory(state.historyIndex);
  announcePaint("Undo complete.");
});
redoButton.addEventListener("click", () => {
  if (state.historyIndex >= state.history.length - 1) return;
  state.historyIndex += 1;
  restoreHistory(state.historyIndex);
  announcePaint("Redo complete.");
});
zoomInput.addEventListener("input", (event) => setZoom(event.target.value));
zoomOutButton.addEventListener("click", () => setZoom(state.zoom - 10));
zoomInButton.addEventListener("click", () => setZoom(state.zoom + 10));
fitButton.addEventListener("click", () => setZoom(100));
viewZoomOutButton.addEventListener("click", () => setZoom(state.zoom - 10));
viewZoomInButton.addEventListener("click", () => setZoom(state.zoom + 10));
viewFitButton.addEventListener("click", () => setZoom(100));
resetViewButton.addEventListener("click", () => setZoom(100));
applyCanvasSizeButton.addEventListener("click", () => {
  resizeCanvas(canvasWidthInput.value, canvasHeightInput.value);
});
resetCanvasSizeButton.addEventListener("click", () => {
  resizeCanvas(1024, 768);
});
homeApplyCanvasSizeButton.addEventListener("click", () => {
  resizeCanvas(homeCanvasWidthInput.value, homeCanvasHeightInput.value);
});
homeResetCanvasSizeButton.addEventListener("click", () => {
  resizeCanvas(1024, 768);
});
canvasWidthInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") resizeCanvas(canvasWidthInput.value, canvasHeightInput.value);
});
canvasHeightInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") resizeCanvas(canvasWidthInput.value, canvasHeightInput.value);
});
homeCanvasWidthInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") resizeCanvas(homeCanvasWidthInput.value, homeCanvasHeightInput.value);
});
homeCanvasHeightInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") resizeCanvas(homeCanvasWidthInput.value, homeCanvasHeightInput.value);
});
fullscreenRibbonButton.addEventListener("click", async () => {
  try {
    await toggleFullscreen();
    fullscreenButton.textContent = document.fullscreenElement ? "Exit full" : "Fullscreen";
  } catch {
    setZoom(100);
  }
});
document.addEventListener("fullscreenchange", () => {
  fullscreenButton.textContent = document.fullscreenElement ? "Exit full" : "Fullscreen";
});

renderPalette();
initializeCanvas();
setActiveTab(paintApp.dataset.activeTab || "home");
setBrushSize(state.brushSize);
syncActiveControls();
