'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  FileJson,
  Upload,
  Download,
  Settings,
  Share2,
  Wand2,
  Repeat,
  Undo2,
  Redo2,
  Code,
  Sparkles,
  PanelRightOpen,
  PanelRightClose,
  Braces,
  Eye,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { JsonEditor } from '@/components/editor/JsonEditor'
import { GraphCanvas } from '@/components/graph/GraphCanvas'
import { WelcomeScreen } from '@/components/dashboard/WelcomeScreen'
import { ExportDialog } from '@/components/export/ExportDialog'
import { ShareDialog } from '@/components/share/ShareDialog'
import { SettingsDialog } from '@/components/settings/SettingsDialog'
import { ConvertDialog } from '@/components/conversions/ConvertDialog'
import { useStore } from '@/stores/useStore'
import { useHistoryStore } from '@/stores/useHistoryStore'

export function MainPanel() {
  const {
    viewMode,
    jsonInput,
    jsonNode,
    loadJson,
    loadExample,
    newProject,
    formatJson: formatAction,
    setRightPanelOpen,
    rightPanelOpen,
    isSettingsOpen,
    isExportOpen,
    isShareOpen,
    isConvertOpen,
    setSettingsOpen,
    setExportOpen,
    setShareOpen,
    setConvertOpen,
  } = useStore()

  const { undo, redo, canUndo, canRedo } = useHistoryStore()

  const [showGraph, setShowGraph] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleMenuAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'new':
          newProject()
          break
        case 'import':
          fileInputRef.current?.click()
          break
        case 'export':
          setExportOpen(true)
          break
        case 'settings':
          setSettingsOpen(true)
          break
        case 'analyze':
          analyzeJson(jsonInput, setToast)
          break
        case 'convert':
          setConvertOpen(true)
          break
        case 'share':
          setShareOpen(true)
          break
      }
    },
    [newProject, jsonInput, setExportOpen, setSettingsOpen, setConvertOpen, setShareOpen]
  )

  const handleFileImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => loadJson(ev.target?.result as string)
        reader.readAsText(file)
      }
    },
    [loadJson]
  )

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        const json = undo()
        if (json) loadJson(json)
      }
      if (meta && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        const json = redo()
        if (json) loadJson(json)
      }
    }
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [undo, redo, loadJson])

  return (
    <div className="flex flex-col h-full">
      {viewMode === 'editor' && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                  File <ChevronDown size={10} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem onClick={() => handleMenuAction('new')}>
                  <FileJson size={14} /> New
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMenuAction('import')}>
                  <Upload size={14} /> Import
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMenuAction('export')}>
                  <Download size={14} /> Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={loadExample}>
                  <Sparkles size={14} /> Load Example
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-5 mx-1" />

            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
              <Button
                variant={showGraph ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => setShowGraph(true)}
              >
                <Eye size={12} /> Graph
              </Button>
              <Button
                variant={!showGraph ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => setShowGraph(false)}
              >
                <Code size={12} /> Code
              </Button>
            </div>

            <Separator orientation="vertical" className="h-5 mx-1" />

            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={!canUndo()}>
              <Undo2 size={13} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={!canRedo()}>
              <Redo2 size={13} />
            </Button>

            <Separator orientation="vertical" className="h-5 mx-1" />

            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={formatAction}>
              <Sparkles size={12} /> Format
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleMenuAction('analyze')}>
              <Wand2 size={12} /> Analyze
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleMenuAction('convert')}>
              <Repeat size={12} /> Convert
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleMenuAction('share')}>
              <Share2 size={12} /> Share
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSettingsOpen(true)}>
              <Settings size={13} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
            >
              {rightPanelOpen ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />}
            </Button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileImport}
      />

      {viewMode === 'dashboard' ? (
        <WelcomeScreen />
      ) : (
        <div className="flex-1 relative overflow-hidden">
          {jsonNode ? (
            showGraph ? (
              <GraphCanvas />
            ) : (
              <JsonEditor />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Braces size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Paste or import JSON to visualize</p>
              </div>
            </div>
          )}
        </div>
      )}

      <ExportDialog open={isExportOpen} onOpenChange={setExportOpen} />
      <ShareDialog open={isShareOpen} onOpenChange={setShareOpen} />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setSettingsOpen} />
      <ConvertDialog open={isConvertOpen} onOpenChange={setConvertOpen} />

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border bg-background/95 backdrop-blur-xl px-4 py-3 shadow-lg animate-in">
          <span className="text-sm">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100 text-xs">✕</button>
        </div>
      )}
    </div>
  )
}

function analyzeJson(jsonInput: string, setToast: (t: { message: string; type: 'success' | 'error' | 'info' }) => void) {
  try {
    const parsed = JSON.parse(jsonInput)
    const type = typeof parsed
    const isArray = Array.isArray(parsed)
    const keys = isArray ? parsed.length : Object.keys(parsed).length
    const depth = getDepth(parsed)
    setToast({
      message: `Valid JSON. Type: ${isArray ? 'array' : type}. Keys/Items: ${keys}. Depth: ${depth}.`,
      type: 'success',
    })
  } catch {
    setToast({ message: 'Invalid JSON. Check syntax.', type: 'error' })
  }
}

function getDepth(obj: unknown, d = 0): number {
  if (typeof obj !== 'object' || obj === null) return d
  if (Array.isArray(obj)) return obj.reduce((max: number, v) => Math.max(max, getDepth(v, d + 1)), d as number)
  return Object.values(obj as Record<string, unknown>).reduce(
    (max: number, v) => Math.max(max, getDepth(v, d + 1)), d
  )
}
