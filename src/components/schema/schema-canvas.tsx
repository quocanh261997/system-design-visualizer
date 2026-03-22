import { useCallback, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  Controls,
  SelectionMode,
  type ReactFlowInstance,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type OnSelectionChangeFunc,
  type Connection,
  type Edge,
} from '@xyflow/react'
import { useSchemaStore } from '@/store/use-schema-store'
import { useSpacePan } from '@/hooks/use-space-pan'
import { TableNodeMemo, type TableNode } from './table-node'
import { RelationshipEdgeMemo, type RelationshipEdge } from './relationship-edge'

const nodeTypes = { 'table-node': TableNodeMemo }
const edgeTypes = { 'relationship-edge': RelationshipEdgeMemo }

export function SchemaCanvas() {
  const tables = useSchemaStore((s) => s.tables)
  const relationships = useSchemaStore((s) => s.relationships)
  const tablePositions = useSchemaStore((s) => s.tablePositions)
  const updateTablePosition = useSchemaStore((s) => s.updateTablePosition)
  const addRelationship = useSchemaStore((s) => s.addRelationship)
  const setSelectedTable = useSchemaStore((s) => s.setSelectedTable)
  const setSelectedRelationship = useSchemaStore((s) => s.setSelectedRelationship)
  const removeTable = useSchemaStore((s) => s.removeTable)
  const removeRelationship = useSchemaStore((s) => s.removeRelationship)
  const rfInstance = useRef<ReactFlowInstance<TableNode, RelationshipEdge> | null>(null)

  const isSpacePressed = useSpacePan()
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set())
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(new Set())

  const nodes: TableNode[] = useMemo(
    () =>
      tables.map((table) => ({
        id: table.id,
        type: 'table-node' as const,
        position: tablePositions[table.id] ?? { x: 0, y: 0 },
        selected: selectedNodeIds.has(table.id),
        data: { table },
      })),
    [tables, tablePositions, selectedNodeIds]
  )

  const edges: RelationshipEdge[] = useMemo(
    () =>
      relationships.map((rel) => {
        const srcPos = tablePositions[rel.sourceTableId] ?? { x: 0, y: 0 }
        const tgtPos = tablePositions[rel.targetTableId] ?? { x: 0, y: 0 }
        const dx = tgtPos.x - srcPos.x
        const dy = tgtPos.y - srcPos.y

        let sourceHandle: string
        let targetHandle: string
        if (Math.abs(dx) > Math.abs(dy)) {
          sourceHandle = dx > 0 ? 'right-source' : 'left-source'
          targetHandle = dx > 0 ? 'left-target' : 'right-target'
        } else {
          sourceHandle = dy > 0 ? 'bottom-source' : 'top-source'
          targetHandle = dy > 0 ? 'top-target' : 'bottom-target'
        }

        return {
          id: `rel-${rel.id}`,
          type: 'relationship-edge' as const,
          source: rel.sourceTableId,
          target: rel.targetTableId,
          sourceHandle,
          targetHandle,
          selected: selectedEdgeIds.has(`rel-${rel.id}`),
          data: {
            cardinality: rel.cardinality,
            label: rel.label,
            relationshipId: rel.id,
          },
        }
      }),
    [relationships, tablePositions, selectedEdgeIds]
  )

  const onNodesChange: OnNodesChange<TableNode> = useCallback(
    (changes) => {
      for (const change of changes) {
        if (change.type === 'position' && change.position) {
          updateTablePosition(change.id, change.position)
        }
        if (change.type === 'remove') {
          removeTable(change.id)
        }
        if (change.type === 'select') {
          setSelectedNodeIds((prev) => {
            const next = new Set(prev)
            if (change.selected) next.add(change.id)
            else next.delete(change.id)
            return next
          })
        }
      }
    },
    [updateTablePosition, removeTable]
  )

  const onEdgesChange: OnEdgesChange<RelationshipEdge> = useCallback(
    (changes) => {
      for (const change of changes) {
        if (change.type === 'remove') {
          const relId = change.id.replace(/^rel-/, '')
          removeRelationship(relId)
        }
        if (change.type === 'select') {
          setSelectedEdgeIds((prev) => {
            const next = new Set(prev)
            if (change.selected) next.add(change.id)
            else next.delete(change.id)
            return next
          })
        }
      }
    },
    [removeRelationship]
  )

  const onSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selNodes }) => {
      if (selNodes.length === 1) {
        setSelectedTable(selNodes[0].id)
      } else {
        setSelectedTable(null)
      }
    },
    [setSelectedTable]
  )

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target || connection.source === connection.target) return

      const srcTable = tables.find((t) => t.id === connection.source)
      const tgtTable = tables.find((t) => t.id === connection.target)
      if (!srcTable || !tgtTable) return

      const srcFkCol = srcTable.columns.find((c) => c.isForeignKey)
      const tgtPkCol = tgtTable.columns.find((c) => c.isPrimaryKey)

      addRelationship({
        sourceTableId: srcTable.id,
        sourceColumnId: srcFkCol?.id ?? srcTable.columns[0]?.id ?? '',
        targetTableId: tgtTable.id,
        targetColumnId: tgtPkCol?.id ?? tgtTable.columns[0]?.id ?? '',
        cardinality: '1:N',
        label: `${srcTable.name} -> ${tgtTable.name}`,
      })
    },
    [tables, addRelationship]
  )

  const onPaneClick = useCallback(() => {
    setSelectedTable(null)
    setSelectedRelationship(null)
  }, [setSelectedTable, setSelectedRelationship])

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      const rel = relationships.find((r) => `rel-${r.id}` === edge.id)
      if (rel) setSelectedRelationship(rel.id)
    },
    [relationships, setSelectedRelationship]
  )

  return (
    <div className="flex-1 h-full" style={{ cursor: isSpacePressed ? 'grab' : 'default' }}>
      {!isSpacePressed && (
        <style>{`.react-flow__pane { cursor: default !important; }`}</style>
      )}
      <ReactFlow<TableNode, RelationshipEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onInit={(instance) => { rfInstance.current = instance }}
        onPaneClick={onPaneClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        panOnDrag={isSpacePressed ? true : [1, 2]}
        selectionOnDrag={!isSpacePressed}
        selectionMode={SelectionMode.Partial}
        panActivationKeyCode={null}
        panOnScroll
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.1}
        maxZoom={10}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Shift', 'Meta', 'Control']}
        defaultViewport={{ x: 50, y: 50, zoom: 0.85 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.05)" />
        <Controls
          showZoom
          showFitView
          showInteractive={false}
          position="bottom-left"
        />
        <MiniMap
          position="bottom-right"
          nodeColor={() => 'rgba(99, 102, 241, 0.5)'}
          maskColor="rgba(0, 0, 0, 0.7)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  )
}
