import { compareJson, getAllKeys } from './exportUtils'
import { PatchOperation } from '@/types'

export function threeWayMerge(
  original: string,
  modifiedA: string,
  modifiedB: string
): string {
  try {
    const orig = JSON.parse(original)
    const a = JSON.parse(modifiedA)
    const b = JSON.parse(modifiedB)

    function merge(obj1: unknown, obj2: unknown, base: unknown): unknown {
      if (
        typeof obj1 !== 'object' || obj1 === null ||
        typeof obj2 !== 'object' || obj2 === null ||
        typeof base !== 'object' || base === null
      ) {
        return obj1 !== base ? obj1 : obj2
      }

      const result: Record<string, unknown> = {}
      const allKeys = new Set([
        ...Object.keys(obj1 as Record<string, unknown>),
        ...Object.keys(obj2 as Record<string, unknown>),
        ...Object.keys(base as Record<string, unknown>),
      ])

      for (const key of allKeys) {
        const val1 = (obj1 as Record<string, unknown>)[key]
        const val2 = (obj2 as Record<string, unknown>)[key]
        const baseVal = (base as Record<string, unknown>)[key]

        if (val1 === undefined && val2 === undefined) continue
        if (val1 === undefined) { result[key] = val2; continue }
        if (val2 === undefined) { result[key] = val1; continue }

        if (val1 === val2) {
          result[key] = val1
        } else if (val1 === baseVal) {
          result[key] = val2
        } else if (val2 === baseVal) {
          result[key] = val1
        } else {
          result[key] = merge(val1, val2, baseVal)
        }
      }

      return result
    }

    return JSON.stringify(merge(a, b, orig), null, 2)
  } catch {
    return original
  }
}

export function generatePatch(from: string, to: string): PatchOperation[] {
  const ops: PatchOperation[] = []
  try {
    const fromObj = JSON.parse(from)
    const toObj = JSON.parse(to)

    const fromKeys = getAllKeys(fromObj).map(normalizeKey)
    const toKeys = getAllKeys(toObj).map(normalizeKey)

    const fromSet = new Set(fromKeys)
    const toSet = new Set(toKeys)

    for (const key of toKeys) {
      if (!fromSet.has(key)) {
        ops.push({
          op: 'add',
          path: `/${key.replace(/\./g, '/')}`,
          value: getNestedValue(toObj, key),
        })
      }
    }

    for (const key of fromKeys) {
      if (!toSet.has(key)) {
        ops.push({
          op: 'remove',
          path: `/${key.replace(/\./g, '/')}`,
        })
      } else {
        const fromVal = JSON.stringify(getNestedValue(fromObj, key))
        const toVal = JSON.stringify(getNestedValue(toObj, key))
        if (fromVal !== toVal) {
          ops.push({
            op: 'replace',
            path: `/${key.replace(/\./g, '/')}`,
            value: getNestedValue(toObj, key),
          })
        }
      }
    }
  } catch {
    // return partial results
  }
  return ops
}

function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split(/[.[\]]/).filter(Boolean)
  let current = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

function normalizeKey(key: string): string {
  return key.replace(/\[(\d+)\]/g, '.$1')
}

export { getAllKeys, compareJson }
