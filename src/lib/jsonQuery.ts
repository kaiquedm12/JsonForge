import { JSONPath } from 'jsonpath-plus'
import { QueryResult } from '@/types'

export function queryJsonPath(json: string, path: string): QueryResult[] {
  try {
    const parsed = JSON.parse(json)
    const results = JSONPath({ path, json: parsed })
    return results.map((value: unknown, i: number) => ({
      path: `${path}[${i}]`,
      value,
    }))
  } catch {
    return []
  }
}

export function formatQueryPath(raw: string): string {
  let path = raw.trim()
  if (!path.startsWith('$')) {
    path = `$.${path}`
  }
  return path
}

export const QUERY_EXAMPLES = [
  { label: 'Root object', query: '$' },
  { label: 'All keys at root', query: '$.*' },
  { label: 'Nested property', query: '$.store.book' },
  { label: 'Array items', query: '$.items[*]' },
  { label: 'Filter by value', query: '$.books[?(@.price < 10)]' },
  { label: 'Wildcard', query: '$..title' },
  { label: 'Array length', query: '$.items.length' },
  { label: 'First element', query: '$.items[0]' },
]
