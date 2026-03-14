import { create } from 'zustand'
import type { SimulationStep, SimulationStatus } from '@/types'
import { useFlowStore } from './use-flow-store'

interface SimulationState {
  status: SimulationStatus
  steps: SimulationStep[]
  currentStepIndex: number
  speed: number // 1 = normal, 2 = fast, 0.5 = slow
  trafficDensity: number // 0-100, scales animated dots on edges
  activeEdgeId: string | null
  activeNodeId: string | null
  /** Visited node IDs (for "light up" effect) */
  visitedNodeIds: Set<string>
  /** Visited edge IDs */
  visitedEdgeIds: Set<string>
  /* Actions */
  buildSimulation: (startNodeId: string) => void
  play: () => void
  pause: () => void
  stepForward: () => void
  reset: () => void
  setSpeed: (speed: number) => void
  setTrafficDensity: (density: number) => void
}

/** Pick a branch from a decision node based on probability weights */
function pickDecisionBranch(outEdges: { data?: { probability?: number } }[]): number {
  const withProb = outEdges.filter((e) => e.data?.probability != null && e.data.probability > 0)
  if (withProb.length === 0) return 0 // no probabilities, pick first

  const total = withProb.reduce((sum, e) => sum + (e.data?.probability ?? 0), 0)
  let roll = Math.random() * total
  for (let i = 0; i < outEdges.length; i++) {
    const prob = outEdges[i].data?.probability ?? 0
    if (prob <= 0) continue
    roll -= prob
    if (roll <= 0) return i
  }
  return 0
}

/** BFS traversal from a start node, with decision gateway branching support */
function buildStepsFromGraph(startNodeId: string): SimulationStep[] {
  const { nodes, edges } = useFlowStore.getState()
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const steps: SimulationStep[] = []
  const visited = new Set<string>()
  const queue: { nodeId: string; cumulativeMs: number }[] = [
    { nodeId: startNodeId, cumulativeMs: 0 },
  ]

  visited.add(startNodeId)

  while (queue.length > 0) {
    const current = queue.shift()!
    const node = nodeMap.get(current.nodeId)
    const outEdges = edges.filter((e) => e.source === current.nodeId)

    // Decision gateway: pick a branch based on probability
    const isDecision = node?.type === 'decision-gateway'
    let edgesToFollow = outEdges

    if (isDecision && outEdges.length > 1) {
      const hasProbabilities = outEdges.some((e) => e.data?.probability != null && e.data.probability > 0)
      if (hasProbabilities) {
        const pickedIdx = pickDecisionBranch(outEdges)
        edgesToFollow = [outEdges[pickedIdx]]
      }
      // If no probabilities, follow all branches sequentially (default)
    }

    for (const edge of edgesToFollow) {
      if (visited.has(edge.target)) continue
      visited.add(edge.target)

      const latency = edge.data?.latencyMs ?? 10
      const cumulative = current.cumulativeMs + latency
      const sourceNode = nodeMap.get(current.nodeId)
      const targetNode = nodeMap.get(edge.target)
      const branchInfo = edge.data?.branchLabel ? ` [${edge.data.branchLabel}]` : ''

      steps.push({
        edgeId: edge.id,
        sourceNodeId: current.nodeId,
        targetNodeId: edge.target,
        label: `${sourceNode?.data.label ?? '?'} → ${targetNode?.data.label ?? '?'}${branchInfo}`,
        latencyMs: latency,
        cumulativeMs: cumulative,
      })

      queue.push({ nodeId: edge.target, cumulativeMs: cumulative })
    }
  }

  return steps
}

let playInterval: ReturnType<typeof setInterval> | null = null

function clearPlayInterval() {
  if (playInterval) {
    clearInterval(playInterval)
    playInterval = null
  }
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  status: 'idle',
  steps: [],
  currentStepIndex: -1,
  speed: 1,
  trafficDensity: 50,
  activeEdgeId: null,
  activeNodeId: null,
  visitedNodeIds: new Set<string>(),
  visitedEdgeIds: new Set<string>(),

  buildSimulation: (startNodeId) => {
    clearPlayInterval()
    const steps = buildStepsFromGraph(startNodeId)
    set({
      status: 'idle',
      steps,
      currentStepIndex: -1,
      activeEdgeId: null,
      activeNodeId: startNodeId,
      visitedNodeIds: new Set([startNodeId]),
      visitedEdgeIds: new Set(),
    })
  },

  play: () => {
    const { steps } = get()
    if (steps.length === 0) return

    clearPlayInterval()

    const allNodeIds = new Set(steps.map(s => s.targetNodeId))
    allNodeIds.add(steps[0]?.sourceNodeId)
    const allEdgeIds = new Set(steps.map(s => s.edgeId))

    set({
      status: 'playing',
      currentStepIndex: steps.length - 1, // Optional: just keep it at the end
      activeNodeId: null, // Since all are playing
      activeEdgeId: null,
      visitedNodeIds: allNodeIds,
      visitedEdgeIds: allEdgeIds,
    })
  },

  pause: () => {
    set({ status: 'paused' })
  },

  stepForward: () => {
    const { steps, currentStepIndex, visitedNodeIds, visitedEdgeIds } = get()
    const nextIdx = currentStepIndex + 1
    if (nextIdx >= steps.length) {
      set({ status: 'finished', activeEdgeId: null })
      return
    }

    const step = steps[nextIdx]
    const newVisitedNodes = new Set(visitedNodeIds)
    newVisitedNodes.add(step.targetNodeId)
    const newVisitedEdges = new Set(visitedEdgeIds)
    newVisitedEdges.add(step.edgeId)

    set({
      status: 'paused',
      currentStepIndex: nextIdx,
      activeEdgeId: step.edgeId,
      activeNodeId: step.targetNodeId,
      visitedNodeIds: newVisitedNodes,
      visitedEdgeIds: newVisitedEdges,
    })
  },

  reset: () => {
    clearPlayInterval()
    set({
      status: 'idle',
      steps: [],
      currentStepIndex: -1,
      activeEdgeId: null,
      activeNodeId: null,
      visitedNodeIds: new Set(),
      visitedEdgeIds: new Set(),
    })
  },

  setSpeed: (speed) => {
    set({ speed })
    const { status } = get()
    if (status === 'playing') {
      clearPlayInterval()
      get().play()
    }
  },

  setTrafficDensity: (density) => {
    set({ trafficDensity: Math.max(0, Math.min(100, density)) })
  },
}))
