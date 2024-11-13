// components/Panel.tsx
import { useEffect } from 'react';
import { Node } from '@/lib/Node'
import { useTabs } from '@/lib/TabContext'
import renderMathInElement from 'katex/dist/contrib/auto-render';
import 'katex/dist/katex.min.css';

interface PanelProps {
  node: Node | null;
}

export function Panel({ node }: PanelProps) {
  const { addTab } = useTabs();

  const renderKaTeX = (html: string): string => {
    // Create a temporary div to render the math
    const temp = document.createElement('div');
    temp.innerHTML = html;

    renderMathInElement(temp, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
      ],
      throwOnError: false
    });

    return temp.innerHTML;
  };

  const processedHtml = node ? renderKaTeX(node.html) : '';

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      const href = target.getAttribute('href');

      if (href?.startsWith('id:')) {
        e.preventDefault();
        const id = href.replace('id:', '');
        addTab(id);
      }
    };

    const links = document.querySelectorAll('.prose a');
    links.forEach(link => {
      link.addEventListener('click', handleLinkClick);
    });

    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleLinkClick);
      });
    };
  }, [node, addTab]);

  return (
    <div className="prose max-w-none">
      {node ? (
        <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
      ) : (
        <p>Press ctrl+s to begin your exploration!</p>
      )}
    </div>
  );
}
