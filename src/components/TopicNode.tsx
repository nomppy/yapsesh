'use client'

import { memo, useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { Topic } from '@/types'
import { useAppStore } from '@/lib/store'
import { getTopicColor } from '@/lib/topic-colors'

interface TopicNodeData {
  topic: Topic
  isActive: boolean
  [key: string]: unknown
}

const MAX_DEFAULT_POINTS = 5

function TopicNodeComponent({ data }: NodeProps) {
  const { topic, isActive } = data as TopicNodeData
  const [showAll, setShowAll] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingPointIdx, setEditingPointIdx] = useState<number | null>(null)
  const [addingPoint, setAddingPoint] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const pointInputRef = useRef<HTMLInputElement>(null)
  const addInputRef = useRef<HTMLInputElement>(null)

  const updateTopicName = useAppStore((s) => s.updateTopicName)
  const updateTopicKeyPoint = useAppStore((s) => s.updateTopicKeyPoint)
  const deleteTopicKeyPoint = useAppStore((s) => s.deleteTopicKeyPoint)
  const addTopicKeyPoint = useAppStore((s) => s.addTopicKeyPoint)

  const color = getTopicColor(topic.colorIndex ?? 0)
  const age = Date.now() - topic.createdAt
  const ageMinutes = Math.floor(age / 60000)
  const ageLabel = ageMinutes < 1 ? 'just now' : `${ageMinutes}m ago`
  const opacity = Math.max(0.6, 1 - (age / (30 * 60000)) * 0.4)

  const visiblePoints = showAll ? topic.keyPoints : topic.keyPoints.slice(0, MAX_DEFAULT_POINTS)

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus()
  }, [editingTitle])

  useEffect(() => {
    if (editingPointIdx !== null) pointInputRef.current?.focus()
  }, [editingPointIdx])

  useEffect(() => {
    if (addingPoint) addInputRef.current?.focus()
  }, [addingPoint])

  const handleTitleSubmit = (value: string) => {
    const trimmed = value.trim()
    if (trimmed && trimmed !== topic.name) {
      updateTopicName(topic.id, trimmed)
    }
    setEditingTitle(false)
  }

  const handlePointSubmit = (index: number, value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      deleteTopicKeyPoint(topic.id, index)
    } else if (trimmed !== topic.keyPoints[index]) {
      updateTopicKeyPoint(topic.id, index, trimmed)
    }
    setEditingPointIdx(null)
  }

  const handleAddSubmit = (value: string) => {
    const trimmed = value.trim()
    if (trimmed) {
      addTopicKeyPoint(topic.id, trimmed)
    }
    setAddingPoint(false)
  }

  const onKeyDown = (e: KeyboardEvent, onSubmit: () => void) => {
    if (e.key === 'Enter') onSubmit()
    if (e.key === 'Escape') { setEditingTitle(false); setEditingPointIdx(null); setAddingPoint(false) }
  }

  return (
    <div
      className={`
        min-w-[240px] max-w-[300px] rounded-2xl bg-white shadow-sm
        transition-all duration-200 select-none border-l-[3px]
        ${isActive
          ? 'shadow-md ring-2 ring-emerald-300/30'
          : 'hover:shadow-md'
        }
      `}
      style={{
        opacity,
        borderLeftColor: color.border,
        borderTop: '1px solid #E7E5E4',
        borderRight: '1px solid #E7E5E4',
        borderBottom: '1px solid #E7E5E4',
      }}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2" style={{ background: color.border }} />

      <div className="p-3">
        {/* Status indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`}
            style={{ background: isActive ? '#10B981' : color.border, opacity: isActive ? 1 : 0.5 }}
          />
          <span className="text-[11px] font-medium tracking-wide text-stone-400">
            {isActive ? 'talking about this' : 'discussed'}
          </span>
        </div>

        {/* Title — click to edit, serif font */}
        {editingTitle ? (
          <input
            ref={titleInputRef}
            defaultValue={topic.name}
            onBlur={(e) => handleTitleSubmit(e.target.value)}
            onKeyDown={(e) => onKeyDown(e, () => handleTitleSubmit((e.target as HTMLInputElement).value))}
            className="font-serif text-base text-stone-800 mb-2 leading-tight w-full bg-stone-50 border border-stone-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-300 nodrag"
          />
        ) : (
          <h3
            className="font-serif text-base text-stone-800 mb-2 leading-tight cursor-text hover:bg-stone-50 rounded-lg px-1 -mx-1 transition-colors"
            onClick={() => setEditingTitle(true)}
            style={{ fontStyle: 'italic' }}
          >
            {topic.name}
          </h3>
        )}

        {/* Key points */}
        {topic.keyPoints.length > 0 && (
          <ul className="space-y-1 mb-2">
            {visiblePoints.map((point, i) => (
              <li key={i} className="text-xs text-stone-600 flex gap-1.5 group/point">
                <span className="shrink-0 mt-0.5" style={{ color: color.border }}>&#8226;</span>
                {editingPointIdx === i ? (
                  <input
                    ref={pointInputRef}
                    defaultValue={point}
                    onBlur={(e) => handlePointSubmit(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(e, () => handlePointSubmit(i, (e.target as HTMLInputElement).value))}
                    className="flex-1 bg-stone-50 border border-stone-300 rounded px-1 py-0 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300 nodrag"
                  />
                ) : (
                  <span
                    className="flex-1 cursor-text hover:bg-stone-50 rounded px-0.5 -mx-0.5 transition-colors"
                    onClick={() => setEditingPointIdx(i)}
                  >
                    {point}
                  </span>
                )}
                {editingPointIdx !== i && (
                  <button
                    onClick={() => deleteTopicKeyPoint(topic.id, i)}
                    className="text-stone-300 hover:text-red-400 opacity-0 group-hover/point:opacity-100 transition-opacity text-[10px] shrink-0 nodrag"
                    title="Remove"
                  >
                    &#10005;
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Show more/less */}
        {topic.keyPoints.length > MAX_DEFAULT_POINTS && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[11px] font-medium mb-2 nodrag"
            style={{ color: color.text }}
          >
            {showAll ? 'show less' : `+${topic.keyPoints.length - MAX_DEFAULT_POINTS} more`}
          </button>
        )}

        {/* Add new point */}
        {addingPoint ? (
          <div className="flex gap-1 mb-2">
            <input
              ref={addInputRef}
              placeholder="add a thought..."
              onBlur={(e) => handleAddSubmit(e.target.value)}
              onKeyDown={(e) => onKeyDown(e, () => handleAddSubmit((e.target as HTMLInputElement).value))}
              className="flex-1 bg-stone-50 border border-stone-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300 nodrag"
            />
          </div>
        ) : (
          <button
            onClick={() => setAddingPoint(true)}
            className="text-[11px] text-stone-400 hover:text-stone-600 font-medium mb-2 nodrag"
          >
            + jot something down
          </button>
        )}

        {/* Footer */}
        <div className="border-t border-stone-100 pt-2 flex items-center gap-2 text-[11px] text-stone-400">
          {topic.speaker && <span className="font-medium" style={{ color: color.text }}>{topic.speaker}</span>}
          {topic.speaker && <span>&middot;</span>}
          <span>{ageLabel}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!w-2 !h-2" style={{ background: color.border }} />
    </div>
  )
}

export const TopicNode = memo(TopicNodeComponent)
