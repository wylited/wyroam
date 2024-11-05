"use client"

import * as React from "react"
import {
  Search,
  Route,
  Network,
  Sun,
  Moon,
  Download,
  Terminal,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { Button } from '@/components/ui/button'

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)

    function toggleOpen() {
        setOpen((open) => !open)
    }

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "x" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                toggleOpen()
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <div>
            <Button onClick={toggleOpen} variant="ghost">
                <Terminal />
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Actions">
                        <CommandItem>
                            <Search className="mr-2 h-4 w-4" />
                            <span>Search</span>
                            <CommandShortcut>⌘K</CommandShortcut>
                        </CommandItem>
                        <CommandItem>
                            <Route className="mr-2 h-4 w-4" />
                            <span>Show path</span>
                            <CommandShortcut>⌘P</CommandShortcut>
                        </CommandItem>
                        <CommandItem>
                            <Network className="mr-2 h-4 w-4" />
                            <span>Show graph</span>
                            <CommandShortcut>⌘G</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Theme">
                        <CommandItem>
                            <Sun className="mr-2 h-4 w-4" />
                            <span>Light mode</span>
                            <CommandShortcut>⌘L</CommandShortcut>
                        </CommandItem>
                        <CommandItem>
                            <Moon className="mr-2 h-4 w-4" />
                            <span>Dark mode</span>
                            <CommandShortcut>⌘D</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Files">
                        <CommandItem>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download file</span>
                            <CommandShortcut>⌘↓</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </div>
    )
}
