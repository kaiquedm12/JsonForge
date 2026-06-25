'use client'

import { useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

import type { JsonStats, SchemaResult } from '@/types'
import { useStore } from '@/stores/useStore'
import { cn } from '@/lib/cn'
import { formatFileSize } from '@/lib/statsUtils'
import { useState } from 'react'

export function RightPanel() {
  const { panelView, setPanelView, rightPanelOpen, setRightPanelOpen, jsonNode, jsonInput, getStats, getSchemas } = useStore()
  const [copied, setCopied] = useState(false)

  const stats = useMemo(() => getStats(), [getStats])
  const schemas = useMemo(() => getSchemas(), [getSchemas])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(jsonInput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [jsonInput])

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
                <TabsList className="w-full grid grid-cols-4 h-8">
                  <TabsTrigger value="structure" className="text-[10px] px-0">Tree</TabsTrigger>
                  <TabsTrigger value="properties" className="text-[10px] px-0">Props</TabsTrigger>
                  <TabsTrigger value="stats" className="text-[10px] px-0">Stats</TabsTrigger>
                  <TabsTrigger value="schema" className="text-[10px] px-0">Schema</TabsTrigger>
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
                        {jsonNode ? <TreeNode node={jsonNode} depth={0} /> : <EmptyState />}
                      </div>
                    )}
                    {panelView === 'properties' && (
                      <div className="space-y-1">
                        {jsonNode ? <PropertiesView /> : <EmptyState />}
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

interface TreeNodeData {
  key: string | null
  type: string
  children: TreeNodeData[]
  path: string
}

function TreeNode({ node, depth }: { node: TreeNodeData; depth: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0

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
          {node.children.map((child, i: number) => (
            <TreeNode key={child.path || i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function PropertiesView() {
  return (
    <div className="text-xs text-muted-foreground text-center py-4">
      Click a node in the graph to view its properties
    </div>
  )
}

function StatsView({ stats }: { stats: JsonStats }) {
  const items = [
    { label: 'Objects', value: stats.totalObjects },
    { label: 'Arrays', value: stats.totalArrays },
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
      <div className="flex gap-1 mb-2">
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
