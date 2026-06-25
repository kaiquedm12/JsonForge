'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Image,
  FileJson,
  FileCode,
  Check,
  Copy,
  Minimize2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { useStore } from '@/stores/useStore'
import { downloadAsFile, formatJson, minifyJson } from '@/lib/exportUtils'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const exportOptions = [
  {
    id: 'png',
    label: 'PNG',
    desc: 'Imagem do grafo',
    icon: Image,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'svg',
    label: 'SVG',
    desc: 'Vetor do grafo',
    icon: FileCode,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    id: 'formatted',
    label: 'JSON',
    desc: 'JSON formatado',
    icon: FileJson,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 'minified',
    label: 'Minificado',
    desc: 'JSON minificado',
    icon: Minimize2,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
]

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const { jsonInput } = useStore()
  const [copied, setCopied] = useState(false)

  const handleExport = useCallback(
    async (id: string) => {
      switch (id) {
        case 'formatted': {
          const content = formatJson(jsonInput)
          downloadAsFile(content, 'jsonforge-export.json', 'application/json')
          break
        }
        case 'minified': {
          const content = minifyJson(jsonInput)
          downloadAsFile(content, 'jsonforge-export.min.json', 'application/json')
          break
        }
        case 'png':
        case 'svg': {
          const canvas = document.querySelector('.react-flow') as HTMLElement
          if (canvas) {
            const toCanvas = document.createElement('canvas')
            const rect = canvas.getBoundingClientRect()
            toCanvas.width = rect.width * 2
            toCanvas.height = rect.height * 2
            const ctx = toCanvas.getContext('2d')
            if (ctx) {
              ctx.scale(2, 2)
              ctx.fillStyle = getComputedStyle(document.body).backgroundColor
              ctx.fillRect(0, 0, rect.width, rect.height)
              ctx.drawImage(
                await html2canvas(canvas, { backgroundColor: null, scale: 2 }),
                0,
                0
              )
              toCanvas.toBlob((blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `jsonforge-export.${id}`
                  a.click()
                  URL.revokeObjectURL(url)
                }
              })
            }
          }
          break
        }
      }
      onOpenChange(false)
    },
    [jsonInput, onOpenChange]
  )

  const handleCopyJson = useCallback(() => {
    const formatted = formatJson(jsonInput)
    navigator.clipboard.writeText(formatted)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [jsonInput])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar</DialogTitle>
          <DialogDescription>
            Escolha o formato de exportação
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {exportOptions.map((opt) => (
            <motion.button
              key={opt.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleExport(opt.id)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-white/5 dark:bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-colors text-left'
              )}
            >
              <div className={cn('p-2 rounded-lg', opt.bg)}>
                <opt.icon size={18} className={opt.color} />
              </div>
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-accent/30 p-3">
          <div className="flex items-center gap-2">
            <FileJson size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {jsonInput ? `${jsonInput.length} caracteres` : 'Nenhum JSON'}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleCopyJson}>
            {copied ? (
              <>
                <Check size={12} className="text-emerald-500" />
                Copiado
              </>
            ) : (
              <>
                <Copy size={12} />
                Copiar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

async function html2canvas(element: HTMLElement, options?: Record<string, unknown>): Promise<HTMLCanvasElement> {
  const html2canvasMod = await import('html2canvas')
  return html2canvasMod.default(element, options)
}
