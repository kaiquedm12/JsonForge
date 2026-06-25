import { ConversionResult } from '@/types'

function toYAML(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent)
  if (value === null) return 'null'
  if (typeof value === 'string') {
    if (value.includes(': ') || value.includes('#') || value.includes('\n')) {
      return `"${value.replace(/"/g, '\\"')}"`
    }
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return '\n' + value.map((v) => `${pad}- ${toYAML(v, indent + 1).trimStart()}`).join('\n')
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    return '\n' + entries
      .map(([k, v]) => `${pad}${k}: ${toYAML(v, indent + 1).trimStart()}`)
      .join('\n')
  }
  return String(value)
}

function toXML(value: unknown, name = 'root'): string {
  if (value === null) return `<${name}/>`
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return `<${name}>${String(value)}</${name}>`
  }
  if (Array.isArray(value)) {
    return value.map((v) => toXML(v, name)).join('\n')
  }
  if (typeof value === 'object') {
    const children = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => toXML(v, k))
      .join('\n')
    return `<${name}>\n${children}\n</${name}>`
  }
  return ''
}

function toCSV(value: unknown): string {
  if (typeof value !== 'object' || value === null) return String(value)
  const obj = value as Record<string, unknown>
  const headers = Object.keys(obj)
  const rows = [headers.join(',')]

  function flatten(v: unknown, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {}
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        const key = prefix ? `${prefix}.${k}` : k
        if (typeof val === 'object' && val !== null) {
          Object.assign(result, flatten(val, key))
        } else {
          result[key] = String(val)
        }
      }
    } else {
      result[prefix || 'value'] = String(v)
    }
    return result
  }

  const flat = flatten(obj)
  const cols = Object.keys(flat)
  rows.push(cols.map((c) => `"${String(flat[c]).replace(/"/g, '""')}"`).join(','))
  return rows.join('\n')
}

function toTOML(value: unknown): string {
  function serialize(v: unknown, prefix = ''): string {
    if (v === null) return `${prefix} = null`
    if (typeof v === 'string') return `${prefix} = "${v.replace(/"/g, '\\"')}"`
    if (typeof v === 'number' || typeof v === 'boolean') return `${prefix} = ${v}`
    if (Array.isArray(v)) {
      return `${prefix} = [${v.map((item) => {
        if (typeof item === 'string') return `"${item}"`
        return String(item)
      }).join(', ')}]`
    }
    if (typeof v === 'object') {
      const lines: string[] = []
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        const key = prefix ? `${prefix}.${k}` : k
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          lines.push(`[${key}]`)
          lines.push(serialize(val, key))
        } else {
          lines.push(serialize(val, key))
        }
      }
      return lines.join('\n')
    }
    return ''
  }
  return serialize(value).replace(/^\[.*\]\n/gm, '')
}

export function convertJson(jsonString: string): ConversionResult {
  const parsed = JSON.parse(jsonString)
  return {
    yaml: toYAML(parsed).trim(),
    xml: '<?xml version="1.0" encoding="UTF-8"?>\n' + toXML(parsed),
    csv: toCSV(parsed),
    toml: toTOML(parsed),
  }
}
