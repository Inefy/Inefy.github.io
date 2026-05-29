(() => {
  // Shared metadata for JS-enhanced project cards. Keep the no-JS fallback
  // cards in index.html, work.html, and case-studies.html aligned with these
  // titles, statuses, and source/demo/case-study labels.
  const githubPortfolio = "https://github.com/Inefy/Inefy.github.io";
  const movieBotRepo = "https://github.com/Inefy/twitch-movie-bot";
  const movieBotCi = `${movieBotRepo}/actions/workflows/tests.yml`;
  const movieBotTests = `${movieBotRepo}/blob/main/tests/test_bot_logic.py`;

  window.PortfolioProjectData = {
    collections: {
      homeSelected: ["traverseops", "moviebot", "web-paint"],
      workFlagship: ["traverseops", "moviebot", "web-paint"],
      workSupporting: ["judywebsite", "movie-library", "portfolio-site", "interactive-lab"],
      workExperiments: ["web-paint", "asteroid-drift", "minefield-sweep"],
      workNotes: ["portfolio-cleanup", "moviebot-page-split", "traverseops-demo-framing"],
      caseStudies: ["traverseops", "moviebot", "web-paint", "movie-library"]
    },
    projects: [
      {
        id: "traverseops",
        tags: ["automation", "field", "web"],
        title: "TraverseOps",
        displayTitle: "TraverseOps \u2014 Field Operations Map & Work Orders",
        status: "Public sample app / case study",
        homeMeta: ["Public sample app", "Field ops UI"],
        workStatus: "Public sample app / case study",
        caseStatus: "Flagship / public app",
        updated: "May 2026",
        description: "A map-first field app for sample assets, inspections, work orders, imports, reports, and team roles.",
        problemLine: "Field teams need one path from asset status to assigned work.",
        caseProblem: "Field teams need one path from asset status to assigned work.",
        whatBuiltLine: "I built asset records, role-based screens, map filtering, imports, inspections, and work-order handoffs.",
        whatBuilt: [
          "MapLibre-style asset map with status filtering and selected-asset context.",
          "Inspection and work-order screens for field crew and supervisor-style roles.",
          "Import/reporting flow designed around municipal-style sample asset operations."
        ],
        ownership: "Uses a MapLibre-style map UI and public-safe municipal-style sample data; it is a public browser app, not a production deployment.",
        production: "Solid sample workflow. Production use would add authentication, role permissions, audit logs, offline sync, import validation, field-device QA, and map/source monitoring.",
        stack: ["MapLibre", "JavaScript", "Sample data", "GitHub Pages"],
        stackText: "MapLibre-style UI, Supabase-shaped relational data model, sample records, desktop/mobile frontend, Capacitor-ready app structure.",
        challenge: "Keeping dense map and record screens understandable on both desktop review screens and mobile field contexts.",
        testing: "Automated tests: no public automated suite is linked yet. Known limitations: production authentication, offline sync, GIS feeds, and device-lab testing are not simulated. Manual QA covers sample-data loading, tabs, map filters, selected assets, inspection/work-order paths, import states, reports, mobile widths, keyboard focus, and empty/reset states.",
        deployment: "Hosted/run location: GitHub Pages browser app. Environment/config: no public environment variables; sample data lives in client-side JavaScript. External APIs/services: no municipal APIs, GIS services, Supabase project, or authentication service are connected. Local development: run python -m http.server 8000; production would keep GIS credentials, Supabase keys, and production records server-side.",
        visual: {
          webp: "assets/traverseops-workspace.webp",
          png: "assets/traverseops-workspace.png",
          alt: "TraverseOps map workspace showing sample municipal-style assets and selected asset details",
          width: "1440",
          height: "1100"
        },
        links: [
          { label: "Case study", href: "traverseops-case-study.html" },
          { label: "Public app", href: "traverseops-demo.html" }
        ],
        caseLinks: [
          { label: "Full case study", href: "traverseops-case-study.html" },
          { label: "Public app", href: "traverseops-demo.html" },
          { label: "Build note", href: "notes.html#traverseops-demo-framing" }
        ]
      },
      {
        id: "moviebot",
        tags: ["automation", "stream"],
        title: "MovieBot / StreamCinema Vote Bot",
        displayTitle: "MovieBot / StreamCinema Vote Bot \u2014 Twitch Chat Voting + OBS Automation",
        status: "Public repo / local automation",
        homeMeta: ["Public repo", "Python / Twitch / OBS"],
        workStatus: "Public repo / local automation",
        caseStatus: "Python automation / public repo",
        updated: "May 2026",
        description: "A Python bot that lets Twitch chat vote on public-domain movies and controls OBS playback.",
        problemLine: "Manual movie-night voting is repetitive and easy to interrupt while streaming.",
        caseProblem: "Manual movie-night voting is repetitive and easy to interrupt while streaming.",
        whatBuiltLine: "I built chat voting, movie selection, OBS playback control, token handling, reconnect behavior, and catalog links.",
        whatBuilt: [
          "Python/TwitchIO command handling for vote collection and vote changes.",
          "OBS WebSocket integration for playback automation.",
          "Token refresh, reconnect handling, tie resolution, and local movie folder scanning."
        ],
        ownership: "Uses TwitchIO, Twitch OAuth/chat, OBS WebSocket, IMDb/poster links, and local public-domain media files as external inputs.",
        production: "Solid local automation path. A larger release would add secret rotation, rate-limit handling, reconnect health checks, structured logs, live Twitch/OBS integration tests, and an operator dashboard.",
        stack: ["Python", "TwitchIO", "OBS WebSocket", "pytest"],
        stackText: "Python, TwitchIO, Twitch IRC/chat commands, OAuth refresh, OBS WebSocket, GitHub Pages support pages.",
        challenge: "Making a long-running stream tool resilient across Twitch auth, chat connection health, local file state, and OBS handoff timing.",
        testing: "Automated tests: public pytest coverage for config/bot logic exercises scanning, duration fallback, command behavior, OBS calls, token helpers, playback scheduling, fallback paths, startup behavior, and cleanup. Known limitations: no live operator dashboard, synthetic Twitch/OBS E2E environment, or production alerting yet. Manual QA verifies real OBS/Twitch configuration and portfolio pages.",
        deployment: "Hosted/run location: Python bot runs locally beside OBS; portfolio support pages live on GitHub Pages. Environment/config: private .env for Twitch tokens, channel, movie directory, and OBS host/scene/source config. External APIs/services: Twitch OAuth/chat and OBS WebSocket. Local development: install Python requirements, configure .env, run tests, then run the bot against a test channel.",
        visual: {
          webp: "assets/movie-night-preview.webp",
          png: "assets/movie-night-preview.png",
          alt: "Movie Night page with Twitch stream, chat panel, MovieBot notes, and movie library links",
          width: "1200",
          height: "630"
        },
        links: [
          { label: "Case study", href: "moviebot-case-study.html" },
          { label: "Source", href: movieBotRepo },
          { label: "Tests", href: movieBotTests },
          { label: "Movie Night", href: "movie-night.html" },
          { label: "Movie Library", href: "movie-library.html" }
        ],
        workLinks: [
          { label: "Case study", href: "moviebot-case-study.html" },
          { label: "Source", href: movieBotRepo },
          { label: "Tests", href: movieBotTests },
          { label: "Movie Night", href: "movie-night.html" },
          { label: "Movie Library", href: "movie-library.html" }
        ],
        caseLinks: [
          { label: "Full case study", href: "moviebot-case-study.html" },
          { label: "Movie Night", href: "movie-night.html" },
          { label: "Movie Library", href: "movie-library.html" },
          { label: "Source", href: movieBotRepo },
          { label: "CI tests", href: movieBotCi },
          { label: "Pytest file", href: movieBotTests }
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
        caseStatus: "Canvas tool / live page",
        updated: "May 2026",
        description: "A vanilla JavaScript canvas editor with drawing tools, text, shapes, undo/redo, import/export, zoom, and responsive controls.",
        problemLine: "Browser drawing tools need fast canvas interaction and predictable tool state.",
        caseProblem: "Browser drawing tools need fast canvas interaction and predictable tool state.",
        whatBuiltLine: "I built canvas rendering, tool state, history, import/export, shortcuts, and mobile controls.",
        whatBuilt: [
          "Canvas drawing modes for pencil, eraser, shapes, fill, and text.",
          "Undo/redo history, image import/export, zoom, and canvas resizing.",
          "UI state management for color, brush size, active tool, and status output."
        ],
        ownership: "Uses standard browser Canvas, Clipboard, File, Fullscreen, and LocalStorage APIs; no drawing framework is used.",
        production: "Solid browser editor prototype. Broader use would add memory-aware history, autosave recovery, richer shortcuts, stronger nonvisual support, and cross-browser testing.",
        stack: ["Canvas", "JavaScript", "LocalStorage", "GitHub Pages"],
        stackText: "HTML, CSS, JavaScript, Canvas API, pointer events, LocalStorage, File APIs.",
        challenge: "Keeping tool state, canvas history, resizing, zoom, and export predictable across desktop and narrow screens.",
        testing: "Automated tests: no automated suite exists yet. Known limitations: no pixel-regression tests, pointer-event replay, or full nonvisual canvas model yet. Manual QA covers every tool mode, undo/redo, import/export, clipboard fallback, storage limits, touch input, keyboard focus, large-image rejection, and responsive panels.",
        deployment: "Hosted/run location: no-build GitHub Pages tool. Environment/config: no environment variables. External APIs/services: browser Canvas, File, Clipboard, Fullscreen, and LocalStorage APIs. Local development: run a local server and open /paint.html; drawings stay local unless exported.",
        visual: {
          webp: "assets/web-paint-workspace.webp",
          png: "assets/web-paint-workspace.png",
          alt: "Web Paint browser tool showing toolbar controls, brush settings, touch guidance, and drawing workspace",
          width: "1280",
          height: "670"
        },
        links: [
          { label: "Case study", href: "web-paint-case-study.html" },
          { label: "Live tool", href: "paint.html" },
          { label: "Source", href: `${githubPortfolio}/blob/main/paint.js` }
        ],
        workLinks: [
          { label: "Case study", href: "web-paint-case-study.html" },
          { label: "Live tool", href: "paint.html" },
          { label: "Source", href: `${githubPortfolio}/blob/main/paint.js` }
        ],
        caseLinks: [
          { label: "Full case study", href: "web-paint-case-study.html" },
          { label: "Live tool", href: "paint.html" },
          { label: "Interactive Lab", href: "interactive-lab.html" },
          { label: "Source", href: `${githubPortfolio}/blob/main/paint.js` }
        ]
      },
      {
        id: "movie-library",
        title: "Movie Library",
        displayTitle: "Movie Library \u2014 Public-Domain Voting Catalog",
        status: "Live catalog / source in portfolio",
        workStatus: "Live catalog / source in portfolio",
        caseStatus: "Companion app / client-side UI",
        updated: "May 2026",
        description: "A searchable public-domain movie catalog for finding titles and copying MovieBot vote commands.",
        problemLine: "Viewers need a simple way to browse eligible movies and submit valid vote commands.",
        caseProblem: "Viewers need a simple way to browse eligible movies and submit valid vote commands.",
        whatBuiltLine: "I built search, filters, vote-command copy, no-JS fallback content, poster loading, and labels.",
        whatBuilt: [
          "Search and filter controls for public-domain movie entries.",
          "Copy-to-clipboard vote commands with visible feedback.",
          "Lazy-loaded poster cards with no-JS fallback content."
        ],
        ownership: "Uses public-domain movie metadata, external IMDb links, and externally hosted poster images as source content.",
        production: "Solid catalog, copy buttons, and fallback content. Next engineering work would generate pages from one trusted data source, validate poster/link health, and keep viewer privacy intact.",
        stack: ["JavaScript", "Clipboard API", "Bundled data", "GitHub Pages"],
        stackText: "HTML, CSS Grid, vanilla JavaScript search, movie metadata, external poster images, no-JavaScript fallback markup.",
        challenge: "Keeping a large movie list searchable and indexable while preserving a readable fallback when JavaScript or external posters are unavailable.",
        testing: "Automated tests: no dedicated catalog suite exists yet. Known limitations: dynamic cards and fallback markup are still manually kept in sync. Manual QA covers search/filter cases, copy command states, result-count announcements, poster fallbacks, no-JS fallback content, mobile controls, and external link checks.",
        deployment: "Hosted/run location: GitHub Pages catalog. Environment/config: no environment variables; movie metadata lives in page/JavaScript source. External APIs/services: IMDb links and poster image URLs. Local development: run a local server and test search, copy buttons, poster loading, and no-JS fallback.",
        visual: {
          webp: "assets/movie-library-preview.webp",
          png: "assets/movie-library-preview.png",
          alt: "Movie Library page showing public-domain poster cards, search controls, and MovieBot vote-command actions",
          width: "1200",
          height: "630"
        },
        links: [
          { label: "Live catalog", href: "movie-library.html" },
          { label: "MovieBot case study", href: "moviebot-case-study.html" },
          { label: "Movie Night", href: "movie-night.html" },
          { label: "Source", href: `${githubPortfolio}/blob/main/movie-library.html` }
        ],
        caseLinks: [
          { label: "Live catalog", href: "movie-library.html" },
          { label: "MovieBot case study", href: "moviebot-case-study.html" },
          { label: "Movie Night", href: "movie-night.html" },
          { label: "Source", href: `${githubPortfolio}/blob/main/movie-library.html` }
        ]
      },
      {
        id: "judywebsite",
        title: "Judy Batten Wellness",
        displayTitle: "Judy Batten Wellness \u2014 Client Wellness Website",
        status: "Live client site / private repo",
        workStatus: "Live client site / private repo",
        updated: "May 2026",
        description: "A wellness website for Judy Batten's massage therapy, Reiki, Yin Yoga, doula support, workshops, and training offerings.",
        problemLine: "A wellness practitioner needs a calm site that explains services and turns visitor intent into direct contact.",
        whatBuiltLine: "I built the responsive landing page, service and offering sections, ocean-inspired visual system, contact paths, SEO metadata, structured data, and lightweight JavaScript interactions.",
        whatBuilt: [
          "Responsive homepage with hero, service highlights, approach copy, offerings, and contact flow.",
          "Client-specific visual direction with ocean-inspired graphics, portrait presentation, and keyboard-friendly navigation.",
          "SEO metadata, schema markup, email/contact actions, and a no-build deployment path."
        ],
        ownership: "Client content and wellness service details come from Judy Batten Wellness; the site implementation, layout, styling, and interaction layer are custom.",
        production: "Live public site with direct service and contact paths. Further safeguards would add automated link checks, form delivery monitoring, image optimization checks, and periodic content review.",
        stack: ["JavaScript", "GitHub Pages", "SEO", "Metadata"],
        stackText: "HTML, CSS, vanilla JavaScript, responsive layout, structured data, GitHub Pages.",
        challenge: "Balancing a calm client brand with service navigation, keyboard support, mobile readability, and direct contact conversion.",
        testing: "Manual QA covers responsive layouts, anchor navigation, contact links, image loading, keyboard focus, reduced-motion behavior, metadata, and live-domain smoke checks.",
        deployment: "Hosted/run location: judybatten.com. Environment/config: no public runtime secrets; contact paths use email links and client-side form behavior. Local development: run a local server from the repo root and open index.html.",
        visual: {
          webp: "assets/judywebsite-preview.webp",
          png: "assets/judywebsite-preview.png",
          alt: "Judy Batten Wellness homepage showing calm service copy, ocean-inspired visual styling, and portrait-led hero",
          width: "1440",
          height: "756"
        },
        links: [
          { label: "Live site", href: "https://judybatten.com/" }
        ],
        workLinks: [
          { label: "Live site", href: "https://judybatten.com/" }
        ]
      },
      {
        id: "portfolio-site",
        title: "Portfolio Site",
        displayTitle: "Portfolio Site \u2014 GitHub Pages Developer Portfolio",
        status: "GitHub Pages site",
        workStatus: "GitHub Pages site",
        updated: "May 2026",
        description: "A hand-built portfolio for software projects, case studies, notes, public pages, metadata, and contact paths.",
        problemLine: "A public portfolio needs to explain technical work quickly while staying fast, indexable, keyboard-friendly, and easy to maintain.",
        whatBuiltLine: "I built the site structure, responsive layouts, project pages, case-study patterns, navigation, metadata, keyboard fixes, and deployment polish.",
        whatBuilt: [
          "GitHub Pages architecture with semantic HTML and reusable CSS patterns.",
          "Clear navigation, project cards, case studies, notes, resume, and contact paths.",
          "SEO metadata, Open Graph previews, sitemap, reduced-motion support, and focus states."
        ],
        ownership: "Runs on GitHub Pages with HTML/CSS/JavaScript; external project images and embeds are credited through their linked pages.",
        production: "Solid portfolio surface. Next safeguards would add automated link checks, HTML validation, visual regression snapshots, accessibility scans, and a repeatable image/metadata release process.",
        stack: ["JavaScript", "GitHub Pages", "SEO", "Accessibility"],
        stackText: "HTML, CSS, vanilla JavaScript, GitHub Pages, SEO metadata.",
        visual: {
          webp: "inefy-desktop-final.webp",
          png: "inefy-desktop-final.png",
          alt: "Zac Batten portfolio homepage showing hero copy, selected project cards, and contact paths",
          width: "1920",
          height: "1080"
        },
        links: [
          { label: "Build note", href: "notes.html#portfolio-cleanup" },
          { label: "Source", href: githubPortfolio }
        ]
      },
      {
        id: "interactive-lab",
        title: "Interactive Lab",
        displayTitle: "Interactive Lab \u2014 Browser Mechanics Experiments",
        status: "Browser experiments",
        workStatus: "Browser experiments",
        updated: "May 2026",
        description: "A collection of small browser mechanics experiments for Canvas rendering, input handling, grid logic, game loops, LocalStorage, and status UI.",
        problemLine: "Interactive browser builds need visible controls, reliable state, responsive layouts, and enough polish to be useful portfolio evidence.",
        whatBuiltLine: "I built and refined browser tools and games with keyboard/touch input, pause states, score persistence, implementation notes, and consistent navigation.",
        whatBuilt: [
          "Canvas and DOM-based game loops with scoring, collision, movement, and restart behavior.",
          "Keyboard and touch controls with visible instructions and status updates.",
          "LocalStorage best scores, pause/resume states, mobile layout checks, and reduced-motion support."
        ],
        ownership: "Uses standard browser APIs and familiar arcade/puzzle mechanics; the implementation work is custom HTML, CSS, and JavaScript.",
        production: "Solid secondary portfolio evidence for interaction work. The games remain archived experiments, so deeper releases would need automated game-state tests, expanded keyboard alternatives, and broader device QA.",
        stack: ["Canvas", "JavaScript", "LocalStorage", "Accessibility"],
        stackText: "HTML, CSS, JavaScript, Canvas API, LocalStorage, keyboard/touch input.",
        visual: {
          webp: "assets/asteroid-drift-preview.webp",
          png: "assets/asteroid-drift-preview.png",
          alt: "Interactive Lab preview showing an Asteroid Drift canvas game start screen with controls and an asteroid field",
          width: "1233",
          height: "651"
        },
        links: [
          { label: "Open lab", href: "interactive-lab.html" },
          { label: "Browse demos", href: "interactive-lab.html#lab-archive" },
          { label: "Source", href: githubPortfolio }
        ]
      },
      {
        id: "mini-golf",
        title: "Mini Golf",
        status: "Physics game",
        workStatus: "Physics game",
        updated: "May 2026",
        description: "Touch golf needs visible aiming and scoring; I built a Canvas/JavaScript five-hole course with drag power, collision response, hazards, scorecards, and best runs.",
        whatBuilt: [
          "Created five course layouts with par values, walls, hazard zones, surface types, cup targets, and hole progression.",
          "Implemented drag aiming, shot-power calculation, ball motion, wall/hazard/cup collision checks, and stroke counting.",
          "Built scorecard UI, best-score persistence, pause/restart/fullscreen controls, touch hints, and hole navigation."
        ],
        ownership: "Uses standard canvas APIs and familiar mini-golf mechanics; the course implementation is custom JavaScript.",
        production: "Solid input, scoring, and course loop; archived experiment. A larger release would add physics edge-case tests, mobile browser QA, keyboard alternatives, and save-state migration.",
        stackText: "Canvas, JavaScript, local persistence.",
        visual: {
          webp: "assets/mini-golf-preview.webp",
          png: "assets/mini-golf-preview.png",
          alt: "Mini Golf canvas game start screen with a five-hole course, tee, cup, hazard, and start-round control",
          width: "1233",
          height: "651"
        },
        links: [
          { label: "Play", href: "mini-golf.html" },
          { label: "Source", href: `${githubPortfolio}/blob/main/mini-golf.js` }
        ]
      },
      {
        id: "asteroid-drift",
        title: "Asteroid Drift",
        status: "Arcade loop",
        workStatus: "Arcade loop",
        updated: "May 2026",
        description: "Arcade loops need low-latency input; I built a Canvas/JavaScript Asteroids-style game with thrust, shooting, shields, randomized spawns, collisions, waves, and touch controls.",
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
          { label: "Play", href: "asteroid-drift.html" },
          { label: "Source", href: `${githubPortfolio}/blob/main/asteroid-drift.js` }
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
        production: "Solid deterministic grid state and input buffering; archived experiment. A larger release would add regression tests for turns/collisions, deeper screen-reader alternatives, and save reset controls.",
        stackText: "Canvas, JavaScript, keyboard/touch input.",
        visual: {
          webp: "assets/snake-lab-preview.webp",
          png: "assets/snake-lab-preview.png",
          alt: "Snake Lab canvas playfield with start menu and touch direction controls",
          width: "1040",
          height: "341"
        },
        links: [
          { label: "Play", href: "snake-lab.html" },
          { label: "Source", href: `${githubPortfolio}/blob/main/snake-lab.js` }
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
        production: "Solid paddle, launch, collision, and score loop; archived experiment. A larger release would cover collision edge tests, performance profiling, level data validation, and keyboard fallbacks.",
        stackText: "Canvas, JavaScript, collision checks.",
        visual: {
          webp: "assets/brick-breaker-preview.webp",
          png: "assets/brick-breaker-preview.png",
          alt: "Brick Breaker canvas playfield with start menu, paddle, ball, and brick layout",
          width: "1080",
          height: "351"
        },
        links: [
          { label: "Play", href: "brick-breaker.html" },
          { label: "Source", href: `${githubPortfolio}/blob/main/brick-breaker.js` }
        ]
      },
      {
        id: "2048",
        title: "2048",
        status: "Puzzle game",
        workStatus: "Puzzle game",
        updated: "May 2026",
        description: "Tile merging needs deterministic board transforms; I built an HTML/CSS/JavaScript 2048 with single-merge rules, random spawns, undo, best score, and screen-reader summaries.",
        whatBuilt: [
          "Implemented directional board transforms, merge rules, random tile spawning, win/loss checks, score updates, and move counting.",
          "Built undo snapshots, local save/best-score persistence, keyboard shortcuts, swipe handling, and on-screen direction controls.",
          "Added a focusable board with dynamic row summaries, live status announcements, and decorative tile rendering separated from screen-reader output."
        ],
        ownership: "Uses the established 2048 rule set; the browser UI, state updates, and persistence are custom code.",
        production: "Solid board transforms, persistence, undo, and summaries; archived experiment. A larger release would add unit tests for merge rules, state migration, and screen-reader regression checks.",
        stackText: "HTML grid, JavaScript, LocalStorage.",
        visual: {
          webp: "assets/2048-preview.webp",
          png: "assets/2048-preview.png",
          alt: "2048 puzzle game start screen with numbered tiles and keyboard/touch control panels in the background",
          width: "561",
          height: "561"
        },
        links: [
          { label: "Play", href: "2048.html" },
          { label: "Source", href: `${githubPortfolio}/blob/main/2048.js` }
        ]
      },
      {
        id: "minefield-sweep",
        title: "Minefield Sweep",
        status: "Logic game",
        workStatus: "Logic game",
        updated: "May 2026",
        description: "Mine puzzles need visible state and safe starts; I built a JavaScript grid game with delayed mines, recursive reveal, flag mode, timers, and labeled cells.",
        whatBuilt: [
          "Implemented delayed mine placement, safe first reveal, adjacent counts, recursive empty-cell reveal, flag toggling, and win/loss state.",
          "Built difficulty switching, timer/best-time persistence, mines-left tracking, cleared-percent updates, pause/restart controls, and touch flag mode.",
          "Rendered the board as a keyboard-navigable grid with roving focus, row/column labels, live announcements, and state-specific cell descriptions."
        ],
        ownership: "Uses classic minesweeper rules; the board generation, reveal logic, and DOM UI are custom JavaScript.",
        production: "Strong keyboard prototype with grid state and safe first reveal. A larger release would add reveal/flag tests, focus regression checks, difficulty validation, and better saved-state controls.",
        stackText: "JavaScript grid state, DOM UI.",
        visual: {
          webp: "assets/minefield-sweep-preview.webp",
          png: "assets/minefield-sweep-preview.png",
          alt: "Minefield Sweep board preview with difficulty controls, start menu, and minefield grid",
          width: "1121",
          height: "621"
        },
        links: [
          { label: "Play", href: "minefield-sweep.html" },
          { label: "Source", href: `${githubPortfolio}/blob/main/minefield-sweep.js` }
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
        production: "Solid timing loop, collision checks, and touch input; archived experiment. A larger release would add deterministic physics tests, mobile-browser QA, reduced-motion review, and more robust pause/resume validation.",
        stackText: "Canvas, JavaScript, lightweight state machine.",
        visual: {
          webp: "assets/flappy-workbench-preview.webp",
          png: "assets/flappy-workbench-preview.png",
          alt: "Flappy Workbench canvas playfield with start menu, bird, pipe obstacles, and touch controls",
          width: "1181",
          height: "321"
        },
        links: [
          { label: "Play", href: "flappy-workbench.html" },
          { label: "Source", href: `${githubPortfolio}/blob/main/flappy-workbench.js` }
        ]
      }
    ],
    notes: [
      {
        id: "portfolio-cleanup",
        title: "Portfolio cleanup pass",
        status: "Build log",
        description: "Visitors need a fast route from project to contact; I rebuilt the portfolio around homepage positioning, CTA hierarchy, metadata, resume paths, and selected-work framing.",
        whatBuilt: [
          "Repositioned the hero around software development project paths instead of older casual homepage copy.",
          "Restructured selected work, technical strengths, notes previews, resume/contact paths, and footer navigation.",
          "Documented QA checks and accessibility/SEO follow-ups in the build notes."
        ],
        ownership: "This is a content and UI pass; GitHub Pages supplies the hosting layer.",
        stackText: "HTML, CSS, metadata, GitHub Pages.",
        links: [
          { label: "Read note", href: "notes.html#portfolio-cleanup" },
          { label: "Homepage", href: "index.html" },
          { label: "Source", href: githubPortfolio }
        ]
      },
      {
        id: "moviebot-page-split",
        title: "MovieBot stream surface split",
        status: "Build log",
        description: "MovieBot viewers need voting and browsing to stay distinct; I split the stream page from the searchable HTML/CSS/JavaScript catalog and linked both back to the Python bot case study.",
        whatBuilt: [
          "Split the live stream room and searchable catalog into separate pages with cross-links back to MovieBot.",
          "Built the movie catalog search, vote-command copy flow, poster grid, and HTML fallback list.",
          "Updated the MovieBot narrative so the bot, stream room, and catalog read as one system."
        ],
        ownership: "Uses public-domain movie data, IMDb links, external poster images, and Twitch embed APIs.",
        stackText: "GitHub Pages, movie data, no-JavaScript fallback.",
        links: [
          { label: "Read note", href: "notes.html#moviebot-page-split" },
          { label: "Movie Night", href: "movie-night.html" },
          { label: "Source", href: "https://github.com/Inefy/twitch-movie-bot" }
        ]
      },
      {
        id: "traverseops-demo-framing",
        title: "TraverseOps public framing",
        status: "Build log",
        description: "Field-operations sample apps can look shallow without context; I reframed TraverseOps around a MapLibre map, Supabase-style sample-data model, asset records, public limits, and production requirements.",
        whatBuilt: [
          "Reframed the project around field assets, inspections, work orders, imports, reports, and role-based review.",
          "Added case-study sections for architecture, public-data boundaries, screenshots, and production risks.",
          "Clarified that the public version uses sample data and needs production authentication, audit, validation, and offline sync before deployment."
        ],
        ownership: "The page documents a public sample app; the operational data shown is sample content.",
        stackText: "Product framing, case-study copy, mobile preview.",
        links: [
          { label: "Read note", href: "notes.html#traverseops-demo-framing" },
          { label: "Public app", href: "traverseops-demo.html" },
          { label: "Case study", href: "traverseops-case-study.html" }
        ]
      }
    ]
  };
})();
