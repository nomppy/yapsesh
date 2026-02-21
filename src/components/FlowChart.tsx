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
      // First time nodes appear — fit to view
      const timer = setTimeout(() => {
        fitView({ padding: 0.3, duration: 300 })
        hasInitialFit.current = true
      }, 50)
      return () => clearTimeout(timer)
    }
    // On subsequent updates, don't fitView — let the user stay where they are
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
          <div className="text-center text-zinc-400">
            <div className="text-4xl mb-3 opacity-30">&#127908;</div>
            <p className="text-sm font-medium">Start recording to see topics appear</p>
            <p className="text-xs mt-1">Topics will be extracted and mapped as you speak</p>
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
        <Background color="#e2e8f0" gap={20} size={1} />
        <Controls className="!bg-white !border-zinc-200 !shadow-sm" />
        <MiniMap
          nodeStrokeColor="#94a3b8"
          nodeColor={(node) => node.data?.isActive ? '#10b981' : '#e2e8f0'}
          className="!bg-white/80 !border-zinc-200"
        />
      </ReactFlow>
    </div>
  )
}
