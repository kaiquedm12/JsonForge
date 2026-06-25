'use client'

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { cn } from '@/lib/cn'

export interface JsonNodeData {
  label: string
  type: string
  value: string
  path: string
  color: string
  depth: number
  hasChildren: boolean
  isCollapsed: boolean
  childrenCount: number
}

const typeColors: Record<string, { dot: string; text: string }> = {
  object:  { dot: '#3b82f6', text: 'text-blue-500' },
  array:   { dot: '#8b5cf6', text: 'text-violet-500' },
  string:  { dot: '#10b981', text: 'text-emerald-500' },
  number:  { dot: '#f59e0b', text: 'text-amber-500' },
  boolean: { dot: '#ef4444', text: 'text-rose-500' },
  null:    { dot: '#71717a', text: 'text-zinc-500' },
}

const typeLabels: Record<string, string> = {
  object: '{}',
  array: '[]',
  string: 'str',
  number: 'num',
  boolean: 'bool',
  null: 'nil',
}

function JsonGraphNode({ data }: { data: JsonNodeData }) {
  const colors = typeColors[data.type] ?? typeColors.object
  const label = typeLabels[data.type] ?? '?'

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-background/90 transition-shadow duration-150',
        'border-border/60 hover:border-foreground/20 hover:shadow-sm'
      )}
      style={{ width: 260 }}
    >
      {data.depth > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2 !h-2 !border-2 !border-background"
          style={{ background: colors.dot }}
        />
      )}

      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: colors.dot }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate text-foreground/90">
              {data.label || 'root'}
            </span>
            <span className="text-[10px] font-mono uppercase opacity-40 shrink-0">{label}</span>
          </div>
          {!data.hasChildren && data.value ? (
            <span className={cn('text-[11px] font-mono truncate block leading-tight mt-0.5', colors.text, 'opacity-70')}>
              {data.value}
            </span>
          ) : data.hasChildren ? (
            <span className="text-[11px] text-muted-foreground/50 block leading-tight mt-0.5">
              {data.childrenCount} {data.childrenCount === 1 ? 'item' : 'itens'}
            </span>
          ) : null}
        </div>
      </div>

      {data.hasChildren && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-2 !h-2 !border-2 !border-background"
          style={{ background: colors.dot }}
        />
      )}
    </div>
  )
}

export default memo(JsonGraphNode)
