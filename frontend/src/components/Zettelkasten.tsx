import { useState } from 'react';
import { Node } from './Node';
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

interface ZettelkastenProps {
  nodes: Node[];
}

export function Zettelkasten({ nodes }: ZettelkastenProps) {
  const [openCards, setOpenCards] = useState<Node[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const handleNodeClick = (node: Node) => {
    setOpenCards(prev => [...prev, node]);
    setActiveIndex(openCards.length);
  };

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleCloseCard = (index: number) => {
    setOpenCards(prev => prev.filter((_, i) => i !== index));
    setActiveIndex(Math.max(0, activeIndex - 1));
  };

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Index</h1>
        <div>
          {nodes.map((node) => (
            <HoverCard key={node.id}>
              <HoverCardTrigger>
                <button
                  onClick={() => handleNodeClick(node)}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {node.title || 'Untitled'}
                </button>
                <br/>
              </HoverCardTrigger>
              <HoverCardContent className="w-[200%] m-6">
                <div
                  dangerouslySetInnerHTML={{ __html: node.html }}
                  className="markdown-body"
                />
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>

      <div className="relative overflow-x-auto h-[calc(50vh)] justify-self-end">
        <div className="flex space-x-4">
          {openCards.map((card, index) => (
            <div
              key={card.id}
              className={`transition-transform duration-300 ${
                index === activeIndex ? 'transform-none' : 'transform -translate-x-full'
              }`}
            >
              <Node
                node={card}
                index={index}
                totalCards={openCards.length}
                isFolded={index !== activeIndex}
                onClose={() => handleCloseCard(index)}
                onClick={() => handleCardClick(index)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
