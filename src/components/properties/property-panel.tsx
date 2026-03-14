import { useFlowStore } from '@/store/use-flow-store'
import { componentDefinitionMap } from '@/data/component-definitions'
import { X, Trash2 } from 'lucide-react'
import type { PropertySchema } from '@/types'

/** Right-side panel showing properties of the selected node */
export function PropertyPanel() {
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId)
  const nodes = useFlowStore((s) => s.nodes)
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig)
  const updateNodeLabel = useFlowStore((s) => s.updateNodeLabel)
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode)
  const deleteSelected = useFlowStore((s) => s.deleteSelected)

  const node = nodes.find((n) => n.id === selectedNodeId)
  if (!node || !selectedNodeId) return null

  const def = componentDefinitionMap.get(node.data.componentType)
  const isGroup = node.type === 'group'

  const handleConfigChange = (key: string, value: string | number | boolean) => {
    const newConfig = { ...node.data.config, [key]: value }
    updateNodeConfig(selectedNodeId, newConfig)
  }

  return (
    <aside
      className="w-72 h-full border-l flex flex-col overflow-hidden shrink-0"
      style={{
        backgroundColor: 'var(--color-sidebar-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {def && (
            <div
              className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
              style={{ backgroundColor: `${def.color}1a` }}
            >
              <def.icon size={14} style={{ color: def.color }} />
            </div>
          )}
          <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
            Properties
          </span>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <X size={14} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Label field */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
            Label
          </label>
          <input
            className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: 'var(--color-panel-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            value={node.data.label}
            onChange={(e) => updateNodeLabel(selectedNodeId, e.target.value)}
          />
        </div>

        {/* Group boundary type selector */}
        {isGroup && (
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>
              Boundary Type
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { type: 'service', label: 'Service', color: '#6366f1' },
                { type: 'vpc', label: 'VPC', color: '#22c55e' },
                { type: 'region', label: 'Region', color: '#f59e0b' },
                { type: 'subnet', label: 'Subnet', color: '#06b6d4' },
                { type: 'zone', label: 'Zone', color: '#a855f7' },
              ].map((opt) => {
                const isActive = (node.data.config.groupType ?? 'service') === opt.type
                return (
                  <button
                    key={opt.type}
                    className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: isActive ? `${opt.color}22` : 'var(--color-panel-bg)',
                      border: `1px solid ${isActive ? opt.color : 'var(--color-border)'}`,
                      color: isActive ? opt.color : 'var(--color-text-muted)',
                    }}
                    onClick={() => handleConfigChange('groupType', opt.type)}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Description */}
        {def && !isGroup && (
          <div
            className="text-xs rounded-lg p-2.5"
            style={{
              backgroundColor: 'var(--color-panel-bg)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {def.description}
          </div>
        )}

        {/* Config properties */}
        {def && !isGroup && def.properties.length > 0 && (
          <div className="space-y-3">
            <div
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Configuration
            </div>
            {def.properties.map((prop) => (
              <PropertyField
                key={prop.key}
                schema={prop}
                value={node.data.config[prop.key] ?? prop.defaultValue}
                onChange={(v) => handleConfigChange(prop.key, v)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with delete */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={deleteSelected}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-error)',
          }}
        >
          <Trash2 size={14} />
          Delete Component
        </button>
      </div>
    </aside>
  )
}

/** Renders a single property input based on its schema type */
function PropertyField({
  schema,
  value,
  onChange,
}: {
  schema: PropertySchema
  value: string | number | boolean
  onChange: (v: string | number | boolean) => void
}) {
  const inputStyle = {
    backgroundColor: 'var(--color-panel-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  }

  return (
    <div>
      <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
        {schema.label}
      </label>
      {schema.type === 'select' ? (
        <select
          className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none"
          style={inputStyle}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
        >
          {schema.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : schema.type === 'boolean' ? (
        <button
          className="w-full px-2.5 py-1.5 rounded-lg text-sm text-left"
          style={inputStyle}
          onClick={() => onChange(!value)}
        >
          {value ? 'Enabled' : 'Disabled'}
        </button>
      ) : schema.type === 'number' ? (
        <input
          type="number"
          className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none"
          style={inputStyle}
          value={Number(value)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      ) : (
        <input
          type="text"
          className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none"
          style={inputStyle}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={schema.placeholder}
        />
      )}
    </div>
  )
}
