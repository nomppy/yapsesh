export const runtime = 'edge'

import { generateObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { EXTRACTION_SYSTEM_PROMPT, buildExtractionPrompt } from '@/lib/llm/extract'
import type { Topic } from '@/types'

const TopicExtractionSchema = z.object({
  topics: z.array(z.object({
    id: z.string(),
    name: z.string(),
    keyPoints: z.array(z.string()),
    speaker: z.string().optional(),
    isNew: z.boolean(),
    existingTopicId: z.string().optional(),
  })),
  relationships: z.array(z.object({
    from: z.string(),
    to: z.string(),
    type: z.enum(['led_to', 'related_to', 'contradicts', 'expanded_on']),
    label: z.string().optional(),
  })),
  currentTopicId: z.string(),
})

function getModel(provider: string, apiKeys: Record<string, string>) {
  switch (provider) {
    case 'claude': {
      const anthropic = createAnthropic({
        apiKey: apiKeys.claude || process.env.ANTHROPIC_API_KEY,
      })
      return anthropic('claude-sonnet-4-20250514')
    }
    case 'openai': {
      const openai = createOpenAI({
        apiKey: apiKeys.openai || process.env.OPENAI_API_KEY,
      })
      return openai('gpt-4o-mini')
    }
    case 'deepseek': {
      const deepseek = createOpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: apiKeys.deepseek || process.env.DEEPSEEK_API_KEY,
      })
      return deepseek('deepseek-chat')
    }
    case 'ollama': {
      const ollama = createOpenAI({
        baseURL: 'http://localhost:11434/v1',
        apiKey: 'ollama',
      })
      return ollama(apiKeys.ollamaModel || 'llama3.1')
    }
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

function sanitizeSpeaker(speaker: string | undefined): string | undefined {
  if (!speaker || speaker === '<UNKNOWN>' || speaker.toLowerCase() === 'unknown') {
    return undefined
  }
  return speaker
}

export async function POST(request: Request) {
  try {
    const { transcript, existingTopics, apiKeys, llmProvider } = await request.json() as {
      transcript: string
      existingTopics: Record<string, Topic>
      apiKeys: Record<string, string>
      llmProvider: string
    }

    if (!transcript?.trim()) {
      return Response.json({ error: 'No transcript provided' }, { status: 400 })
    }

    // Validate API key availability before attempting LLM call
    const resolvedKeys = apiKeys || {}
    if (llmProvider === 'claude' && !resolvedKeys.claude && !process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: 'No Anthropic API key configured. Add it in Settings or set ANTHROPIC_API_KEY environment variable.' },
        { status: 400 }
      )
    }
    if (llmProvider === 'openai' && !resolvedKeys.openai && !process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: 'No OpenAI API key configured. Add it in Settings or set OPENAI_API_KEY environment variable.' },
        { status: 400 }
      )
    }
    if (llmProvider === 'deepseek' && !resolvedKeys.deepseek && !process.env.DEEPSEEK_API_KEY) {
      return Response.json(
        { error: 'No DeepSeek API key configured. Add it in Settings or set DEEPSEEK_API_KEY environment variable.' },
        { status: 400 }
      )
    }

    const model = getModel(llmProvider, resolvedKeys)
    const prompt = buildExtractionPrompt(transcript, existingTopics || {})

    let lastError: unknown
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { object } = await generateObject({
          model,
          schema: TopicExtractionSchema,
          system: EXTRACTION_SYSTEM_PROMPT,
          prompt,
        })

        // Sanitize speaker fields
        object.topics = object.topics.map(t => ({
          ...t,
          speaker: sanitizeSpeaker(t.speaker),
        }))

        return Response.json(object)
      } catch (error) {
        lastError = error
        const msg = error instanceof Error ? error.message : ''
        // Retry on schema mismatch errors
        if (msg.includes('did not match schema') || msg.includes('No object generated')) {
          console.warn(`Schema mismatch on attempt ${attempt + 1}, retrying...`)
          continue
        }
        // Don't retry other errors
        throw error
      }
    }

    throw lastError
  } catch (error) {
    console.error('Topic extraction error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
