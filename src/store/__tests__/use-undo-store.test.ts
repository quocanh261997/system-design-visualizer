import { describe, it, expect, beforeEach } from 'vitest'
import { useUndoStore } from '../use-undo-store'
import { useFlowStore } from '../use-flow-store'

describe('useUndoStore', () => {
  beforeEach(() => {
    useFlowStore.setState({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      projectName: 'Test',
    })
    useUndoStore.setState({ past: [], future: [] })
  })

  it('snapshot captures current state', () => {
    useFlowStore.getState().addNode('redis', { x: 0, y: 0 })
    useUndoStore.getState().snapshot()

    expect(useUndoStore.getState().past).toHaveLength(1)
    expect(useUndoStore.getState().past[0].nodes).toHaveLength(1)
  })

  it('undo restores previous state', () => {
    // Initial state: empty
    useUndoStore.getState().snapshot()

    // Add a node
    useFlowStore.getState().addNode('redis', { x: 0, y: 0 })
    expect(useFlowStore.getState().nodes).toHaveLength(1)

    // Undo
    useUndoStore.getState().undo()
    expect(useFlowStore.getState().nodes).toHaveLength(0)
  })

  it('redo restores undone state', () => {
    useUndoStore.getState().snapshot()
    useFlowStore.getState().addNode('redis', { x: 0, y: 0 })

    useUndoStore.getState().undo()
    expect(useFlowStore.getState().nodes).toHaveLength(0)

    useUndoStore.getState().redo()
    expect(useFlowStore.getState().nodes).toHaveLength(1)
  })

  it('snapshot clears future (branching)', () => {
    useUndoStore.getState().snapshot()
    useFlowStore.getState().addNode('redis', { x: 0, y: 0 })

    useUndoStore.getState().undo()
    expect(useUndoStore.getState().future).toHaveLength(1)

    // New snapshot should clear future
    useUndoStore.getState().snapshot()
    expect(useUndoStore.getState().future).toHaveLength(0)
  })

  it('undo on empty past does nothing', () => {
    useFlowStore.getState().addNode('redis', { x: 0, y: 0 })
    useUndoStore.getState().undo()
    expect(useFlowStore.getState().nodes).toHaveLength(1)
  })

  it('redo on empty future does nothing', () => {
    useUndoStore.getState().redo()
    expect(useFlowStore.getState().nodes).toHaveLength(0)
  })

  it('canUndo/canRedo reflect state correctly', () => {
    expect(useUndoStore.getState().canUndo()).toBe(false)
    expect(useUndoStore.getState().canRedo()).toBe(false)

    useUndoStore.getState().snapshot()
    expect(useUndoStore.getState().canUndo()).toBe(true)

    useUndoStore.getState().undo()
    expect(useUndoStore.getState().canRedo()).toBe(true)
  })
})
