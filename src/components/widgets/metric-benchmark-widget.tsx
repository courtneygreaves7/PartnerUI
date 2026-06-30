import { TrendingDown, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { WidgetHelpButton } from "@/components/widgets/widget-help-button"
import { CHART_BAR_FILL_CLASS } from "@/lib/chart-colors"
import { FIGURE_24PX_CLASS, METRIC_WIDGET_STACK_GAP_CLASS } from "@/lib/figure-styles"
import { cn } from "@/lib/utils"

export type MetricBenchmarkTrend = "up" | "down" | "neutral"

function parseNumericValue(value: string) {
  const match = value.replace(/,/g, "").match(/[\d.]+/)
  return match ? Number.parseFloat(match[0]) : null
}

export function getComparisonTrend(
  value: string,
  comparisonLabel: string
): MetricBenchmarkTrend {
  const current = parseNumericValue(value)
  const benchmark = parseNumericValue(comparisonLabel)
  if (current === null || benchmark === null || current === benchmark) return "neutral"
  return benchmark > current ? "up" : "down"
}

export function getBenchmarkPercent(value: string, comparisonLabel: string) {
  const current = parseNumericValue(value)
  const benchmark = parseNumericValue(comparisonLabel)
  if (!current || !benchmark) return 0
  return Math.round((current / benchmark) * 100)
}

export type MetricBenchmarkWidgetProps = {
  title: string
  value: string
  comparisonLabel: string
  comparisonTrend?: MetricBenchmarkTrend
  benchmarkPercent: number
  benchmarkLabel: string
  helpText?: string
  className?: string
}

function ComparisonRow({
  label,
  trend = "neutral",
}: {
  label: string
  trend?: MetricBenchmarkTrend
}) {
  const Icon = trend === "up" ? TrendingUp : TrendingDown

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground @sm:text-sm">
      {trend !== "neutral" ? <Icon className="size-3.5 shrink-0" strokeWidth={2.25} /> : null}
      <span className="tabular-nums">{label}</span>
    </div>
  )
}

export function MetricBenchmarkWidget({
  title,
  value,
  comparisonLabel,
  comparisonTrend,
  benchmarkPercent,
  benchmarkLabel,
  helpText,
  className,
}: MetricBenchmarkWidgetProps) {
  const clamped = Math.min(100, Math.max(0, benchmarkPercent))
  const trend = comparisonTrend ?? getComparisonTrend(value, comparisonLabel)

  return (
    <Card className={cn("@container flex h-full min-w-0 flex-col bg-card shadow-xs", className)}>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-0">
        <h3 className="min-w-0 pr-2 text-sm font-semibold text-muted-foreground">{title}</h3>
        <WidgetHelpButton title={title} helpText={helpText} />
      </CardHeader>

      <CardContent
        className={cn(
          "flex min-h-0 flex-1 flex-col px-4 pb-5 pt-2",
          METRIC_WIDGET_STACK_GAP_CLASS
        )}
      >
        <div className="flex min-h-0 flex-1 items-center py-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p
              className={cn(
                "font-bold tracking-tight tabular-nums text-foreground",
                FIGURE_24PX_CLASS
              )}
            >
              {value}
            </p>
            <ComparisonRow label={comparisonLabel} trend={trend} />
          </div>
        </div>

        <div className={cn("flex shrink-0 flex-col", METRIC_WIDGET_STACK_GAP_CLASS)}>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="img"
            aria-label={benchmarkLabel}
          >
            <div
              className={cn("h-full transition-[width]", CHART_BAR_FILL_CLASS)}
              style={{ width: `${clamped}%` }}
            />
          </div>
          <p className="text-xs leading-snug text-muted-foreground @sm:text-sm">{benchmarkLabel}</p>
        </div>
      </CardContent>
    </Card>
  )
}
