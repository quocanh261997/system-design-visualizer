import type { SchemaTable, SchemaRelationship, SchemaDialect } from '@/types/schema'

function escapeId(name: string, dialect: SchemaDialect): string {
  return dialect === 'mysql' ? `\`${name}\`` : `"${name}"`
}

function mapType(dataType: string, dialect: SchemaDialect): string {
  const map: Record<string, Record<SchemaDialect, string>> = {
    serial: { postgresql: 'SERIAL', mysql: 'INT AUTO_INCREMENT' },
    varchar: { postgresql: 'VARCHAR(255)', mysql: 'VARCHAR(255)' },
    text: { postgresql: 'TEXT', mysql: 'TEXT' },
    int: { postgresql: 'INTEGER', mysql: 'INT' },
    bigint: { postgresql: 'BIGINT', mysql: 'BIGINT' },
    float: { postgresql: 'DOUBLE PRECISION', mysql: 'DOUBLE' },
    boolean: { postgresql: 'BOOLEAN', mysql: 'TINYINT(1)' },
    timestamp: { postgresql: 'TIMESTAMP', mysql: 'DATETIME' },
    date: { postgresql: 'DATE', mysql: 'DATE' },
    uuid: { postgresql: 'UUID', mysql: 'CHAR(36)' },
    jsonb: { postgresql: 'JSONB', mysql: 'JSON' },
    enum: { postgresql: 'VARCHAR(50)', mysql: 'VARCHAR(50)' },
  }
  return map[dataType]?.[dialect] ?? dataType.toUpperCase()
}

export function generateDDL(
  tables: SchemaTable[],
  relationships: SchemaRelationship[],
  dialect: SchemaDialect
): string {
  const lines: string[] = []

  for (const table of tables) {
    const colDefs: string[] = []

    for (const col of table.columns) {
      let def = `  ${escapeId(col.name, dialect)} ${mapType(col.dataType, dialect)}`
      if (col.isPrimaryKey && col.dataType !== 'serial') {
        def += ' PRIMARY KEY'
      }
      if (col.dataType === 'serial') {
        def += ' PRIMARY KEY'
      }
      if (col.isNotNull && !col.isPrimaryKey) {
        def += ' NOT NULL'
      }
      if (col.isUnique) {
        def += ' UNIQUE'
      }
      if (col.defaultValue) {
        const isNumeric = !isNaN(Number(col.defaultValue))
        const isBool = ['true', 'false'].includes(col.defaultValue.toLowerCase())
        const isFunc = col.defaultValue.includes('(')
        if (isNumeric || isBool || isFunc) {
          def += ` DEFAULT ${col.defaultValue}`
        } else {
          def += ` DEFAULT '${col.defaultValue}'`
        }
      }
      colDefs.push(def)
    }

    const pkCols = table.columns.filter((c) => c.isPrimaryKey && c.dataType !== 'serial')
    if (pkCols.length > 1) {
      colDefs.push(`  PRIMARY KEY (${pkCols.map((c) => escapeId(c.name, dialect)).join(', ')})`)
    }

    lines.push(`CREATE TABLE ${escapeId(table.name, dialect)} (`)
    lines.push(colDefs.join(',\n'))
    lines.push(');')
    lines.push('')
  }

  for (const rel of relationships) {
    const srcTable = tables.find((t) => t.id === rel.sourceTableId)
    const tgtTable = tables.find((t) => t.id === rel.targetTableId)
    if (!srcTable || !tgtTable) continue
    const srcCol = srcTable.columns.find((c) => c.id === rel.sourceColumnId)
    const tgtCol = tgtTable.columns.find((c) => c.id === rel.targetColumnId)
    if (!srcCol || !tgtCol) continue

    lines.push(
      `ALTER TABLE ${escapeId(srcTable.name, dialect)} ADD CONSTRAINT ${escapeId(`fk_${srcTable.name}_${srcCol.name}`, dialect)}` +
      ` FOREIGN KEY (${escapeId(srcCol.name, dialect)}) REFERENCES ${escapeId(tgtTable.name, dialect)} (${escapeId(tgtCol.name, dialect)});`
    )
  }

  for (const table of tables) {
    for (const idx of table.indexes) {
      const colNames = idx.columns
        .map((cid) => table.columns.find((c) => c.id === cid)?.name)
        .filter(Boolean)
      if (colNames.length === 0) continue

      const uniqueStr = idx.isUnique ? 'UNIQUE ' : ''
      const usingStr = dialect === 'postgresql' && idx.type !== 'btree' ? ` USING ${idx.type}` : ''
      lines.push(
        `CREATE ${uniqueStr}INDEX ${escapeId(idx.name, dialect)} ON ${escapeId(table.name, dialect)}${usingStr} (${colNames.map((n) => escapeId(n!, dialect)).join(', ')});`
      )
    }
  }

  return lines.join('\n')
}
