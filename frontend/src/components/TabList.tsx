// lib/useTabList.tsx
import { create } from 'zustand'

interface Node {
    id: string
    prev: Node | null
    next: Node | null
}

interface TabListState {
    head: Node | null
    leftView: Node | null
    rightView: Node | null
    undoStack: string[]
    addTab: (id: string) => void
    removeTab: (id: string) => void
    undo: () => void
    cycleLeftViewLeft: () => void
    cycleLeftViewRight: () => void
    cycleRightViewLeft: () => void
    cycleRightViewRight: () => void
    clear: () => void
    getTabIds: () => string[]
    getUndoStack: () => string[]
}

export const TabList = create<TabListState>((set, get) => ({
    head: null,
    leftView: null,
    rightView: null,
    undoStack: [],

    addTab: (id: string) => {
        const newNode: Node = {
            id,
            prev: null,
            next: get().head
        }

        set((state) => {
            if (state.head) {
                state.head.prev = newNode
            }

            let tmpleftView = state.leftView;

            return{
                head: newNode,
                rightView: tmpleftView,
                leftView: newNode,
            }
        })
    },

    removeTab: (id: string) => {
        set((state) => {
            let current = state.head
            while (current) {
                if (current.id === id) {
                    // Add to undo stack
                    const newUndoStack = [...state.undoStack, id]

                    // Update adjacent nodes
                    if (current.prev) {
                        current.prev.next = current.next
                    } else {
                        state.head = current.next
                    }
                    if (current.next) {
                        current.next.prev = current.prev
                    }

                    // Update view pointers if they were pointing to the removed node
                    let newLeftView = state.leftView
                    let newRightView = state.rightView

                    if (state.leftView === current) {
                        newLeftView = current.next || current.prev || null
                    }
                    if (state.rightView === current) {
                        newRightView = current.next || current.prev || null
                    }

                    return {
                        head: state.head,
                        leftView: newLeftView,
                        rightView: newRightView,
                        undoStack: newUndoStack
                    }
                }
                current = current.next
            }
            return state
        })
    },

    undo: () => {
        set((state) => {
            if (state.undoStack.length === 0) return state

            const idToRestore = state.undoStack[state.undoStack.length - 1]
            const newUndoStack = state.undoStack.slice(0, -1)

            // Create new node for the restored tab
            const newNode: Node = {
                id: idToRestore,
                prev: null,
                next: state.head
            }

            if (state.head) {
                state.head.prev = newNode
            }

            // If this is the first node, set both view pointers to it
            if (!state.leftView && !state.rightView) {
                return {
                    head: newNode,
                    leftView: newNode,
                    rightView: newNode,
                    undoStack: newUndoStack
                }
            }

            return {
                head: newNode,
                undoStack: newUndoStack
            }
        })
    },

    cycleLeftViewLeft: () => {
        set((state) => {
            if (!state.leftView || !state.leftView.prev) return state

            let newPosition = state.leftView.prev
            // Skip if right view is at the target position
            while (newPosition && newPosition === state.rightView && newPosition.prev) {
                newPosition = newPosition.prev
            }

            return newPosition !== state.rightView ? { leftView: newPosition } : state
        })
    },

    cycleLeftViewRight: () => {
        set((state) => {
            if (!state.leftView || !state.leftView.next) return state

            let newPosition = state.leftView.next
            // Skip if right view is at the target position
            while (newPosition && newPosition === state.rightView && newPosition.next) {
                newPosition = newPosition.next
            }

            return newPosition !== state.rightView ? { leftView: newPosition } : state
        })
    },

    cycleRightViewLeft: () => {
        set((state) => {
            if (!state.rightView || !state.rightView.prev) return state

            let newPosition = state.rightView.prev
            // Skip if left view is at the target position
            while (newPosition && newPosition === state.leftView && newPosition.prev) {
                newPosition = newPosition.prev
            }

            return newPosition !== state.leftView ? { rightView: newPosition } : state
        })
    },

    cycleRightViewRight: () => {
        set((state) => {
            if (!state.rightView || !state.rightView.next) return state

            let newPosition = state.rightView.next
            // Skip if left view is at the target position
            while (newPosition && newPosition === state.leftView && newPosition.next) {
                newPosition = newPosition.next
            }

            return newPosition !== state.leftView ? { rightView: newPosition } : state
        })
    },

    clear: () => {
        set({
            head: null,
            leftView: null,
            rightView: null,
            undoStack: []
        })
    },

    getTabIds: () => {
        const ids: string[] = []
        let current = get().head
        while (current) {
            ids.push(current.id)
            current = current.next
        }
        return ids
    },

    getUndoStack: () => get().undoStack,
}))
