# Audit fixes — what changed

Companion to `SITE-AUDIT.md`. All 17 findings addressed. Every static check passes:
`check:js`, `check:html` (29 files), `check:links` (832 references).

---

## One thing left for you to run

Git's index was locked by the desktop app, so the untrack is staged but the
commit is yours:

```bash
cd C:\Users\zacba\Documents\projects\Inefy.github.io
git status          # 217 deletions = the untracked node_modules / .playwright-mcp files
git commit -m "Rebuild frontend on one stylesheet; restore hidden content"
```

The 214 gitignored files are now out of the index. Your April–May Playwright
console logs stop being published from the next push. They remain in history —
purging those needs `git filter-repo` and a force-push, which I did not do.

**Also still yours:** the `TODO` comments in `about.html` and the project cards.
I wrote drafts from what the site already claims, but I will not invent numbers
or a personal history. Search for `TODO` and make them true.

---

## Tier 0

**1. Broken thumbnails.** First three cards on `index.html` and `work.html` are
now `loading="eager"`, the lead one `fetchpriority="high"`. Zero lazy images
above the fold on either page.

**2. Four different content alignments.** Replaced with one primitive:

```css
--pad-x: max(var(--gutter), calc((100% - var(--measure)) / 2));

.site-header, .site-footer,
main > section, main > nav, main > div { padding-inline: var(--pad-x); }
```

Every band on every page now resolves to the same left and right edge. The old
`.section { max-width: 1160px; margin: auto }` competing against
`--section-pad-x` off a 1240px measure is gone. Documented in the README so it
doesn't come back.

**3. Empty hero right half.** Deleted the blanket
`display: none !important` block. `.hero-workbench` and `.hero-proof-row` render
again; the featured TraverseOps panel is back with a 16:10 frame and the caption
block. `.hero-ambient` divs removed from the markup on 15 pages rather than
hidden by CSS.

**4. Inter never loaded.** Font link now requests
`Inter:wght@400;500;700` alongside JetBrains Mono and Space Grotesk, on all 17
shell pages. Body copy renders in the typeface the CSS actually asks for.

**5. 300 KB of CSS in two fighting layers.**

| | before | after |
|---|---|---|
| stylesheets | `styles.css` 236 KB + `refined.css` 56 KB | `site.css` 44 KB + `demos.css` 11 KB |
| gzipped | 49 KB | 11 KB |
| `shared.js` | 51 KB | 25 KB |
| homepage text payload | 365 KB | 92 KB (**75% smaller**) |
| homepage incl. images | 797 KB | 359 KB (**55% smaller**) |
| breakpoints | 15 | 3 (1200 / 900 / 640) |

Both old files deleted. `demos.css` carries the `traverse-*`, `movie-*`, and
`stream-*` surfaces and loads only on the three sample-app pages — matching the
convention the game pages already followed. Game CSS untouched.

`shared.js` lost 8 functions that were defined but never called
(`initCommandPalette`, `initCardTilt`, `initScrollProgress`, `initBackToTop`,
`initSpotlightCards`, `initMagneticButtons`, `initScrollReveal`,
`initKeyboardShortcuts`) — ~24 KB of unreachable code. Also removed `home.js`,
which no page referenced.

---

## Tier 1

**6. Three projects, all samples.** Judy Batten Wellness — your only live client
work — was hidden on a secondary page. It is now the **first** card in the
supporting grid on `work.html`, labelled "Client work · live". Project
descriptions rewritten from abstract noun phrases to concrete ones: what was
broken, what the build does about it. `TODO` markers where a real number would
land hardest.

**7. About page was one screen of bullets.** Rewritten as a first-person draft
with an actual origin story (the movie-night bot), a portrait slot, "what I
reach for", "how I work", and a "what I am doing now" block. Marked `TODO` —
edit until it's true.

**8. 66 `hidden` attributes.** Down to 13, all functional (tabpanels, empty
states, game UI toggles). This turned out to be much worse than I first
reported:

> **All three case studies were 97% hidden.** 462 visible characters against
> 15,138 behind `hidden`. Your nav promised "deep dives on the build" and
> delivered a hero plus three cards.

| page | visible before | visible now |
|---|---|---|
| `traverseops-case-study.html` | 462 chars | 15,200 |
| `moviebot-case-study.html` | ~460 chars | 15,120 |
| `web-paint-case-study.html` | ~460 chars | 13,596 |

Also restored: the field note (the best-written paragraph on the site), the
homepage principles and browse sections, work.html's "Start here" and "More
projects", contact FAQ and start-project blocks, and the resume buttons. The
duplicate flat "Work" nav link is deleted; the dropdown handles it.

**9. Games.** Kept. Lab reframed around mechanics rather than titles.
`pocket-legends.html` — 139 KB, previously unreachable — now has a card and a
sitemap entry, framed honestly as the build that outgrew one file.

---

## Tier 2

**10. Three aspect ratios.** Every proof image re-cropped to **16:10**, max
1280px wide, top-anchored. All 22 `<img>` `width`/`height` attributes rewritten
to real file dimensions, so the reserved box matches the pixels. `assets/`
dropped from 2,562 KB to 1,825 KB (29%); `movie-library-grid.webp` from 236 KB
to 133 KB, `traverseops-workspace.webp` from 150 KB to 89 KB.

**11. 15 breakpoints → 3.** 1200, 900, 640. The 900px nav collapse is mirrored
in `shared.js`; previously CSS said 860 and JS said 860 while the layout broke
at 900 — they now agree, and the README says to change both together.

**12. 11.2px labels.** `--fs-label` is 12px and floors every mono
micro-label on the site.

**13. Theme toggle.** Now in the markup on all 17 shell pages with both icons
and an `aria-label`; `shared.js` only wires it up. No injection, no layout
shift, and it's visible before JS runs.

**14. Three footer taglines.** One, on 17 pages: *"Software developer in
Newfoundland. Web tools, automation, and frontend UI."*

---

## Tier 3

**15. Git.** 214 files untracked, staged. Commit is yours (above).

**16. Orphans and metadata.** `pocket-legends.html` linked and in the sitemap.
Cache-bust strings unified to `?v=20260725-rebuild1` — previously
`index.html` requested `simple4` while every other page requested `simple3`.
`404.html` was still loading the deleted stylesheets by absolute path; fixed.
Remaining orphans are intentional: `404.html` (GitHub Pages serves it directly)
and `case-study-template.html` (robots-disallowed).

**17. Oversized assets.** Covered in #10. Every proof WebP is now under the
200 KB the README asks for.

**Bonus:** CSP inline-script and inline-style hashes regenerated across 18
pages — the content edits had invalidated them, which would have blocked the
JSON-LD and inline styles in the browser.

---

## What I could not verify

I could not render the pages. Chrome can't open `file://` through the tools I
have, and the sandbox can't download a headless browser (blocked by the network
allowlist), so `npm run test:smoke` didn't run either.

What I did verify: all three static checks pass; every one of the 525 classes
used across the pages resolves to a rule (the 10 that don't are modifier classes
on elements already styled by a co-class, e.g. `copy-email-button` on
`.button.secondary`); both stylesheets have balanced braces; no page references a
deleted file; image attributes match real file dimensions.

**Before you push**, run it locally:

```bash
python -m http.server 8000
npm run test:smoke
```

Then check the homepage hero at a wide viewport, one case study end to end, and
the mobile nav at ~400px. Tell me what looks wrong and I'll fix it — or push and
I'll audit the live site again.
