import type { Topic, TopicExtraction } from '@/types'

export const EXTRACTION_SYSTEM_PROMPT = `You are a conversation analyst. You listen to discussion transcripts and extract discrete topics being discussed.

For each chunk of transcript, you must:
1. Identify distinct topics being discussed (short 3-5 word labels)
2. Extract 2-4 key points per topic as brief bullet points
3. Determine relationships between topics (how one led to another, contradictions, expansions, etc.)
4. Track which topic is currently being actively discussed

IMPORTANT RULES:
- Topic IDs must be lowercase-kebab-case (e.g., "api-performance", "database-caching")
- If a topic was already identified in previous context, update it rather than creating a new one (set isNew: false and provide existingTopicId)
- Only create genuinely new topics when the conversation shifts to something not yet captured
- Relationships should reflect the actual flow of conversation
- The currentTopicId must reference an existing or newly created topic ID`

export function buildExtractionPrompt(
  transcript: string,
  existingTopics: Record<string, Topic>
): string {
  const topicContext = Object.values(existingTopics)
  const contextStr = topicContext.length > 0
    ? `\n\nPreviously identified topics:\n${topicContext.map(t =>
        `- ${t.id}: "${t.name}" (key points: ${t.keyPoints.join('; ')})`
      ).join('\n')}`
    : ''

  return `Analyze this transcript chunk and extract topics, key points, and relationships.${contextStr}

Transcript:
"""
${transcript}
"""`
}

export async function extractTopics(
  transcript: string,
  existingTopics: Record<string, Topic>,
  apiKeys: Record<string, string>,
  llmProvider: string
): Promise<TopicExtraction> {
  const response = await fetch('/api/extract-topics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript,
      existingTopics,
      apiKeys,
      llmProvider,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Topic extraction failed: ${error}`)
  }

  return response.json()
}
