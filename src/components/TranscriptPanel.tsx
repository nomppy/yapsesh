'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'

export function TranscriptPanel() {
  const transcriptHistory = useAppStore((s) => s.transcriptHistory)
  const interimText = useAppStore((s) => s.interimText)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcriptHistory, interimText])

  return (
    <div className="flex flex-col h-full border-t md:border-t-0 md:border-l border-zinc-200 bg-white">
      <div className="px-4 py-3 border-b border-zinc-200">
        <h2 className="text-sm font-semibold text-zinc-700">Live Transcript</h2>
        <p className="text-[10px] text-zinc-400 mt-0.5">
          {transcriptHistory.length} utterance{transcriptHistory.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {transcriptHistory.length === 0 && !interimText && (
          <p className="text-xs text-zinc-400 text-center mt-8">
            Transcript will appear here as you speak...
          </p>
        )}

        {transcriptHistory.map((entry, i) => (
          <div key={i} className="group">
            <div className="flex items-baseline gap-2 mb-0.5">
              {entry.speaker && (
                <span className="text-[10px] font-semibold text-indigo-500">{entry.speaker}</span>
              )}
              <span className="text-[10px] text-zinc-300">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">{entry.text}</p>
          </div>
        ))}

        {interimText && (
          <div className="opacity-50">
            <p className="text-xs text-zinc-500 italic leading-relaxed">{interimText}</p>
          </div>
        )}
      </div>
    </div>
  )
}
