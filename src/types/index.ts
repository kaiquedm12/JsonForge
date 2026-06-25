export interface JsonNode {
  id: string
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  key: string | null
  value: unknown
  path: string
  children: JsonNode[]
  collapsed?: boolean
}

export interface JsonGraphNode {
  id: string
  type: 'object' | 'array' | 'value'
  label: string
  path: string
  depth: number
  data: JsonNode
}

export interface JsonGraphEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface JsonStats {
  totalObjects: number
  totalArrays: number
  totalProperties: number
  maxDepth: number
  fileSize: number
  complexity: number
  totalStrings: number
  totalNumbers: number
  totalBooleans: number
  totalNulls: number
  uniqueKeys: number
}

export interface HistoryEntry {
  id: string
  json: string
  timestamp: number
  label: string
  type: 'manual' | 'auto' | 'snapshot'
}

export interface SchemaResult {
  jsonSchema: string
  typescript: string
  zod: string
  prisma: string
}

export interface ConversionResult {
  yaml: string
  xml: string
  csv: string
  toml: string
}

export type ThemeMode = 'light' | 'dark' | 'system'

export type PanelView = 'structure' | 'properties' | 'stats' | 'schema'

export type ViewMode = 'dashboard' | 'editor'
