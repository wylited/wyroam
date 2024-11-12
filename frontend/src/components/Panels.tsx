// components/Panels.tsx
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useNodes } from "@/lib/NodeContext"
import { useTabs } from "@/lib/TabContext"
import * as React from "react"

export function Panels() {
  const { nodes } = useNodes()
  const {
    cycleLeftViewLeft,
    cycleLeftViewRight,
    cycleRightViewLeft,
    cycleRightViewRight,
    leftView,
    rightView
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
  }, [cycleLeftViewLeft, cycleLeftViewRight, cycleRightViewLeft, cycleRightViewRight])

  const getPanelNodes = () => {
    return {
      leftNode: leftView ? nodes.find(node => node.id === leftView.id) || null : null,
      rightNode: rightView ? nodes.find(node => node.id === rightView.id) || null : null
    }
  }

  const { leftNode, rightNode } = getPanelNodes()

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-screen rounded-lg"
    >
      <ResizablePanel defaultSize={50}>
        <ScrollArea className="h-screen">
          <div className="p-6">
            <div className="prose max-w-none">
              {leftNode ? (
                <div dangerouslySetInnerHTML={{ __html: leftNode.html }} />
              ) : (
                <p>No content in left panel</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <ScrollArea className="h-screen">
          <div className="p-6">
            <div className="prose max-w-none">
              {rightNode ? (
                <div dangerouslySetInnerHTML={{ __html: rightNode.html }} />
              ) : (
                <p>No content in right panel</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
