// components/Panel.tsx
import { useEffect } from 'react';
import { Node } from '@/lib/Node'
import { useTabs } from '@/lib/TabContext'
import 'katex/dist/katex.min.css';
import autoRender from 'katex/dist/contrib/auto-render.js';

interface PanelProps {
  node: Node | null;
  panelId: string; // Add unique identifier for each panel
}

export function Panel({ node, panelId }: PanelProps) {
  const { addTab, undoStack, rightView, leftView } = useTabs();

  useEffect(() => {
    if (node) {
      const element = document.querySelector(`#math-content-${panelId}`);
      if (element) {
        autoRender(element, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false
        });
      }
    }
  }, [node, panelId, undoStack. rightView, leftView]);

  useEffect(() => {
    const handleLinkClick = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const target = mouseEvent.target as HTMLAnchorElement;
      const href = target.getAttribute('href');

      if (href?.startsWith('id:')) {
        mouseEvent.preventDefault();
        const id = href.replace('id:', '');
        addTab(id);
      }
    };

    const links = document.querySelectorAll(`#math-content-${panelId} a`);
    links.forEach(link => {
      link.addEventListener('click', handleLinkClick);
    });

    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleLinkClick);
      });
    };
  }, [node, addTab, panelId]);

  return (
    <div className="prose max-w-none">
      {node ? (
        <div
          id={`math-content-${panelId}`}
          className="math-content"
          dangerouslySetInnerHTML={{ __html: node.html }}
        />
      ) : (
        <p>Press ctrl+s to begin your exploration!</p>
      )}
    </div>
  );
}
