'use client'

import { useRef, useCallback, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { WebSpeechProvider } from '@/lib/speech/web-speech'
import { DeepgramProvider } from '@/lib/speech/deepgram'
import { extractTopics } from '@/lib/llm/extract'
import type { SpeechProvider } from '@/lib/speech/provider'

// Flush when we accumulate this many words
const MIN_WORDS_TO_FLUSH = 15
// Or after this many ms of silence once we have any content
const SILENCE_FLUSH_MS = 4000
// Hard ceiling — never wait longer than this
const MAX_BUFFER_MS = 15000

export function AudioCapture() {
  const providerRef = useRef<SpeechProvider | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flushingRef = useRef(false)
  const pendingFlushRef = useRef(false)

  const isRecording = useAppStore((s) => s.isRecording)
  const speechProviderType = useAppStore((s) => s.speechProvider)
  const apiKeys = useAppStore((s) => s.apiKeys)
  const isProcessing = useAppStore((s) => s.isProcessing)
  const lastError = useAppStore((s) => s.lastError)

  const setRecording = useAppStore((s) => s.setRecording)
  const addTranscript = useAppStore((s) => s.addTranscript)
  const setInterimText = useAppStore((s) => s.setInterimText)
  const clearBuffer = useAppStore((s) => s.clearBuffer)
  const processTopics = useAppStore((s) => s.processTopics)
  const setProcessing = useAppStore((s) => s.setProcessing)
  const setError = useAppStore((s) => s.setError)

  const flushBuffer = useCallback(async () => {
    const state = useAppStore.getState()
    const buffer = state.transcriptBuffer

    if (!buffer.trim()) return

    // If already flushing, mark that we need another flush after
    if (flushingRef.current) {
      pendingFlushRef.current = true
      return
    }

    flushingRef.current = true
    const clearedBuffer = clearBuffer()
    setProcessing(true)
    setError(null)

    try {
      const currentState = useAppStore.getState()
      const extraction = await extractTopics(
        clearedBuffer,
        currentState.topics,
        currentState.apiKeys,
        currentState.llmProvider
      )
      processTopics(extraction)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error('Failed to extract topics:', msg)
      setError(msg)
      setProcessing(false)
    } finally {
      flushingRef.current = false

      // If new content arrived while we were processing, flush again
      if (pendingFlushRef.current) {
        pendingFlushRef.current = false
        flushBuffer()
      }
    }
  }, [clearBuffer, processTopics, setProcessing])

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current)
      maxTimerRef.current = null
    }
  }, [])

  const scheduleFlush = useCallback(() => {
    const state = useAppStore.getState()
    const wordCount = state.transcriptBuffer.trim().split(/\s+/).filter(Boolean).length

    // Enough words — flush immediately
    if (wordCount >= MIN_WORDS_TO_FLUSH) {
      clearTimers()
      flushBuffer()
      return
    }

    // Some content but not enough — reset the silence timer
    if (wordCount > 0) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = setTimeout(flushBuffer, SILENCE_FLUSH_MS)

      // Start a max timer if not already running
      if (!maxTimerRef.current) {
        maxTimerRef.current = setTimeout(() => {
          maxTimerRef.current = null
          flushBuffer()
        }, MAX_BUFFER_MS)
      }
    }
  }, [flushBuffer, clearTimers])

  const startRecording = useCallback(() => {
    let provider: SpeechProvider

    if (speechProviderType === 'deepgram' && apiKeys.deepgram) {
      provider = new DeepgramProvider(apiKeys.deepgram)
    } else {
      provider = new WebSpeechProvider()
    }

    if (!provider.isSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    provider.onTranscript((text, speaker) => {
      addTranscript(text, speaker)
      // After each finalized utterance, check if we should flush
      scheduleFlush()
    })
    provider.onInterim((text) => {
      setInterimText(text)
    })

    provider.start()
    providerRef.current = provider
    setRecording(true)
  }, [speechProviderType, apiKeys, addTranscript, setInterimText, setRecording, scheduleFlush])

  const stopRecording = useCallback(() => {
    providerRef.current?.stop()
    providerRef.current = null
    setRecording(false)
    setInterimText('')
    clearTimers()

    // Final flush immediately
    flushBuffer()
  }, [setRecording, setInterimText, flushBuffer, clearTimers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      providerRef.current?.stop()
      clearTimers()
    }
  }, [clearTimers])

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
          transition-all duration-200
          ${isRecording
            ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200'
            : 'bg-zinc-900 text-white hover:bg-zinc-800'
          }
        `}
      >
        <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-red-500'}`} />
        {isRecording ? 'Stop' : 'Record'}
      </button>

      {isProcessing && (
        <span className="text-xs text-zinc-400 animate-pulse">Analyzing...</span>
      )}
      {lastError && (
        <button
          onClick={() => {
            setError(null)
            if (lastError.includes('API key') || lastError.includes('Settings')) {
              useAppStore.getState().setSettingsOpen(true)
            }
          }}
          className="text-xs text-red-500 hover:text-red-600 max-w-[250px] truncate"
          title={lastError}
        >
          {lastError.includes('API key') ? 'No API key — click to open Settings' : lastError}
        </button>
      )}
    </div>
  )
}
