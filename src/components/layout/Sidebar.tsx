'use client'

import { useCallback } from 'react'
import {
  Plus,
  Upload,
  Download,
  History,
  Settings,
  FileJson,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useStore } from '@/stores/useStore'

const menuItems = [
  { id: 'new', icon: Plus, label: 'Novo Projeto' },
  { id: 'import', icon: Upload, label: 'Importar Arquivo' },
  { id: 'export', icon: Download, label: 'Exportar' },
]

const bottomItems = [
  { id: 'history', icon: History, label: 'Histórico' },
  { id: 'settings', icon: Settings, label: 'Configurações' },
]

export function Sidebar() {
  const { newProject, setSettingsOpen, setHistoryOpen, setExportOpen } = useStore()

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
        case 'history':
          setHistoryOpen(true)
          break
        case 'settings':
          setSettingsOpen(true)
          break
      }
    },
    [newProject, handleFileImport, setExportOpen, setHistoryOpen, setSettingsOpen]
  )

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="flex flex-col border-r border-border/60 bg-background/90 backdrop-blur-md h-full overflow-hidden shrink-0 w-12">
        <div className="flex items-center justify-center py-3 border-b border-border/30">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <FileJson size={12} className="text-white" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-0.5 p-1.5 flex-1">
          {menuItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAction(item.id)}>
                  <item.icon size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="border-t border-border/30 p-1.5 flex flex-col items-center gap-0.5">
          {bottomItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAction(item.id)}>
                  <item.icon size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </aside>
    </TooltipProvider>
  )
}
