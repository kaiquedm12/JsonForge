import { describe, it, expect } from 'vitest'
import { computeStats, formatFileSize } from '../statsUtils'
import { parseJson } from '../jsonParser'

describe('computeStats', () => {
  it('should compute stats for a simple object', () => {
    const json = '{"name": "test", "age": 30, "active": true}'
    const node = parseJson(json)
    const stats = computeStats(node, json)
    expect(stats.totalObjects).toBe(1)
    expect(stats.totalProperties).toBe(3)
    expect(stats.totalStrings).toBe(1)
    expect(stats.totalNumbers).toBe(1)
    expect(stats.totalBooleans).toBe(1)
    expect(stats.totalNulls).toBe(0)
    expect(stats.uniqueKeys).toBe(3)
    expect(stats.maxDepth).toBe(1)
  })

  it('should compute stats for nested objects', () => {
    const json = '{"a": {"b": 1, "c": "hello"}, "d": [1, 2, 3]}'
    const node = parseJson(json)
    const stats = computeStats(node, json)
    expect(stats.totalObjects).toBe(2)
    expect(stats.totalArrays).toBe(1)
    expect(stats.maxDepth).toBe(2)
    expect(stats.uniqueKeys).toBeGreaterThanOrEqual(3)
  })

  it('should compute file size correctly', () => {
    const json = '{"a": 1}'
    const node = parseJson(json)
    const stats = computeStats(node, json)
    expect(stats.fileSize).toBe(new TextEncoder().encode(json).length)
  })

  it('should handle arrays with nulls and booleans', () => {
    const json = '{"items": [null, true, false, "text"]}'
    const node = parseJson(json)
    const stats = computeStats(node, json)
    expect(stats.totalArrays).toBe(1)
    expect(stats.totalNulls).toBe(1)
    expect(stats.totalBooleans).toBe(2)
    expect(stats.totalStrings).toBe(1)
    expect(stats.totalProperties).toBe(4)
  })

  it('should compute complexity score', () => {
    const json = '{"a": 1, "b": {"c": 2}}'
    const node = parseJson(json)
    const stats = computeStats(node, json)
    expect(stats.complexity).toBeGreaterThan(0)
  })
})

describe('formatFileSize', () => {
  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 B')
  })

  it('should format kilobytes', () => {
    expect(formatFileSize(2048)).toBe('2.0 KB')
  })

  it('should format megabytes', () => {
    expect(formatFileSize(2097152)).toBe('2.0 MB')
  })
})
