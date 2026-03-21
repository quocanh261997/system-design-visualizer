# Codebase Summary

## Architecture Overview

Single-page React application using React Flow (@xyflow/react) as the canvas engine. State is managed with Zustand stores. Persistence is local-only via Dexie (IndexedDB). No backend.

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@xyflow/react` (v12) | Canvas engine: nodes, edges, pan/zoom, minimap, handles |
| `zustand` (v5) | Lightweight state management (3 stores) |
| `dexie` (v4) | IndexedDB wrapper for project persistence |
| `html-to-image` | Canvas export to PNG/SVG |
| `framer-motion` | Animations (used in UI components) |
| `lucide-react` | Icon library (component palette, toolbar) |
| `simple-icons` | Brand SVG paths for database/messaging icons |
| `@radix-ui/*` | Dialog, Popover, ScrollArea, Separator, Tooltip primitives |
| `clsx` | Conditional className utility |
| `uuid` | ID generation for nodes/edges/projects |

## Store Architecture

### `use-flow-store.ts` — Graph State
Primary store. Holds `nodes[]`, `edges[]`, selection state, project name. Provides:
- React Flow change handlers (`onNodesChange`, `onEdgesChange`, `onConnect`)
- CRUD: `addNode`, `addGroup`, `addTextNode`, `updateNodeConfig`, `updateNodeLabel`, `updateEdgeData`
- Selection: `setSelectedNode`, `setSelectedEdge`, `deleteSelected`
- Project: `loadProject`, `clear`, `setProjectName`
- Connection limit: max 2 edges between any node pair

### `use-simulation-store.ts` — Simulation State
Manages request flow simulation. Holds `steps[]`, `currentStepIndex`, `status`, `speed`, `trafficDensity`, visited sets. Provides:
- `buildSimulation(startNodeId)` — BFS traversal from start node
- `play()` — Activate all steps at once (shows full traffic flow)
- `stepForward()` — Advance one step at a time
- `pause()`, `reset()`, `setSpeed()`, `setTrafficDensity()`
- Decision gateway support with probability-weighted branch selection

### `use-undo-store.ts` — History State
Snapshot-based undo/redo. Stores `past[]` and `future[]` arrays of `{nodes, edges}`. Max 50 entries.
- `snapshot()` — Capture current state before mutation
- `undo()` / `redo()` — Restore from history
- Cross-store: reads/writes `useFlowStore` state directly

## Component Hierarchy

```
App (ReactFlowProvider)
└── AppContent
    ├── TopToolbar (save, export, import, templates, undo/redo, clear, shortcuts)
    └── Flex Row
        ├── ComponentPalette (collapsible sidebar, search, drag items)
        ├── Main Canvas Area
        │   ├── SimulationControls (overlay)
        │   └── DesignCanvas (ReactFlow)
        │       ├── SystemNodeMemo (system-component)
        │       ├── GroupNodeMemo (group boundary)
        │       ├── DecisionNodeMemo (diamond gateway)
        │       ├── TextNodeMemo (text annotation)
        │       ├── TypedEdgeMemo (connection edge)
        │       ├── ConnectionLegend (overlay)
        │       ├── ZoomControls (overlay)
        │       ├── MiniMap
        │       └── Background (dots grid)
        └── Right Panel (conditional)
            ├── AnalysisPanel (when analysis open)
            ├── EdgePropertyPanel (when edge selected)
            └── PropertyPanel (when node selected)
    ├── TemplatePicker (modal, shown on app load)
    └── ShortcutsHelp (modal)
```

## Data Flow

1. **Component drop**: Palette `onDragStart` → Canvas `onDrop` → `useFlowStore.addNode()`
2. **Edge creation**: React Flow `onConnect` → `useFlowStore.onConnect()` → creates typed-edge with sync defaults
3. **Property edit**: PropertyPanel inputs → `useFlowStore.updateNodeConfig()` / `updateEdgeData()`
4. **Save**: TopToolbar or Ctrl+S → `persistence.saveProject()` → Dexie IndexedDB
5. **Export**: TopToolbar → `export-canvas.ts` → html-to-image → download blob
6. **Analysis**: AnalysisPanel renders → `analyzeGraph(nodes, edges)` → rule functions return warnings
7. **Simulation**: SimulationControls → `buildSimulation()` → BFS steps → `play()`/`stepForward()` → visited sets update → nodes/edges re-render with glow

## Analysis Rules

| Rule | Severity | Detects |
|------|----------|---------|
| `single-point-of-failure` | warning | Critical components (DB, cache, queue, compute) with no replicas/cluster |
| `missing-cache` | warning | Direct DB access without caching layer in the path |
| `missing-rate-limit` | error | Client nodes connecting directly to services without rate limiter/API gateway |
| `unbalanced-load` | warning | Load balancer with only one downstream target |
| `missing-async` | info | Sync connections to heavy I/O targets (blob storage, data lake, etc.) |
| `missing-monitoring` | info | System with 3+ components but no monitoring component |
| `disconnected` | info | Components with zero connections |

## Test Structure

Tests live in `__tests__/` directories adjacent to source:
- `src/store/__tests__/use-flow-store.test.ts`
- `src/store/__tests__/use-flow-store-phase2.test.ts`
- `src/store/__tests__/use-simulation-store.test.ts`
- `src/store/__tests__/use-undo-store.test.ts`
- `src/lib/__tests__/analysis-engine.test.ts`

Run: `npm run test` (Vitest, jsdom environment)
