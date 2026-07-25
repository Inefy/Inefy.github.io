# zacbatten.me — Critical Audit

Audited live site + repo on 2026-07-24. Ordered by impact. Every claim is backed by something I measured or reproduced.

**Verdict up front:** the engineering hygiene is above average (CSP, schema, Playwright smoke tests, no-JS fallbacks, real alt text). The *portfolio* is not. It currently shows a hiring manager a broken-looking homepage, three sample projects, and no evidence of a human being. It reads like a well-tested demo of a portfolio rather than a portfolio.

---

## Tier 0 — Actively broken. Fix today.

### 1. Project thumbnails render as empty grey boxes on first load

Reproduced on `/work.html` and `/` in Chrome. After 3 seconds:

```
[{src:"", nat:"0x0", complete:false, loading:"lazy"},  ×3]
```

Setting `loading="eager"` on one image made all three load instantly (`1440x1100`, `1200x630`, `1280x670`).

All three cards on both pages carry `loading="lazy"` (`index.html` ×3, `work.html` ×3) despite sitting at `top: 635px` in a `1292px` viewport — i.e. **above the fold**. Combined with the reveal animation, the browser defers them and a visitor's first impression of your work page is three blank rectangles.

**Fix:** `loading="eager"` + `fetchpriority="high"` on the first row of cards on `/` and `/work.html`. Only lazy-load what is genuinely below the fold. This is the single highest-impact fix on the list.

### 2. Every major section uses a different content alignment

Measured left/right edges at 2550px viewport on the homepage:

| Element | Left → Right |
|---|---|
| `.brand` / `.nav` | 695 → 1836 |
| `#hero-title` | 695 → 1545 |
| `#selected-work-title` | **710** → 1690 |
| `.selected-work-grid` | **710** → **1822** |
| `#contact-title` | **886** → **1338** |
| `.footer-identity` | 695 → 1087 |

Four different left edges, five different right edges. Cause: `.hero`/`.contact-section` use `padding-inline: var(--section-pad-x)` derived from `--content-max: 1240px`, while `.section` uses `max-width: 1160px; margin: auto; padding: 24px`. The two systems never agree.

This is why the page reads as "slightly wrong" even though nothing is obviously ugly. On a portfolio judged on visual craft, misalignment is the most damning possible bug.

**Fix:** one layout primitive. A single `.container { width: min(100% - 2*gutter, 1160px); margin-inline: auto; }` applied to *every* section including the hero, header, and footer. Delete `--section-pad-x`.

### 3. The hero's right half is empty on desktop

`.hero-workbench` (the featured TraverseOps image) and `.hero-proof-row` both compute to `display: none`. Not a media query — a blanket kill rule in `refined.css:2774`:

```css
.hero-ambient, .page-breadcrumb, .hero-workbench, .hero-proof-row,
.card-number, .project-index, .case-template-meta,
.case-study-image-frame figcaption { display: none !important; }
```

So the markup ships to every visitor — including a `loading="eager" fetchpriority="high"` `<img>` in the hidden hero — and is then thrown away by CSS. The result: a 112px headline floating in a left column with ~1000px of dead black to its right, and your LCP priority hint attached to an invisible element.

**Fix:** decide. Either bring the workbench panel back (it's the strongest thing on the page — an actual screenshot of actual software) or delete the markup. Don't ship both.

### 4. Body typeface is never loaded

`refined.css:113` sets `font-family: Inter, ui-sans-serif, system-ui, ...` on `body`. The Google Fonts link requests **JetBrains Mono + Space Grotesk only**. `grep -l 'family=Inter' *.html` → 0 files.

Every paragraph on your site renders in whatever the visitor's OS default is. Segoe UI on Windows, SF on Mac, Roboto on Android. Your carefully-chosen display face sits on top of an accidental body face, and the pairing you designed against is not the pairing anyone sees.

**Fix:** either load Inter (`&family=Inter:wght@400;500`) or commit to a system stack and remove Inter from the declarations. Pick one and make it deliberate.

### 5. 300 KB of CSS, of which one file exists to undo the other

```
styles.css   236 KB   1713 rule blocks
refined.css   56 KB    481 rule blocks
```

`refined.css` line 1: `/* Editorial refinement layer. This intentionally neutralizes older effect-heavy rules. */`

It's doing exactly that — collapsing the entire design system to a single value:

```css
--mint: #b7e36b;  --gold: #b7e36b;  --blue: #b7e36b;
--ember: #b7e36b; --violet: #b7e36b; --accent: #b7e36b;
--shadow: none; --shadow-sm: none; --shadow-md: none; --shadow-lg: none;
--card-radius: 4px;
```

Five named accent colours all set to the same green. Four shadow tokens all set to `none`. You are shipping 236 KB of styles for a design that no longer exists, then 56 KB to suppress it.

**142 of 536 top-level class selectors in `styles.css` match nothing in any HTML or JS file** (`.card__body`, `.case-study-card`, `.flagship-actions`, `.credibility-strip`, `.experiment-card`, `.command-strip`…). And that count is conservative — it's substring-matched against every HTML and JS file concatenated together, so the true dead fraction is higher.

**Fix:** this is a rewrite, not a cleanup. Delete both files. Write one stylesheet from the *current* design, which is genuinely simple — one accent, no shadows, 4px radii, two typefaces. It should land under 25 KB. Ship it as `site.css` and never add a second layer.

---

## Tier 1 — The portfolio problem

### 6. There are three projects, and they are all samples

The homepage shows TraverseOps, MovieBot, Web Paint. `/work.html` shows **the exact same three** — its "More projects" section is `hidden`, so the Work page is a redundant copy of the homepage with a different heading.

Worse, read your own resume copy:

- TraverseOps — "Frontend / internal-tools **sample app**", "Modeled **public-safe sample data**"
- MovieBot — a Twitch bot for public-domain movie nights
- Web Paint — MS Paint in a canvas

Two of three are self-directed exercises. One is a hobby stream tool. None has a user who isn't you, a constraint you didn't choose, or a number attached to it. The only real client work on the site — "Judy Batten Wellness" — is buried in a `hidden` section on a secondary page.

This is the core issue. Everything below is cosmetic by comparison.

**Fix, in priority order:**
1. Un-hide the supporting work. Judy Batten Wellness is a *real site for a real person* — that outranks TraverseOps for credibility.
2. Add a number to every project. "Cut the inspection handoff from 6 tabs to 1." "Processed 2,400 votes across 40 streams with zero manual restarts." If a number doesn't exist, say what specifically broke and what you did about it. Right now every card is an abstract noun phrase: "A map app for managing field assets."
3. Stop labelling your own work "sample." You wrote it defensively for accuracy — a reader hears "not real."

### 7. The About page is one screen of generic bullets

Full text content, verbatim:

> Useful tools, clearly built. / I build focused web tools and automation that make repeated work easier. / **Web tools:** Clear interfaces for dashboards, maps, browser apps, and internal workflows. / **Technology:** JavaScript, HTML, and CSS · Python automation · MapLibre and Canvas · Playwright testing / **Approach:** Start with the main user path, build the smallest useful version, then refine states, mobile layout, accessibility, and testing.

That's the whole page. No photo. No name beyond the header. No story about *why* Newfoundland, why internal tools, why you started building a Twitch bot. Nothing a reader could repeat to a colleague. The footer tagline is literally two words: "Software developer."

Every sentence on this site sits at the same altitude of abstraction — "practical," "useful," "focused," "clear," "simple." Those words are load-bearing nowhere. `useful` appears in your H1, your About H1, and your contact H2.

**Fix:** 300 words in first person about one specific thing that happened. A photo. A sentence someone could quote. This is the page that makes you a person instead of a repo.

### 8. The homepage is three sections, and four more are hidden

`main > section` count: 7. Visible: 3 (hero, projects, contact). `hidden` on desktop: `.field-note-section`, `.what-section`, `.browse-more`.

Site-wide there are **66 `hidden` attributes** across your HTML. `contact.html` has 9. `traverseops-demo.html` has 10. `moviebot-case-study.html` has 9.

You clearly went on a simplification pass and hid rather than deleted. The effect: the homepage now goes headline → three cards → email me, in about 2100px of document height on a 1292px viewport — with a ~700px void of black below the footer because the page can't fill the screen. There's no reason to scroll, nothing to learn, and no path to the Interactive Lab, case studies, or notes except the nav.

Notably, the section you hid (`.field-note-section`) contains the best writing on the entire site:

> "The best software feels obvious *after someone did the hard thinking.* I like the awkward middle: the workflow spread across tabs, checklists, and chat commands."

That's a voice. It's the only paragraph on the site that sounds like a person wrote it, and it's `hidden`.

**Fix:** un-hide the field note. Delete the other hidden sections from the source. Then add one section that earns the scroll — a process walkthrough, a "what I'm building now," a real testimonial.

### 9. 26 HTML pages, 367 KB of JavaScript, 8 browser games

You've built 2048, Snake, Brick Breaker, Minefield Sweep, Mini Golf, Asteroid Drift, Flappy Workbench, and a 139 KB `pocket-legends.html`. Total JS across the repo: 367 KB.

This is a lot of real work, and it is currently working against you. Eight clones of well-known games says "I practice" — which is fine at the start of a career and neutral-to-negative once you want to be taken seriously. It also dilutes the three-project story you're trying to tell.

**Fix:** keep the Lab, but reframe it. One page, honest framing ("input handling, collision, and game-loop experiments"), and pull out the *one* with the most interesting technical story into a real case study — Mini Golf's physics or Minefield Sweep's recursive reveal. Retire the rest to a list of links.

---

## Tier 2 — Craft details a reviewer will notice

### 10. Card images have three different aspect ratios

Natural dimensions: `1440×1100` (1.31), `1200×630` (1.90), `1280×670` (1.91). All forced into a 1.61 box with `object-fit: cover`. TraverseOps loses ~30% of its width to the crop; the other two lose height. On the homepage the three thumbnails visibly don't match.

**Fix:** re-export all proof screenshots at one ratio. 16:10 or 3:2. Non-negotiable for a grid.

### 11. 15 different breakpoints across two stylesheets

`300px, 380px, 430px, 480px, 600px, 760px, 800px, 820px, 860px, 900px, 980px, 1040px, 1100px, 1120px, 1240px`

Plus `(max-width: 820px) and (min-width: 761px)` and `(max-width: 1100px) and (min-width: 761px)`. Nobody can reason about this, including you — which is how the hero ended up hidden instead of reflowed.

**Fix:** three. `640px, 900px, 1200px`. Mobile-first, `min-width` only.

### 12. Micro-typography is unreadable

`.eyebrow` and `.project-meta span` compute to **11.2px**, uppercase, letter-spaced, in JetBrains Mono, at `--muted`. "SELECTED WORK / 01—03" and "MAP UI" are decoration, not information — nobody is reading them, and on a phone they're worse.

Contrast itself is fine (I checked: muted-on-paper is 8.30:1, accent-on-paper 12.74:1, light-mode muted 5.09:1 — all pass AA comfortably). The problem is size, not colour.

**Fix:** 12px floor for any real text. If a label is decorative, cut it rather than shrink it.

### 13. Theme toggle is an unlabelled icon in an odd slot

It's JS-injected between the wordmark and the nav — so it causes a layout shift on load, and no-JS visitors get nothing. `shared.js` is 51 KB to deliver a theme toggle, a nav toggle, a copy-email button, a year stamp, and a local-time string (`grep -o "data-[a-z-]*" shared.js` returns 6 hooks total).

**Fix:** put the toggle in the markup so it doesn't shift. Split `shared.js` — it's doing far too little for its size.

### 14. Footer taglines contradict each other

`index.html`: "Software developer in Newfoundland."
`about.html`: "Software developer."
`resume.html`: "Software developer building web tools, automation, and frontend UI."

Same component, three strings. Nobody notices individually; everybody notices the *feeling* of inconsistency.

---

## Tier 3 — Repo hygiene (public, and reviewers do look)

### 15. 214 gitignored files are still tracked; `.git` is 86 MB

```
.gitignore:  node_modules/  .playwright-mcp/  test-results/
git ls-files | grep -c 'node_modules/\|.playwright-mcp/\|test-results/'  →  214
du -sh .git  →  86M
```

They were committed before the ignore file existed and never removed. That means **your Playwright dev-session console logs from April and May are public on GitHub**, and cloning your static portfolio pulls 86 MB.

**Fix:** `git rm -r --cached node_modules .playwright-mcp test-results && git commit`. If you care about the size, `git filter-repo` to purge history.

### 16. Orphans and sitemap gaps

- Not linked from anywhere: `404.html`, `case-study-template.html`, `pocket-legends.html` — a **139 KB** page nobody can reach.
- Missing from `sitemap.xml`: `index.html` (your homepage — the root `/` is listed, so this is cosmetic, but check it), `pocket-legends.html`.
- Cache-bust strings drift: `index.html` requests `refined.css?v=20260716-simple4`, every other page requests `simple3`. Two versions of the same file cached per visitor.

### 17. `movie-library-grid` is 397 KB PNG / 237 KB WebP

Your own README sets the standard: "Keep WebP proof images under roughly 200 KB." This one is 237 KB and it's the homepage's second card. `traverseops-workspace.webp` is 151 KB. Homepage critical path (HTML + 2 CSS + JS + 3 images) totals **~797 KB uncompressed**.

**Fix:** re-encode at quality 78–82 and correct display size. That grid should be under 80 KB.

---

## What's already good — don't lose it in the rewrite

- Content-Security-Policy with inline-script hashes, on every page. Genuinely uncommon.
- Reasonable JSON-LD: `Person`, `WebSite`, `ItemList`, `SoftwareApplication` — accurate and not stuffed with fake `AggregateRating`.
- Every `<img>` has meaningful alt text plus real `width`/`height`. No CLS from images.
- `prefers-reduced-motion` (16 blocks), `:focus-visible` (22 blocks), `aria-live="polite"` status regions in every interactive demo, `noscript` fallbacks.
- Playwright smoke tests + HTML/link/JS checks wired into GitHub Actions on PR and push.
- Contrast passes AA in both themes.
- The README is better than most production repos' READMEs.

The discipline is there. It's pointed at the wrong layer — you've QA'd a site whose layout math is broken and whose content doesn't argue for you.

---

## If you only do five things

1. **`loading="eager"` on above-fold card images.** Your work currently doesn't render. (~10 min)
2. **One container primitive for every section.** Kills the four-different-left-edges problem. (~1 hr)
3. **Delete `styles.css` + `refined.css`, write one ~25 KB stylesheet from the design you actually have.** (~1 day)
4. **Rewrite About in first person with a photo, and un-hide the field note.** Give the site a voice. (~2 hrs)
5. **Un-hide real client work, and put a number on every project.** (~half day, mostly thinking)

Items 1–3 make it look professional. Items 4–5 make it memorable. Only doing 1–3 gets you a clean site nobody remembers.
