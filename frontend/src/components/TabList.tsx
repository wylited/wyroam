 // components/TabList.tsx
import { Button } from "@/components/ui/button";
import { useNodes } from '@/lib/NodeContext';
import { useTabs } from '@/lib/TabContext';
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast"
import { cn } from '@/lib/utils';
import { UndoToast } from '@/components/Toast'
import { ScrollArea } from "@/components/ui/scroll-area";

export function TabList() {
    const { getTabIds, removeTab, leftView, rightView, pushTab, undo } = useTabs()
    const { nodeMap } = useNodes();
    const { toast } = useToast()

    const tabs = getTabIds()

    if (tabs.length === 0) return null

    return (
        <div className="fixed left-0 top-0 h-full w-14 bg-background border-r">
            <ScrollArea className="h-full">
                <div className="flex flex-col gap-1 p-2">
                    {tabs.reverse().map((tabId) => (
                        <Button
                            key={tabId}
                            disabled={tabId === leftView?.id || tabId === rightView?.id}
                            className={cn(
                                "h-auto min-h-[4rem] w-8 p-4 writing-mode-vertical group relative",
                                "hover:bg-accent hover:text-accent-foreground"
                            )}
                            onClick={(e) => {
                                e.stopPropagation()
                                pushTab(tabId)
                             }}
                        >
                            <span className="rotate-180 text-sm px-2 py-1">{nodeMap[tabId].title}</span>
                            <button
                                className="absolute top-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    removeTab(tabId)
                                }}>
                                ×
                            </button>
                        </Button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
