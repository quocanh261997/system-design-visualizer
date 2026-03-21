# Phase 4: Database Schema Designer Tab

## Context Links

- Workspace shell: [Phase 1](./phase-01-multi-tab-workspace-shell.md)
- Placeholder to replace: `src/components/tabs/schema-tab-placeholder.tsx`
- Types: `src/types/graph.ts` (`DatabaseSchema` defined in Phase 1)
- React Flow (reuse): `@xyflow/react` already installed
- Persistence: `src/lib/persistence.ts`
- Design system: `src/styles.css`

## Overview

- **Priority**: P0
- **Branch**: `feat/database-schema-designer-tab`
- **Depends on**: Phase 1 (multi-tab workspace)
- **Status**: Planned
- **Estimated effort**: 3-5 days

## Key Insights

- Database schema design is asked in every system design interview. Currently we have zero support.
- We can reuse React Flow as the canvas engine (already a dependency) with different node/edge types for tables and relationships.
- User requested: **Visual + DDL generation + SQL import (parse DDL into diagram)**.
- The schema canvas should feel like the architecture canvas (same interactions: drag, zoom, pan, select, delete) but with table-specific nodes and relationship edges.
- SQL parsing can use a simple regex/state-machine parser for CREATE TABLE statements -- no need for a full SQL parser library.
- Cross-linking with the architecture tab is a future enhancement (not in this phase).

## Requirements

### Functional

#### ER Diagram Canvas
1. Second React Flow canvas dedicated to database schema visualization
2. **Table nodes**: Rectangular nodes showing table name, columns list, types, constraints
3. **Relationship edges**: Lines between tables showing cardinality (1:1, 1:N, M:N)
4. Drag tables from a palette or add via button
5. Select table to edit in a right-side property panel
6. Standard canvas interactions: pan (space+drag), zoom, snap-to-grid, minimap
7. Delete tables and relationships via keyboard (Delete/Backspace) or panel button

#### Table Editor (Right Panel)
1. Table name (editable)
2. Column list with:
   - Column name
   - Data type (dropdown: varchar, int, bigint, boolean, timestamp, uuid, text, jsonb, float, serial, date, enum)
   - Constraints checkboxes: PK (primary key), FK (foreign key), NOT NULL, UNIQUE, INDEX
   - Default value (optional text input)
3. Add/remove/reorder columns
4. FK column links to a target table + column (dropdown selectors)
5. Add index definitions (column(s) + type: btree, hash, gin)

#### Relationship Management
1. Draw relationships by connecting FK column handle to target table PK handle
2. Cardinality selector: 1:1, 1:N, M:N
3. Relationship labels on edges
4. Visual indicators: crow's foot notation for cardinality on edges

#### DDL Generation
1. "Generate DDL" button produces CREATE TABLE SQL for all tables
2. Includes: column definitions, PRIMARY KEY, FOREIGN KEY constraints, indexes, NOT NULL, UNIQUE, DEFAULT
3. Dialect selector: PostgreSQL (default), MySQL
4. Generated DDL shown in a modal/panel with syntax highlighting (simple keyword coloring, no external lib)
5. Copy to clipboard button

#### SQL Import
1. "Import SQL" button opens a textarea modal
2. User pastes CREATE TABLE statements
3. Parser extracts: table names, columns (name, type, constraints), primary keys, foreign keys, indexes
4. Generates table nodes positioned in a grid layout
5. Auto-creates relationship edges from FOREIGN KEY definitions
6. Error handling: show parse errors with line numbers, skip unparseable statements

### Non-Functional

1. Reuse `@xyflow/react` -- no new canvas library
2. No SQL parser npm dependency (build a lightweight parser)
3. Support up to 30 tables without performance issues
4. Consistent dark theme with architecture canvas

## Architecture

### Data Model

```typescript
// src/types/schema.ts

export interface SchemaColumn {
  id: string
  name: string
  dataType: string
  isPrimaryKey: boolean
  isForeignKey: boolean
  isNotNull: boolean
  isUnique: boolean
  isIndexed: boolean
  defaultValue: string
  /** FK references: target table ID + column ID */
  fkTarget?: { tableId: string; columnId: string }
}

export interface SchemaIndex {
  id: string
  name: string
  columns: string[] // column IDs
  type: 'btree' | 'hash' | 'gin'
  isUnique: boolean
}

export interface SchemaTable {
  id: string
  name: string
  columns: SchemaColumn[]
  indexes: SchemaIndex[]
}

export type RelationshipCardinality = '1:1' | '1:N' | 'M:N'

export interface SchemaRelationship {
  id: string
  sourceTableId: string
  sourceColumnId: string
  targetTableId: string
  targetColumnId: string
  cardinality: RelationshipCardinality
  label: string
}

export interface DatabaseSchema {
  tables: SchemaTable[]
  relationships: SchemaRelationship[]
  /** React Flow node positions for table layout */
  tablePositions: Record<string, { x: number; y: number }>
  dialect: 'postgresql' | 'mysql'
}
```

### Store: `use-schema-store.ts`

```typescript
interface SchemaState {
  tables: SchemaTable[]
  relationships: SchemaRelationship[]
  tablePositions: Record<string, { x: number; y: number }>
  dialect: 'postgresql' | 'mysql'
  selectedTableId: string | null
  selectedRelationshipId: string | null
  // Table CRUD
  addTable: (position: { x: number; y: number }) => void
  removeTable: (tableId: string) => void
  updateTableName: (tableId: string, name: string) => void
  setSelectedTable: (tableId: string | null) => void
  setSelectedRelationship: (relationshipId: string | null) => void
  updateTablePosition: (tableId: string, position: { x: number; y: number }) => void
  // Column CRUD
  addColumn: (tableId: string) => void
  removeColumn: (tableId: string, columnId: string) => void
  updateColumn: (tableId: string, columnId: string, data: Partial<SchemaColumn>) => void
  moveColumn: (tableId: string, columnId: string, direction: 'up' | 'down') => void
  // Index CRUD
  addIndex: (tableId: string) => void
  removeIndex: (tableId: string, indexId: string) => void
  updateIndex: (tableId: string, indexId: string, data: Partial<SchemaIndex>) => void
  // Relationships
  addRelationship: (rel: Omit<SchemaRelationship, 'id'>) => void
  removeRelationship: (relId: string) => void
  updateRelationship: (relId: string, data: Partial<SchemaRelationship>) => void
  // Dialect
  setDialect: (dialect: 'postgresql' | 'mysql') => void
  // Bulk
  loadSchema: (schema: DatabaseSchema) => void
  clear: () => void
  deleteSelected: () => void
}
```

### SQL Parser: `src/lib/sql-parser.ts`

Lightweight CREATE TABLE parser:
- Regex-based line-by-line parsing
- Handles: `CREATE TABLE name (...columns...)`, column definitions, PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, DEFAULT, index creation
- Returns `{ tables: SchemaTable[], relationships: SchemaRelationship[], errors: string[] }`
- Not a full SQL parser -- handles common DDL patterns, reports errors for unsupported syntax

### DDL Generator: `src/lib/ddl-generator.ts`

- Takes `SchemaTable[]` and `SchemaRelationship[]` and `dialect`
- Outputs valid SQL DDL string
- PostgreSQL dialect: uses `SERIAL`, `TIMESTAMP`, `JSONB`, `CREATE INDEX`
- MySQL dialect: uses `AUTO_INCREMENT`, `DATETIME`, `JSON`, `CREATE INDEX`

### Component Structure

```
src/components/tabs/
└── schema-tab.tsx                     # Main schema tab (replaces placeholder)

src/components/schema/
├── schema-canvas.tsx                  # React Flow canvas for ER diagram
├── table-node.tsx                     # Custom React Flow node for tables
├── relationship-edge.tsx              # Custom edge with crow's foot notation
├── schema-palette.tsx                 # Left sidebar: add table, import SQL
├── table-property-panel.tsx           # Right panel: edit table columns, indexes
├── relationship-property-panel.tsx    # Right panel: edit relationship
├── ddl-modal.tsx                      # Modal showing generated DDL
├── sql-import-modal.tsx               # Modal for pasting SQL to import
└── schema-toolbar.tsx                 # Sub-toolbar: generate DDL, import, dialect

src/lib/
├── sql-parser.ts                      # CREATE TABLE parser
└── ddl-generator.ts                   # Schema -> SQL DDL
```

### Table Node Visual Design

```
┌──────────────────────────────┐
│  users                    🗑  │  ← Table name header (accent color bg)
├──────────────────────────────┤
│ 🔑 id          uuid     PK  │  ← Primary key row (gold key icon)
│    username    varchar   NN  │  ← NOT NULL badge
│    email       varchar   UQ  │  ← UNIQUE badge
│ 🔗 role_id     int      FK  │  ← Foreign key row (link icon)
│    created_at  timestamp NN  │
│    is_active   boolean       │
├──────────────────────────────┤
│  Indexes: idx_email (btree) │  ← Index summary footer
└──────────────────────────────┘
```

- Handle dots on left (source) and right (target) of FK columns for relationship drawing
- Table header color matches database type from architecture canvas (blue for PostgreSQL, green for MongoDB, etc.)
- Selected table has accent border (same pattern as system nodes)

### Relationship Edge Visual Design

```
  users ──────<── posts      (1:N, crow's foot at posts end)
  users ──────── profiles    (1:1, no crow's foot)
  users ──>──<── tags        (M:N, crow's foot at both ends)
```

Crow's foot notation:
- `|` (one) = single line with perpendicular bar
- `<` or `>` (many) = forked lines
- Rendered as SVG markers on the edge endpoints

## Related Code Files

### Files to Modify

| File | Change |
|------|--------|
| `src/types/graph.ts` | Replace placeholder `DatabaseSchema` with real type (or import from schema.ts) |
| `src/types/index.ts` | Re-export schema types |
| `src/lib/persistence.ts` | Wire schema store into save/load |
| `src/components/workspace/workspace-content.tsx` | Replace schema placeholder with real component |
| `src/hooks/use-auto-save.ts` | Include schema store in auto-save |

### Files to Create

| File | Purpose |
|------|---------|
| `src/types/schema.ts` | All schema-related types |
| `src/store/use-schema-store.ts` | Schema state management |
| `src/lib/sql-parser.ts` | CREATE TABLE SQL parser |
| `src/lib/ddl-generator.ts` | Schema to SQL DDL generator |
| `src/components/tabs/schema-tab.tsx` | Main schema tab layout |
| `src/components/schema/schema-canvas.tsx` | React Flow ER diagram canvas |
| `src/components/schema/table-node.tsx` | Table node component |
| `src/components/schema/relationship-edge.tsx` | Relationship edge with crow's foot |
| `src/components/schema/schema-palette.tsx` | Left sidebar (add table, tools) |
| `src/components/schema/table-property-panel.tsx` | Table editor panel |
| `src/components/schema/relationship-property-panel.tsx` | Relationship editor |
| `src/components/schema/ddl-modal.tsx` | DDL output modal |
| `src/components/schema/sql-import-modal.tsx` | SQL import modal |
| `src/components/schema/schema-toolbar.tsx` | Sub-toolbar actions |
| `src/lib/__tests__/sql-parser.test.ts` | Parser tests |
| `src/lib/__tests__/ddl-generator.test.ts` | Generator tests |
| `src/store/__tests__/use-schema-store.test.ts` | Store tests |

### Files to Delete

| File | Reason |
|------|--------|
| `src/components/tabs/schema-tab-placeholder.tsx` | Replaced by real implementation |

## Implementation Steps

### Step 1: Schema types (1 hour)

1. Create `src/types/schema.ts` with all interfaces.
2. Update `graph.ts` to import/reference the real `DatabaseSchema`.
3. Update `index.ts` re-exports.

### Step 2: Schema store (3-4 hours)

1. Create `src/store/use-schema-store.ts` with full CRUD for tables, columns, indexes, relationships.
2. Default state: empty tables, empty relationships, PostgreSQL dialect.
3. `addTable()` creates a table with a default "id" PK column.
4. `addColumn()` appends a new column with default type "varchar".
5. `addRelationship()` auto-detects cardinality from FK column types.

### Step 3: SQL parser (3-4 hours)

1. Create `src/lib/sql-parser.ts`:
   - Tokenize by statement (split on `;`).
   - For each CREATE TABLE statement:
     - Extract table name.
     - Parse column definitions (name, type, inline constraints).
     - Parse table-level constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE).
   - For CREATE INDEX statements: extract index name, table, columns, type.
   - Build `SchemaTable[]` and `SchemaRelationship[]`.
   - Return errors array for unparseable lines.
2. Test with common DDL patterns (PostgreSQL and MySQL syntax).

### Step 4: DDL generator (2-3 hours)

1. Create `src/lib/ddl-generator.ts`:
   - `generateDDL(tables, relationships, dialect): string`
   - Output CREATE TABLE statements with column defs and constraints.
   - Output ALTER TABLE for foreign keys (separate from CREATE for dependency ordering).
   - Output CREATE INDEX statements.
   - Handle dialect differences (SERIAL vs AUTO_INCREMENT, etc.).

### Step 5: Table node component (3-4 hours)

1. Create `src/components/schema/table-node.tsx`:
   - Custom React Flow node.
   - Header: table name with colored background.
   - Column rows: icon (key/link), name, type, constraint badges (PK, FK, NN, UQ).
   - Index summary footer.
   - Source/target handles on FK columns for relationship drawing.
   - Memoized with `memo()`.

### Step 6: Relationship edge component (2-3 hours)

1. Create `src/components/schema/relationship-edge.tsx`:
   - Custom React Flow edge.
   - SVG crow's foot markers for cardinality.
   - Label showing relationship name.
   - Click to select, opens relationship property panel.

### Step 7: Schema canvas (2-3 hours)

1. Create `src/components/schema/schema-canvas.tsx`:
   - Separate ReactFlow instance (wrapped in its own ReactFlowProvider if needed, or reuse the app-level one with conditional node/edge types).
   - Register `table-node` and `relationship-edge` types.
   - Convert `SchemaTable[]` -> React Flow nodes, `SchemaRelationship[]` -> React Flow edges.
   - Handle connect events to create relationships.
   - Same background, minimap, zoom controls as architecture canvas.

### Step 8: Schema palette and property panels (2-3 hours)

1. Create `schema-palette.tsx`: Compact sidebar with "Add Table" button, import SQL button, dialect selector.
2. Create `table-property-panel.tsx`: Full column editor with add/remove/reorder, type dropdown, constraint checkboxes, FK target selectors.
3. Create `relationship-property-panel.tsx`: Cardinality selector, label editor, delete.

### Step 9: DDL and import modals (2 hours)

1. Create `ddl-modal.tsx`: Uses Radix Dialog. Shows generated DDL with basic keyword coloring. Copy button. Dialect toggle.
2. Create `sql-import-modal.tsx`: Textarea for pasting SQL. "Parse" button. Shows preview of detected tables. Error list. "Import" confirms.

### Step 10: Schema tab assembly (1-2 hours)

1. Create `schema-tab.tsx`: Same layout pattern as architecture tab.
   - schema-toolbar at top (within tab).
   - Flex row: schema-palette | schema-canvas | property panel (conditional).
2. Wire into `workspace-content.tsx`.

### Step 11: Wire persistence (1-2 hours)

1. Update save/load to include schema store data.
2. Update auto-save, export, import.
3. Clear schema store on project clear/template load.

### Step 12: Testing (3-4 hours)

1. Write `src/lib/__tests__/sql-parser.test.ts`:
   - Test parsing single table, multiple tables, with FK, with indexes.
   - Test error handling for malformed SQL.
   - Test PostgreSQL and MySQL syntax variants.
2. Write `src/lib/__tests__/ddl-generator.test.ts`:
   - Test DDL output for simple table, table with FK, with indexes.
   - Test dialect differences.
3. Write `src/store/__tests__/use-schema-store.test.ts`:
   - Test table/column/relationship CRUD.
4. Run typecheck, lint, test, build.
5. Manual testing: create tables, add columns, draw relationships, generate DDL, import SQL.

## Todo Checklist

- [ ] Create `src/types/schema.ts`
- [ ] Create `src/store/use-schema-store.ts`
- [ ] Create `src/lib/sql-parser.ts`
- [ ] Create `src/lib/ddl-generator.ts`
- [ ] Create `table-node.tsx` (React Flow custom node)
- [ ] Create `relationship-edge.tsx` (React Flow custom edge)
- [ ] Create `schema-canvas.tsx`
- [ ] Create `schema-palette.tsx`
- [ ] Create `table-property-panel.tsx`
- [ ] Create `relationship-property-panel.tsx`
- [ ] Create `ddl-modal.tsx`
- [ ] Create `sql-import-modal.tsx`
- [ ] Create `schema-toolbar.tsx`
- [ ] Create `schema-tab.tsx`
- [ ] Wire into workspace and persistence
- [ ] Write SQL parser tests
- [ ] Write DDL generator tests
- [ ] Write schema store tests
- [ ] Run typecheck, lint, test, build
- [ ] Manual smoke test

## Success Criteria

1. Can add tables with columns and configure types/constraints
2. Can draw relationships between tables (FK -> PK)
3. Crow's foot notation correctly renders 1:1, 1:N, M:N
4. DDL generation produces valid PostgreSQL and MySQL syntax
5. SQL import parses CREATE TABLE statements and creates visual diagram
6. SQL import handles foreign keys and creates relationship edges
7. Parse errors are reported clearly
8. All data persists across save/load and export/import
9. Canvas interactions (pan, zoom, select, delete) work correctly
10. All tests pass, clean typecheck/lint/build

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| SQL parser too fragile for real-world DDL | High | Medium | Focus on common patterns, clear error reporting, allow manual correction |
| Two React Flow instances conflict | Medium | High | Use separate ReactFlowProvider per canvas, or conditionally mount |
| Table nodes with many columns cause performance issues | Low | Medium | Virtualize column list for tables with >20 columns |
| Crow's foot SVG markers complex to implement | Medium | Low | Start with simple line markers, iterate on crow's foot |

## Security Considerations

- SQL import is paste-only, no file upload
- Parsed SQL is never executed -- purely structural parsing
- No eval() or dynamic execution
- Generated DDL is display-only (copy to clipboard)

## Next Steps

- After merge: cross-link architecture canvas DB nodes to schema tab
- Future: reverse-engineer schema from existing database connection (requires backend)
- Future: schema migration diff tool
