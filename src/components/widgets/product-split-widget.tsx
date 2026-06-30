import { MoreHorizontal, TrendingDown, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WidgetHelpButton } from "@/components/widgets/widget-help-button"
import { CHART_BAR_FILL_CLASS } from "@/lib/chart-colors"
import { FIGURE_24PX_CLASS } from "@/lib/figure-styles"
import { cn } from "@/lib/utils"

export type ProductSplitTrend = "up" | "down" | "neutral"

export type ProductSplitSegment = {
  label: string
  value: string
  sharePercent: number
  takeUpLabel: string
  trend?: ProductSplitTrend
}

export type ProductSplitMenuItem = {
  label: string
  onSelect?: () => void
}

export type ProductSplitWidgetProps = {
  title?: string
  totalLabel: string
  segmentA: ProductSplitSegment
  segmentB: ProductSplitSegment
  helpText?: string
  menuItems?: ProductSplitMenuItem[]
  className?: string
}

function SegmentLegend({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-2 shrink-0 rounded-full bg-muted-foreground" aria-hidden />
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
    </div>
  )
}

function TakeUpBadge({
  label,
  trend = "neutral",
}: {
  label: string
  trend?: ProductSplitTrend
}) {
  const Icon = trend === "down" ? TrendingDown : TrendingUp

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
      {trend !== "neutral" ? <Icon className="size-3 shrink-0" strokeWidth={2.25} /> : null}
      {label}
    </span>
  )
}

function SegmentDetail({ segment }: { segment: ProductSplitSegment }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <SegmentLegend label={segment.label} />
      <p className={cn("font-bold tracking-tight tabular-nums text-foreground", FIGURE_24PX_CLASS)}>
        {segment.value}
      </p>
      <TakeUpBadge label={segment.takeUpLabel} trend={segment.trend} />
    </div>
  )
}

export function ProductSplitWidget({
  title = "Product split",
  totalLabel,
  segmentA,
  segmentB,
  helpText,
  menuItems,
  className,
}: ProductSplitWidgetProps) {
  return (
    <Card className={cn("@container flex h-full min-w-0 flex-col bg-card shadow-xs", className)}>
      <CardHeader className="flex-row items-center gap-3 space-y-0 border-b border-border pb-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {totalLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <WidgetHelpButton title={title} helpText={helpText} />
          {menuItems && menuItems.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="grid size-5 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={`${title} options`}
                >
                  <MoreHorizontal className="size-3.5" strokeWidth={2.25} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {menuItems.map((item) => (
                  <DropdownMenuItem key={item.label} onSelect={item.onSelect}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col pb-5 pt-4">
        <div className="space-y-2">
          <div
            className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
            role="img"
            aria-label={`${segmentA.sharePercent}% ${segmentA.label}, ${segmentB.sharePercent}% ${segmentB.label}`}
          >
            <div
              className={cn("h-full transition-[width]", CHART_BAR_FILL_CLASS)}
              style={{ width: `${segmentA.sharePercent}%` }}
            />
            <div
              className="h-full bg-muted-foreground/50 transition-[width]"
              style={{ width: `${segmentB.sharePercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {segmentA.sharePercent}% {segmentA.label}
            </span>
            <span className="tabular-nums">
              {segmentB.sharePercent}% {segmentB.label}
            </span>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-border">
          <div className="grid min-w-0 grid-cols-2 divide-x divide-border">
            <SegmentDetail segment={segmentA} />
            <SegmentDetail segment={segmentB} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
