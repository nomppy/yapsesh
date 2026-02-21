import dagre from 'dagre'
import type { Node, Edge } from '@xyflow/react'
import type { Topic, Relationship } from '@/types'

const NODE_WIDTH = 280
const NODE_HEIGHT = 160

export function computeLayout(
  topics: Record<string, Topic>,
  relationships: Relationship[],
  currentTopicId: string | null
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', nodesep: 80, ranksep: 180, marginx: 40, marginy: 40 })

  const topicList = Object.values(topics)

  for (const topic of topicList) {
    g.setNode(topic.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }

  for (const rel of relationships) {
    if (topics[rel.from] && topics[rel.to]) {
      g.setEdge(rel.from, rel.to)
    }
  }

  dagre.layout(g)

  const nodes: Node[] = topicList.map((topic) => {
    const nodeWithPosition = g.node(topic.id)
    return {
      id: topic.id,
      type: 'topicNode',
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
      data: {
        topic,
        isActive: topic.id === currentTopicId,
      },
    }
  })

  const edgeStyleMap: Record<string, { strokeDasharray?: string; stroke: string }> = {
    led_to: { stroke: '#64748b' },
    related_to: { strokeDasharray: '5 5', stroke: '#94a3b8' },
    contradicts: { strokeDasharray: '5 5', stroke: '#ef4444' },
    expanded_on: { strokeDasharray: '2 4', stroke: '#6366f1' },
  }

  const edges: Edge[] = relationships
    .filter(rel => topics[rel.from] && topics[rel.to])
    .map((rel, i) => ({
      id: `e-${rel.from}-${rel.to}-${i}`,
      source: rel.from,
      target: rel.to,
      type: 'topicEdge',
      data: { relationship: rel },
      style: edgeStyleMap[rel.type] || edgeStyleMap.led_to,
      animated: rel.type === 'led_to',
    }))

  return { nodes, edges }
}
