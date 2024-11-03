// components/Search.tsx
import { useState, useCallback } from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import DOMPurify from 'dompurify';

interface Node {
  id: string;
  title: string;
  html: string;
}

interface SearchProps {
  nodes: Node[];
  onSelectNode: (node: Node) => void;
}

export default function Search({ nodes, onSelectNode }: SearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Node[]>([]);

  // Function to strip HTML tags and clean the text
  const stripHtml = (html: string) => {
    const cleanHtml = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
    return cleanHtml.replace(/\s+/g, ' ').trim();
  };

  // Search function
  const handleSearch = useCallback((searchTerm: string) => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    const results = nodes.filter((node) => {
      const normalizedSearch = searchTerm.toLowerCase();
      const titleMatch = node.title.toLowerCase().includes(normalizedSearch);
      const contentMatch = stripHtml(node.html)
        .toLowerCase()
        .includes(normalizedSearch);

      return titleMatch || contentMatch;
    });

    setSearchResults(results);
  }, [nodes]);

  // Function to handle node selection
  const handleSelect = (node: Node) => {
    onSelectNode(node);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full max-w-sm px-4 py-2 text-left text-sm rounded-lg border border-input bg-background"
      >
        Search nodes...
      </button>

      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search nodes..."
            onValueChange={handleSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Results">
              {searchResults.map((node) => {
                const content = stripHtml(node.html);
                return (
                  <CommandItem
                    key={node.id}
                    onSelect={() => handleSelect(node)}
                    className="flex flex-col items-start gap-1"
                  >
                    <div className="font-medium">{node.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {content}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
