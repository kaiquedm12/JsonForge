'use client'

import { useStore } from '@/stores/useStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Braces, Brackets, Type, Hash, ToggleLeft, Ban, ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useState } from 'react'

const typeIcon = {
  object: Braces,
  array: Brackets,
  string: Type,
  number: Hash,
  boolean: ToggleLeft,
  null: Ban,
}

const typeColor: Record<string, string> = {
  object: 'text-blue-500',
  array: 'text-purple-500',
  string: 'text-emerald-500',
  number: 'text-amber-500',
  boolean: 'text-red-500',
  null: 'text-gray-500',
}

function formatKey(key: string | null | undefined): string {
  if (!key) return 'root'
  if (/^\d+$/.test(key)) return `[${key}]`
  return key
}

function TreeNode({ node, depth = 0 }: { node: any; depth?: number }) {
  const [expanded, setExpanded] = useState(true)
  const Icon = typeIcon[node.type as keyof typeof typeIcon] || Braces
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-1 px-2 rounded-md hover:bg-accent/50 cursor-pointer text-xs',
          depth === 0 && 'font-medium'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <span className="text-muted-foreground shrink-0">
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        )}
        {!hasChildren && <span className="w-3 shrink-0" />}
        <Icon size={12} className={cn('shrink-0', typeColor[node.type])} />
        <span className="truncate">{formatKey(node.key)}</span>
        <span className={cn('text-[10px] font-mono ml-auto', typeColor[node.type])}>
          {node.type}
        </span>
        {hasChildren && (
          <Badge variant="outline" className="text-[10px] h-4 px-1">
            {node.children.length}
          </Badge>
        )}
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child: any, i: number) => (
            <TreeNode key={child.path || i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function StructurePanel() {
  const { jsonNode } = useStore()

  if (!jsonNode) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Braces size={32} className="text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Nenhum JSON carregado</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <TreeNode node={jsonNode} />
    </ScrollArea>
  )
}
