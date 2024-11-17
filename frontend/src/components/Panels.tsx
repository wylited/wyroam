// components/Panels.tsx
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useNodes } from "@/lib/NodeContext"
import { useTabs } from "@/lib/TabContext"
import { Panel } from '@/components/Panel';
import { Node } from '@/lib/Node';
import * as React from "react"

export function Panels() {
  const { nodes } = useNodes()
  const {
    cycleLeftViewLeft,
    cycleLeftViewRight,
    cycleRightViewLeft,
    cycleRightViewRight,
    leftView,
    rightView,
    undo
  } = useTabs()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          cycleLeftViewLeft()
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          cycleLeftViewRight()
        } else if (e.key === 'z'){
          e.preventDefault()
          undo()
        }
      } else if (e.altKey) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          cycleRightViewLeft()
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          cycleRightViewRight()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [cycleLeftViewLeft,
      cycleLeftViewRight,
      cycleRightViewLeft,
      cycleRightViewRight])

  type PanelNodes = {
    leftNode: Node | null;
    rightNode: Node | null;
  };

  const getPanelNodes = (): PanelNodes => {
    return {
      leftNode: leftView ? nodes.find(node => node.id === leftView.id) || null : null,
      rightNode: rightView ? nodes.find(node => node.id === rightView.id) || null : null
    };
  };

  const { leftNode, rightNode } = getPanelNodes()

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-screen rounded-lg"
    >
      <ResizablePanel defaultSize={50}>
        <ScrollArea className="h-screen">
          <div className="p-6">
            <Panel node={leftNode} panelId="Left" />
          </div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <ScrollArea className="h-screen">
          <div className="p-6">
            <Panel node={rightNode} panelId="Right" />
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
