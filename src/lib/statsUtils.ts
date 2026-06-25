import { JsonNode, JsonStats } from '@/types'

export function computeStats(jsonNode: JsonNode, rawJson: string): JsonStats {
  let totalObjects = 0
  let totalArrays = 0
  let totalProperties = 0
  let totalStrings = 0
  let totalNumbers = 0
  let totalBooleans = 0
  let totalNulls = 0
  let maxDepth = 0
  const keys = new Set<string>()

  function traverse(node: JsonNode, depth: number) {
    maxDepth = Math.max(maxDepth, depth)

    switch (node.type) {
      case 'object':
        totalObjects++
        break
      case 'array':
        totalArrays++
        break
      case 'string':
        totalStrings++
        totalProperties++
        break
      case 'number':
        totalNumbers++
        totalProperties++
        break
      case 'boolean':
        totalBooleans++
        totalProperties++
        break
      case 'null':
        totalNulls++
        totalProperties++
        break
    }

    if (node.key) keys.add(node.key)

    for (const child of node.children) {
      traverse(child, depth + 1)
    }
  }

  traverse(jsonNode, 0)

  const fileSize = new TextEncoder().encode(rawJson).length

  const complexity = Math.round(
    (totalObjects + totalArrays) * 2 +
    totalProperties +
    maxDepth * 3 +
    (keys.size > 0 ? 1 : 0)
  )

  return {
    totalObjects,
    totalArrays,
    totalProperties,
    maxDepth,
    fileSize,
    complexity,
    totalStrings,
    totalNumbers,
    totalBooleans,
    totalNulls,
    uniqueKeys: keys.size,
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
