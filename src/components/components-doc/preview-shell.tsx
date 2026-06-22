import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function PreviewShell({
  children,
  className,
  label,
}: {
  children: ReactNode
  className?: string
  label?: string
}) {
  return (
    <div className="space-y-2">
      {label ? (
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      ) : null}
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border bg-muted/20",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
