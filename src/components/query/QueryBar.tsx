'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, X, HelpCircle } from 'lucide-react'
import { queryJsonPath, formatQueryPath, QUERY_EXAMPLES } from '@/lib/jsonQuery'
import type { QueryResult } from '@/types'

interface QueryBarProps {
  jsonInput: string
  onResult?: (results: QueryResult[]) => void
}

export function QueryBar({ jsonInput, onResult }: QueryBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<QueryResult[]>([])
  const [showExamples, setShowExamples] = useState(false)

  const handleQuery = () => {
    const formatted = formatQueryPath(query)
    const res = queryJsonPath(jsonInput, formatted)
    setResults(res)
    onResult?.(res)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-8 py-2 text-sm font-mono border rounded-md bg-background"
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
        <ScrollArea className="max-h-48">
          <div className="space-y-1">
            {results.map((r, i) => (
              <div key={i} className="p-2 rounded-md bg-muted text-sm">
                <code className="text-xs text-muted-foreground">{r.path}</code>
                <pre className="mt-1 text-xs font-mono">
                  {JSON.stringify(r.value, null, 2).slice(0, 200)}
                </pre>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
