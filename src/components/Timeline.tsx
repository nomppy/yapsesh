'use client'

import { useAppStore } from '@/lib/store'

export function Timeline() {
  const topics = useAppStore((s) => s.topics)
  const currentTopicId = useAppStore((s) => s.currentTopicId)

  const topicList = Object.values(topics).sort((a, b) => a.createdAt - b.createdAt)

  if (topicList.length === 0) return null

  const startTime = topicList[0].createdAt
  const endTime = Date.now()
  const totalDuration = Math.max(endTime - startTime, 1000)

  return (
    <div className="px-4 py-2 border-t border-zinc-200 bg-white">
      <div className="relative h-6 flex items-center">
        {/* Track line */}
        <div className="absolute inset-x-0 h-px bg-zinc-200 top-1/2" />

        {/* Topic dots */}
        {topicList.map((topic) => {
          const position = ((topic.createdAt - startTime) / totalDuration) * 100
          const isActive = topic.id === currentTopicId

          return (
            <div
              key={topic.id}
              className="absolute -translate-x-1/2 group"
              style={{ left: `${Math.min(position, 98)}%` }}
            >
              <div
                className={`
                  w-3 h-3 rounded-full border-2 transition-all
                  ${isActive
                    ? 'bg-emerald-500 border-emerald-300 scale-125'
                    : 'bg-white border-zinc-300 hover:border-zinc-400'
                  }
                `}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-zinc-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                  {topic.name}
                </div>
              </div>
            </div>
          )
        })}

        {/* Arrow at end */}
        <div className="absolute right-0 text-zinc-300 text-xs">&#9654;</div>
      </div>
    </div>
  )
}
