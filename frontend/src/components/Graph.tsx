"use client"

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useNodes } from '@/lib/NodeContext';
import { Node } from '@/lib/Node';

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
  const { nodes, nodeStack, peek } = useNodes();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 }); // Default dimensions

  useEffect(() => {
    setMounted(true);
    // Get the sidebar dimensions
    const updateDimensions = () => {
      const sidebar = document.querySelector('[data-sidebar]');
      if (sidebar) {
        const { width, height } = sidebar.getBoundingClientRect();
        setDimensions({ width, height: height * 0.5 }); // 50vh
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (nodeStack.length === 0) {
      setGraphData({ nodes: [], links: [] });
      return;
    }

    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const visited = new Set<string>();
    const graphNodes: GraphData['nodes'] = [];
    const graphLinks: GraphData['links'] = [];

    const centerNodeIds: string[] = [];
    const firstNode = peek(1);
    const secondNode = peek(2);

    if (firstNode) centerNodeIds.push(firstNode);
    if (secondNode) centerNodeIds.push(secondNode);

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
            currentNode.links.forEach(link => {
              const targetId = link.replace('id:', '');
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
  }, [nodes, nodeStack, peek]);

  if (!mounted) return null;

  if (nodeStack.length === 0) {
    return <div className="text-center p-4">No nodes in stack</div>;
  }

  return (
    <div className="w-full h-[100vh] overflow-hidden">
      <ForceGraph2D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeLabel={node => `${(node as any).title}`}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = (node as any).title;
          const fontSize = 8/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;

          const colors = ['#ff4444', '#44ff44', '#4444ff'];
          ctx.fillStyle = colors[(node as any).level] || '#999';

          // Larger node circles
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, 4, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = '#000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, node.x!, node.y! + 12);
        }}

        linkColor={() => '#999'}
        backgroundColor="#f1f1f1"
        forceEngine="d3"
        d3Force='charge'
        warmupTicks={100}
        cooldownTicks={100}
        onEngineStop={() => {
          // Optional: Reheat the simulation periodically
          setTimeout(() => {
            const fg = document.querySelector('canvas')?.__data__;
            if (fg) fg.d3ReheatSimulation();
          }, 2000);
        }}
        height={window.innerHeight - 50}

        width={window.innerWidth}
      />
    </div>
  );
}
