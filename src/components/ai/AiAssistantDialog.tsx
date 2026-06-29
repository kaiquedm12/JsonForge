'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sparkles, Loader2, Bot, User, Copy, Check, AlertCircle } from 'lucide-react'
import { callAiAssistant, AI_SUGGESTIONS } from '@/lib/aiAssistant'
import type { AiSuggestion } from '@/types'

interface AiAssistantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jsonInput: string
}

export function AiAssistantDialog({ open, onOpenChange, jsonInput }: AiAssistantDialogProps) {
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [customPrompt, setCustomPrompt] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleSuggestion = async (suggestion: AiSuggestion) => {
    setError('')
    if (!jsonInput) {
      setError('Carregue um JSON primeiro antes de usar o AI Assistant.')
      return
    }
    setLoading(true)
    setMessages((prev) => [...prev, { role: 'user', content: suggestion.label }])

    try {
      const response = await callAiAssistant({
        json: jsonInput,
        action: 'explain',
        instruction: suggestion.prompt,
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.content || response.error || 'Sem resposta do AI.',
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erro ao conectar com o AI Assistant.' },
      ])
    }
    setLoading(false)
  }

  const handleCustomPrompt = async () => {
    setError('')
    if (!customPrompt.trim()) return
    if (!jsonInput) {
      setError('Carregue um JSON primeiro antes de usar o AI Assistant.')
      return
    }
    setLoading(true)
    setMessages((prev) => [...prev, { role: 'user', content: customPrompt }])
    setCustomPrompt('')

    try {
      const response = await callAiAssistant({
        json: jsonInput,
        action: 'transform',
        instruction: customPrompt,
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.content || response.error || 'Sem resposta do AI.',
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erro ao conectar com o AI Assistant.' },
      ])
    }
    setLoading(false)
  }

  const copyResult = async () => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
    if (lastAssistant) {
      await navigator.clipboard.writeText(lastAssistant.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            AI Assistant
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[50vh] mb-4">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {messages.length === 0 && !error ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                Escolha uma sugestão ou digite seu próprio prompt:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {AI_SUGGESTIONS.map((s) => (
                  <Button
                    key={s.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestion(s)}
                    disabled={loading}
                    className="justify-start h-auto py-2"
                  >
                    <Bot className="w-4 h-4 mr-2 shrink-0" />
                    <span className="text-left text-xs">{s.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-primary/10' : 'bg-muted'}`}>
                    {msg.role === 'assistant' ? (
                      <Bot className="w-4 h-4 text-primary" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${msg.role === 'assistant' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                    <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI pensando...
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <Separator />

        <div className="flex gap-2 pt-2">
          <input
            className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomPrompt()}
            placeholder="Digite seu prompt personalizado..."
            disabled={loading}
          />
          <Button size="sm" onClick={handleCustomPrompt} disabled={loading || !customPrompt.trim()}>
            Enviar
          </Button>
          {messages.length > 0 && (
            <Button size="sm" variant="outline" onClick={copyResult}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
