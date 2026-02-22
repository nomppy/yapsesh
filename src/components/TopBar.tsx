'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { AudioCapture } from './AudioCapture'
import { AboutModal } from './AboutModal'

export function TopBar() {
  const [aboutOpen, setAboutOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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
    setMenuOpen(false)
  }

  const topicCount = Object.keys(topics).length

  return (
    <header className={`flex items-center justify-between px-4 py-2.5 border-b bg-white/80 backdrop-blur-sm ${isRecording ? 'border-t-2 border-t-emerald-400/60 border-b-stone-200' : 'border-b-stone-200'}`}>
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-serif text-stone-900 tracking-tight" style={{ fontStyle: 'italic' }}>YapSesh</h1>
        <span className="text-[11px] text-stone-400 font-medium">
          {topicCount === 0 ? 'no topics yet' : `${topicCount} topic${topicCount !== 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <AudioCapture />

        {/* Overflow menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            title="More options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white rounded-xl shadow-lg border border-stone-200 py-1 overflow-hidden">
                <button
                  onClick={handleExport}
                  className="w-full px-3 py-2 text-left text-sm text-stone-600 hover:bg-stone-50 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export session
                </button>
                <button
                  onClick={() => {
                    if (isRecording) {
                      alert('Hold on — stop recording first!')
                      return
                    }
                    if (topicCount === 0 && transcriptHistory.length === 0) return
                    if (confirm('Wipe everything and start fresh? No undo on this one.')) {
                      resetSession()
                    }
                    setMenuOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Start over
                </button>
                <div className="border-t border-stone-100 my-1" />
                <button
                  onClick={() => { setAboutOpen(true); setMenuOpen(false) }}
                  className="w-full px-3 py-2 text-left text-sm text-stone-600 hover:bg-stone-50 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  About
                </button>
                <button
                  onClick={() => { setSettingsOpen(true); setMenuOpen(false) }}
                  className="w-full px-3 py-2 text-left text-sm text-stone-600 hover:bg-stone-50 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Settings
                </button>
                <div className="border-t border-stone-100 my-1" />
                <a
                  href="https://github.com/nomppy/yapsesh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-3 py-2 text-left text-sm text-stone-600 hover:bg-stone-50 flex items-center gap-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </a>
                <a
                  href="mailto:feedback@sunken.site?subject=YapSesh%20Feedback"
                  className="w-full px-3 py-2 text-left text-sm text-stone-600 hover:bg-stone-50 flex items-center gap-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Send feedback
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </header>
  )
}
