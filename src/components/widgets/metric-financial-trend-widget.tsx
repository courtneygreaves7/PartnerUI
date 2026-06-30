import { Shield, TrendingDown, TrendingUp } from "lucide-react"
import { useId } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts"

import {
  InsightBenchmarkBar,
  InsightCardBody,
  InsightFooter,
  InsightHighlightGrid,
  InsightMetricGroup,
  InsightVisualGroup,
  insightCardHeaderClass,
  insightChartHeightClass,
} from "@/components/booking-engine/property-insight-primitives"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { MetricTrendDirection, MetricTrendPoint } from "@/components/widgets/metric-trend-widget"
import { WidgetHelpButton } from "@/components/widgets/widget-help-button"
import { FIGURE_24PX_CLASS } from "@/lib/figure-styles"
import { cn } from "@/lib/utils"

export type FinancialBreakdownRow = {
  label: string
  value: string
  sharePercent: number
}

export type MetricFinancialTrendWidgetProps = {
  title: string
  value: string
  trendLabel: string
  trend?: MetricTrendDirection
  comparisonLabel: string
  chartData: MetricTrendPoint[]
  breakdownRows: FinancialBreakdownRow[]
  footerLabel?: string
  insightBenchmark?: { percent: number; label: string }
  insightHighlights?: Array<{ label: string; value: string }>
  helpText?: string
  className?: string
  insightLayout?: boolean
}

const TICK_STYLE = { fontSize: 11, fill: "var(--color-muted-foreground)" }

const MEDAL_DOT_CLASSES = [
  "bg-amber-400",
  "bg-slate-300 dark:bg-slate-400",
  "bg-amber-700",
] as const

const MEDAL_BAR_CLASSES = [
  "bg-amber-400",
  "bg-slate-300 dark:bg-slate-400",
  "bg-amber-700",
] as const

function TrendBadge({
  label,
  trend = "neutral",
}: {
  label: string
  trend?: MetricTrendDirection
}) {
  const Icon = trend === "down" ? TrendingDown : TrendingUp

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
      {trend !== "neutral" ? <Icon className="size-3 shrink-0" strokeWidth={2.25} /> : null}
      {label}
    </span>
  )
}

export function MetricFinancialTrendWidget({
  title,
  value,
  trendLabel,
  trend = "up",
  comparisonLabel,
  chartData,
  breakdownRows,
  footerLabel,
  insightBenchmark,
  insightHighlights,
  helpText,
  className,
  insightLayout = false,
}: MetricFinancialTrendWidgetProps) {
  const gradientId = `metric-financial-trend-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`

  if (insightLayout) {
    return (
      <Card className={cn("@container flex h-full min-w-0 flex-col bg-card shadow-xs", className)}>
        <CardHeader className={insightCardHeaderClass}>
          <div className="flex w-full items-start justify-between gap-3">
            <h3 className="min-w-0 flex-1 text-sm font-semibold text-foreground">{title}</h3>
            <WidgetHelpButton title={title} helpText={helpText} />
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <InsightCardBody>
            <InsightMetricGroup className="shrink-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p
                  className={cn(
                    "font-bold tracking-tight tabular-nums text-foreground",
                    FIGURE_24PX_CLASS
                  )}
                >
                  {value}
                </p>
                <TrendBadge label={trendLabel} trend={trend} />
              </div>
              <p className="text-xs text-muted-foreground">{comparisonLabel}</p>
            </InsightMetricGroup>

            <div className="flex min-h-0 flex-1 flex-col justify-center gap-5">
              <InsightVisualGroup className="gap-4">
                <div className={insightChartHeightClass}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.1} />
                          <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={TICK_STYLE}
                        interval={0}
                        dy={4}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="var(--foreground)"
                        strokeWidth={1.75}
                        strokeOpacity={0.55}
                        fill={`url(#${gradientId})`}
                        dot={false}
                        activeDot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div
                    className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
                    role="img"
                    aria-label={breakdownRows
                      .map((row) => `${row.sharePercent}% ${row.label}`)
                      .join(", ")}
                  >
                    {breakdownRows.map((row, index) => (
                      <div
                        key={row.label}
                        className={cn(
                          "h-full transition-[width]",
                          MEDAL_BAR_CLASSES[index] ?? "bg-muted-foreground/20"
                        )}
                        style={{ width: `${row.sharePercent}%` }}
                      />
                    ))}
                  </div>
                  {breakdownRows.map((row, index) => (
                    <div key={row.label} className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            MEDAL_DOT_CLASSES[index] ?? "bg-muted-foreground"
                          )}
                          aria-hidden
                        />
                        <span className="truncate text-xs text-muted-foreground">{row.label}</span>
                      </div>
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </InsightVisualGroup>

              {insightBenchmark ? (
                <InsightBenchmarkBar
                  percent={insightBenchmark.percent}
                  label={insightBenchmark.label}
                />
              ) : null}

              {insightHighlights?.length ? (
                <InsightHighlightGrid items={insightHighlights} />
              ) : null}
            </div>

            {footerLabel ? (
              <InsightFooter
                className="mt-0 shrink-0"
                left={
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Shield className="size-3.5 shrink-0" strokeWidth={2} />
                    <span>{footerLabel}</span>
                  </div>
                }
              />
            ) : null}
          </InsightCardBody>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("@container flex h-full min-w-0 flex-col bg-card shadow-xs", className)}>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-0">
        <h3 className="min-w-0 pr-2 text-sm font-semibold text-muted-foreground">{title}</h3>
        <WidgetHelpButton title={title} helpText={helpText} />
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-5 px-4 pb-5 pt-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p
              className={cn(
                "font-bold tracking-tight tabular-nums text-foreground",
                FIGURE_24PX_CLASS
              )}
            >
              {value}
            </p>
            <TrendBadge label={trendLabel} trend={trend} />
          </div>
          <p className="text-xs text-muted-foreground @sm:text-sm">{comparisonLabel}</p>
        </div>

        <div className="h-24 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={TICK_STYLE}
                interval={0}
                dy={4}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--foreground)"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-4">
          <div
            className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
            role="img"
            aria-label={breakdownRows
              .map((row) => `${row.sharePercent}% ${row.label}`)
              .join(", ")}
          >
            {breakdownRows.map((row, index) => (
              <div
                key={row.label}
                className={cn(
                  "h-full transition-[width]",
                  MEDAL_BAR_CLASSES[index] ?? "bg-muted-foreground/20"
                )}
                style={{ width: `${row.sharePercent}%` }}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {breakdownRows.map((row, index) => (
              <div key={row.label} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      MEDAL_DOT_CLASSES[index] ?? "bg-muted-foreground"
                    )}
                    aria-hidden
                  />
                  <span className="truncate text-xs text-muted-foreground @sm:text-sm">
                    {row.label}
                  </span>
                </div>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground @sm:text-sm">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {footerLabel ? (
          <div className="flex shrink-0 items-center gap-1.5 border-t border-border pt-2 text-xs text-muted-foreground">
            <Shield className="size-3.5 shrink-0" strokeWidth={2.25} />
            <span>{footerLabel}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
