// lib/TabContext.tsx
"use client"

import React, { createContext, useContext, useState } from 'react';

interface Tab {
  id: string
  prev: Tab | null
  next: Tab | null
}

interface TabContextType {
  head: Tab | null
  leftView: Tab | null
  rightView: Tab | null
  undoStack: string[]
  addTab: (id: string) => void
  pushTab: (id: string) => void
  removeTab: (id: string) => void
  undo: () => void
  getTabIds: () => string[]
  clear: () => void
  cycleLeftViewLeft: () => void
  cycleLeftViewRight: () => void
  cycleRightViewLeft: () => void
  cycleRightViewRight: () => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export function TabProvider({ children }: { children: React.ReactNode }) {
  const [head, setHead] = useState<Tab | null>(null)
  const [leftView, setLeftView] = useState<Tab | null>(null)
  const [rightView, setRightView] = useState<Tab | null>(null)
  const [undoStack, setUndoStack] = useState<string[]>([])

  const addTab = (id: string) => {
    // Don't add if tab is already in views
    if (leftView?.id === id || rightView?.id === id) {
      pushTab(id)
      return
    }

    // Check if tab already exists
    let current = head
    while (current) {
      if (current.id === id) {
        pushTab(id)
        return
      }
      current = current.next
    }

    const newTab: Tab = {
      id,
      prev: null,
      next: head
    }

    if (head) {
      head.prev = newTab
    }

    setHead(newTab)
    setRightView(leftView)
    setLeftView(newTab)
  }

  const pushTab = (id: string) => {
    // Check if the tab is currently being viewed
    if (leftView?.id === id || rightView?.id === id) return;

    // Check if the tab exists in the list
    let current = head;
    let tabExists = false;

    // If the tab does not exist, return
    while (current) {
      if (current.id === id) {
        tabExists = true;
        break;
      }
      current = current.next;
    }
    if (!tabExists) return;

    // Set the right view to the current left view
    const newTab: Tab = {
      id,
      prev: null,
      next: leftView
    };

    // Update the views
    setRightView(leftView);
    setLeftView(newTab);
  };

  const removeTab = (id: string) => {
    let current = head
    while (current) {
      if (current.id === id) {
        // Update links
        if (current.prev) {
          current.prev.next = current.next
        } else {
          setHead(current.next)
        }

        if (current.next) {
          current.next.prev = current.prev
        }

        // Update views
        if (leftView?.id === id) {
          setLeftView(current.next || current.prev)
        }

        if (rightView?.id === id) {
          setRightView(current.next || current.prev)
        }

        // Add to undo stack
        setUndoStack(prev => [...prev, id])
        break
      }
      current = current.next
    }
  }

  const cycleLeftViewLeft = () => {
    if (!leftView) return
    let newView = leftView.prev || getLastTab()
    if (newView.id == rightView?.id){
      newView = newView.prev || getLastTab()
    }
    if (!newView) return
    setLeftView(newView)
  }

  const cycleLeftViewRight = () => {
    if (!leftView) return
    let newView = leftView.next || getLastTab()
    if (newView.id == rightView?.id){
      newView = newView.next || getLastTab()
    }
    if (!newView) return
    setLeftView(newView)
  }

  const cycleRightViewLeft = () => {
    if (!rightView) return
    let newView = rightView.prev || getLastTab()
    if (newView.id == leftView?.id){
      newView = newView.prev || getLastTab()
    }
    if (!newView) return
    setRightView(newView)
  }

  const cycleRightViewRight = () => {
    if (!rightView) return
    let newView = rightView.next || getLastTab()
    if (newView.id == leftView?.id){
      newView = newView.next || getLastTab()
    }
    if (!newView) return
    setRightView(newView)
  }

  // Helper function to prevent overcycling.
  const getLastTab = (): Tab | null => {
    let current = head
    while (current?.next) {
      current = current.next
    }
    return current
  }

  const undo = () => {
    if (undoStack.length === 0) return

    const lastId = undoStack[undoStack.length - 1]
    setUndoStack(prev => prev.slice(0, -1))
    addTab(lastId)
  }

  const getTabIds = (): string[] => {
    const ids: string[] = []
    let current = head
    while (current) {
      ids.push(current.id)
      current = current.next
    }
    return ids
  }

  const clear = () => {
    setHead(null)
    setLeftView(null)
    setRightView(null)
    setUndoStack([])
  }

  return (
    <TabContext.Provider value={{
      head,
      leftView,
      rightView,
      undoStack,
      addTab,
      pushTab,
      removeTab,
      undo,
      getTabIds,
      clear,
      cycleLeftViewLeft,
      cycleLeftViewRight,
      cycleRightViewLeft,
      cycleRightViewRight
    }}>
      {children}
    </TabContext.Provider>
  )
}

export function useTabs() {
  const context = useContext(TabContext)
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabProvider')
  }
  return context
}
