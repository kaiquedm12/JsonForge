import { JsonNode } from '@/types'

export interface CardField {
  key: string
  type: 'string' | 'number' | 'boolean' | 'null'
  value: string
  path: string
}

export interface CardChildRef {
  key: string
  type: 'object' | 'array'
  childId: string
  childrenCount: number
  path: string
  isCollapsed: boolean
}

export interface CardNodeData {
  id: string
  key: string
  keyRaw: string | null
  path: string
  type: 'object' | 'array'
  fields: CardField[]
  childRefs: CardChildRef[]
  depth: number
  childrenCount: number
  isCollapsed: boolean
  width: number
  height: number
}

const HEADER_HEIGHT = 66
const DIVIDER_HEIGHT = 1
const CONTENT_PADDING = 16
const ROW_HEIGHT = 24
const EMPTY_HEIGHT = 42
const SEPARATOR_HEIGHT = 9

const MIN_WIDTH = 260
const MAX_WIDTH = 520
const PADDING = 32
const BADGE_WIDTH = 70
const GAP = 8
const CHILD_ARROW = 20

function estimateTextWidth(text: string, px: number, bold = false): number {
  const avg = bold ? 0.65 : 0.6
  return text.length * px * avg
}

function estimateCardHeight(fieldsCount: number, childRefsCount: number, isCollapsed: boolean): number {
  const visibleRefs = isCollapsed ? 0 : childRefsCount

  if (fieldsCount === 0 && visibleRefs === 0) {
    return HEADER_HEIGHT + EMPTY_HEIGHT
  }

  let height = HEADER_HEIGHT + DIVIDER_HEIGHT + CONTENT_PADDING
  height += fieldsCount * ROW_HEIGHT
  height += visibleRefs * ROW_HEIGHT
  if (fieldsCount > 0 && visibleRefs > 0) {
    height += SEPARATOR_HEIGHT
  }
  return height
}

function estimateCardWidth(
  key: string,
  fields: CardField[],
  childRefs: CardChildRef[]
): number {
  let maxWidth = estimateTextWidth(key, 15, true)

  for (const f of fields) {
    const keyW = estimateTextWidth(f.key, 12)
    const valW = estimateTextWidth(String(f.value), 11)
    maxWidth = Math.max(maxWidth, keyW + BADGE_WIDTH + GAP + valW)
  }

  for (const r of childRefs) {
    const keyW = estimateTextWidth(r.key, 12)
    const countText = `${r.childrenCount} ${r.type === 'array' ? 'items' : 'keys'}`
    const countW = estimateTextWidth(countText, 11)
    maxWidth = Math.max(maxWidth, keyW + BADGE_WIDTH + GAP + countW + CHILD_ARROW)
  }

  return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, maxWidth + PADDING))
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + '...' : str
}

function formatKey(key: string | null): string {
  if (key === null) return 'root'
  if (/^\d+$/.test(key)) return `[${key}]`
  return key
}

function getValuePreview(node: JsonNode): string {
  if (node.type === 'null') return 'null'
  if (node.type === 'string') return truncate(String(node.value), 45)
  if (node.type === 'number') return String(node.value)
  if (node.type === 'boolean') return String(node.value)
  return ''
}

export function buildCards(
  node: JsonNode,
  collapsedPaths: Set<string>,
  parentChildRefs: CardChildRef[] | null = null,
  depth = 0
): CardNodeData[] {
  const isCollapsed = collapsedPaths.has(node.path)
  const cards: CardNodeData[] = []

  if (node.type !== 'object' && node.type !== 'array') {
    return cards
  }

  const fields: CardField[] = []
  const childRefs: CardChildRef[] = []

  for (const child of node.children) {
    if (child.type === 'object' || child.type === 'array') {
      childRefs.push({
        key: child.key ?? '?',
        type: child.type,
        childId: `card-${child.id}`,
        childrenCount: child.children.length,
        path: child.path,
        isCollapsed: collapsedPaths.has(child.path),
      })
    } else {
      fields.push({
        key: child.key ?? '?',
        type: child.type,
        value: getValuePreview(child),
        path: child.path,
      })
    }
  }

  const cardKey = formatKey(node.key)

  cards.push({
    id: `card-${node.id}`,
    key: cardKey,
    keyRaw: node.key,
    path: node.path,
    type: node.type,
    fields,
    childRefs,
    depth,
    childrenCount: node.children.length,
    isCollapsed,
    width: estimateCardWidth(cardKey, fields, childRefs),
    height: estimateCardHeight(fields.length, childRefs.length, isCollapsed),
  })

  if (!isCollapsed) {
    for (const child of node.children) {
      if (child.type === 'object' || child.type === 'array') {
        const childCards = buildCards(child, collapsedPaths, null, depth + 1)
        cards.push(...childCards)
      }
    }
  }

  return cards
}

export function findCardParentMap(cards: CardNodeData[]): Map<string, string> {
  const parentMap = new Map<string, string>()
  const cardById = new Map(cards.map((c) => [c.id, c]))

  for (const card of cards) {
    for (const ref of card.childRefs) {
      if (cardById.has(ref.childId)) {
        parentMap.set(ref.childId, card.id)
      }
    }
  }

  return parentMap
}
