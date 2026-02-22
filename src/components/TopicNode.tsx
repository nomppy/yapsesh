'use client'
import { memo, useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { Topic } from '@/types'
import { useAppStore } from '@/lib/store'
import { getTopicColor } from '@/lib/topic-colors'
interface TopicNodeData { topic: Topic; isActive: boolean; [key: string]: unknown }
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
  const opacity = Math.max(0.65, 1 - (age / (30 * 60000)) * 0.35)
  const visiblePoints = showAll ? topic.keyPoints : topic.keyPoints.slice(0, MAX_DEFAULT_POINTS)
  useEffect(() => { if (editingTitle) titleInputRef.current?.focus() }, [editingTitle])
  useEffect(() => { if (editingPointIdx !== null) pointInputRef.current?.focus() }, [editingPointIdx])
  useEffect(() => { if (addingPoint) addInputRef.current?.focus() }, [addingPoint])
  const handleTitleSubmit = (v: string) => { const t = v.trim(); if (t && t !== topic.name) updateTopicName(topic.id, t); setEditingTitle(false) }
  const handlePointSubmit = (i: number, v: string) => { const t = v.trim(); if (!t) deleteTopicKeyPoint(topic.id, i); else if (t !== topic.keyPoints[i]) updateTopicKeyPoint(topic.id, i, t); setEditingPointIdx(null) }
  const handleAddSubmit = (v: string) => { const t = v.trim(); if (t) addTopicKeyPoint(topic.id, t); setAddingPoint(false) }
  const onKeyDown = (e: KeyboardEvent, fn: () => void) => { if (e.key === 'Enter') fn(); if (e.key === 'Escape') { setEditingTitle(false); setEditingPointIdx(null); setAddingPoint(false) } }
  return (
    <div className="select-none" style={{ opacity, minWidth: 220, maxWidth: 280 }}>
      {/* Retro window card */}
      <div className="retro-window" style={{ boxShadow: isActive ? `4px 4px 0px rgba(0,0,0,0.25), 0 0 0 2px ${color.border}50` : '3px 3px 0px rgba(0,0,0,0.2)' }}>
        {/* Mini title bar — wood colored */}
        <div className="flex items-center gap-2 px-2 py-1" style={{ background: isActive ? color.border : '#8A7858', borderBottom: `2px solid ${isActive ? color.border : '#6A5A48'}` }}>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5" style={{ background: isActive ? '#C4956A' : '#A89878', border: '1px outset #C8B898' }} />
          </div>
          <span className="text-[9px] font-mono-display font-bold uppercase tracking-wider" style={{ color: '#F2EBE0' }}>
            {isActive ? '&#9679; ACTIVE' : 'NOTED'}
          </span>
        </div>
        <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !border-2" style={{ background: color.border, borderColor: '#F5F0E8', borderRadius: 0 }} />
        <div className="p-3 parchment-bg" style={{ background: color.bg }}>
          {/* Title */}
          {editingTitle ? (
            <input ref={titleInputRef} defaultValue={topic.name} onBlur={(e) => handleTitleSubmit(e.target.value)}
              onKeyDown={(e) => onKeyDown(e, () => handleTitleSubmit((e.target as HTMLInputElement).value))}
              className="retro-input w-full text-sm font-bold mb-2 nodrag" />
          ) : (
            <h3 className="text-sm font-serif mb-2 leading-snug cursor-text" onClick={() => setEditingTitle(true)}
              style={{ color: color.text, fontStyle: 'italic', fontWeight: 500 }}>{topic.name}</h3>
          )}
          {/* Key points */}
          {topic.keyPoints.length > 0 && (
            <ul className="space-y-1 mb-2">
              {visiblePoints.map((point, i) => (
                <li key={i} className="text-[11px] flex gap-1.5 group/point" style={{ color: '#4A5A4A' }}>
                  <span style={{ color: color.border }}>&#9656;</span>
                  {editingPointIdx === i ? (
                    <input ref={pointInputRef} defaultValue={point} onBlur={(e) => handlePointSubmit(i, e.target.value)}
                      onKeyDown={(e) => onKeyDown(e, () => handlePointSubmit(i, (e.target as HTMLInputElement).value))}
                      className="retro-input flex-1 text-[11px] nodrag" />
                  ) : (
                    <span className="flex-1 cursor-text" onClick={() => setEditingPointIdx(i)}>{point}</span>
                  )}
                  {editingPointIdx !== i && (
                    <button onClick={() => deleteTopicKeyPoint(topic.id, i)} className="opacity-0 group-hover/point:opacity-100 text-[10px] shrink-0 nodrag" style={{ color: '#A07060' }}>x</button>
                  )}
                </li>))}
            </ul>)}
          {topic.keyPoints.length > MAX_DEFAULT_POINTS && (
            <button onClick={() => setShowAll(!showAll)} className="text-[10px] font-mono-display font-bold uppercase mb-2 nodrag" style={{ color: color.text }}>
              [{showAll ? '- LESS' : `+ ${topic.keyPoints.length - MAX_DEFAULT_POINTS} MORE`}]</button>)}
          {addingPoint ? (
            <input ref={addInputRef} placeholder="jot a note..." onBlur={(e) => handleAddSubmit(e.target.value)}
              onKeyDown={(e) => onKeyDown(e, () => handleAddSubmit((e.target as HTMLInputElement).value))}
              className="retro-input w-full text-[11px] mb-2 nodrag" />
          ) : (
            <button onClick={() => setAddingPoint(true)} className="text-[10px] font-mono-display uppercase mb-2 nodrag" style={{ color: '#8B9B85' }}>[+ ADD NOTE]</button>
          )}
          {/* Footer */}
          <div className="border-t pt-1.5 flex items-center gap-2 text-[10px] font-mono-display" style={{ borderColor: `${color.border}30`, color: '#8B9B85' }}>
            {topic.speaker && <span className="font-bold uppercase" style={{ color: color.text }}>{topic.speaker}</span>}
            {topic.speaker && <span>|</span>}
            <span>{ageLabel}</span>
          </div>
        </div>
        <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !border-2" style={{ background: color.border, borderColor: '#F5F0E8', borderRadius: 0 }} />
      </div>
    </div>)
}
export const TopicNode = memo(TopicNodeComponent)
