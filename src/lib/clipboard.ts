import { v4 as uuid } from 'uuid'
import type { SystemNode, SystemEdge } from '@/types'

interface ClipboardData {
  nodes: SystemNode[]
  edges: SystemEdge[]
  pasteCount: number
}

let clipboard: ClipboardData | null = null

export function copyToClipboard(nodes: SystemNode[], edges: SystemEdge[]): void {
  if (nodes.length === 0) return

  const nodeIds = new Set(nodes.map((n) => n.id))
  const internalEdges = edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  )

  clipboard = {
    nodes: structuredClone(nodes),
    edges: structuredClone(internalEdges),
    pasteCount: 0,
  }
}

export function pasteFromClipboard(): { nodes: SystemNode[]; edges: SystemEdge[] } | null {
  if (!clipboard || clipboard.nodes.length === 0) return null

  clipboard.pasteCount++
  const offset = 50 * clipboard.pasteCount

  const idMap = new Map<string, string>()
  for (const node of clipboard.nodes) {
    idMap.set(node.id, `node-${uuid()}`)
  }
  for (const edge of clipboard.edges) {
    idMap.set(edge.id, `edge-${uuid()}`)
  }

  const nodes: SystemNode[] = clipboard.nodes.map((n) => ({
    ...structuredClone(n),
    id: idMap.get(n.id)!,
    position: { x: n.position.x + offset, y: n.position.y + offset },
    selected: true,
  }))

  const edges: SystemEdge[] = clipboard.edges.map((e) => ({
    ...structuredClone(e),
    id: idMap.get(e.id)!,
    source: idMap.get(e.source)!,
    target: idMap.get(e.target)!,
  }))

  return { nodes, edges }
}

export function hasClipboardData(): boolean {
  return clipboard !== null && clipboard.nodes.length > 0
}

export function clearClipboard(): void {
  clipboard = null
}
