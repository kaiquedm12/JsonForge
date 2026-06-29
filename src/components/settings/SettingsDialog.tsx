'use client'

import { useCallback, useState } from 'react'
import { Moon, Sun, Monitor, Palette, Type, Layout, Languages, Paintbrush, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/cn'
import { useStore } from '@/stores/useStore'
import { CustomThemeDialog } from './CustomThemeDialog'
import type { ThemeMode, Locale } from '@/types'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const themes: { value: ThemeMode; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'light', label: 'Claro', icon: Sun, desc: 'Tema claro' },
  { value: 'dark', label: 'Escuro', icon: Moon, desc: 'Tema escuro' },
  { value: 'system', label: 'Sistema', icon: Monitor, desc: 'Segue o sistema' },
]

const languages: { value: Locale; label: string; native: string }[] = [
  { value: 'pt-BR', label: 'Português (BR)', native: 'Português' },
  { value: 'en-US', label: 'English (US)', native: 'English' },
  { value: 'es', label: 'Español', native: 'Español' },
]

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme, locale, setLocale, customTheme, setCustomTheme } = useStore()
  const [showCustomTheme, setShowCustomTheme] = useState(false)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
            <DialogDescription>
              Personalize sua experiência no JsonForge
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Palette size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium">Tema</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                      theme === t.value
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-border/50 bg-accent/20 hover:border-blue-500/30'
                    )}
                  >
                    <t.icon
                      size={20}
                      className={theme === t.value ? 'text-blue-500' : 'text-muted-foreground'}
                    />
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full gap-2"
                onClick={() => setShowCustomTheme(true)}
              >
                <Paintbrush size={14} />
                Tema Customizado
              </Button>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Languages size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium">Idioma</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setLocale(lang.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all',
                      locale === lang.value
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-border/50 bg-accent/20 hover:border-blue-500/30'
                    )}
                  >
                    <span className="text-sm font-medium">{lang.native}</span>
                    <span className="text-[10px] text-muted-foreground">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type size={14} className="text-muted-foreground" />
                <span className="text-sm">Fonte do Editor</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                JetBrains Mono
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layout size={14} className="text-muted-foreground" />
                <span className="text-sm">Layout</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                Painéis Laterais
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CustomThemeDialog
        open={showCustomTheme}
        onOpenChange={setShowCustomTheme}
        currentTheme={customTheme ? (customTheme as unknown as { name: string; background: string; foreground: string; primary: string; muted: string; border: string }) : null}
        onApply={(t) => {
          setCustomTheme(t as unknown as Record<string, string>)
          setShowCustomTheme(false)
        }}
      />
    </>
  )
}
