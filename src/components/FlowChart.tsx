'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useAppStore } from '@/lib/store'
import { computeLayout } from '@/lib/graph/layout'
import { TopicNode } from './TopicNode'
import { TopicEdge } from './TopicEdge'
import { getTopicColor } from '@/lib/topic-colors'

const nodeTypes: NodeTypes = {
  topicNode: TopicNode,
}

const edgeTypes: EdgeTypes = {
  topicEdge: TopicEdge,
}

export function FlowChart() {
  const topics = useAppStore((s) => s.topics)
  const relationships = useAppStore((s) => s.relationships)
  const currentTopicId = useAppStore((s) => s.currentTopicId)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const { fitView, setCenter } = useReactFlow()
  const hasInitialFit = useRef(false)

  const layout = useMemo(
    () => computeLayout(topics, relationships, currentTopicId),
    [topics, relationships, currentTopicId]
  )

  useEffect(() => {
    const hadNodes = nodes.length > 0
    setNodes(layout.nodes)
    setEdges(layout.edges)

    if (layout.nodes.length > 0 && !hadNodes) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.3, duration: 300 })
        hasInitialFit.current = true
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [layout, setNodes, setEdges, fitView, nodes.length])

  const topicCount = Object.keys(topics).length

  const onInit = useCallback(() => {
    if (topicCount > 0) {
      fitView({ padding: 0.3 })
      hasInitialFit.current = true
    }
  }, [fitView, topicCount])

  return (
    <div className="w-full h-full relative">
      {topicCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center">
            {/* Illustrated empty state: sound waves flowing into connected nodes */}
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="mx-auto mb-4 opacity-25">
              {/* Sound waves on left */}
              <path d="M8 40 Q12 30 16 40 Q20 50 24 40" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M4 40 Q10 24 20 40 Q30 56 36 40" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              {/* Arrow */}
              <path d="M40 40 L55 40" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M52 36 L56 40 L52 44" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Connected nodes */}
              <rect x="60" y="28" width="22" height="14" rx="4" stroke="#A8A29E" strokeWidth="1.5" fill="none" />
              <rect x="90" y="20" width="22" height="14" rx="4" stroke="#A8A29E" strokeWidth="1.5" fill="none" />
              <rect x="90" y="46" width="22" height="14" rx="4" stroke="#A8A29E" strokeWidth="1.5" fill="none" />
              {/* Connections between nodes */}
              <path d="M82 32 L90 27" stroke="#A8A29E" strokeWidth="1" strokeLinecap="round" />
              <path d="M82 38 L90 50" stroke="#A8A29E" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <p className="text-sm font-serif text-stone-400 italic">Go ahead, yap away</p>
            <p className="text-[11px] text-stone-300 mt-1">Hit record and start talking — topics will appear here</p>
          </div>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        minZoom={0.5}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'topicEdge',
        }}
      >
        <Background color="#E8E8E4" gap={24} size={0.8} />
        <Controls className="!bg-white !border-stone-200 !shadow-sm !rounded-xl" />
        {topicCount >= 8 && (
          <MiniMap
            nodeStrokeColor="#A8A29E"
            nodeColor={(node) => {
              const topic = node.data?.topic as { colorIndex?: number; isActive?: boolean } | undefined
              if (node.data?.isActive) return '#10B981'
              if (topic?.colorIndex !== undefined) return getTopicColor(topic.colorIndex).border
              return '#E7E5E4'
            }}
            className="!bg-white/80 !border-stone-200 !rounded-xl"
          />
        )}
      </ReactFlow>
    </div>
  )
}
