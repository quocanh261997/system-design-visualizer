import { useCallback } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react'
import { useSchemaStore } from '@/store/use-schema-store'
import { DATA_TYPES, INDEX_TYPES } from '@/types/schema'
import type { SchemaColumn, SchemaIndex } from '@/types/schema'

export function TablePropertyPanel() {
  const tables = useSchemaStore((s) => s.tables)
  const selectedTableId = useSchemaStore((s) => s.selectedTableId)
  const updateTableName = useSchemaStore((s) => s.updateTableName)
  const addColumn = useSchemaStore((s) => s.addColumn)
  const removeColumn = useSchemaStore((s) => s.removeColumn)
  const updateColumn = useSchemaStore((s) => s.updateColumn)
  const moveColumn = useSchemaStore((s) => s.moveColumn)
  const removeTable = useSchemaStore((s) => s.removeTable)
  const setSelectedTable = useSchemaStore((s) => s.setSelectedTable)
  const addIndex = useSchemaStore((s) => s.addIndex)
  const removeIndex = useSchemaStore((s) => s.removeIndex)
  const updateIndex = useSchemaStore((s) => s.updateIndex)

  const table = tables.find((t) => t.id === selectedTableId)
  if (!table) return null

  const inputClass =
    'w-full px-2 py-1 rounded text-xs outline-none'
  const inputStyle = {
    backgroundColor: 'var(--color-panel-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  }

  return (
    <div
      className="w-[300px] shrink-0 border-l overflow-y-auto"
      style={{
        backgroundColor: 'var(--color-sidebar-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Table Properties
        </span>
        <button
          onClick={() => setSelectedTable(null)}
          className="p-0.5 rounded hover:bg-white/10"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        <div>
          <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
            Table Name
          </label>
          <input
            className={inputClass}
            style={inputStyle}
            value={table.name}
            onChange={(e) => updateTableName(table.id, e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Columns
            </span>
            <button
              onClick={() => addColumn(table.id)}
              className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded hover:bg-white/10"
              style={{ color: 'var(--color-accent)' }}
            >
              <Plus size={10} /> Add
            </button>
          </div>
          <div className="space-y-1.5">
            {table.columns.map((col, idx) => (
              <ColumnRow
                key={col.id}
                col={col}
                tableId={table.id}
                tables={tables}
                isFirst={idx === 0}
                isLast={idx === table.columns.length - 1}
                onUpdate={updateColumn}
                onRemove={removeColumn}
                onMove={moveColumn}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Indexes
            </span>
            <button
              onClick={() => addIndex(table.id)}
              className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded hover:bg-white/10"
              style={{ color: 'var(--color-accent)' }}
            >
              <Plus size={10} /> Add
            </button>
          </div>
          {table.indexes.map((idx) => (
            <IndexRow
              key={idx.id}
              idx={idx}
              tableId={table.id}
              columns={table.columns}
              onUpdate={updateIndex}
              onRemove={removeIndex}
            />
          ))}
        </div>

        <button
          onClick={() => removeTable(table.id)}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-red-500/10"
          style={{ color: '#ef4444' }}
        >
          <Trash2 size={12} /> Delete Table
        </button>
      </div>
    </div>
  )
}

interface ColumnRowProps {
  col: SchemaColumn
  tableId: string
  tables: { id: string; name: string; columns: SchemaColumn[] }[]
  isFirst: boolean
  isLast: boolean
  onUpdate: (tableId: string, colId: string, data: Partial<SchemaColumn>) => void
  onRemove: (tableId: string, colId: string) => void
  onMove: (tableId: string, colId: string, dir: 'up' | 'down') => void
}

function ColumnRow({ col, tableId, tables, isFirst, isLast, onUpdate, onRemove, onMove }: ColumnRowProps) {
  const inputStyle = {
    backgroundColor: 'var(--color-panel-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  }

  return (
    <div
      className="rounded-lg p-2 space-y-1.5"
      style={{ backgroundColor: 'var(--color-panel-bg)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center gap-1">
        <input
          className="flex-1 px-1.5 py-0.5 rounded text-[11px] outline-none"
          style={inputStyle}
          value={col.name}
          onChange={(e) => onUpdate(tableId, col.id, { name: e.target.value })}
          placeholder="column name"
        />
        <select
          className="px-1 py-0.5 rounded text-[11px] outline-none cursor-pointer"
          style={inputStyle}
          value={col.dataType}
          onChange={(e) => onUpdate(tableId, col.id, { dataType: e.target.value })}
        >
          {DATA_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {(['isPrimaryKey', 'isForeignKey', 'isNotNull', 'isUnique'] as const).map((key) => (
          <label key={key} className="flex items-center gap-0.5 text-[10px] cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
            <input
              type="checkbox"
              checked={col[key]}
              onChange={(e) => onUpdate(tableId, col.id, { [key]: e.target.checked })}
              className="w-3 h-3"
            />
            {key === 'isPrimaryKey' ? 'PK' : key === 'isForeignKey' ? 'FK' : key === 'isNotNull' ? 'NN' : 'UQ'}
          </label>
        ))}
      </div>

      {col.isForeignKey && (
        <div className="flex items-center gap-1">
          <select
            className="flex-1 px-1 py-0.5 rounded text-[10px] outline-none cursor-pointer"
            style={inputStyle}
            value={col.fkTarget?.tableId ?? ''}
            onChange={(e) => {
              const tgt = tables.find((t) => t.id === e.target.value)
              const pkCol = tgt?.columns.find((c) => c.isPrimaryKey)
              onUpdate(tableId, col.id, {
                fkTarget: e.target.value
                  ? { tableId: e.target.value, columnId: pkCol?.id ?? tgt?.columns[0]?.id ?? '' }
                  : undefined,
              })
            }}
          >
            <option value="">-- ref table --</option>
            {tables.filter((t) => t.id !== tableId).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {col.fkTarget?.tableId && (
            <select
              className="flex-1 px-1 py-0.5 rounded text-[10px] outline-none cursor-pointer"
              style={inputStyle}
              value={col.fkTarget?.columnId ?? ''}
              onChange={(e) =>
                onUpdate(tableId, col.id, {
                  fkTarget: { tableId: col.fkTarget!.tableId, columnId: e.target.value },
                })
              }
            >
              {tables
                .find((t) => t.id === col.fkTarget?.tableId)
                ?.columns.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          )}
        </div>
      )}

      <div className="flex items-center gap-1">
        <input
          className="flex-1 px-1.5 py-0.5 rounded text-[10px] outline-none"
          style={inputStyle}
          value={col.defaultValue}
          onChange={(e) => onUpdate(tableId, col.id, { defaultValue: e.target.value })}
          placeholder="default value"
        />
        <button
          onClick={() => onMove(tableId, col.id, 'up')}
          disabled={isFirst}
          className="p-0.5 rounded hover:bg-white/10 disabled:opacity-20"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ChevronUp size={12} />
        </button>
        <button
          onClick={() => onMove(tableId, col.id, 'down')}
          disabled={isLast}
          className="p-0.5 rounded hover:bg-white/10 disabled:opacity-20"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ChevronDown size={12} />
        </button>
        <button
          onClick={() => onRemove(tableId, col.id)}
          className="p-0.5 rounded hover:bg-red-500/20"
          style={{ color: '#ef4444' }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

interface IndexRowProps {
  idx: SchemaIndex
  tableId: string
  columns: SchemaColumn[]
  onUpdate: (tableId: string, indexId: string, data: Partial<SchemaIndex>) => void
  onRemove: (tableId: string, indexId: string) => void
}

function IndexRow({ idx, tableId, columns, onUpdate, onRemove }: IndexRowProps) {
  const inputStyle = {
    backgroundColor: 'var(--color-panel-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  }

  const toggleColumn = useCallback(
    (colId: string) => {
      const current = idx.columns
      const updated = current.includes(colId)
        ? current.filter((c) => c !== colId)
        : [...current, colId]
      onUpdate(tableId, idx.id, { columns: updated })
    },
    [idx, tableId, onUpdate]
  )

  return (
    <div
      className="rounded-lg p-2 space-y-1 mb-1.5"
      style={{ backgroundColor: 'var(--color-panel-bg)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center gap-1">
        <input
          className="flex-1 px-1.5 py-0.5 rounded text-[10px] outline-none"
          style={inputStyle}
          value={idx.name}
          onChange={(e) => onUpdate(tableId, idx.id, { name: e.target.value })}
        />
        <select
          className="px-1 py-0.5 rounded text-[10px] outline-none cursor-pointer"
          style={inputStyle}
          value={idx.type}
          onChange={(e) => onUpdate(tableId, idx.id, { type: e.target.value as 'btree' | 'hash' | 'gin' })}
        >
          {INDEX_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <label className="flex items-center gap-0.5 text-[10px] cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
          <input
            type="checkbox"
            checked={idx.isUnique}
            onChange={(e) => onUpdate(tableId, idx.id, { isUnique: e.target.checked })}
            className="w-3 h-3"
          />
          UQ
        </label>
        <button
          onClick={() => onRemove(tableId, idx.id)}
          className="p-0.5 rounded hover:bg-red-500/20"
          style={{ color: '#ef4444' }}
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {columns.map((col) => (
          <button
            key={col.id}
            onClick={() => toggleColumn(col.id)}
            className="px-1.5 py-0.5 rounded text-[10px] transition-colors"
            style={{
              backgroundColor: idx.columns.includes(col.id) ? 'rgba(99,102,241,0.2)' : 'transparent',
              border: `1px solid ${idx.columns.includes(col.id) ? 'var(--color-accent)' : 'var(--color-border)'}`,
              color: idx.columns.includes(col.id) ? 'var(--color-accent)' : 'var(--color-text-muted)',
            }}
          >
            {col.name}
          </button>
        ))}
      </div>
    </div>
  )
}
