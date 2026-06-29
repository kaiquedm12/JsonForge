import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { ThemeMode, PanelView, ViewMode, JsonNode, JsonStats, SchemaResult, ConversionResult, Locale, ProjectData, UserProfile } from '@/types'
import { parseJson, toggleCollapse, searchNodes } from '@/lib/jsonParser'
import { buildGraph } from '@/lib/graphUtils'
import { computeStats } from '@/lib/statsUtils'
import { generateSchemas } from '@/lib/schemaGenerator'
import { convertJson } from '@/lib/converters'
import { formatJson, minifyJson, sanitizeJsonInput, compareJson } from '@/lib/exportUtils'
import { useHistoryStore } from './useHistoryStore'
import { getBrowserLocale } from '@/i18n'

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
  jsonError: string | null
  formatTrigger: number
  sidebarOpen: boolean
  rightPanelOpen: boolean
  isComparing: boolean
  comparisonJson: string
  isSettingsOpen: boolean
  isHistoryOpen: boolean
  isExportOpen: boolean
  isShareOpen: boolean
  isConvertOpen: boolean
  locale: Locale
  isValidationOpen: boolean
  isAiOpen: boolean
  isQueryOpen: boolean
  isTransformOpen: boolean
  isAuthOpen: boolean
  user: UserProfile | null
  projects: ProjectData[]
  customTheme: Record<string, string> | null
  schemaAware: boolean

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
  setJsonError: (error: string | null) => void
  triggerFormat: () => void
  startCompare: () => void
  setComparisonJson: (json: string) => void
  getGraphData: () => { nodes: any[]; edges: any[] }
  getStats: () => JsonStats | null
  getSchemas: () => SchemaResult | null
  getConversions: () => ConversionResult | null
  getDiff: () => { added: string[]; removed: string[]; changed: string[] }
  newProject: () => void
  loadExample: () => void
  setLocale: (locale: Locale) => void
  setValidationOpen: (open: boolean) => void
  setAiOpen: (open: boolean) => void
  setQueryOpen: (open: boolean) => void
  setTransformOpen: (open: boolean) => void
  setAuthOpen: (open: boolean) => void
  setUser: (user: UserProfile | null) => void
  saveProject: (name: string) => void
  loadProject: (id: string) => void
  deleteProject: (id: string) => void
  setCustomTheme: (theme: Record<string, string> | null) => void
  setSchemaAware: (on: boolean) => void
}

export const useStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    theme: 'dark' as ThemeMode,
    viewMode: 'dashboard' as ViewMode,
    panelView: 'structure' as PanelView,
    jsonInput: '',
    jsonOutput: '',
    jsonNode: null,
    searchQuery: '',
    searchType: 'key' as const,
    searchResults: [],
    collapsedPaths: new Set<string>(),
    jsonError: null,
    formatTrigger: 0,
    sidebarOpen: true,
    rightPanelOpen: false,
    isComparing: false,
    comparisonJson: '',
    isSettingsOpen: false,
    isHistoryOpen: false,
    isExportOpen: false,
    isShareOpen: false,
    isConvertOpen: false,
    locale: getBrowserLocale(),
    isValidationOpen: false,
    isAiOpen: false,
    isQueryOpen: false,
    isTransformOpen: false,
    isAuthOpen: false,
    user: null,
    projects: [],
    customTheme: null,
    schemaAware: false,

    setTheme: (theme) => set({ theme }),
    setViewMode: (mode) => set({ viewMode: mode }),
    setPanelView: (view) => set({ panelView: view }),
    setLocale: (locale) => set({ locale }),

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
          rightPanelOpen: false,
          collapsedPaths: new Set<string>(),
          searchResults: [],
        })
      } catch (e) {
        console.error('Invalid JSON:', e)
      }
    },

    formatJson: () => {
      set({ formatTrigger: get().formatTrigger + 1 })
    },

    triggerFormat: () => {
      set({ formatTrigger: get().formatTrigger + 1 })
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
    setJsonError: (error) => set({ jsonError: error }),
    setValidationOpen: (open) => set({ isValidationOpen: open }),
    setAiOpen: (open) => set({ isAiOpen: open }),
    setQueryOpen: (open) => set({ isQueryOpen: open }),
    setTransformOpen: (open) => set({ isTransformOpen: open }),
    setAuthOpen: (open) => set({ isAuthOpen: open }),

    setUser: (user) => {
      set({ user })
      if (user && typeof window !== 'undefined') {
        localStorage.setItem('jsonforge_user', JSON.stringify(user))
      } else if (typeof window !== 'undefined') {
        localStorage.removeItem('jsonforge_user')
      }
    },

    setCustomTheme: (theme) => {
      set({ customTheme: theme })
      if (typeof window !== 'undefined') {
        if (theme) {
          localStorage.setItem('jsonforge_custom_theme', JSON.stringify(theme))
        } else {
          localStorage.removeItem('jsonforge_custom_theme')
        }
      }
    },

    setSchemaAware: (on) => set({ schemaAware: on }),

    saveProject: (name) => {
      const { jsonInput, projects } = get()
      const project: ProjectData = {
        id: crypto.randomUUID(),
        name,
        json: jsonInput,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      const updated = [project, ...projects]
      set({ projects: updated })
      if (typeof window !== 'undefined') {
        localStorage.setItem('jsonforge_projects', JSON.stringify(updated))
      }
    },

    loadProject: (id) => {
      const { projects } = get()
      const project = projects.find((p) => p.id === id)
      if (project) {
        get().loadJson(project.json)
      }
    },

    deleteProject: (id) => {
      const { projects } = get()
      const updated = projects.filter((p) => p.id !== id)
      set({ projects: updated })
      if (typeof window !== 'undefined') {
        localStorage.setItem('jsonforge_projects', JSON.stringify(updated))
      }
    },

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
