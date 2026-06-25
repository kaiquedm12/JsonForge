'use client'

import { useState, useCallback } from 'react'
import { Share2, Link, Copy, Check, Camera, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/stores/useStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { formatJson } from '@/lib/exportUtils'

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const { jsonInput } = useStore()
  const { addSnapshot } = useHistoryStore()
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  const handleGenerateLink = useCallback(() => {
    try {
      const encoded = btoa(encodeURIComponent(jsonInput))
      const url = `${window.location.origin}/share/${encoded.slice(0, 50)}...`
      setShareUrl(url)
    } catch {
      setShareUrl(window.location.origin + '/share/custom')
    }
  }, [jsonInput])

  const handleCopyLink = useCallback(() => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [shareUrl])

  const handleSaveSnapshot = useCallback(() => {
    const formatted = formatJson(jsonInput)
    addSnapshot(formatted, `Snapshot ${new Date().toLocaleString()}`)
    onOpenChange(false)
  }, [jsonInput, addSnapshot, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar</DialogTitle>
          <DialogDescription>
            Compartilhe seu JSON ou salve um snapshot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-border/50 bg-accent/20">
            <Share2 size={32} className="text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium">Compartilhe seu JSON</p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Gere um link compartilhável ou salve um snapshot
            </p>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleGenerateLink}
            >
              <Link size={14} />
              Gerar Link Compartilhável
            </Button>

            {shareUrl && (
              <div className="flex items-center gap-2">
                <Input value={shareUrl} readOnly className="text-xs h-8" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopyLink}>
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </Button>
              </div>
            )}
          </div>

          <div className="border-t border-border/50 pt-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleSaveSnapshot}
            >
              <Camera size={14} />
              Salvar Snapshot
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
