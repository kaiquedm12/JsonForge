import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { ThemeMode, PanelView, ViewMode, JsonNode, JsonStats, SchemaResult, ConversionResult } from '@/types'
import { parseJson, toggleCollapse, searchNodes } from '@/lib/jsonParser'
import { buildGraph } from '@/lib/graphUtils'
import { computeStats } from '@/lib/statsUtils'
import { generateSchemas } from '@/lib/schemaGenerator'
import { convertJson } from '@/lib/converters'
import { formatJson, minifyJson, sanitizeJsonInput, compareJson } from '@/lib/exportUtils'
import { useHistoryStore } from './useHistoryStore'

const DEFAULT_JSON = JSON.stringify(
  {
    name: 'JsonForge',
    version: '1.0.0',
    description: 'Visual JSON explorer',
    features: ['visualization', 'editing', 'analysis', 'export'],
    metadata: {
      author: 'JsonForge Team',
      license: 'MIT',
      createdAt: '2025-01-01',
    },
    stats: {
      users: 1000,
      rating: 4.8,
      active: true,
    },
  },
  null,
  2
)

interface AppState {
  theme: ThemeMode
  viewMode: ViewMode
  panelView: PanelView
  jsonInput: string
  jsonOutput: string
  jsonNode: JsonNode | null
  searchQuery: string
  searchType: 'key' | 'value' | 'path'
  searchResults: string[]
  collapsedPaths: Set<string>
  sidebarOpen: boolean
  rightPanelOpen: boolean
  isComparing: boolean
  comparisonJson: string
  isSettingsOpen: boolean
  isHistoryOpen: boolean
  isExportOpen: boolean
  isShareOpen: boolean
  isConvertOpen: boolean

  setTheme: (theme: ThemeMode) => void
  setViewMode: (mode: ViewMode) => void
  setPanelView: (view: PanelView) => void
  setJsonInput: (input: string) => void
  loadJson: (jsonString: string) => void
  formatJson: () => void
  minifyJson: () => void
  toggleCollapse: (path: string) => void
  setSearchQuery: (query: string) => void
  setSearchType: (type: 'key' | 'value' | 'path') => void
  performSearch: () => void
  setSidebarOpen: (open: boolean) => void
  setRightPanelOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setHistoryOpen: (open: boolean) => void
  setExportOpen: (open: boolean) => void
  setShareOpen: (open: boolean) => void
  setConvertOpen: (open: boolean) => void
  startCompare: () => void
  setComparisonJson: (json: string) => void
  getGraphData: () => { nodes: any[]; edges: any[] }
  getStats: () => JsonStats | null
  getSchemas: () => SchemaResult | null
  getConversions: () => ConversionResult | null
  getDiff: () => { added: string[]; removed: string[]; changed: string[] }
  newProject: () => void
  loadExample: () => void
}

export const useStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    theme: 'dark',
    viewMode: 'dashboard',
    panelView: 'structure',
    jsonInput: '',
    jsonOutput: '',
    jsonNode: null,
    searchQuery: '',
    searchType: 'key' as const,
    searchResults: [],
    collapsedPaths: new Set<string>(),
    sidebarOpen: true,
    rightPanelOpen: false,
    isComparing: false,
    comparisonJson: '',
    isSettingsOpen: false,
    isHistoryOpen: false,
    isExportOpen: false,
    isShareOpen: false,
    isConvertOpen: false,

    setTheme: (theme) => set({ theme }),

    setViewMode: (mode) => set({ viewMode: mode }),

    setPanelView: (view) => set({ panelView: view }),

    setJsonInput: (input) => {
      set({ jsonInput: input })
      try {
        const formatted = formatJson(input)
        set({ jsonOutput: formatted })
      } catch {
        set({ jsonOutput: input })
      }
    },

    loadJson: (jsonString) => {
      try {
        const formatted = formatJson(jsonString)
        const node = parseJson(jsonString)
        const history = useHistoryStore.getState()
        history.pushState(formatted, 'Loaded JSON', 'manual')

        set({
          jsonInput: jsonString,
          jsonOutput: formatted,
          jsonNode: node,
          viewMode: 'editor',
          rightPanelOpen: true,
          collapsedPaths: new Set<string>(),
          searchResults: [],
        })
      } catch (e) {
        console.error('Invalid JSON:', e)
      }
    },

    formatJson: () => {
      const { jsonInput } = get()
      try {
        const formatted = formatJson(jsonInput)
        set({ jsonInput: formatted, jsonOutput: formatted })
        const history = useHistoryStore.getState()
        history.pushState(formatted, 'Formatted', 'auto')
      } catch {}
    },

    minifyJson: () => {
      const { jsonInput } = get()
      try {
        const minified = minifyJson(jsonInput)
        set({ jsonInput: minified, jsonOutput: minified })
        useHistoryStore.getState().pushState(minified, 'Minified', 'auto')
      } catch {}
    },

    toggleCollapse: (path) => {
      const { jsonNode, collapsedPaths } = get()
      if (!jsonNode) return

      const newCollapsed = new Set(collapsedPaths)
      if (newCollapsed.has(path)) {
        newCollapsed.delete(path)
      } else {
        newCollapsed.add(path)
      }
      set({ collapsedPaths: newCollapsed, jsonNode: toggleCollapse(jsonNode, path) })
    },

    setSearchQuery: (query) => set({ searchQuery: query }),

    setSearchType: (type) => set({ searchType: type }),

    performSearch: () => {
      const { jsonNode, searchQuery, searchType } = get()
      if (!jsonNode || !searchQuery) {
        set({ searchResults: [] })
        return
      }
      const results = searchNodes(jsonNode, searchQuery, searchType)
      set({ searchResults: results })
    },

    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
    setSettingsOpen: (open) => set({ isSettingsOpen: open }),
    setHistoryOpen: (open) => set({ isHistoryOpen: open }),
    setExportOpen: (open) => set({ isExportOpen: open }),
    setShareOpen: (open) => set({ isShareOpen: open }),
    setConvertOpen: (open) => set({ isConvertOpen: open }),

    startCompare: () => {
      set({ isComparing: true, comparisonJson: get().jsonInput })
    },

    setComparisonJson: (json) => set({ comparisonJson: json }),

    getGraphData: () => {
      const { jsonNode, collapsedPaths } = get()
      if (!jsonNode) return { nodes: [], edges: [] }
      return buildGraph(jsonNode, collapsedPaths)
    },

    getStats: () => {
      const { jsonNode, jsonInput } = get()
      if (!jsonNode) return null
      return computeStats(jsonNode, jsonInput)
    },

    getSchemas: () => {
      const { jsonInput } = get()
      if (!jsonInput) return null
      try {
        return generateSchemas(jsonInput)
      } catch {
        return null
      }
    },

    getConversions: () => {
      const { jsonInput } = get()
      if (!jsonInput) return null
      try {
        return convertJson(jsonInput)
      } catch {
        return null
      }
    },

    getDiff: () => {
      const { jsonInput, comparisonJson } = get()
      return compareJson(jsonInput, comparisonJson)
    },

    newProject: () => {
      set({
        viewMode: 'dashboard',
        jsonInput: '',
        jsonOutput: '',
        jsonNode: null,
        searchResults: [],
        collapsedPaths: new Set(),
        rightPanelOpen: false,
      })
    },

    loadExample: () => {
      get().loadJson(DEFAULT_JSON)
    },
  }))
)
