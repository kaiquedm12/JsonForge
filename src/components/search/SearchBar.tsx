'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, X, Key, Tag, MapPin, ArrowUp, ArrowDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/cn'
import { useStore } from '@/stores/useStore'

export function SearchBar() {
  const {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    performSearch,
    searchResults,
  } = useStore()

  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value)
      if (value.length > 0) {
        performSearch()
      }
    },
    [setSearchQuery, performSearch]
  )

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    performSearch()
    setCurrentIndex(0)
  }, [setSearchQuery, performSearch])

  const cycleType = useCallback(() => {
    const types: Array<'key' | 'value' | 'path'> = ['key', 'value', 'path']
    const idx = types.indexOf(searchType)
    setSearchType(types[(idx + 1) % types.length])
  }, [searchType, setSearchType])

  return (
    <div className={cn('relative', isOpen ? 'w-64' : 'w-9')}>
      {isOpen ? (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar chaves, valores..."
            className="pl-8 pr-16 h-8 text-xs"
            onBlur={() => {
              if (!searchQuery) setIsOpen(false)
            }}
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={cycleType}
              className="p-0.5 rounded hover:bg-accent"
              title={`Buscar por: ${searchType}`}
            >
              {searchType === 'key' && <Key size={12} className="text-blue-500" />}
              {searchType === 'value' && <Tag size={12} className="text-emerald-500" />}
              {searchType === 'path' && <MapPin size={12} className="text-purple-500" />}
            </button>
            {searchQuery && (
              <button onClick={clearSearch} className="p-0.5 rounded hover:bg-accent">
                <X size={12} />
              </button>
            )}
          </div>
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-background/95 backdrop-blur-xl border border-border rounded-lg p-2 shadow-lg z-50">
              <p className="text-[10px] text-muted-foreground mb-1">
                {searchResults.length} resultado(s)
              </p>
              <div className="max-h-32 overflow-y-auto space-y-0.5">
                {searchResults.slice(0, 10).map((result, i) => (
                  <div
                    key={result}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1 rounded text-xs font-mono truncate cursor-pointer hover:bg-accent',
                      i === currentIndex && 'bg-accent'
                    )}
                  >
                    <MapPin size={10} className="text-muted-foreground shrink-0" />
                    {result}
                  </div>
                ))}
              </div>
              {searchResults.length > 10 && (
                <p className="text-[10px] text-muted-foreground text-center pt-1">
                  +{searchResults.length - 10} mais resultados
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsOpen(true)}
        >
          <Search size={14} />
        </Button>
      )}
    </div>
  )
}
