# Phase 5: Copy/Paste Nodes

## Context Links

- Flow store: `src/store/use-flow-store.ts`
- Undo store: `src/store/use-undo-store.ts`
- Keyboard shortcuts: `src/hooks/use-keyboard-shortcuts.ts`
- Design canvas: `src/components/canvas/design-canvas.tsx`
- Types: `src/types/graph.ts`

## Overview

- **Priority**: P0
- **Branch**: `feat/copy-paste-nodes`
- **Depends on**: None (independent of multi-tab workspace)
- **Status**: Planned
- **Estimated effort**: 1 day

## Key Insights

- Copy/paste is a fundamental UX expectation. Users will try Ctrl+C/V and be surprised when nothing happens.
- Scope: same canvas only (per user preference). No system clipboard JSON.
- Must handle: single node copy, multi-node copy (box selection), paste with offset, edge preservation between copied nodes.
- The selected node(s) can be determined from React Flow's selection state or our `selectedNodeId`.
- Edges between copied nodes should be duplicated; edges to non-copied nodes should NOT be copied.
- Paste should offset position (+50px, +50px) to avoid stacking on top of originals.
- Consecutive pastes should stack incrementally (+50px each time).

## Requirements

### Functional

1. **Ctrl/Cmd+C**: Copy selected node(s) to internal clipboard
2. **Ctrl/Cmd+V**: Paste copied node(s) onto canvas with position offset
3. **Single node**: Copy one node with its data and config
4. **Multi-node**: Copy all box-selected nodes (React Flow selection)
5. **Edge preservation**: Edges between copied nodes are duplicated in the paste
6. **Edges to external nodes**: NOT copied (would create orphan references)
7. **Position offset**: Each paste offsets by (+50, +50) from the last paste position
8. **New IDs**: Pasted nodes/edges get new UUIDs (never duplicate IDs)
9. **Undo support**: Paste creates an undo snapshot
10. **Group nodes**: If a group is selected, copy it (but not child nodes unless also selected)
11. **Text nodes**: Copyable like any other node
12. **Decision nodes**: Copyable like any other node
13. **Visual feedback**: Brief flash or indication that copy/paste happened (optional)

### Non-Functional

1. No new npm dependencies
2. Internal clipboard only (not system clipboard -- avoids serialization complexity)
3. Instant operation (no async)

## Architecture

### Internal Clipboard

Store copied nodes/edges in a module-level variable (not in Zustand -- doesn't need reactivity or persistence):

```typescript
// src/lib/clipboard.ts

interface ClipboardData {
  nodes: SystemNode[]
  edges: SystemEdge[]
  pasteCount: number // increments with each paste for offset stacking
}

let clipboard: ClipboardData | null = null

export function copyToClipboard(nodes: SystemNode[], edges: SystemEdge[]): void
export function pasteFromClipboard(): { nodes: SystemNode[]; edges: SystemEdge[] } | null
export function hasClipboardData(): boolean
```

### Copy Logic

1. Get selected nodes from React Flow instance (`getNodes().filter(n => n.selected)`) or from `selectedNodeId` (single selection).
2. Get edges where BOTH source and target are in the selected set.
3. Deep-clone node data (spread + new IDs).
4. Store in clipboard with `pasteCount = 0`.

### Paste Logic

1. Read from clipboard.
2. Generate new UUIDs for all nodes and edges.
3. Build ID mapping: `oldId -> newId`.
4. Update edge source/target references using the ID map.
5. Offset all node positions by `(50 * (pasteCount + 1), 50 * (pasteCount + 1))`.
6. Increment `pasteCount`.
7. Snapshot undo state.
8. Add nodes and edges to flow store.
9. Select the newly pasted nodes.

## Related Code Files

### Files to Modify

| File | Change |
|------|--------|
| `src/hooks/use-keyboard-shortcuts.ts` | Add Ctrl+C and Ctrl+V handlers |
| `src/store/use-flow-store.ts` | Add `addNodes` and `addEdges` bulk actions (if not already supported by `onNodesChange`) |

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/clipboard.ts` | Internal clipboard logic (copy, paste, ID remapping) |
| `src/lib/__tests__/clipboard.test.ts` | Clipboard logic tests |

### Files to Delete

None.

## Implementation Steps

### Step 1: Create clipboard module (2-3 hours)

1. Create `src/lib/clipboard.ts`:
   - `copyToClipboard(nodes, edges)`: Deep-clone nodes and edges, filter edges to internal-only, store in module variable, reset pasteCount.
   - `pasteFromClipboard()`: Read clipboard, generate new UUIDs, build oldId->newId map, remap edge source/target and id, offset positions, increment pasteCount. Return new nodes and edges.
   - `hasClipboardData()`: Boolean check.
   - Helper: `generateIdMap(oldIds: string[])` returns `Map<string, string>`.

### Step 2: Add bulk actions to flow store (30 min)

1. Check if `useFlowStore` already supports adding multiple nodes/edges at once.
2. If not, add `addNodes(nodes: SystemNode[])` and `addEdges(edges: SystemEdge[])` actions.
3. These simply append to the existing arrays.

### Step 3: Wire keyboard shortcuts (1-2 hours)

1. Update `src/hooks/use-keyboard-shortcuts.ts`:
   - **Ctrl+C handler**:
     - Get selected nodes from `useFlowStore.getState().nodes.filter(n => n.selected)`.
     - If `selectedNodeId` is set but no `.selected` flag, include that node.
     - Get edges between selected nodes.
     - Call `copyToClipboard(selectedNodes, internalEdges)`.
   - **Ctrl+V handler**:
     - Call `pasteFromClipboard()`.
     - If result is null, return.
     - Call `useUndoStore.getState().snapshot()`.
     - Call `useFlowStore.getState().addNodes(result.nodes)`.
     - Call `useFlowStore.getState().addEdges(result.edges)`.
     - Deselect all existing, select pasted nodes.
2. Update `SHORTCUT_MAP` to include Copy and Paste entries.

### Step 4: Handle edge cases (1 hour)

1. Copy with no selection: no-op.
2. Paste with empty clipboard: no-op.
3. Copy group node: include it (but NOT auto-include children -- only if they're also selected).
4. Copied edges must have `type: 'typed-edge'` preserved.
5. Copied edge data (connectionType, protocol, label, latencyMs) preserved.
6. Pasted nodes should appear within the current viewport.

### Step 5: Testing (1-2 hours)

1. Write `src/lib/__tests__/clipboard.test.ts`:
   - Test copy single node -> paste produces new ID, offset position.
   - Test copy multiple nodes -> paste preserves relative positions.
   - Test copy nodes with internal edges -> edges remapped correctly.
   - Test copy nodes with external edges -> external edges excluded.
   - Test consecutive pastes -> increasing offset.
   - Test paste empty clipboard -> returns null.
2. Run typecheck, lint, test, build.
3. Manual testing: copy single node, copy multiple, paste, verify edges, verify undo.

## Todo Checklist

- [ ] Create `src/lib/clipboard.ts`
- [ ] Add `addNodes`/`addEdges` to flow store (if needed)
- [ ] Add Ctrl+C handler to keyboard shortcuts
- [ ] Add Ctrl+V handler to keyboard shortcuts
- [ ] Update `SHORTCUT_MAP` display
- [ ] Handle edge cases (no selection, group nodes, viewport bounds)
- [ ] Write clipboard tests
- [ ] Run typecheck, lint, test, build
- [ ] Manual smoke test (single, multi, edges, undo)

## Success Criteria

1. Ctrl+C copies selected node(s)
2. Ctrl+V pastes with position offset and new IDs
3. Edges between copied nodes are preserved in paste
4. Edges to non-copied nodes are excluded
5. Consecutive pastes stack with increasing offset
6. Undo reverses a paste operation
7. Works for all node types (system, group, decision, text)
8. No ID collisions after paste
9. All existing tests pass
10. New clipboard tests pass

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| React Flow selection state inconsistent with our `selectedNodeId` | Medium | Medium | Read both sources: RF `.selected` flag and store `selectedNodeId` |
| Paste outside viewport confuses user | Low | Low | Calculate paste position relative to current viewport center |
| Module-level clipboard lost on HMR in dev | Low | Low | Acceptable for dev; clipboard is transient anyway |

## Security Considerations

- No system clipboard access (no `navigator.clipboard` API)
- Internal module variable only
- No data leaves the browser

## Next Steps

- Future: Ctrl+D for duplicate (copy + paste in one step)
- Future: Cross-project paste via system clipboard JSON encoding
- Future: Paste from external sources (import node definitions from text)
