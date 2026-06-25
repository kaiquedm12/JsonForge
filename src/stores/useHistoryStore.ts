import { create } from 'zustand'
import { HistoryEntry } from '@/types'

const STORAGE_KEY = 'jsonforge_history'
const MAX_ENTRIES = 50

function loadPersisted(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persist(entries: HistoryEntry[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {}
}

interface HistoryState {
  past: HistoryEntry[]
  future: HistoryEntry[]
  entries: HistoryEntry[]

  pushState: (json: string, label: string, type: HistoryEntry['type']) => void
  undo: () => string | null
  redo: () => string | null
  getHistory: () => HistoryEntry[]
  clearHistory: () => void
  addSnapshot: (json: string, label: string) => void
  canUndo: () => boolean
  canRedo: () => boolean
}

const persisted = loadPersisted()

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: persisted.length > 0 ? persisted : [],
  future: [],
  entries: persisted,

  pushState: (json, label, type) => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      json,
      timestamp: Date.now(),
      label,
      type,
    }

    set((state) => {
      const newEntries = [entry, ...state.entries].slice(0, MAX_ENTRIES)
      persist(newEntries)
      return {
        past: [...state.past, entry],
        future: [],
        entries: newEntries,
      }
    })
  },

  undo: () => {
    const { past } = get()
    if (past.length <= 1) return null

    const newPast = [...past]
    const current = newPast.pop()!
    const previous = newPast[newPast.length - 1]

    set((state) => ({
      past: newPast,
      future: [current, ...state.future],
    }))

    return previous?.json ?? null
  },

  redo: () => {
    const { future, past } = get()
    if (future.length === 0) return null

    const newFuture = [...future]
    const next = newFuture.shift()!

    set((state) => ({
      past: [...past, next],
      future: newFuture,
    }))

    return next.json
  },

  getHistory: () => get().entries,
  clearHistory: () => {
    persist([])
    set({ past: [], future: [], entries: [] })
  },

  addSnapshot: (json, label) => {
    get().pushState(json, label, 'snapshot')
  },

  canUndo: () => get().past.length > 1,
  canRedo: () => get().future.length > 0,
}))
