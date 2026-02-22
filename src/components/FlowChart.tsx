'use client'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, useReactFlow, type Node, type Edge, type NodeTypes, type EdgeTypes } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useAppStore } from '@/lib/store'
import { computeLayout } from '@/lib/graph/layout'
import { TopicNode } from './TopicNode'
import { TopicEdge } from './TopicEdge'
import { getTopicColor } from '@/lib/topic-colors'
const nodeTypes: NodeTypes = { topicNode: TopicNode }
const edgeTypes: EdgeTypes = { topicEdge: TopicEdge }
function RetroEmptyState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="text-center">
        {/* Retro terminal / field notes display */}
        <div className="retro-window mx-auto" style={{ width: 320, boxShadow: '4px 4px 0px rgba(0,0,0,0.15)' }}>
          <div className="retro-title-bar">
            <span>FIELD_NOTES.exe</span>
            <div className="flex gap-1"><div className="win-ctrl" /><div className="win-ctrl" /></div>
          </div>
          <div className="p-5 text-center" style={{ background: '#1A2A1A' }}>
            {/* Pixel tree */}
            <div className="font-mono-display text-[11px] leading-tight mb-4 whitespace-pre" style={{ color: '#5B7553' }}>{`     /\\
    /  \\
   /    \\
  /______\\
     ||`}</div>
            <p className="text-sm font-mono-display font-bold mb-1" style={{ color: '#7BA56E' }}>
              AWAITING INPUT<span className="blink">_</span>
            </p>
            <p className="text-[11px] font-mono-display" style={{ color: '#5B7553' }}>
              Plant a seed — press RECORD
            </p>
            <div className="mt-3 text-[10px] font-mono-display" style={{ color: '#4A5A4A' }}>
              ================================<br />
              YapSesh Field Station v1.0<br />
              Ready.
            </div>
          </div>
        </div>
      </div>
    </div>)
}
export function FlowChart() {
  const topics = useAppStore((s) => s.topics)
  const relationships = useAppStore((s) => s.relationships)
  const currentTopicId = useAppStore((s) => s.currentTopicId)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const { fitView } = useReactFlow()
  const hasInitialFit = useRef(false)
  const layout = useMemo(() => computeLayout(topics, relationships, currentTopicId), [topics, relationships, currentTopicId])
  useEffect(() => {
    const hadNodes = nodes.length > 0; setNodes(layout.nodes); setEdges(layout.edges)
    if (layout.nodes.length > 0 && !hadNodes) { const t = setTimeout(() => { fitView({ padding: 0.3, duration: 300 }); hasInitialFit.current = true }, 50); return () => clearTimeout(t) }
  }, [layout, setNodes, setEdges, fitView, nodes.length])
  const topicCount = Object.keys(topics).length
  const onInit = useCallback(() => { if (topicCount > 0) { fitView({ padding: 0.3 }); hasInitialFit.current = true } }, [fitView, topicCount])
  return (
    <div className="w-full h-full relative" style={{ background: '#E8EDE4' }}>
      {topicCount === 0 && <RetroEmptyState />}
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onInit={onInit} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView proOptions={{ hideAttribution: true }} minZoom={0.5} maxZoom={2} defaultEdgeOptions={{ type: 'topicEdge' }}>
        <Background color="#B8C4B4" gap={20} size={0.5} />
        <Controls />
        {topicCount >= 8 && (<MiniMap nodeStrokeColor="#8B9B85" nodeColor={(node) => { const t = node.data?.topic as { colorIndex?: number } | undefined; if (node.data?.isActive) return '#C4956A'; if (t?.colorIndex !== undefined) return getTopicColor(t.colorIndex).border; return '#D4DDD0' }} />)}
      </ReactFlow>
    </div>)
}
