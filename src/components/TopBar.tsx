'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { AudioCapture } from './AudioCapture'
import { AboutModal } from './AboutModal'

export function TopBar() {
  const [aboutOpen, setAboutOpen] = useState(false)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const resetSession = useAppStore((s) => s.resetSession)
  const isRecording = useAppStore((s) => s.isRecording)
  const topics = useAppStore((s) => s.topics)
  const relationships = useAppStore((s) => s.relationships)
  const transcriptHistory = useAppStore((s) => s.transcriptHistory)

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      topics: Object.values(topics),
      relationships,
      transcript: transcriptHistory,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yapsesh-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 bg-white">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-zinc-800 tracking-tight">YapSesh</h1>
        <span className="text-[10px] text-zinc-400 font-medium">
          {Object.keys(topics).length} topic{Object.keys(topics).length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <AudioCapture />

        <button
          onClick={() => {
            if (isRecording) {
              alert('Stop recording before resetting.')
              return
            }
            if (Object.keys(topics).length === 0 && transcriptHistory.length === 0) return
            if (confirm('Clear all topics and transcript? This cannot be undone.')) {
              resetSession()
            }
          }}
          className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Reset session"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>

        <button
          onClick={handleExport}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          title="Export session"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>

        <button
          onClick={() => setAboutOpen(true)}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          title="About YapSesh"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </button>

        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          title="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </header>
  )
}
