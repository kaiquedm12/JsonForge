'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose?: () => void
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose?.(), 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border bg-background/95 backdrop-blur-xl px-4 py-3 shadow-lg animate-in slide-in-from-right-2 fade-in-0',
        type === 'success' && 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
        type === 'error' && 'border-red-500/30 text-red-600 dark:text-red-400',
        type === 'info' && 'border-blue-500/30 text-blue-600 dark:text-blue-400'
      )}
    >
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        ✕
      </button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = React.useState<{ message: string; type: ToastProps['type'] } | null>(null)

  const showToast = React.useCallback((message: string, type: ToastProps['type'] = 'info') => {
    setToast({ message, type })
  }, [])

  const hideToast = React.useCallback(() => {
    setToast(null)
  }, [])

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null

  return { showToast, ToastComponent }
}
