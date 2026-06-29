'use client'

import { useState } from 'react'

interface SchemaEditorProps {
  jsonInput: string
  onSchemaReady: (schema: string) => void
}

export function SchemaEditor({ jsonInput, onSchemaReady }: SchemaEditorProps) {
  const [enabled, setEnabled] = useState(false)

  const handleToggle = () => {
    if (!enabled) {
      try {
        const parsed = JSON.parse(jsonInput)
        const schema = inferSimpleSchema(parsed)
        onSchemaReady(JSON.stringify(schema))
      } catch {
        // ignore
      }
    }
    setEnabled(!enabled)
  }

  return (
    <button
      onClick={handleToggle}
      className={`px-2 py-1 text-xs rounded ${
        enabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}
    >
      {enabled ? 'Schema-Aware: ON' : 'Schema-Aware: OFF'}
    </button>
  )
}

function inferSimpleSchema(obj: unknown): Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) return {}

  if (Array.isArray(obj)) {
    const itemSchema = obj.length > 0 ? inferSimpleSchema(obj[0]) : {}
    return { type: 'array', items: itemSchema }
  }

  const properties: Record<string, unknown> = {}
  const required: string[] = []

  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    if (val !== null && val !== undefined) required.push(key)

    if (typeof val === 'string') properties[key] = { type: 'string' }
    else if (typeof val === 'number') properties[key] = { type: 'number' }
    else if (typeof val === 'boolean') properties[key] = { type: 'boolean' }
    else if (val === null) properties[key] = { type: 'null' }
    else if (Array.isArray(val)) {
      properties[key] = { type: 'array', items: val.length > 0 ? inferSimpleSchema(val[0]) : {} }
    } else {
      properties[key] = { type: 'object', properties: inferSimpleSchema(val) }
    }
  }

  return { type: 'object', properties, required }
}
