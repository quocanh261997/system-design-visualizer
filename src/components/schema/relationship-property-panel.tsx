import { X, Trash2 } from 'lucide-react'
import { useSchemaStore } from '@/store/use-schema-store'
import type { RelationshipCardinality } from '@/types/schema'

export function RelationshipPropertyPanel() {
  const relationships = useSchemaStore((s) => s.relationships)
  const tables = useSchemaStore((s) => s.tables)
  const selectedRelationshipId = useSchemaStore((s) => s.selectedRelationshipId)
  const updateRelationship = useSchemaStore((s) => s.updateRelationship)
  const removeRelationship = useSchemaStore((s) => s.removeRelationship)
  const setSelectedRelationship = useSchemaStore((s) => s.setSelectedRelationship)

  const rel = relationships.find((r) => r.id === selectedRelationshipId)
  if (!rel) return null

  const srcTable = tables.find((t) => t.id === rel.sourceTableId)
  const tgtTable = tables.find((t) => t.id === rel.targetTableId)

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
          Relationship
        </span>
        <button
          onClick={() => setSelectedRelationship(null)}
          className="p-0.5 rounded hover:bg-white/10"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        <div>
          <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
            Label
          </label>
          <input
            className="w-full px-2 py-1 rounded text-xs outline-none"
            style={inputStyle}
            value={rel.label}
            onChange={(e) => updateRelationship(rel.id, { label: e.target.value })}
          />
        </div>

        <div>
          <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
            Cardinality
          </label>
          <select
            className="w-full px-2 py-1 rounded text-xs outline-none cursor-pointer"
            style={inputStyle}
            value={rel.cardinality}
            onChange={(e) => updateRelationship(rel.id, { cardinality: e.target.value as RelationshipCardinality })}
          >
            <option value="1:1">1:1 (One to One)</option>
            <option value="1:N">1:N (One to Many)</option>
            <option value="M:N">M:N (Many to Many)</option>
          </select>
        </div>

        <div className="text-[10px] space-y-1" style={{ color: 'var(--color-text-muted)' }}>
          <div>Source: <span style={{ color: 'var(--color-text-secondary)' }}>{srcTable?.name ?? '?'}</span></div>
          <div>Target: <span style={{ color: 'var(--color-text-secondary)' }}>{tgtTable?.name ?? '?'}</span></div>
        </div>

        <button
          onClick={() => removeRelationship(rel.id)}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-red-500/10"
          style={{ color: '#ef4444' }}
        >
          <Trash2 size={12} /> Delete Relationship
        </button>
      </div>
    </div>
  )
}
