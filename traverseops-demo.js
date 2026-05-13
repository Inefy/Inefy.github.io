(() => {
const traverseAssets = [
  {
    id: "NH-014",
    name: "Hydrant NH-014",
    status: "needs-inspection",
    statusLabel: "Needs inspection",
    zone: "North Harbor",
    priority: "High",
    openWork: 1,
    description: "Last inspected 91 days ago near Pier Road. Flow test is due and one open work order is attached."
  },
  {
    id: "NH-022",
    name: "Hydrant NH-022",
    status: "healthy",
    statusLabel: "Healthy",
    zone: "North Harbor",
    priority: "Low",
    openWork: 0,
    description: "Recent inspection passed. Access is clear and no follow-up work is currently open."
  },
  {
    id: "NH-031",
    name: "Valve NH-031",
    status: "work-open",
    statusLabel: "Open work",
    zone: "Warehouse Row",
    priority: "Urgent",
    openWork: 2,
    description: "Supervisor review requested after pressure notes and two open work orders from the last inspection."
  },
  {
    id: "NH-044",
    name: "Hydrant NH-044",
    status: "needs-inspection",
    statusLabel: "Needs inspection",
    zone: "Market Street",
    priority: "Medium",
    openWork: 0,
    description: "Inspection window is coming due. Crew should confirm marker visibility and winter access."
  },
  {
    id: "NH-058",
    name: "Pump Station NH-058",
    status: "work-open",
    statusLabel: "Open work",
    zone: "South Dock",
    priority: "High",
    openWork: 1,
    description: "Preventive maintenance task is assigned after vibration notes from the last field visit."
  }
];

const baseInspections = [
  { assetId: "NH-014", condition: "Needs follow-up", notes: "Flow cap needs follow-up before next hydrant cycle." },
  { assetId: "NH-022", condition: "Good", notes: "Access clear. Marker and cap visible from street." }
];

const baseWorkOrders = [
  { assetId: "NH-014", priority: "High", assignee: "Field crew A", summary: "Confirm flow access and update condition after cap review." },
  { assetId: "NH-031", priority: "Urgent", assignee: "Supervisor review", summary: "Review pressure notes and schedule repair window." }
];

const traverseState = {
  assets: [...traverseAssets],
  inspections: [...baseInspections],
  workOrders: [...baseWorkOrders],
  selectedAssetId: "NH-014",
  filter: "all"
};

const traverseStatus = document.querySelector("[data-traverse-status]");
const tabButtons = document.querySelectorAll("[data-traverse-tab]");
const panels = document.querySelectorAll("[data-traverse-panel]");
const markerButtons = document.querySelectorAll("[data-asset-id]");
const filterButtons = document.querySelectorAll("[data-map-filter]");
const assetList = document.querySelector("[data-asset-list]");
const assetEmpty = document.querySelector("[data-asset-empty]");
const mapEmpty = document.querySelector("[data-map-empty]");
const inspectionList = document.querySelector("[data-inspection-list]");
const inspectionEmpty = document.querySelector("[data-inspection-empty]");
const workList = document.querySelector("[data-work-list]");
const workEmpty = document.querySelector("[data-work-empty]");
const reportGrid = document.querySelector("[data-report-grid]");
const reportEmpty = document.querySelector("[data-report-empty]");
const importSteps = document.querySelector("[data-import-steps]");
const roleSelect = document.querySelector("[data-traverse-role]");
const inspectionForm = document.querySelector("[data-inspection-form]");
const workForm = document.querySelector("[data-work-form]");
const inspectionAssetSelect = document.querySelector("[data-inspection-asset]");
const workAssetSelect = document.querySelector("[data-work-asset]");

function announceTraverse(message) {
  if (traverseStatus) {
    traverseStatus.textContent = message;
  }
}

function assetById(id) {
  return traverseState.assets.find((asset) => asset.id === id) || traverseState.assets[0];
}

function showTraverseTab(tabName) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.traverseTab === tabName;
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
    button.classList.toggle("active", isActive);
  });

  panels.forEach((panel) => {
    const isActive = panel.dataset.traversePanel === tabName;
    panel.hidden = !isActive;
    panel.classList.toggle("active", isActive);
  });

  document.querySelector(`[data-traverse-tab="${tabName}"]`)?.scrollIntoView({
    inline: "nearest",
    block: "nearest"
  });
}

function visibleAssets() {
  if (traverseState.filter === "all") return traverseState.assets;
  return traverseState.assets.filter((asset) => asset.status === traverseState.filter);
}

function setSelectedAsset(assetId) {
  const selected = assetById(assetId);
  if (!selected) return;

  traverseState.selectedAssetId = selected.id;
  document.querySelector("[data-selected-status]").textContent = selected.statusLabel;
  document.querySelector("[data-selected-name]").textContent = selected.name;
  document.querySelector("[data-selected-description]").textContent = selected.description;
  document.querySelector("[data-selected-zone]").textContent = selected.zone;
  document.querySelector("[data-selected-priority]").textContent = selected.priority;
  document.querySelector("[data-selected-work]").textContent = String(selected.openWork);

  markerButtons.forEach((marker) => {
    const isActive = marker.dataset.assetId === selected.id;
    marker.classList.toggle("active", isActive);
    marker.setAttribute("aria-pressed", String(isActive));
  });

  if (inspectionAssetSelect) inspectionAssetSelect.value = selected.id;
  if (workAssetSelect) workAssetSelect.value = selected.id;
}

function renderMarkers() {
  const matchingIds = new Set(visibleAssets().map((asset) => asset.id));
  markerButtons.forEach((marker) => {
    marker.hidden = !matchingIds.has(marker.dataset.assetId);
  });

  if (mapEmpty) {
    mapEmpty.hidden = matchingIds.size > 0;
  }

  if (!matchingIds.has(traverseState.selectedAssetId) && matchingIds.size > 0) {
    setSelectedAsset([...matchingIds][0]);
  }
}

function createCard(title, meta, body, actions = []) {
  const card = document.createElement("article");
  card.className = "traverse-record-card";

  const heading = document.createElement("h4");
  heading.textContent = title;

  const detail = document.createElement("p");
  detail.className = "traverse-record-meta";
  detail.textContent = meta;

  const copy = document.createElement("p");
  copy.textContent = body;

  card.append(heading, detail, copy);

  if (actions.length > 0) {
    const actionRow = document.createElement("div");
    actionRow.className = "traverse-record-actions";
    actions.forEach((action) => actionRow.appendChild(action));
    card.appendChild(actionRow);
  }

  return card;
}

function renderAssetOptions() {
  [inspectionAssetSelect, workAssetSelect].forEach((select) => {
    if (!select) return;
    select.replaceChildren(...traverseState.assets.map((asset) => {
      const option = document.createElement("option");
      option.value = asset.id;
      option.textContent = `${asset.id} - ${asset.statusLabel}`;
      return option;
    }));
  });

  setSelectedAsset(traverseState.selectedAssetId);
}

function renderAssetList() {
  if (!assetList) return;

  const cards = traverseState.assets.map((asset) => {
    const inspectButton = document.createElement("button");
    inspectButton.type = "button";
    inspectButton.textContent = "Inspect";
    inspectButton.addEventListener("click", () => {
      setSelectedAsset(asset.id);
      showTraverseTab("inspections");
      announceTraverse(`Inspection form opened for ${asset.name}.`);
    });

    const workButton = document.createElement("button");
    workButton.type = "button";
    workButton.textContent = "Work order";
    workButton.addEventListener("click", () => {
      setSelectedAsset(asset.id);
      showTraverseTab("work");
      announceTraverse(`Work-order form opened for ${asset.name}.`);
    });

    return createCard(asset.name, `${asset.zone} / ${asset.statusLabel} / ${asset.priority}`, asset.description, [inspectButton, workButton]);
  });

  assetList.replaceChildren(...cards);
  if (assetEmpty) assetEmpty.hidden = cards.length > 0;
}

function renderInspections() {
  if (!inspectionList) return;

  const cards = traverseState.inspections.map((inspection) => {
    const asset = assetById(inspection.assetId);
    return createCard(asset.name, `Condition: ${inspection.condition}`, inspection.notes);
  });

  inspectionList.replaceChildren(...cards);
  if (inspectionEmpty) inspectionEmpty.hidden = cards.length > 0;
}

function renderWorkOrders() {
  if (!workList) return;

  const cards = traverseState.workOrders.map((workOrder) => {
    const asset = assetById(workOrder.assetId);
    return createCard(asset.name, `${workOrder.priority} priority / ${workOrder.assignee}`, workOrder.summary);
  });

  workList.replaceChildren(...cards);
  if (workEmpty) workEmpty.hidden = cards.length > 0;
}

function renderReports() {
  if (!reportGrid) return;

  const needsInspection = traverseState.assets.filter((asset) => asset.status === "needs-inspection").length;
  const openWork = traverseState.workOrders.length;
  const urgentWork = traverseState.workOrders.filter((workOrder) => workOrder.priority === "Urgent").length;
  const inspections = traverseState.inspections.length;

  const reports = [
    ["Assets loaded", traverseState.assets.length, "Sample records currently in the registry."],
    ["Need inspection", needsInspection, "Records flagged for field follow-up."],
    ["Open work orders", openWork, "Assigned tasks tied back to assets."],
    ["Urgent work", urgentWork, "Tasks that need supervisor review."],
    ["Inspection records", inspections, "Field notes saved in this demo session."]
  ];

  const cards = reports.map(([label, value, detail]) => {
    const card = document.createElement("article");
    card.className = "traverse-report-card";

    const labelElement = document.createElement("span");
    labelElement.textContent = label;

    const valueElement = document.createElement("strong");
    valueElement.textContent = String(value);

    const detailElement = document.createElement("p");
    detailElement.textContent = detail;

    card.append(labelElement, valueElement, detailElement);
    return card;
  });

  reportGrid.replaceChildren(...cards);
  if (reportEmpty) reportEmpty.hidden = cards.length > 0;
}

function renderImportSteps(validated = false) {
  if (!importSteps) return;

  const validationStep = importSteps.children[2];
  if (!validationStep) return;

  validationStep.classList.toggle("complete", validated);
  validationStep.querySelector("strong").textContent = validated ? "Validation passed" : "Validation pending";
  validationStep.querySelector("span").textContent = validated
    ? "Coordinates, duplicate IDs, and required fields passed for the sample rows."
    : "Run validation to check coordinates and duplicate IDs.";
}

function renderTraverseDemo() {
  renderAssetOptions();
  renderMarkers();
  renderAssetList();
  renderInspections();
  renderWorkOrders();
  renderReports();
}

function resetTraverseData() {
  traverseState.assets = [...traverseAssets];
  traverseState.inspections = [...baseInspections];
  traverseState.workOrders = [...baseWorkOrders];
  traverseState.selectedAssetId = "NH-014";
  traverseState.filter = "all";
  filterButtons.forEach((button) => {
    const isAll = button.dataset.mapFilter === "all";
    button.classList.toggle("active", isAll);
    button.setAttribute("aria-pressed", String(isAll));
  });
  renderImportSteps(false);
  renderTraverseDemo();
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showTraverseTab(button.dataset.traverseTab);
  });

  button.addEventListener("keydown", (event) => {
    const tabs = [...tabButtons];
    const currentIndex = tabs.indexOf(button);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    tabs[nextIndex].focus();
    showTraverseTab(tabs[nextIndex].dataset.traverseTab);
  });
});

markerButtons.forEach((marker) => {
  marker.addEventListener("click", () => {
    setSelectedAsset(marker.dataset.assetId);
    announceTraverse(`${assetById(marker.dataset.assetId).name} selected.`);
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    traverseState.filter = button.dataset.mapFilter;
    filterButtons.forEach((filterButton) => {
      const active = filterButton === button;
      filterButton.classList.toggle("active", active);
      filterButton.setAttribute("aria-pressed", String(active));
    });
    renderMarkers();
    announceTraverse(`${button.textContent} asset filter applied.`);
  });
});

document.querySelectorAll("[data-load-sample]").forEach((button) => {
  button.addEventListener("click", () => {
    resetTraverseData();
    announceTraverse("Sample data loaded. Five assets, two inspections, and two work orders are available.");
  });
});

document.querySelector("[data-reset-demo]")?.addEventListener("click", () => {
  resetTraverseData();
  showTraverseTab("map");
  announceTraverse("Demo reset to the default map workspace.");
});

document.querySelector("[data-validate-import]")?.addEventListener("click", () => {
  renderImportSteps(true);
  announceTraverse("Sample import validation passed. Commit remains disabled in the public demo.");
});

document.querySelector("[data-start-inspection]")?.addEventListener("click", () => {
  showTraverseTab("inspections");
  if (inspectionAssetSelect) inspectionAssetSelect.value = traverseState.selectedAssetId;
  announceTraverse(`Inspection form opened for ${assetById(traverseState.selectedAssetId).name}.`);
});

document.querySelector("[data-create-work]")?.addEventListener("click", () => {
  showTraverseTab("work");
  if (workAssetSelect) workAssetSelect.value = traverseState.selectedAssetId;
  announceTraverse(`Work-order form opened for ${assetById(traverseState.selectedAssetId).name}.`);
});

roleSelect?.addEventListener("change", () => {
  announceTraverse(`${roleSelect.value} role selected. Controls remain sample-data only.`);
});

inspectionForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const assetId = inspectionForm.querySelector("[data-inspection-asset]").value;
  const condition = inspectionForm.querySelector("[data-inspection-condition]").value;
  const notes = inspectionForm.querySelector("[data-inspection-notes]").value.trim() || "Inspection saved without additional notes.";
  traverseState.inspections.unshift({ assetId, condition, notes });
  renderInspections();
  renderReports();
  announceTraverse(`Inspection saved for ${assetById(assetId).name}.`);
});

workForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const assetId = workForm.querySelector("[data-work-asset]").value;
  const priority = workForm.querySelector("[data-work-priority]").value;
  const assignee = workForm.querySelector("[data-work-assignee]").value.trim() || "Unassigned";
  const summary = workForm.querySelector("[data-work-summary]").value.trim() || "Work order created without a summary.";
  traverseState.workOrders.unshift({ assetId, priority, assignee, summary });
  renderWorkOrders();
  renderReports();
  announceTraverse(`Work order created for ${assetById(assetId).name}.`);
});

showTraverseTab("map");
renderTraverseDemo();
})();
