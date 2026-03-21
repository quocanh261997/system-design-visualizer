# Code Standards

## Language & Tooling

| Tool | Version | Config |
|------|---------|--------|
| TypeScript | ~5.9 | `tsconfig.json` (project references: `tsconfig.app.json`, `tsconfig.node.json`) |
| React | 19 | Functional components only, hooks-based |
| Vite | 7 | `vite.config.ts`, `@` alias to `./src` |
| ESLint | 9 | Flat config (`eslint.config.js`), includes `react-hooks` and `react-refresh` plugins |
| Vitest | 4 | `vitest run` / `vitest` (watch), jsdom environment |
| Tailwind CSS | 4 | `@tailwindcss/vite` plugin, Tailwind v4 syntax (`@import "tailwindcss"`) |

## Project Structure

```
src/
├── App.tsx                    # Root component, layout orchestration
├── main.tsx                   # Entry point (React DOM render)
├── styles.css                 # Global styles, CSS variables, React Flow overrides
├── test-setup.ts              # Vitest setup (jest-dom matchers)
├── types/                     # Shared TypeScript types
│   ├── index.ts               # Re-exports
│   ├── graph.ts               # Node/edge/project/simulation types
│   └── component-registry.ts  # Component definition & property schema types
├── store/                     # Zustand state management
│   ├── use-flow-store.ts      # Graph nodes/edges, selection, CRUD operations
│   ├── use-simulation-store.ts # Simulation playback state and BFS traversal
│   ├── use-undo-store.ts      # Snapshot-based undo/redo history
│   └── __tests__/             # Store unit tests
├── lib/                       # Pure utilities (no React)
│   ├── persistence.ts         # Dexie IndexedDB wrapper (save/load/export/import)
│   ├── analysis-engine.ts     # Rule-based graph analysis engine
│   ├── export-canvas.ts       # PNG/SVG/PDF export via html-to-image
│   └── __tests__/             # Lib unit tests
├── hooks/                     # Custom React hooks
│   ├── use-keyboard-shortcuts.ts  # Centralized keyboard shortcut handler
│   └── use-auto-save.ts          # Auto-save to IndexedDB at intervals
├── data/                      # Static data definitions
│   ├── component-definitions.ts   # 32 component definitions with properties
│   ├── templates.ts               # 10 interview design templates
│   └── brand-icons.tsx            # SVG brand icons (simple-icons paths)
└── components/                # React UI components
    ├── canvas/                # Canvas-related components
    │   ├── design-canvas.tsx      # Main React Flow canvas wrapper
    │   ├── system-node.tsx        # System component node renderer
    │   ├── group-node.tsx         # Resizable group boundary node
    │   ├── decision-node.tsx      # Diamond decision gateway node
    │   ├── text-node.tsx          # Editable text annotation node
    │   ├── typed-edge.tsx         # Connection edge with bend control and animation
    │   ├── node-shapes.tsx        # SVG shape components per category
    │   ├── connection-legend.tsx   # Connection type color legend overlay
    │   ├── zoom-controls.tsx      # Zoom in/out/fit controls
    │   └── labeled-edge.tsx       # Legacy edge (backward compat)
    ├── palette/
    │   └── component-palette.tsx  # Sidebar component browser with drag support
    ├── properties/
    │   ├── property-panel.tsx     # Node property editor (right panel)
    │   └── edge-property-panel.tsx # Edge property editor (right panel)
    ├── toolbar/
    │   ├── top-toolbar.tsx        # Top bar: save, export, templates, undo/redo
    │   ├── simulation-controls.tsx # Simulation playback controls overlay
    │   └── shortcuts-help.tsx     # Keyboard shortcuts help dialog
    ├── analysis/
    │   └── analysis-panel.tsx     # Design analysis warnings panel
    └── templates/
        └── template-picker.tsx    # Template selection modal/dialog
```

## Naming Conventions

- **Files**: kebab-case (`use-flow-store.ts`, `design-canvas.tsx`, `component-definitions.ts`)
- **Components**: PascalCase exports (`DesignCanvas`, `SystemNodeMemo`)
- **Hooks**: `use-` prefix files, `use` prefix functions (`useFlowStore`, `useAutoSave`)
- **Stores**: `use-{name}-store.ts` pattern
- **Types**: PascalCase interfaces/types (`SystemNode`, `ComponentDefinition`), grouped in `types/`
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_HISTORY`, `AUTO_SAVE_INTERVAL`, `PROTOCOL_OPTIONS`)

## Patterns

### State Management
- **Zustand** stores with `create<StateType>((set, get) => ({...}))` pattern
- Stores access each other via `useXStore.getState()` (not hooks) for cross-store reads
- Selectors: `useFlowStore((s) => s.nodes)` — always use selectors, never subscribe to entire store

### Component Patterns
- Functional components only
- `memo()` wrapping for React Flow node/edge components (exported as `*Memo`)
- `useCallback`/`useMemo` for event handlers and derived data in canvas components
- Inline styles using CSS variable references (`var(--color-panel-bg)`) for theming

### Edge/Node Data
- Node type union: `'system-component' | 'group' | 'decision-gateway' | 'text'`
- Edge type: `'typed-edge'` (with `'labeled-edge'` backward compat alias)
- All node/edge data interfaces extend with `[key: string]: unknown` for React Flow compatibility

### Drag & Drop
- Palette items set `application/sdb-component` on `dataTransfer`
- Canvas `onDrop` reads the component type and calls `addNode`

### CSS Architecture
- Tailwind CSS 4 utility classes for layout and spacing
- CSS custom properties in `styles.css` `@theme` block for color theming
- Inline `style` props for dynamic colors referencing CSS variables
- React Flow CSS overrides in `styles.css` using `!important` where needed

## Scripts

```bash
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build
npm run preview    # Preview production build
npm run test       # vitest run (single run)
npm run test:watch # vitest (watch mode)
npm run lint       # eslint .
npm run typecheck  # tsc -b --noEmit
```

## Build Configuration

- Path alias: `@` -> `./src` (configured in `vite.config.ts`)
- Manual chunks: `react-vendor`, `flow-vendor`, `ui-vendor`
- Tailwind via `@tailwindcss/vite` plugin (no PostCSS config needed)
