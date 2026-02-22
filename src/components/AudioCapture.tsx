'use client'
import { useRef, useCallback, useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { WebSpeechProvider } from '@/lib/speech/web-speech'
import { DeepgramProvider } from '@/lib/speech/deepgram'
import { DualCaptureProvider } from '@/lib/speech/dual-capture'
import { extractTopics } from '@/lib/llm/extract'
import type { SpeechProvider } from '@/lib/speech/provider'
const MIN_WORDS_TO_FLUSH = 15; const SILENCE_FLUSH_MS = 4000; const MAX_BUFFER_MS = 15000
function supportsDesktopAudio(): boolean { return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia && /Chrome|Edg/.test(navigator.userAgent) }
export function AudioCapture() {
  const providerRef = useRef<SpeechProvider | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flushingRef = useRef(false); const pendingFlushRef = useRef(false)
  const isRecording = useAppStore((s) => s.isRecording); const includeDesktopAudio = useAppStore((s) => s.includeDesktopAudio)
  const speechProviderType = useAppStore((s) => s.speechProvider); const apiKeys = useAppStore((s) => s.apiKeys)
  const isProcessing = useAppStore((s) => s.isProcessing); const lastError = useAppStore((s) => s.lastError)
  const setRecording = useAppStore((s) => s.setRecording); const setIncludeDesktopAudio = useAppStore((s) => s.setIncludeDesktopAudio)
  const addTranscript = useAppStore((s) => s.addTranscript); const setInterimText = useAppStore((s) => s.setInterimText)
  const clearBuffer = useAppStore((s) => s.clearBuffer); const processTopics = useAppStore((s) => s.processTopics)
  const setProcessing = useAppStore((s) => s.setProcessing); const setError = useAppStore((s) => s.setError)
  const flushBuffer = useCallback(async () => {
    const state = useAppStore.getState(); const buffer = state.transcriptBuffer; if (!buffer.trim()) return
    if (flushingRef.current) { pendingFlushRef.current = true; return }
    flushingRef.current = true; const clearedBuffer = clearBuffer(); setProcessing(true); setError(null)
    try { const cs = useAppStore.getState(); const ext = await extractTopics(clearedBuffer, cs.topics, cs.apiKeys, cs.llmProvider); processTopics(ext) }
    catch (error) { const msg = error instanceof Error ? error.message : String(error); console.error('Failed:', msg); setError(msg); setProcessing(false) }
    finally { flushingRef.current = false; if (pendingFlushRef.current) { pendingFlushRef.current = false; flushBuffer() } }
  }, [clearBuffer, processTopics, setProcessing])
  const clearTimers = useCallback(() => { if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }; if (maxTimerRef.current) { clearTimeout(maxTimerRef.current); maxTimerRef.current = null } }, [])
  const scheduleFlush = useCallback(() => {
    const s = useAppStore.getState(); const wc = s.transcriptBuffer.trim().split(/\s+/).filter(Boolean).length
    if (wc >= MIN_WORDS_TO_FLUSH) { clearTimers(); flushBuffer(); return }
    if (wc > 0) { if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current); silenceTimerRef.current = setTimeout(flushBuffer, SILENCE_FLUSH_MS); if (!maxTimerRef.current) { maxTimerRef.current = setTimeout(() => { maxTimerRef.current = null; flushBuffer() }, MAX_BUFFER_MS) } }
  }, [flushBuffer, clearTimers])
  const startRecording = useCallback(async () => {
    let provider: SpeechProvider
    if (speechProviderType === 'deepgram' && apiKeys.deepgram) provider = new DeepgramProvider(apiKeys.deepgram)
    else if (includeDesktopAudio) provider = new DualCaptureProvider()
    else provider = new WebSpeechProvider()
    if (!provider.isSupported()) { alert("Browser doesn't support speech recognition. Try Chrome!"); return }
    provider.onTranscript((text, speaker) => { addTranscript(text, speaker); scheduleFlush() })
    provider.onInterim((text) => { setInterimText(text) })
    await provider.start(); providerRef.current = provider; setRecording(true)
  }, [speechProviderType, apiKeys, includeDesktopAudio, addTranscript, setInterimText, setRecording, scheduleFlush])
  const stopRecording = useCallback(() => { providerRef.current?.stop(); providerRef.current = null; setRecording(false); setInterimText(''); clearTimers(); flushBuffer() }, [setRecording, setInterimText, flushBuffer, clearTimers])
  const [canDesktopAudio, setCanDesktopAudio] = useState(false)
  useEffect(() => { setCanDesktopAudio(supportsDesktopAudio()) }, [])
  useEffect(() => { return () => { providerRef.current?.stop(); clearTimers() } }, [clearTimers])
  return (
    <div className="flex items-center gap-2">
      {canDesktopAudio && !isRecording && (
        <button onClick={() => setIncludeDesktopAudio(!includeDesktopAudio)}
          className={`retro-btn text-[10px] ${includeDesktopAudio ? 'retro-btn-pressed' : ''}`}
          title={includeDesktopAudio ? 'Screen audio ON' : 'Screen audio OFF'}>
          &#128187; {includeDesktopAudio ? 'ON' : 'OFF'}
        </button>)}
      <button onClick={isRecording ? stopRecording : startRecording}
        className={`retro-btn text-[10px] ${isRecording ? 'retro-btn-amber recording-glow' : 'retro-btn-accent'}`}
        style={{ minWidth: 80 }}>
        {isRecording ? '&#9632; STOP' : '&#9679; RECORD'}
      </button>
      {isProcessing && <span className="text-[10px] font-mono-display font-bold uppercase" style={{ color: '#C4956A' }}>Processing...</span>}
      {lastError && <button onClick={() => { setError(null); if (lastError.includes('API key') || lastError.includes('Settings')) useAppStore.getState().setSettingsOpen(true) }}
        className="text-[10px] font-mono-display max-w-[200px] truncate" style={{ color: '#A07060' }} title={lastError}>
        {lastError.includes('API key') ? '[!] No API key — click to fix' : `[!] ${lastError}`}
      </button>}
    </div>)
}
