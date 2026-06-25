'use client'

import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Upload,
  Download,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileJson,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/cn'
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
  const {
    sidebarOpen,
    setSidebarOpen,
    newProject,
    setSettingsOpen,
    setHistoryOpen,
    setExportOpen,
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
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 200 : 48 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={cn(
          'relative flex flex-col border-r border-border/60 bg-background/90 backdrop-blur-md h-full overflow-hidden shrink-0'
        )}
      >
        <div className="flex items-center justify-between px-2.5 py-3 border-b border-border/30">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <FileJson size={12} className="text-white" />
                </div>
                <span className="text-xs font-semibold">JsonForge</span>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-6 w-6 shrink-0"
          >
            {sidebarOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
          </Button>
        </div>

        <div className="flex flex-col gap-0.5 p-1.5 flex-1">
          {menuItems.map((item) => (
            <div key={item.id}>
              {sidebarOpen ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2.5 text-xs h-8 px-2"
                  onClick={() => handleAction(item.id)}
                >
                  <item.icon size={14} className="shrink-0" />
                  <span>{item.label}</span>
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-full h-8"
                      onClick={() => handleAction(item.id)}
                    >
                      <item.icon size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-border/30 p-1.5">
          {bottomItems.map((item) => (
            <div key={item.id}>
              {sidebarOpen ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2.5 text-xs h-8 px-2"
                  onClick={() => handleAction(item.id)}
                >
                  <item.icon size={14} className="shrink-0" />
                  <span>{item.label}</span>
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-full h-8"
                      onClick={() => handleAction(item.id)}
                    >
                      <item.icon size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )}
            </div>
          ))}
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
