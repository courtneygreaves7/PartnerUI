import { BarChart3 } from "lucide-react"

import { formatFilterContext, type ActiveFilters } from "@/lib/chart-data"
import { cn } from "@/lib/utils"

type FilterContextPillProps = {
  filters: ActiveFilters
  className?: string
  snapshotChip?: boolean
}

export function FilterContextPill({
  filters,
  className,
  snapshotChip = false,
}: FilterContextPillProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground",
        className
      )}
      {...(snapshotChip ? { "data-snapshot-filter-chip": true } : {})}
    >
      <BarChart3 className="size-3.5 shrink-0" aria-hidden />
      <span>{formatFilterContext(filters)}</span>
    </div>
  )
}
