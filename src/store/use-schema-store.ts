import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type {
  SchemaTable,
  SchemaColumn,
  SchemaIndex,
  SchemaRelationship,
  SchemaDialect,
  DatabaseSchemaData,
} from '@/types/schema'

interface SchemaState {
  tables: SchemaTable[]
  relationships: SchemaRelationship[]
  tablePositions: Record<string, { x: number; y: number }>
  dialect: SchemaDialect
  selectedTableId: string | null
  selectedRelationshipId: string | null
  addTable: (position: { x: number; y: number }) => void
  removeTable: (tableId: string) => void
  updateTableName: (tableId: string, name: string) => void
  setSelectedTable: (tableId: string | null) => void
  setSelectedRelationship: (relationshipId: string | null) => void
  updateTablePosition: (tableId: string, position: { x: number; y: number }) => void
  addColumn: (tableId: string) => void
  removeColumn: (tableId: string, columnId: string) => void
  updateColumn: (tableId: string, columnId: string, data: Partial<SchemaColumn>) => void
  moveColumn: (tableId: string, columnId: string, direction: 'up' | 'down') => void
  addIndex: (tableId: string) => void
  removeIndex: (tableId: string, indexId: string) => void
  updateIndex: (tableId: string, indexId: string, data: Partial<SchemaIndex>) => void
  addRelationship: (rel: Omit<SchemaRelationship, 'id'>) => void
  removeRelationship: (relId: string) => void
  updateRelationship: (relId: string, data: Partial<SchemaRelationship>) => void
  setDialect: (dialect: SchemaDialect) => void
  loadSchema: (schema: DatabaseSchemaData) => void
  clear: () => void
  deleteSelected: () => void
  getSchemaData: () => DatabaseSchemaData
}

function createDefaultColumn(): SchemaColumn {
  return {
    id: uuid(),
    name: 'column',
    dataType: 'varchar',
    isPrimaryKey: false,
    isForeignKey: false,
    isNotNull: false,
    isUnique: false,
    isIndexed: false,
    defaultValue: '',
  }
}

function createDefaultTable(name: string): SchemaTable {
  return {
    id: uuid(),
    name,
    columns: [
      {
        id: uuid(),
        name: 'id',
        dataType: 'uuid',
        isPrimaryKey: true,
        isForeignKey: false,
        isNotNull: true,
        isUnique: false,
        isIndexed: false,
        defaultValue: '',
      },
    ],
    indexes: [],
  }
}

export const useSchemaStore = create<SchemaState>((set, get) => ({
  tables: [],
  relationships: [],
  tablePositions: {},
  dialect: 'postgresql',
  selectedTableId: null,
  selectedRelationshipId: null,

  addTable: (position) => {
    const table = createDefaultTable(`table_${get().tables.length + 1}`)
    set({
      tables: [...get().tables, table],
      tablePositions: { ...get().tablePositions, [table.id]: position },
      selectedTableId: table.id,
      selectedRelationshipId: null,
    })
  },

  removeTable: (tableId) => {
    const { tablePositions, relationships, selectedTableId, selectedRelationshipId } = get()
    const remaining = Object.fromEntries(
      Object.entries(tablePositions).filter(([k]) => k !== tableId)
    )
    set({
      tables: get().tables.filter((t) => t.id !== tableId),
      relationships: relationships.filter(
        (r) => r.sourceTableId !== tableId && r.targetTableId !== tableId
      ),
      tablePositions: remaining,
      selectedTableId: selectedTableId === tableId ? null : selectedTableId,
      selectedRelationshipId:
        relationships.some((r) => r.id === selectedRelationshipId && (r.sourceTableId === tableId || r.targetTableId === tableId))
          ? null
          : selectedRelationshipId,
    })
  },

  updateTableName: (tableId, name) => {
    set({
      tables: get().tables.map((t) => (t.id === tableId ? { ...t, name } : t)),
    })
  },

  setSelectedTable: (tableId) =>
    set({ selectedTableId: tableId, selectedRelationshipId: null }),

  setSelectedRelationship: (relId) =>
    set({ selectedRelationshipId: relId, selectedTableId: null }),

  updateTablePosition: (tableId, position) => {
    set({
      tablePositions: { ...get().tablePositions, [tableId]: position },
    })
  },

  addColumn: (tableId) => {
    set({
      tables: get().tables.map((t) =>
        t.id === tableId
          ? { ...t, columns: [...t.columns, createDefaultColumn()] }
          : t
      ),
    })
  },

  removeColumn: (tableId, columnId) => {
    set({
      tables: get().tables.map((t) =>
        t.id === tableId
          ? { ...t, columns: t.columns.filter((c) => c.id !== columnId) }
          : t
      ),
      relationships: get().relationships.filter(
        (r) => r.sourceColumnId !== columnId && r.targetColumnId !== columnId
      ),
    })
  },

  updateColumn: (tableId, columnId, data) => {
    set({
      tables: get().tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              columns: t.columns.map((c) =>
                c.id === columnId ? { ...c, ...data } : c
              ),
            }
          : t
      ),
    })
  },

  moveColumn: (tableId, columnId, direction) => {
    set({
      tables: get().tables.map((t) => {
        if (t.id !== tableId) return t
        const idx = t.columns.findIndex((c) => c.id === columnId)
        if (idx === -1) return t
        const swap = direction === 'up' ? idx - 1 : idx + 1
        if (swap < 0 || swap >= t.columns.length) return t
        const cols = [...t.columns]
        ;[cols[idx], cols[swap]] = [cols[swap]!, cols[idx]!]
        return { ...t, columns: cols }
      }),
    })
  },

  addIndex: (tableId) => {
    const idx: SchemaIndex = {
      id: uuid(),
      name: `idx_${Date.now()}`,
      columns: [],
      type: 'btree',
      isUnique: false,
    }
    set({
      tables: get().tables.map((t) =>
        t.id === tableId ? { ...t, indexes: [...t.indexes, idx] } : t
      ),
    })
  },

  removeIndex: (tableId, indexId) => {
    set({
      tables: get().tables.map((t) =>
        t.id === tableId
          ? { ...t, indexes: t.indexes.filter((i) => i.id !== indexId) }
          : t
      ),
    })
  },

  updateIndex: (tableId, indexId, data) => {
    set({
      tables: get().tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              indexes: t.indexes.map((i) =>
                i.id === indexId ? { ...i, ...data } : i
              ),
            }
          : t
      ),
    })
  },

  addRelationship: (rel) => {
    const r: SchemaRelationship = { ...rel, id: uuid() }
    set({ relationships: [...get().relationships, r] })
  },

  removeRelationship: (relId) => {
    set({
      relationships: get().relationships.filter((r) => r.id !== relId),
      selectedRelationshipId:
        get().selectedRelationshipId === relId ? null : get().selectedRelationshipId,
    })
  },

  updateRelationship: (relId, data) => {
    set({
      relationships: get().relationships.map((r) =>
        r.id === relId ? { ...r, ...data } : r
      ),
    })
  },

  setDialect: (dialect) => set({ dialect }),

  loadSchema: (schema) => {
    set({
      tables: schema.tables,
      relationships: schema.relationships,
      tablePositions: schema.tablePositions,
      dialect: schema.dialect,
      selectedTableId: null,
      selectedRelationshipId: null,
    })
  },

  clear: () =>
    set({
      tables: [],
      relationships: [],
      tablePositions: {},
      dialect: 'postgresql',
      selectedTableId: null,
      selectedRelationshipId: null,
    }),

  deleteSelected: () => {
    const { selectedTableId, selectedRelationshipId } = get()
    if (selectedTableId) {
      get().removeTable(selectedTableId)
    } else if (selectedRelationshipId) {
      get().removeRelationship(selectedRelationshipId)
    }
  },

  getSchemaData: (): DatabaseSchemaData => ({
    tables: get().tables,
    relationships: get().relationships,
    tablePositions: get().tablePositions,
    dialect: get().dialect,
  }),
}))
