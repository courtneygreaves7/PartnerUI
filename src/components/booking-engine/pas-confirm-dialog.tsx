import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PasConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function PasConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: PasConfirmDialogProps) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="pas-confirm-title"
        aria-describedby="pas-confirm-description"
        className={cn(
          "relative w-full max-w-md rounded-xl border border-border bg-background shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-200"
        )}
      >
        <div className="flex items-start gap-3 border-b border-border px-5 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 id="pas-confirm-title" className="text-base font-semibold text-foreground">
              {title}
            </h2>
            <p id="pas-confirm-description" className="mt-1.5 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-9 text-xs sm:min-w-[96px]"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-9 text-xs sm:min-w-[120px]"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
