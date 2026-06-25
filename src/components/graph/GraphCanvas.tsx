'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useStore } from '@/stores/useStore'
import { buildGraph } from '@/lib/graphUtils'

const JsonGraphNode = dynamic(() => import('./JsonGraphNode'), { ssr: false })
const nodeTypes = { jsonNode: JsonGraphNode } as NodeTypes

const typeColorMap: Record<string, string> = {
  object: '#3b82f6',
  array: '#8b5cf6',
  string: '#10b981',
  number: '#f59e0b',
  boolean: '#ef4444',
  null: '#71717a',
}

function GraphCanvasInner() {
  const jsonNode = useStore((s) => s.jsonNode)
  const collapsedPaths = useStore((s) => s.collapsedPaths)
  const theme = useStore((s) => s.theme)
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const { nodes, edges } = useMemo(
    () => (jsonNode ? buildGraph(jsonNode, collapsedPaths) : { nodes: [], edges: [] }),
    [jsonNode, collapsedPaths]
  )

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        minZoom={0.05}
        maxZoom={4}
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#888', strokeWidth: 1.5, opacity: 0.3 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#888"
          className="opacity-20"
        />
        <Controls
          showInteractive={false}
          position="bottom-right"
          className="!bg-background/90 !backdrop-blur-md !border !border-border !rounded-lg !shadow-sm"
        />
        <MiniMap
          nodeStrokeWidth={2}
          nodeStrokeColor={isDark ? '#555' : '#bbb'}
          nodeColor={(n) => {
            const t = (n.data as { type?: string })?.type ?? ''
            return typeColorMap[t] ?? '#71717a'
          }}
          maskColor={isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'}
          style={{
            background: isDark ? '#111' : '#f4f4f5',
            border: `1px solid ${isDark ? '#333' : '#d4d4d8'}`,
            borderRadius: '8px',
          }}
          className="!shadow-sm"
          position="bottom-left"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  )
}

export function GraphCanvas() {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner />
    </ReactFlowProvider>
  )
}
