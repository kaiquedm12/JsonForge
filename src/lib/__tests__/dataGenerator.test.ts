import { describe, it, expect } from 'vitest'
import { generateSampleData } from '../dataGenerator'

describe('generateSampleData', () => {
  it('should generate data from simple object schema', () => {
    const schema = JSON.stringify({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        active: { type: 'boolean' },
      },
    })
    const result = JSON.parse(generateSampleData(schema))
    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('age')
    expect(result).toHaveProperty('active')
    expect(typeof result.name).toBe('string')
    expect(typeof result.active).toBe('boolean')
  })

  it('should generate multiple records', () => {
    const schema = JSON.stringify({
      type: 'object',
      properties: { id: { type: 'number' } },
    })
    const result = JSON.parse(generateSampleData(schema, 3))
    expect(result).toHaveLength(3)
  })

  it('should handle invalid schema', () => {
    const result = generateSampleData('invalid')
    expect(result).toBe('{}')
  })
})
