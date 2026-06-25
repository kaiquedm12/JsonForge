'use client'

import { useMemo } from 'react'
import { useStore } from '@/stores/useStore'

export function SchemaGenerator() {
  const { getSchemas } = useStore()
  const schemas = useMemo(() => getSchemas(), [getSchemas])

  if (!schemas) return null

  return null
}
