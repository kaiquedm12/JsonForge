'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardPaste,
  Upload,
  Sparkles,
  FileJson,
  ArrowRight,
  X,
  Check,
} from 'lucide-react'
import { useStore } from '@/stores/useStore'

export function WelcomeScreen() {
  const { loadJson, loadExample } = useStore()
  const [isDragging, setIsDragging] = useState(false)
  const [showPasteInput, setShowPasteInput] = useState(false)
  const [pasteValue, setPasteValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (showPasteInput && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [showPasteInput])

  const handlePasteClick = useCallback(() => {
    setShowPasteInput(true)
    setPasteValue('')
  }, [])

  const handlePasteSubmit = useCallback(() => {
    if (pasteValue.trim()) {
      loadJson(pasteValue)
      setShowPasteInput(false)
      setPasteValue('')
    }
  }, [pasteValue, loadJson])

  const handlePasteCancel = useCallback(() => {
    setShowPasteInput(false)
    setPasteValue('')
  }, [])

  const handlePasteKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        return
      }
      if (e.key === 'Escape') {
        handlePasteCancel()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handlePasteSubmit()
      }
    },
    [handlePasteSubmit, handlePasteCancel]
  )

  const handleFileImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => loadJson(ev.target?.result as string)
        reader.readAsText(file)
      }
    },
    [loadJson]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => loadJson(ev.target?.result as string)
        reader.readAsText(file)
      }
    },
    [loadJson]
  )

  return (
    <div
      className="flex h-full items-center justify-center p-8 relative overflow-hidden"
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-violet-500/3 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 items-center justify-center mb-5 shadow-lg shadow-blue-500/20"
          >
            <FileJson size={24} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">JsonForge</h1>
          <p className="text-sm text-muted-foreground">
            Visualize, edit, and analyze JSON data in an interactive graph
          </p>
        </div>

        <div className="space-y-2.5">
          {showPasteInput ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={pasteValue}
                  onChange={(e) => setPasteValue(e.target.value)}
                  onKeyDown={handlePasteKeyDown}
                  placeholder="Paste your JSON here..."
                  className="w-full h-32 px-4 py-3 rounded-xl border border-border/50 bg-muted/20 text-sm font-mono resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  spellCheck={false}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePasteSubmit}
                  disabled={!pasteValue.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={16} />
                  Visualize JSON
                </button>
                <button
                  onClick={handlePasteCancel}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border/50 text-sm font-medium hover:bg-muted/40 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <button
                  onClick={handlePasteClick}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-blue-500/30 transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <ClipboardPaste size={16} className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Paste JSON</p>
                    <p className="text-xs text-muted-foreground">Click and paste your JSON data</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-blue-500 transition-colors" />
                </button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <button
                  onClick={handleFileImport}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-violet-500/30 transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
                    <Upload size={16} className="text-violet-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Import File</p>
                    <p className="text-xs text-muted-foreground">Upload a .json file</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-violet-500 transition-colors" />
                </button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <button
                  onClick={loadExample}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-emerald-500/30 transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                    <Sparkles size={16} className="text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Load Example</p>
                    <p className="text-xs text-muted-foreground">Try with sample data</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                </button>
              </motion.div>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
        />

        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-blue-500/5 backdrop-blur-sm rounded-2xl border-2 border-dashed border-blue-500/30"
          >
            <div className="text-center">
              <Upload size={36} className="mx-auto text-blue-500 mb-2" />
              <p className="text-sm font-medium text-blue-500">Drop your JSON file here</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
