import { useCallback, useRef, useMemo, useState, useEffect } from 'react'
import {
  ReactFlow,
  Background,
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
import { TextNodeMemo } from './text-node'
import { TypedEdgeMemo } from './typed-edge'
import { ConnectionLegend } from './connection-legend'
import { ZoomControls } from './zoom-controls'
import type { SystemNode, SystemEdge } from '@/types'

const nodeTypes = {
  'system-component': SystemNodeMemo,
  group: GroupNodeMemo,
  'decision-gateway': DecisionNodeMemo,
  text: TextNodeMemo,
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
  const addTextNode = useFlowStore((s) => s.addTextNode)
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode)
  const setSelectedEdge = useFlowStore((s) => s.setSelectedEdge)
  const snapshot = useUndoStore((s) => s.snapshot)
  const rfInstance = useRef<ReactFlowInstance<SystemNode, SystemEdge> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'typed-edge',
      data: { label: '', protocol: '', connectionType: 'sync' as const, latencyMs: 10 },
      markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: '#6366f1' },
    }),
    []
  )

  const [isSpacePressed, setIsSpacePressed] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger pan mode when space is pressed, but don't interfere with typing in inputs
      if (e.code === 'Space') {
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return
        e.preventDefault()
        setIsSpacePressed(true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Native double click listener for the pane since React Flow synthetic events swallow it
  useEffect(() => {
    const handleNativeDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Only spawn text if we double clicked the actual empty pane
      if (target.classList.contains('react-flow__pane') && rfInstance.current) {
        const position = rfInstance.current.screenToFlowPosition({
          x: e.clientX,
          y: e.clientY,
        })
        snapshot()
        addTextNode(position, 'Text')
      }
    }

    const wrapper = wrapperRef.current
    if (wrapper) {
      wrapper.addEventListener('dblclick', handleNativeDblClick)
    }
    return () => {
      if (wrapper) wrapper.removeEventListener('dblclick', handleNativeDblClick)
    }
  }, [addTextNode])

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

  /** Handle single clicks on empty canvas */
  const onPaneClick = useCallback((_event: React.MouseEvent) => {
    // Normal single click: deselect
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
    <div 
      ref={wrapperRef}
      className="flex-1 h-full relative"
      style={{ cursor: isSpacePressed ? 'grab' : 'default' }}
    >
      {/* 
        React Flow adds `cursor: grab` natively to .react-flow__pane when 
        panOnDrag is active for any key. To ensure it acts like an arrow pointer 
        unless space is held, we dynamically override the CSS.
      */}
      {!isSpacePressed && (
        <style>
          {`
            .react-flow__pane {
              cursor: default !important;
            }
          `}
        </style>
      )}
      
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
        panOnDrag={isSpacePressed ? true : [1, 2]}
        selectionOnDrag={!isSpacePressed}
        selectionMode={SelectionMode.Partial}
        panActivationKeyCode={null}
        panOnScroll={true}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Shift', 'Meta', 'Control']}
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.1}
        maxZoom={30}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        zoomOnDoubleClick={false}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.05)"
        />
        <ZoomControls />
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
