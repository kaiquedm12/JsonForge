'use client'

import { useMemo } from 'react'
import { useStore } from '@/stores/useStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Braces, Brackets, Type, Hash, ToggleLeft, Ban, Layers, FileText, Activity, Key } from 'lucide-react'
import { formatFileSize } from '@/lib/statsUtils'
import { cn } from '@/lib/cn'

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border/50">
      <div className={cn('p-2 rounded-lg', `${color}/10`)}>
        <Icon size={16} className={color} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  )
}

export function StatsPanel() {
  const { getStats } = useStore()
  const stats = useMemo(() => getStats(), [getStats])

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity size={32} className="text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Carregue um JSON para ver estatísticas</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3">
        <StatCard icon={Braces} label="Objetos" value={stats.totalObjects} color="text-blue-500" />
        <StatCard icon={Brackets} label="Arrays" value={stats.totalArrays} color="text-purple-500" />
        <StatCard icon={Type} label="Strings" value={stats.totalStrings} color="text-emerald-500" />
        <StatCard icon={Hash} label="Números" value={stats.totalNumbers} color="text-amber-500" />
        <StatCard icon={ToggleLeft} label="Booleanos" value={stats.totalBooleans} color="text-red-500" />
        <StatCard icon={Ban} label="Nulls" value={stats.totalNulls} color="text-gray-500" />
        <StatCard icon={Layers} label="Profundidade Máx" value={stats.maxDepth} color="text-cyan-500" />
        <StatCard icon={FileText} label="Tamanho" value={formatFileSize(stats.fileSize)} color="text-rose-500" />
        <StatCard icon={Key} label="Chaves Únicas" value={stats.uniqueKeys} color="text-indigo-500" />
        <StatCard icon={Activity} label="Complexidade" value={stats.complexity} color="text-orange-500" />
      </div>
    </ScrollArea>
  )
}
