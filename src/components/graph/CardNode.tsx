'use client'

import { memo, useCallback } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import { TypeBadge } from './TypeBadge'
import { useStore } from '@/stores/useStore'
import type { CardNodeData } from '@/lib/treeBuilder'

const valueColors: Record<string, string> = {
  string: '#10b981',
  number: '#f59e0b',
  boolean: '#3b82f6',
  null: '#71717a',
}

function CardNode({ data }: { data: CardNodeData }) {
  const toggleCollapse = useStore((s) => s.toggleCollapse)
  const collapsedPaths = useStore((s) => s.collapsedPaths)
  const { fitView } = useReactFlow()

  const isCollapsed = collapsedPaths.has(data.path)

  const handleCollapse = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      toggleCollapse(data.path)
    },
    [toggleCollapse, data.path]
  )

  const handleChildClick = useCallback(
    (childPath: string) => {
      const el = document.querySelector(`[data-card-id="${childPath}"]`)
      if (el) {
        fitView({ duration: 300, padding: 0.5 })
      }
    },
    [fitView]
  )

  const hasConnections = data.childRefs.length > 0 && !isCollapsed
  const isEmpty = data.fields.length === 0 && data.childRefs.length === 0

  return (
    <div
      data-card-id={data.path}
      style={{
        width: data.width,
        background: '#171717',
        border: '1px solid #303030',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans), system-ui, sans-serif',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease',
      }}
      className="jsonforge-card"
    >
      {data.depth > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            width: 8,
            height: 8,
            background: '#303030',
            border: '2px solid #171717',
            opacity: 0,
          }}
        />
      )}

      <div
        style={{
          padding: '14px 16px 8px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#fafafa',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {data.key}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 4,
            }}
          >
            <TypeBadge type={data.type} />
            <span
              style={{
                fontSize: 11,
                color: '#a1a1aa',
                fontWeight: 500,
              }}
            >
              {data.childrenCount} {data.type === 'array' ? 'items' : 'keys'}
            </span>
          </div>
        </div>

        <button
          onClick={handleCollapse}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6,
            color: '#a1a1aa',
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 12,
            lineHeight: 1,
            padding: 0,
            flexShrink: 0,
            transition: 'background 0.15s, transform 0.15s',
            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          }}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          ▼
        </button>
      </div>

      {!isEmpty && (
        <div
          style={{
            height: 1,
            background: '#303030',
            margin: '0 16px',
          }}
        />
      )}

      {isEmpty ? (
        <div
          style={{
            padding: '12px 16px 14px',
            fontSize: 12,
            color: '#52525b',
            fontStyle: 'italic',
          }}
        >
          {data.type === 'array' ? 'empty array' : 'no properties'}
        </div>
      ) : (
        <div style={{ padding: '6px 16px 10px' }}>
          {data.fields.map((field) => (
            <div
              key={field.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '3px 0',
                minHeight: 24,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#e4e4e7',
                  minWidth: 80,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                title={field.key}
              >
                {field.key}
              </span>
              <div style={{ flexShrink: 0 }}>
                <TypeBadge type={field.type} size="xs" />
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-mono), monospace',
                  color: valueColors[field.type] ?? '#a1a1aa',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  textAlign: 'right',
                }}
                title={field.value}
              >
                {field.value}
              </span>
            </div>
          ))}

          {data.fields.length > 0 && data.childRefs.length > 0 && (
            <div style={{ height: 1, background: '#27272a', margin: '4px 0' }} />
          )}

          {!isCollapsed &&
            data.childRefs.map((ref) => (
              <div
                key={ref.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '3px 0',
                  minHeight: 24,
                  cursor: 'pointer',
                  borderRadius: 4,
                  transition: 'background 0.1s',
                }}
                onClick={() => handleChildClick(ref.path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#e4e4e7',
                    minWidth: 80,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                  title={ref.key}
                >
                  {ref.key}
                </span>
                <div style={{ flexShrink: 0 }}>
                  <TypeBadge type={ref.type} size="xs" />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: '#a1a1aa',
                    flex: 1,
                    textAlign: 'right',
                  }}
                >
                  {ref.childrenCount} {ref.type === 'array' ? 'items' : 'keys'}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: '#52525b',
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  →
                </span>
              </div>
            ))}
        </div>
      )}

      {hasConnections && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            width: 8,
            height: 8,
            background: '#303030',
            border: '2px solid #171717',
            opacity: 0,
          }}
        />
      )}
    </div>
  )
}

export default memo(CardNode)
