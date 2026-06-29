import { describe, it, expect } from 'vitest'
import { generateSchemas } from '../schemaGenerator'

describe('generateSchemas', () => {
  it('should generate TypeScript interface', () => {
    const json = '{"name": "test", "age": 30}'
    const result = generateSchemas(json)
    expect(result.typescript).toContain('export interface Root')
    expect(result.typescript).toContain('name: string')
    expect(result.typescript).toContain('age: number')
  })

  it('should generate JSON Schema', () => {
    const json = '{"name": "test"}'
    const result = generateSchemas(json)
    expect(result.jsonSchema).toContain('http://json-schema.org/draft-07/schema#')
    expect(result.jsonSchema).toContain('"type": "object"')
    expect(result.jsonSchema).toContain('"type": "string"')
  })

  it('should generate Zod schema', () => {
    const json = '{"name": "test"}'
    const result = generateSchemas(json)
    expect(result.zod).toContain("import { z } from 'zod'")
    expect(result.zod).toContain('z.object({')
    expect(result.zod).toContain('name: z.string()')
  })

  it('should generate Prisma model', () => {
    const json = '{"title": "hello", "count": 42}'
    const result = generateSchemas(json)
    expect(result.prisma).toContain('model Root')
    expect(result.prisma).toContain('title  String')
    expect(result.prisma).toContain('count  Float')
  })

  it('should handle nested objects', () => {
    const json = '{"user": {"name": "John", "age": 30}}'
    const result = generateSchemas(json, 'User')
    expect(result.typescript).toContain('export interface User')
    expect(result.typescript).toContain('user:')
  })

  it('should handle arrays', () => {
    const json = '{"items": [1, 2, 3]}'
    const result = generateSchemas(json)
    expect(result.jsonSchema).toContain('"type": "array"')
  })
})
