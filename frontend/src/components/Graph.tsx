"use client"

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useNodes } from '@/lib/NodeContext';
import { TabList } from "@/components/TabList"

const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d'),
  { ssr: false }
);

interface GraphData {
  nodes: Array<{
    id: string;
    title: string;
    tags: string[];
    level: number;
  }>;
  links: Array<{
    source: string;
    target: string;
  }>;
}

export function Graph() {
  const { nodes } = useNodes();
  const tabList = TabList();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [mounted, setMounted] = useState(false);

  // Set mounted state when component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check if there are active tabs
    if (!tabList.leftView && !tabList.rightView) {
      setGraphData({ nodes: [], links: [] });
      return;
    }

    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const visited = new Set<string>();
    const graphNodes: GraphData['nodes'] = [];
    const graphLinks: GraphData['links'] = [];

    const centerNodeIds: string[] = [];
    if (tabList.leftView) centerNodeIds.push(tabList.leftView.id);
    if (tabList.rightView) centerNodeIds.push(tabList.rightView.id);

    const bfs = (startNodeIds: string[]) => {
      const queue = startNodeIds.map(id => ({ id, level: 0 }));

      while (queue.length > 0) {
        const { id: currentId, level } = queue.shift()!;
        if (visited.has(currentId) || level > 2) continue;

        visited.add(currentId);
        const currentNode = nodeMap.get(currentId);

        if (currentNode) {
          graphNodes.push({
            id: currentNode.id,
            title: currentNode.title,
            tags: currentNode.tags,
            level: level
          });

          if (level < 2) {
            // Handle links properly by checking if they exist
            currentNode.links?.forEach(link => {
              const targetId = typeof link === 'string' ? link.replace('id:', '') : link;
              if (!visited.has(targetId)) {
                queue.push({ id: targetId, level: level + 1 });
                graphLinks.push({
                  source: currentId,
                  target: targetId
                });
              }
            });
          }
        }
      }
    };

    bfs(centerNodeIds);
    setGraphData({ nodes: graphNodes, links: graphLinks });
  }, [nodes, tabList.leftView, tabList.rightView]);

  if (!mounted) return null;

  if (!tabList.head) {
    return <div className="text-center p-4">No nodes open</div>;
  }

  return (
    <div className="w-full h-[100vh] overflow-hidden">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel={node => `${(node as any).title}`}
        warmupTicks={100}
        cooldownTicks={100}
        nodeAutoColorBy={node => `${(node as any).level}`}
        width={typeof window !== 'undefined' ? window.innerWidth : 0}
        height={typeof window !== 'undefined' ? window.innerHeight - 40 : 0}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = (node as any).title;
          const fontSize = 10/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;

          // Draw node
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, 4, 0, 2 * Math.PI);
          ctx.fillStyle = node.color;
          ctx.fill();

          // Draw text below node
          ctx.textAlign = 'center';
          ctx.fillStyle = '#000';
          ctx.fillText(label, node.x!, node.y! + 18/globalScale);
        }}

        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, 4, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
      />
    </div>
  );
}
