'use client'
import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { getTopicColor, TOPIC_COLORS } from '@/lib/topic-colors'
export function TranscriptPanel() {
  const transcriptHistory = useAppStore((s) => s.transcriptHistory)
  const interimText = useAppStore((s) => s.interimText)
  const topics = useAppStore((s) => s.topics)
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [transcriptHistory, interimText])
  const getEntryColor = (index: number) => {
    const topicList = Object.values(topics); if (topicList.length === 0) return null
    const entry = transcriptHistory[index]
    const rel = topicList.filter(t => t.createdAt <= entry.timestamp).sort((a, b) => b.createdAt - a.createdAt)
    return rel.length > 0 ? getTopicColor(rel[0].colorIndex ?? 0) : null
  }
  return (
    <div className="flex flex-col h-full" style={{ borderLeft: '3px groove #B8A888', background: '#F2EBE0' }}>
      {/* Panel title bar */}
      <div className="retro-title-bar retro-title-bar-inactive" style={{ borderBottom: '1px solid #A09080' }}>
        <span>FIELD_LOG.txt</span>
        <div className="flex gap-1"><div className="win-ctrl" /></div>
      </div>
      <div className="px-3 py-2" style={{ borderBottom: '1px solid #D4CFC4' }}>
        <p className="text-[10px] font-mono-display font-bold uppercase" style={{ color: '#5B7553' }}>
          Transcript [{transcriptHistory.length === 0 ? 'empty' : `${transcriptHistory.length} entries`}]
        </p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {transcriptHistory.length === 0 && !interimText && (
          <div className="text-center mt-6">
            <p className="text-[11px] font-mono-display" style={{ color: '#8B9B85' }}>
              &gt; Listening...<span className="blink">_</span>
            </p>
            <p className="text-[10px] font-mono-display mt-2" style={{ color: '#A09080' }}>
              Your words will appear here<br />as you speak.
            </p>
          </div>)}
        {transcriptHistory.map((entry, i) => {
          const color = getEntryColor(i)
          return (<div key={i} className="flex gap-2 group">
            <div className="w-[3px] shrink-0 mt-0.5" style={{ background: color ? color.border : '#C4B8A4', minHeight: 14 }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5">
                {entry.speaker && <span className="text-[10px] font-mono-display font-bold uppercase" style={{ color: color ? color.text : '#5B7553' }}>{entry.speaker}</span>}
                <span className="text-[10px] font-mono-display" style={{ color: '#A09080' }}>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: '#2C3E2C' }}>{entry.text}</p>
            </div>
          </div>)})}
        {interimText && (<div className="flex gap-2 opacity-50">
          <div className="w-[3px] shrink-0 mt-0.5" style={{ background: '#C4B8A4', minHeight: 14 }} />
          <p className="text-[12px] italic leading-relaxed" style={{ color: '#6B7F6B' }}>{interimText}</p>
        </div>)}
      </div>
    </div>)
}
