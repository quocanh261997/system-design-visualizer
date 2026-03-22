import { memo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
  type Edge,
} from '@xyflow/react'
import type { RelationshipCardinality } from '@/types/schema'
import { useSchemaStore } from '@/store/use-schema-store'

export interface RelationshipEdgeData {
  cardinality: RelationshipCardinality
  label: string
  relationshipId: string
  [key: string]: unknown
}

export type RelationshipEdge = Edge<RelationshipEdgeData, 'relationship-edge'>

function crowsFootMarker(cardinality: RelationshipCardinality, side: 'source' | 'target') {
  const isMany =
    (side === 'source' && cardinality === 'M:N') ||
    (side === 'target' && (cardinality === '1:N' || cardinality === 'M:N'))

  if (isMany) {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" style={{ overflow: 'visible' }}>
        <line x1="0" y1="2" x2="6" y2="6" stroke="var(--color-text-muted)" strokeWidth="1.5" />
        <line x1="0" y1="10" x2="6" y2="6" stroke="var(--color-text-muted)" strokeWidth="1.5" />
        <line x1="0" y1="6" x2="6" y2="6" stroke="var(--color-text-muted)" strokeWidth="1.5" />
      </svg>
    )
  }
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" style={{ overflow: 'visible' }}>
      <line x1="3" y1="2" x2="3" y2="10" stroke="var(--color-text-muted)" strokeWidth="1.5" />
      <line x1="0" y1="6" x2="6" y2="6" stroke="var(--color-text-muted)" strokeWidth="1.5" />
    </svg>
  )
}

function RelationshipEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<RelationshipEdge>) {
  const setSelectedRelationship = useSchemaStore((s) => s.setSelectedRelationship)
  const cardinality = data?.cardinality ?? '1:N'
  const label = data?.label ?? ''

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? 'var(--color-accent)' : 'var(--color-text-muted)',
          strokeWidth: selected ? 2.5 : 1.5,
          cursor: 'pointer',
        }}
        interactionWidth={20}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto cursor-pointer"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          onClick={() => setSelectedRelationship(data?.relationshipId ?? id)}
        >
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium"
            style={{
              backgroundColor: 'var(--color-panel-bg)',
              border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
              color: selected ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            }}
          >
            {crowsFootMarker(cardinality, 'source')}
            <span>{label || cardinality}</span>
            {crowsFootMarker(cardinality, 'target')}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export const RelationshipEdgeMemo = memo(RelationshipEdgeComponent)
