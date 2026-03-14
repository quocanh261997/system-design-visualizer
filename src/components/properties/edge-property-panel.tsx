import { useFlowStore } from '@/store/use-flow-store'
import { X, Trash2 } from 'lucide-react'
import { CONNECTION_TYPE_STYLES, PROTOCOL_OPTIONS } from '@/types'
import type { ConnectionType } from '@/types'

/** Right-side panel for editing edge/connection properties */
export function EdgePropertyPanel() {
  const selectedEdgeId = useFlowStore((s) => s.selectedEdgeId)
  const edges = useFlowStore((s) => s.edges)
  const updateEdgeData = useFlowStore((s) => s.updateEdgeData)
  const setSelectedEdge = useFlowStore((s) => s.setSelectedEdge)
  const deleteSelected = useFlowStore((s) => s.deleteSelected)

  const edge = edges.find((e) => e.id === selectedEdgeId)
  if (!edge || !selectedEdgeId) return null

  const connectionType = (edge.data?.connectionType ?? 'sync') as ConnectionType
  const style = CONNECTION_TYPE_STYLES[connectionType]

  const inputStyle = {
    backgroundColor: 'var(--color-panel-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  }

  return (
    <aside
      className="w-72 h-full border-l flex flex-col overflow-hidden shrink-0"
      style={{ backgroundColor: 'var(--color-sidebar-bg)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 rounded" style={{ backgroundColor: style.color }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Connection
          </span>
        </div>
        <button onClick={() => setSelectedEdge(null)} className="p-1 rounded hover:bg-white/10 transition-colors">
          <X size={14} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Connection type selector */}
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>
            Connection Type
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(CONNECTION_TYPE_STYLES) as ConnectionType[]).map((type) => {
              const s = CONNECTION_TYPE_STYLES[type]
              const isActive = type === connectionType
              return (
                <button
                  key={type}
                  className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? `${s.color}22` : 'var(--color-panel-bg)',
                    border: `1px solid ${isActive ? s.color : 'var(--color-border)'}`,
                    color: isActive ? s.color : 'var(--color-text-muted)',
                  }}
                  onClick={() => updateEdgeData(selectedEdgeId, { connectionType: type })}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Protocol selector */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
            Protocol
          </label>
          <select
            className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none"
            style={inputStyle}
            value={edge.data?.protocol ?? ''}
            onChange={(e) => updateEdgeData(selectedEdgeId, { protocol: e.target.value })}
          >
            <option value="">Select protocol...</option>
            {PROTOCOL_OPTIONS[connectionType].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Label */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
            Label
          </label>
          <input
            className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none"
            style={inputStyle}
            value={edge.data?.label ?? ''}
            onChange={(e) => updateEdgeData(selectedEdgeId, { label: e.target.value })}
            placeholder="e.g., GET /api/users"
          />
        </div>

        {/* Latency */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
            Estimated Latency (ms)
          </label>
          <input
            type="number"
            className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none"
            style={inputStyle}
            value={edge.data?.latencyMs ?? 10}
            onChange={(e) => updateEdgeData(selectedEdgeId, { latencyMs: Number(e.target.value) })}
            min={0}
          />
        </div>

        {/* Branch label (for decision gateway outgoing edges) */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
            Branch Label
          </label>
          <input
            className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none"
            style={inputStyle}
            value={edge.data?.branchLabel ?? ''}
            onChange={(e) => updateEdgeData(selectedEdgeId, { branchLabel: e.target.value })}
            placeholder="e.g., cache hit, cache miss"
          />
        </div>

        {/* Probability (for decision branching) */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
            Probability (%)
          </label>
          <input
            type="number"
            className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none"
            style={inputStyle}
            value={edge.data?.probability ?? 0}
            onChange={(e) => updateEdgeData(selectedEdgeId, { probability: Number(e.target.value) })}
            min={0}
            max={100}
            placeholder="0 = sequential"
          />
        </div>

        {/* Visual legend */}
        <div className="rounded-lg p-2.5 space-y-2" style={{ backgroundColor: 'var(--color-panel-bg)' }}>
          <div className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Visual Guide</div>
          {(Object.keys(CONNECTION_TYPE_STYLES) as ConnectionType[]).map((type) => {
            const s = CONNECTION_TYPE_STYLES[type]
            return (
              <div key={type} className="flex items-center gap-2 text-xs">
                <svg width="32" height="8">
                  <line
                    x1="0" y1="4" x2="32" y2="4"
                    stroke={s.color}
                    strokeWidth={2}
                    strokeDasharray={s.strokeDasharray || undefined}
                  />
                </svg>
                <span style={{ color: 'var(--color-text-secondary)' }}>{s.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer with delete */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={deleteSelected}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }}
        >
          <Trash2 size={14} />
          Delete Connection
        </button>
      </div>
    </aside>
  )
}
