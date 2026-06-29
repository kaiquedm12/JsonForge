'use client'

import { useCallback, useState, useRef } from 'react'
import {
  Plus,
  Upload,
  Download,
  History,
  Settings,
  FileJson,
  Shield,
  Bot,
  SearchCode,
  ArrowLeftRight,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useStore } from '@/stores/useStore'
import { cn } from '@/lib/cn'

const menuItems = [
  { id: 'new', icon: Plus, label: 'Novo Projeto' },
  { id: 'import', icon: Upload, label: 'Importar Arquivo' },
  { id: 'export', icon: Download, label: 'Exportar' },
  { id: 'validate', icon: Shield, label: 'Validar Schema' },
  { id: 'ai', icon: Bot, label: 'AI Assistant' },
  { id: 'query', icon: SearchCode, label: 'JSONPath Query' },
  { id: 'transform', icon: ArrowLeftRight, label: 'Transformações' },
]

const bottomItems = [
  { id: 'account', icon: User, label: 'Conta' },
  { id: 'history', icon: History, label: 'Histórico' },
  { id: 'settings', icon: Settings, label: 'Configurações' },
]

export function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const {
    newProject,
    setSettingsOpen,
    setHistoryOpen,
    setExportOpen,
    setValidationOpen,
    setAiOpen,
    setQueryOpen,
    setTransformOpen,
    setAuthOpen,
  } = useStore()

  const handleFileImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          const text = ev.target?.result as string
          useStore.getState().loadJson(text)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }, [])

  const handleAction = useCallback(
    (id: string) => {
      switch (id) {
        case 'new':
          newProject()
          break
        case 'import':
          handleFileImport()
          break
        case 'export':
          setExportOpen(true)
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
        case 'history':
          setHistoryOpen(true)
          break
        case 'settings':
          setSettingsOpen(true)
          break
      }
    },
    [newProject, handleFileImport, setExportOpen, setValidationOpen, setAiOpen, setQueryOpen, setTransformOpen, setAuthOpen, setHistoryOpen, setSettingsOpen]
  )

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setExpanded(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setExpanded(false), 200)
  }, [])

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className="flex flex-col border-r border-border/60 bg-background/90 backdrop-blur-md h-full overflow-hidden shrink-0 transition-[width] duration-200 ease-in-out"
        style={{ width: expanded ? 200 : 48 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={cn(
          'flex items-center border-b border-border/30 shrink-0',
          expanded ? 'gap-2.5 px-4 py-3' : 'justify-center py-3'
        )}>
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
            <FileJson size={12} className="text-white" />
          </div>
          {expanded && <span className="text-sm font-semibold whitespace-nowrap">JsonForge</span>}
        </div>

        <div className={cn('flex flex-col gap-0.5 py-2 flex-1', expanded ? 'px-2' : 'items-center px-0')}>
          {menuItems.map((item) => (
            expanded ? (
              <button
                key={item.id}
                onClick={() => handleAction(item.id)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent/50 transition-colors w-full shrink-0"
              >
                <item.icon size={16} className="shrink-0" />
                <span className="whitespace-nowrap text-left">{item.label}</span>
              </button>
            ) : (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAction(item.id)}>
                    <item.icon size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          ))}
        </div>

        <div className="border-t border-border/30 py-2 mt-auto">
          <div className={expanded ? 'px-2' : 'flex flex-col items-center'}>
            {bottomItems.map((item) => (
              expanded ? (
                <button
                  key={item.id}
                  onClick={() => handleAction(item.id)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent/50 transition-colors w-full shrink-0"
                >
                  <item.icon size={16} className="shrink-0" />
                  <span className="whitespace-nowrap text-left">{item.label}</span>
                </button>
              ) : (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAction(item.id)}>
                      <item.icon size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            ))}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
