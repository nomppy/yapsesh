'use client'

import { BaseEdge, getBezierPath, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react'
import type { Relationship } from '@/types'

const edgeColors: Record<string, string> = {
  led_to: '#64748b',
  related_to: '#94a3b8',
  contradicts: '#ef4444',
  expanded_on: '#6366f1',
}

const edgeLabels: Record<string, string> = {
  led_to: 'led to',
  related_to: 'related',
  contradicts: 'contradicts',
  expanded_on: 'expanded on',
}

export function TopicEdge({
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data, markerEnd,
}: EdgeProps) {
  const relationship = (data as { relationship: Relationship })?.relationship
  const type = relationship?.type || 'led_to'

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
  })

  const color = edgeColors[type] || edgeColors.led_to
  const label = relationship?.label || edgeLabels[type]

  const dashArray = type === 'related_to' || type === 'contradicts'
    ? '5 5'
    : type === 'expanded_on'
    ? '2 4'
    : undefined

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: 1.5,
          strokeDasharray: dashArray,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-none absolute px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/90 border border-zinc-200 text-zinc-500"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
