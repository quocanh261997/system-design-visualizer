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
  fkTarget?: { tableId: string; columnId: string }
}

export interface SchemaIndex {
  id: string
  name: string
  columns: string[]
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

export type SchemaDialect = 'postgresql' | 'mysql'

export interface DatabaseSchemaData {
  tables: SchemaTable[]
  relationships: SchemaRelationship[]
  tablePositions: Record<string, { x: number; y: number }>
  dialect: SchemaDialect
}

export const DEFAULT_SCHEMA_DATA: DatabaseSchemaData = {
  tables: [],
  relationships: [],
  tablePositions: {},
  dialect: 'postgresql',
}

export const DATA_TYPES = [
  'varchar', 'text', 'int', 'bigint', 'serial', 'float',
  'boolean', 'timestamp', 'date', 'uuid', 'jsonb', 'enum',
] as const

export const INDEX_TYPES = ['btree', 'hash', 'gin'] as const
