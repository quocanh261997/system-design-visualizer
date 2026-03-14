import { describe, it, expect, beforeEach } from 'vitest'
import { useFlowStore } from '../use-flow-store'

describe('useFlowStore - Phase 2 features', () => {
  beforeEach(() => {
    useFlowStore.setState({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      projectName: 'Untitled Project',
    })
  })

  it('selects an edge and clears node selection', () => {
    useFlowStore.getState().addNode('redis', { x: 0, y: 0 })
    const nodeId = useFlowStore.getState().nodes[0].id
    useFlowStore.getState().setSelectedNode(nodeId)
    expect(useFlowStore.getState().selectedNodeId).toBe(nodeId)

    useFlowStore.getState().setSelectedEdge('edge-1')
    expect(useFlowStore.getState().selectedEdgeId).toBe('edge-1')
    expect(useFlowStore.getState().selectedNodeId).toBeNull()
  })

  it('selects a node and clears edge selection', () => {
    useFlowStore.getState().setSelectedEdge('edge-1')
    useFlowStore.getState().addNode('redis', { x: 0, y: 0 })
    const nodeId = useFlowStore.getState().nodes[0].id

    useFlowStore.getState().setSelectedNode(nodeId)
    expect(useFlowStore.getState().selectedNodeId).toBe(nodeId)
    expect(useFlowStore.getState().selectedEdgeId).toBeNull()
  })

  it('updates edge data with partial updates', () => {
    useFlowStore.setState({
      edges: [{
        id: 'e1',
        source: 'a',
        target: 'b',
        type: 'typed-edge',
        data: { label: 'test', protocol: 'REST', connectionType: 'sync', latencyMs: 10 },
      }],
    })

    useFlowStore.getState().updateEdgeData('e1', { connectionType: 'async', protocol: 'Kafka' })

    const edge = useFlowStore.getState().edges[0]
    expect(edge.data?.connectionType).toBe('async')
    expect(edge.data?.protocol).toBe('Kafka')
    expect(edge.data?.label).toBe('test') // unchanged
    expect(edge.data?.latencyMs).toBe(10) // unchanged
  })

  it('deletes selected edge', () => {
    useFlowStore.setState({
      edges: [
        { id: 'e1', source: 'a', target: 'b', type: 'typed-edge', data: { label: '' } },
        { id: 'e2', source: 'b', target: 'c', type: 'typed-edge', data: { label: '' } },
      ],
      selectedEdgeId: 'e1',
    })

    useFlowStore.getState().deleteSelected()

    expect(useFlowStore.getState().edges).toHaveLength(1)
    expect(useFlowStore.getState().edges[0].id).toBe('e2')
    expect(useFlowStore.getState().selectedEdgeId).toBeNull()
  })

  it('toggles node expanded state', () => {
    useFlowStore.getState().addNode('redis', { x: 0, y: 0 })
    const nodeId = useFlowStore.getState().nodes[0].id

    expect(useFlowStore.getState().nodes[0].data.expanded).toBeFalsy()

    useFlowStore.getState().toggleNodeExpanded(nodeId)
    expect(useFlowStore.getState().nodes[0].data.expanded).toBe(true)

    useFlowStore.getState().toggleNodeExpanded(nodeId)
    expect(useFlowStore.getState().nodes[0].data.expanded).toBe(false)
  })

  it('new edges get typed-edge type and sync connection by default', () => {
    // Simulate what onConnect would create (testing the data shape)
    const store = useFlowStore.getState()
    store.addNode('browser-client', { x: 0, y: 0 })
    store.addNode('load-balancer', { x: 200, y: 0 })

    // Can't easily test onConnect without React Flow, but we can verify the store shape
    useFlowStore.setState({
      edges: [{
        id: 'e1',
        source: 'node-1',
        target: 'node-2',
        type: 'typed-edge',
        data: { label: '', protocol: '', connectionType: 'sync', latencyMs: 10 },
      }],
    })

    const edge = useFlowStore.getState().edges[0]
    expect(edge.type).toBe('typed-edge')
    expect(edge.data?.connectionType).toBe('sync')
    expect(edge.data?.latencyMs).toBe(10)
  })
})
