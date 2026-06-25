'use client'

import { useCallback, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { OnMount } from '@monaco-editor/react'
import { useStore } from '@/stores/useStore'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export function JsonEditor() {
  const { jsonInput, setJsonInput, loadJson, theme } = useStore()
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

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        setJsonInput(value)

        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          try {
            JSON.parse(value)
            loadJson(value)
          } catch {}
        }, 800)
      }
    },
    [setJsonInput, loadJson]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className="h-full w-full">
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
          lineNumbers: 'off',
          scrollBeyondLastLine: false,
          tabSize: 2,
          automaticLayout: true,
          formatOnPaste: true,
          bracketPairColorization: { enabled: true },
          padding: { top: 24, bottom: 24 } as { top: number; bottom: number },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          wordWrap: 'on',
          folding: true,
          foldingHighlight: true,
          renderWhitespace: 'selection',
          suggest: { showMethods: false, showFunctions: false },
        }}
      />
    </div>
  )
}
