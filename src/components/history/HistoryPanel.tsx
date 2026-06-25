'use client'

import { useCallback } from 'react'
import {
  History,
  Undo2,
  Redo2,
  RotateCcw,
  Trash2,
  Clock,
  Camera,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/stores/useStore'
import { useHistoryStore } from '@/stores/useHistoryStore'

interface HistoryPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HistoryPanel({ open, onOpenChange }: HistoryPanelProps) {
  const { loadJson } = useStore()
  const { entries, undo, redo, clearHistory, canUndo, canRedo } = useHistoryStore()

  const handleUndo = useCallback(() => {
    const json = undo()
    if (json) loadJson(json)
  }, [undo, loadJson])

  const handleRedo = useCallback(() => {
    const json = redo()
    if (json) loadJson(json)
  }, [redo, loadJson])

  const handleRestore = useCallback(
    (entry: (typeof entries)[0]) => {
      loadJson(entry.json)
    },
    [loadJson]
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      <div className="bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl w-96 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <History size={16} />
            <span className="text-sm font-semibold">Histórico</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleUndo}
              disabled={!canUndo()}
            >
              <Undo2 size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleRedo}
              disabled={!canRedo()}
            >
              <Redo2 size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={clearHistory}
            >
              <Trash2 size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onOpenChange(false)}>
              ✕
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-2">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RotateCcw size={32} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum histórico</p>
              <p className="text-xs text-muted-foreground mt-1">
                As alterações aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {[...entries].reverse().map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => handleRestore(entry)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors text-left"
                >
                  <div className="p-1.5 rounded-lg bg-accent/30">
                    {entry.type === 'snapshot' ? (
                      <Camera size={14} className="text-purple-500" />
                    ) : (
                      <Clock size={14} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{entry.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {entry.type}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
