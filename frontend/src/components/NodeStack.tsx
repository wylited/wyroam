// lib/useNodeStack.tsx
import { create } from 'zustand'

interface NodeStackState {
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

/* const {
 *   push,
 *   pop,
 *   undo,
 *   clear,
 *   peek,
 *   getStack,
 *   getUndoStack
 * } = useNodeStack() */

export const useNodeStack = create<NodeStackState>((set, get) => ({
  nodeStack: [],
  undoStack: [],

  push: (nodeId: string) => {
    set((state) => ({
      nodeStack: [...state.nodeStack, nodeId]
    }))
  },

  pop: () => {
    const currentStack = get().nodeStack
    if (currentStack.length === 0) return undefined

    const lastNode = currentStack[currentStack.length - 1]
    set((state) => ({
      nodeStack: state.nodeStack.slice(0, -1),
      undoStack: [...state.undoStack, lastNode]
    }))
    return lastNode
  },

  undo: () => {
    const currentUndoStack = get().undoStack
    if (currentUndoStack.length === 0) return

    const nodeToRestore = currentUndoStack[currentUndoStack.length - 1]
    set((state) => ({
      undoStack: state.undoStack.slice(0, -1),
      nodeStack: [...state.nodeStack, nodeToRestore]
    }))
  },

  clear: () => {
    set({ nodeStack: [], undoStack: [] })
  },

  peek: () => {
    const currentStack = get().nodeStack
    return currentStack.length > 0 ? currentStack[currentStack.length - 1] : undefined
  },

  getStack: () => get().nodeStack,

  getUndoStack: () => get().undoStack,
}))
