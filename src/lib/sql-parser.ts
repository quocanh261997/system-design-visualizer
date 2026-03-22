import type { SchemaTable, SchemaColumn, SchemaRelationship, SchemaIndex } from '@/types/schema'
import { v4 as uuid } from 'uuid'

export interface ParseResult {
  tables: SchemaTable[]
  relationships: SchemaRelationship[]
  errors: string[]
}

function stripComments(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
}

function normalizeType(raw: string): string {
  const t = raw.toLowerCase().trim()
  if (t.startsWith('character varying') || t.startsWith('varchar')) return 'varchar'
  if (t === 'integer' || t === 'int4') return 'int'
  if (t === 'bigint' || t === 'int8') return 'bigint'
  if (t === 'smallint' || t === 'int2') return 'int'
  if (t.startsWith('numeric') || t.startsWith('decimal') || t === 'real' || t === 'double precision' || t === 'float8') return 'float'
  if (t === 'bool' || t === 'boolean') return 'boolean'
  if (t.startsWith('timestamp')) return 'timestamp'
  if (t === 'date') return 'date'
  if (t === 'uuid') return 'uuid'
  if (t === 'jsonb' || t === 'json') return 'jsonb'
  if (t === 'text') return 'text'
  if (t === 'serial' || t === 'bigserial') return 'serial'
  if (t.startsWith('auto_increment') || t === 'int auto_increment') return 'serial'
  if (t.startsWith('enum')) return 'enum'
  if (t === 'datetime') return 'timestamp'
  return t.split('(')[0].trim()
}

function extractParenContent(statement: string): string {
  let depth = 0
  let start = -1
  for (let i = 0; i < statement.length; i++) {
    if (statement[i] === '(') {
      if (depth === 0) start = i + 1
      depth++
    } else if (statement[i] === ')') {
      depth--
      if (depth === 0 && start !== -1) {
        return statement.substring(start, i)
      }
    }
  }
  return ''
}

function splitColumns(content: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const ch of content) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function parseColumnDef(line: string): SchemaColumn | null {
  const tokens = line.trim().split(/\s+/)
  if (tokens.length < 2) return null

  const name = tokens[0].replace(/[`"]/g, '')
  if (['constraint', 'primary', 'foreign', 'unique', 'index', 'key', 'check'].includes(name.toLowerCase())) {
    return null
  }

  const rest = line.substring(line.indexOf(tokens[1]!))
  const upper = rest.toUpperCase()

  let typeStr = tokens[1]!.replace(/[`"]/g, '')
  if (typeStr.includes('(') && !typeStr.includes(')')) {
    const nextToken = tokens[2]
    if (nextToken && nextToken.includes(')')) {
      typeStr += ' ' + nextToken
    }
  }

  const col: SchemaColumn = {
    id: uuid(),
    name,
    dataType: normalizeType(typeStr),
    isPrimaryKey: /PRIMARY\s+KEY/i.test(upper),
    isForeignKey: false,
    isNotNull: /NOT\s+NULL/i.test(upper) || /PRIMARY\s+KEY/i.test(upper),
    isUnique: /UNIQUE/i.test(upper),
    isIndexed: false,
    defaultValue: '',
  }

  if (upper.includes('AUTO_INCREMENT')) {
    col.dataType = 'serial'
  }

  const defaultMatch = rest.match(/DEFAULT\s+('(?:[^']*)'|[^\s,]+)/i)
  if (defaultMatch) {
    col.defaultValue = defaultMatch[1]!.replace(/^'|'$/g, '')
  }

  return col
}

function parseCreateTable(
  statement: string,
  errors: string[],
  lineOffset: number
): { table: SchemaTable; fks: { col: string; refTable: string; refCol: string }[] } | null {
  const tableMatch = statement.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?/i)
  if (!tableMatch) {
    errors.push(`Line ~${lineOffset}: could not parse CREATE TABLE name`)
    return null
  }

  const tableName = tableMatch[1]!
  const body = extractParenContent(statement)
  if (!body) {
    errors.push(`Line ~${lineOffset}: missing parenthesized column definitions for "${tableName}"`)
    return null
  }

  const parts = splitColumns(body)
  const columns: SchemaColumn[] = []
  const fks: { col: string; refTable: string; refCol: string }[] = []
  const pkColumns: string[] = []
  const uniqueColumns: string[] = []

  for (const part of parts) {
    const upper = part.toUpperCase().trim()

    if (upper.startsWith('PRIMARY KEY')) {
      const inner = extractParenContent(part)
      if (inner) {
        inner.split(',').forEach((c) => pkColumns.push(c.trim().replace(/[`"]/g, '')))
      }
      continue
    }

    if (upper.startsWith('UNIQUE')) {
      const inner = extractParenContent(part)
      if (inner) {
        inner.split(',').forEach((c) => uniqueColumns.push(c.trim().replace(/[`"]/g, '')))
      }
      continue
    }

    const fkMatch = part.match(
      /FOREIGN\s+KEY\s*\(\s*[`"]?(\w+)[`"]?\s*\)\s*REFERENCES\s+[`"]?(\w+)[`"]?\s*\(\s*[`"]?(\w+)[`"]?\s*\)/i
    )
    if (fkMatch) {
      fks.push({ col: fkMatch[1]!, refTable: fkMatch[2]!, refCol: fkMatch[3]! })
      continue
    }

    if (upper.startsWith('CONSTRAINT') || upper.startsWith('CHECK') || upper.startsWith('INDEX') || upper.startsWith('KEY')) {
      continue
    }

    const col = parseColumnDef(part)
    if (col) {
      const inlineRef = part.match(/REFERENCES\s+[`"]?(\w+)[`"]?\s*\(\s*[`"]?(\w+)[`"]?\s*\)/i)
      if (inlineRef) {
        fks.push({ col: col.name, refTable: inlineRef[1]!, refCol: inlineRef[2]! })
        col.isForeignKey = true
      }
      columns.push(col)
    }
  }

  for (const pk of pkColumns) {
    const col = columns.find((c) => c.name.toLowerCase() === pk.toLowerCase())
    if (col) {
      col.isPrimaryKey = true
      col.isNotNull = true
    }
  }

  for (const uq of uniqueColumns) {
    const col = columns.find((c) => c.name.toLowerCase() === uq.toLowerCase())
    if (col) col.isUnique = true
  }

  for (const fk of fks) {
    const col = columns.find((c) => c.name.toLowerCase() === fk.col.toLowerCase())
    if (col) col.isForeignKey = true
  }

  return {
    table: { id: uuid(), name: tableName, columns, indexes: [] },
    fks,
  }
}

function parseCreateIndex(
  statement: string,
  tables: SchemaTable[],
  errors: string[],
  lineOffset: number
): SchemaIndex | null {
  const match = statement.match(
    /CREATE\s+(UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?\s+ON\s+[`"]?(\w+)[`"]?\s*(?:USING\s+(\w+)\s*)?\(\s*([^)]+)\s*\)/i
  )
  if (!match) {
    errors.push(`Line ~${lineOffset}: could not parse CREATE INDEX`)
    return null
  }

  const isUnique = !!match[1]
  const indexName = match[2]!
  const tableName = match[3]!
  const indexType = (match[4] || 'btree').toLowerCase() as 'btree' | 'hash' | 'gin'
  const colNames = match[5]!.split(',').map((c) => c.trim().replace(/[`"]/g, '').split(/\s+/)[0]!)

  const table = tables.find((t) => t.name.toLowerCase() === tableName.toLowerCase())
  if (!table) {
    errors.push(`Line ~${lineOffset}: index "${indexName}" references unknown table "${tableName}"`)
    return null
  }

  const colIds = colNames
    .map((cn) => table.columns.find((c) => c.name.toLowerCase() === cn.toLowerCase())?.id)
    .filter(Boolean) as string[]

  const idx: SchemaIndex = { id: uuid(), name: indexName, columns: colIds, type: indexType, isUnique }
  table.indexes.push(idx)

  for (const cid of colIds) {
    const col = table.columns.find((c) => c.id === cid)
    if (col) col.isIndexed = true
  }

  return idx
}

export function parseSql(sql: string): ParseResult {
  const errors: string[] = []
  const cleaned = stripComments(sql)
  const statements = cleaned.split(';').map((s) => s.trim()).filter(Boolean)

  const tables: SchemaTable[] = []
  const fkDefs: { tableName: string; col: string; refTable: string; refCol: string }[] = []

  let lineOffset = 1
  for (const stmt of statements) {
    const upper = stmt.toUpperCase().trim()

    if (upper.startsWith('CREATE TABLE')) {
      const result = parseCreateTable(stmt, errors, lineOffset)
      if (result) {
        tables.push(result.table)
        for (const fk of result.fks) {
          fkDefs.push({ tableName: result.table.name, ...fk })
        }
      }
    }

    const alterFkMatch = stmt.match(
      /ALTER\s+TABLE\s+[`"]?(\w+)[`"]?\s+ADD\s+(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(\s*[`"]?(\w+)[`"]?\s*\)\s*REFERENCES\s+[`"]?(\w+)[`"]?\s*\(\s*[`"]?(\w+)[`"]?\s*\)/i
    )
    if (alterFkMatch) {
      fkDefs.push({
        tableName: alterFkMatch[1]!,
        col: alterFkMatch[2]!,
        refTable: alterFkMatch[3]!,
        refCol: alterFkMatch[4]!,
      })
    }

    lineOffset += stmt.split('\n').length
  }

  for (const stmt of statements) {
    if (stmt.toUpperCase().trim().startsWith('CREATE') && /INDEX/i.test(stmt)) {
      if (!/CREATE\s+TABLE/i.test(stmt)) {
        parseCreateIndex(stmt, tables, errors, 0)
      }
    }
  }

  const relationships: SchemaRelationship[] = []
  for (const fk of fkDefs) {
    const srcTable = tables.find((t) => t.name.toLowerCase() === fk.tableName.toLowerCase())
    const tgtTable = tables.find((t) => t.name.toLowerCase() === fk.refTable.toLowerCase())
    if (!srcTable || !tgtTable) {
      errors.push(`FK: table "${fk.tableName}" or "${fk.refTable}" not found`)
      continue
    }
    const srcCol = srcTable.columns.find((c) => c.name.toLowerCase() === fk.col.toLowerCase())
    const tgtCol = tgtTable.columns.find((c) => c.name.toLowerCase() === fk.refCol.toLowerCase())
    if (!srcCol || !tgtCol) {
      errors.push(`FK: column "${fk.col}" or "${fk.refCol}" not found`)
      continue
    }
    srcCol.isForeignKey = true
    srcCol.fkTarget = { tableId: tgtTable.id, columnId: tgtCol.id }
    relationships.push({
      id: uuid(),
      sourceTableId: srcTable.id,
      sourceColumnId: srcCol.id,
      targetTableId: tgtTable.id,
      targetColumnId: tgtCol.id,
      cardinality: '1:N',
      label: `${srcTable.name}.${srcCol.name} -> ${tgtTable.name}.${tgtCol.name}`,
    })
  }

  return { tables, relationships, errors }
}
