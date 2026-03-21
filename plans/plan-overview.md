# P0 Feature Plans -- Overview

## Goal

Transform System Design Builder from a single-canvas diagramming tool into a complete system design interview workbench by adding multi-artifact support.

## Branch Order & Dependencies

```
1. feat/multi-tab-workspace  (foundation -- all others depend on this)
   ├── 2. feat/notes-requirements-tab     (depends on 1)
   ├── 3. feat/estimation-calculator-tab   (depends on 1)
   ├── 4. feat/database-schema-designer-tab (depends on 1)
   ├── 5. feat/copy-paste-nodes            (independent, can parallel with 1)
   └── 6. feat/interview-timer             (independent, can parallel with 1)
```

## Feature Summary

| # | Branch | Feature | Effort | Status |
|---|--------|---------|--------|--------|
| 1 | `feat/multi-tab-workspace` | Multi-tab workspace shell with fixed tabs | 3-4 days | Complete |
| 2 | `feat/notes-requirements-tab` | Notes & requirements structured editor | 1-2 days | Planned |
| 3 | `feat/estimation-calculator-tab` | Guided back-of-envelope estimation wizard | 2-3 days | Planned |
| 4 | `feat/database-schema-designer-tab` | ER diagram + DDL generation + SQL import | 3-5 days | Planned |
| 5 | `feat/copy-paste-nodes` | Copy/paste nodes within same canvas | 1 day | Planned |
| 6 | `feat/interview-timer` | Configurable interview practice timer | 0.5 days | Planned |

## User Preferences

- **Schema designer**: Visual + DDL generation + SQL import
- **Tabs**: Fixed (all artifact types always visible)
- **Estimation**: Guided wizard with presets and formulas
- **Copy/paste**: Same canvas only

## Design Principles

- Each feature is a self-contained branch that can be tested independently
- All new tabs follow existing design language (dark theme, CSS variables, same component patterns)
- Data model changes are additive (backward-compatible with existing saved projects)
- Dexie schema version bumps with migration for existing data
- No new dependencies unless absolutely necessary (prefer building with existing stack)

## Detailed Plans

- [Phase 1: Multi-Tab Workspace Shell](./phase-01-multi-tab-workspace-shell.md)
- [Phase 2: Notes & Requirements Tab](./phase-02-notes-and-requirements-tab.md)
- [Phase 3: Estimation Calculator Tab](./phase-03-estimation-calculator-tab.md)
- [Phase 4: Database Schema Designer Tab](./phase-04-database-schema-designer-tab.md)
- [Phase 5: Copy/Paste Nodes](./phase-05-copy-paste-nodes.md)
- [Phase 6: Interview Timer](./phase-06-interview-timer.md)
