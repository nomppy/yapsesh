'use client'

import { memo, useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { Topic } from '@/types'

interface TopicNodeData {
  topic: Topic
  isActive: boolean
  [key: string]: unknown
}

function TopicNodeComponent({ data }: NodeProps) {
  const { topic, isActive } = data as TopicNodeData
  const [expanded, setExpanded] = useState(false)

  const age = Date.now() - topic.createdAt
  const ageMinutes = Math.floor(age / 60000)
  const ageLabel = ageMinutes < 1 ? 'just now' : `${ageMinutes}m ago`

  // Fade older topics slightly
  const opacity = Math.max(0.6, 1 - (age / (30 * 60000)) * 0.4)

  return (
    <div
      className={`
        min-w-[240px] max-w-[300px] rounded-xl border bg-white shadow-md
        transition-all duration-300 cursor-pointer select-none
        ${isActive
          ? 'border-emerald-400 shadow-emerald-200/50 shadow-lg ring-2 ring-emerald-300/30'
          : 'border-zinc-200 hover:border-zinc-300 hover:shadow-lg'
        }
      `}
      style={{ opacity }}
      onClick={() => setExpanded(!expanded)}
    >
      <Handle type="target" position={Position.Top} className="!bg-zinc-400 !w-2 !h-2" />

      <div className="p-3">
        {/* Status indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`} />
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {isActive ? 'Active' : 'Discussed'}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-zinc-800 mb-2 leading-tight">
          {topic.name}
        </h3>

        {/* Key points */}
        {expanded && topic.keyPoints.length > 0 && (
          <ul className="space-y-1 mb-2">
            {topic.keyPoints.map((point, i) => (
              <li key={i} className="text-xs text-zinc-600 flex gap-1.5">
                <span className="text-zinc-400 shrink-0">&#8226;</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Collapsed indicator */}
        {!expanded && topic.keyPoints.length > 0 && (
          <p className="text-[10px] text-zinc-400 mb-2">
            {topic.keyPoints.length} point{topic.keyPoints.length !== 1 ? 's' : ''} &middot; click to expand
          </p>
        )}

        {/* Footer */}
        <div className="border-t border-zinc-100 pt-2 flex items-center gap-2 text-[10px] text-zinc-400">
          {topic.speaker && <span className="font-medium">{topic.speaker}</span>}
          {topic.speaker && <span>&middot;</span>}
          <span>{ageLabel}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-zinc-400 !w-2 !h-2" />
    </div>
  )
}

export const TopicNode = memo(TopicNodeComponent)
