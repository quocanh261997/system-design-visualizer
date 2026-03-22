import { describe, it, expect, beforeEach } from 'vitest'
import { copyToClipboard, pasteFromClipboard, hasClipboardData, clearClipboard } from '../clipboard'
import type { SystemNode, SystemEdge } from '@/types'

function makeNode(id: string, x = 0, y = 0): SystemNode {
  return {
    id,
    type: 'system-component',
    position: { x, y },
    data: { componentType: 'api-gateway', label: `Node ${id}`, config: {} },
  }
}

function makeEdge(id: string, source: string, target: string): SystemEdge {
  return {
    id,
    source,
    target,
    type: 'typed-edge',
    data: { label: 'test', connectionType: 'sync', protocol: 'REST', latencyMs: 10 },
  }
}

beforeEach(() => {
  clearClipboard()
})

describe('copyToClipboard', () => {
  it('stores nodes and filters edges to internal only', () => {
    const nodes = [makeNode('a', 10, 20), makeNode('b', 30, 40)]
    const edges = [
      makeEdge('e1', 'a', 'b'),
      makeEdge('e2', 'a', 'external'),
    ]
    copyToClipboard(nodes, edges)
    expect(hasClipboardData()).toBe(true)

    const result = pasteFromClipboard()!
    expect(result.nodes).toHaveLength(2)
    expect(result.edges).toHaveLength(1)
  })

  it('no-ops on empty node array', () => {
    copyToClipboard([], [])
    expect(hasClipboardData()).toBe(false)
    expect(pasteFromClipboard()).toBeNull()
  })
})

describe('pasteFromClipboard', () => {
  it('generates new IDs for nodes and edges', () => {
    copyToClipboard([makeNode('a')], [])
    const result = pasteFromClipboard()!
    expect(result.nodes[0].id).not.toBe('a')
    expect(result.nodes[0].id).toMatch(/^node-/)
  })

  it('offsets position by 50px per paste', () => {
    copyToClipboard([makeNode('a', 100, 200)], [])

    const first = pasteFromClipboard()!
    expect(first.nodes[0].position).toEqual({ x: 150, y: 250 })

    const second = pasteFromClipboard()!
    expect(second.nodes[0].position).toEqual({ x: 200, y: 300 })
  })

  it('remaps edge source/target to new node IDs', () => {
    const nodes = [makeNode('a'), makeNode('b')]
    const edges = [makeEdge('e1', 'a', 'b')]
    copyToClipboard(nodes, edges)

    const result = pasteFromClipboard()!
    const newNodeIds = result.nodes.map((n) => n.id)
    expect(newNodeIds).not.toContain('a')
    expect(newNodeIds).not.toContain('b')
    expect(newNodeIds).toContain(result.edges[0].source)
    expect(newNodeIds).toContain(result.edges[0].target)
  })

  it('preserves edge data', () => {
    const nodes = [makeNode('a'), makeNode('b')]
    const edges = [makeEdge('e1', 'a', 'b')]
    copyToClipboard(nodes, edges)

    const result = pasteFromClipboard()!
    expect(result.edges[0].data?.connectionType).toBe('sync')
    expect(result.edges[0].data?.protocol).toBe('REST')
    expect(result.edges[0].type).toBe('typed-edge')
  })

  it('marks pasted nodes as selected', () => {
    copyToClipboard([makeNode('a')], [])
    const result = pasteFromClipboard()!
    expect(result.nodes[0].selected).toBe(true)
  })

  it('returns null when clipboard is empty', () => {
    expect(pasteFromClipboard()).toBeNull()
  })

  it('preserves relative positions between nodes', () => {
    const nodes = [makeNode('a', 100, 100), makeNode('b', 200, 300)]
    copyToClipboard(nodes, [])

    const result = pasteFromClipboard()!
    const dx = result.nodes[1].position.x - result.nodes[0].position.x
    const dy = result.nodes[1].position.y - result.nodes[0].position.y
    expect(dx).toBe(100)
    expect(dy).toBe(200)
  })
})
