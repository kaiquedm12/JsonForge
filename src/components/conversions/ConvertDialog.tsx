'use client'

import { useState, useMemo, useCallback } from 'react'
import { Copy, Check, Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStore } from '@/stores/useStore'
import { downloadAsFile } from '@/lib/exportUtils'

interface ConvertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FormatType = 'yaml' | 'xml' | 'csv' | 'toml'

export function ConvertDialog({ open, onOpenChange }: ConvertDialogProps) {
  const { getConversions } = useStore()
  const conversions = useMemo(() => getConversions(), [getConversions])
  const [activeFormat, setActiveFormat] = useState<FormatType>('yaml')
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (!conversions) return
    navigator.clipboard.writeText(conversions[activeFormat])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [conversions, activeFormat])

  const handleDownload = useCallback(() => {
    if (!conversions) return
    const ext: Record<FormatType, string> = {
      yaml: '.yaml',
      xml: '.xml',
      csv: '.csv',
      toml: '.toml',
    }
    const mime: Record<FormatType, string> = {
      yaml: 'text/yaml',
      xml: 'application/xml',
      csv: 'text/csv',
      toml: 'text/toml',
    }
    downloadAsFile(conversions[activeFormat], `jsonforge${ext[activeFormat]}`, mime[activeFormat])
  }, [conversions, activeFormat])

  if (!conversions) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conversões</DialogTitle>
            <DialogDescription>Carregue um JSON para converter</DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center text-sm text-muted-foreground">
            Nenhum JSON carregado
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Converter JSON</DialogTitle>
          <DialogDescription>
            Converta seu JSON para outros formatos
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeFormat} onValueChange={(v) => setActiveFormat(v as FormatType)}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="yaml">YAML</TabsTrigger>
            <TabsTrigger value="xml">XML</TabsTrigger>
            <TabsTrigger value="csv">CSV</TabsTrigger>
            <TabsTrigger value="toml">TOML</TabsTrigger>
          </TabsList>

          <div className="flex items-center justify-between py-2">
            <Badge variant="outline" className="text-[10px] uppercase">
              {activeFormat}
            </Badge>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDownload}>
                <Download size={12} />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-64">
            <pre className="text-xs font-mono p-4 rounded-lg bg-accent/30 border border-border/50 overflow-x-auto whitespace-pre-wrap">
              <code>{conversions[activeFormat]}</code>
            </pre>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
