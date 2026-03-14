import { memo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'
import type { SystemEdge } from '@/types'
import { useFlowStore } from '@/store/use-flow-store'
import { useSimulationStore } from '@/store/use-simulation-store'

/** Custom edge with an editable label for protocol/description */
function LabeledEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps<SystemEdge>) {
  const updateEdgeLabel = useFlowStore((s) => s.updateEdgeLabel)
  const visitedEdgeIds = useSimulationStore((s) => s.visitedEdgeIds)
  const status = useSimulationStore((s) => s.status)

  const isVisited = visitedEdgeIds.has(id)
  const isSimulating = status !== 'idle'

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: selected ? 'var(--color-accent)' : (isSimulating && isVisited ? 'var(--color-accent)' : 'var(--color-text-muted)'),
          strokeWidth: selected ? 2.5 : (isSimulating && isVisited ? 2.5 : 1.5),
          opacity: isSimulating && !isVisited ? 0.2 : 1,
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease, opacity 0.3s ease',
        }}
        interactionWidth={20}
      />
      
      {/* Animated particle for active simulation edge */}
      {isSimulating && isVisited && status === 'playing' && (
        Array.from({ length: Math.min(data?.traffic ?? 1, 50) }).map((_, index) => {
          const trafficCount = Math.min(data?.traffic ?? 1, 50);
          const duration = 2; // seconds
          const delay = (duration / trafficCount) * index;
          return (
            <circle key={index} r="3.5" fill="var(--color-accent)" style={{ filter: 'drop-shadow(0 0 3px var(--color-accent))' }}>
              <animateMotion 
                dur={`${duration}s`} 
                repeatCount="indefinite" 
                path={edgePath} 
                begin={`${delay}s`} 
              />
            </circle>
          )
        })
      )}

      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-auto nodrag nopan"
          style={{
            transform: `translate(-50%, calc(-50% - 12px)) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <input
            className="text-xs bg-transparent text-center outline-none rounded px-1.5 py-0.5 min-w-[40px] max-w-[120px]"
            style={{
              color: 'var(--color-text-secondary)',
              backgroundColor: selected ? 'var(--color-panel-bg)' : 'transparent',
              border: selected ? '1px solid var(--color-border)' : '1px solid transparent',
              opacity: !selected && !data?.label ? 0 : 1,
              pointerEvents: !selected && !data?.label ? 'none' : 'auto',
            }}
            value={data?.label ?? ''}
            onChange={(e) => updateEdgeLabel(id, e.target.value)}
            placeholder={selected ? 'label' : ''}
          />
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export const LabeledEdgeMemo = memo(LabeledEdgeComponent)
