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

export type SystemNode = Node<SystemNodeData, 'system-component' | 'group' | 'decision-gateway' | 'text'>
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

/** Placeholder for notes (refined in Phase 2) */
export interface ProjectNotes {
  functionalRequirements: string[]
  nonFunctionalRequirements: string[]
  assumptions: string[]
  tradeoffs: string[]
  freeformNotes: string
}

/** Placeholder for estimation rows (refined in Phase 3) */
export interface EstimationRow {
  id: string
  label: string
  formula: string
  value: number
  unit: string
}

/** Placeholder for database schema (refined in Phase 4) */
export interface DatabaseSchema {
  tables: unknown[]
  relationships: unknown[]
}

/** Placeholder for API contracts (future phase) */
export interface ApiContract {
  endpoints: unknown[]
}

/** Placeholder for sequence diagrams (future phase) */
export interface SequenceDiagram {
  steps: unknown[]
}

/** Default empty values for new artifact fields */
export const DEFAULT_PROJECT_NOTES: ProjectNotes = {
  functionalRequirements: [],
  nonFunctionalRequirements: [],
  assumptions: [],
  tradeoffs: [],
  freeformNotes: '',
}

export const DEFAULT_DATABASE_SCHEMA: DatabaseSchema = { tables: [], relationships: [] }
export const DEFAULT_API_CONTRACT: ApiContract = { endpoints: [] }
export const DEFAULT_SEQUENCE_DIAGRAM: SequenceDiagram = { steps: [] }

/** Serializable project format for save/load */
export interface ProjectData {
  id: string
  name: string
  description: string
  nodes: SystemNode[]
  edges: SystemEdge[]
  notes?: ProjectNotes
  estimations?: EstimationRow[]
  schemas?: DatabaseSchema
  apiContracts?: ApiContract
  sequences?: SequenceDiagram
  activeTab?: string
  createdAt: string
  updatedAt: string
}
