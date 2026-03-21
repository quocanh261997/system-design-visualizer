# Phase 1: Multi-Tab Workspace Shell

## Context Links

- Current app entry: `src/App.tsx`
- Flow store: `src/store/use-flow-store.ts`
- Persistence: `src/lib/persistence.ts`
- Types: `src/types/graph.ts`, `src/types/index.ts`
- Design system: `src/styles.css`

## Overview

- **Priority**: P0 (foundation -- all other P0 features depend on this)
- **Branch**: `feat/multi-tab-workspace`
- **Status**: Complete
- **Estimated effort**: 3-4 days

## Key Insights

- The current app is a single-view architecture canvas. All state lives in `useFlowStore`.
- The `ProjectData` interface in `graph.ts` only stores `nodes` and `edges`.
- The tab system must be backward-compatible: existing saved projects (which only have `nodes`/`edges`) must load without error, with new artifact fields defaulting to empty.
- Fixed tabs (always visible) simplifies implementation -- no tab management UI needed.
- Each tab will eventually have its own editor component, but for this phase we only need the shell + routing. The Architecture tab already works; other tabs show placeholder "Coming Soon" content.

## Requirements

### Functional

1. Fixed tab bar below the top toolbar with tabs: **Architecture**, **Schema**, **API**, **Sequence**, **Notes**, **Estimation**
2. Clicking a tab switches the main content area to that tab's editor
3. Architecture tab renders the existing `DesignCanvas` + `ComponentPalette` + right panels (unchanged)
4. Other tabs render placeholder components with "Coming Soon" messaging
5. Active tab is visually highlighted
6. Tab state persists across saves (which tab was last active)
7. Keyboard shortcut: `Ctrl/Cmd + 1-6` to switch tabs quickly
8. The top toolbar remains visible across all tabs
9. Template picker and shortcuts help dialogs remain global (not tab-specific)

### Non-Functional

1. Tab switching must be instant (no loading state)
2. No layout shift when switching tabs
3. Backward-compatible with existing IndexedDB projects (graceful defaults for new fields)
4. Zero new npm dependencies

## Architecture

### New Type: `WorkspaceTab`

```typescript
// src/types/workspace.ts

export type WorkspaceTabId =
  | 'architecture'
  | 'schema'
  | 'api'
  | 'sequence'
  | 'notes'
  | 'estimation'

export interface WorkspaceTabDef {
  id: WorkspaceTabId
  label: string
  icon: LucideIcon
  shortcutKey: string // '1' through '6'
  description: string
}
```

### Updated `ProjectData`

```typescript
// src/types/graph.ts -- additions

export interface ProjectNotes {
  functionalRequirements: string[]
  nonFunctionalRequirements: string[]
  assumptions: string[]
  tradeoffs: string[]
  freeformNotes: string
}

export interface EstimationRow {
  id: string
  label: string
  formula: string
  value: number
  unit: string
}

export interface DatabaseSchema {
  // Defined in Phase 4 -- placeholder here
  tables: unknown[]
  relationships: unknown[]
}

export interface ApiContract {
  // Defined in future phase -- placeholder here
  endpoints: unknown[]
}

export interface SequenceDiagram {
  // Defined in future phase -- placeholder here
  steps: unknown[]
}

export interface ProjectData {
  id: string
  name: string
  description: string
  nodes: SystemNode[]
  edges: SystemEdge[]
  // New artifact fields
  notes: ProjectNotes
  estimations: EstimationRow[]
  schemas: DatabaseSchema
  apiContracts: ApiContract
  sequences: SequenceDiagram
  activeTab: WorkspaceTabId
  createdAt: string
  updatedAt: string
}
```

### New Store: `use-workspace-store.ts`

```typescript
// src/store/use-workspace-store.ts

interface WorkspaceState {
  activeTab: WorkspaceTabId
  setActiveTab: (tab: WorkspaceTabId) => void
}
```

Intentionally lightweight. Each tab's data lives in its own store (existing `useFlowStore` for architecture, new stores for schema/notes/estimation in their respective phases).

### Component Structure

```
src/
├── components/
│   ├── workspace/
│   │   ├── workspace-tabs.tsx        # Tab bar component
│   │   └── workspace-content.tsx     # Tab content router
│   ├── tabs/
│   │   ├── architecture-tab.tsx      # Wraps existing canvas + palette + panels
│   │   ├── schema-tab-placeholder.tsx
│   │   ├── api-tab-placeholder.tsx
│   │   ├── sequence-tab-placeholder.tsx
│   │   ├── notes-tab-placeholder.tsx
│   │   └── estimation-tab-placeholder.tsx
```

### Layout Change in `App.tsx`

```
Before:
  TopToolbar
  Flex Row: [ComponentPalette | Canvas + SimControls | RightPanel]

After:
  TopToolbar
  WorkspaceTabs
  WorkspaceContent (switches based on activeTab)
    - architecture: Flex Row [ComponentPalette | Canvas + SimControls | RightPanel]
    - schema: SchemaTabPlaceholder
    - api: ApiTabPlaceholder
    - ...
```

## Related Code Files

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Extract architecture layout into `ArchitectureTab`, add workspace shell |
| `src/types/graph.ts` | Add new artifact interfaces, expand `ProjectData` |
| `src/types/index.ts` | Re-export new types |
| `src/lib/persistence.ts` | Update Dexie schema version, add migration, update save/load/export/import |
| `src/hooks/use-keyboard-shortcuts.ts` | Add Ctrl+1-6 tab switching shortcuts |
| `src/hooks/use-auto-save.ts` | Include activeTab in auto-save |

### Files to Create

| File | Purpose |
|------|---------|
| `src/types/workspace.ts` | `WorkspaceTabId`, `WorkspaceTabDef` types and tab definitions |
| `src/store/use-workspace-store.ts` | Active tab state management |
| `src/components/workspace/workspace-tabs.tsx` | Tab bar UI component |
| `src/components/workspace/workspace-content.tsx` | Tab content routing |
| `src/components/tabs/architecture-tab.tsx` | Extracted architecture view (existing canvas layout) |
| `src/components/tabs/schema-tab-placeholder.tsx` | Placeholder for Phase 4 |
| `src/components/tabs/api-tab-placeholder.tsx` | Placeholder |
| `src/components/tabs/sequence-tab-placeholder.tsx` | Placeholder |
| `src/components/tabs/notes-tab-placeholder.tsx` | Placeholder for Phase 2 |
| `src/components/tabs/estimation-tab-placeholder.tsx` | Placeholder for Phase 3 |

### Files to Delete

None.

## Implementation Steps

### Step 1: Create workspace types (1 hour)

1. Create `src/types/workspace.ts` with `WorkspaceTabId` type and `WORKSPACE_TABS` constant array defining all 6 tabs (id, label, icon from lucide-react, shortcut key, description).
2. Update `src/types/index.ts` to re-export workspace types.

### Step 2: Create workspace store (1 hour)

1. Create `src/store/use-workspace-store.ts` with Zustand store holding `activeTab` state (default: `'architecture'`).
2. Single action: `setActiveTab(tab)`.

### Step 3: Update data model and persistence (3-4 hours)

1. Add new interfaces to `src/types/graph.ts`: `ProjectNotes`, `EstimationRow`, `DatabaseSchema`, `ApiContract`, `SequenceDiagram`.
2. Expand `ProjectData` with new optional fields and `activeTab`.
3. Update `src/lib/persistence.ts`:
   - Bump Dexie version from 1 to 2.
   - Add upgrade migration: for existing projects, add default empty values for new fields.
   - Update `saveProject()` to accept and store new fields (pass through from stores).
   - Update `loadProject()` to return full `ProjectData` with defaults for missing fields.
   - Update `exportProjectJson()` and `importProjectJson()` to include new fields.

### Step 4: Extract Architecture tab component (2-3 hours)

1. Create `src/components/tabs/architecture-tab.tsx` by extracting the flex-row layout from `App.tsx` (ComponentPalette, canvas area with SimulationControls + DesignCanvas, and conditional right panel).
2. Move all architecture-specific state/logic into this component.
3. Verify the architecture tab renders identically to the current layout.

### Step 5: Create placeholder tab components (1 hour)

1. Create 5 placeholder components in `src/components/tabs/`:
   - Each shows a centered icon, tab name, "Coming Soon" label, and a brief description.
   - Consistent styling using CSS variables.
   - Each placeholder component is a simple functional component, no state.

### Step 6: Build workspace tab bar (2-3 hours)

1. Create `src/components/workspace/workspace-tabs.tsx`:
   - Horizontal tab bar below the top toolbar.
   - Renders all 6 tabs from `WORKSPACE_TABS` constant.
   - Active tab has accent color underline/highlight.
   - Each tab shows icon + label.
   - Shortcut hint shown as tooltip (e.g., "Ctrl+1").
   - Uses `useWorkspaceStore` for active state.
2. Style: compact height (~36px), same dark theme, subtle border bottom.

### Step 7: Build workspace content router (1 hour)

1. Create `src/components/workspace/workspace-content.tsx`:
   - Reads `activeTab` from `useWorkspaceStore`.
   - Renders the appropriate tab component based on active tab.
   - Architecture tab is the real component; others are placeholders.
   - Uses conditional rendering (not lazy loading -- all tabs are lightweight).

### Step 8: Rewire App.tsx (2 hours)

1. Replace the current flex-row layout in `AppContent` with:
   - `<WorkspaceTabs />` below `<TopToolbar />`
   - `<WorkspaceContent />` filling the remaining space
2. Keep `TemplatePicker` and `ShortcutsHelp` as global overlays.
3. Remove architecture-specific layout code from `App.tsx` (now in `ArchitectureTab`).
4. Verify all existing features still work through the architecture tab.

### Step 9: Add tab-switching keyboard shortcuts (1 hour)

1. Update `src/hooks/use-keyboard-shortcuts.ts`:
   - Add `Ctrl/Cmd + 1` through `Ctrl/Cmd + 6` handlers.
   - Each calls `useWorkspaceStore.getState().setActiveTab(tabId)`.
   - Prevent default (Ctrl+1-6 would otherwise switch browser tabs in some browsers).
2. Update `SHORTCUT_MAP` for shortcuts-help display.

### Step 10: Update auto-save and load flow (1-2 hours)

1. Update `useAutoSave` to include `activeTab` from workspace store.
2. Update `saveProject` signature and callers (TopToolbar, keyboard shortcuts) to pass through workspace data.
3. When loading a project (TopToolbar import, template load), set `activeTab` from loaded data (default to `'architecture'`).
4. Verify save → reload preserves active tab.

### Step 11: Testing and verification (2-3 hours)

1. Run `npm run typecheck` -- zero errors.
2. Run `npm run lint` -- zero errors.
3. Run `npm run test` -- all existing tests pass.
4. Write new tests:
   - `src/store/__tests__/use-workspace-store.test.ts`: test tab switching, default state.
   - Update persistence tests for new ProjectData fields and migration.
5. Manual verification:
   - Tab bar renders correctly with all 6 tabs.
   - Architecture tab is functionally identical to pre-change behavior.
   - Other tabs show placeholder content.
   - Ctrl+1-6 switches tabs.
   - Save/load preserves active tab.
   - Existing IndexedDB projects load without error (migration works).
   - Template loading still works.
   - Export/import JSON includes new fields.
6. Run `npm run build` -- clean production build.

## Todo Checklist

- [ ] Create `src/types/workspace.ts`
- [ ] Create `src/store/use-workspace-store.ts`
- [ ] Update `src/types/graph.ts` with new artifact interfaces
- [ ] Update `src/types/index.ts` re-exports
- [ ] Update `src/lib/persistence.ts` (Dexie v2, migration, save/load/export/import)
- [ ] Create `src/components/tabs/architecture-tab.tsx`
- [ ] Create 5 placeholder tab components
- [ ] Create `src/components/workspace/workspace-tabs.tsx`
- [ ] Create `src/components/workspace/workspace-content.tsx`
- [ ] Rewire `src/App.tsx`
- [ ] Update `src/hooks/use-keyboard-shortcuts.ts` with Ctrl+1-6
- [ ] Update `src/hooks/use-auto-save.ts`
- [ ] Write `src/store/__tests__/use-workspace-store.test.ts`
- [ ] Update persistence tests
- [ ] Run typecheck, lint, test, build -- all green
- [ ] Manual smoke test all existing features through architecture tab

## Success Criteria

1. All 6 tabs visible in tab bar with correct icons and labels
2. Architecture tab is functionally identical to pre-change behavior (no regressions)
3. Tab switching is instant with no layout shift
4. Ctrl+1-6 keyboard shortcuts work
5. Save/load preserves active tab
6. Existing projects load without error (backward-compatible)
7. Export/import JSON includes new artifact fields
8. All existing tests pass
9. New workspace store tests pass
10. Clean typecheck, lint, and build

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Architecture tab extraction breaks existing features | Medium | High | Thorough manual testing of all canvas interactions after extraction |
| Dexie migration fails for existing data | Low | High | Test migration with mock data; add defensive defaults in `loadProject` |
| Tab bar causes layout shift | Low | Medium | Use fixed height, measure before/after |
| Keyboard shortcut conflicts with browser | Medium | Low | Use `e.preventDefault()`, test across Chrome/Firefox/Safari |

## Security Considerations

- No new external data sources or API calls
- No changes to data exposure surface
- Persistence remains local-only (IndexedDB)

## Next Steps

After this phase merges:
- Phase 2 replaces `notes-tab-placeholder.tsx` with real Notes editor
- Phase 3 replaces `estimation-tab-placeholder.tsx` with real Estimation calculator
- Phase 4 replaces `schema-tab-placeholder.tsx` with real Schema designer
