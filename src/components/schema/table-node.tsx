import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import type { SchemaTable } from '@/types/schema'
import { useSchemaStore } from '@/store/use-schema-store'

export interface TableNodeData {
  table: SchemaTable
  [key: string]: unknown
}

export type TableNode = Node<TableNodeData, 'table-node'>

function TableNodeComponent({ id, data, selected }: NodeProps<TableNode>) {
  const setSelectedTable = useSchemaStore((s) => s.setSelectedTable)
  const { table } = data

  return (
    <div
      className="rounded-lg overflow-hidden min-w-[220px]"
      style={{
        backgroundColor: 'var(--color-panel-bg)',
        border: `2px solid ${selected ? 'var(--color-accent)' : 'var(--color-node-border)'}`,
        boxShadow: selected ? '0 0 8px rgba(99,102,241,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
      }}
      onClick={() => setSelectedTable(id)}
    >
      <Handle type="target" position={Position.Top} id="top-target" style={{ left: '50%', opacity: 0 }} />
      <Handle type="source" position={Position.Top} id="top-source" style={{ left: '50%', opacity: 0 }} />
      <Handle type="target" position={Position.Right} id="right-target" style={{ top: '50%', opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right-source" style={{ top: '50%', opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" style={{ left: '50%', opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" style={{ left: '50%', opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="left-target" style={{ top: '50%', opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="left-source" style={{ left: '50%', opacity: 0 }} />

      <div
        className="px-3 py-2 flex items-center justify-between"
        style={{ backgroundColor: 'rgba(99,102,241,0.15)' }}
      >
        <span
          className="text-xs font-bold tracking-wide"
          style={{ color: 'var(--color-accent)' }}
        >
          {table.name}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          {table.columns.length} cols
        </span>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        {table.columns.map((col) => (
          <div
            key={col.id}
            className="flex items-center gap-2 px-3 py-1.5 text-[11px]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="w-3.5 text-center shrink-0">
              {col.isPrimaryKey ? (
                <span style={{ color: '#eab308' }} title="Primary Key">🔑</span>
              ) : col.isForeignKey ? (
                <span style={{ color: 'var(--color-accent)' }} title="Foreign Key">🔗</span>
              ) : null}
            </span>
            <span
              className="flex-1 font-medium truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {col.name}
            </span>
            <span className="shrink-0" style={{ color: 'var(--color-text-muted)' }}>
              {col.dataType}
            </span>
            <div className="flex gap-0.5 shrink-0">
              {col.isPrimaryKey && (
                <span className="px-1 rounded text-[9px] font-bold" style={{ backgroundColor: 'rgba(234,179,8,0.15)', color: '#eab308' }}>PK</span>
              )}
              {col.isForeignKey && (
                <span className="px-1 rounded text-[9px] font-bold" style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: 'var(--color-accent)' }}>FK</span>
              )}
              {col.isNotNull && !col.isPrimaryKey && (
                <span className="px-1 rounded text-[9px] font-bold" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>NN</span>
              )}
              {col.isUnique && (
                <span className="px-1 rounded text-[9px] font-bold" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>UQ</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {table.indexes.length > 0 && (
        <div
          className="px-3 py-1.5 text-[10px]"
          style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)' }}
        >
          {table.indexes.map((idx) => idx.name).join(', ')}
        </div>
      )}
    </div>
  )
}

export const TableNodeMemo = memo(TableNodeComponent)
