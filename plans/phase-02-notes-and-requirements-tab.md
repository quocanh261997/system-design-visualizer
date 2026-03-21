# Phase 2: Notes & Requirements Tab

## Context Links

- Workspace shell: [Phase 1](./phase-01-multi-tab-workspace-shell.md)
- Placeholder to replace: `src/components/tabs/notes-tab-placeholder.tsx`
- Types: `src/types/graph.ts` (`ProjectNotes` defined in Phase 1)
- Persistence: `src/lib/persistence.ts`
- Design system: `src/styles.css`

## Overview

- **Priority**: P0
- **Branch**: `feat/notes-requirements-tab`
- **Depends on**: Phase 1 (multi-tab workspace)
- **Status**: Planned
- **Estimated effort**: 1-2 days

## Key Insights

- Every system design interview starts with requirements gathering. This is where candidates often lose points by jumping straight to architecture.
- The notes tab should be structured enough to guide the interview workflow, but flexible enough for freeform thinking.
- No external dependencies needed. This is a pure UI component with state in a Zustand store.
- Data model (`ProjectNotes`) is already scaffolded in Phase 1 -- this phase implements the editor.

## Requirements

### Functional

1. Replace `notes-tab-placeholder.tsx` with a full notes editor
2. Four structured sections, each with a distinct visual treatment:
   - **Functional Requirements**: Checklist items (add, check/uncheck, delete, reorder)
   - **Non-Functional Requirements**: Predefined categories with value inputs:
     - Latency (target ms/s)
     - Throughput (target QPS/RPS)
     - Availability (target %, e.g., 99.9%)
     - Consistency model (select: strong/eventual/causal)
     - Storage estimate (value + unit)
     - Read-write ratio (e.g., 10:1)
   - **Assumptions & Constraints**: Checklist items (same as functional requirements)
   - **Trade-offs & Decisions**: Log entries, each with a decision title, options considered, chosen option, and rationale
3. Freeform markdown-style notes area at the bottom (plain textarea, no rich text editor)
4. All data auto-saves with the project (via existing auto-save mechanism)
5. Sections are collapsible (click header to expand/collapse)
6. Empty state shows helpful prompts (e.g., "What should the system do?")

### Non-Functional

1. Responsive within the workspace content area
2. No new npm dependencies
3. Consistent with existing design language (CSS variables, dark theme)
4. Keyboard-friendly: Enter to add new item, Tab to move between fields

## Architecture

### Data Model

```typescript
// Already defined in Phase 1 types, refined here:

export interface FunctionalRequirement {
  id: string
  text: string
  completed: boolean
}

export interface NonFunctionalTargets {
  latencyMs: number | null
  throughputQps: number | null
  availabilityPercent: number | null
  consistencyModel: 'strong' | 'eventual' | 'causal' | null
  storageEstimate: string
  readWriteRatio: string
}

export interface TradeoffEntry {
  id: string
  title: string
  options: string
  chosen: string
  rationale: string
}

export interface ProjectNotes {
  functionalRequirements: FunctionalRequirement[]
  nonFunctionalTargets: NonFunctionalTargets
  assumptions: FunctionalRequirement[] // same structure as FR (checklist)
  tradeoffs: TradeoffEntry[]
  freeformNotes: string
}
```

### Store: `use-notes-store.ts`

```typescript
interface NotesState {
  notes: ProjectNotes
  // Functional requirements
  addFunctionalReq: (text: string) => void
  toggleFunctionalReq: (id: string) => void
  removeFunctionalReq: (id: string) => void
  updateFunctionalReq: (id: string, text: string) => void
  // Non-functional targets
  updateNonFunctionalTargets: (targets: Partial<NonFunctionalTargets>) => void
  // Assumptions
  addAssumption: (text: string) => void
  toggleAssumption: (id: string) => void
  removeAssumption: (id: string) => void
  updateAssumption: (id: string, text: string) => void
  // Tradeoffs
  addTradeoff: (entry: Omit<TradeoffEntry, 'id'>) => void
  removeTradeoff: (id: string) => void
  updateTradeoff: (id: string, data: Partial<TradeoffEntry>) => void
  // Freeform
  setFreeformNotes: (text: string) => void
  // Bulk
  loadNotes: (notes: ProjectNotes) => void
  clear: () => void
}
```

### Component Structure

```
src/components/tabs/
└── notes-tab.tsx                     # Main notes tab (replaces placeholder)

src/components/notes/
├── functional-requirements-section.tsx  # Checklist editor
├── non-functional-targets-section.tsx   # Structured form inputs
├── assumptions-section.tsx              # Checklist editor (reuses pattern)
├── tradeoffs-section.tsx                # Trade-off log entries
├── freeform-notes-section.tsx           # Plain textarea
└── checklist-item.tsx                   # Reusable checklist row component
```

### Layout

```
┌─────────────────────────────────────────────────────┐
│ Notes & Requirements                    [Expand All] │
├─────────────────────────────────────────────────────┤
│ ▼ Functional Requirements                           │
│   ☐ Users should be able to shorten URLs            │
│   ☑ System should redirect short URLs               │
│   [+ Add requirement]                               │
├─────────────────────────────────────────────────────┤
│ ▼ Non-Functional Targets                            │
│   Latency:      [200] ms                            │
│   Throughput:   [10000] QPS                         │
│   Availability: [99.9] %                            │
│   Consistency:  [Eventual ▼]                        │
│   Storage:      [500 GB]                            │
│   R/W Ratio:    [10:1]                              │
├─────────────────────────────────────────────────────┤
│ ▼ Assumptions & Constraints                         │
│   ☐ 100M daily active users                         │
│   [+ Add assumption]                                │
├─────────────────────────────────────────────────────┤
│ ▼ Trade-offs & Decisions                            │
│   ┌ SQL vs NoSQL ─────────────────────────────┐     │
│   │ Options: PostgreSQL, MongoDB, DynamoDB    │     │
│   │ Chosen: PostgreSQL                        │     │
│   │ Rationale: Need ACID for transactions     │     │
│   └───────────────────────────────────────────┘     │
│   [+ Add trade-off]                                 │
├─────────────────────────────────────────────────────┤
│ ▼ Free-form Notes                                   │
│   [                                                 │
│     Multiline textarea for any additional           │
│     thoughts, diagrams-as-text, etc.                │
│   ]                                                 │
└─────────────────────────────────────────────────────┘
```

## Related Code Files

### Files to Modify

| File | Change |
|------|--------|
| `src/types/graph.ts` | Refine `ProjectNotes` interface with detailed sub-types |
| `src/types/index.ts` | Re-export new note types |
| `src/lib/persistence.ts` | Wire notes store data into save/load |
| `src/components/workspace/workspace-content.tsx` | Replace notes placeholder with real component |
| `src/hooks/use-auto-save.ts` | Include notes store in auto-save |

### Files to Create

| File | Purpose |
|------|---------|
| `src/store/use-notes-store.ts` | Notes state management |
| `src/components/tabs/notes-tab.tsx` | Main notes tab layout |
| `src/components/notes/functional-requirements-section.tsx` | FR checklist |
| `src/components/notes/non-functional-targets-section.tsx` | NFR form |
| `src/components/notes/assumptions-section.tsx` | Assumptions checklist |
| `src/components/notes/tradeoffs-section.tsx` | Trade-off cards |
| `src/components/notes/freeform-notes-section.tsx` | Textarea |
| `src/components/notes/checklist-item.tsx` | Reusable checklist row |
| `src/store/__tests__/use-notes-store.test.ts` | Store tests |

### Files to Delete

| File | Reason |
|------|--------|
| `src/components/tabs/notes-tab-placeholder.tsx` | Replaced by real implementation |

## Implementation Steps

### Step 1: Refine data types (30 min)

1. Update `src/types/graph.ts`: replace the placeholder `ProjectNotes` with the detailed interface (FunctionalRequirement, NonFunctionalTargets, TradeoffEntry).
2. Update `src/types/index.ts` re-exports.

### Step 2: Create notes store (1-2 hours)

1. Create `src/store/use-notes-store.ts` with all CRUD operations.
2. Default state: empty arrays, null targets, empty freeform string.
3. All mutations use immutable patterns (spread + map/filter).
4. `loadNotes(notes)` replaces entire state (used when loading a project).
5. `clear()` resets to defaults.

### Step 3: Build reusable checklist item component (1 hour)

1. Create `src/components/notes/checklist-item.tsx`:
   - Checkbox, editable text input, delete button.
   - Enter key in input adds a new item below (callback prop).
   - Backspace on empty input deletes the item.
   - Checked items show strikethrough styling.

### Step 4: Build section components (3-4 hours)

1. **functional-requirements-section.tsx**: Collapsible header + checklist items + "Add" button.
2. **non-functional-targets-section.tsx**: Form grid with labeled inputs for each target.
3. **assumptions-section.tsx**: Same pattern as functional requirements (reuse checklist item).
4. **tradeoffs-section.tsx**: Card-style entries with 4 fields each (title, options, chosen, rationale). Add/remove.
5. **freeform-notes-section.tsx**: Collapsible header + auto-resizing textarea.

### Step 5: Build notes tab layout (1-2 hours)

1. Create `src/components/tabs/notes-tab.tsx`:
   - Scrollable container with max-width for readability (~800px, centered).
   - Header: "Notes & Requirements" with expand-all/collapse-all toggle.
   - Renders all 5 sections vertically.
   - Empty state messaging in each section.

### Step 6: Wire into workspace (1 hour)

1. Update `workspace-content.tsx` to render `NotesTab` instead of placeholder.
2. Delete `notes-tab-placeholder.tsx`.

### Step 7: Wire into persistence (1-2 hours)

1. Update `saveProject()` to read from `useNotesStore.getState()` and include in `ProjectData`.
2. Update `loadProject()` / template loading to call `useNotesStore.getState().loadNotes()`.
3. Update `clear()` flow to also clear notes store.
4. Update `exportProjectJson()` and `importProjectJson()` to include notes.
5. Update `useAutoSave` to include notes data.

### Step 8: Testing (1-2 hours)

1. Write `src/store/__tests__/use-notes-store.test.ts`:
   - Test add/toggle/remove/update for functional requirements.
   - Test non-functional targets updates.
   - Test trade-off CRUD.
   - Test loadNotes and clear.
2. Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`.
3. Manual testing: add items, save, reload, verify persistence.

## Todo Checklist

- [ ] Refine `ProjectNotes` types in `graph.ts`
- [ ] Create `use-notes-store.ts`
- [ ] Create `checklist-item.tsx`
- [ ] Create `functional-requirements-section.tsx`
- [ ] Create `non-functional-targets-section.tsx`
- [ ] Create `assumptions-section.tsx`
- [ ] Create `tradeoffs-section.tsx`
- [ ] Create `freeform-notes-section.tsx`
- [ ] Create `notes-tab.tsx`
- [ ] Wire into `workspace-content.tsx`
- [ ] Wire into persistence (save/load/export/import)
- [ ] Write store tests
- [ ] Run typecheck, lint, test, build
- [ ] Manual smoke test (add, save, reload, clear)

## Success Criteria

1. Notes tab renders all 5 sections correctly
2. Checklist items can be added, checked, edited, deleted
3. Non-functional targets form saves values
4. Trade-offs can be added with all 4 fields
5. Freeform notes persist
6. All data survives save → reload cycle
7. All data included in JSON export/import
8. Template loading clears notes
9. All existing tests pass (no regressions)
10. New store tests pass

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Checklist keyboard handling conflicts with global shortcuts | Medium | Low | Check isInput guard in keyboard shortcuts hook |
| Auto-save frequency not enough for rapid note-taking | Low | Low | Notes store changes trigger save; debounce if needed |
| Large freeform notes slow down persistence | Low | Low | IndexedDB handles large text blobs well |

## Security Considerations

- No external data sources
- All data remains in local IndexedDB
- No user-generated HTML rendering (plain text only, no XSS vector)

## Next Steps

- This tab is self-contained after merge
- Could later add: drag-to-reorder requirements, markdown rendering for freeform notes, requirement priority tags
