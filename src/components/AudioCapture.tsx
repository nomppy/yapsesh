'use client'

import { useRef, useCallback, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { WebSpeechProvider } from '@/lib/speech/web-speech'
import { DeepgramProvider } from '@/lib/speech/deepgram'
import { DualCaptureProvider } from '@/lib/speech/dual-capture'
import { extractTopics } from '@/lib/llm/extract'
import type { SpeechProvider } from '@/lib/speech/provider'

const MIN_WORDS_TO_FLUSH = 15
const SILENCE_FLUSH_MS = 4000
const MAX_BUFFER_MS = 15000

function supportsDesktopAudio(): boolean {
  return typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getDisplayMedia &&
    /Chrome|Edg/.test(navigator.userAgent)
}

export function AudioCapture() {
  const providerRef = useRef<SpeechProvider | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flushingRef = useRef(false)
  const pendingFlushRef = useRef(false)

  const isRecording = useAppStore((s) => s.isRecording)
  const includeDesktopAudio = useAppStore((s) => s.includeDesktopAudio)
  const speechProviderType = useAppStore((s) => s.speechProvider)
  const apiKeys = useAppStore((s) => s.apiKeys)
  const isProcessing = useAppStore((s) => s.isProcessing)
  const lastError = useAppStore((s) => s.lastError)

  const setRecording = useAppStore((s) => s.setRecording)
  const setIncludeDesktopAudio = useAppStore((s) => s.setIncludeDesktopAudio)
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

    if (wordCount >= MIN_WORDS_TO_FLUSH) {
      clearTimers()
      flushBuffer()
      return
    }

    if (wordCount > 0) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = setTimeout(flushBuffer, SILENCE_FLUSH_MS)

      if (!maxTimerRef.current) {
        maxTimerRef.current = setTimeout(() => {
          maxTimerRef.current = null
          flushBuffer()
        }, MAX_BUFFER_MS)
      }
    }
  }, [flushBuffer, clearTimers])

  const startRecording = useCallback(async () => {
    let provider: SpeechProvider

    if (speechProviderType === 'deepgram' && apiKeys.deepgram) {
      provider = new DeepgramProvider(apiKeys.deepgram)
    } else if (includeDesktopAudio) {
      provider = new DualCaptureProvider()
    } else {
      provider = new WebSpeechProvider()
    }

    if (!provider.isSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    provider.onTranscript((text, speaker) => {
      addTranscript(text, speaker)
      scheduleFlush()
    })
    provider.onInterim((text) => {
      setInterimText(text)
    })

    await provider.start()
    providerRef.current = provider
    setRecording(true)
  }, [speechProviderType, apiKeys, includeDesktopAudio, addTranscript, setInterimText, setRecording, scheduleFlush])

  const stopRecording = useCallback(() => {
    providerRef.current?.stop()
    providerRef.current = null
    setRecording(false)
    setInterimText('')
    clearTimers()
    flushBuffer()
  }, [setRecording, setInterimText, flushBuffer, clearTimers])

  useEffect(() => {
    return () => {
      providerRef.current?.stop()
      clearTimers()
    }
  }, [clearTimers])

  const canDesktopAudio = supportsDesktopAudio()

  return (
    <div className="flex items-center gap-3">
      {/* Desktop audio toggle — only show on Chrome/Edge, only when not recording */}
      {canDesktopAudio && !isRecording && (
        <button
          onClick={() => setIncludeDesktopAudio(!includeDesktopAudio)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
            ${includeDesktopAudio
              ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            }
          `}
          title={includeDesktopAudio ? 'Desktop audio capture enabled' : 'Enable desktop audio capture'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          {includeDesktopAudio ? 'Desktop On' : 'Desktop'}
        </button>
      )}

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
