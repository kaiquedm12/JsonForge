import { describe, it, expect } from 'vitest'
import { queryJsonPath, formatQueryPath } from '../jsonQuery'

describe('queryJsonPath', () => {
  const json = '{"store": {"books": [{"title": "A", "price": 10}, {"title": "B", "price": 20}]}}'

  it('should query root', () => {
    const results = queryJsonPath(json, '$')
    expect(results).toHaveLength(1)
  })

  it('should query nested property', () => {
    const results = queryJsonPath(json, '$.store.books')
    expect(results).toHaveLength(1)
  })

  it('should query all titles', () => {
    const results = queryJsonPath(json, '$..title')
    expect(results.length).toBeGreaterThanOrEqual(2)
  })

  it('should return empty for invalid path', () => {
    const results = queryJsonPath(json, '$.nonexistent')
    expect(results).toHaveLength(0)
  })

  it('should return empty for invalid JSON', () => {
    const results = queryJsonPath('invalid', '$')
    expect(results).toHaveLength(0)
  })
})

describe('formatQueryPath', () => {
  it('should add $ prefix', () => {
    expect(formatQueryPath('store.books')).toBe('$.store.books')
  })

  it('should not add $ if already present', () => {
    expect(formatQueryPath('$.store')).toBe('$.store')
  })
})
