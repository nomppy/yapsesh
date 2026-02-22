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
    const data = { exportedAt: new Date().toISOString(), topics: Object.values(topics), relationships, transcript: transcriptHistory }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `yapsesh-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url); setMenuOpen(false)
  }
  const topicCount = Object.keys(topics).length
  return (
    <div>
      {/* Title bar */}
      <div className="retro-title-bar" style={{ borderBottom: '2px solid #4A3A28' }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px]">&#127793;</span>
          <span>YapSesh.exe — Field Station</span>
          {topicCount > 0 && <span className="text-[10px] opacity-70">[{topicCount} topic{topicCount !== 1 ? 's' : ''}]</span>}
        </div>
        <div className="flex gap-1">
          <div className="win-ctrl" title="Minimize" />
          <div className="win-ctrl" title="Maximize" />
          <div className="win-ctrl" title="Close" style={{ background: '#A07060' }} />
        </div>
      </div>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 py-1.5" style={{ background: 'linear-gradient(180deg, #E8DCC8 0%, #D8CCB8 100%)', borderBottom: '2px groove #B8A888' }}>
        <div className="flex items-center gap-1">
          <AudioCapture />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleExport} className="retro-btn text-[10px]" title="Export">EXPORT</button>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="retro-btn text-[10px]">FILE &#9660;</button>
            {menuOpen && (<>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-50 retro-window" style={{ width: 180, boxShadow: '3px 3px 0px rgba(0,0,0,0.2)' }}>
                <button onClick={() => { setAboutOpen(true); setMenuOpen(false) }} className="w-full px-3 py-1.5 text-left text-[11px] font-mono-display hover:bg-[#5B7553] hover:text-white uppercase">About</button>
                <button onClick={() => { setSettingsOpen(true); setMenuOpen(false) }} className="w-full px-3 py-1.5 text-left text-[11px] font-mono-display hover:bg-[#5B7553] hover:text-white uppercase">Control Panel</button>
                <div style={{ borderTop: '1px solid #A09080', margin: '2px 0' }} />
                <button onClick={() => { if (isRecording) { alert('Stop recording first!'); return }; if (topicCount === 0 && transcriptHistory.length === 0) return; if (confirm('Clear all data? This cannot be undone.')) resetSession(); setMenuOpen(false) }}
                  className="w-full px-3 py-1.5 text-left text-[11px] font-mono-display hover:bg-[#A07060] hover:text-white uppercase" style={{ color: '#A07060' }}>Reset Session</button>
                <div style={{ borderTop: '1px solid #A09080', margin: '2px 0' }} />
                <a href="https://github.com/nomppy/yapsesh" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="block w-full px-3 py-1.5 text-left text-[11px] font-mono-display hover:bg-[#5B7553] hover:text-white uppercase">GitHub</a>
                <a href="mailto:feedback@sunken.site?subject=YapSesh%20Feedback" onClick={() => setMenuOpen(false)} className="block w-full px-3 py-1.5 text-left text-[11px] font-mono-display hover:bg-[#5B7553] hover:text-white uppercase">Feedback</a>
              </div>
            </>)}
          </div>
        </div>
      </div>
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>)
}
