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

export type PanelView = 'structure' | 'properties' | 'stats' | 'schema' | 'validation'

export type ViewMode = 'dashboard' | 'editor'

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  path: string
  message: string
  keyword: string
}

export interface AiSuggestion {
  label: string
  prompt: string
}

export interface QueryResult {
  path: string
  value: unknown
}

export interface PatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
  path: string
  value?: unknown
  from?: string
}

export interface TransformRule {
  id: string
  type: 'rename' | 'map' | 'filter' | 'sort' | 'pick' | 'omit'
  config: Record<string, unknown>
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface ProjectData {
  id: string
  name: string
  json: string
  createdAt: number
  updatedAt: number
}

export type Locale = 'pt-BR' | 'en-US' | 'es'
