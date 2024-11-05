// components/NodeSearch.tsx
"use client"

import * as React from "react"
import { FileText, Hash, Link, Tag, FileSearch } from "lucide-react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Button } from '@/components/ui/button'
import { Node } from "@/lib/Node"
import { useNodeSearch } from "@/lib/Search"
import { useNodes } from "@/lib/NodeContext"

interface NodeSearchProps {
    onSelect?: (node: Node) => void
}

export function NodeSearch({ onSelect }: NodeSearchProps) {
    const { loading, error } = useNodes()
    const { searchQuery, setSearchQuery, searchResults } = useNodeSearch()
    const [open, setOpen] = React.useState(false)

    function toggleOpen() {
        setOpen((open) => !open)
    }

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                toggleOpen()
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const handleSelect = (node: Node) => {
        if (onSelect) {
            onSelect(node)
        }
        setOpen(false)
    }

    return (
        <div>
            <Button onClick={toggleOpen} variant="ghost">
                <FileSearch/>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Search notes... (a: aliases, t: tags, f: filename, c: content)"
                    value={searchQuery}
                    onValueChange={(value) => {
                        setSearchQuery(value)
                    }}
                />
                <CommandList>
                    {loading && <CommandEmpty>Loading nodes...</CommandEmpty>}
                    {error && <CommandEmpty>Error loading nodes. Please try again.</CommandEmpty>}
                    {!loading && !error && searchResults.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}
                    {searchResults.length > 0 && (
                        <CommandGroup heading="Results">
                            {searchResults.map((node) => (
                                <CommandItem
                                    key={node.id}
                                    onSelect={() => handleSelect(node)}
                                >
                                    <div className="flex flex-col gap-1 w-full">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            <span>{node.title}</span>
                                        </div>
                                        {node.tags.length > 0 && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Tag className="w-3 h-3" />
                                                <span>{node.tags.join(", ")}</span>
                                            </div>
                                        )}
                                        {node.aliases.length > 0 && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Link className="w-3 h-3" />
                                                <span>{node.aliases.join(", ")}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Hash className="w-3 h-3" />
                                            <span>{node.filename}</span>
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </div>
    )
}
