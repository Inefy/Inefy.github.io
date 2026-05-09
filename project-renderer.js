(() => {
  const data = window.PortfolioProjectData;
  if (!data) return;

  const itemsById = new Map([
    ...(data.projects || []),
    ...(data.notes || [])
  ].map((item) => [item.id, item]));

  function getCollection(name) {
    return (data.collections?.[name] || [])
      .map((id) => itemsById.get(id))
      .filter(Boolean);
  }

  function textElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    element.textContent = text;
    return element;
  }

  function appendList(parent, items, className) {
    const list = document.createElement("ul");
    if (className) {
      list.className = className;
    }

    items.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      list.appendChild(listItem);
    });

    parent.appendChild(list);
    return list;
  }

  function appendLinks(parent, links, className) {
    if (!links?.length) return;

    const wrapper = document.createElement("div");
    wrapper.className = ["card__actions", className].filter(Boolean).join(" ");

    links.forEach((link) => {
      const anchor = document.createElement("a");
      anchor.href = link.href;
      anchor.textContent = link.label;

      if (/^https?:\/\//.test(link.href)) {
        anchor.rel = "noopener noreferrer";
      }

      wrapper.appendChild(anchor);
    });

    parent.appendChild(wrapper);
  }

  function appendPicture(parent, visual) {
    if (!visual) return;

    const picture = document.createElement("picture");

    if (visual.webp) {
      const source = document.createElement("source");
      source.srcset = visual.webp;
      source.type = "image/webp";
      picture.appendChild(source);
    }

    const image = document.createElement("img");
    image.src = visual.png;
    image.alt = visual.alt || "";
    image.loading = "lazy";
    image.decoding = "async";

    if (visual.width) image.width = Number(visual.width);
    if (visual.height) image.height = Number(visual.height);

    picture.appendChild(image);
    parent.appendChild(picture);
  }

  function createVisual(visual, className) {
    const figure = document.createElement("figure");
    figure.className = ["card__media", className].filter(Boolean).join(" ");

    if (visual) {
      appendPicture(figure, visual);
    } else {
      figure.setAttribute("aria-hidden", "true");
      figure.appendChild(document.createElement("span"));
    }

    return figure;
  }

  function createWhatBuilt(project) {
    const wrapper = document.createElement("div");
    wrapper.className = "what-built-card";
    wrapper.appendChild(textElement("p", "what-built-label", "What I built"));

    if (project.whatBuiltLine) {
      wrapper.appendChild(textElement("p", "what-built-summary", project.whatBuiltLine));
    }

    appendList(wrapper, project.whatBuilt || [], "project-bullets");

    if (project.ownership) {
      wrapper.appendChild(textElement("p", "ownership-note", project.ownership));
    }

    if (project.production) {
      const readiness = textElement("p", "ownership-note", "");
      const strong = document.createElement("strong");
      strong.textContent = "Production readiness:";
      readiness.append(strong, ` ${project.production}`);
      wrapper.appendChild(readiness);
    }

    return wrapper;
  }

  function createTechStack(project) {
    if (!project.stack?.length) return null;

    const stack = document.createElement("div");
    stack.className = "tech-chip-list tech-stack";
    project.stack.forEach((item) => {
      stack.appendChild(textElement("span", "tech-chip", item));
    });
    return stack;
  }

  function createFacts(project) {
    const facts = document.createElement("dl");
    facts.className = "work-facts";

    [
      ["Stack", project.stackText || project.stack?.join(", ")],
      ["Status", project.status || project.workStatus],
      ["Updated", project.updated]
    ].forEach(([term, value]) => {
      if (!value) return;

      const row = document.createElement("div");
      row.appendChild(textElement("dt", "", term));
      row.appendChild(textElement("dd", "", value));
      facts.appendChild(row);
    });

    return facts;
  }

  function renderHomeCard(project) {
    const article = document.createElement("article");
    article.className = "card card--project project-card selected-work-card";
    article.dataset.tags = (project.tags || []).join(" ");

    article.appendChild(createVisual(project.visual, "project-visual"));

    const body = document.createElement("div");
    body.className = "card__body project-card-body";

    const meta = document.createElement("div");
    meta.className = "project-meta";
    (project.homeMeta || [project.status]).filter(Boolean).forEach((item, index) => {
      const span = document.createElement("span");
      if (index === 0) {
        const indicator = document.createElement("i");
        indicator.setAttribute("aria-hidden", "true");
        span.append(indicator, ` ${item}`);
      } else {
        span.textContent = item;
      }
      meta.appendChild(span);
    });
    body.appendChild(meta);

    body.appendChild(textElement("h3", "", project.displayTitle || project.title));
    body.appendChild(textElement("p", "project-problem", project.description));

    if (project.problemLine) {
      body.appendChild(textElement("p", "project-problem-line", project.problemLine));
    }

    body.appendChild(createWhatBuilt(project));

    const stack = createTechStack(project);
    if (stack) {
      body.appendChild(stack);
    }

    appendLinks(body, project.links, "card-actions");
    article.appendChild(body);
    return article;
  }

  function renderWorkCard(project, className = "") {
    const article = document.createElement("article");
    const cardVariant = className.includes("work-card-mini")
      ? "card--experiment experiment-card"
      : className.includes("work-card-note")
        ? "card--note note-card"
        : "card--project project-summary-card";
    article.className = ["card", cardVariant, "work-card", className].filter(Boolean).join(" ");

    if (project.visual) {
      article.appendChild(createVisual(project.visual, "work-thumb"));
    } else {
      article.appendChild(createVisual(null, "work-thumb work-thumb-notes"));
    }

    const body = document.createElement("div");
    body.className = "card__body work-card-body";

    const header = document.createElement("div");
    header.className = "card__header work-card-header";
    header.appendChild(textElement("span", "status-chip work-status", project.workStatus || project.status));
    header.appendChild(textElement("h3", "", project.displayTitle || project.title));
    body.appendChild(header);

    body.appendChild(textElement("p", "", project.description));

    if (project.problemLine) {
      const problem = textElement("p", "project-problem-line", "");
      const strong = document.createElement("strong");
      strong.textContent = "Problem:";
      problem.append(strong, ` ${project.problemLine}`);
      body.appendChild(problem);
    }

    body.appendChild(createWhatBuilt(project));
    body.appendChild(createFacts(project));
    appendLinks(body, project.workLinks || project.links, "work-links");

    article.appendChild(body);
    return article;
  }

  function appendCaseProofEntry(list, term, content) {
    if (!content) return;

    const row = document.createElement("div");
    row.appendChild(textElement("dt", "", term));

    const description = document.createElement("dd");
    if (Array.isArray(content)) {
      appendList(description, content);
    } else {
      description.textContent = content;
    }

    row.appendChild(description);
    list.appendChild(row);
  }

  function renderCaseStudyListing(project) {
    const article = document.createElement("article");
    article.className = "card card--case-study case-study-card case-study-listing";
    article.id = project.id;

    article.appendChild(createVisual(project.visual, "case-study-thumb"));

    const body = document.createElement("div");
    body.className = "card__body case-study-listing-body";

    const header = document.createElement("div");
    header.className = "card__header case-study-listing-header";
    header.appendChild(textElement("span", "status-chip work-status", project.caseStatus || project.status));
    header.appendChild(textElement("h3", "", project.displayTitle || project.title));
    body.appendChild(header);

    const proof = document.createElement("dl");
    proof.className = "case-study-proof";
    appendCaseProofEntry(proof, "Problem", project.caseProblem || project.description);

    const whatBuiltRow = document.createElement("div");
    whatBuiltRow.appendChild(textElement("dt", "", "What I built"));
    const whatBuiltDescription = document.createElement("dd");
    if (project.whatBuiltLine) {
      whatBuiltDescription.appendChild(textElement("p", "what-built-summary", project.whatBuiltLine));
    }
    appendList(whatBuiltDescription, project.whatBuilt || []);
    if (project.ownership) {
      whatBuiltDescription.appendChild(textElement("p", "ownership-note", project.ownership));
    }
    whatBuiltRow.appendChild(whatBuiltDescription);
    proof.appendChild(whatBuiltRow);

    appendCaseProofEntry(proof, "Tech stack", project.stackText || project.stack?.join(", "));
    appendCaseProofEntry(proof, "Main technical challenge", project.challenge);
    appendCaseProofEntry(proof, "Production readiness", project.production);
    appendCaseProofEntry(proof, "Testing / QA", project.testing);
    appendCaseProofEntry(proof, "Deployment / run", project.deployment);

    body.appendChild(proof);
    appendLinks(body, project.caseLinks || project.links, "work-links");

    article.appendChild(body);
    return article;
  }

  function renderCollection(container) {
    const mode = container.dataset.projectRender;
    let rendered = [];

    if (mode === "home-selected") {
      rendered = getCollection("homeSelected").map(renderHomeCard);
    } else if (mode === "work-flagship") {
      rendered = getCollection("workFlagship").map((project, index) =>
        renderWorkCard(project, index === 0 ? "work-card-featured" : "")
      );
    } else if (mode === "work-supporting") {
      rendered = getCollection("workSupporting").map((project) => renderWorkCard(project));
    } else if (mode === "work-experiments") {
      rendered = getCollection("workExperiments").map((project) => renderWorkCard(project, "work-card-mini"));
    } else if (mode === "work-notes") {
      rendered = getCollection("workNotes").map((project) => renderWorkCard(project, "work-card-note"));
    } else if (mode === "case-study-index") {
      rendered = getCollection("caseStudies").map(renderCaseStudyListing);
    }

    if (rendered.length) {
      container.replaceChildren(...rendered);
    }
  }

  document.querySelectorAll("[data-project-render]").forEach(renderCollection);
})();
