'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { getTopicColor, TOPIC_COLORS } from '@/lib/topic-colors'

export function TranscriptPanel() {
  const transcriptHistory = useAppStore((s) => s.transcriptHistory)
  const interimText = useAppStore((s) => s.interimText)
  const topics = useAppStore((s) => s.topics)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcriptHistory, interimText])

  // Build a simple map of topic names → colors for transcript color threading
  const topicColorMap = Object.values(topics).reduce((acc, topic) => {
    acc[topic.name.toLowerCase()] = getTopicColor(topic.colorIndex ?? 0)
    return acc
  }, {} as Record<string, typeof TOPIC_COLORS[number]>)

  // Assign a color to each transcript entry based on proximity to a topic
  const getEntryColor = (index: number) => {
    // Simple approach: use index to cycle through topic colors if topics exist
    const topicList = Object.values(topics)
    if (topicList.length === 0) return null
    // Find the most recent topic created before or at this entry's timestamp
    const entry = transcriptHistory[index]
    const relevantTopics = topicList.filter(t => t.createdAt <= entry.timestamp).sort((a, b) => b.createdAt - a.createdAt)
    if (relevantTopics.length > 0) {
      return getTopicColor(relevantTopics[0].colorIndex ?? 0)
    }
    return null
  }

  return (
    <div className="flex flex-col h-full border-t md:border-t-0 md:border-l border-stone-200 bg-white">
      <div className="px-4 py-3 border-b border-stone-200">
        <h2 className="text-sm font-semibold text-stone-700">What you said</h2>
        <p className="text-[11px] text-stone-400 mt-0.5">
          {transcriptHistory.length === 0 ? 'nothing yet' : `${transcriptHistory.length} snippet${transcriptHistory.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {transcriptHistory.length === 0 && !interimText && (
          <p className="text-[13px] text-stone-400 text-center mt-8 leading-relaxed">
            Your words will show up here as you speak...
          </p>
        )}

        {transcriptHistory.map((entry, i) => {
          const color = getEntryColor(i)
          return (
            <div key={i} className="group flex gap-2">
              {/* Color thread indicator */}
              <div
                className="w-[2px] shrink-0 rounded-full mt-1"
                style={{ background: color ? color.border : '#E7E5E4', minHeight: 16 }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  {entry.speaker && (
                    <span className="text-[11px] font-semibold" style={{ color: color ? color.text : '#7C3AED' }}>{entry.speaker}</span>
                  )}
                  <span className="text-[11px] text-stone-300">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-[13px] text-stone-600 leading-relaxed">{entry.text}</p>
              </div>
            </div>
          )
        })}

        {interimText && (
          <div className="flex gap-2 opacity-50">
            <div className="w-[2px] shrink-0 rounded-full bg-stone-200 mt-1" style={{ minHeight: 16 }} />
            <p className="text-[13px] text-stone-500 italic leading-relaxed">{interimText}</p>
          </div>
        )}
      </div>
    </div>
  )
}
