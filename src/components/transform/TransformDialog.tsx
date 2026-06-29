'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowRight, ArrowDownLeft, Filter, SortAsc, CheckSquare, EyeOff } from 'lucide-react'

interface TransformRule {
  id: string
  type: string
  label: string
  icon: React.ReactNode
}

const TRANSFORM_TYPES: TransformRule[] = [
  { id: 'rename', type: 'rename', label: 'Renomear campos', icon: <ArrowRight className="w-4 h-4" /> },
  { id: 'pick', type: 'pick', label: 'Selecionar campos', icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'omit', type: 'omit', label: 'Remover campos', icon: <EyeOff className="w-4 h-4" /> },
  { id: 'map', type: 'map', label: 'Mapear valores', icon: <ArrowDownLeft className="w-4 h-4" /> },
  { id: 'filter', type: 'filter', label: 'Filtrar array', icon: <Filter className="w-4 h-4" /> },
  { id: 'sort', type: 'sort', label: 'Ordenar array', icon: <SortAsc className="w-4 h-4" /> },
]

interface TransformDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jsonInput: string
  onApply: (result: string) => void
}

export function TransformDialog({ open, onOpenChange, jsonInput, onApply }: TransformDialogProps) {
  const [selectedTransform, setSelectedTransform] = useState<string | null>(null)
  const [params, setParams] = useState('')

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      let result: unknown = parsed

      switch (selectedTransform) {
        case 'rename': {
          const { from, to } = JSON.parse(params || '{}')
          result = renameKeys(parsed, from, to)
          break
        }
        case 'pick': {
          const keys = (params || '').split(',').map((k: string) => k.trim()).filter(Boolean)
          result = pickKeys(parsed, keys)
          break
        }
        case 'omit': {
          const keys = (params || '').split(',').map((k: string) => k.trim()).filter(Boolean)
          result = omitKeys(parsed, keys)
          break
        }
        case 'filter': {
          const { field, operator, value } = JSON.parse(params || '{}')
          result = filterArray(parsed, field, operator, value)
          break
        }
        case 'sort': {
          const { field, order } = JSON.parse(params || '{}')
          result = sortArray(parsed, field, order)
          break
        }
      }

      onApply(JSON.stringify(result, null, 2))
      onOpenChange(false)
    } catch {
      // Invalid params
    }
  }

  const getPlaceholder = () => {
    switch (selectedTransform) {
      case 'rename': return '{"from": "old_name", "to": "new_name"}'
      case 'pick': return 'campo1, campo2, campo3'
      case 'omit': return 'campo1, campo2, campo3'
      case 'filter': return '{"field": "price", "operator": ">", "value": 10}'
      case 'sort': return '{"field": "name", "order": "asc"}'
      default: return ''
    }
  }

  const getInstructions = () => {
    switch (selectedTransform) {
      case 'rename': return 'Renomeia um campo no objeto. Forneça {"from": "nome_antigo", "to": "nome_novo"}'
      case 'pick': return 'Mantém apenas os campos especificados. Separe por vírgulas.'
      case 'omit': return 'Remove os campos especificados. Separe por vírgulas.'
      case 'filter': return 'Filtra itens de um array. Forneça {"field": "...", "operator": ">|<|>=|<=|===|!=", "value": ...}'
      case 'sort': return 'Ordena itens de um array. Forneça {"field": "...", "order": "asc|desc"}'
      default: return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Transformações Visuais</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {TRANSFORM_TYPES.map((t) => (
              <Button
                key={t.id}
                variant={selectedTransform === t.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTransform(t.id)}
                className="justify-start"
              >
                {t.icon}
                <span className="ml-2">{t.label}</span>
              </Button>
            ))}
          </div>

          {selectedTransform && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{getInstructions()}</p>
              <textarea
                className="w-full h-24 p-2 text-sm font-mono border rounded-md bg-muted"
                value={params}
                onChange={(e) => setParams(e.target.value)}
                placeholder={getPlaceholder()}
              />
              <Button onClick={handleApply} className="w-full">
                Aplicar Transformação
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function renameKeys(obj: unknown, from: string, to: string): unknown {
  if (Array.isArray(obj)) return obj.map((item) => renameKeys(item, from, to))
  if (typeof obj !== 'object' || obj === null) return obj
  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const newKey = key === from ? to : key
    result[newKey] = typeof val === 'object' ? renameKeys(val, from, to) : val
  }
  return result
}

function pickKeys(obj: unknown, keys: string[]): unknown {
  if (Array.isArray(obj)) return obj.map((item) => pickKeys(item, keys))
  if (typeof obj !== 'object' || obj === null) return obj
  const result: Record<string, unknown> = {}
  for (const key of keys) {
    if (key in (obj as Record<string, unknown>)) {
      result[key] = (obj as Record<string, unknown>)[key]
    }
  }
  return result
}

function omitKeys(obj: unknown, keys: string[]): unknown {
  if (Array.isArray(obj)) return obj.map((item) => omitKeys(item, keys))
  if (typeof obj !== 'object' || obj === null) return obj
  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    if (!keys.includes(key)) result[key] = val
  }
  return result
}

function filterArray(
  obj: unknown,
  field: string,
  operator: string,
  value: unknown
): unknown {
  if (!Array.isArray(obj)) return obj
  return obj.filter((item) => {
    const val = (item as Record<string, unknown>)[field]
    switch (operator) {
      case '>': return (val as number) > (value as number)
      case '<': return (val as number) < (value as number)
      case '>=': return (val as number) >= (value as number)
      case '<=': return (val as number) <= (value as number)
      case '===': return val === value
      case '!=': return val !== value
      default: return true
    }
  })
}

function sortArray(obj: unknown, field: string, order: string): unknown {
  if (!Array.isArray(obj)) return obj
  return [...obj].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[field]
    const bVal = (b as Record<string, unknown>)[field]
    if (String(aVal) < String(bVal)) return order === 'desc' ? 1 : -1
    if (String(aVal) > String(bVal)) return order === 'desc' ? -1 : 1
    return 0
  })
}
