import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { CheckCircle2, X } from "lucide-react"

import { cn } from "@/lib/utils"

type ToastInput = {
  title: string
  description?: string
}

type ToastItem = ToastInput & { id: string }

type ToastContextValue = {
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const TOAST_DURATION_MS = 7000

function ToastNotice({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: (id: string) => void
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), TOAST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [item.id, onDismiss])

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto relative overflow-hidden rounded-md border border-border bg-card shadow-md",
        "animate-in fade-in slide-in-from-bottom-2 duration-300"
      )}
    >
      <div className="flex items-start gap-2 p-2.5 pr-2">
        <CheckCircle2
          className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">{item.title}</p>
          {item.description ? (
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              {item.description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Dismiss notification"
        >
          <X className="size-3" />
        </button>
      </div>
      <div className="h-0.5 bg-muted" aria-hidden>
        <div
          className="toast-progress h-full bg-emerald-600/80 dark:bg-emerald-400/80"
          style={{ animationDuration: `${TOAST_DURATION_MS}ms` }}
        />
      </div>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback((input: ToastInput) => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, ...input }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-full max-w-[280px] flex-col gap-1.5"
      >
        {toasts.map((item) => (
          <ToastNotice key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}
