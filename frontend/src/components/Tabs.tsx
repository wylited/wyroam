'use client';
import { useNodes, useStack } from "@/lib/NodeContext"
import { cn } from "@/lib/utils"

export function Tabs() {
  const { nodes } = useNodes()
  const { nodeStack } = useStack()

  const tabNodes = nodeStack.slice(2).map(nodeId =>
    nodes.find(node => node.id === nodeId)
  ).filter((node): node is Node => node !== undefined)

  if (tabNodes.length === 0) return null

  return (
    <div className="border-l bg-background">
      <div className="flex flex-col h-screen">
        {tabNodes.map((node, index) => (
          <button
            key={node.id}
            className={cn(
              "group relative px-0.5 hover:bg-accent hover:text-accent-foreground transition-colors",
              "border-b last:border-b-0",
              "writing-mode-vertical",
              `h-[${Math.min(100 / Math.max(tabNodes.length, 1), 33)}vh]`
            )}
          >
            <span className="text-[10px] truncate">
              {node.title}
            </span>
            {/* Tooltip on hover */}
            <span className="absolute hidden group-hover:block right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-background border rounded shadow-lg whitespace-nowrap">
              {node.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
