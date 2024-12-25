"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Node } from '@/lib/Node'


interface NodeContextType {
  nodes: Node[];
  nodeMap: { [id: string]: Node }; // So that nodes can be accessed faster
  loading: boolean; // So that it doesn't process multiple requests while its still processing a request
  error: Error | null; // So that we can display an error message
  refetch: () => Promise<void>; // So that we can refetch the nodes with an external prompt
}

const NodeContext = createContext<NodeContextType | undefined>(undefined)

export function NodeProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [nodeMap, setNodeMap] = useState<{ [id: string]: Node }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('0')

  // Check if there are any updates through the query { lastUpdated }
  const checkUpdates = async () => {
    try {
      const response = await fetch('https://notes.wyli.hackclub.app/graphql', {
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

  // Fetch nodes and load them into the context
  const fetchNodes = async () => {
    try {
      const response = await fetch('https://notes.wyli.hackclub.app/graphql', {
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
      setLastUpdated(data.data.lastUpdated) // Update the last updated for the checkUpdates function
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch nodes'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNodes();
  }, []); // on load, fetch the nodes

  useEffect(() => {
    fetchNodes();
  }, [lastUpdated]); // in case lastUpdated ever changes, refetch all the nodes

  useEffect(() => {
    const map = nodes.reduce((acc, node) => {
      acc[node.id] = node
      return acc
    }, {} as { [id: string]: Node })

    setNodeMap(map)
  }, [nodes]) // If the nodes ever updates, repopulate the node map

  const refetch = async () => {
    setLoading(true)
    await fetchNodes()
  } // Refetch the nodes with a loading state

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkUpdates();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [lastUpdated]); // Check for updates every 2 seconds

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
