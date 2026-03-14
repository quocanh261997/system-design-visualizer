import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { SystemNode } from '@/types'
import { useFlowStore } from '@/store/use-flow-store'
import { useSimulationStore } from '@/store/use-simulation-store'

/** Diamond-shaped decision gateway node for conditional branching */
function DecisionNodeComponent({ id, data, selected }: NodeProps<SystemNode>) {
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode)
  const activeNodeId = useSimulationStore((s) => s.activeNodeId)
  const visitedNodeIds = useSimulationStore((s) => s.visitedNodeIds)
  const simStatus = useSimulationStore((s) => s.status)

  const isSelected = selected ?? false
  const isActive = activeNodeId === id
  const isVisited = visitedNodeIds.has(id)
  const isSimulating = simStatus !== 'idle'
  const isDimmed = isSimulating && !isVisited && !isActive

  const color = '#f59e0b'
  let strokeColor = isSelected ? color : 'var(--color-node-border)'
  let filter = 'none'

  if (isActive) {
    strokeColor = '#22c55e'
    filter = 'drop-shadow(0 0 12px rgba(34,197,94,0.4))'
  } else if (isSelected) {
    filter = `drop-shadow(0 0 12px ${color}33)`
  }

  return (
    <div
      className="relative cursor-pointer"
      style={{ opacity: isDimmed ? 0.3 : 1, transition: 'opacity 0.3s' }}
      onClick={() => setSelectedNode(id)}
    >
      {/* One handle per side, centered */}
      <Handle type="source" position={Position.Top} id="top" style={{ left: '50%' }} />
      <Handle type="source" position={Position.Right} id="right" style={{ top: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ left: '50%' }} />
      <Handle type="source" position={Position.Left} id="left" style={{ top: '50%' }} />

      <svg width="110" height="110" viewBox="0 0 110 110" style={{ filter }}>
        <polygon
          points="55,5 105,55 55,105 5,55"
          fill="#1e2030"
          stroke={strokeColor}
          strokeWidth={isSelected || isActive ? 2.5 : 2}
        />
      </svg>

      {/* Label overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-bold" style={{ color }}>?</span>
        <span
          className="text-[10px] font-semibold text-center leading-tight max-w-[70px]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {data.label}
        </span>
      </div>

      {isActive && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] text-green-400">active</span>
        </div>
      )}
    </div>
  )
}

export const DecisionNodeMemo = memo(DecisionNodeComponent)
