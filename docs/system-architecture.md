# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (SPA)                        │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  React   │  │  Zustand  │  │   React Flow Engine  │  │
│  │  19 UI   │──│  Stores   │──│   (@xyflow/react)    │  │
│  └──────────┘  └────┬─────┘  └──────────────────────┘  │
│                     │                                    │
│            ┌────────┴────────┐                          │
│            │                 │                          │
│  ┌─────────▼──┐  ┌──────────▼──┐                       │
│  │  Analysis  │  │ Persistence  │                       │
│  │   Engine   │  │   (Dexie)    │                       │
│  └────────────┘  └──────┬──────┘                       │
│                         │                               │
│                  ┌──────▼──────┐                        │
│                  │  IndexedDB   │                        │
│                  └─────────────┘                        │
└─────────────────────────────────────────────────────────┘
```

## Data Architecture

### State Layer (Zustand)

Three independent stores communicate via `getState()`:

```
┌─────────────────┐     reads     ┌──────────────────┐
│  useFlowStore   │◄─────────────│  useUndoStore    │
│                 │  reads/writes │                  │
│  nodes, edges,  │──────────────►│  past[], future[]│
│  selection,     │               └──────────────────┘
│  project meta   │
└────────┬────────┘
         │ reads
         ▼
┌──────────────────┐
│useSimulationStore│
│                  │
│ steps, status,   │
│ visited sets     │
└──────────────────┘
```

### Persistence Layer

```
useFlowStore.getState()
        │
        ▼
  saveProject()  ──►  Dexie DB ("system-design-builder")
        │                    │
        │              projects table
        │              PK: id
        │              indexes: name, updatedAt
        ▼
  ProjectData {
    id, name, description,
    nodes: SystemNode[],
    edges: SystemEdge[],
    createdAt, updatedAt
  }
```

Auto-save runs every 30 seconds via `useAutoSave` hook.

### Type Hierarchy

```
SystemNode = Node<SystemNodeData, NodeType>
  └── SystemNodeData
        ├── componentType: string (maps to ComponentDefinition)
        ├── label: string
        ├── config: ComponentConfig (Record<string, string|number|boolean>)
        └── expanded?: boolean

SystemEdge = Edge<SystemEdgeData>
  └── SystemEdgeData
        ├── connectionType: 'sync' | 'async' | 'streaming' | 'response'
        ├── protocol: string
        ├── label: string
        ├── latencyMs: number
        ├── traffic: number
        ├── branchLabel: string
        ├── probability: number
        └── curvatureOffset: number

ComponentDefinition
  ├── type, label, category, description
  ├── icon: LucideIcon
  ├── color: string
  ├── properties: PropertySchema[]
  └── defaultPorts: { inputs, outputs }
```

## Component Architecture

### Node Type Registry

| Type | Component | Shape | Purpose |
|------|-----------|-------|---------|
| `system-component` | `SystemNodeMemo` | Rounded rect | Main system design components |
| `group` | `GroupNodeMemo` | Dashed rect (resizable) | Logical boundaries |
| `decision-gateway` | `DecisionNodeMemo` | Diamond | Conditional branching |
| `text` | `TextNodeMemo` | None (text only) | Annotations |

### Edge Type Registry

| Type | Component | Purpose |
|------|-----------|---------|
| `typed-edge` | `TypedEdgeMemo` | Primary edge with connection type styling |
| `labeled-edge` | `TypedEdgeMemo` | Backward compatibility alias |

## Simulation Engine

BFS traversal with decision gateway support:

```
buildStepsFromGraph(startNodeId)
  │
  ├── Initialize queue with startNode
  ├── While queue not empty:
  │     ├── Dequeue current node
  │     ├── Get outgoing edges
  │     ├── If decision gateway with probabilities:
  │     │     └── pickDecisionBranch() → select one edge
  │     ├── For each edge to follow:
  │     │     ├── Skip if target already visited
  │     │     ├── Calculate cumulative latency
  │     │     ├── Create SimulationStep
  │     │     └── Enqueue target node
  │     └── Continue
  └── Return steps[]
```

Play mode activates all steps simultaneously for traffic visualization. Step mode advances one edge at a time.

## Analysis Engine

Rule-based static analysis:

```
analyzeGraph(nodes, edges)
  │
  ├── Run each AnalysisRule function
  │     ├── spofRule → single points of failure
  │     ├── missingCacheRule → DB without cache layer
  │     ├── missingRateLimitRule → clients without rate limiting
  │     ├── unbalancedLoadRule → LB with single target
  │     ├── missingAsyncRule → sync to heavy I/O targets
  │     ├── missingMonitoringRule → no monitoring component
  │     └── disconnectedRule → isolated components
  │
  ├── Collect all AnalysisWarning[]
  └── Sort by severity (error > warning > info)
```

## Export Pipeline

```
exportAsPng/Svg/Pdf(filename)
  │
  ├── Get .react-flow__viewport element
  ├── Apply export options (bg color, pixel ratio, filter controls)
  ├── html-to-image → toPng() or toSvg()
  ├── Convert data URL to Blob
  └── Trigger download (PNG/SVG) or open print dialog (PDF)
```

## Build & Bundle Strategy

Vite with manual chunk splitting:

| Chunk | Contents |
|-------|----------|
| `react-vendor` | react, react-dom |
| `flow-vendor` | @xyflow/react |
| `ui-vendor` | lucide-react, framer-motion |
| Main bundle | Application code, Zustand, Dexie, Tailwind |
