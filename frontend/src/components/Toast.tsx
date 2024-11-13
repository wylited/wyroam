// First, make sure you have the toast components imported
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"
import { useTabs } from "@/lib/TabContext"

// You can use this component or just the toast call directly
export function UndoToast() {
  const { toast } = useToast()
  const { undo } = useTabs()

  const showUndoToast = () => {
    toast({
      title: "Tab deleted",
      variant: "destructive",
      action: <ToastAction altText="undo" onClick={() => {undo()}}>Undo</ToastAction>,
      duration: 5000,
    })
  }

  return showUndoToast;
}
