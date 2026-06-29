import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { ValidationResult, ValidationError } from '@/types'

const ajv = new Ajv({ allErrors: true, verbose: true })
addFormats(ajv)

export function validateJsonAgainstSchema(
  json: string,
  schema: string
): ValidationResult {
  try {
    const parsedJson = JSON.parse(json)
    const parsedSchema = JSON.parse(schema)
    const validate = ajv.compile(parsedSchema)
    const valid = validate(parsedJson)

    if (valid) {
      return { valid: true, errors: [] }
    }

    const errors: ValidationError[] = (validate.errors || []).map((err) => ({
      path: err.instancePath || '/',
      message: err.message || 'Unknown error',
      keyword: err.keyword || 'error',
    }))

    return { valid: false, errors }
  } catch (e) {
    return {
      valid: false,
      errors: [
        {
          path: '/',
          message: e instanceof Error ? e.message : 'Invalid JSON or Schema',
          keyword: 'parse',
        },
      ],
    }
  }
}

export function inferSchemaFromJson(json: string): string {
  const parsed = JSON.parse(json)

  function infer(value: unknown): unknown {
    if (value === null) return { type: 'null' }
    if (typeof value === 'string') return { type: 'string' }
    if (typeof value === 'number') return { type: 'number' }
    if (typeof value === 'boolean') return { type: 'boolean' }
    if (Array.isArray(value)) {
      if (value.length === 0) return { type: 'array', items: {} }
      const itemTypes = [...new Set(value.map((v) => JSON.stringify(infer(v))))]
      return {
        type: 'array',
        items: JSON.parse(itemTypes[0] || '{}'),
      }
    }
    if (typeof value === 'object') {
      const properties: Record<string, unknown> = {}
      const required: string[] = []
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        properties[k] = infer(v)
        if (v !== null && v !== undefined) required.push(k)
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
      ...(infer(parsed) as Record<string, unknown>),
    },
    null,
    2
  )
}
