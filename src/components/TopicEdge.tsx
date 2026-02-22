'use client'
import { BaseEdge, getBezierPath, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react'
import type { Relationship } from '@/types'
const edgeColors: Record<string, string> = { led_to: '#8A7458', related_to: '#A89878', contradicts: '#A07060', expanded_on: '#5B7553' }
const edgeLabels: Record<string, string> = { led_to: 'led to', related_to: 'related', contradicts: 'diverged', expanded_on: 'branched' }
export function TopicEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd }: EdgeProps) {
  const relationship = (data as { relationship: Relationship })?.relationship
  const type = relationship?.type || 'led_to'
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })
  const color = edgeColors[type] || edgeColors.led_to
  const label = relationship?.label || edgeLabels[type]
  const dashArray = type === 'related_to' ? '6 4' : type === 'contradicts' ? '4 4' : type === 'expanded_on' ? '8 3' : undefined
  return (<>
    <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ stroke: color, strokeWidth: 2.5, strokeDasharray: dashArray, strokeLinecap: 'round', opacity: 0.7 }} />
    <EdgeLabelRenderer>
      <div className="nodrag nopan pointer-events-none absolute px-1.5 py-0.5 text-[9px] font-mono-display font-bold uppercase"
        style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, background: '#F5F0E8', border: '1px solid #A09080', color, boxShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}>
        {label}
      </div>
    </EdgeLabelRenderer>
  </>)
}
