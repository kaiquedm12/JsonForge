import { describe, it, expect } from 'vitest'
import { validateJsonAgainstSchema, inferSchemaFromJson } from '../schemaValidator'

describe('validateJsonAgainstSchema', () => {
  it('should validate a valid JSON against schema', () => {
    const json = '{"name": "John", "age": 30}'
    const schema = JSON.stringify({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      required: ['name', 'age'],
    })
    const result = validateJsonAgainstSchema(json, schema)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should detect validation errors', () => {
    const json = '{"name": 42}'
    const schema = JSON.stringify({
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    })
    const result = validateJsonAgainstSchema(json, schema)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should detect missing required fields', () => {
    const json = '{"name": "John"}'
    const schema = JSON.stringify({
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
      },
      required: ['name', 'email'],
    })
    const result = validateJsonAgainstSchema(json, schema)
    expect(result.valid).toBe(false)
  })

  it('should handle invalid JSON', () => {
    const result = validateJsonAgainstSchema('invalid', '{}')
    expect(result.valid).toBe(false)
  })

  it('should handle invalid schema', () => {
    const result = validateJsonAgainstSchema('{}', 'invalid')
    expect(result.valid).toBe(false)
  })
})

describe('inferSchemaFromJson', () => {
  it('should infer schema from simple object', () => {
    const json = '{"name": "test", "age": 30}'
    const schema = inferSchemaFromJson(json)
    const parsed = JSON.parse(schema)
    expect(parsed.type).toBe('object')
    expect(parsed.properties.name.type).toBe('string')
    expect(parsed.properties.age.type).toBe('number')
  })

  it('should include required fields', () => {
    const json = '{"a": 1, "b": null}'
    const schema = JSON.parse(inferSchemaFromJson(json))
    expect(schema.required).toContain('a')
    expect(schema.required).not.toContain('b')
  })
})
