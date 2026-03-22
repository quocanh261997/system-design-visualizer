import { describe, it, expect } from 'vitest'
import { generateDDL } from '../ddl-generator'
import type { SchemaTable, SchemaRelationship } from '@/types/schema'

function makeTable(overrides: Partial<SchemaTable> & { id: string; name: string }): SchemaTable {
  return {
    columns: [],
    indexes: [],
    ...overrides,
  }
}

describe('generateDDL', () => {
  it('generates CREATE TABLE for PostgreSQL', () => {
    const tables: SchemaTable[] = [
      makeTable({
        id: 't1',
        name: 'users',
        columns: [
          { id: 'c1', name: 'id', dataType: 'uuid', isPrimaryKey: true, isForeignKey: false, isNotNull: true, isUnique: false, isIndexed: false, defaultValue: '' },
          { id: 'c2', name: 'email', dataType: 'varchar', isPrimaryKey: false, isForeignKey: false, isNotNull: true, isUnique: true, isIndexed: false, defaultValue: '' },
        ],
      }),
    ]
    const ddl = generateDDL(tables, [], 'postgresql')
    expect(ddl).toContain('CREATE TABLE "users"')
    expect(ddl).toContain('"id" UUID PRIMARY KEY')
    expect(ddl).toContain('"email" VARCHAR(255) NOT NULL UNIQUE')
  })

  it('generates MySQL syntax', () => {
    const tables: SchemaTable[] = [
      makeTable({
        id: 't1',
        name: 'users',
        columns: [
          { id: 'c1', name: 'id', dataType: 'serial', isPrimaryKey: true, isForeignKey: false, isNotNull: true, isUnique: false, isIndexed: false, defaultValue: '' },
          { id: 'c2', name: 'data', dataType: 'jsonb', isPrimaryKey: false, isForeignKey: false, isNotNull: false, isUnique: false, isIndexed: false, defaultValue: '' },
        ],
      }),
    ]
    const ddl = generateDDL(tables, [], 'mysql')
    expect(ddl).toContain('`users`')
    expect(ddl).toContain('INT AUTO_INCREMENT PRIMARY KEY')
    expect(ddl).toContain('JSON')
  })

  it('generates ALTER TABLE for foreign keys', () => {
    const tables: SchemaTable[] = [
      makeTable({
        id: 't1', name: 'users',
        columns: [{ id: 'c1', name: 'id', dataType: 'uuid', isPrimaryKey: true, isForeignKey: false, isNotNull: true, isUnique: false, isIndexed: false, defaultValue: '' }],
      }),
      makeTable({
        id: 't2', name: 'posts',
        columns: [
          { id: 'c2', name: 'id', dataType: 'uuid', isPrimaryKey: true, isForeignKey: false, isNotNull: true, isUnique: false, isIndexed: false, defaultValue: '' },
          { id: 'c3', name: 'user_id', dataType: 'uuid', isPrimaryKey: false, isForeignKey: true, isNotNull: true, isUnique: false, isIndexed: false, defaultValue: '' },
        ],
      }),
    ]
    const rels: SchemaRelationship[] = [
      { id: 'r1', sourceTableId: 't2', sourceColumnId: 'c3', targetTableId: 't1', targetColumnId: 'c1', cardinality: '1:N', label: '' },
    ]
    const ddl = generateDDL(tables, rels, 'postgresql')
    expect(ddl).toContain('ALTER TABLE "posts"')
    expect(ddl).toContain('FOREIGN KEY ("user_id") REFERENCES "users" ("id")')
  })

  it('generates CREATE INDEX', () => {
    const tables: SchemaTable[] = [
      makeTable({
        id: 't1', name: 'users',
        columns: [
          { id: 'c1', name: 'id', dataType: 'uuid', isPrimaryKey: true, isForeignKey: false, isNotNull: true, isUnique: false, isIndexed: false, defaultValue: '' },
          { id: 'c2', name: 'email', dataType: 'varchar', isPrimaryKey: false, isForeignKey: false, isNotNull: false, isUnique: false, isIndexed: true, defaultValue: '' },
        ],
        indexes: [{ id: 'i1', name: 'idx_email', columns: ['c2'], type: 'btree', isUnique: false }],
      }),
    ]
    const ddl = generateDDL(tables, [], 'postgresql')
    expect(ddl).toContain('CREATE INDEX "idx_email" ON "users"')
  })

  it('generates UNIQUE INDEX', () => {
    const tables: SchemaTable[] = [
      makeTable({
        id: 't1', name: 'users',
        columns: [
          { id: 'c1', name: 'email', dataType: 'varchar', isPrimaryKey: false, isForeignKey: false, isNotNull: false, isUnique: false, isIndexed: true, defaultValue: '' },
        ],
        indexes: [{ id: 'i1', name: 'idx_email', columns: ['c1'], type: 'btree', isUnique: true }],
      }),
    ]
    const ddl = generateDDL(tables, [], 'postgresql')
    expect(ddl).toContain('CREATE UNIQUE INDEX')
  })

  it('generates DEFAULT values', () => {
    const tables: SchemaTable[] = [
      makeTable({
        id: 't1', name: 'users',
        columns: [
          { id: 'c1', name: 'active', dataType: 'boolean', isPrimaryKey: false, isForeignKey: false, isNotNull: false, isUnique: false, isIndexed: false, defaultValue: 'true' },
          { id: 'c2', name: 'role', dataType: 'varchar', isPrimaryKey: false, isForeignKey: false, isNotNull: false, isUnique: false, isIndexed: false, defaultValue: 'user' },
        ],
      }),
    ]
    const ddl = generateDDL(tables, [], 'postgresql')
    expect(ddl).toContain('DEFAULT true')
    expect(ddl).toContain("DEFAULT 'user'")
  })

  it('handles empty tables', () => {
    const ddl = generateDDL([], [], 'postgresql')
    expect(ddl).toBe('')
  })

  it('generates GIN index with USING for postgresql', () => {
    const tables: SchemaTable[] = [
      makeTable({
        id: 't1', name: 'docs',
        columns: [
          { id: 'c1', name: 'data', dataType: 'jsonb', isPrimaryKey: false, isForeignKey: false, isNotNull: false, isUnique: false, isIndexed: true, defaultValue: '' },
        ],
        indexes: [{ id: 'i1', name: 'idx_data', columns: ['c1'], type: 'gin', isUnique: false }],
      }),
    ]
    const ddl = generateDDL(tables, [], 'postgresql')
    expect(ddl).toContain('USING gin')
  })
})
