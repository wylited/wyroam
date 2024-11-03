'use client';
import { useEffect, useState } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

interface Node {
  id: string;
  title: string;
  html: string;
}

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    const fetchNodes = async () => {
      const query = `{
        allNodes {
          id
          title
          html
        }
      }`;

      try {
        const response = await fetch('http://localhost:3000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        const data = await response.json();
        if (data.data?.allNodes) {
          setNodes(data.data.allNodes.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching nodes:', error);
      }
    };

    fetchNodes();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Index</h1>
      <div>
        {nodes.map((node) => (
          <HoverCard key={node.id}>
            <HoverCardTrigger>
              <a className="text-blue-600 hover:text-blue-800 hover:underline">
                {node.title || 'Untitled'}
              </a>
              <br/>
            </HoverCardTrigger>
            <HoverCardContent className="min-w-none w-[200%] m-6 lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl">
              <div dangerouslySetInnerHTML={{ __html: node.html }} className="markdown-body"/>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  );
}
