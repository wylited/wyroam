'use client';
import { useEffect, useState } from 'react';
import { Zettelkasten } from '@/components/Zettelkasten';

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

  return <Zettelkasten nodes={nodes} />;
}
