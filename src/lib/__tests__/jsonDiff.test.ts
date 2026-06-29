import { describe, it, expect } from 'vitest'
import { threeWayMerge, generatePatch } from '../jsonDiff'

describe('threeWayMerge', () => {
  it('should merge non-conflicting changes', () => {
    const original = '{"a": 1, "b": 2}'
    const modA = '{"a": 10, "b": 2}'
    const modB = '{"a": 1, "b": 20}'
    const result = JSON.parse(threeWayMerge(original, modA, modB))
    expect(result.a).toBe(10)
    expect(result.b).toBe(20)
  })

  it('should return original on parse error', () => {
    const result = threeWayMerge('invalid', '{}', '{}')
    expect(result).toBe('invalid')
  })
})

describe('generatePatch', () => {
  it('should generate add operations', () => {
    const from = '{"a": 1}'
    const to = '{"a": 1, "b": 2}'
    const patch = generatePatch(from, to)
    expect(patch.some((op) => op.op === 'add')).toBe(true)
  })

  it('should generate remove operations', () => {
    const from = '{"a": 1, "b": 2}'
    const to = '{"a": 1}'
    const patch = generatePatch(from, to)
    expect(patch.some((op) => op.op === 'remove')).toBe(true)
  })

  it('should generate replace operations', () => {
    const from = '{"a": 1}'
    const to = '{"a": 2}'
    const patch = generatePatch(from, to)
    expect(patch.some((op) => op.op === 'replace')).toBe(true)
  })
})
