import { create } from 'zustand'
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
} from '@xyflow/react'
import { v4 as uuid } from 'uuid'
import type { SystemNode, SystemEdge, ComponentConfig, ConnectionType, SystemEdgeData } from '@/types'
import { componentDefinitionMap } from '@/data/component-definitions'

interface FlowState {
  /* Graph data */
  nodes: SystemNode[]
  edges: SystemEdge[]
  /* Selected elements for properties panel */
  selectedNodeId: string | null
  selectedEdgeId: string | null
  /* Project metadata */
  projectName: string
  /* Actions */
  onNodesChange: OnNodesChange<SystemNode>
  onEdgesChange: OnEdgesChange<SystemEdge>
  onConnect: OnConnect
  addNode: (componentType: string, position: { x: number; y: number }) => void
  updateNodeConfig: (nodeId: string, config: ComponentConfig) => void
  updateNodeLabel: (nodeId: string, label: string) => void
  updateEdgeData: (edgeId: string, data: Partial<SystemEdgeData>) => void
  updateEdgeLabel: (edgeId: string, label: string) => void
  setSelectedNode: (nodeId: string | null) => void
  setSelectedEdge: (edgeId: string | null) => void
  toggleNodeExpanded: (nodeId: string) => void
  deleteSelected: () => void
  addGroup: (position: { x: number; y: number }, groupType?: string, label?: string) => void
  addTextNode: (position: { x: number; y: number }, text: string) => void
  addNodes: (nodes: SystemNode[]) => void
  addEdges: (edges: SystemEdge[]) => void
  deselectAll: () => void
  setProjectName: (name: string) => void
  loadProject: (nodes: SystemNode[], edges: SystemEdge[], name?: string) => void
  clear: () => void
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  projectName: 'Untitled Project',

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) })
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) })
  },

  onConnect: (connection: Connection) => {
    const { edges } = get()
    const src = connection.source
    const tgt = connection.target
    /* Allow max 2 edges between same pair of nodes (in either direction) */
    const existingCount = edges.filter(
      (e) =>
        (e.source === src && e.target === tgt) ||
        (e.source === tgt && e.target === src)
    ).length
    if (existingCount >= 2) return

    const edge: SystemEdge = {
      ...connection,
      id: `edge-${uuid()}`,
      type: 'typed-edge',
      data: { label: '', protocol: '', connectionType: 'sync' as ConnectionType, latencyMs: 10, curvatureOffset: 0 },
    }
    set({ edges: addEdge(edge, get().edges) })
  },

  addNode: (componentType, position) => {
    const def = componentDefinitionMap.get(componentType)
    if (!def) return

    const defaultConfig: ComponentConfig = {}
    for (const prop of def.properties) {
      defaultConfig[prop.key] = prop.defaultValue
    }

    const nodeType = componentType === 'decision-gateway' ? 'decision-gateway' : 'system-component'
    const node: SystemNode = {
      id: `node-${uuid()}`,
      type: nodeType,
      position,
      data: {
        componentType,
        label: def.label,
        config: defaultConfig,
      },
    }

    set({ nodes: [...get().nodes, node] })
  },

  updateNodeConfig: (nodeId, config) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, config } } : n
      ),
    })
  },

  updateNodeLabel: (nodeId, label) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
      ),
    })
  },

  updateEdgeData: (edgeId, data) => {
    set({
      edges: get().edges.map((e) =>
        e.id === edgeId ? { ...e, data: { ...e.data, ...data } } : e
      ),
    })
  },

  updateEdgeLabel: (edgeId, label) => {
    set({
      edges: get().edges.map((e) =>
        e.id === edgeId ? { ...e, data: { ...e.data, label } } : e
      ),
    })
  },

  setSelectedNode: (nodeId) => {
    set({ selectedNodeId: nodeId, selectedEdgeId: null })
  },

  setSelectedEdge: (edgeId) => {
    set({ selectedEdgeId: edgeId, selectedNodeId: null })
  },

  toggleNodeExpanded: (nodeId) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, expanded: !n.data.expanded } }
          : n
      ),
    })
  },

  deleteSelected: () => {
    const { nodes, edges, selectedNodeId, selectedEdgeId } = get()
    if (selectedEdgeId) {
      set({ edges: edges.filter((e) => e.id !== selectedEdgeId), selectedEdgeId: null })
      return
    }
    if (!selectedNodeId) return
    set({
      nodes: nodes.filter((n) => n.id !== selectedNodeId),
      edges: edges.filter(
        (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
      ),
      selectedNodeId: null,
    })
  },

  addGroup: (position, groupType = 'service', label = 'Service Boundary') => {
    const node: SystemNode = {
      id: `group-${uuid()}`,
      type: 'group',
      position,
      data: {
        componentType: 'group',
        label,
        config: { groupType },
      },
      style: { width: 400, height: 300 },
    }
    set({ nodes: [...get().nodes, node] })
  },

  addTextNode: (position, text) => {
    const node: SystemNode = {
      id: `text-${uuid()}`,
      type: 'text',
      position,
      data: {
        componentType: 'text',
        label: text,
        config: {},
      },
    }
    set({ nodes: [...get().nodes, node] })
  },

  addNodes: (newNodes) => {
    set({ nodes: [...get().nodes, ...newNodes] })
  },

  addEdges: (newEdges) => {
    set({ edges: [...get().edges, ...newEdges] })
  },

  deselectAll: () => {
    set({
      nodes: get().nodes.map((n) => (n.selected ? { ...n, selected: false } : n)),
      selectedNodeId: null,
      selectedEdgeId: null,
    })
  },

  setProjectName: (name) => set({ projectName: name }),

  loadProject: (nodes, edges, name) => {
    set({
      nodes,
      edges,
      selectedNodeId: null,
      selectedEdgeId: null,
      ...(name ? { projectName: name } : {}),
    })
  },

  clear: () => {
    set({ nodes: [], edges: [], selectedNodeId: null, selectedEdgeId: null })
  },
}))
