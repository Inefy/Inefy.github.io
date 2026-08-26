const { test, expect } = require("@playwright/test");

const localHosts = new Set(["127.0.0.1", "localhost", "::1"]);

const responsivePaths = [
  "/",
  "/404.html",
  "/about.html",
  "/work.html",
  "/dwellsmart.html",
  "/movie-library.html",
  "/movie-night.html",
  "/resume.html",
  "/traverseops-demo.html",
  "/paint.html",
  "/2048.html",
  "/asteroid-drift.html",
  "/brick-breaker.html",
  "/flappy-workbench.html",
  "/minefield-sweep.html",
  "/mini-golf.html",
  "/pocket-legends.html",
  "/snake-lab.html",
  "/depositproof-rental-vault/",
  "/depositproof-rental-vault/support/",
  "/depositproof-rental-vault/privacy/"
];

const responsiveViewports = [
  { width: 320, height: 720 },
  { width: 768, height: 900 },
  { width: 1024, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 }
];

async function gotoLocal(page, path) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

function primaryNav(page) {
  return page.getByRole("navigation", { name: /primary/i });
}

test.describe("static portfolio smoke paths", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/*", async (route) => {
      const { hostname } = new URL(route.request().url());
      if (localHosts.has(hostname)) {
        await route.continue();
        return;
      }

      await route.abort();
    });
  });

  test("homepage loads and primary nav reaches Work and the homepage contact panel", async ({ page }) => {
    await gotoLocal(page, "/");
    await expect(page.getByRole("heading", { name: "Zac Batten", exact: true })).toBeVisible();

    await primaryNav(page).getByRole("link", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/work\.html\?v=20260824-sharednav2$/);
    await expect(page.getByRole("heading", { name: "Work", exact: true })).toBeVisible();

    await gotoLocal(page, "/");
    await primaryNav(page).getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/\/index\.html\?v=20260824-sharednav2#contact$/);
    await expect(page.getByRole("heading", { name: "Have something useful in mind?" })).toBeVisible();
    await expect(page.locator('a[href="mailto:hello@zacbatten.me"]:visible').first()).toHaveAttribute(
      "href",
      "mailto:hello@zacbatten.me"
    );
  });

  test("homepage hero keeps a readable width on wide screens", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoLocal(page, "/");

    const heroLayout = await page.evaluate(() => {
      const copy = document.querySelector(".home-hero .hero-copy");
      const heading = document.querySelector(".home-hero h1");
      return {
        copyWidth: copy?.getBoundingClientRect().width || 0,
        headingHeight: heading?.getBoundingClientRect().height || 0,
      };
    });

    expect(heroLayout.copyWidth).toBeGreaterThan(550);
    expect(heroLayout.headingHeight).toBeLessThan(300);
  });

  test("homepage features TraverseOps, DwellSmart, and SwarmForge", async ({ page }) => {
    await gotoLocal(page, "/");

    const projects = page.locator(".home-project-grid");
    await expect(projects).toContainText("TraverseOps");
    await expect(page.getByRole("link", { name: "Visit TraverseOps" })).toHaveAttribute("href", "https://traverseops.app/landing.html");
    await expect(projects).toContainText("DwellSmart");
    await expect(projects).toContainText("SwarmForge");
    await expect(page.getByRole("link", { name: "Visit DwellSmart" })).toHaveAttribute("href", "https://dwellsmart.ai/");
    await expect(page.getByRole("link", { name: "View SwarmForge on GitHub" })).toHaveAttribute("href", "https://github.com/Inefy/SwarmForge");
    await expect(page.locator(".project-card-icon--muni img")).toHaveAttribute("src", "assets/project-logo-traverseops.png");
    await expect(page.locator(".project-card-icon--dwell img")).toHaveAttribute("src", "assets/project-logo-dwellsmart.png");
    await expect(page.locator(".project-card-icon--swarm img")).toHaveAttribute("src", "assets/project-logo-swarmforge.png");
    await expect(page.getByText("Cloudflare", { exact: true }).locator("xpath=preceding-sibling::span/img")).toHaveAttribute("src", "assets/tech-cloudflare.svg");
  });

  test("homepage Say hello button stays readable and reaches contact", async ({ page }) => {
    await gotoLocal(page, "/");

    const sayHello = page.getByRole("link", { name: "Say hello" });
    await expect(sayHello).toHaveAttribute("href", "#contact");
    await sayHello.hover();
    await expect(sayHello).toHaveCSS("background-color", "rgb(23, 103, 216)");
    await expect(sayHello).toHaveCSS("color", "rgb(255, 255, 255)");

    await sayHello.click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.getByRole("heading", { name: "Have something useful in mind?" })).toBeVisible();
  });

  test("Work page shows the flagship projects", async ({ page }) => {
    await gotoLocal(page, "/work.html");

    const projects = page.locator(".builds");
    await expect(projects).toBeVisible();
    await expect(projects).toContainText("DwellSmart");
    await expect(page.getByRole("link", { name: "Open the DwellSmart project page" })).toHaveAttribute("href", "dwellsmart.html");
    await expect(projects).toContainText("TraverseOps");
    await expect(projects).toContainText("MovieBot");
    await expect(page.getByText("Web Paint", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Judy Batten Wellness", { exact: true })).toHaveCount(0);
  });

  test("inner pages keep the same primary navigation as Home", async ({ page }) => {
    const sharedHeaderPages = [
      "/",
      "/work.html",
      "/about.html",
      "/dwellsmart.html",
      "/resume.html",
      "/movie-library.html",
      "/movie-night.html",
      "/traverseops-demo.html",
      "/404.html"
    ];

    for (const path of sharedHeaderPages) {
      await gotoLocal(page, path);
      await expect(primaryNav(page).getByRole("link")).toHaveText(["Work", "About", "Skills", "Contact"]);
      const footer = page.locator(".site-footer");
      await expect(footer.locator(".footer-brand strong")).toHaveText("zac");
      await expect(footer).toContainText("Zac Batten");
      await expect(footer.locator(".footer-meta")).toHaveText("St. John’s, Newfoundland & Labrador");
      await expect(footer.locator(".footer-sail")).toHaveCount(1);
    }
  });

  test("Resume page exposes contact links", async ({ page }) => {
    await gotoLocal(page, "/resume.html");

    await expect(page.getByRole("heading", { name: "Resume", exact: true })).toBeVisible();
    await expect(page.locator('a[href="mailto:hello@zacbatten.me"]:visible').first()).toBeVisible();
    await expect(page.locator('a[href*="github.com/Inefy"]:visible').first()).toBeVisible();
    await expect(page.locator('a[href*="linkedin.com/in/zac-batten"]:visible').first()).toBeVisible();
    await expect(page.locator('a[href="index.html"]:visible').first()).toBeVisible();
  });

  test("About page presents a full-stack focus", async ({ page }) => {
    await gotoLocal(page, "/about.html");

    const snapshot = page.locator(".about-snapshot");
    await expect(snapshot).toContainText(/Full-stack(?: software)? developer/);
    await expect(snapshot).not.toContainText("Frontend + automation");
  });

  test("Cape Spear scene keeps the lighthouse in front of the animated coast", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoLocal(page, "/");

    const scene = page.locator(".coastal-scene--animated");
    await expect(page.locator("[data-scene-motion-toggle]")).toHaveCount(0);
    await expect(scene.locator(".scene-beacon")).toHaveCount(0);
    await expect(scene.locator(".scene-water")).toHaveCount(0);
    await expect(scene.locator(".scene-bird")).toHaveCount(3);
    const sceneSequence = scene.locator("[data-cape-spear-sequence]");
    await expect(sceneSequence).toHaveCount(1);
    await expect(sceneSequence).toHaveAttribute("src", /assets\/cape-spear-animated-frame-000[0-8]\.png/);
    const birdFrameStyles = await scene.locator(".scene-bird").first().evaluate((bird) => {
      const frame = getComputedStyle(bird, "::before");
      return {
        backgroundImage: frame.backgroundImage,
        animationName: frame.animationName,
        animationDuration: frame.animationDuration
      };
    });
    expect(birdFrameStyles.backgroundImage).toContain("cape-spear-bird-flap-frames.png");
    expect(birdFrameStyles.animationName).toBe("coastal-bird-flap");
    expect(birdFrameStyles.animationDuration).toBe("0.9s");
    const initialFrame = await sceneSequence.getAttribute("src");
    await page.waitForTimeout(1100);
    await expect.poll(() => sceneSequence.getAttribute("src")).not.toBe(initialFrame);
    await expect(sceneSequence).toHaveCSS("clip-path", "none");
  });

  test("Movie Library loads and filters to a copyable vote command", async ({ page }) => {
    await gotoLocal(page, "/movie-library.html");
    await expect(page.getByRole("heading", { name: /public domain movie picks/i })).toBeVisible();

    const movieGrid = page.locator("#movie-grid");
    await expect(movieGrid).toBeVisible();
    await expect(movieGrid.locator(".movie-card")).toHaveCount(110);
    await expect(page.getByRole("link", { name: /show matching results/i })).toHaveCount(0);

    await page.getByLabel(/search movies/i).fill("nosferatu");

    await expect(movieGrid.locator(".movie-card")).toHaveCount(1);
    await expect(movieGrid).toContainText("Nosferatu");
    await expect(page.getByRole("button", { name: /copy vote command for nosferatu/i })).toBeVisible();
    await expect(page.locator("[data-movie-results]")).toContainText(/matching movies/i);
  });

  test("Movie Night keeps useful fallback UI when third-party embeds and posters are blocked", async ({ page }) => {
    await gotoLocal(page, "/movie-night.html");
    await expect(page.getByRole("heading", { name: "Zurra3 Movie Night" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Load stream" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Load chat" })).toBeVisible();

    const posterPreview = page.locator(".movie-preview-posters");
    await posterPreview.scrollIntoViewIfNeeded();
    await expect(page.locator(".movie-preview-tile.is-missing")).toHaveCount(4);
    await expect(page.getByRole("link", { name: /open the full movie library/i })).toBeVisible();
  });

  test("Web Paint loads the canvas and core tool controls", async ({ page }) => {
    await gotoLocal(page, "/paint.html");

    await expect(page.locator("#paintCanvas")).toBeVisible();
    await expect(page.getByRole("button", { name: "Pencil" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Rectangle" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Redo" })).toBeVisible();
  });

  test("TraverseOps public demo loads and map controls work", async ({ page }) => {
    await gotoLocal(page, "/traverseops-demo.html");
    await expect(page.getByRole("heading", { name: /field operations map and work orders/i })).toBeVisible();

    await page.getByRole("button", { name: "NH-022" }).click();
    await expect(page.locator("[data-selected-name]")).toContainText("Hydrant NH-022");

    const openWorkFilter = page.getByRole("button", { name: "Open work" });
    await openWorkFilter.click();
    await expect(openWorkFilter).toHaveAttribute("aria-pressed", "true");
  });

  test("DepositProof support pages expose support, privacy, and contact paths", async ({ page }) => {
    await gotoLocal(page, "/depositproof-rental-vault/");
    await expect(page.getByRole("heading", { name: "DepositProof: Rental Vault" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "./privacy/");

    await page.getByRole("link", { name: "Support" }).click();
    await expect(page).toHaveURL(/\/depositproof-rental-vault\/support\/$/);
    await expect(page.getByRole("heading", { name: "DepositProof Support" })).toBeVisible();
    await expect(page.getByRole("link", { name: "hello@zacbatten.me" }).first()).toHaveAttribute(
      "href",
      "mailto:hello@zacbatten.me?subject=DepositProof%20support%20request"
    );

    await gotoLocal(page, "/depositproof-rental-vault/privacy/");
    await expect(page.getByRole("heading", { name: "DepositProof Privacy Policy" })).toBeVisible();
    await expect(page.getByText("Effective date: May 13, 2026")).toBeVisible();
    await expect(page.getByRole("link", { name: "DepositProof Support" })).toHaveAttribute("href", "../support/");
  });

  for (const viewport of responsiveViewports) {
    test(`public pages avoid viewport overflow at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);

      for (const path of responsivePaths) {
        await gotoLocal(page, path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );

        expect(overflow, `${path} overflows the ${viewport.width}px viewport`).toBeLessThanOrEqual(1);
      }
    });
  }
});
