'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { validateJsonAgainstSchema, inferSchemaFromJson } from '@/lib/schemaValidator'
import type { ValidationResult } from '@/types'

interface ValidationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jsonInput: string
}

export function ValidationDialog({ open, onOpenChange, jsonInput }: ValidationDialogProps) {
  const [schema, setSchema] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [validating, setValidating] = useState(false)

  const handleValidate = () => {
    setValidating(true)
    const res = validateJsonAgainstSchema(jsonInput, schema)
    setResult(res)
    setValidating(false)
  }

  const handleInferSchema = () => {
    try {
      const inferred = inferSchemaFromJson(jsonInput)
      setSchema(inferred)
    } catch {
      // Invalid JSON
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Validar contra JSON Schema</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">JSON Schema</label>
              <Button variant="outline" size="sm" onClick={handleInferSchema}>
                Inferir do JSON
              </Button>
            </div>
            <textarea
              className="w-full h-48 p-3 font-mono text-sm border rounded-md bg-muted"
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              placeholder="Cole seu JSON Schema aqui..."
            />
          </div>

          <Button onClick={handleValidate} disabled={!schema || validating}>
            {validating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Validar
          </Button>

          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {result.valid ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-green-500 font-medium">JSON válido!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <span className="text-destructive font-medium">
                      {result.errors.length} erro(s) encontrado(s)
                    </span>
                  </>
                )}
              </div>

              {!result.valid && (
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {result.errors.map((err, i) => (
                      <div key={i} className="p-3 rounded-md bg-destructive/10 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            {err.path}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {err.keyword}
                          </Badge>
                        </div>
                        <p className="text-foreground/80">{err.message}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
