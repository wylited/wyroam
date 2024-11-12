// components/Panels.tsx
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useNodes } from "@/lib/NodeContext"
import { TabList } from "@/components/TabList"
import * as React from "react"

export function Panels() {
  const { nodes } = useNodes()
  const tabList = TabList()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          tabList.cycleLeftViewLeft()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          tabList.cycleLeftViewRight()
        }
      } else if (e.altKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          tabList.cycleRightViewLeft()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          tabList.cycleRightViewRight()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [tabList])

  const getPanelNodes = () => {
    const leftView = tabList.leftView
    const rightView = tabList.rightView

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
