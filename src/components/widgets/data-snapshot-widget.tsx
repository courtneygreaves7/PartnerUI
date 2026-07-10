import { ArrowRight } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type DataSnapshotRow = {
  label: string
  value: string
}

export type DataSnapshotWidgetProps = {
  title: string
  rows: DataSnapshotRow[]
  overviewHref?: string
  overviewLabel?: string
  className?: string
  valueClassName?: string
  compact?: boolean
}

export function DataSnapshotWidget({
  title,
  rows,
  overviewHref,
  overviewLabel = "Link to overview",
  className,
  valueClassName,
  compact = false,
}: DataSnapshotWidgetProps) {
  return (
    <Card className={cn("min-w-0 bg-card shadow-xs", className)}>
      <CardHeader className={cn("pb-3", !overviewHref && "flex-row items-center")}>
        <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
        {overviewHref ? (
          <a
            href={overviewHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            {overviewLabel}
            <ArrowRight className="size-3" />
          </a>
        ) : null}
      </CardHeader>

      <CardContent className="px-0 pb-0">
        {rows.slice(0, 6).map((row) => (
          <div
            key={row.label}
            className={cn(
              "flex items-center justify-between gap-4 border-t border-border",
              compact ? "px-4 py-2" : "px-5 py-3"
            )}
          >
            <span
              className={cn(
                "italic text-muted-foreground",
                compact ? "text-xs" : "text-sm"
              )}
            >
              {row.label}
            </span>
            <span
              className={cn(
                "font-semibold tabular-nums text-foreground",
                valueClassName ?? (compact ? "text-xs font-medium" : "text-sm")
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
