import { memo, useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { SystemNode } from '@/types'
import { componentDefinitionMap } from '@/data/component-definitions'
import { brandIconMap } from '@/data/brand-icons'
import { useFlowStore } from '@/store/use-flow-store'
import { useSimulationStore } from '@/store/use-simulation-store'

/** Custom node rendering a system design component as a simple rounded rectangle */
function SystemNodeComponent({ id, data, selected }: NodeProps<SystemNode>) {
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode)
  const toggleExpanded = useFlowStore((s) => s.toggleNodeExpanded)
  const visitedNodeIds = useSimulationStore((s) => s.visitedNodeIds)
  const activeNodeId = useSimulationStore((s) => s.activeNodeId)
  const simStatus = useSimulationStore((s) => s.status)
  const [hovered, setHovered] = useState(false)

  const def = componentDefinitionMap.get(data.componentType)
  if (!def) return null

  const isSelected = selected ?? false
  const isActive = activeNodeId === id
  const isVisited = visitedNodeIds.has(id)
  const isSimulating = simStatus !== 'idle'
  const isDimmed = isSimulating && !isVisited && !isActive
  const isExpanded = data.expanded ?? false

  const BrandIcon = brandIconMap[data.componentType]
  const FallbackIcon = def.icon

  const expandableProps = def.properties.filter((p) => ['number', 'select'].includes(p.type))

  const borderColor = isActive
    ? '#22c55e'
    : isSelected
      ? '#3b82f6'
      : isVisited
        ? `${def.color}99`
        : 'var(--color-border)'

  return (
    <div
      className="relative cursor-pointer"
      style={{ opacity: isDimmed ? 0.3 : 1, transition: 'opacity 0.3s ease' }}
      onClick={() => setSelectedNode(id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* One handle per side, centered — each acts as both source and target */}
      <Handle type="source" position={Position.Top} id="top" style={{ left: '50%' }} />
      <Handle type="source" position={Position.Right} id="right" style={{ top: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ left: '50%' }} />
      <Handle type="source" position={Position.Left} id="left" style={{ top: '50%' }} />

      {/* Simple rounded rectangle node */}
      <div
        className="flex flex-col items-center justify-center rounded-lg px-4 py-3 min-w-[120px]"
        style={{
          backgroundColor: 'var(--color-panel-bg)',
          border: `2px solid ${borderColor}`,
          boxShadow: isActive
            ? '0 0 12px rgba(34,197,94,0.4)'
            : isSelected
              ? '0 0 8px rgba(59,130,246,0.3)'
              : '0 2px 8px rgba(0,0,0,0.2)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        {/* Icon */}
        <div className="mb-1.5">
          {BrandIcon ? (
            <BrandIcon size={22} />
          ) : (
            <FallbackIcon size={20} style={{ color: def.color }} />
          )}
        </div>
        {/* Label */}
        <div
          className="text-[11px] font-semibold text-center leading-tight max-w-[100px] truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {data.label}
        </div>
      </div>

      {/* Simulation active pulse */}
      {isActive && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] text-green-400 font-medium">active</span>
        </div>
      )}

      {/* Hover tooltip with details */}
      {(hovered || isExpanded) && expandableProps.length > 0 && (
        <div
          className="absolute left-1/2 -translate-x-1/2 mt-1 px-3 py-2 rounded-lg z-50 min-w-[140px]"
          style={{
            top: '100%',
            backgroundColor: 'var(--color-panel-bg)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
          onClick={(e) => { e.stopPropagation(); toggleExpanded(id) }}
        >
          <div className="text-[10px] font-semibold mb-1" style={{ color: def.color }}>
            {def.category}
          </div>
          {expandableProps.slice(0, 4).map((prop) => {
            const val = data.config[prop.key] ?? prop.defaultValue
            return (
              <div key={prop.key} className="flex items-center justify-between text-[10px] py-0.5">
                <span style={{ color: 'var(--color-text-muted)' }}>{prop.label}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{String(val)}</span>
              </div>
            )
          })}
        </div>
      )}


    </div>
  )
}

export const SystemNodeMemo = memo(SystemNodeComponent)
