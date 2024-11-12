"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Node } from '@/lib/Node'
import { Button } from '@/components/ui/button'
interface NodeContextType {
  nodes: Node[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  // Stack-related state and functions
  nodeStack: string[]
  undoStack: string[]
  push: (nodeId: string) => void
  pop: () => string | undefined
  undo: () => void
  clear: () => void
  peek: () => string | undefined
  getStack: () => string[]
  getUndoStack: () => string[]
}

const NodeContext = createContext<NodeContextType | undefined>(undefined)

export function NodeProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Stack-related state
  const [nodeStack, setNodeStack] = useState<string[]>([])
  const [undoStack, setUndoStack] = useState<string[]>([])

  const fetchNodes = async () => {
    try {
      const response = await fetch('http://localhost:8000/graph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              allNodes {
                id
                filename
                title
                aliases
                tags
                links
                html
              }
            }
          `
        }),
      })

      const data = await response.json()

      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      setNodes(data.data.allNodes)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch nodes'))
    } finally {
      setLoading(false)
    }
  }

  // Stack operations
  const push = (nodeId: string) => {
    setNodeStack(prevStack => [...prevStack, nodeId])
  }

  const pop = () => {
    if (nodeStack.length === 0) return undefined

    const lastNode = nodeStack[nodeStack.length - 1]
    setNodeStack(prevStack => prevStack.slice(0, -1))
    setUndoStack(prevUndo => [...prevUndo, lastNode])
    return lastNode
  }

  const undo = () => {
    if (undoStack.length === 0) return

    const nodeToRestore = undoStack[undoStack.length - 1]
    setUndoStack(prevUndo => prevUndo.slice(0, -1))
    setNodeStack(prevStack => [...prevStack, nodeToRestore])
  }

  const clear = () => {
    setNodeStack([])
    setUndoStack([])
  }

  const peek = (n: node) => {
    return nodeStack.length > 0 ? nodeStack[nodeStack.length - 1] : undefined
  }

  const getStack = () => nodeStack
  const getUndoStack = () => undoStack

  useEffect(() => {
    fetchNodes()
  }, [])

  const refetch = async () => {
    setLoading(true)
    await fetchNodes()
  }

  return (
    <NodeContext.Provider value={{
      nodes,
      loading,
      error,
      refetch,
      nodeStack,
      undoStack,
      push,
      pop,
      undo,
      clear,
      peek,
      getStack,
      getUndoStack
    }}>
      {children}
    </NodeContext.Provider>
  )
}

export function useNodes() {
  const context = useContext(NodeContext)
  if (context === undefined) {
    throw new Error('useNodes must be used within a NodeProvider')
  }
  return context
}

// Custom hook for stack operations
export function useStack() {
  const context = useContext(NodeContext)
  if (context === undefined) {
    throw new Error('useStack must be used within a NodeProvider')
  }

  return {
    push: context.push,
    pop: context.pop,
    undo: context.undo,
    clear: context.clear,
    peek: context.peek,
    getStack: context.getStack,
    getUndoStack: context.getUndoStack,
    nodeStack: context.nodeStack,
    undoStack: context.undoStack
  }
}

// Modified NodeList component to display the stack
export function NodeList() {
  const { nodes, loading, error } = useNodes()
  const { nodeStack, undoStack, pop } = useStack()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  // Find nodes that are in the stack
  const stackNodes = nodeStack.map(nodeId =>
    nodes.find(node => node.id === nodeId)
  ).filter((node): node is Node => node !== undefined)

  return (
    <div className="prose">
      <h2>Current Stack</h2>
      {stackNodes.map((node, index) => (
        <div key={`${node.id}-${index}`} className="p-4 border-b">
          <h3 className="text-xl font-bold">{node.title}</h3>
          <p className="text-sm text-gray-500">ID: {node.id}</p>
          {node.tags.length > 0 && (
            <p className="text-sm">Tags: {node.tags.join(', ')}</p>
          )}
        </div>
      ))}
      <Button onClick={pop}>X</Button>
      {stackNodes.length === 0 && (
        <p>Stack is empty</p>
      )}

      <h2 className="mt-4">Undo Stack</h2>
      <p className="text-sm text-gray-500">
        Items in undo stack: {undoStack.length}
      </p>
    </div>
  )
}
