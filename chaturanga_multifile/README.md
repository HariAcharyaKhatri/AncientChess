# Ancient Chess (Chaturanga & Classic Strategy Web Application)

## Project Overview
This is a modern, modular, production-ready implementation of **Ancient Chess (Chaturanga & Standard Chess)**. It features full dual-mode gameplay (Standard Chess & Ancient Indian Chaturanga), smart bots with tactical evaluation, tactical puzzles, interactive analysis tools, real-time clock engine, local pass & play, online multiplayer capabilities, procedural Web Audio sound synthesis, and high-resolution SVG piece sets.

---

## Architecture & Directory Structure

```
chaturanga_multifile/
├── index.html                 # Main entry point linking all CSS and JS modules
├── README.md                  # Project documentation & Open Source acknowledgments
│
├── css/                       # Modular Design Tokens & Component Styling
│   ├── tokens.css             # CSS custom properties, palette, dimensions
│   ├── base.css               # Reset, typography, animations, utilities
│   ├── layout.css             # Sidebar, topbar, mobile tabbar, screen containers
│   ├── components.css         # Buttons, cards, modals, toast, chips, switches
│   ├── play.css               # Play hub, time controls, bot cards, room creation
│   ├── game.css               # Board canvas, player bars, clocks, eval bar, chat
│   └── profile.css            # Profile tabs, stats grid, leaderboard, learn path
│
├── js/                        # Modular JavaScript Architecture (Clear separation of concerns)
│   ├── core/                  # Core foundational utilities
│   │   ├── state.js           # Shared state variables & globals
│   │   ├── constants.js       # Bot configs, themes, time control groups, rules
│   │   ├── utils.js           # Coordinate calculations, HTML escaping, modals, toast
│   │   └── audio.js           # Web Audio API procedural sound synthesizer (Move, Capture, Check, Victory)
│   │
│   ├── engine/                # Core Chess & Chaturanga rules engine
│   │   ├── moves.js           # Board generation, move calculations, check detection, en passant, castling
│   │   └── game-state.js      # GameState class, move execution, algebraic notation, rating adjustments
│   │
│   ├── board/                 # Canvas graphics & user input
│   │   ├── render.js          # Canvas 2D board & piece rendering (SVG piece loader + Unicode fallback)
│   │   └── input.js           # Mouse and touch interaction, board resizing, flip handling
│   │
│   ├── game/                  # Gameplay flows & features
│   │   ├── game.js            # Match orchestration, Bot play, Pass & Play, PGN export, resign/draw
│   │   ├── clock.js           # Real-time incremental match timers & countdown sync
│   │   ├── history.js         # Move list notation table, player bars, status updates
│   │   ├── puzzles.js         # Interactive daily puzzles & tactical problem trainer
│   │   └── features.js        # Feature popups, club modals, profile editor, card click wiring
│   │
│   ├── network/               # Multiplayer & Server synchronization
│   │   ├── ws.js              # WebSocket connection, optimistic state snapshots
│   │   └── handlers.js        # Server message routing, match start, remote clock sync
│   │
│   └── profile/               # Player data & Community
│       ├── profile.js         # Preferences storage, screen navigation, user authentication
│       └── leaderboard.js     # Live server & local player rankings and analytics
│
└── assets/                    # Static Assets
    ├── images/                # Vector Piece Sets
    │   ├── pieces-cburnett/   # Colin M.L. Burnett standard vector chess pieces (CC BY-SA 3.0)
    │   └── pieces-staunty/    # Staunty classic vector piece style
    └── sounds/                # Procedural Web Audio API sound generator (Zero external dependencies)
```

---

## Open Source Items & Libraries Used

1. **Piece Graphics (Cburnett & Staunty Sets)**:
   - *Author*: Colin M.L. Burnett (Cburnett)
   - *License*: Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0) / GNU Free Documentation License
   - *Usage*: High-resolution vector SVG piece graphics rendered dynamically onto the HTML5 Canvas.

2. **Google Fonts (CDN)**:
   - **Inter**: Clean, readable modern UI typeface (SIL Open Font License).
   - **Cinzel**: Classic serif typeface used for titles and headers (SIL Open Font License).
   - **JetBrains Mono**: Monospace font for time displays and algebraic move notations (Apache 2.0).

3. **Font Awesome 6 (Free CDN)**:
   - Modern icon suite for UI buttons, badges, tools, and social features.
   - *License*: Icons (CC BY 4.0), Web Fonts (SIL OFL 1.1), Code (MIT).

4. **Web Audio API Engine**:
   - Zero-dependency procedural audio synthesis designed to guarantee that piece moves, captures, checks, and game over sounds work reliably in all modern browsers without requiring external audio CDN downloads.

---

## How to Run

1. Open `d:\HARI KHATRI\AC WEB\chaturanga_multifile\index.html` directly in any modern web browser (Chrome, Edge, Firefox, Safari).
2. Enjoy playing offline immediately against AI Bots, in Pass & Play mode, or practice with Tactics Puzzles!
