'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, X, HelpCircle, Copy, Check } from 'lucide-react'
import { queryJsonPath, formatQueryPath, QUERY_EXAMPLES } from '@/lib/jsonQuery'

interface QueryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jsonInput: string
}

export function QueryDialog({ open, onOpenChange, jsonInput }: QueryDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ path: string; value: unknown }[]>([])
  const [showExamples, setShowExamples] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleQuery = () => {
    if (!query.trim() || !jsonInput) return
    const formatted = formatQueryPath(query)
    const res = queryJsonPath(jsonInput, formatted)
    setResults(res)
  }

  const copyResult = async (value: unknown) => {
    await navigator.clipboard.writeText(JSON.stringify(value, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            JSONPath Query
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                className="w-full pl-3 pr-8 py-2 text-sm font-mono border rounded-md bg-background"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                placeholder="$.store.books[*].title"
              />
              {query && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => { setQuery(''); setResults([]) }}
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <Button size="sm" onClick={handleQuery} disabled={!query}>
              Query
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowExamples(!showExamples)}
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>

          {showExamples && (
            <div className="p-2 rounded-md bg-muted">
              <p className="text-xs font-medium mb-2 text-muted-foreground">Exemplos:</p>
              <div className="grid grid-cols-2 gap-1">
                {QUERY_EXAMPLES.map((ex) => (
                  <button
                    key={ex.query}
                    className="text-left text-xs px-2 py-1 rounded hover:bg-background font-mono"
                    onClick={() => { setQuery(ex.query); setShowExamples(false) }}
                  >
                    {ex.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {results.map((r, i) => (
                  <div key={i} className="p-3 rounded-md bg-muted text-sm relative group">
                    <code className="text-xs text-muted-foreground block mb-1">{r.path}</code>
                    <pre className="text-xs font-mono whitespace-pre-wrap max-h-32 overflow-auto">
                      {JSON.stringify(r.value, null, 2)}
                    </pre>
                    <button
                      onClick={() => copyResult(r.value)}
                      className="absolute top-2 right-2 p-1 rounded bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {results.length === 0 && query && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum resultado encontrado
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
