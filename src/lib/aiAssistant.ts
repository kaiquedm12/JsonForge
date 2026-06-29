import { AiSuggestion } from '@/types'

export interface AiRequest {
  json: string
  action: 'transform' | 'explain' | 'generate' | 'suggest-schema' | 'mock-data'
  instruction?: string
}

export interface AiResponse {
  content: string
  error?: string
}

const API_ENDPOINT = '/api/ai/assist'

export async function callAiAssistant(request: AiRequest): Promise<AiResponse> {
  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }))
      return { content: '', error: err.error || `HTTP ${res.status}` }
    }

    return await res.json()
  } catch (e) {
    return {
      content: '',
      error: e instanceof Error ? e.message : 'Network error',
    }
  }
}

export const AI_SUGGESTIONS: AiSuggestion[] = [
  {
    label: 'Explain Structure',
    prompt: 'Explain the structure of this JSON in simple terms. What does it represent?',
  },
  {
    label: 'Generate Mock Data',
    prompt: 'Generate 5 realistic mock data entries following the same structure as this JSON.',
  },
  {
    label: 'Optimize Schema',
    prompt: 'Suggest improvements to make this JSON structure more efficient and cleaner.',
  },
  {
    label: 'Identify Issues',
    prompt: 'Analyze this JSON for potential issues, inconsistencies, or anti-patterns.',
  },
  {
    label: 'Suggest Schema',
    prompt: 'Generate a JSON Schema (draft-07) that validates this JSON structure.',
  },
]
