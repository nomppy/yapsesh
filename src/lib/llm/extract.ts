import type { Topic, TopicExtraction } from '@/types'

export const EXTRACTION_SYSTEM_PROMPT = `You are a conversation topic mapper. Your job is to maintain a clean, consolidated map of discussion topics from a live conversation.

CRITICAL RULES — follow these exactly:

1. MERGE FIRST, CREATE RARELY
   - When new speech relates to an existing topic, ALWAYS update that topic (isNew: false, existingTopicId set) rather than creating a new one.
   - Only create a new topic when the conversation genuinely shifts to a subject not covered by ANY existing topic.
   - A good topic map for a 30-minute conversation should have 5-10 topics, not 30.

2. IGNORE FILLER
   - Do NOT create topics for: laughter, agreements ("yeah", "right"), incomplete sentences, filler words, casual acknowledgments, greetings, or meta-conversation ("what were we talking about").
   - If a transcript chunk is purely filler with no substantive content, return zero new topics and just set currentTopicId to the most recent existing topic.

3. TOPIC QUALITY
   - Topic names should be meaningful subjects: "Housing Market Affordability", "Redis Caching Strategy" — NOT "Agreement Response", "Incomplete Statement", "Casual Remark".
   - Each topic should represent a real conversational subject that someone would want to remember.
   - Key points should be specific facts, opinions, or decisions — not descriptions of speech acts.

4. UPDATING EXISTING TOPICS
   - When updating, only add genuinely new key points that aren't already captured.
   - Don't repeat information already in the existing topic's key points.

5. RELATIONSHIPS
   - Only create relationships between topics that have a real conversational connection.
   - "led_to" means one topic directly caused discussion of another.
   - "related_to" means topics share a theme but weren't directly connected in conversation flow.
   - "expanded_on" means the conversation returned to a topic and added depth.

6. SPEAKER ATTRIBUTION
   - Transcript may contain speaker labels like [You] or [Desktop].
   - "You" = the person using the app (mic input).
   - "Desktop" = audio from the computer (e.g., a video call, podcast, presentation).
   - Set the "speaker" field on topics to attribute who introduced or discussed that topic.
   - If no speaker labels are present, leave speaker undefined.

7. OUTPUT
   - Topic IDs must be lowercase-kebab-case.
   - currentTopicId must reference an existing or newly created topic ID.
   - If nothing substantive was said, return an empty topics array and set currentTopicId to the last active existing topic.`

export function buildExtractionPrompt(
  transcript: string,
  existingTopics: Record<string, Topic>
): string {
  const topicList = Object.values(existingTopics)

  if (topicList.length === 0) {
    return `This is the start of a new conversation. Extract the main topics discussed.

Transcript:
"""
${transcript}
"""`
  }

  const topicSummary = topicList.map(t =>
    `- ID: "${t.id}" | Name: "${t.name}" | Key points: ${t.keyPoints.join('; ')}`
  ).join('\n')

  return `Here are the topics identified so far in this conversation:

${topicSummary}

New transcript chunk to analyze:
"""
${transcript}
"""

For each piece of the new transcript, decide:
- Does it fit an existing topic above? → Update that topic (isNew: false, existingTopicId = the topic's ID, add only NEW key points not already listed).
- Is it a genuinely new subject? → Create a new topic (isNew: true).
- Is it just filler/agreement/laughter? → Skip it entirely.

Return your analysis.`
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
