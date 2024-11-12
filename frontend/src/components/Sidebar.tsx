// components/Sidebar.tsx
'use client'

import { useState } from 'react'
import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog"
import { Graph } from '@/components/Graph'
import { CommandMenu } from '@/components/Command'
import { NodeSearch } from '@/components/NodeSearch'
import {
  Waypoints,
  Moon,
  Sun,
} from 'lucide-react'

export function Sidebar() {
  const { setTheme } = useTheme()

  return (
    <div className="fixed right-0 top-0 h-screen w-16 bg-background border-l flex flex-col items-center py-4 space-y-4 z-50">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="h-10 w-10">
            <Waypoints />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white min-w-[70vw]">
          <Graph />
        </DialogContent>
      </Dialog>
      <CommandMenu />
      <NodeSearch />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
