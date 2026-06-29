'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Paintbrush, RotateCcw } from 'lucide-react'

interface CustomTheme {
  name: string
  background: string
  foreground: string
  primary: string
  muted: string
  border: string
}

const DEFAULT_THEME: CustomTheme = {
  name: 'Custom',
  background: '#0a0a0b',
  foreground: '#fafafa',
  primary: '#6366f1',
  muted: '#27272a',
  border: '#27272a',
}

interface CustomThemeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTheme: CustomTheme | null
  onApply: (theme: CustomTheme) => void
}

export function CustomThemeDialog({ open, onOpenChange, currentTheme, onApply }: CustomThemeDialogProps) {
  const [theme, setTheme] = useState<CustomTheme>(currentTheme || DEFAULT_THEME)

  const updateColor = (key: keyof CustomTheme, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paintbrush className="w-5 h-5" />
            Editor de Temas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Nome do tema"
              value={theme.name}
              onChange={(e) => updateColor('name', e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTheme(DEFAULT_THEME)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['background', 'foreground', 'primary', 'muted', 'border'] as const).map((key) => (
              <div key={key}>
                <label className="text-xs capitalize text-muted-foreground mb-1 block">
                  {key}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border"
                  />
                  <Input
                    value={theme[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            className="p-4 rounded-lg border"
            style={{
              background: theme.background,
              color: theme.foreground,
              borderColor: theme.border,
            }}
          >
            <p className="text-sm font-medium mb-2">Preview</p>
            <div
              className="px-3 py-2 rounded text-sm"
              style={{ background: theme.primary, color: '#fff' }}
            >
              Botão Primário
            </div>
            <div
              className="px-3 py-2 rounded text-sm mt-2"
              style={{ background: theme.muted, color: theme.foreground }}
            >
              Elemento secundário
            </div>
          </div>

          <Button onClick={() => onApply(theme)} className="w-full">
            Aplicar Tema
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
