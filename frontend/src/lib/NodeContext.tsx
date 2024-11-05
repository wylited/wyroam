"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Node } from '@/lib/Node'

interface NodeContextType {
  nodes: Node[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

const NodeContext = createContext<NodeContextType | undefined>(undefined)

export function NodeProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

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
    console.log('Received data:', data) // Add this log

    if (data.errors) {
      throw new Error(data.errors[0].message)
    }

    // Add this log
    console.log('Setting nodes with:', data.data.allNodes)
    setNodes(data.data.allNodes)
    setError(null)
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Failed to fetch nodes'))
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchNodes()
  }, [])

  useEffect(() => {
  console.log('Current nodes state:', nodes)
}, [nodes])

  const refetch = async () => {
    setLoading(true)
    await fetchNodes()
  }

  return (
    <NodeContext.Provider value={{ nodes, loading, error, refetch }}>
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

export function NodeList() {
  const { nodes, loading, error } = useNodes()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="prose">
    {nodes.map(node => (
      <div key={node.id} >
        <h1 className="text-3xl font-bold mt-4">{node.title}</h1>
        <p className="mt-4"><div>{node.html}</div></p>
      </div>
    ))}
    </div>
  )
}
