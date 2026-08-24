# Zac Batten Portfolio

Static GitHub Pages portfolio for [zacbatten.me](https://zacbatten.me). Minimal by design: the work is shown, not described.

## Review Path

- [Homepage](https://zacbatten.me) — name, one line, four projects, contact.
- [Work](https://zacbatten.me/work.html) — projects and experiments.
- [Muni Assets](https://zacbatten.me/traverseops-demo.html) — field operations mock.
- [Web Paint](https://zacbatten.me/paint.html) — browser drawing tool.
- [Resume](https://zacbatten.me/resume.html)

## Contents

- Homepage, Work, About, Resume, Contact, Lab.
- No share images: `og:image`/`twitter:image` were removed rather than ship a stale screenshot. Add one back only with a current capture.
- Live apps: Web Paint, Movie Library, Movie Night, plus the Muni Assets mock.
- Eight browser demos plus Pocket Legends.
- Plain files on GitHub Pages, no build step.

## Local Commands

Clone and preview the static site:

```bash
git clone https://github.com/Inefy/Inefy.github.io.git
cd Inefy.github.io
python -m http.server 8000
```

Then open `http://localhost:8000`.

Install QA dependencies only when running checks:

```bash
npm ci
npx playwright install chromium
```

Run checks:

```bash
npm run check:js
npm run check:html
npm run check:links
npm run test:smoke
npm run quality
```

## Quality Checks

- `npm run check:js` recursively runs `node --check` for `.js` and `.mjs` files.
- `npm run check:html` checks required page metadata, Content Security Policy coverage, inline script/style CSP hashes, image attributes, and safe new-tab links.
- `npm run check:links` checks local links, hash anchors, scripts, stylesheets, images, and `srcset` assets across `.html` files without external network checks.
- `npm run test:smoke` starts `python -m http.server 8000` through Playwright and checks the highest-value public paths.
- `.github/workflows/site-quality.yml` runs `npm ci`, JS syntax checks, HTML quality checks, internal link checks, installs Chromium, and runs the Playwright smoke tests on pull requests and pushes to `main`.

## Frontend Architecture

Deliberately small. Keep it that way.

- `site.css` (~36 KB) — the single stylesheet. One layer, no overrides.
- `demos.css` — the three sample-app surfaces only.
- `shared.js` (~10 KB) — theme toggle, mobile nav, active nav, hover prefetch, scroll reveal, print, clock.
- `terrain.js` (~9 KB) — faint animated contour field behind the homepage name. Marching squares over 3D value noise. Homepage only.
- Game pages are standalone with their own CSS and no site shell.

Rules:

- **One layout primitive.** Every band gets `padding-inline: var(--pad-x)` where `--pad-x: max(var(--gutter), calc((100% - var(--measure)) / 2))`. Never add per-section `max-width` + `margin: auto`.
- **Three breakpoints:** 1200 / 900 / 640. The 900px nav collapse is mirrored in `shared.js` as `mobileNavQuery` — change both.
- **Three colours:** `--lime` (actions, current state), `--blue` (data, terrain, code), `--amber` (live status only). Every pair passes WCAG AA in both themes.
- **12px type floor.** Cut a label rather than shrink it.
- **No inline `style` attributes** — `check:html` rejects them. Reveal stagger uses `data-reveal-delay="1..6"`.
- **Never claim a pseudo-element twice.** A section-level `::after` merges with any band rule that already uses it. That once rendered the contact band as a 300px lime disc.
- **No override layers.** Edit the rule.

## Writing

The site is short on purpose. Name things, don't narrate them.

- Project entries are: name, one sentence, links. Add "Built with" only when it is verifiable from the source in this repo. No years unless you know them, no takeaways, no origin stories.
- No section is a paragraph of philosophy. If a sentence could appear on any developer's site, delete it.
- Links go straight to the live app or the repo.

## Image Standards

- Prefer `.webp` screenshots with a `.png` fallback when the image is used in a `<picture>` element.
- Every proof screenshot is 16:10, max 1280px wide. Keep it that way — the grids depend on one ratio.
- Keep WebP proof images under roughly 200 KB when practical; keep PNG fallbacks compressed because they may still be downloaded by older browsers or direct links.
- Name assets by project and view, such as `traverseops-workspace.webp` or `movie-library-preview.png`.
- Every `<img>` needs meaningful `alt`, real `width` and `height`, and `decoding="async"`.
- Use `loading="eager"` and `fetchpriority="high"` only for true above-the-fold LCP images. Use `loading="lazy"` for below-the-fold screenshots, thumbnails, galleries, and poster grids.
- Reserve layout space with the existing wrappers (`.build__shot`, `.demo-card__shot`) instead of relying on image load timing.
- No Lighthouse or PageSpeed score is documented in this repo unless it has been measured locally for that change.

## Project Map

- `index.html` - name, selected work, contact.
- `work.html` - projects and experiments.
- `traverseops-demo.html` - Muni Assets interactive mock (filename kept so old links resolve).
- `dwellsmart.html` - DwellSmart real-estate search project page.
- `movie-night.html`, `movie-library.html`, `movie-library.js` - MovieBot stream surface and voting catalog.
- `paint.html`, `paint.css`, `paint.js` - browser drawing tool.
- Game and tool files provide standalone browser experiments linked from the work page.
- `resume.html`, `about.html` - supporting public pages.
- `site.css` - the single portfolio stylesheet; `demos.css` - sample-app surfaces.
- `shared.js` - navigation, theme, reveal; `terrain.js` - homepage contour field.
- `scripts/` and `tests/` - static QA scripts and Playwright smoke tests.
- `assets/`, `CNAME`, `robots.txt`, `sitemap.xml` - visual assets, custom domain, and indexing files.

## Repository Metadata

Suggested GitHub About fields:

```text
Description:
Software developer portfolio for Zac Batten. Web tools, Python automation, and map interfaces.

Website:
https://zacbatten.me

Topics:
portfolio, github-pages, static-site, frontend, javascript, moviebot, browser-games
```

## Maintenance Notes

- This is a static site with no build step. npm is used only for QA tooling.
- Update project entries directly in `index.html` and `work.html`.
- Store future screenshots in `assets/` as optimized `.webp` plus `.png` fallback when useful.
- Use meaningful alt text, real `width`/`height`, and `loading="lazy"` for below-the-fold images.
- Keep accessibility claims evidence-based: keyboard checks, visible focus states, reduced motion, status messages.
- Keep SEO metadata project-specific; do not add review, rating, offer, price, or organization schema unless those claims are visible and verifiable.
- DepositProof pages under `/depositproof-rental-vault/` are intentionally indexed as separate app support/privacy pages, not portfolio project pages.
