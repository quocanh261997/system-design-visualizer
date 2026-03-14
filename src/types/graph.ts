import type { Node, Edge } from '@xyflow/react'
import type { ComponentConfig } from './component-registry'

/** Data attached to each system design node */
export interface SystemNodeData {
  componentType: string
  label: string
  config: ComponentConfig
  /** Whether the node is expanded to show internals (multi-level zoom) */
  expanded?: boolean
  [key: string]: unknown
}

/** Connection protocol types for typed edges */
export type ConnectionType = 'sync' | 'async' | 'streaming' | 'response'

/** Protocol options within each connection type */
export const PROTOCOL_OPTIONS: Record<ConnectionType, string[]> = {
  sync: ['REST', 'gRPC', 'GraphQL', 'HTTP', 'RPC'],
  async: ['Kafka', 'RabbitMQ', 'SQS', 'Pub/Sub', 'Event Bus', 'Webhook'],
  streaming: ['WebSocket', 'SSE', 'gRPC Stream', 'TCP Stream'],
  response: ['HTTP Response', 'gRPC Response', 'Callback', 'Return'],
}

/** Visual config for each connection type */
export const CONNECTION_TYPE_STYLES: Record<ConnectionType, {
  color: string
  strokeDasharray: string
  label: string
}> = {
  sync: { color: '#6366f1', strokeDasharray: '0', label: 'Sync' },
  async: { color: '#f97316', strokeDasharray: '8 4', label: 'Async' },
  streaming: { color: '#22c55e', strokeDasharray: '0', label: 'Stream' },
  response: { color: '#38bdf8', strokeDasharray: '4 3', label: 'Response' },
}

/** Data attached to each connection edge */
export interface SystemEdgeData {
  label?: string
  protocol?: string
  connectionType?: ConnectionType
  /** Estimated latency in ms for simulation */
  latencyMs?: number
  /** Amount of traffic flowing through this edge, determines number of light dots */
  traffic?: number
  /** Branch label for decision gateway outgoing edges */
  branchLabel?: string
  /** Probability weight for decision branching (0-100) */
  probability?: number
  /** Offset in px for bending the edge curve (draggable control point) */
  curvatureOffset?: number
  [key: string]: unknown
}

export type SystemNode = Node<SystemNodeData, 'system-component' | 'group' | 'decision-gateway'>
export type SystemEdge = Edge<SystemEdgeData>

/** A single step in a simulation run */
export interface SimulationStep {
  edgeId: string
  sourceNodeId: string
  targetNodeId: string
  label: string
  latencyMs: number
  cumulativeMs: number
}

/** A defined request scenario for simulation */
export interface SimulationScenario {
  id: string
  name: string
  description: string
  /** Node ID where the request originates */
  startNodeId: string
}

/** Simulation playback state */
export type SimulationStatus = 'idle' | 'playing' | 'paused' | 'finished'

/** Serializable project format for save/load */
export interface ProjectData {
  id: string
  name: string
  description: string
  nodes: SystemNode[]
  edges: SystemEdge[]
  createdAt: string
  updatedAt: string
}
