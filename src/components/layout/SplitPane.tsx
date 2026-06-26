'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface SplitPaneProps {
  left: React.ReactNode
  right: React.ReactNode
  defaultLeftPercent?: number
  minLeftPercent?: number
  minRightPercent?: number
}

export function SplitPane({
  left,
  right,
  defaultLeftPercent = 35,
  minLeftPercent = 20,
  minRightPercent = 20,
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [leftPercent, setLeftPercent] = useState(defaultLeftPercent)
  const dragging = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percent = (x / rect.width) * 100
      setLeftPercent(Math.max(minLeftPercent, Math.min(100 - minRightPercent, percent)))
    }

    const handleMouseUp = () => {
      if (dragging.current) {
        dragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [minLeftPercent, minRightPercent])

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      <div style={{ width: `${leftPercent}%`, minWidth: 0, overflow: 'hidden' }}>
        {left}
      </div>
      <div
        className="relative flex-shrink-0 cursor-col-resize group z-10"
        style={{ width: 5, marginLeft: -2, marginRight: -3 }}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 left-0 right-0" />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px] bg-border group-hover:bg-blue-500/70 group-active:bg-blue-500 transition-colors rounded-full" />
      </div>
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {right}
      </div>
    </div>
  )
}
