import { Node, Edge } from '@xyflow/react'
import dagre from '@dagrejs/dagre'
import { JsonNode } from '@/types'
import { buildCards, findCardParentMap } from './treeBuilder'
import type { CardNodeData } from './treeBuilder'

export function buildGraph(
  jsonNode: JsonNode,
  collapsedPaths: Set<string> = new Set()
): { nodes: Node[]; edges: Edge[] } {
  const cards = buildCards(jsonNode, collapsedPaths)

  if (cards.length === 0) return { nodes: [], edges: [] }

  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({
    rankdir: 'LR',
    nodesep: 80,
    ranksep: 180,
    marginx: 100,
    marginy: 100,
  })

  const cardMap = new Map(cards.map((c) => [c.id, c]))
  const parentMap = findCardParentMap(cards)

  for (const card of cards) {
    dagreGraph.setNode(card.id, { width: card.width, height: card.height })
  }

  for (const card of cards) {
    for (const ref of card.childRefs) {
      if (cardMap.has(ref.childId) && !ref.isCollapsed) {
        dagreGraph.setEdge(card.id, ref.childId)
      }
    }
  }

  dagre.layout(dagreGraph)

  const nodes: Node[] = cards.map((card) => {
    const pos = dagreGraph.node(card.id)
    return {
      id: card.id,
      type: 'cardNode',
      position: {
        x: pos.x - card.width / 2,
        y: pos.y - card.height / 2,
      },
      data: card as unknown as Record<string, unknown>,
      draggable: true,
      deletable: false,
      selectable: false,
    }
  })

  const edges: Edge[] = []
  const edgeStyle = {
    stroke: '#555',
    strokeWidth: 1.5,
    opacity: 0.35,
  }

  for (const card of cards) {
    for (const ref of card.childRefs) {
      if (cardMap.has(ref.childId) && !ref.isCollapsed) {
        edges.push({
          id: `e-${card.id}-${ref.childId}`,
          source: card.id,
          target: ref.childId,
          type: 'default',
          style: edgeStyle,
          animated: false,
        })
      }
    }
  }

  return { nodes, edges }
}
