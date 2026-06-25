'use client'

import { useState, useMemo, useCallback } from 'react'
import { useStore } from '@/stores/useStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Braces, FileCode, ShieldCheck, Database, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { downloadAsFile } from '@/lib/exportUtils'

type SchemaType = 'jsonSchema' | 'typescript' | 'zod' | 'prisma'

const schemaLabels: Record<SchemaType, { label: string; icon: React.ElementType; color: string }> = {
  jsonSchema: { label: 'JSON Schema', icon: Braces, color: 'text-blue-500' },
  typescript: { label: 'TypeScript', icon: FileCode, color: 'text-blue-600' },
  zod: { label: 'Zod', icon: ShieldCheck, color: 'text-emerald-500' },
  prisma: { label: 'Prisma', icon: Database, color: 'text-purple-500' },
}

export function SchemaPanel() {
  const { getSchemas, jsonNode } = useStore()
  const schemas = useMemo(() => getSchemas(), [getSchemas])
  const [activeSchema, setActiveSchema] = useState<SchemaType>('typescript')
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (!schemas) return
    navigator.clipboard.writeText(schemas[activeSchema])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [schemas, activeSchema])

  const handleDownload = useCallback(() => {
    if (!schemas) return
    const ext: Record<SchemaType, string> = {
      jsonSchema: '.json',
      typescript: '.ts',
      zod: '.ts',
      prisma: '.prisma',
    }
    downloadAsFile(schemas[activeSchema], `schema${ext[activeSchema]}`, 'text/plain')
  }, [schemas, activeSchema])

  if (!jsonNode || !schemas) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Braces size={32} className="text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Carregue um JSON para gerar schemas</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeSchema} onValueChange={(v) => setActiveSchema(v as SchemaType)}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="typescript" className="text-xs">TypeScript</TabsTrigger>
          <TabsTrigger value="jsonSchema" className="text-xs">JSON Schema</TabsTrigger>
          <TabsTrigger value="zod" className="text-xs">Zod</TabsTrigger>
          <TabsTrigger value="prisma" className="text-xs">Prisma</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center justify-between py-2">
        <Badge variant="outline" className="text-[10px]">
          {schemaLabels[activeSchema].label}
        </Badge>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <pre className="text-xs font-mono p-3 rounded-lg bg-accent/30 border border-border/50 overflow-x-auto whitespace-pre-wrap">
          <code>{schemas[activeSchema]}</code>
        </pre>
      </ScrollArea>
    </div>
  )
}
