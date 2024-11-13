"use client";

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic'; // used to zoom in the canvas to fit
import { useNodes } from '@/lib/NodeContext';
import { useTabs } from "@/lib/TabContext";

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

interface GraphProps {
  mounted: boolean;
  setMounted: (value: boolean) => void;
}

export function Graph({ mounted, setMounted }: GraphProps) {
  const { nodeMap } = useNodes();
  const { leftView, rightView, head, addTab } = useTabs();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const fgRef = useRef<any>(null); // Reference for the ForceGraph2D

  useEffect(() => {
    // Check if there are active tabs
    if (!leftView && !rightView) {
      setGraphData({ nodes: [], links: [] });
      return;
    }

    const visited = new Set<string>();
    const graphNodes: GraphData['nodes'] = [];
    const graphLinks: GraphData['links'] = [];

    const centerNodeIds: string[] = [];
    if (leftView) centerNodeIds.push(leftView.id);   // simple nullcheck before passing the
    if (rightView) centerNodeIds.push(rightView.id); // id to the starting nodes of bfs

    const bfs = (startNodeIds: string[]) => {
      const queue = startNodeIds.map(id => ({ id, level: 0 }));

      while (queue.length > 0) {
        const { id: currentId, level } = queue.shift()!;
        if (visited.has(currentId) || level > 2) continue;

        visited.add(currentId);
        const currentNode = nodeMap[currentId];

        if (currentNode) {
          graphNodes.push({
            id: currentNode.id,
            title: currentNode.title,
            tags: currentNode.tags,
            level: level
          });

          if (level < 2) {
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
  }, [nodeMap, leftView, rightView]);

  if (!mounted) return null;

  if (!head) {
    return <div className="text-center p-4">No nodes open</div>;
  }

  return (
    <div className="w-full h-[90vh] overflow-hidden">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel={node => `${(node as any).title}`}
        warmupTicks={100}
        cooldownTicks={100}
        nodeAutoColorBy={node => `${(node as any).level}`}
        width={typeof window !== 'undefined' ? window.innerWidth : 0}
        height={typeof window !== 'undefined' ? window.innerHeight - 40 : 0}
        onNodeClick={(node) => {
          const clickedNode = node as GraphData['nodes'][0];
          addTab(clickedNode.id);
          setMounted(false);
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = (node as any).title;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Lexend`;

          ctx.beginPath();
          ctx.arc(node.x!, node.y!, 2, 0, 2 * Math.PI);
          ctx.fillStyle = node.color;
          ctx.fill();

          ctx.textAlign = 'center';
          ctx.fillStyle = '#000';
          ctx.fillText(label, node.x!, node.y! + 18 / globalScale);

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
