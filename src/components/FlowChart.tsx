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
        <div className="retro-window mx-auto" style={{ width: 300, boxShadow: '4px 4px 0px rgba(0,0,0,0.2)' }}>
          <div className="retro-title-bar">
            <span>YapSesh</span>
            <div className="flex gap-1"><div className="win-ctrl" /></div>
          </div>
          <div className="p-6 text-center parchment-bg">
            <p className="text-sm font-mono-display font-bold mb-2" style={{ color: '#5A4A38' }}>
              Nothing here yet<span className="blink">_</span>
            </p>
            <p className="text-[11px] font-mono-display" style={{ color: '#8A7A68' }}>
              Press RECORD and start talking.
            </p>
            <p className="text-[11px] font-mono-display mt-1" style={{ color: '#8A7A68' }}>
              Topics will show up here.
            </p>
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
    <div className="w-full h-full relative parchment-bg" style={{ background: '#F0E8D8' }}>
      {topicCount === 0 && <RetroEmptyState />}
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onInit={onInit} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView proOptions={{ hideAttribution: true }} minZoom={0.5} maxZoom={2} defaultEdgeOptions={{ type: 'topicEdge' }}>
        <Background color="#D0C4A8" gap={24} size={0.5} />
        <Controls />
        {topicCount >= 8 && (<MiniMap nodeStrokeColor="#8B9B85" nodeColor={(node) => { const t = node.data?.topic as { colorIndex?: number } | undefined; if (node.data?.isActive) return '#C4956A'; if (t?.colorIndex !== undefined) return getTopicColor(t.colorIndex).border; return '#D4DDD0' }} />)}
      </ReactFlow>
    </div>)
}
