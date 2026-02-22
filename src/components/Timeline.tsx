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
  const totalDuration = endTime - startTime
  const useEvenSpacing = totalDuration < 2000 && topicList.length > 1
  const getPosition = (index: number, createdAt: number) => {
    if (useEvenSpacing) return ((index + 0.5) / topicList.length) * 100
    return ((createdAt - startTime) / Math.max(totalDuration, 1000)) * 100
  }
  const handleClick = (topicId: string) => {
    const nodes = getNodes(); const node = nodes.find(n => n.id === topicId); if (!node) return
    setCenter(node.position.x + (node.measured?.width ?? 260) / 2, node.position.y + (node.measured?.height ?? 150) / 2, { zoom: 1, duration: 400 })
    setFlashId(topicId); setTimeout(() => setFlashId(null), 1500)
  }
  return (
    <div className="px-3 py-2" style={{ background: '#E8E0D4', borderTop: '2px groove #C4B8A4' }}>
      <div className="relative h-6 flex items-center">
        {/* Track — retro scrubber */}
        <div className="absolute inset-x-0 h-[3px] top-1/2" style={{ background: '#C4B8A4', border: '1px inset #A09080' }} />
        {topicList.map((topic, index) => {
          const pos = getPosition(index, topic.createdAt); const isActive = topic.id === currentTopicId; const isFlashing = topic.id === flashId; const color = getTopicColor(topic.colorIndex ?? 0)
          return (<div key={topic.id} className="absolute -translate-x-1/2 group cursor-pointer" style={{ left: `${Math.max(2, Math.min(pos, 98))}%` }} onClick={() => handleClick(topic.id)}>
            <div className={`w-3 h-3 transition-all duration-150 ${isFlashing ? 'scale-150' : isActive ? 'scale-125' : 'hover:scale-110'}`}
              style={{ background: isFlashing || isActive ? color.border : '#F5F0E8', border: `2px ${isActive ? 'inset' : 'outset'} ${color.border}` }} />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="text-[10px] font-mono-display px-2 py-1 whitespace-nowrap uppercase" style={{ background: '#F5F0E8', border: '1px solid #A09080', color: color.text, boxShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>{topic.name}</div>
            </div>
          </div>)})}
        <div className="absolute right-0 text-[10px] font-mono-display" style={{ color: '#8B9B85' }}>&#9654;</div>
      </div>
    </div>)
}
