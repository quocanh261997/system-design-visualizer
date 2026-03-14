import { describe, it, expect } from 'vitest'
import { analyzeGraph } from '../analysis-engine'
import type { SystemNode, SystemEdge, ConnectionType, ComponentConfig } from '@/types'

/** Helper to create a minimal system node */
function makeNode(id: string, componentType: string, label: string, config: ComponentConfig = {}): SystemNode {
  return {
    id,
    type: 'system-component',
    position: { x: 0, y: 0 },
    data: { componentType, label, config },
  }
}

/** Helper to create a minimal edge */
function makeEdge(id: string, source: string, target: string, connectionType: ConnectionType = 'sync'): SystemEdge {
  return {
    id,
    source,
    target,
    type: 'typed-edge',
    data: { label: '', connectionType, latencyMs: 10 },
  }
}

describe('analyzeGraph', () => {
  it('returns no warnings for empty graph', () => {
    const warnings = analyzeGraph([], [])
    expect(warnings).toHaveLength(0)
  })

  it('detects single point of failure (DB without replicas)', () => {
    const nodes = [
      makeNode('server', 'web-server', 'Server', { instances: 1 }),
      makeNode('db', 'postgresql', 'PostgreSQL', { replicas: 0 }),
    ]
    const edges = [makeEdge('e1', 'server', 'db')]
    const warnings = analyzeGraph(nodes, edges)

    const spof = warnings.filter((w) => w.rule === 'single-point-of-failure')
    expect(spof.length).toBeGreaterThanOrEqual(1)
    expect(spof.some((w) => w.nodeIds.includes('db'))).toBe(true)
  })

  it('no SPOF warning when DB has replicas', () => {
    const nodes = [
      makeNode('server', 'web-server', 'Server', { instances: 3 }),
      makeNode('db', 'postgresql', 'PostgreSQL', { replicas: 2 }),
    ]
    const edges = [makeEdge('e1', 'server', 'db')]
    const warnings = analyzeGraph(nodes, edges)

    const spof = warnings.filter((w) => w.rule === 'single-point-of-failure')
    const dbSpof = spof.filter((w) => w.nodeIds.includes('db'))
    expect(dbSpof).toHaveLength(0)
  })

  it('detects missing cache before database', () => {
    const nodes = [
      makeNode('server', 'web-server', 'Server'),
      makeNode('db', 'postgresql', 'PostgreSQL'),
    ]
    const edges = [makeEdge('e1', 'server', 'db')]
    const warnings = analyzeGraph(nodes, edges)

    const cacheWarnings = warnings.filter((w) => w.rule === 'missing-cache')
    expect(cacheWarnings.length).toBeGreaterThanOrEqual(1)
  })

  it('no missing cache warning when cache exists on path', () => {
    const nodes = [
      makeNode('server', 'web-server', 'Server'),
      makeNode('cache', 'redis', 'Redis'),
      makeNode('db', 'postgresql', 'PostgreSQL'),
    ]
    const edges = [
      makeEdge('e1', 'server', 'cache'),
      makeEdge('e2', 'server', 'db'),
    ]
    const warnings = analyzeGraph(nodes, edges)

    const cacheWarnings = warnings.filter((w) => w.rule === 'missing-cache')
    expect(cacheWarnings).toHaveLength(0)
  })

  it('detects missing rate limiting on client connection', () => {
    const nodes = [
      makeNode('client', 'browser-client', 'Browser'),
      makeNode('server', 'web-server', 'Server'),
    ]
    const edges = [makeEdge('e1', 'client', 'server')]
    const warnings = analyzeGraph(nodes, edges)

    const rlWarnings = warnings.filter((w) => w.rule === 'missing-rate-limit')
    expect(rlWarnings.length).toBeGreaterThanOrEqual(1)
  })

  it('no rate limit warning when client goes through API gateway', () => {
    const nodes = [
      makeNode('client', 'browser-client', 'Browser'),
      makeNode('gw', 'api-gateway', 'API Gateway'),
      makeNode('server', 'web-server', 'Server'),
    ]
    const edges = [
      makeEdge('e1', 'client', 'gw'),
      makeEdge('e2', 'gw', 'server'),
    ]
    const warnings = analyzeGraph(nodes, edges)

    const rlWarnings = warnings.filter((w) => w.rule === 'missing-rate-limit')
    expect(rlWarnings).toHaveLength(0)
  })

  it('detects load balancer with single target', () => {
    const nodes = [
      makeNode('lb', 'load-balancer', 'LB'),
      makeNode('server', 'web-server', 'Server'),
    ]
    const edges = [makeEdge('e1', 'lb', 'server')]
    const warnings = analyzeGraph(nodes, edges)

    const lbWarnings = warnings.filter((w) => w.rule === 'unbalanced-load')
    expect(lbWarnings).toHaveLength(1)
  })

  it('detects sync connection to heavy I/O target', () => {
    const nodes = [
      makeNode('server', 'web-server', 'Server'),
      makeNode('storage', 'blob-storage', 'S3'),
    ]
    const edges = [makeEdge('e1', 'server', 'storage', 'sync')]
    const warnings = analyzeGraph(nodes, edges)

    const asyncWarnings = warnings.filter((w) => w.rule === 'missing-async')
    expect(asyncWarnings.length).toBeGreaterThanOrEqual(1)
  })

  it('no async warning when connection is already async', () => {
    const nodes = [
      makeNode('server', 'web-server', 'Server'),
      makeNode('storage', 'blob-storage', 'S3'),
    ]
    const edges = [makeEdge('e1', 'server', 'storage', 'async')]
    const warnings = analyzeGraph(nodes, edges)

    const asyncWarnings = warnings.filter((w) => w.rule === 'missing-async')
    expect(asyncWarnings).toHaveLength(0)
  })

  it('detects missing monitoring in a system with 3+ components', () => {
    const nodes = [
      makeNode('client', 'browser-client', 'Browser'),
      makeNode('server', 'web-server', 'Server'),
      makeNode('db', 'postgresql', 'PostgreSQL'),
    ]
    const edges = [
      makeEdge('e1', 'client', 'server'),
      makeEdge('e2', 'server', 'db'),
    ]
    const warnings = analyzeGraph(nodes, edges)

    const monWarnings = warnings.filter((w) => w.rule === 'missing-monitoring')
    expect(monWarnings).toHaveLength(1)
  })

  it('detects disconnected components', () => {
    const nodes = [
      makeNode('server', 'web-server', 'Server'),
      makeNode('orphan', 'redis', 'Orphan Cache'),
    ]
    const edges: SystemEdge[] = [] // no edges at all
    const warnings = analyzeGraph(nodes, edges)

    const discWarnings = warnings.filter((w) => w.rule === 'disconnected')
    expect(discWarnings).toHaveLength(2) // both are disconnected
  })

  it('sorts warnings by severity: errors first, then warnings, then info', () => {
    const nodes = [
      makeNode('client', 'browser-client', 'Browser'),
      makeNode('server', 'web-server', 'Server', { instances: 1 }),
      makeNode('storage', 'blob-storage', 'S3'),
    ]
    const edges = [
      makeEdge('e1', 'client', 'server'),
      makeEdge('e2', 'server', 'storage', 'sync'),
    ]
    const warnings = analyzeGraph(nodes, edges)

    // Verify sorted: all errors before warnings before info
    for (let i = 1; i < warnings.length; i++) {
      const order = { error: 0, warning: 1, info: 2 }
      expect(order[warnings[i].severity]).toBeGreaterThanOrEqual(order[warnings[i - 1].severity])
    }
  })
})
