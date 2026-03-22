import { describe, it, expect, beforeEach } from 'vitest'
import { useSchemaStore } from '../use-schema-store'

describe('useSchemaStore', () => {
  beforeEach(() => {
    useSchemaStore.getState().clear()
  })

  describe('tables', () => {
    it('adds a table with default PK column', () => {
      useSchemaStore.getState().addTable({ x: 100, y: 100 })
      const { tables, tablePositions } = useSchemaStore.getState()
      expect(tables).toHaveLength(1)
      expect(tables[0].columns).toHaveLength(1)
      expect(tables[0].columns[0].name).toBe('id')
      expect(tables[0].columns[0].isPrimaryKey).toBe(true)
      expect(tablePositions[tables[0].id]).toEqual({ x: 100, y: 100 })
    })

    it('removes a table and its relationships', () => {
      useSchemaStore.getState().addTable({ x: 0, y: 0 })
      useSchemaStore.getState().addTable({ x: 200, y: 0 })
      const [t1, t2] = useSchemaStore.getState().tables
      useSchemaStore.getState().addRelationship({
        sourceTableId: t1.id,
        sourceColumnId: t1.columns[0].id,
        targetTableId: t2.id,
        targetColumnId: t2.columns[0].id,
        cardinality: '1:N',
        label: 'test',
      })
      expect(useSchemaStore.getState().relationships).toHaveLength(1)

      useSchemaStore.getState().removeTable(t1.id)
      expect(useSchemaStore.getState().tables).toHaveLength(1)
      expect(useSchemaStore.getState().relationships).toHaveLength(0)
    })

    it('updates table name', () => {
      useSchemaStore.getState().addTable({ x: 0, y: 0 })
      const id = useSchemaStore.getState().tables[0].id
      useSchemaStore.getState().updateTableName(id, 'users')
      expect(useSchemaStore.getState().tables[0].name).toBe('users')
    })
  })

  describe('columns', () => {
    it('adds a column', () => {
      useSchemaStore.getState().addTable({ x: 0, y: 0 })
      const tableId = useSchemaStore.getState().tables[0].id
      useSchemaStore.getState().addColumn(tableId)
      expect(useSchemaStore.getState().tables[0].columns).toHaveLength(2)
      expect(useSchemaStore.getState().tables[0].columns[1].dataType).toBe('varchar')
    })

    it('removes a column', () => {
      useSchemaStore.getState().addTable({ x: 0, y: 0 })
      const tableId = useSchemaStore.getState().tables[0].id
      useSchemaStore.getState().addColumn(tableId)
      const colId = useSchemaStore.getState().tables[0].columns[1].id
      useSchemaStore.getState().removeColumn(tableId, colId)
      expect(useSchemaStore.getState().tables[0].columns).toHaveLength(1)
    })

    it('updates a column', () => {
      useSchemaStore.getState().addTable({ x: 0, y: 0 })
      const tableId = useSchemaStore.getState().tables[0].id
      const colId = useSchemaStore.getState().tables[0].columns[0].id
      useSchemaStore.getState().updateColumn(tableId, colId, { name: 'user_id', dataType: 'int' })
      const col = useSchemaStore.getState().tables[0].columns[0]
      expect(col.name).toBe('user_id')
      expect(col.dataType).toBe('int')
    })

    it('moves a column up/down', () => {
      useSchemaStore.getState().addTable({ x: 0, y: 0 })
      const tableId = useSchemaStore.getState().tables[0].id
      useSchemaStore.getState().addColumn(tableId)
      useSchemaStore.getState().addColumn(tableId)
      const cols = useSchemaStore.getState().tables[0].columns
      const lastId = cols[2].id

      useSchemaStore.getState().moveColumn(tableId, lastId, 'up')
      expect(useSchemaStore.getState().tables[0].columns[1].id).toBe(lastId)

      useSchemaStore.getState().moveColumn(tableId, lastId, 'down')
      expect(useSchemaStore.getState().tables[0].columns[2].id).toBe(lastId)
    })
  })

  describe('relationships', () => {
    it('adds and removes a relationship', () => {
      useSchemaStore.getState().addTable({ x: 0, y: 0 })
      useSchemaStore.getState().addTable({ x: 200, y: 0 })
      const [t1, t2] = useSchemaStore.getState().tables

      useSchemaStore.getState().addRelationship({
        sourceTableId: t1.id,
        sourceColumnId: t1.columns[0].id,
        targetTableId: t2.id,
        targetColumnId: t2.columns[0].id,
        cardinality: '1:N',
        label: 'has many',
      })
      expect(useSchemaStore.getState().relationships).toHaveLength(1)
      expect(useSchemaStore.getState().relationships[0].cardinality).toBe('1:N')

      const relId = useSchemaStore.getState().relationships[0].id
      useSchemaStore.getState().removeRelationship(relId)
      expect(useSchemaStore.getState().relationships).toHaveLength(0)
    })

    it('updates a relationship', () => {
      useSchemaStore.getState().addTable({ x: 0, y: 0 })
      useSchemaStore.getState().addTable({ x: 200, y: 0 })
      const [t1, t2] = useSchemaStore.getState().tables

      useSchemaStore.getState().addRelationship({
        sourceTableId: t1.id,
        sourceColumnId: t1.columns[0].id,
        targetTableId: t2.id,
        targetColumnId: t2.columns[0].id,
        cardinality: '1:N',
        label: '',
      })
      const relId = useSchemaStore.getState().relationships[0].id
      useSchemaStore.getState().updateRelationship(relId, { cardinality: 'M:N', label: 'many-many' })
      expect(useSchemaStore.getState().relationships[0].cardinality).toBe('M:N')
      expect(useSchemaStore.getState().relationships[0].label).toBe('many-many')
    })
  })

  describe('indexes', () => {
    it('adds and removes an index', () => {
      useSchemaStore.getState().addTable({ x: 0, y: 0 })
      const tableId = useSchemaStore.getState().tables[0].id
      useSchemaStore.getState().addIndex(tableId)
      expect(useSchemaStore.getState().tables[0].indexes).toHaveLength(1)

      const indexId = useSchemaStore.getState().tables[0].indexes[0].id
      useSchemaStore.getState().removeIndex(tableId, indexId)
      expect(useSchemaStore.getState().tables[0].indexes).toHaveLength(0)
    })
  })

  describe('selection', () => {
    it('selects and deselects table', () => {
      useSchemaStore.getState().addTable({ x: 0, y: 0 })
      const tableId = useSchemaStore.getState().tables[0].id
      useSchemaStore.getState().setSelectedTable(tableId)
      expect(useSchemaStore.getState().selectedTableId).toBe(tableId)
      useSchemaStore.getState().setSelectedTable(null)
      expect(useSchemaStore.getState().selectedTableId).toBeNull()
    })

    it('deleteSelected removes selected table', () => {
      useSchemaStore.getState().addTable({ x: 0, y: 0 })
      const tableId = useSchemaStore.getState().tables[0].id
      useSchemaStore.getState().setSelectedTable(tableId)
      useSchemaStore.getState().deleteSelected()
      expect(useSchemaStore.getState().tables).toHaveLength(0)
    })
  })

  describe('loadSchema', () => {
    it('loads full schema data', () => {
      useSchemaStore.getState().loadSchema({
        tables: [{ id: 't1', name: 'test', columns: [], indexes: [] }],
        relationships: [],
        tablePositions: { t1: { x: 50, y: 50 } },
        dialect: 'mysql',
      })
      expect(useSchemaStore.getState().tables).toHaveLength(1)
      expect(useSchemaStore.getState().dialect).toBe('mysql')
    })
  })

  describe('getSchemaData', () => {
    it('returns serializable schema data', () => {
      useSchemaStore.getState().addTable({ x: 10, y: 20 })
      const data = useSchemaStore.getState().getSchemaData()
      expect(data.tables).toHaveLength(1)
      expect(data.tablePositions).toBeDefined()
      expect(data.dialect).toBe('postgresql')
    })
  })

  describe('clear', () => {
    it('resets to initial state', () => {
      useSchemaStore.getState().addTable({ x: 0, y: 0 })
      useSchemaStore.getState().setDialect('mysql')
      useSchemaStore.getState().clear()
      expect(useSchemaStore.getState().tables).toHaveLength(0)
      expect(useSchemaStore.getState().dialect).toBe('postgresql')
    })
  })
})
