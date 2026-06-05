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
        description: "Map-first workflow for assets, inspections, work orders, imports, and reports.",
        problemLine: "Field teams need asset state and work orders in one place.",
        caseProblem: "Field teams need asset state and work orders in one place.",
        whatBuiltLine: "Built map state, role screens, imports, inspections, and work-order handoffs.",
        whatBuilt: [
          "Asset map with filters and selected-record context.",
          "Crew and supervisor inspection/work-order screens.",
          "Import and reporting flow for sample assets."
        ],
        ownership: "Uses a MapLibre-style UI and public-safe sample data; it is not a production deployment.",
        production: "Solid sample workflow. Production needs auth, audit logs, offline sync, validation, device QA, and map monitoring.",
        stack: ["MapLibre", "JavaScript", "Sample data", "GitHub Pages"],
        stackText: "MapLibre-style UI, Supabase-shaped data, sample records, desktop/mobile frontend.",
        challenge: "Keeping dense map and record screens clear on desktop and mobile.",
        testing: "Manual QA covers loading, tabs, filters, selected assets, inspections, work orders, imports, reports, mobile, focus, and empty states.",
        deployment: "Runs on GitHub Pages with client-side sample data. Production GIS keys and records would stay server-side.",
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
        description: "Python bot for Twitch votes and OBS playback.",
        problemLine: "Manual movie-night voting interrupts the stream.",
        caseProblem: "Manual movie-night voting interrupts the stream.",
        whatBuiltLine: "Built chat voting, movie selection, OBS control, token refresh, reconnects, and catalog links.",
        whatBuilt: [
          "TwitchIO commands for votes and vote changes.",
          "OBS WebSocket playback automation.",
          "Token refresh, reconnects, ties, and local movie scans."
        ],
        ownership: "Uses TwitchIO, Twitch OAuth/chat, OBS WebSocket, IMDb/poster links, and local public-domain media.",
        production: "Solid local automation. Larger release needs secret rotation, rate limits, logs, live Twitch/OBS tests, and a dashboard.",
        stack: ["Python", "TwitchIO", "OBS WebSocket", "pytest"],
        stackText: "Python, TwitchIO, OAuth refresh, OBS WebSocket, GitHub Pages support pages.",
        challenge: "Keeping Twitch auth, chat health, local files, and OBS handoff reliable.",
        testing: "Pytest covers scans, commands, OBS calls, token helpers, playback, fallbacks, startup, and cleanup. Manual QA covers OBS/Twitch config.",
        deployment: "The bot runs locally beside OBS; support pages run on GitHub Pages. Configure .env, test, then use a test channel.",
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
        description: "Canvas editor with draw tools, history, import/export, zoom, and responsive controls.",
        problemLine: "Browser drawing tools need fast input and predictable state.",
        caseProblem: "Browser drawing tools need fast input and predictable state.",
        whatBuiltLine: "Built rendering, tool state, history, import/export, shortcuts, and mobile controls.",
        whatBuilt: [
          "Pencil, eraser, shapes, fill, text, and previews.",
          "History, image import/export, zoom, and resizing.",
          "Tool, color, brush, selection, and status state."
        ],
        ownership: "Uses Canvas, Clipboard, File, Fullscreen, and LocalStorage APIs; no drawing framework.",
        production: "Solid prototype. Broader use needs smarter history, autosave, shortcuts, accessibility, and browser tests.",
        stack: ["Canvas", "JavaScript", "LocalStorage", "GitHub Pages"],
        stackText: "HTML, CSS, JavaScript, Canvas API, pointer events, LocalStorage, File APIs.",
        challenge: "Keeping state, history, resize, zoom, and export predictable across screen sizes.",
        testing: "Manual QA covers tools, undo/redo, import/export, clipboard fallback, storage, touch, focus, and responsive panels.",
        deployment: "No-build GitHub Pages tool. Drawings stay local unless exported.",
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
        description: "Searchable public-domain catalog with copyable MovieBot vote commands.",
        problemLine: "Viewers need quick browsing and valid vote commands.",
        caseProblem: "Viewers need quick browsing and valid vote commands.",
        whatBuiltLine: "Built search, vote-copy actions, no-JS fallback content, posters, and labels.",
        whatBuilt: [
          "Search and filters for public-domain movie entries.",
          "Copy-to-clipboard vote commands with visible feedback.",
          "Lazy-loaded poster cards with no-JS fallback content."
        ],
        ownership: "Uses public-domain metadata, IMDb links, and externally hosted posters.",
        production: "Solid catalog and fallback content. Next work: generate from one data source, validate posters/links, and preserve viewer privacy.",
        stack: ["JavaScript", "Clipboard API", "Bundled data", "GitHub Pages"],
        stackText: "HTML, CSS Grid, vanilla JavaScript search, movie metadata, external posters, no-JS fallback markup.",
        challenge: "Keeping the list searchable, indexable, and readable without JavaScript.",
        testing: "No dedicated catalog suite yet. Manual QA covers search, copy states, result counts, poster fallbacks, no-JS content, mobile controls, and external links.",
        deployment: "GitHub Pages catalog with no env vars. Metadata lives in page/JS source. Local: run a server and test search, copy, posters, and no-JS fallback.",
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
        description: "Wellness site for massage, Reiki, Yin Yoga, doula support, and workshops.",
        problemLine: "A wellness site needs calm service paths and clear contact routes.",
        whatBuiltLine: "Built the responsive page, service sections, visual system, contact paths, metadata, schema, and light JS.",
        whatBuilt: [
          "Responsive homepage with services and contact flow.",
          "Client-specific visuals, portrait presentation, and keyboard navigation.",
          "SEO metadata, schema, email actions, and no-build deployment."
        ],
        ownership: "Client content comes from Judy Batten Wellness; implementation, layout, styling, and interactions are custom.",
        production: "Live public site with direct contact paths. Further safeguards: link checks, form monitoring, image checks, and content review.",
        stack: ["JavaScript", "GitHub Pages", "SEO", "Metadata"],
        stackText: "HTML, CSS, vanilla JavaScript, responsive layout, structured data, GitHub Pages.",
        challenge: "Balancing calm branding, service navigation, keyboard support, mobile readability, and contact conversion.",
        testing: "Manual QA covers responsive layouts, anchors, contact links, images, focus, reduced motion, metadata, and live smoke checks.",
        deployment: "Hosted at judybatten.com with no public runtime secrets. Local: run a server and open index.html.",
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
        description: "Hand-built portfolio for projects, case studies, notes, metadata, and contact paths.",
        problemLine: "Technical work needs fast, scannable context.",
        whatBuiltLine: "Built the structure, layouts, project pages, case studies, navigation, metadata, keyboard fixes, and deployment polish.",
        whatBuilt: [
          "Semantic HTML and reusable CSS on GitHub Pages.",
          "Project cards, case studies, notes, resume, and contact paths.",
          "SEO metadata, sitemap, reduced motion, and focus states."
        ],
        ownership: "Runs on GitHub Pages with HTML/CSS/JavaScript; external images and embeds are credited through linked pages.",
        production: "Solid portfolio surface. Next safeguards: link checks, HTML validation, snapshots, accessibility scans, and release checks.",
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
        description: "Browser experiments for Canvas, input, grid logic, loops, LocalStorage, and status UI.",
        problemLine: "Interactive builds need visible controls and reliable state.",
        whatBuiltLine: "Built tools and games with keyboard/touch input, pause states, scores, notes, and shared navigation.",
        whatBuilt: [
          "Canvas and DOM loops with scoring, collisions, movement, and restart.",
          "Keyboard/touch controls with visible status.",
          "Best scores, pause/resume, mobile checks, and reduced motion."
        ],
        ownership: "Uses browser APIs and familiar arcade/puzzle mechanics; implementation is custom HTML, CSS, and JavaScript.",
        production: "Solid interaction evidence. Deeper releases would need automated state tests, expanded keyboard alternatives, and broader device QA.",
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
        description: "Canvas mini golf with drag power, collisions, hazards, scorecards, and best runs.",
        whatBuilt: [
          "Created five courses with par, walls, hazards, surfaces, cups, and progression.",
          "Implemented drag aiming, shot power, ball motion, collisions, and stroke counting.",
          "Built scorecards, best-score persistence, pause/restart/fullscreen controls, and hole navigation."
        ],
        ownership: "Uses standard canvas APIs and familiar mini-golf mechanics; the course implementation is custom JavaScript.",
        production: "Solid input, scoring, and course loop; archived experiment. A larger release would add physics tests, mobile QA, keyboard alternatives, and save migration.",
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
        description: "Canvas arcade loop with thrust, shooting, shields, randomized spawns, collisions, waves, and touch controls.",
        whatBuilt: [
          "Implemented thrust, rotation, firing, shields, wraparound movement, lives, and scoring.",
          "Built asteroid spawns, split behavior, waves, collisions, and HUD updates.",
          "Added shared keyboard/touch input, pause/restart/fullscreen, and reduced-motion handling."
        ],
        ownership: "Uses established Asteroids-style mechanics and browser canvas APIs; the runtime is custom vanilla JavaScript.",
        production: "Polished archived game prototype. Release work would tune difficulty, profile performance, test touch devices, and expand nonvisual status.",
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
        description: "Canvas Snake with buffered input, growth, collisions, pace changes, and best scores.",
        whatBuilt: [
          "Implemented grid state, food, growth, collisions, score, and length.",
          "Buffered Arrow/WASD, swipe, and touch input while blocking reversals.",
          "Added pace changes, pause/restart/fullscreen, responsive sizing, and best-score persistence."
        ],
        ownership: "Uses classic Snake rules and browser canvas APIs; the game state and controls are custom JavaScript.",
        production: "Solid grid state and input buffering; archived experiment. A larger release would add turn/collision tests, screen-reader alternatives, and save reset controls.",
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
        description: "Canvas Brick Breaker with launch state, collisions, levels, progress, and touch controls.",
        whatBuilt: [
          "Implemented paddle movement, launch state, collisions, lives, scoring, and level clears.",
          "Built progress, level, best-score, and power readouts around a responsive Canvas.",
          "Added keyboard, pointer, and touch controls that share movement and launch state."
        ],
        ownership: "Uses familiar brick-breaker mechanics and browser canvas APIs; the level/runtime logic is custom JavaScript.",
        production: "Solid paddle, launch, collision, and score loop; archived experiment. A larger release would add collision tests, profiling, level validation, and keyboard fallbacks.",
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
        description: "HTML/CSS/JavaScript 2048 with merge rules, random spawns, undo, best score, and screen-reader summaries.",
        whatBuilt: [
          "Implemented board transforms, merge rules, spawns, win/loss checks, scores, and move counts.",
          "Built undo, local save/best-score persistence, shortcuts, swipe, and direction controls.",
          "Added a focusable board with row summaries, live status, and separate visual tiles."
        ],
        ownership: "Uses the established 2048 rule set; the browser UI, state updates, and persistence are custom code.",
        production: "Solid transforms, persistence, undo, and summaries; archived experiment. A larger release would add merge tests, state migration, and screen-reader checks.",
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
        description: "JavaScript mine puzzle with delayed mines, recursive reveal, flag mode, timers, and labeled cells.",
        whatBuilt: [
          "Implemented delayed mines, safe first reveal, adjacent counts, recursive reveal, flags, and win/loss state.",
          "Built difficulty, timer/best-time persistence, mines-left tracking, progress, pause/restart, and touch flag mode.",
          "Rendered a keyboard grid with roving focus, labels, live announcements, and cell descriptions."
        ],
        ownership: "Uses classic minesweeper rules; the board generation, reveal logic, and DOM UI are custom JavaScript.",
        production: "Strong keyboard prototype with grid state and safe first reveal. A larger release would add reveal/flag tests, focus checks, difficulty validation, and better saved-state controls.",
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
        description: "Canvas Flappy-style loop with gravity, obstacle gaps, collisions, best score, pause, and mobile input.",
        whatBuilt: [
          "Implemented gravity, jumps, pipe spawning, gaps, collisions, scoring, and restart flow.",
          "Built the render loop, scrolling obstacles, ground, menu state, status text, and best-score persistence.",
          "Added keyboard, pointer, tap, and mobile Flap controls with pause/restart/fullscreen."
        ],
        ownership: "Uses Flappy-style mechanics and browser canvas APIs; the implementation is custom vanilla JavaScript.",
        production: "Solid timing loop, collisions, and touch input; archived experiment. A larger release would add physics tests, mobile QA, reduced-motion review, and pause/resume validation.",
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
        description: "Portfolio cleanup for faster project review, contact paths, metadata, resume paths, and selected-work framing.",
        whatBuilt: [
          "Repositioned the hero around project paths.",
          "Restructured selected work, strengths, notes previews, resume/contact paths, and footer navigation.",
          "Documented QA checks and accessibility/SEO follow-ups."
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
        description: "Split MovieBot into a focused stream page and searchable voting catalog, both linked to the Python case study.",
        whatBuilt: [
          "Split the stream room and catalog into separate pages.",
          "Built catalog search, vote-command copy, poster grid, and HTML fallback list.",
          "Linked the bot, stream room, and catalog as one system."
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
        description: "Reframed TraverseOps around map UI, sample data, asset records, public limits, and production needs.",
        whatBuilt: [
          "Reframed field assets, inspections, work orders, imports, reports, and roles.",
          "Added architecture, public-data boundaries, screenshots, and production risks.",
          "Clarified sample-data limits and production needs: auth, audit, validation, and offline sync."
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
