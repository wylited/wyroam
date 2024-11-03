import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ZettelCardProps {
  node: {
    id: string;
    title: string;
    html: string;
  };
  index: number;
  totalCards: number;
  isFolded: boolean;
  onClose: () => void;
  onClick: () => void;
}

export function ZettelCard({
  node,
  index,
  totalCards,
  isFolded,
  onClose,
  onClick
}: ZettelCardProps) {
  const cardWidth = isFolded ? '40px' : '600px';
  const xPosition = index * (isFolded ? -40 : -620);

  return (
    <motion.div
      layout
      initial={{ x: window.innerWidth }}
      animate={{
        x: xPosition,
        width: cardWidth
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute top-0 h-[calc(100vh-2rem)] bg-white border rounded-lg shadow-lg"
      style={{ zIndex: totalCards - index }}
    >
      {isFolded ? (
        <div
          className="h-full flex flex-col items-center justify-between py-4 cursor-pointer"
          onClick={onClick}
        >
          <div
            className="vertical-text font-medium"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {node.title}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="p-6 h-full overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">{node.title}</h2>
          <div
            dangerouslySetInnerHTML={{ __html: node.html }}
            className="markdown-body"
          />
        </div>
      )}
    </motion.div>
  );
}
