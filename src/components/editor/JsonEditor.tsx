'use client'

import { useCallback, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { OnMount, OnChange } from '@monaco-editor/react'
import { useStore } from '@/stores/useStore'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export function JsonEditor() {
  const { jsonInput, setJsonInput, loadJson, theme, jsonError, setJsonError, formatTrigger } = useStore()
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor
    editor.focus()

    editor.addAction({
      id: 'format-json',
      label: 'Format JSON',
      keybindings: [2048 | 36],
      run: (ed) => {
        try {
          const val = ed.getValue()
          const formatted = JSON.stringify(JSON.parse(val), null, 2)
          ed.setValue(formatted)
        } catch {}
      },
    })
  }, [])

  const handleChange: OnChange = useCallback(
    (value) => {
      if (value === undefined) return
      setJsonInput(value)
      setJsonError(null)

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const trimmed = value.trim()
        if (!trimmed) {
          setJsonError(null)
          return
        }
        try {
          JSON.parse(trimmed)
          loadJson(trimmed)
          setJsonError(null)
        } catch (e) {
          setJsonError(e instanceof SyntaxError ? e.message : 'Invalid JSON')
        }
      }, 300)
    },
    [setJsonInput, loadJson, setJsonError]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    const action = editor.getAction('format-json')
    if (action) {
      action.run()
    }
  }, [formatTrigger])

  return (
    <div className="h-full w-full flex flex-col relative">
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language="json"
          value={jsonInput}
          onChange={handleChange}
          onMount={handleMount}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            tabSize: 2,
            automaticLayout: true,
            formatOnPaste: true,
            bracketPairColorization: { enabled: true },
            padding: { top: 16, bottom: 16 } as { top: number; bottom: number },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            wordWrap: 'on',
            folding: true,
            foldingHighlight: true,
            renderWhitespace: 'selection',
            suggest: { showMethods: false, showFunctions: false },
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
        />
      </div>
      {jsonError && (
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-1.5 bg-red-950/80 border-t border-red-900/50 text-red-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          <span className="truncate">{jsonError}</span>
        </div>
      )}
      {!jsonError && jsonInput && (
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-1.5 bg-emerald-950/40 border-t border-emerald-900/30 text-emerald-500 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <span>Valid JSON</span>
        </div>
      )}
    </div>
  )
}
