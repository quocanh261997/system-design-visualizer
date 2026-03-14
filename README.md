# System Design Builder

A drag-and-drop system design tool for practicing and acing system design interviews — runs entirely in your browser.

<!-- Screenshot: add a screenshot or GIF here -->

## Features

- **32 built-in components** — servers, databases, caches, queues, load balancers, CDNs, and more
- **Typed connections** — sync, async, and streaming edges with labels
- **Request simulation** — trace request flow through your architecture
- **Rule-based analysis** — get feedback on common design issues
- **10 interview templates** — URL shortener, chat app, news feed, etc.
- **Export** — PNG, SVG, PDF, and JSON
- **Local-first** — all data stays in your browser via IndexedDB
- **Undo / Redo** — full history support
- **Keyboard shortcuts** — fast workflow without leaving the keyboard

## Quick Start

```bash
git clone <repo-url> && cd system-design-builder
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

| Layer | Technology |
| ----------- | -------------------------------- |
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Canvas | React Flow (@xyflow/react) |
| State | Zustand |
| Styling | Tailwind CSS 4 |
| UI | Radix UI primitives |
| Animations | Framer Motion |
| Persistence | Dexie (IndexedDB) |
| Build | Vite 7 |
| Test | Vitest 4 |
| Lint | ESLint 9 |

## Keyboard Shortcuts

| Shortcut | Action |
| -------------------- | ---------------------- |
| `Ctrl/⌘ + Z` | Undo |
| `Ctrl/⌘ + Shift + Z` | Redo |
| `Ctrl/⌘ + C` | Copy |
| `Ctrl/⌘ + V` | Paste |
| `Ctrl/⌘ + A` | Select all |
| `Delete / Backspace` | Delete selected |
| `Ctrl/⌘ + S` | Save |
| `Ctrl/⌘ + E` | Export |

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Type-check & build for production
npm run preview    # Preview production build
npm run test       # Run tests
npm run lint       # Lint with ESLint
npm run typecheck  # Type-check only
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a PR.

## License

[MIT](LICENSE) © 2026 System Design Builder Contributors
