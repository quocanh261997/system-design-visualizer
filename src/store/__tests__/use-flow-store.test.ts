import { describe, it, expect, beforeEach } from 'vitest'
import { useFlowStore } from '../use-flow-store'

describe('useFlowStore', () => {
  beforeEach(() => {
    useFlowStore.setState({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      projectName: 'Untitled Project',
    })
  })

  it('adds a node with correct default config', () => {
    const { addNode } = useFlowStore.getState()
    addNode('redis', { x: 100, y: 200 })

    const { nodes } = useFlowStore.getState()
    expect(nodes).toHaveLength(1)
    expect(nodes[0].data.componentType).toBe('redis')
    expect(nodes[0].data.label).toBe('Redis')
    expect(nodes[0].data.config.maxMemory).toBe(512)
    expect(nodes[0].position).toEqual({ x: 100, y: 200 })
  })

  it('does not add node for unknown component type', () => {
    const { addNode } = useFlowStore.getState()
    addNode('nonexistent', { x: 0, y: 0 })

    const { nodes } = useFlowStore.getState()
    expect(nodes).toHaveLength(0)
  })

  it('updates node config', () => {
    const { addNode } = useFlowStore.getState()
    addNode('redis', { x: 0, y: 0 })

    const nodeId = useFlowStore.getState().nodes[0].id
    useFlowStore.getState().updateNodeConfig(nodeId, { maxMemory: 1024 })

    const node = useFlowStore.getState().nodes[0]
    expect(node.data.config.maxMemory).toBe(1024)
  })

  it('updates node label', () => {
    const { addNode } = useFlowStore.getState()
    addNode('postgresql', { x: 0, y: 0 })

    const nodeId = useFlowStore.getState().nodes[0].id
    useFlowStore.getState().updateNodeLabel(nodeId, 'Primary DB')

    expect(useFlowStore.getState().nodes[0].data.label).toBe('Primary DB')
  })

  it('deletes selected node and its connected edges', () => {
    const store = useFlowStore.getState()
    store.addNode('web-server', { x: 0, y: 0 })
    store.addNode('redis', { x: 200, y: 0 })

    const [server, cache] = useFlowStore.getState().nodes
    useFlowStore.setState({
      edges: [
        {
          id: 'e1',
          source: server.id,
          target: cache.id,
          type: 'labeled-edge',
          data: { label: 'cache read' },
        },
      ],
    })

    useFlowStore.getState().setSelectedNode(server.id)
    useFlowStore.getState().deleteSelected()

    const state = useFlowStore.getState()
    expect(state.nodes).toHaveLength(1)
    expect(state.edges).toHaveLength(0)
    expect(state.selectedNodeId).toBeNull()
  })

  it('adds a group node', () => {
    useFlowStore.getState().addGroup({ x: 50, y: 50 })

    const { nodes } = useFlowStore.getState()
    expect(nodes).toHaveLength(1)
    expect(nodes[0].type).toBe('group')
    expect(nodes[0].data.label).toBe('Service Boundary')
  })

  it('clears all nodes and edges', () => {
    const store = useFlowStore.getState()
    store.addNode('web-server', { x: 0, y: 0 })
    store.addNode('redis', { x: 200, y: 0 })
    store.clear()

    const state = useFlowStore.getState()
    expect(state.nodes).toHaveLength(0)
    expect(state.edges).toHaveLength(0)
  })

  it('loads a project', () => {
    const mockNodes = [
      {
        id: 'n1',
        type: 'system-component' as const,
        position: { x: 0, y: 0 },
        data: { componentType: 'redis', label: 'Cache', config: {} },
      },
    ]

    useFlowStore.getState().loadProject(mockNodes, [], 'Test Project')

    const state = useFlowStore.getState()
    expect(state.nodes).toHaveLength(1)
    expect(state.projectName).toBe('Test Project')
  })

  it('sets project name', () => {
    useFlowStore.getState().setProjectName('My Design')
    expect(useFlowStore.getState().projectName).toBe('My Design')
  })
})
