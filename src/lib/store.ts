import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Topic, Relationship, TranscriptEntry, TopicExtraction, LLMProvider, SpeechProviderType } from '@/types'

interface AppState {
  // Recording
  isRecording: boolean

  // Transcript
  transcriptBuffer: string
  interimText: string
  transcriptHistory: TranscriptEntry[]

  // Topics (the graph)
  topics: Record<string, Topic>
  relationships: Relationship[]
  currentTopicId: string | null

  // Settings
  llmProvider: LLMProvider
  speechProvider: SpeechProviderType
  apiKeys: Record<string, string>
  settingsOpen: boolean

  // Processing
  isProcessing: boolean
  lastProcessedAt: number
  lastError: string | null

  // Actions
  setRecording: (on: boolean) => void
  addTranscript: (text: string, speaker?: string) => void
  setInterimText: (text: string) => void
  clearBuffer: () => string
  processTopics: (extraction: TopicExtraction) => void
  setLLMProvider: (provider: LLMProvider) => void
  setSpeechProvider: (provider: SpeechProviderType) => void
  setApiKey: (provider: string, key: string) => void
  setSettingsOpen: (open: boolean) => void
  setProcessing: (processing: boolean) => void
  setError: (error: string | null) => void
  updateTopicName: (topicId: string, name: string) => void
  updateTopicKeyPoint: (topicId: string, index: number, text: string) => void
  deleteTopicKeyPoint: (topicId: string, index: number) => void
  addTopicKeyPoint: (topicId: string, text: string) => void
  resetSession: () => void
}

const initialState = {
  isRecording: false,
  transcriptBuffer: '',
  interimText: '',
  transcriptHistory: [],
  topics: {},
  relationships: [],
  currentTopicId: null,
  llmProvider: 'claude' as LLMProvider,
  speechProvider: 'webspeech' as SpeechProviderType,
  apiKeys: {},
  settingsOpen: false,
  isProcessing: false,
  lastProcessedAt: 0,
  lastError: null,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setRecording: (on) => set({ isRecording: on }),

      addTranscript: (text, speaker) => set((state) => ({
        transcriptBuffer: state.transcriptBuffer + (state.transcriptBuffer ? ' ' : '') + text,
        transcriptHistory: [
          ...state.transcriptHistory,
          { text, speaker, timestamp: Date.now() },
        ],
      })),

      setInterimText: (text) => set({ interimText: text }),

      clearBuffer: () => {
        const buffer = get().transcriptBuffer
        set({ transcriptBuffer: '', lastProcessedAt: Date.now() })
        return buffer
      },

      processTopics: (extraction) => set((state) => {
        const newTopics = { ...state.topics }

        for (const topic of extraction.topics) {
          if (topic.isNew) {
            newTopics[topic.id] = {
              id: topic.id,
              name: topic.name,
              keyPoints: topic.keyPoints,
              speaker: topic.speaker,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }
          } else if (topic.existingTopicId && newTopics[topic.existingTopicId]) {
            const existing = newTopics[topic.existingTopicId]
            newTopics[topic.existingTopicId] = {
              ...existing,
              keyPoints: [...existing.keyPoints, ...topic.keyPoints.filter(kp => !existing.keyPoints.includes(kp))],
              updatedAt: Date.now(),
            }
          }
        }

        // Deduplicate relationships
        const existingRelKeys = new Set(
          state.relationships.map(r => `${r.from}-${r.to}-${r.type}`)
        )
        const newRels = extraction.relationships.filter(
          r => !existingRelKeys.has(`${r.from}-${r.to}-${r.type}`)
        )

        return {
          topics: newTopics,
          relationships: [...state.relationships, ...newRels],
          currentTopicId: extraction.currentTopicId,
          isProcessing: false,
        }
      }),

      setLLMProvider: (provider) => set({ llmProvider: provider }),
      setSpeechProvider: (provider) => set({ speechProvider: provider }),
      setApiKey: (provider, key) => set((state) => ({
        apiKeys: { ...state.apiKeys, [provider]: key },
      })),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      setProcessing: (processing) => set({ isProcessing: processing }),
      setError: (error) => set({ lastError: error }),

      updateTopicName: (topicId, name) => set((state) => {
        const topic = state.topics[topicId]
        if (!topic) return state
        return { topics: { ...state.topics, [topicId]: { ...topic, name, updatedAt: Date.now() } } }
      }),

      updateTopicKeyPoint: (topicId, index, text) => set((state) => {
        const topic = state.topics[topicId]
        if (!topic) return state
        const keyPoints = [...topic.keyPoints]
        keyPoints[index] = text
        return { topics: { ...state.topics, [topicId]: { ...topic, keyPoints, updatedAt: Date.now() } } }
      }),

      deleteTopicKeyPoint: (topicId, index) => set((state) => {
        const topic = state.topics[topicId]
        if (!topic) return state
        const keyPoints = topic.keyPoints.filter((_, i) => i !== index)
        return { topics: { ...state.topics, [topicId]: { ...topic, keyPoints, updatedAt: Date.now() } } }
      }),

      addTopicKeyPoint: (topicId, text) => set((state) => {
        const topic = state.topics[topicId]
        if (!topic) return state
        return { topics: { ...state.topics, [topicId]: { ...topic, keyPoints: [...topic.keyPoints, text], updatedAt: Date.now() } } }
      }),

      resetSession: () => set({
        transcriptBuffer: '',
        interimText: '',
        transcriptHistory: [],
        topics: {},
        relationships: [],
        currentTopicId: null,
        isProcessing: false,
        lastProcessedAt: 0,
        lastError: null,
      }),
    }),
    {
      name: 'yapsesh-storage',
      partialize: (state) => ({
        topics: state.topics,
        relationships: state.relationships,
        currentTopicId: state.currentTopicId,
        transcriptHistory: state.transcriptHistory,
        llmProvider: state.llmProvider,
        speechProvider: state.speechProvider,
        apiKeys: state.apiKeys,
      }),
    }
  )
)
