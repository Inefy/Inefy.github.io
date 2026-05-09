(() => {
  const githubPortfolio = "https://github.com/Inefy/Inefy.github.io";

  window.PortfolioProjectData = {
    collections: {
      homeSelected: ["traverseops", "moviebot", "web-paint"],
      workFlagship: ["traverseops", "moviebot", "web-paint"],
      workSupporting: ["movie-library", "portfolio-site"],
      workExperiments: [
        "mini-golf",
        "asteroid-drift",
        "snake-lab",
        "brick-breaker",
        "2048",
        "minefield-sweep",
        "flappy-workbench"
      ],
      workNotes: ["portfolio-cleanup", "moviebot-page-split", "traverseops-demo-framing"],
      caseStudies: ["traverseops", "moviebot", "web-paint", "movie-library"]
    },
    projects: [
      {
        id: "traverseops",
        tags: ["automation", "field", "web"],
        title: "TraverseOps",
        displayTitle: "TraverseOps \u2014 Field Operations Map & Work-Order Demo",
        status: "Public demo / case study",
        homeMeta: ["Public demo", "Field ops UI"],
        workStatus: "Public demo / case study",
        caseStatus: "Flagship / public demo",
        updated: "May 2026",
        description: "Field teams lose time when maps, inspections, and work orders are split; I built a MapLibre/Supabase demo linking asset filters, selected records, and work-order flows.",
        caseProblem: "Field crews lose time when maps, asset records, inspections, imports, reports, and work orders live in separate tools.",
        whatBuilt: [
          "Modeled assets, inspections, work orders, imports, reports, and team roles around field-crew and supervisor workflows.",
          "Built a map-first asset workflow with status filtering, selected-asset panels, and direct paths into inspection and work-order screens.",
          "Documented demo boundaries and production hardening needs, including auth, role permissions, offline sync, audit logs, validation, and mobile field testing."
        ],
        ownership: "Uses external map/data tooling and sample municipal-style data; it is a public demo, not a production deployment.",
        production: "Solid workflow model and public-safe sample data. Real use needs authentication, role permissions, audit logs, offline sync, import validation, field-device QA, and map/source monitoring.",
        stack: ["MapLibre", "Supabase", "Work orders", "Imports", "Reports", "Mobile field UI"],
        stackText: "MapLibre, Supabase-backed sample data, desktop/mobile frontend, Capacitor-ready app structure.",
        challenge: "Keeping dense map, record, and workflow UI understandable on both desktop review screens and mobile field contexts.",
        testing: "Automated tests: no public automated suite is linked yet. Known limitations: real auth, offline sync, GIS feeds, and device-lab testing are not simulated. Manual QA covers sample-data loading, tabs, map filters, selected assets, inspection/work-order paths, import states, reports, mobile widths, keyboard focus, and empty/reset states.",
        deployment: "Hosted/run location: static GitHub Pages demo. Environment/config: no public environment variables; sample data lives in client-side JavaScript. External APIs/services: no live municipal APIs. Local development: run python -m http.server 8000; production would keep GIS credentials, Supabase keys, and real records server-side.",
        visual: {
          webp: "assets/traverseops-workspace.webp",
          png: "assets/traverseops-workspace.png",
          alt: "TraverseOps map workspace showing municipal assets and selected asset details",
          width: "1440",
          height: "1100"
        },
        links: [
          { label: "Case Study", href: "traverseops-case-study.html" },
          { label: "Live Demo", href: "traverseops-demo.html" }
        ],
        caseLinks: [
          { label: "Full case study", href: "traverseops-case-study.html" },
          { label: "Live demo", href: "traverseops-demo.html" },
          { label: "Build note", href: "notes.html#traverseops-demo-framing" }
        ]
      },
      {
        id: "moviebot",
        tags: ["automation", "stream"],
        title: "MovieBot / StreamCinema Vote Bot",
        displayTitle: "StreamCinema Vote Bot \u2014 Twitch Chat Voting + OBS Automation",
        status: "Public repo / live showcase",
        homeMeta: ["Public repo", "Twitch / OBS"],
        workStatus: "Public repo / live showcase",
        caseStatus: "Automation / public repo",
        updated: "May 2026",
        description: "Streamer-run movie nights need reliable voting and playback handoff; I built a Python/TwitchIO bot that tracks chat votes, rescans local movies, resolves ties, and drives OBS WebSocket.",
        caseProblem: "Streamer-run movie nights need reliable voting, result tallying, queue state, and OBS playback without constant manual control.",
        whatBuilt: [
          "Implemented Twitch chat commands for voting, results, current movie, time remaining, movie list, and help.",
          "Built vote-state logic for changed votes, duplicate prevention, partial title matching, tie resolution, and fallback selection.",
          "Connected OBS WebSocket playback automation with movie-folder scanning, token refresh, reconnect behavior, and setup/security notes."
        ],
        ownership: "Uses TwitchIO, Twitch OAuth/chat, OBS WebSocket, IMDb/poster links, and local public-domain media files as external inputs.",
        production: "Solid command, vote, and OBS automation path for a local operator. Real use needs secret rotation, rate-limit handling, reconnect health checks, structured logs, tests, and an operator dashboard.",
        stack: ["Python", "TwitchIO", "OBS WebSocket", "OAuth refresh", "Vote state"],
        stackText: "Python, TwitchIO, Twitch IRC/chat commands, OAuth refresh, OBS WebSocket, static showcase pages.",
        challenge: "Making a long-running stream tool resilient across Twitch auth, chat connection health, local file state, and OBS handoff timing.",
        testing: "Automated tests: pytest coverage exercises scanning, duration fallback, command behavior, OBS calls, token helpers, playback scheduling, fallback paths, and cleanup. Known limitations: no live operator dashboard, synthetic Twitch/OBS E2E environment, or production alerting yet. Manual QA verifies real OBS/Twitch configuration and portfolio pages.",
        deployment: "Hosted/run location: Python bot runs locally beside OBS; portfolio support pages are static. Environment/config: private .env for Twitch tokens, channel, movie directory, and OBS host/scene/source config. External APIs/services: Twitch OAuth/chat and OBS WebSocket. Local development: install Python requirements, configure .env, run tests, then run the bot against a test channel.",
        visual: {
          webp: "assets/movie-night-preview.webp",
          png: "assets/movie-night-preview.png",
          alt: "Movie Night page with Twitch stream, chat panel, MovieBot workflow notes, and movie library links",
          width: "1200",
          height: "630"
        },
        links: [
          { label: "Case Study", href: "moviebot-case-study.html" },
          { label: "Movie Night", href: "movie-night.html" },
          { label: "Movie Library", href: "movie-library.html" },
          { label: "GitHub", href: "https://github.com/Inefy/twitch-movie-bot" }
        ],
        workLinks: [
          { label: "Case Study", href: "moviebot-case-study.html" },
          { label: "Demo", href: "movie-night.html" },
          { label: "GitHub", href: "https://github.com/Inefy/twitch-movie-bot" }
        ],
        caseLinks: [
          { label: "Full case study", href: "moviebot-case-study.html" },
          { label: "Live showcase", href: "movie-night.html" },
          { label: "Movie Library", href: "movie-library.html" },
          { label: "GitHub", href: "https://github.com/Inefy/twitch-movie-bot" }
        ]
      },
      {
        id: "web-paint",
        tags: ["web"],
        title: "Web Paint",
        displayTitle: "Web Paint \u2014 Browser Canvas Drawing Tool",
        status: "Live browser tool",
        homeMeta: ["Browser tool", "Canvas app"],
        workStatus: "Live browser tool",
        caseStatus: "Canvas tool / live demo",
        updated: "May 2026",
        description: "Browser drawing needs reliable state; I built a vanilla JavaScript Canvas editor with tool modes, undo/redo snapshots, import/export, zoom, and mobile-friendly panels.",
        caseProblem: "Static browser tools need reliable drawing state, history, import/export, and mobile-friendly controls without a framework.",
        whatBuilt: [
          "Implemented Canvas drawing modes for pencil, eraser, shapes, fill, text, selection, and preview rendering.",
          "Built undo/redo snapshots, image import validation, PNG export, local save/load, zoom, and canvas resizing.",
          "Managed tool settings, selected color, brush size, selection state, and status output in vanilla JavaScript."
        ],
        ownership: "Uses standard browser Canvas, Clipboard, File, Fullscreen, and LocalStorage APIs; no drawing framework is used.",
        production: "Solid static canvas editor prototype. Broader use would need memory-aware history, autosave recovery, richer keyboard shortcuts, accessibility improvements, and cross-browser device testing.",
        stack: ["HTML", "CSS", "JavaScript", "Canvas API"],
        stackText: "HTML, CSS, JavaScript, Canvas API, pointer events, LocalStorage, File APIs.",
        challenge: "Keeping tool state, canvas history, resizing, zoom, and export predictable across desktop and narrow screens.",
        testing: "Automated tests: no automated suite exists yet. Known limitations: no pixel-regression tests, pointer-event replay, or full nonvisual canvas model yet. Manual QA covers every tool mode, undo/redo, import/export, clipboard fallback, storage limits, touch input, keyboard focus, large-image rejection, and responsive panels.",
        deployment: "Hosted/run location: no-build GitHub Pages tool. Environment/config: no environment variables. External APIs/services: browser Canvas, File, Clipboard, Fullscreen, and LocalStorage APIs. Local development: run a static server and open /paint.html; drawings stay local unless exported.",
        visual: {
          webp: "assets/web-paint-workspace.webp",
          png: "assets/web-paint-workspace.png",
          alt: "Web Paint browser tool showing toolbar controls, brush settings, touch guidance, and drawing workspace",
          width: "1280",
          height: "670"
        },
        links: [
          { label: "Live Demo", href: "paint.html" },
          { label: "Case Study", href: "web-paint-case-study.html" },
          { label: "Source", href: `${githubPortfolio}/blob/main/paint.js` }
        ],
        workLinks: [
          { label: "Demo", href: "paint.html" },
          { label: "Case Study", href: "web-paint-case-study.html" },
          { label: "Source", href: `${githubPortfolio}/blob/main/paint.js` }
        ],
        caseLinks: [
          { label: "Live demo", href: "paint.html" },
          { label: "Full case study", href: "web-paint-case-study.html" },
          { label: "Interactive Lab", href: "interactive-lab.html" },
          { label: "Source", href: `${githubPortfolio}/blob/main/paint.js` }
        ]
      },
      {
        id: "movie-library",
        title: "Public Domain Movie Library",
        displayTitle: "Public Domain Movie Library",
        status: "Supporting live page",
        workStatus: "Supporting live page",
        caseStatus: "Companion app / static UI",
        updated: "May 2026",
        description: "Viewers need accurate vote commands; I built a static HTML/CSS/JavaScript MovieBot catalog with filters, lazy posters, copyable !vote commands, and a no-JS fallback.",
        caseProblem: "MovieBot viewers need a fast way to browse public-domain titles and copy accurate vote commands without crowding the live stream page.",
        whatBuilt: [
          "Built a searchable catalog that filters public-domain MovieBot queue data by title, year, runtime, and rating.",
          "Implemented copyable !vote commands with button labels and feedback so viewers can send accurate Twitch votes.",
          "Added lazy-loaded poster cards, accessible metadata, and a static noscript fallback for the full movie list."
        ],
        ownership: "Uses public-domain movie metadata, external IMDb links, and externally hosted poster images as source content.",
        production: "Solid static catalog, copy buttons, and fallback content. Hardening would generate pages from one trusted data source, validate poster/link health, and keep viewer privacy intact.",
        stack: ["HTML", "CSS", "JavaScript", "Static data", "Lazy posters"],
        stackText: "Static HTML, CSS Grid, vanilla JavaScript search, movie metadata, external poster images, no-JavaScript fallback markup.",
        challenge: "Keeping a large static movie list searchable and indexable while preserving a readable fallback when JavaScript or external posters are unavailable.",
        testing: "Automated tests: no dedicated catalog suite exists yet. Known limitations: dynamic cards and fallback markup are still manually kept in sync. Manual QA covers search/filter cases, copy command states, result-count announcements, poster fallbacks, no-JS fallback content, mobile controls, and external link checks.",
        deployment: "Hosted/run location: static GitHub Pages catalog. Environment/config: no environment variables; movie metadata lives in page/JavaScript source. External APIs/services: IMDb links and poster image URLs. Local development: run a static server and test search, copy buttons, poster loading, and no-JS fallback.",
        visual: {
          webp: "assets/movie-library-preview.webp",
          png: "assets/movie-library-preview.png",
          alt: "Movie Library page showing public-domain poster cards, search controls, and MovieBot vote-command actions",
          width: "1200",
          height: "630"
        },
        links: [
          { label: "Case Study", href: "case-studies.html#movie-library" },
          { label: "Demo", href: "movie-library.html" },
          { label: "MovieBot", href: "moviebot-case-study.html" },
          { label: "Movie Night", href: "movie-night.html" },
          { label: "GitHub", href: `${githubPortfolio}/blob/main/movie-library.html` }
        ],
        caseLinks: [
          { label: "MovieBot case study", href: "moviebot-case-study.html" },
          { label: "Live demo", href: "movie-library.html" },
          { label: "Movie Night", href: "movie-night.html" },
          { label: "GitHub", href: `${githubPortfolio}/blob/main/movie-library.html` }
        ]
      },
      {
        id: "portfolio-site",
        title: "Inefy Portfolio Site",
        displayTitle: "Inefy Portfolio Site",
        status: "Static GitHub Pages site",
        workStatus: "Static GitHub Pages site",
        updated: "May 2026",
        description: "Recruiters need a fast proof-to-contact path; I built a GitHub Pages portfolio with reusable project sections, case studies, metadata, reduced motion, and accessible CTAs.",
        whatBuilt: [
          "Reworked homepage positioning, selected-work hierarchy, resume/contact paths, navigation, footer links, metadata, and case-study routing.",
          "Built reusable static sections for project cards, technical strengths, notes, interactive demos, and work/case-study indexes.",
          "Added mobile-first CSS, visible focus states, reduced-motion handling, sitemap/robots metadata, and browser-verified mobile controls."
        ],
        ownership: "Runs on GitHub Pages with static HTML/CSS/JavaScript; external project images and embeds are credited through their linked pages.",
        production: "Solid static portfolio surface. Hardening would add automated link checks, HTML validation, visual regression snapshots, accessibility scans, and a repeatable image/metadata release process.",
        stack: ["HTML", "CSS", "JavaScript", "GitHub Pages", "SEO metadata"],
        stackText: "HTML, CSS, vanilla JavaScript, GitHub Pages, SEO metadata.",
        visual: {
          webp: "inefy-desktop-final.webp",
          png: "inefy-desktop-final.png",
          alt: "Inefy portfolio homepage showing Zac Batten hero copy, selected project cards, and recruiter contact paths",
          width: "1920",
          height: "1080"
        },
        links: [
          { label: "Case Study", href: "notes.html#portfolio-cleanup" },
          { label: "Demo", href: "index.html" },
          { label: "GitHub", href: githubPortfolio }
        ]
      },
      {
        id: "mini-golf",
        title: "Mini Golf",
        status: "Physics game",
        workStatus: "Physics game",
        updated: "May 2026",
        description: "Touch golf needs clear aiming and scoring; I built a Canvas/JavaScript five-hole course with drag power, collision response, hazards, scorecards, and best runs.",
        whatBuilt: [
          "Created five course layouts with par values, walls, hazard zones, surface types, cup targets, and hole progression.",
          "Implemented drag aiming, shot-power calculation, ball motion, wall/hazard/cup collision checks, and stroke counting.",
          "Built scorecard UI, best-score persistence, pause/restart/fullscreen controls, touch hints, and hole navigation."
        ],
        ownership: "Uses standard canvas APIs and familiar mini-golf mechanics; the course implementation is custom JavaScript.",
        production: "Solid input, scoring, and course loop; archived experiment. Hardening would add physics edge-case tests, mobile browser QA, accessible alternatives, and save-state migration.",
        stackText: "Canvas, JavaScript, local persistence.",
        visual: {
          webp: "assets/mini-golf-preview.webp",
          png: "assets/mini-golf-preview.png",
          alt: "Mini Golf canvas game start screen with a five-hole course, tee, cup, hazard, and start-round control",
          width: "1233",
          height: "651"
        },
        links: [
          { label: "Demo", href: "mini-golf.html" },
          { label: "GitHub", href: `${githubPortfolio}/blob/main/mini-golf.js` }
        ]
      },
      {
        id: "asteroid-drift",
        title: "Asteroid Drift",
        status: "Arcade loop",
        workStatus: "Arcade loop",
        updated: "May 2026",
        description: "Arcade loops need low-latency input; I built a Canvas/JavaScript Asteroids-style demo with thrust, shooting, shields, randomized spawns, collisions, waves, and touch controls.",
        whatBuilt: [
          "Implemented ship thrust, rotation, projectile firing, shield charge, wraparound movement, and lives/scoring state.",
          "Built randomized asteroid spawning, split behavior, wave progression, collision checks, and HUD progress updates.",
          "Added keyboard and touch controls that feed the same input state, plus pause/restart/fullscreen and reduced-motion handling."
        ],
        ownership: "Uses established Asteroids-style mechanics and browser canvas APIs; the runtime is custom vanilla JavaScript.",
        production: "Strongest game prototype with polished loop and controls. Real release work would tune difficulty, profile performance, test touch devices, and expand nonvisual status output.",
        stackText: "Canvas, JavaScript, real-time loop.",
        visual: {
          webp: "assets/asteroid-drift-preview.webp",
          png: "assets/asteroid-drift-preview.png",
          alt: "Asteroid Drift canvas game start screen with ship controls, wave goal, and asteroid field preview",
          width: "1233",
          height: "651"
        },
        links: [
          { label: "Demo", href: "asteroid-drift.html" },
          { label: "GitHub", href: `${githubPortfolio}/blob/main/asteroid-drift.js` }
        ]
      },
      {
        id: "snake-lab",
        title: "Snake Lab",
        status: "Grid game",
        workStatus: "Grid game",
        updated: "May 2026",
        description: "Snake needs fast turns without illegal reversals; I built a Canvas/JavaScript grid game with buffered input, growth, collisions, pace changes, and best scores.",
        whatBuilt: [
          "Implemented grid state for snake segments, food placement, growth, wall/body collision detection, score, and length.",
          "Built input buffering for Arrow keys, WASD, swipe gestures, and touch buttons while blocking illegal reverse turns.",
          "Added pace changes, pause/restart/fullscreen controls, viewport-aware canvas sizing, and local best-score persistence."
        ],
        ownership: "Uses classic Snake rules and browser canvas APIs; the game state and controls are custom JavaScript.",
        production: "Solid deterministic grid state and input buffering; archived experiment. Hardening would add regression tests for turns/collisions, deeper screen-reader alternatives, and save reset controls.",
        stackText: "Canvas, JavaScript, keyboard/touch input.",
        visual: {
          webp: "assets/snake-lab-preview.webp",
          png: "assets/snake-lab-preview.png",
          alt: "Snake Lab canvas playfield with start menu and touch direction controls",
          width: "1040",
          height: "341"
        },
        links: [
          { label: "Demo", href: "snake-lab.html" },
          { label: "GitHub", href: `${githubPortfolio}/blob/main/snake-lab.js` }
        ]
      },
      {
        id: "brick-breaker",
        title: "Brick Breaker",
        status: "Arcade game",
        workStatus: "Arcade game",
        updated: "May 2026",
        description: "Paddle games need precise collisions; I built a Canvas/JavaScript Brick Breaker with launch state, wall/paddle/brick checks, levels, progress, and touch controls.",
        whatBuilt: [
          "Implemented paddle movement, ball launch state, wall/paddle/brick collision checks, lives, scoring, and level-clearing logic.",
          "Built progress, level, best-score, and power readouts around a viewport-aware Canvas playfield.",
          "Added keyboard, pointer, and labeled touch controls that share the same movement and launch state."
        ],
        ownership: "Uses familiar brick-breaker mechanics and browser canvas APIs; the level/runtime logic is custom JavaScript.",
        production: "Solid paddle, launch, collision, and score loop; archived experiment. Hardening would cover collision edge tests, performance profiling, level data validation, and accessibility fallbacks.",
        stackText: "Canvas, JavaScript, collision checks.",
        visual: {
          webp: "assets/brick-breaker-preview.webp",
          png: "assets/brick-breaker-preview.png",
          alt: "Brick Breaker canvas playfield with start menu, paddle, ball, and brick layout",
          width: "1080",
          height: "351"
        },
        links: [
          { label: "Demo", href: "brick-breaker.html" },
          { label: "GitHub", href: `${githubPortfolio}/blob/main/brick-breaker.js` }
        ]
      },
      {
        id: "2048",
        title: "2048",
        status: "Puzzle game",
        workStatus: "Puzzle game",
        updated: "May 2026",
        description: "Tile merging needs deterministic board transforms; I built an HTML/CSS/JavaScript 2048 with single-merge rules, random spawns, undo, best score, and accessible summaries.",
        whatBuilt: [
          "Implemented directional board transforms, merge rules, random tile spawning, win/loss checks, score updates, and move counting.",
          "Built undo snapshots, local save/best-score persistence, keyboard shortcuts, swipe handling, and on-screen direction controls.",
          "Added an accessible focusable board with dynamic row summaries, live status announcements, and decorative tile rendering separated from screen-reader output."
        ],
        ownership: "Uses the established 2048 rule set; the browser UI, state updates, and persistence are custom code.",
        production: "Solid board transforms, persistence, undo, and accessible summaries; archived experiment. Hardening would add unit tests for merge rules, state migration, and screen-reader regression checks.",
        stackText: "HTML grid, JavaScript, LocalStorage.",
        visual: {
          webp: "assets/2048-preview.webp",
          png: "assets/2048-preview.png",
          alt: "2048 puzzle game start screen with numbered tiles and keyboard/touch control panels in the background",
          width: "561",
          height: "561"
        },
        links: [
          { label: "Demo", href: "2048.html" },
          { label: "GitHub", href: `${githubPortfolio}/blob/main/2048.js` }
        ]
      },
      {
        id: "minefield-sweep",
        title: "Minefield Sweep",
        status: "Logic game",
        workStatus: "Logic game",
        updated: "May 2026",
        description: "Mine puzzles need clear state and safe starts; I built a JavaScript grid game with delayed mines, recursive reveal, flag mode, timers, and accessible labels.",
        whatBuilt: [
          "Implemented delayed mine placement, safe first reveal, adjacent counts, recursive empty-cell reveal, flag toggling, and win/loss state.",
          "Built difficulty switching, timer/best-time persistence, mines-left tracking, cleared-percent updates, pause/restart controls, and touch flag mode.",
          "Rendered the board as a keyboard-navigable grid with roving focus, row/column labels, live announcements, and state-specific cell descriptions."
        ],
        ownership: "Uses classic minesweeper rules; the board generation, reveal logic, and DOM UI are custom JavaScript.",
        production: "Strong accessibility prototype with keyboard grid state and safe first reveal. Hardening would add reveal/flag tests, focus regression checks, difficulty validation, and clearer saved-state controls.",
        stackText: "JavaScript grid state, DOM UI.",
        visual: {
          webp: "assets/minefield-sweep-preview.webp",
          png: "assets/minefield-sweep-preview.png",
          alt: "Minefield Sweep board preview with difficulty controls, start menu, and minefield grid",
          width: "1121",
          height: "621"
        },
        links: [
          { label: "Demo", href: "minefield-sweep.html" },
          { label: "GitHub", href: `${githubPortfolio}/blob/main/minefield-sweep.js` }
        ]
      },
      {
        id: "flappy-workbench",
        title: "Flappy Workbench",
        status: "Timing game",
        workStatus: "Timing game",
        updated: "May 2026",
        description: "Timing games need consistent physics; I built a Canvas/JavaScript Flappy-style loop with gravity, obstacle gaps, collision checks, best score, pause, and mobile flap input.",
        whatBuilt: [
          "Implemented gravity, jump impulse, pipe spawning, gap sizing, collision checks, score tracking, and restart flow.",
          "Built the Canvas render loop for the player, scrolling obstacles, ground movement, menu state, status text, and best-score persistence.",
          "Added keyboard, pointer, tap, and labeled mobile Flap controls with pause/restart/fullscreen support."
        ],
        ownership: "Uses Flappy-style mechanics and browser canvas APIs; the implementation is custom vanilla JavaScript.",
        production: "Solid timing loop, collision checks, and touch input; archived experiment. Hardening would add deterministic physics tests, mobile-browser QA, reduced-motion review, and more robust pause/resume validation.",
        stackText: "Canvas, JavaScript, lightweight state machine.",
        visual: {
          webp: "assets/flappy-workbench-preview.webp",
          png: "assets/flappy-workbench-preview.png",
          alt: "Flappy Workbench canvas playfield with start menu, bird, pipe obstacles, and touch controls",
          width: "1181",
          height: "321"
        },
        links: [
          { label: "Demo", href: "flappy-workbench.html" },
          { label: "GitHub", href: `${githubPortfolio}/blob/main/flappy-workbench.js` }
        ]
      }
    ],
    notes: [
      {
        id: "portfolio-cleanup",
        title: "Portfolio cleanup pass",
        status: "Build log",
        description: "Recruiters need a fast path from proof to contact; I rebuilt the static portfolio flow around homepage positioning, CTA hierarchy, metadata, resume paths, and selected-work framing.",
        whatBuilt: [
          "Repositioned the hero around software development hiring actions instead of older casual homepage copy.",
          "Restructured selected work, technical strengths, notes previews, resume/contact paths, and footer navigation.",
          "Documented QA checks and accessibility/SEO follow-ups in the build notes."
        ],
        ownership: "This is a static-site content and UI pass; GitHub Pages supplies the hosting layer.",
        stackText: "HTML, CSS, metadata, GitHub Pages.",
        links: [
          { label: "Read Note", href: "notes.html#portfolio-cleanup" },
          { label: "Demo", href: "index.html" },
          { label: "GitHub", href: githubPortfolio }
        ]
      },
      {
        id: "moviebot-page-split",
        title: "MovieBot stream surface split",
        status: "Build log",
        description: "MovieBot viewers need voting and browsing to stay distinct; I split the static stream page from the searchable HTML/CSS/JavaScript catalog and linked both back to the Python bot case study.",
        whatBuilt: [
          "Split the live stream room and searchable catalog into separate pages with cross-links back to MovieBot.",
          "Built the movie catalog search, vote-command copy flow, poster grid, and static fallback list.",
          "Updated the MovieBot narrative so the bot, stream room, and catalog read as one system."
        ],
        ownership: "Uses public-domain movie data, IMDb links, external poster images, and Twitch embed APIs.",
        stackText: "Static pages, movie data, no-JavaScript fallback.",
        links: [
          { label: "Read Note", href: "notes.html#moviebot-page-split" },
          { label: "Demo", href: "movie-night.html" },
          { label: "GitHub", href: "https://github.com/Inefy/twitch-movie-bot" }
        ]
      },
      {
        id: "traverseops-demo-framing",
        title: "TraverseOps public-demo framing",
        status: "Build log",
        description: "Field-operations demos can look shallow without context; I reframed TraverseOps around MapLibre/Supabase sample data, asset workflows, demo limits, and production-hardening requirements.",
        whatBuilt: [
          "Reframed the project around field assets, inspections, work orders, imports, reports, and role-based review.",
          "Added case-study sections for architecture, demo boundaries, screenshots, and production hardening.",
          "Clarified that the public demo uses sample data and needs real auth, audit, validation, and offline sync for production."
        ],
        ownership: "The page documents a public demo concept; the operational data shown is sample content.",
        stackText: "Product framing, case-study copy, mobile preview.",
        links: [
          { label: "Read Note", href: "notes.html#traverseops-demo-framing" },
          { label: "Demo", href: "traverseops-demo.html" },
          { label: "Case Study", href: "traverseops-case-study.html" }
        ]
      }
    ]
  };
})();
