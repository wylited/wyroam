'use client';
import { Sidebar } from "@/components/Sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useNodes, useStack } from "@/lib/NodeContext"

export default function Home() {
  const { nodes } = useNodes()
  const { peek } = useStack()

  const getTopNodes = () => {
    const topNodeId = peek(1)
    const secondNodeId = peek(2)

    return {
      topNode: topNodeId ? nodes.find(node => node.id === topNodeId) || null : null,
      secondNode: secondNodeId ? nodes.find(node => node.id === secondNodeId) || null : null
    }
  }

  const { topNode, secondNode } = getTopNodes()

  return (
    <div className="min-h-screen flex">
      <main className="flex-1 pr-16">
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-screen rounded-lg"
        >
          <ResizablePanel defaultSize={50}>
            <div className="h-screen overflow-auto p-6">
              <div className="prose max-w-none">
                {topNode ? (
                  <div dangerouslySetInnerHTML={{ __html: topNode.html }} />
                ) : (
                  <p>No content in left panel</p>
                )}
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <ScrollArea className="h-screen">
              <div className="p-6">
                <div className="prose max-w-none">
                  {secondNode ? (
                    <div dangerouslySetInnerHTML={{ __html: secondNode.html }} />
                  ) : (
                    <p>No content in right panel</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      <Sidebar />
    </div>
  )
}
