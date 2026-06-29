import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const SYSTEM_PROMPTS: Record<string, string> = {
  transform: 'Transform the JSON according to the user instruction. Return ONLY the transformed JSON, no explanation.',
  explain: 'Explain the structure and purpose of this JSON in simple, clear terms.',
  generate: 'Generate mock data based on the structure of the provided JSON.',
  'suggest-schema': 'Generate a JSON Schema (draft-07) that validates the provided JSON structure.',
  'mock-data': 'Generate realistic sample data entries following the same JSON structure.',
}

export async function POST(request: NextRequest) {
  try {
    const { json, action, instruction } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { content: '', error: 'API key not configured. Set GEMINI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    const systemPrompt = SYSTEM_PROMPTS[action as string] || 'Analyze and respond about this JSON.'
    const userMsg = instruction
      ? `JSON:\n\`\`\`json\n${json}\n\`\`\`\n\nInstruction: ${instruction}`
      : `JSON:\n\`\`\`json\n${json}\n\`\`\`\n\n${systemPrompt}`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(userMsg)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ content: text })
  } catch (error) {
    return NextResponse.json(
      { content: '', error: error instanceof Error ? error.message : 'AI request failed' },
      { status: 500 }
    )
  }
}
