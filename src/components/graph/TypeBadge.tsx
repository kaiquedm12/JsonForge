'use client'

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
  string:  { label: 'STRING',  color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  number:  { label: 'NUMBER',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  boolean: { label: 'BOOLEAN', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  null:    { label: 'NULL',    color: '#71717a', bg: 'rgba(113,113,122,0.12)' },
  object:  { label: 'OBJECT',  color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  array:   { label: 'ARRAY',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
}

export function TypeBadge({ type, size = 'sm' }: { type: string; size?: 'sm' | 'xs' }) {
  const cfg = typeConfig[type] ?? typeConfig.null
  const fontSize = size === 'xs' ? '9px' : '10px'
  const px = size === 'xs' ? '4px' : '6px'
  const py = size === 'xs' ? '1px' : '2px'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        fontSize,
        fontWeight: 600,
        fontFamily: 'var(--font-mono), monospace',
        letterSpacing: '0.02em',
        color: cfg.color,
        background: cfg.bg,
        padding: `${py} ${px}`,
        borderRadius: '4px',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  )
}
