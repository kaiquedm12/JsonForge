import { SchemaResult } from '@/types'

function toTSValue(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]'
    const types = [...new Set(value.map((v) => toTSValue(v)))]
    return `(${types.join(' | ')})[]`
  }
  if (typeof value === 'object') return toTSInterface(value as Record<string, unknown>, 'GeneratedType')
  return 'unknown'
}

function toTSInterface(obj: Record<string, unknown>, name: string): string {
  const lines: string[] = [`export interface ${name} {`]
  for (const [key, val] of Object.entries(obj)) {
    const tsType = toTSValue(val)
    const optional = val === null || val === undefined ? '?' : ''
    lines.push(`  ${key}${optional}: ${tsType}`)
  }
  lines.push('}')
  return lines.join('\n')
}

function toZodValue(value: unknown): string {
  if (value === null) return 'z.null()'
  if (typeof value === 'string') return 'z.string()'
  if (typeof value === 'number') return 'z.number()'
  if (typeof value === 'boolean') return 'z.boolean()'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'z.array(z.unknown())'
    return `z.array(${toZodValue(value[0])})`
  }
  if (typeof value === 'object') return toZodSchema(value as Record<string, unknown>)
  return 'z.unknown()'
}

function toZodSchema(obj: Record<string, unknown>): string {
  const lines: string[] = ['z.object({']
  const entries = Object.entries(obj)
  entries.forEach(([key, val], i) => {
    const comma = i < entries.length - 1 ? ',' : ''
    lines.push(`  ${key}: ${toZodValue(val)}${comma}`)
  })
  lines.push('})')
  return lines.join('\n')
}

function toPrismaField(value: unknown): string {
  if (value === null) return 'Json?'
  if (typeof value === 'string') return 'String'
  if (typeof value === 'number') return 'Float'
  if (typeof value === 'boolean') return 'Boolean'
  if (Array.isArray(value)) return 'Json'
  if (typeof value === 'object') return 'Json'
  return 'String'
}

function toPrismaModel(obj: Record<string, unknown>, name: string): string {
  const lines: string[] = [
    `model ${name} {`,
    '  id    Int     @id @default(autoincrement())',
  ]
  for (const [key, val] of Object.entries(obj)) {
    const fieldType = toPrismaField(val)
    lines.push(`  ${key}  ${fieldType}`)
  }
  lines.push('}')
  return lines.join('\n')
}

function toJSONSchema(obj: Record<string, unknown>): string {
  function buildSchema(value: unknown): Record<string, unknown> {
    if (value === null) return { type: 'null' }
    if (typeof value === 'string') return { type: 'string' }
    if (typeof value === 'number') return { type: 'number' }
    if (typeof value === 'boolean') return { type: 'boolean' }
    if (Array.isArray(value)) {
      if (value.length === 0) return { type: 'array', items: {} }
      return {
        type: 'array',
        items: buildSchema(value[0]),
      }
    }
    if (typeof value === 'object') {
      const properties: Record<string, unknown> = {}
      const required: string[] = []
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (v !== null && v !== undefined) required.push(k)
        properties[k] = buildSchema(v)
      }
      return {
        type: 'object',
        properties,
        ...(required.length > 0 ? { required } : {}),
      }
    }
    return {}
  }

  return JSON.stringify(
    {
      $schema: 'http://json-schema.org/draft-07/schema#',
      ...buildSchema(obj),
    },
    null,
    2
  )
}

export function generateSchemas(jsonString: string, rootName = 'Root'): SchemaResult {
  const parsed = JSON.parse(jsonString)

  const jsonSchema = toJSONSchema(parsed)
  const typescript = toTSInterface(parsed, rootName)
  const zod = `import { z } from 'zod'\n\nexport const ${rootName}Schema = ${toZodSchema(parsed)}`
  const prisma = toPrismaModel(parsed, rootName)

  return { jsonSchema, typescript, zod, prisma }
}

export { toJSONSchema, toTSInterface, toZodSchema, toPrismaModel }
