import type { SystemNode, SystemEdge } from '@/types'
import { componentDefinitionMap } from '@/data/component-definitions'

/** Severity levels for analysis warnings */
export type WarningSeverity = 'error' | 'warning' | 'info'

/** A single analysis finding */
export interface AnalysisWarning {
  id: string
  severity: WarningSeverity
  title: string
  description: string
  /** Node IDs related to this warning (for highlighting) */
  nodeIds: string[]
  /** Edge IDs related to this warning */
  edgeIds: string[]
  /** Rule that generated this warning */
  rule: string
}

/** An analysis rule function: takes graph, returns warnings */
type AnalysisRule = (nodes: SystemNode[], edges: SystemEdge[]) => AnalysisWarning[]

// ─── Helper utilities ───

function getComponentNodes(nodes: SystemNode[]) {
  return nodes.filter((n) => n.type === 'system-component')
}

function getNodesByCategory(nodes: SystemNode[], category: string) {
  return getComponentNodes(nodes).filter((n) => {
    const def = componentDefinitionMap.get(n.data.componentType)
    return def?.category === category
  })
}

function getOutEdges(nodeId: string, edges: SystemEdge[]) {
  return edges.filter((e) => e.source === nodeId)
}

function getInEdges(nodeId: string, edges: SystemEdge[]) {
  return edges.filter((e) => e.target === nodeId)
}

// ─── Rules ───

/** Detect single points of failure: components with no redundancy on critical path */
const spofRule: AnalysisRule = (nodes, edges) => {
  const warnings: AnalysisWarning[] = []
  const compNodes = getComponentNodes(nodes)

  for (const node of compNodes) {
    const def = componentDefinitionMap.get(node.data.componentType)
    if (!def) continue

    const inEdges = getInEdges(node.id, edges)
    const outEdges = getOutEdges(node.id, edges)

    // Skip leaf/entry nodes
    if (inEdges.length === 0 && outEdges.length === 0) continue

    // DB, cache, queue without replicas/instances > 1 and on a path
    const hasRedundancy =
      (node.data.config.replicas && Number(node.data.config.replicas) > 1) ||
      (node.data.config.instances && Number(node.data.config.instances) > 1) ||
      (node.data.config.replicaSet && Number(node.data.config.replicaSet) > 1) ||
      (node.data.config.cluster === true)

    // Only flag components that are intermediary (have both in and out edges)
    // or are critical sinks (databases, caches with in-edges)
    const isCritical = inEdges.length > 0 && (
      ['databases', 'caching', 'messaging', 'compute'].includes(def.category)
    )

    if (isCritical && !hasRedundancy) {
      warnings.push({
        id: `spof-${node.id}`,
        severity: 'warning',
        title: `Single point of failure: ${node.data.label}`,
        description: `${node.data.label} has no redundancy configured. Consider adding replicas or enabling cluster mode.`,
        nodeIds: [node.id],
        edgeIds: [],
        rule: 'single-point-of-failure',
      })
    }
  }
  return warnings
}

/** Detect missing cache: DB accessed directly from high-traffic paths without cache */
const missingCacheRule: AnalysisRule = (nodes, edges) => {
  const warnings: AnalysisWarning[] = []
  const dbNodes = getNodesByCategory(nodes, 'databases')
  const cacheTypes = new Set(['redis', 'memcached', 'app-cache'])

  for (const db of dbNodes) {
    const inEdges = getInEdges(db.id, edges)
    if (inEdges.length === 0) continue

    // Check if any source node also connects to a cache
    for (const edge of inEdges) {
      const sourceOutEdges = getOutEdges(edge.source, edges)
      const connectsToCache = sourceOutEdges.some((e) => {
        const targetNode = nodes.find((n) => n.id === e.target)
        return targetNode && cacheTypes.has(targetNode.data.componentType)
      })

      if (!connectsToCache) {
        const sourceNode = nodes.find((n) => n.id === edge.source)
        if (sourceNode && sourceNode.data.componentType !== 'worker') {
          warnings.push({
            id: `no-cache-${edge.source}-${db.id}`,
            severity: 'warning',
            title: `No cache before ${db.data.label}`,
            description: `${sourceNode.data.label} connects directly to ${db.data.label} without a caching layer. Consider adding Redis or Memcached.`,
            nodeIds: [edge.source, db.id],
            edgeIds: [edge.id],
            rule: 'missing-cache',
          })
        }
      }
    }
  }
  return warnings
}

/** Detect missing rate limiting on public-facing APIs */
const missingRateLimitRule: AnalysisRule = (nodes, edges) => {
  const warnings: AnalysisWarning[] = []
  const clientTypes = new Set(['browser-client', 'mobile-client', 'desktop-client', 'iot-device'])
  const rateLimiterTypes = new Set(['rate-limiter', 'api-gateway'])

  const clientNodes = getComponentNodes(nodes).filter((n) => clientTypes.has(n.data.componentType))

  for (const client of clientNodes) {
    const outEdges = getOutEdges(client.id, edges)
    for (const edge of outEdges) {
      const target = nodes.find((n) => n.id === edge.target)
      if (!target) continue

      // If client connects directly to something other than a rate limiter/API gateway
      if (!rateLimiterTypes.has(target.data.componentType)) {
        warnings.push({
          id: `no-ratelimit-${client.id}-${target.id}`,
          severity: 'error',
          title: `No rate limiting for ${target.data.label}`,
          description: `${client.data.label} connects directly to ${target.data.label} without rate limiting or an API gateway.`,
          nodeIds: [client.id, target.id],
          edgeIds: [edge.id],
          rule: 'missing-rate-limit',
        })
      }
    }
  }
  return warnings
}

/** Detect load balancer pointing to a single instance */
const unbalancedLoadRule: AnalysisRule = (nodes, edges) => {
  const warnings: AnalysisWarning[] = []
  const lbNodes = getComponentNodes(nodes).filter((n) => n.data.componentType === 'load-balancer')

  for (const lb of lbNodes) {
    const outEdges = getOutEdges(lb.id, edges)
    if (outEdges.length === 1) {
      const target = nodes.find((n) => n.id === outEdges[0].target)
      warnings.push({
        id: `unbalanced-${lb.id}`,
        severity: 'warning',
        title: `Load balancer with single target`,
        description: `${lb.data.label} only routes to ${target?.data.label ?? 'one server'}. Add more targets to distribute load.`,
        nodeIds: [lb.id, ...outEdges.map((e) => e.target)],
        edgeIds: outEdges.map((e) => e.id),
        rule: 'unbalanced-load',
      })
    }
  }
  return warnings
}

/** Detect long-running sync operations that should be async */
const missingAsyncRule: AnalysisRule = (nodes, edges) => {
  const warnings: AnalysisWarning[] = []
  const heavyTargets = new Set(['blob-storage', 'file-system', 'data-lake', 'elasticsearch'])

  for (const edge of edges) {
    const target = nodes.find((n) => n.id === edge.target)
    if (!target) continue

    if (
      heavyTargets.has(target.data.componentType) &&
      edge.data?.connectionType !== 'async'
    ) {
      const source = nodes.find((n) => n.id === edge.source)
      warnings.push({
        id: `sync-heavy-${edge.id}`,
        severity: 'info',
        title: `Consider async for ${target.data.label}`,
        description: `${source?.data.label ?? 'Source'} → ${target.data.label} uses synchronous connection. Heavy I/O operations benefit from async processing via a message queue.`,
        nodeIds: [edge.source, edge.target],
        edgeIds: [edge.id],
        rule: 'missing-async',
      })
    }
  }
  return warnings
}

/** Detect missing observability/monitoring */
const missingMonitoringRule: AnalysisRule = (nodes) => {
  const warnings: AnalysisWarning[] = []
  const compNodes = getComponentNodes(nodes)
  const monitoringTypes = new Set(['monitoring'])
  const hasMonitoring = compNodes.some((n) => monitoringTypes.has(n.data.componentType))

  if (compNodes.length >= 3 && !hasMonitoring) {
    warnings.push({
      id: 'no-monitoring',
      severity: 'info',
      title: 'No monitoring/observability',
      description: 'Your system has no monitoring component. Add Prometheus, Datadog, or similar for metrics and tracing.',
      nodeIds: [],
      edgeIds: [],
      rule: 'missing-monitoring',
    })
  }

  return warnings
}

/** Detect disconnected components (no edges at all) */
const disconnectedRule: AnalysisRule = (nodes, edges) => {
  const warnings: AnalysisWarning[] = []
  const compNodes = getComponentNodes(nodes)
  if (compNodes.length < 2) return warnings

  const connectedIds = new Set<string>()
  for (const edge of edges) {
    connectedIds.add(edge.source)
    connectedIds.add(edge.target)
  }

  for (const node of compNodes) {
    if (!connectedIds.has(node.id)) {
      warnings.push({
        id: `disconnected-${node.id}`,
        severity: 'info',
        title: `${node.data.label} is disconnected`,
        description: `${node.data.label} has no connections. Connect it to other components or remove it.`,
        nodeIds: [node.id],
        edgeIds: [],
        rule: 'disconnected',
      })
    }
  }
  return warnings
}

// ─── Engine ───

const ALL_RULES: AnalysisRule[] = [
  spofRule,
  missingCacheRule,
  missingRateLimitRule,
  unbalancedLoadRule,
  missingAsyncRule,
  missingMonitoringRule,
  disconnectedRule,
]

/** Run all analysis rules against the current graph and return warnings */
export function analyzeGraph(nodes: SystemNode[], edges: SystemEdge[]): AnalysisWarning[] {
  const warnings: AnalysisWarning[] = []
  for (const rule of ALL_RULES) {
    warnings.push(...rule(nodes, edges))
  }
  // Sort: errors first, then warnings, then info
  const order: Record<WarningSeverity, number> = { error: 0, warning: 1, info: 2 }
  warnings.sort((a, b) => order[a.severity] - order[b.severity])
  return warnings
}
