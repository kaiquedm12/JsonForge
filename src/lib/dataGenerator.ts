function randomString(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function randomNumber(min = 0, max = 1000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomBoolean(): boolean {
  return Math.random() > 0.5
}

function randomDate(): string {
  const start = new Date(2020, 0, 1)
  const end = new Date()
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString()
}

function randomEmail(): string {
  const domains = ['example.com', 'test.org', 'demo.net', 'sample.io']
  return `${randomString(6).toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`
}

function generateFromSchema(schema: unknown, depth = 0): unknown {
  if (depth > 5) return null

  if (typeof schema !== 'object' || schema === null) return null

  const s = schema as Record<string, unknown>

  if (s.type === 'string') {
    if (s.format === 'email' || s.format === 'email-address') return randomEmail()
    if (s.format === 'date-time' || s.format === 'date') return randomDate()
    if (s.enum && Array.isArray(s.enum)) {
      return s.enum[Math.floor(Math.random() * s.enum.length)]
    }
    if (s.pattern === '^\\d{3}-\\d{3}-\\d{4}$') {
      const n = () => Math.floor(Math.random() * 10)
      return `${n()}${n()}${n()}-${n()}${n()}${n()}-${n()}${n()}${n()}${n()}`
    }
    return randomString()
  }

  if (s.type === 'number' || s.type === 'integer') {
    if (s.minimum !== undefined && s.maximum !== undefined) {
      return randomNumber(s.minimum as number, s.maximum as number)
    }
    return randomNumber()
  }

  if (s.type === 'boolean') return randomBoolean()

  if (s.type === 'array') {
    const count = randomNumber(1, 3)
    return Array.from({ length: count }, () =>
      s.items ? generateFromSchema(s.items, depth + 1) : null
    )
  }

  if (s.type === 'object' || (!s.type && s.properties)) {
    const obj: Record<string, unknown> = {}
    if (s.properties && typeof s.properties === 'object') {
      for (const [key, propSchema] of Object.entries(s.properties as Record<string, unknown>)) {
        obj[key] = generateFromSchema(propSchema, depth + 1)
      }
    }
    return obj
  }

  return null
}

export function generateSampleData(schemaJson: string, count = 1): string {
  try {
    const schema = JSON.parse(schemaJson)
    const samples = Array.from({ length: count }, () => generateFromSchema(schema))
    const result = count === 1 ? samples[0] : samples
    return JSON.stringify(result, null, 2)
  } catch {
    return '{}'
  }
}
