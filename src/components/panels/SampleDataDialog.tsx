'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Beaker, Copy, Check, Loader2 } from 'lucide-react'
import { generateSampleData } from '@/lib/dataGenerator'

interface SampleDataDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jsonInput: string
  onApply: (result: string) => void
}

export function SampleDataDialog({ open, onOpenChange, jsonInput, onApply }: SampleDataDialogProps) {
  const [count, setCount] = useState(1)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    try {
      const schema = JSON.parse(jsonInput)
      const inferredSchema = JSON.stringify({
        type: typeof schema === 'object' && !Array.isArray(schema) ? 'object' : 'array',
        properties: typeof schema === 'object' && !Array.isArray(schema)
          ? Object.fromEntries(
              Object.entries(schema as Record<string, unknown>).map(([k, v]) => [
                k,
                { type: typeof v === 'string' ? 'string' : typeof v === 'number' ? 'number' : typeof v === 'boolean' ? 'boolean' : 'object' },
              ])
            )
          : {},
      })
      const data = generateSampleData(inferredSchema, count)
      setResult(data)
    } catch {
      setResult('Invalid JSON input')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Beaker className="w-5 h-5" />
            Gerador de Dados de Exemplo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">registro(s)</span>
            <Button size="sm" onClick={handleGenerate} className="ml-auto">
              <Beaker className="w-4 h-4 mr-1" />
              Gerar
            </Button>
          </div>

          {result && (
            <div className="space-y-2">
              <pre className="text-xs font-mono p-3 rounded-lg bg-muted border max-h-60 overflow-auto whitespace-pre-wrap">
                <code>{result}</code>
              </pre>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(result)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                >
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  Copiar
                </Button>
                <Button size="sm" onClick={() => onApply(result)}>
                  Usar no Editor
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
