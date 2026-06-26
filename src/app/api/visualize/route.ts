import { NextRequest, NextResponse } from 'next/server'
import { parseJson } from '@/lib/jsonParser'
import { buildCards, findCardParentMap } from '@/lib/treeBuilder'
import dagre from '@dagrejs/dagre'
import { computeStats } from '@/lib/statsUtils'
import { generateSchemas } from '@/lib/schemaGenerator'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const tokenFromQuery = request.nextUrl.searchParams.get('token')
  const apiToken = process.env.API_TOKEN

  if (apiToken) {
    const valid =
      (authHeader?.startsWith('Bearer ') && authHeader.slice(7) === apiToken) ||
      tokenFromQuery === apiToken

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado. Forneça o token via header Authorization: Bearer <token> ou query ?token=<token>' },
        { status: 401 }
      )
    }
  }

  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Corpo da requisição deve ser JSON válido' },
        { status: 400 }
      )
    }

    let jsonString: string
    if (typeof body === 'string') {
      jsonString = body
    } else if (body && typeof body === 'object' && 'json' in (body as Record<string, unknown>)) {
      const maybeJson = (body as Record<string, unknown>).json
      if (typeof maybeJson !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Campo "json" deve ser uma string' },
          { status: 400 }
        )
      }
      jsonString = maybeJson
    } else {
      jsonString = JSON.stringify(body)
    }

    JSON.parse(jsonString)

    const jsonNode = parseJson(jsonString)
    const collapsedPaths = new Set<string>()
    const cards = buildCards(jsonNode, collapsedPaths)

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

    const nodes = cards.map((card) => {
      const pos = dagreGraph.node(card.id)
      return {
        id: card.id,
        type: 'cardNode',
        position: {
          x: pos.x - card.width / 2,
          y: pos.y - card.height / 2,
        },
        data: card,
        draggable: true,
      }
    })

    const edges: Array<{ id: string; source: string; target: string; type: string }> = []
    for (const card of cards) {
      for (const ref of card.childRefs) {
        if (cardMap.has(ref.childId) && !ref.isCollapsed) {
          edges.push({
            id: `e-${card.id}-${ref.childId}`,
            source: card.id,
            target: ref.childId,
            type: 'default',
          })
        }
      }
    }

    const stats = computeStats(jsonNode, jsonString)
    const schema = generateSchemas(jsonString)

    return NextResponse.json({
      success: true,
      data: {
        nodes,
        edges,
        stats,
        schema,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
