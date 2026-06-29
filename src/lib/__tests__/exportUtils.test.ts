import { describe, it, expect } from 'vitest'
import { formatJson, minifyJson, compareJson, sanitizeJsonInput } from '../exportUtils'

describe('formatJson', () => {
  it('should format JSON with indentation', () => {
    const input = '{"a":1,"b":2}'
    const result = formatJson(input)
    expect(result).toContain('\n')
    expect(result).toContain('  ')
  })

  it('should return input if invalid JSON', () => {
    const input = 'invalid'
    expect(formatJson(input)).toBe(input)
  })
})

describe('minifyJson', () => {
  it('should minify JSON', () => {
    const input = '{\n  "a": 1\n}'
    const result = minifyJson(input)
    expect(result).not.toContain('\n')
    expect(result).not.toContain(' ')
  })

  it('should return input if invalid JSON', () => {
    const input = 'invalid'
    expect(minifyJson(input)).toBe(input)
  })
})

describe('sanitizeJsonInput', () => {
  it('should return valid JSON unchanged', () => {
    const input = '{"a": 1}'
    expect(sanitizeJsonInput(input)).toBe(input)
  })

  it('should return invalid JSON unchanged', () => {
    const input = 'invalid'
    expect(sanitizeJsonInput(input)).toBe(input)
  })
})

describe('compareJson', () => {
  it('should detect added keys', () => {
    const a = '{"a": 1}'
    const b = '{"a": 1, "b": 2}'
    const diff = compareJson(a, b)
    expect(diff.added).toContain('b')
  })

  it('should detect removed keys', () => {
    const a = '{"a": 1, "b": 2}'
    const b = '{"a": 1}'
    const diff = compareJson(a, b)
    expect(diff.removed).toContain('b')
  })

  it('should detect changed keys', () => {
    const a = '{"a": 1}'
    const b = '{"a": 2}'
    const diff = compareJson(a, b)
    expect(diff.changed).toContain('a')
  })

  it('should return empty for identical JSONs', () => {
    const a = '{"a": 1}'
    const b = '{"a": 1}'
    const diff = compareJson(a, b)
    expect(diff.added).toHaveLength(0)
    expect(diff.removed).toHaveLength(0)
    expect(diff.changed).toHaveLength(0)
  })

  it('should handle nested paths', () => {
    const a = '{"a": {"b": 1}}'
    const b = '{"a": {"b": 2}}'
    const diff = compareJson(a, b)
    expect(diff.changed).toContain('a.b')
  })
})
