'use client'

import { useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useAppStore } from '@/lib/store'
import { getTopicColor } from '@/lib/topic-colors'

export function Timeline() {
  const topics = useAppStore((s) => s.topics)
  const currentTopicId = useAppStore((s) => s.currentTopicId)
  const isRecording = useAppStore((s) => s.isRecording)
  const { setCenter, getNodes } = useReactFlow()
  const [flashId, setFlashId] = useState<string | null>(null)

  const topicList = Object.values(topics).sort((a, b) => a.createdAt - b.createdAt)

  if (topicList.length === 0) return null

  const startTime = topicList[0].createdAt
  const lastTopicTime = Math.max(...topicList.map(t => t.updatedAt ?? t.createdAt))
  const endTime = isRecording ? Date.now() : lastTopicTime
  const totalDuration = Math.max(endTime - startTime, 1000)

  const handleClick = (topicId: string) => {
    const nodes = getNodes()
    const node = nodes.find(n => n.id === topicId)
    if (!node) return

    const x = node.position.x + (node.measured?.width ?? 280) / 2
    const y = node.position.y + (node.measured?.height ?? 160) / 2
    setCenter(x, y, { zoom: 1, duration: 400 })

    setFlashId(topicId)
    setTimeout(() => setFlashId(null), 1500)
  }

  return (
    <div className="px-4 py-2.5 border-t border-stone-200 bg-white">
      <div className="relative h-7 flex items-center">
        {/* Track line */}
        <div className="absolute inset-x-0 h-[2px] bg-stone-200 top-1/2 rounded-full" />

        {/* Topic dots with color */}
        {topicList.map((topic) => {
          const position = ((topic.createdAt - startTime) / totalDuration) * 100
          const isActive = topic.id === currentTopicId
          const isFlashing = topic.id === flashId
          const color = getTopicColor(topic.colorIndex ?? 0)

          return (
            <div
              key={topic.id}
              className="absolute -translate-x-1/2 group cursor-pointer"
              style={{ left: `${Math.min(position, 98)}%` }}
              onClick={() => handleClick(topic.id)}
            >
              <div
                className={`
                  w-3.5 h-3.5 rounded-full border-2 transition-all duration-200
                  ${isFlashing
                    ? 'scale-150'
                    : isActive
                    ? 'scale-125'
                    : 'hover:scale-110'
                  }
                `}
                style={{
                  background: isFlashing || isActive ? color.border : 'white',
                  borderColor: color.border,
                }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-stone-800 text-stone-50 text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg">
                  {topic.name}
                </div>
              </div>
            </div>
          )
        })}

        {/* Subtle end indicator */}
        <div className="absolute right-0 text-stone-300 text-xs">&#9654;</div>
      </div>
    </div>
  )
}
