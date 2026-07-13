const { test, expect } = require("@playwright/test");

const localHosts = new Set(["127.0.0.1", "localhost", "::1"]);

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

  test("homepage loads and primary nav reaches Work, Resume, and Contact", async ({ page }) => {
    await gotoLocal(page, "/");
    await expect(page.getByRole("heading", { name: /software for people with work to do/i })).toBeVisible();

    await primaryNav(page).locator("[data-nav-group]").hover();
    await primaryNav(page).getByRole("link", { name: /all work/i }).click();
    await expect(page).toHaveURL(/\/work\.html$/);
    await expect(page.getByRole("heading", { name: /^selected work/i })).toBeVisible();

    await gotoLocal(page, "/");
    await primaryNav(page).getByRole("link", { name: "Resume" }).click();
    await expect(page).toHaveURL(/\/resume\.html$/);
    await expect(page.getByRole("heading", { name: "Zac Batten" })).toBeVisible();

    await gotoLocal(page, "/");
    await primaryNav(page).getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/\/contact\.html$/);
    await expect(page.getByRole("heading", { name: /let.?s talk/i })).toBeVisible();
  });

  test("Work page shows the flagship projects", async ({ page }) => {
    await gotoLocal(page, "/work.html");

    const flagship = page.locator("#flagship-case-studies");
    await expect(flagship).toBeVisible();
    await expect(flagship).toContainText("TraverseOps");
    await expect(flagship).toContainText("StreamCinema Vote Bot");
    await expect(flagship).toContainText("Web Paint");
  });

  test("Resume page exposes contact links", async ({ page }) => {
    await gotoLocal(page, "/resume.html");

    await expect(page.getByRole("heading", { name: "Zac Batten" })).toBeVisible();
    await expect(page.locator('a[href="mailto:hello@zacbatten.me"]').first()).toBeVisible();
    await expect(page.locator('a[href*="github.com/Inefy"]').first()).toBeVisible();
    await expect(page.locator('a[href*="linkedin.com/in/zac-batten"]').first()).toBeVisible();
    await expect(page.locator('a[href="index.html"]').first()).toBeVisible();
  });

  test("Movie Library loads and filters to a copyable vote command", async ({ page }) => {
    await gotoLocal(page, "/movie-library.html");
    await expect(page.getByRole("heading", { name: /public domain movie picks/i })).toBeVisible();

    await page.getByLabel(/search movies/i).fill("nosferatu");

    const movieGrid = page.locator("#movie-grid");
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

  test("TraverseOps case study links into the public demo and map controls work", async ({ page }) => {
    await gotoLocal(page, "/traverseops-case-study.html");
    await expect(page.getByRole("heading", { name: "TraverseOps", exact: true })).toBeVisible();

    await page.getByRole("link", { name: /open public app/i }).first().click();
    await expect(page).toHaveURL(/\/traverseops-demo\.html$/);
    await expect(page.getByRole("heading", { name: /field operations map and work orders/i })).toBeVisible();

    await page.getByRole("button", { name: "NH-022" }).click();
    await expect(page.locator("[data-selected-name]")).toContainText("Hydrant NH-022");

    const openWorkFilter = page.getByRole("button", { name: "Open work" });
    await openWorkFilter.click();
    await expect(openWorkFilter).toHaveAttribute("aria-pressed", "true");
  });

  test("Interactive Lab archive loads the browser experiment index", async ({ page }) => {
    await gotoLocal(page, "/interactive-lab.html");

    await expect(page.getByRole("heading", { name: /browser mechanics experiments/i })).toBeVisible();
    await expect(page.locator("#lab-skill-map")).toContainText("Canvas rendering");
    await expect(page.locator("#lab-archive")).toContainText("Web Paint");
    await expect(page.locator("#lab-archive")).toContainText("Mini Golf");
    await expect(page.getByRole("link", { name: /live tool/i }).first()).toHaveAttribute("href", "paint.html");
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
});
