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
import type { CardNodeData } from '@/lib/treeBuilder'

const CardNode = dynamic(() => import('./CardNode'), { ssr: false })
const nodeTypes = { cardNode: CardNode } as NodeTypes

function GraphCanvasInner() {
  const jsonNode = useStore((s) => s.jsonNode)
  const collapsedPaths = useStore((s) => s.collapsedPaths)

  const { nodes, edges } = useMemo(
    () => (jsonNode ? buildGraph(jsonNode, collapsedPaths) : { nodes: [], edges: [] }),
    [jsonNode, collapsedPaths]
  )

  const fitViewPadding = 0.12

  return (
    <div className="h-full w-full" style={{ background: '#09090b' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: fitViewPadding }}
        minZoom={0.05}
        maxZoom={4}
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          type: 'default',
          style: { stroke: '#555', strokeWidth: 1.5, opacity: 0.3 },
        }}
        proOptions={{ hideAttribution: true }}
        panOnDrag={true}
        zoomOnScroll={true}
        selectNodesOnDrag={false}
        nodesDraggable={true}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1.5}
          color="#333"
        />
        <Controls
          showInteractive={false}
          position="bottom-right"
          className="!bg-background/90 !backdrop-blur-md !border !border-border !rounded-lg !shadow-sm"
        />
        <MiniMap
          nodeStrokeWidth={1}
          nodeStrokeColor="#666"
          nodeColor="#2a2a2a"
          bgColor="#0a0a0a"
          maskColor="rgba(59, 130, 246, 0.15)"
          style={{
            border: '1px solid #333',
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
