import { useCallback } from 'react'
import { Plus, FileCode, Upload, Trash2, Database } from 'lucide-react'
import { useSchemaStore } from '@/store/use-schema-store'
import type { SchemaDialect } from '@/types/schema'

interface SchemaToolbarProps {
  onOpenDDL: () => void
  onOpenImport: () => void
}

export function SchemaToolbar({ onOpenDDL, onOpenImport }: SchemaToolbarProps) {
  const addTable = useSchemaStore((s) => s.addTable)
  const dialect = useSchemaStore((s) => s.dialect)
  const setDialect = useSchemaStore((s) => s.setDialect)
  const clear = useSchemaStore((s) => s.clear)
  const tables = useSchemaStore((s) => s.tables)

  const handleAddTable = useCallback(() => {
    const offset = tables.length * 30
    addTable({ x: 100 + offset, y: 100 + offset })
  }, [addTable, tables.length])

  const btnClass =
    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10'

  return (
    <div
      className="flex items-center justify-between px-4 py-2 border-b shrink-0"
      style={{ backgroundColor: 'var(--color-sidebar-bg)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-2">
        <Database size={14} style={{ color: 'var(--color-accent)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Schema Designer
        </span>
        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          {tables.length} table{tables.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
        <button onClick={handleAddTable} className={btnClass} title="Add table">
          <Plus size={14} /> Add Table
        </button>

        <button onClick={onOpenDDL} className={btnClass} title="Generate DDL">
          <FileCode size={14} /> Generate DDL
        </button>

        <button onClick={onOpenImport} className={btnClass} title="Import SQL">
          <Upload size={14} /> Import SQL
        </button>

        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--color-border)' }} />

        <select
          className="text-xs rounded-lg px-2 py-1.5 outline-none cursor-pointer"
          style={{
            backgroundColor: 'var(--color-panel-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
          value={dialect}
          onChange={(e) => setDialect(e.target.value as SchemaDialect)}
        >
          <option value="postgresql">PostgreSQL</option>
          <option value="mysql">MySQL</option>
        </select>

        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--color-border)' }} />

        <button onClick={clear} className={btnClass} title="Clear schema">
          <Trash2 size={14} /> Clear
        </button>
      </div>
    </div>
  )
}
