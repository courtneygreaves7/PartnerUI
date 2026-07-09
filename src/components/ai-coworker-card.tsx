import { useState } from "react"
import { Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AiCoworkerCardProps = {
  collapsed?: boolean
  partnerName?: string
}

export function AiCoworkerCard({
  collapsed = false,
  partnerName = "George",
}: AiCoworkerCardProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  if (collapsed) {
    return (
      <button
        type="button"
        title="Ask AI Coworker"
        aria-label="Ask AI Coworker"
        className="group relative flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105"
      >
        <span className="absolute inset-0 rounded-full bg-primary/30 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
        <span className="relative flex size-7 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold tracking-tight">
          AI
        </span>
        <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-background" />
      </button>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-card to-card p-3.5 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-primary/10 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 left-4 size-16 rounded-full bg-sky-300/20 blur-2xl"
      />

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Dismiss AI Coworker"
      >
        <X className="size-3" />
      </button>

      <div className="relative flex flex-col items-center text-center">
        <div className="relative shrink-0">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-full",
              "bg-gradient-to-br from-primary to-[#0047b3] text-primary-foreground shadow-md",
              "ring-2 ring-white/40"
            )}
          >
            <span className="text-xs font-bold tracking-tight">AI</span>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-card" />
        </div>

        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          <p className="text-sm font-semibold text-foreground">AI Coworker</p>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="size-2.5" />
            AI
          </span>
        </div>

        <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
          Hi {partnerName} — I can draft reports, pull insights, and handle partner tasks for you.
        </p>
      </div>

      <Button
        type="button"
        size="sm"
        className="relative mt-3 h-8 w-full gap-1.5 text-xs"
      >
        <Sparkles className="size-3" />
        Ask AI Coworker
      </Button>
    </div>
  )
}
