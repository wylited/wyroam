"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Node } from '@/lib/Node'

interface NodeContextType {
  nodes: Node[];
  nodeMap: { [id: string]: Node };
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const NodeContext = createContext<NodeContextType | undefined>(undefined)

export function NodeProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [nodeMap, setNodeMap] = useState<{ [id: string]: Node }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('0')

  const checkUpdates = async () => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              lastUpdated
            }
          `
        }),
      })

      const data = await response.json()

      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      if (lastUpdated !== data.data.lastUpdated){
        console.log(lastUpdated);
        console.log(data.data.lastUpdated)
        setLastUpdated(data.data.lastUpdated);
      }

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check updates'))
    }
  }

  const fetchNodes = async () => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
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
              lastUpdated
            }
          `
        }),
      })

      const data = await response.json()

      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      setNodes(data.data.allNodes)
      setLastUpdated(data.data.lastUpdated)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch nodes'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNodes();
  }, []);

  useEffect(() => {
    console.log(lastUpdated)
    fetchNodes();
  }, [lastUpdated]);

  useEffect(() => {
    const map = nodes.reduce((acc, node) => {
      acc[node.id] = node
      return acc
    }, {} as { [id: string]: Node })

    setNodeMap(map)
  }, [nodes])

  const refetch = async () => {
    setLoading(true)
    await fetchNodes()
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkUpdates();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [lastUpdated]);

  return (
    <NodeContext.Provider value={{
      nodes,
      nodeMap,
      loading,
      error,
      refetch,
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
