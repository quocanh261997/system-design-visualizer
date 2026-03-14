import { memo, useCallback, useRef, useId } from 'react'
import {
  EdgeLabelRenderer,
  type EdgeProps,
  useReactFlow,
} from '@xyflow/react'
import type { SystemEdge } from '@/types'
import { CONNECTION_TYPE_STYLES } from '@/types'
import { useFlowStore } from '@/store/use-flow-store'
import { useSimulationStore } from '@/store/use-simulation-store'

/** Build a quadratic bezier SVG path with an offset control point for bending */
function buildBendablePath(
  sx: number, sy: number,
  tx: number, ty: number,
  offset: number,
): [path: string, labelX: number, labelY: number, cpX: number, cpY: number] {
  /* Midpoint */
  const mx = (sx + tx) / 2
  const my = (sy + ty) / 2

  /* Perpendicular unit vector */
  const dx = tx - sx
  const dy = ty - sy
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = -dy / len
  const ny = dx / len

  /* Control point offset along perpendicular */
  const cpX = mx + nx * offset
  const cpY = my + ny * offset

  /* Label sits at the quadratic midpoint (t=0.5) */
  const labelX = 0.25 * sx + 0.5 * cpX + 0.25 * tx
  const labelY = 0.25 * sy + 0.5 * cpY + 0.25 * ty

  const path = `M ${sx} ${sy} Q ${cpX} ${cpY} ${tx} ${ty}`
  return [path, labelX, labelY, cpX, cpY]
}

/** Edge with visual styling, draggable bend control point, and connection type colors */
function TypedEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps<SystemEdge>) {
  const updateEdgeLabel = useFlowStore((s) => s.updateEdgeLabel)
  const updateEdgeData = useFlowStore((s) => s.updateEdgeData)
  const setSelectedEdge = useFlowStore((s) => s.setSelectedEdge)
  const selectedEdgeId = useFlowStore((s) => s.selectedEdgeId)
  const visitedEdgeIds = useSimulationStore((s) => s.visitedEdgeIds)
  const activeEdgeId = useSimulationStore((s) => s.activeEdgeId)
  const status = useSimulationStore((s) => s.status)
  const trafficDensity = useSimulationStore((s) => s.trafficDensity)
  const { screenToFlowPosition } = useReactFlow()
  const gradientId = useId()
  const dragging = useRef(false)

  const isSelected = selectedEdgeId === id
  const connectionType = data?.connectionType ?? 'sync'
  const style = CONNECTION_TYPE_STYLES[connectionType]
  const isActive = activeEdgeId === id
  const isVisited = visitedEdgeIds.has(id)
  const isSimulating = status !== 'idle'
  const curveOffset = data?.curvatureOffset ?? 0

  const [edgePath, labelX, labelY] = buildBendablePath(
    sourceX, sourceY, targetX, targetY, curveOffset,
  )

  /* Stroke styling logic */
  let strokeColor = style.color
  let strokeWidth = 1.5
  let opacity = 0.6

  if (isSelected) { strokeWidth = 2.5; opacity = 1 }
  if (isSimulating && isVisited) { opacity = 1; strokeWidth = 2.5 }
  if (isSimulating && !isVisited && !isActive) { opacity = 0.2 }
  if (isActive) { strokeColor = '#22c55e'; strokeWidth = 3; opacity = 1 }

  /** Drag the control point to bend the edge */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    dragging.current = true
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY })

    /* Project onto the perpendicular of the source-target line */
    const mx = (sourceX + targetX) / 2
    const my = (sourceY + targetY) / 2
    const dx = targetX - sourceX
    const dy = targetY - sourceY
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const nx = -dy / len
    const ny = dx / len

    /* Signed distance from midpoint along perpendicular */
    const offset = (pos.x - mx) * nx + (pos.y - my) * ny
    // The curve midpoint follows the drag pointer, so the control point needs twice the offset
    updateEdgeData(id, { curvatureOffset: Math.round(offset * 2) })
  }, [id, sourceX, sourceY, targetX, targetY, screenToFlowPosition, updateEdgeData])

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  return (
    <>
      {/* Animated gradient for streaming type */}
      {connectionType === 'streaming' && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={style.color} stopOpacity={0.2}>
              <animate attributeName="stopOpacity" values="0.2;1;0.2" dur="1.5s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor={style.color} stopOpacity={1}>
              <animate attributeName="offset" values="0;1" dur="1.5s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor={style.color} stopOpacity={0.2} />
          </linearGradient>
        </defs>
      )}

      {/* Main edge path */}
      <path
        d={edgePath}
        fill="none"
        stroke={connectionType === 'streaming' && !isActive ? `url(#${gradientId})` : strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={isActive ? '0' : style.strokeDasharray}
        opacity={opacity}
        style={{ transition: 'stroke 0.3s ease, stroke-width 0.3s ease, opacity 0.3s ease' }}
      />
      {/* Invisible wider hit area for easier clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
        onClick={(e) => { e.stopPropagation(); setSelectedEdge(id) }}
      />

      {/* Animated traffic dots */}
      {isSimulating && isVisited && status === 'playing' && trafficDensity > 0 && (
        Array.from({ length: Math.max(1, Math.round(trafficDensity / 15)) }).map((_, index) => {
          const count = Math.max(1, Math.round(trafficDensity / 15))
          const duration = 2
          const delay = (duration / count) * index
          return (
            <circle key={index} r="3" fill={style.color} style={{ filter: `drop-shadow(0 0 3px ${style.color})` }}>
              <animateMotion dur={`${duration}s`} repeatCount="indefinite" path={edgePath} begin={`${delay}s`} />
            </circle>
          )
        })
      )}

      <EdgeLabelRenderer>
        {/* Draggable bend control point -- only visible when selected */}
        {isSelected && (
          <div
            className="absolute nodrag nopan pointer-events-auto"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              cursor: 'grab',
              zIndex: 100,
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <div
              className="rounded-full border transition-all"
              style={{
                width: 8,
                height: 8,
                backgroundColor: isSelected ? 'var(--color-panel-bg)' : `${style.color}33`,
                borderColor: style.color,
                borderWidth: 1.5,
                opacity: isSelected ? 1 : 0.5,
                boxShadow: `0 0 8px ${style.color}88`,
              }}
            />
          </div>
        )}

        {/* Editable label */}
        <div
          className="absolute pointer-events-auto nodrag nopan cursor-pointer"
          style={{
            transform: `translate(-50%, calc(-50% - 12px)) translate(${labelX}px,${labelY}px)`,
          }}
          onClick={(e) => { e.stopPropagation(); setSelectedEdge(id) }}
        >
          <input
            className="text-xs bg-transparent text-center outline-none rounded px-1.5 py-0.5 min-w-[30px] max-w-[100px]"
            style={{
              color: 'var(--color-text-secondary)',
              backgroundColor: isSelected ? 'var(--color-panel-bg)' : 'transparent',
              border: isSelected ? '1px solid var(--color-border)' : '1px solid transparent',
              opacity: !isSelected && !data?.label ? 0 : 1,
              pointerEvents: !isSelected && !data?.label ? 'none' : 'auto',
            }}
            value={data?.label ?? ''}
            onChange={(e) => updateEdgeLabel(id, e.target.value)}
            placeholder={isSelected ? (data?.protocol || 'label') : ''}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export const TypedEdgeMemo = memo(TypedEdgeComponent)
