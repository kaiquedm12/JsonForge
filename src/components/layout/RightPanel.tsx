'use client'

import { useCallback, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Shield, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

import type { JsonStats, SchemaResult, ValidationResult } from '@/types'
import { useStore } from '@/stores/useStore'
import { cn } from '@/lib/cn'
import { formatFileSize } from '@/lib/statsUtils'
import { validateJsonAgainstSchema } from '@/lib/schemaValidator'

export function RightPanel() {
  const { panelView, setPanelView, rightPanelOpen, setRightPanelOpen, jsonNode, jsonInput, getStats, getSchemas } = useStore()
  const [copied, setCopied] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [validationSchema, setValidationSchema] = useState('')

  const stats = useMemo(() => getStats(), [getStats])
  const schemas = useMemo(() => getSchemas(), [getSchemas])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(jsonInput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [jsonInput])

  const handleValidate = useCallback(() => {
    if (!validationSchema) return
    const result = validateJsonAgainstSchema(jsonInput, validationSchema)
    setValidationResult(result)
  }, [jsonInput, validationSchema])

  return (
    <AnimatePresence>
      {rightPanelOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="border-l border-border/60 bg-background/90 backdrop-blur-md h-full overflow-hidden shrink-0"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/30">
              <span className="text-xs font-semibold">Panel</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRightPanelOpen(false)}>
                <X size={13} />
              </Button>
            </div>

            <Tabs
              value={panelView}
              onValueChange={(v) => setPanelView(v as typeof panelView)}
              className="flex flex-col flex-1"
            >
              <div className="px-3 pt-2">
                <TabsList className="w-full grid grid-cols-5 h-8">
                  <TabsTrigger value="structure" className="text-[10px] px-0">Tree</TabsTrigger>
                  <TabsTrigger value="properties" className="text-[10px] px-0">Props</TabsTrigger>
                  <TabsTrigger value="stats" className="text-[10px] px-0">Stats</TabsTrigger>
                  <TabsTrigger value="schema" className="text-[10px] px-0">Schema</TabsTrigger>
                  <TabsTrigger value="validation" className="text-[10px] px-0">
                    <Shield size={10} />
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 px-3 py-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={panelView}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    {panelView === 'structure' && (
                      <div className="space-y-0.5">
                        {jsonNode ? <TreeNode node={jsonNode as any} depth={0} /> : <EmptyState />}
                      </div>
                    )}
                    {panelView === 'properties' && (
                      <div className="space-y-2">
                        {jsonNode ? <PropertiesView node={jsonNode} /> : <EmptyState />}
                      </div>
                    )}
                    {panelView === 'stats' && (
                      <div className="space-y-2">
                        {stats ? <StatsView stats={stats} /> : <EmptyState />}
                      </div>
                    )}
                    {panelView === 'schema' && (
                      <div className="space-y-2">
                        {schemas ? <SchemaView schemas={schemas} /> : <EmptyState />}
                      </div>
                    )}
                    {panelView === 'validation' && (
                      <div className="space-y-3">
                        <textarea
                          className="w-full h-32 p-2 text-xs font-mono border rounded-md bg-muted"
                          value={validationSchema}
                          onChange={(e) => setValidationSchema(e.target.value)}
                          placeholder="Cole o JSON Schema aqui..."
                        />
                        <Button size="sm" className="w-full" onClick={handleValidate} disabled={!validationSchema}>
                          <Shield size={12} className="mr-1" />
                          Validar
                        </Button>
                        {validationResult && (
                          <div>
                            {validationResult.valid ? (
                              <div className="flex items-center gap-2 p-2 rounded bg-green-500/10 text-green-500 text-xs">
                                <CheckCircle2 size={14} />
                                JSON válido!
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 text-destructive text-xs">
                                  <AlertCircle size={14} />
                                  {validationResult.errors.length} erro(s)
                                </div>
                                {validationResult.errors.slice(0, 10).map((err, i) => (
                                  <div key={i} className="p-2 rounded bg-destructive/5 text-xs">
                                    <div className="flex gap-1 mb-1">
                                      <Badge variant="outline" className="text-[10px] font-mono">{err.path}</Badge>
                                      <Badge variant="secondary" className="text-[10px]">{err.keyword}</Badge>
                                    </div>
                                    <p className="text-muted-foreground">{err.message}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </ScrollArea>

              <div className="border-t border-border/30 p-2">
                <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1.5" onClick={handleCopy}>
                  {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  {copied ? 'Copied!' : 'Copy JSON'}
                </Button>
              </div>
            </Tabs>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-xs text-muted-foreground">No JSON loaded</p>
    </div>
  )
}

function TreeNode({ node, depth }: { node: any; depth: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <button
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={cn(
          'flex items-center gap-1.5 w-full px-2 py-1 rounded text-xs hover:bg-accent/50 transition-colors text-left',
          depth === 0 && 'font-medium'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <span className="text-muted-foreground font-mono text-[10px] w-3 shrink-0">
          {hasChildren ? (expanded ? '▾' : '▸') : ''}
        </span>
        <span className="truncate">{node.key || 'root'}</span>
        <span className="text-[10px] text-muted-foreground/50 ml-auto font-mono">{node.type}</span>
      </button>
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

function PropertiesView({ node }: { node: any }) {
  const props = useMemo(() => {
    const result: { path: string; type: string; value: string }[] = []
    function walk(n: any) {
      if (n.type !== 'object' && n.type !== 'array') {
        result.push({ path: n.path, type: n.type, value: String(n.value) })
      }
      for (const child of n.children || []) walk(child)
    }
    walk(node)
    return result
  }, [node])

  if (props.length === 0) {
    return <div className="text-xs text-muted-foreground text-center py-4">No leaf properties found</div>
  }

  return (
    <div className="space-y-1">
      {props.slice(0, 100).map((prop, i) => (
        <div key={i} className="p-2 rounded bg-muted/20 text-xs">
          <div className="flex items-center gap-1 mb-0.5">
            <code className="text-[10px] text-muted-foreground truncate">{prop.path}</code>
            <Badge variant="outline" className="text-[9px] px-1 py-0 ml-auto">{prop.type}</Badge>
          </div>
          <p className="text-foreground/80 truncate">{prop.value}</p>
        </div>
      ))}
      {props.length > 100 && (
        <p className="text-[10px] text-muted-foreground text-center">
          +{props.length - 100} more properties
        </p>
      )}
    </div>
  )
}

function StatsView({ stats }: { stats: JsonStats }) {
  const items = [
    { label: 'Objects', value: stats.totalObjects },
    { label: 'Arrays', value: stats.totalArrays },
    { label: 'Strings', value: stats.totalStrings },
    { label: 'Numbers', value: stats.totalNumbers },
    { label: 'Booleans', value: stats.totalBooleans },
    { label: 'Nulls', value: stats.totalNulls },
    { label: 'Properties', value: stats.totalProperties },
    { label: 'Max Depth', value: stats.maxDepth },
    { label: 'File Size', value: formatFileSize(stats.fileSize) },
    { label: 'Unique Keys', value: stats.uniqueKeys },
    { label: 'Complexity', value: stats.complexity },
  ]

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between px-2 py-1.5 rounded bg-muted/20 text-xs">
          <span className="text-muted-foreground">{item.label}</span>
          <span className="font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

function SchemaView({ schemas }: { schemas: SchemaResult }) {
  const [active, setActive] = useState<'typescript' | 'jsonSchema' | 'zod' | 'prisma'>('typescript')
  const [copied, setCopied] = useState(false)

  const labels: Record<string, string> = {
    typescript: 'TypeScript',
    jsonSchema: 'JSON Schema',
    zod: 'Zod',
    prisma: 'Prisma',
  }

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(schemas[active])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [schemas, active])

  return (
    <div>
      <div className="flex gap-1 mb-2 flex-wrap">
        {Object.keys(labels).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key as typeof active)}
            className={cn(
              'text-[10px] px-2 py-1 rounded font-medium transition-colors',
              active === key ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {labels[key]}
          </button>
        ))}
      </div>
      <div className="relative group">
        <pre className="text-[11px] font-mono p-3 rounded-lg bg-muted/20 border border-border/30 overflow-x-auto max-h-60 whitespace-pre-wrap">
          <code>{schemas[active]}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1 rounded bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
        </button>
      </div>
    </div>
  )
}
