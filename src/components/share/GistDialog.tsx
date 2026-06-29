'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GitCommit, Loader2, Check, Copy, ExternalLink } from 'lucide-react'

interface GistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jsonInput: string
}

export function GistDialog({ open, onOpenChange, jsonInput }: GistDialogProps) {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [gistUrl, setGistUrl] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const createGist = async () => {
    if (!token.trim()) {
      setError('GitHub token is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'Shared from JsonForge',
          public: false,
          files: {
            'data.json': { content: jsonInput },
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to create gist')
      }

      const data = await res.json()
      setGistUrl(data.html_url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create gist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCommit className="w-5 h-5" />
            Compartilhar no GitHub Gist
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="password"
            placeholder="GitHub Personal Access Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Seu token é enviado diretamente para a API do GitHub e não é armazenado.
            Crie um token em github.com/settings/tokens (escopo: gist).
          </p>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          {gistUrl ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                <Check className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-sm truncate">{gistUrl}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(gistUrl)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                >
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  Copiar URL
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(gistUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Abrir
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={createGist} disabled={loading || !token} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GitCommit className="w-4 h-4 mr-2" />}
              {loading ? 'Criando...' : 'Criar Gist'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
