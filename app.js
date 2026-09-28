const STATUS_ORDER = ["mvp", "playable", "wip", "archived"];
const STATUS_LABELS = {
  mvp: "MVP.",
  playable: "Playable.",
  wip: "WIP.",
  archived: "Archived.",
};

const appEl = document.getElementById("app");
const loadErrorEl = document.getElementById("load-error");
const statusNavEl = document.getElementById("status-nav");

const modalEl = document.getElementById("wip-modal");
const modalTitleEl = document.getElementById("wip-modal-title");
const modalSummaryEl = document.getElementById("wip-modal-summary");
const modalNoteEl = document.getElementById("wip-modal-note");
const modalLinkEl = document.getElementById("wip-modal-link");

function actionLabel(project) {
  if (project.type === "external-link") return "Visit";
  if (project.status === "wip") return "See details";
  return "Launch demo";
}

function createThumb(project) {
  if (project.thumbnail) {
    const img = document.createElement("img");
    img.className = "card-thumb";
    img.src = project.thumbnail;
    img.alt = "";
    img.loading = "lazy";
    img.addEventListener("error", () => {
      img.replaceWith(createPlaceholder(project));
    });
    return img;
  }
  return createPlaceholder(project);
}

function createPlaceholder(project) {
  const div = document.createElement("div");
  div.className = "card-thumb-placeholder";
  div.textContent = (project.name || "?").trim().charAt(0).toUpperCase() || "?";
  return div;
}

function createCard(project) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "card";

  card.appendChild(createThumb(project));

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = project.name;
  body.appendChild(title);

  const summary = document.createElement("p");
  summary.className = "card-summary";
  summary.textContent = project.summary || "";
  body.appendChild(summary);

  const action = document.createElement("span");
  action.className = "card-action";
  action.textContent = actionLabel(project);
  body.appendChild(action);

  card.appendChild(body);

  if (project.status === "wip") {
    card.addEventListener("click", () => openWipModal(project));
  } else if (project.url) {
    card.addEventListener("click", () => window.open(project.url, "_blank", "noopener"));
  } else {
    card.disabled = true;
  }

  return card;
}

function createArchivedCard(project) {
  const card = document.createElement("div");
  card.className = "card is-archived";
  card.appendChild(createThumb(project));

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = project.name;
  body.appendChild(title);

  const summary = document.createElement("p");
  summary.className = "card-summary";
  summary.textContent = project.summary || "";
  body.appendChild(summary);

  card.appendChild(body);
  return card;
}

function openWipModal(project) {
  modalTitleEl.textContent = project.name;
  modalSummaryEl.textContent = project.summary || "";

  if (project.note) {
    modalNoteEl.textContent = project.note;
    modalNoteEl.hidden = false;
  } else {
    modalNoteEl.textContent = "";
    modalNoteEl.hidden = true;
  }

  if (project.url) {
    modalLinkEl.href = project.url;
    modalLinkEl.hidden = false;
    modalLinkEl.textContent = project.type === "external-link" ? "Visit" : "Open demo";
  } else {
    modalLinkEl.hidden = true;
  }

  modalEl.hidden = false;
}

function closeWipModal() {
  modalEl.hidden = true;
}

modalEl.addEventListener("click", (event) => {
  if (event.target.dataset.closeModal !== undefined) closeWipModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalEl.hidden) closeWipModal();
});

function renderSection(status, projects) {
  const sectionId = `section-${status}`;
  const grid = document.createElement("div");
  grid.className = "card-grid";
  projects.forEach((project) => {
    grid.appendChild(status === "archived" ? createArchivedCard(project) : createCard(project));
  });

  if (status === "archived") {
    const details = document.createElement("details");
    details.className = "status-section";
    details.id = sectionId;

    const summary = document.createElement("summary");
    const summaryInner = document.createElement("div");
    summaryInner.className = "status-section-inner";
    const heading = document.createElement("h2");
    heading.className = "section-heading";
    heading.textContent = STATUS_LABELS[status];
    summaryInner.appendChild(heading);
    summary.appendChild(summaryInner);
    details.appendChild(summary);

    const gridWrap = document.createElement("div");
    gridWrap.className = "status-section-inner";
    gridWrap.appendChild(grid);
    details.appendChild(gridWrap);

    return details;
  }

  const section = document.createElement("section");
  section.className = "status-section";
  section.id = sectionId;

  const inner = document.createElement("div");
  inner.className = "status-section-inner";
  const heading = document.createElement("h2");
  heading.className = "section-heading";
  heading.textContent = STATUS_LABELS[status];
  inner.appendChild(heading);
  inner.appendChild(grid);
  section.appendChild(inner);

  return section;
}

function renderStatusNav(presentStatuses) {
  if (presentStatuses.length === 0) return;
  const inner = document.createElement("div");
  inner.className = "status-nav-inner";
  presentStatuses.forEach((status) => {
    const link = document.createElement("a");
    link.href = `#section-${status}`;
    link.textContent = STATUS_LABELS[status].replace(/\.$/, "");
    inner.appendChild(link);
  });
  statusNavEl.appendChild(inner);
}

function render(manifest) {
  const projects = Array.isArray(manifest.projects) ? manifest.projects : [];
  const byStatus = {};
  projects.forEach((project) => {
    const status = project.status;
    if (!byStatus[status]) byStatus[status] = [];
    byStatus[status].push(project);
  });

  const presentStatuses = STATUS_ORDER.filter((status) => byStatus[status] && byStatus[status].length > 0);
  renderStatusNav(presentStatuses);

  presentStatuses.forEach((status) => {
    appEl.appendChild(renderSection(status, byStatus[status]));
  });
}

function showLoadError() {
  loadErrorEl.hidden = false;
}

fetch("manifest.json")
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  })
  .then((text) => {
    let manifest;
    try {
      manifest = JSON.parse(text);
    } catch (err) {
      throw new Error("Invalid JSON in manifest.json");
    }
    render(manifest);
  })
  .catch((err) => {
    console.error("Failed to load manifest.json:", err);
    showLoadError();
  });
