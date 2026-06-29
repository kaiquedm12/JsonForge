'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  FileJson,
  Upload,
  Download,
  Settings,
  Share2,
  Undo2,
  Redo2,
  Braces,
  Sparkles,
  PanelRightOpen,
  PanelRightClose,
  Shield,
  Bot,
  SearchCode,
  ArrowLeftRight,
  User,
  GitCommit,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { JsonEditor } from '@/components/editor/JsonEditor'
import { GraphCanvas } from '@/components/graph/GraphCanvas'
import { WelcomeScreen } from '@/components/dashboard/WelcomeScreen'
import { ExportDialog } from '@/components/export/ExportDialog'
import { ShareDialog } from '@/components/share/ShareDialog'
import { SettingsDialog } from '@/components/settings/SettingsDialog'
import { ValidationDialog } from '@/components/validation/ValidationDialog'
import { AiAssistantDialog } from '@/components/ai/AiAssistantDialog'
import { QueryDialog } from '@/components/query/QueryDialog'
import { TransformDialog } from '@/components/transform/TransformDialog'
import { AuthDialog } from '@/components/auth/AuthDialog'
import { SplitPane } from './SplitPane'
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
    isValidationOpen,
    isAiOpen,
    isQueryOpen,
    isTransformOpen,
    isAuthOpen,
    setSettingsOpen,
    setExportOpen,
    setShareOpen,
    setValidationOpen,
    setAiOpen,
    setQueryOpen,
    setTransformOpen,
    setAuthOpen,
    setJsonInput,
    user,
    setUser,
  } = useStore() as any

  const { undo, redo, canUndo, canRedo } = useHistoryStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('jsonforge_user')
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)) } catch {}
      }
    }
  }, [setUser])

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
        case 'share':
          setShareOpen(true)
          break
        case 'validate':
          setValidationOpen(true)
          break
        case 'ai':
          setAiOpen(true)
          break
        case 'query':
          setQueryOpen(true)
          break
        case 'transform':
          setTransformOpen(true)
          break
        case 'account':
          setAuthOpen(true)
          break
      }
    },
    [newProject, setExportOpen, setShareOpen, setValidationOpen, setAiOpen, setQueryOpen, setTransformOpen, setAuthOpen]
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
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-full">
        {viewMode === 'editor' && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                    File <Sparkles size={10} />
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

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={!canUndo()}>
                    <Undo2 size={13} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Desfazer (Ctrl+Z)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={!canRedo()}>
                    <Redo2 size={13} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refazer (Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-5 mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={formatAction}>
                    <Sparkles size={12} /> Format
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Formatar JSON (Shift+Cmd+F)</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleMenuAction('validate')}>
                    <Shield size={12} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Validar JSON Schema</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleMenuAction('ai')}>
                    <Bot size={12} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>AI Assistant</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleMenuAction('query')}>
                    <SearchCode size={12} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>JSONPath Query</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleMenuAction('transform')}>
                    <ArrowLeftRight size={12} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Transformações</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-5 mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleMenuAction('account')}>
                    <User size={12} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{user ? user.name : 'Conta'}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleMenuAction('share')}>
                    <Share2 size={12} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Compartilhar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSettingsOpen(true)}>
                    <Settings size={13} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Configurações</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  >
                    {rightPanelOpen ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Painel Lateral</TooltipContent>
              </Tooltip>
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
              <SplitPane
                left={<JsonEditor />}
                right={<GraphCanvas />}
                defaultLeftPercent={35}
                minLeftPercent={20}
                minRightPercent={25}
              />
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
        <ValidationDialog open={isValidationOpen} onOpenChange={setValidationOpen} jsonInput={jsonInput} />
        <QueryDialog open={isQueryOpen} onOpenChange={setQueryOpen} jsonInput={jsonInput} />
        <AiAssistantDialog open={isAiOpen} onOpenChange={setAiOpen} jsonInput={jsonInput} />
        <TransformDialog
          open={isTransformOpen}
          onOpenChange={setTransformOpen}
          jsonInput={jsonInput}
          onApply={(result: string) => setJsonInput(result)}
        />
        <AuthDialog
          open={isAuthOpen}
          onOpenChange={setAuthOpen}
          user={user}
          onLogin={(email: string, password: string) => {
            setUser({ id: crypto.randomUUID(), name: email.split('@')[0], email })
            setAuthOpen(false)
          }}
          onRegister={(name: string, email: string, password: string) => {
            setUser({ id: crypto.randomUUID(), name, email })
            setAuthOpen(false)
          }}
          onLogout={() => {
            setUser(null)
            setAuthOpen(false)
          }}
        />
      </div>
    </TooltipProvider>
  )
}
