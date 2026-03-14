import { create } from 'zustand'
import type { SystemNode, SystemEdge } from '@/types'
import { useFlowStore } from './use-flow-store'

interface HistoryEntry {
  nodes: SystemNode[]
  edges: SystemEdge[]
}

interface UndoState {
  past: HistoryEntry[]
  future: HistoryEntry[]
  /** Snapshot current state before a mutation */
  snapshot: () => void
  /** Undo to previous state */
  undo: () => void
  /** Redo to next state */
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

const MAX_HISTORY = 50

export const useUndoStore = create<UndoState>((set, get) => ({
  past: [],
  future: [],

  snapshot: () => {
    const { nodes, edges } = useFlowStore.getState()
    set((state) => ({
      past: [...state.past.slice(-(MAX_HISTORY - 1)), { nodes, edges }],
      future: [],
    }))
  },

  undo: () => {
    const { past } = get()
    if (past.length === 0) return

    const { nodes, edges } = useFlowStore.getState()
    const previous = past[past.length - 1]

    set((state) => ({
      past: state.past.slice(0, -1),
      future: [{ nodes, edges }, ...state.future],
    }))

    useFlowStore.setState({
      nodes: previous.nodes,
      edges: previous.edges,
    })
  },

  redo: () => {
    const { future } = get()
    if (future.length === 0) return

    const { nodes, edges } = useFlowStore.getState()
    const next = future[0]

    set((state) => ({
      past: [...state.past, { nodes, edges }],
      future: state.future.slice(1),
    }))

    useFlowStore.setState({
      nodes: next.nodes,
      edges: next.edges,
    })
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}))
