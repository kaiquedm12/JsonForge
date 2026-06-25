'use client'

import { useStore } from '@/stores/useStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Braces } from 'lucide-react'

export function PropertiesPanel() {
  const { jsonNode } = useStore()

  if (!jsonNode) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Braces size={32} className="text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Nenhum JSON carregado</p>
      </div>
    )
  }

  const properties = extractProperties(jsonNode)

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1">
        {properties.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Nenhuma propriedade encontrada
          </p>
        ) : (
          properties.map((prop, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/30 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-muted-foreground truncate">{prop.path}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-[10px] h-4">
                  {prop.type}
                </Badge>
                <span className="text-muted-foreground font-mono">
                  {String(prop.value).slice(0, 30)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}

function extractProperties(node: any, path = '$'): { path: string; type: string; value: unknown }[] {
  const props: { path: string; type: string; value: unknown }[] = []

  if (node.type !== 'object' && node.type !== 'array') {
    props.push({ path, type: node.type, value: node.value })
    return props
  }

  for (const child of node.children || []) {
    const childPath = child.key
      ? `${path}.${child.key}`
      : `${path}[${child.path?.match(/\d+/)?.[0] || 0}]`

    if (child.type === 'object' || child.type === 'array') {
      props.push({ path: childPath, type: child.type, value: `${child.children.length} items` })
      props.push(...extractProperties(child, childPath))
    } else {
      props.push({ path: childPath, type: child.type, value: child.value })
    }
  }

  return props
}
