export type RelationshipType = 'led_to' | 'related_to' | 'contradicts' | 'expanded_on'

export interface Topic {
  id: string
  name: string
  keyPoints: string[]
  speaker?: string
  colorIndex: number
  createdAt: number
  updatedAt: number
}

export interface Relationship {
  from: string
  to: string
  type: RelationshipType
  label?: string
}

export interface TopicExtraction {
  topics: {
    id: string
    name: string
    keyPoints: string[]
    speaker?: string
    isNew: boolean
    existingTopicId?: string
  }[]
  relationships: {
    from: string
    to: string
    type: RelationshipType
    label?: string
  }[]
  currentTopicId: string
}

export interface TranscriptEntry {
  text: string
  speaker?: string
  timestamp: number
}

export type LLMProvider = 'claude' | 'openai' | 'deepseek' | 'ollama'
export type SpeechProviderType = 'webspeech' | 'deepgram'
