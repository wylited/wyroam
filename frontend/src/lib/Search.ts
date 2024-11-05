import { useNodes } from '@/lib/NodeContext'
import { useState, useEffect, useMemo } from 'react'
import { Node } from '@/lib/Node'

export function useNodeSearch() {
  const { nodes } = useNodes()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Node[]>([])

  // Create a searchable string for each node once
  const nodeSearchData = useMemo(() => {
    return nodes.map(node => ({
      node,
      searchString: [
        node.title,
        node.filename,
        ...node.aliases,
        ...node.tags,
        node.html.replace(/<[^>]*>/g, ' ') // Strip HTML tags
      ].join(' ').toLowerCase()
    }))
  }, [nodes])

  // Perform the actual search
  useEffect(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase()

    if (!trimmedQuery) {
      setSearchResults(nodes)
      return
    }

    // Split search terms by spaces, handling quoted phrases
    const searchTerms = trimmedQuery
      .match(/\w+|"[^"]+"/g)
      ?.map(term => term.replace(/"/g, '')) || []

    const results = nodeSearchData
      .filter(({ searchString }) =>
        searchTerms.every(term => searchString.includes(term))
      )
      .map(({ node }) => node)

    setSearchResults(results)
  }, [searchQuery, nodeSearchData])

  return {
    searchQuery,
    setSearchQuery,
    searchResults
  }
}
// Usage examples:
// searchNodes(nodes, "typescript")          // Searches all fields
// searchNodes(nodes, "a:javascript")        // Searches aliases
// searchNodes(nodes, "t:programming")       // Searches tags
// searchNodes(nodes, "f:readme.md")         // Searches filenames
// searchNodes(nodes, "c:<p>hello</p>")      // Searches HTML content
// searchNodes(nodes, "t:code a:js f:main")  // Multiple field-specific searches
