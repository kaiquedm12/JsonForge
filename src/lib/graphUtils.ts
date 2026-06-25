import { Node, Edge } from '@xyflow/react'
import dagre from '@dagrejs/dagre'
import { JsonNode } from '@/types'

const NODE_WIDTH = 260
const NODE_HEIGHT = 50

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + '...' : str
}

function formatKey(key: string | null): string {
  if (key === null) return 'root'
  if (/^\d+$/.test(key)) return `[${key}]`
  return key
}

function getValuePreview(node: JsonNode): string {
  if (node.type === 'object') return `{${node.children.length}}`
  if (node.type === 'array') return `[${node.children.length}]`
  if (node.type === 'null') return 'null'
  if (node.type === 'string') return truncate(String(node.value), 60)
  if (node.type === 'number') return String(node.value)
  if (node.type === 'boolean') return String(node.value)
  return ''
}

const typeHexColors: Record<string, string> = {
  object: '#3b82f6',
  array: '#8b5cf6',
  string: '#10b981',
  number: '#f59e0b',
  boolean: '#ef4444',
  null: '#71717a',
}

export function buildGraph(
  jsonNode: JsonNode,
  collapsedPaths: Set<string> = new Set()
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({
    rankdir: 'LR',
    nodesep: 50,
    ranksep: 120,
    marginx: 40,
    marginy: 40,
  })

  const nodes: Node[] = []
  const edges: Edge[] = []
  let maxDepth = 0

  function traverse(node: JsonNode, parentId: string | null, depth: number): string {
    const isCollapsed = collapsedPaths.has(node.path)
    const id = `n-${node.id}`
    const color = typeHexColors[node.type] ?? '#71717a'
    const valuePreview = getValuePreview(node)
    maxDepth = Math.max(maxDepth, depth)

    dagreGraph.setNode(id, { width: NODE_WIDTH, height: NODE_HEIGHT })

    nodes.push({
      id,
      type: 'jsonNode',
      position: { x: 0, y: 0 },
      data: {
        label: formatKey(node.key),
        type: node.type,
        value: valuePreview,
        path: node.path,
        color,
        depth,
        hasChildren: node.children.length > 0,
        isCollapsed,
        childrenCount: node.children.length,
      },
      draggable: true,
    })

    if (parentId) {
      dagreGraph.setEdge(parentId, id)
      edges.push({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'smoothstep',
        style: { stroke: '#888', strokeWidth: 1.5, opacity: 0.35 },
      })
    }

    if (!isCollapsed) {
      for (const child of node.children) {
        traverse(child, id, depth + 1)
      }
    }

    return id
  }

  traverse(jsonNode, null, 0)

  if (nodes.length > 0) {
    dagre.layout(dagreGraph)
  }

  for (const node of nodes) {
    const pos = dagreGraph.node(node.id)
    if (pos) {
      node.position = {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      }
    }
  }

  return { nodes, edges }
}
