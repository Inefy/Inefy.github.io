# Zac Batten Portfolio / Inefy Workbench

Static GitHub Pages portfolio for [zacbatten.me](https://zacbatten.me). It positions Zac Batten as a frontend, internal-tools, and automation developer through working demos, case studies, build notes, and recruiter-facing resume/contact paths.

![Homepage preview](inefy-desktop-final.png)

## Review Path

- [Homepage](https://zacbatten.me) - 5-second positioning, top projects, resume/contact paths.
- [Work](https://zacbatten.me/work.html) - role-based proof, project matrix, flagship projects, supporting work.
- [TraverseOps](https://zacbatten.me/traverseops-case-study.html) - map-first field-operations UI and public sample app.
- [MovieBot](https://zacbatten.me/moviebot-case-study.html) - Python/Twitch/OBS automation with repo and test links.
- [Web Paint](https://zacbatten.me/web-paint-case-study.html) - Canvas state, drawing tools, undo/redo, import/export, and browser UI.
- [Resume](https://zacbatten.me/resume.html) - recruiter-facing resume with project-backed evidence and contact links.

## Why This Repo Matters

- It is the source for a static portfolio, not a bundled app or backend service.
- It gives hiring reviewers fast paths by role: frontend/internal tools, Python automation, map workflows, Canvas/browser tools, and GitHub Pages polish.
- It backs portfolio claims with public demos, case studies, source links where available, known limits, and QA notes.
- It deploys from plain files on GitHub Pages with no build step.

## What Zac Built

- Homepage and Work pages that route reviewers to the strongest proof first.
- Flagship case studies for TraverseOps, MovieBot, and Web Paint.
- Movie Night and Movie Library pages that show the public-facing MovieBot workflow.
- Interactive Lab demos for Web Paint, Flappy Workbench, Snake Lab, Brick Breaker, 2048, Minefield Sweep, Mini Golf, and Asteroid Drift.
- Resume/contact pages, build notes, sitemap/robots metadata, Open Graph/Twitter previews, accessibility evidence, and lightweight CI checks.

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
npm run check:links
npm run test:smoke
npm run quality
```

## Quality Checks

- `npm run check:js` recursively runs `node --check` for `.js` and `.mjs` files.
- `npm run check:links` checks local links, hash anchors, scripts, stylesheets, images, and `srcset` assets across `.html` files without external network checks.
- `npm run test:smoke` starts `python -m http.server 8000` through Playwright and checks the highest-value reviewer paths.
- `.github/workflows/site-quality.yml` runs `npm ci`, JS syntax checks, internal link checks, installs Chromium, and runs the Playwright smoke tests on pull requests and pushes to `main`.

## Image Standards

- Prefer `.webp` screenshots with a `.png` fallback when the image is used in a `<picture>` element.
- Use 1200-1440px wide screenshots for project proof media, 1200x630 for social/share previews, and 2:3 crops for poster-style cards.
- Keep WebP proof images under roughly 200 KB when practical; keep PNG fallbacks compressed because they may still be downloaded by older browsers or direct links.
- Name assets by project and view, such as `traverseops-workspace.webp` or `movie-library-preview.png`.
- Every `<img>` needs meaningful `alt`, real `width` and `height`, and `decoding="async"`.
- Use `loading="eager"` and `fetchpriority="high"` only for true above-the-fold LCP images. Use `loading="lazy"` for below-the-fold screenshots, thumbnails, galleries, and poster grids.
- Reserve layout space with existing thumbnail/proof wrappers (`.project-visual`, `.work-thumb`, `.case-study-thumb`, `.media-proof__frame`) instead of relying on image load timing.
- No Lighthouse or PageSpeed score is documented in this repo unless it has been measured locally for that change.

## Project Map

- `index.html` - homepage, selected work, review strip, notes preview, and contact path.
- `work.html` - role-based proof, project matrix, flagship projects, supporting work, and site polish.
- `case-studies.html` - case-study index.
- `traverseops-case-study.html` and `traverseops-demo.html` - field-operations case study and public sample app.
- `moviebot-case-study.html`, `movie-night.html`, `movie-library.html`, `movie-library.js` - MovieBot proof, stream surface, and voting catalog.
- `web-paint-case-study.html`, `paint.html`, `paint.css`, `paint.js` - Canvas case study and browser drawing tool.
- `interactive-lab.html` plus game/tool files - standalone browser experiments.
- `resume.html`, `contact.html`, `about.html`, `notes.html`, `changelog.html` - reviewer support pages.
- `project-data.js`, `project-renderer.js`, `shared.js`, `home.js` - shared metadata, rendering, navigation, copy, and homepage behavior.
- `scripts/` and `tests/` - static QA scripts and Playwright smoke tests.
- `assets/`, `CNAME`, `robots.txt`, `sitemap.xml` - visual assets, custom domain, and indexing files.

## Repository Metadata

Suggested GitHub About fields:

```text
Description:
Software developer portfolio for Zac Batten, featuring practical web tools, MovieBot, TraverseOps, build notes, and browser experiments.

Website:
https://zacbatten.me

Topics:
portfolio, github-pages, static-site, frontend, javascript, case-studies, moviebot, traverseops, browser-games
```

## Maintenance Notes

- This is a static site with no build step. npm is used only for QA tooling.
- Update shared project card metadata in `project-data.js` first, then keep the no-JS fallback cards in `index.html`, `work.html`, and `case-studies.html` aligned for titles, statuses, and source/demo/case-study labels.
- Store future screenshots in `assets/` as optimized `.webp` plus `.png` fallback when useful.
- Use meaningful alt text, real `width`/`height`, and `loading="lazy"` for below-the-fold images.
- Keep accessibility claims evidence-based: keyboard checks, visible focus states, reduced motion, status messages, and honest Canvas limitations.
- Keep SEO metadata project-specific; do not add review, rating, offer, price, or organization schema unless those claims are visible and verifiable.
- DepositProof pages under `/depositproof-rental-vault/` are intentionally indexed as separate app support/privacy pages, not portfolio project pages.
