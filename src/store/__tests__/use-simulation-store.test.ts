import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useSimulationStore } from '../use-simulation-store'
import { useFlowStore } from '../use-flow-store'

describe('useSimulationStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    useSimulationStore.setState({
      status: 'idle',
      steps: [],
      currentStepIndex: -1,
      speed: 1,
      activeEdgeId: null,
      activeNodeId: null,
      visitedNodeIds: new Set(),
      visitedEdgeIds: new Set(),
    })

    // Set up a simple graph: A -> B -> C
    useFlowStore.setState({
      nodes: [
        { id: 'a', type: 'system-component', position: { x: 0, y: 0 }, data: { componentType: 'browser-client', label: 'Client', config: {} } },
        { id: 'b', type: 'system-component', position: { x: 200, y: 0 }, data: { componentType: 'web-server', label: 'Server', config: {} } },
        { id: 'c', type: 'system-component', position: { x: 400, y: 0 }, data: { componentType: 'postgresql', label: 'DB', config: {} } },
      ],
      edges: [
        { id: 'e1', source: 'a', target: 'b', type: 'typed-edge', data: { label: 'HTTP', latencyMs: 50 } },
        { id: 'e2', source: 'b', target: 'c', type: 'typed-edge', data: { label: 'SQL', latencyMs: 20 } },
      ],
      selectedNodeId: null,
      selectedEdgeId: null,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    useSimulationStore.getState().reset()
  })

  it('builds simulation steps from graph via BFS', () => {
    useSimulationStore.getState().buildSimulation('a')

    const { steps, activeNodeId, visitedNodeIds } = useSimulationStore.getState()
    expect(steps).toHaveLength(2)
    expect(steps[0].sourceNodeId).toBe('a')
    expect(steps[0].targetNodeId).toBe('b')
    expect(steps[0].latencyMs).toBe(50)
    expect(steps[1].sourceNodeId).toBe('b')
    expect(steps[1].targetNodeId).toBe('c')
    expect(steps[1].latencyMs).toBe(20)
    expect(steps[1].cumulativeMs).toBe(70)
    expect(activeNodeId).toBe('a')
    expect(visitedNodeIds.has('a')).toBe(true)
  })

  it('step forward advances one step at a time', () => {
    useSimulationStore.getState().buildSimulation('a')
    useSimulationStore.getState().stepForward()

    const state = useSimulationStore.getState()
    expect(state.currentStepIndex).toBe(0)
    expect(state.activeEdgeId).toBe('e1')
    expect(state.activeNodeId).toBe('b')
    expect(state.visitedNodeIds.has('b')).toBe(true)
    expect(state.status).toBe('paused')
  })

  it('step forward to end sets status to finished', () => {
    useSimulationStore.getState().buildSimulation('a')
    useSimulationStore.getState().stepForward()
    useSimulationStore.getState().stepForward()
    useSimulationStore.getState().stepForward() // beyond last step

    expect(useSimulationStore.getState().status).toBe('finished')
  })

  it('reset clears all simulation state', () => {
    useSimulationStore.getState().buildSimulation('a')
    useSimulationStore.getState().stepForward()
    useSimulationStore.getState().reset()

    const state = useSimulationStore.getState()
    expect(state.status).toBe('idle')
    expect(state.steps).toHaveLength(0)
    expect(state.currentStepIndex).toBe(-1)
    expect(state.activeEdgeId).toBeNull()
    expect(state.activeNodeId).toBeNull()
  })

  it('play marks all nodes and edges as visited for continuous animation', () => {
    useSimulationStore.getState().buildSimulation('a')
    useSimulationStore.getState().play()

    const state = useSimulationStore.getState()
    expect(state.status).toBe('playing')
    // Play immediately activates all visited nodes/edges for dot animation
    expect(state.visitedNodeIds.has('a')).toBe(true)
    expect(state.visitedNodeIds.has('b')).toBe(true)
    expect(state.visitedNodeIds.has('c')).toBe(true)
    expect(state.visitedEdgeIds.has('e1')).toBe(true)
    expect(state.visitedEdgeIds.has('e2')).toBe(true)
  })

  it('pause sets status to paused', () => {
    useSimulationStore.getState().buildSimulation('a')
    useSimulationStore.getState().play()
    useSimulationStore.getState().pause()

    expect(useSimulationStore.getState().status).toBe('paused')
  })

  it('setSpeed changes playback rate', () => {
    useSimulationStore.getState().setSpeed(2)
    expect(useSimulationStore.getState().speed).toBe(2)
  })
})
