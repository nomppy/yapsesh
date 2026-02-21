'use client'

import { memo, useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { Topic } from '@/types'
import { useAppStore } from '@/lib/store'

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
        min-w-[240px] max-w-[300px] rounded-xl border bg-white shadow-md
        transition-all duration-300 select-none
        ${isActive
          ? 'border-emerald-400 shadow-emerald-200/50 shadow-lg ring-2 ring-emerald-300/30'
          : 'border-zinc-200 hover:border-zinc-300 hover:shadow-lg'
        }
      `}
      style={{ opacity }}
    >
      <Handle type="target" position={Position.Left} className="!bg-zinc-400 !w-2 !h-2" />

      <div className="p-3">
        {/* Status indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`} />
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {isActive ? 'Active' : 'Discussed'}
          </span>
        </div>

        {/* Title — click to edit */}
        {editingTitle ? (
          <input
            ref={titleInputRef}
            defaultValue={topic.name}
            onBlur={(e) => handleTitleSubmit(e.target.value)}
            onKeyDown={(e) => onKeyDown(e, () => handleTitleSubmit((e.target as HTMLInputElement).value))}
            className="font-semibold text-sm text-zinc-800 mb-2 leading-tight w-full bg-zinc-50 border border-zinc-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 nodrag"
          />
        ) : (
          <h3
            className="font-semibold text-sm text-zinc-800 mb-2 leading-tight cursor-text hover:bg-zinc-50 rounded px-0.5 -mx-0.5 transition-colors"
            onClick={() => setEditingTitle(true)}
          >
            {topic.name}
          </h3>
        )}

        {/* Key points */}
        {topic.keyPoints.length > 0 && (
          <ul className="space-y-1 mb-2">
            {visiblePoints.map((point, i) => (
              <li key={i} className="text-xs text-zinc-600 flex gap-1.5 group/point">
                <span className="text-zinc-400 shrink-0 mt-0.5">&#8226;</span>
                {editingPointIdx === i ? (
                  <input
                    ref={pointInputRef}
                    defaultValue={point}
                    onBlur={(e) => handlePointSubmit(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(e, () => handlePointSubmit(i, (e.target as HTMLInputElement).value))}
                    className="flex-1 bg-zinc-50 border border-zinc-300 rounded px-1 py-0 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 nodrag"
                  />
                ) : (
                  <span
                    className="flex-1 cursor-text hover:bg-zinc-50 rounded px-0.5 -mx-0.5 transition-colors"
                    onClick={() => setEditingPointIdx(i)}
                  >
                    {point}
                  </span>
                )}
                {editingPointIdx !== i && (
                  <button
                    onClick={() => deleteTopicKeyPoint(topic.id, i)}
                    className="text-zinc-300 hover:text-red-400 opacity-0 group-hover/point:opacity-100 transition-opacity text-[10px] shrink-0 nodrag"
                    title="Delete point"
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
            className="text-[10px] text-indigo-500 hover:text-indigo-600 font-medium mb-2 nodrag"
          >
            {showAll ? 'Show less' : `+${topic.keyPoints.length - MAX_DEFAULT_POINTS} more`}
          </button>
        )}

        {/* Add new point */}
        {addingPoint ? (
          <div className="flex gap-1 mb-2">
            <input
              ref={addInputRef}
              placeholder="New point..."
              onBlur={(e) => handleAddSubmit(e.target.value)}
              onKeyDown={(e) => onKeyDown(e, () => handleAddSubmit((e.target as HTMLInputElement).value))}
              className="flex-1 bg-zinc-50 border border-zinc-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 nodrag"
            />
          </div>
        ) : (
          <button
            onClick={() => setAddingPoint(true)}
            className="text-[10px] text-zinc-400 hover:text-zinc-600 font-medium mb-2 nodrag"
          >
            + Add point
          </button>
        )}

        {/* Footer */}
        <div className="border-t border-zinc-100 pt-2 flex items-center gap-2 text-[10px] text-zinc-400">
          {topic.speaker && <span className="font-medium">{topic.speaker}</span>}
          {topic.speaker && <span>&middot;</span>}
          <span>{ageLabel}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-zinc-400 !w-2 !h-2" />
    </div>
  )
}

export const TopicNode = memo(TopicNodeComponent)
