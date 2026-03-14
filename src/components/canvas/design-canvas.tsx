import { useCallback, useRef, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  SelectionMode,
  type ReactFlowInstance,
} from '@xyflow/react'
import { useFlowStore } from '@/store/use-flow-store'
import { useUndoStore } from '@/store/use-undo-store'
import { SystemNodeMemo } from './system-node'
import { GroupNodeMemo } from './group-node'
import { DecisionNodeMemo } from './decision-node'
import { TypedEdgeMemo } from './typed-edge'
import { ConnectionLegend } from './connection-legend'
import type { SystemNode, SystemEdge } from '@/types'

const nodeTypes = {
  'system-component': SystemNodeMemo,
  group: GroupNodeMemo,
  'decision-gateway': DecisionNodeMemo,
}

const edgeTypes = {
  'typed-edge': TypedEdgeMemo,
  'labeled-edge': TypedEdgeMemo, // backward compat for saved projects
}

/** Main canvas area with React Flow, pan/zoom, minimap, and background grid */
export function DesignCanvas() {
  const nodes = useFlowStore((s) => s.nodes)
  const edges = useFlowStore((s) => s.edges)
  const onNodesChange = useFlowStore((s) => s.onNodesChange)
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange)
  const onConnect = useFlowStore((s) => s.onConnect)
  const addNode = useFlowStore((s) => s.addNode)
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode)
  const setSelectedEdge = useFlowStore((s) => s.setSelectedEdge)
  const snapshot = useUndoStore((s) => s.snapshot)
  const rfInstance = useRef<ReactFlowInstance<SystemNode, SystemEdge> | null>(null)

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'typed-edge',
      data: { label: '', protocol: '', connectionType: 'sync' as const, latencyMs: 10 },
      markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: '#6366f1' },
    }),
    []
  )

  /** Handle drop from palette sidebar */
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const componentType = event.dataTransfer.getData('application/sdb-component')
      if (!componentType || !rfInstance.current) return

      const position = rfInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      snapshot()
      addNode(componentType, position)
    },
    [addNode, snapshot]
  )

  /** Deselect when clicking on empty canvas */
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setSelectedEdge(null)
  }, [setSelectedNode, setSelectedEdge])

  /** Select edge on click */
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: SystemEdge) => {
      setSelectedEdge(edge.id)
    },
    [setSelectedEdge]
  )

  return (
    <div className="flex-1 h-full relative">
      <ConnectionLegend />
      <ReactFlow<SystemNode, SystemEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={() => snapshot()}
        onInit={(instance) => { rfInstance.current = instance }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        panOnDrag={false}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        panOnScroll={true}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Shift', 'Meta', 'Control']}
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.1}
        maxZoom={4}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.05)"
        />
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap
          position="bottom-right"
          nodeColor={(node) => {
            if (node.type === 'group') return 'rgba(99, 102, 241, 0.2)'
            return 'rgba(99, 102, 241, 0.5)'
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  )
}
