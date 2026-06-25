import { JsonNode } from '@/types'

let nodeIdCounter = 0

function getNextId(): string {
  return `node-${++nodeIdCounter}`
}

function getType(value: unknown): JsonNode['type'] {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value as JsonNode['type']
}

function buildNode(value: unknown, key: string | null, path: string): JsonNode {
  const type = getType(value)
  const id = getNextId()

  const node: JsonNode = {
    id,
    type,
    key,
    value,
    path,
    children: [],
    collapsed: false,
  }

  if (type === 'object' && value !== null) {
    node.children = Object.entries(value as Record<string, unknown>).map(
      ([k, v]) => buildNode(v, k, `${path}.${k}`)
    )
  } else if (type === 'array') {
    node.children = (value as unknown[]).map((v, i) =>
      buildNode(v, String(i), `${path}[${i}]`)
    )
  }

  return node
}

export function parseJson(jsonString: string): JsonNode {
  nodeIdCounter = 0
  const parsed = JSON.parse(jsonString)
  return buildNode(parsed, null, '$')
}

export function stringifyJson(node: JsonNode): string {
  function toValue(n: JsonNode): unknown {
    if (n.type === 'object') {
      const obj: Record<string, unknown> = {}
      for (const child of n.children) {
        obj[child.key ?? ''] = toValue(child)
      }
      return obj
    }
    if (n.type === 'array') {
      return n.children.map(toValue)
    }
    return n.value
  }

  return JSON.stringify(toValue(node), null, 2)
}

export function toggleCollapse(node: JsonNode, path: string): JsonNode {
  if (node.path === path) {
    return { ...node, collapsed: !node.collapsed }
  }
  return {
    ...node,
    children: node.children.map((c) => toggleCollapse(c, path)),
  }
}

export function findValue(node: JsonNode, searchPath: string): unknown {
  if (node.path === searchPath) return node.value
  for (const child of node.children) {
    const result = findValue(child, searchPath)
    if (result !== undefined) return result
  }
  return undefined
}

export function searchNodes(
  node: JsonNode,
  query: string,
  type: 'key' | 'value' | 'path'
): string[] {
  const results: string[] = []
  const lowerQuery = query.toLowerCase()

  const match =
    (type === 'key' && node.key?.toLowerCase().includes(lowerQuery)) ||
    (type === 'value' &&
      typeof node.value === 'string' &&
      String(node.value).toLowerCase().includes(lowerQuery)) ||
    (type === 'path' && node.path.toLowerCase().includes(lowerQuery))

  if (match) results.push(node.path)

  for (const child of node.children) {
    results.push(...searchNodes(child, query, type))
  }

  return results
}
