import { useNodes } from '@/lib/NodeContext'
import { useState, useEffect, useMemo } from 'react'
import { Node } from '@/lib/Node'

// Levenshtein distance algorithm
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  // Create a 2D array to store the distances
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  // Initialize the first row and column
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) { // Characters match!
        dp[i][j] = dp[i - 1][j - 1] // No operation needed
      } else { // if they dont match then we need to perform an operation to determine the distance
        dp[i][j] = Math.min(
          dp[i - 1][j - 1], // substitution
          dp[i - 1][j],     // deletion
          dp[i][j - 1]      // insertion
        ) + 1
      }
    }
  }

  // The bottom-right cell contains the distance
  return dp[m][n]
}

function fuzzyMatch(text: string, query: string, threshold = 0.3): boolean {
  // The threshold defines how close the string and query can match
  text = text.toLowerCase()
  query = query.toLowerCase()

  // For very short queries, fall back to includes() check
  // This is because calculating the distance is not worth the perfomance cost
  if (query.length <= 2) {
    return text.includes(query)
  }

  // Split into words and check each
  const words = text.split(/\s+/)
  const queryWords = query.split(/\s+/)

  return queryWords.every(queryWord => {
    return words.some(word => {
      // For very short words, require exact match
      // This is because the distance algorithm
      // Will provide too many matches that are not relevant
      if (word.length <= 3) {
        return word === queryWord
      }

      const distance = levenshteinDistance(word, queryWord)
      const maxLength = Math.max(word.length, queryWord.length)
      const similarity = 1 - distance / maxLength
      // Since distance / maxLength can never be greater than 1, we are finding the similarity
      return similarity >= threshold
    })
  })
}

export function NodeSearch() {
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
        ...node.aliases, // concatenates the vector of aliases
        ...node.tags,    // likewise
        node.html.replace(/<[^>]*>/g, ' ') // Strip HTML tags
      ].join(' ')
    }))
  }, [nodes])

  // Perform the actual search
  useEffect(() => {
    const trimmedQuery = searchQuery.trim()

    if (!trimmedQuery) {
      setSearchResults(nodes)
      return
    }

    const results = nodeSearchData
      .filter(({ searchString }) => fuzzyMatch(searchString, trimmedQuery))
      .map(({ node }) => node)

    setSearchResults(results)
  }, [searchQuery, nodeSearchData]) // Re-run the search when the query changes

  return {
    searchQuery,
    setSearchQuery,
    searchResults
  }
}
