import { Calendar, TrendingDown, TrendingUp, Users } from "lucide-react"
import { useId } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts"

import {
  InsightCardBody,
  InsightFooter,
  InsightMetricGroup,
  InsightVisualGroup,
  insightCardHeaderClass,
  insightChartHeightClass,
} from "@/components/booking-engine/property-insight-primitives"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { WidgetHelpButton } from "@/components/widgets/widget-help-button"
import { CHART_AREA_GRADIENT_FROM, CHART_LINE } from "@/lib/chart-colors"
import { FIGURE_24PX_CLASS, METRIC_WIDGET_STACK_GAP_CLASS } from "@/lib/figure-styles"
import { cn } from "@/lib/utils"

export type MetricTrendDirection = "up" | "down" | "neutral"

export type MetricTrendPoint = {
  label: string
  value: number
}

export type MetricTrendWidgetProps = {
  title: string
  value: string
  trendLabel: string
  trend?: MetricTrendDirection
  comparisonLabel: string
  chartData: MetricTrendPoint[]
  scopeLabel: string
  rateLabel: string
  helpText?: string
  className?: string
  insightLayout?: boolean
}

const TICK_STYLE = { fontSize: 11, fill: "var(--color-muted-foreground)" }

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

export function MetricTrendWidget({
  title,
  value,
  trendLabel,
  trend = "up",
  comparisonLabel,
  chartData,
  scopeLabel,
  rateLabel,
  helpText,
  className,
  insightLayout = false,
}: MetricTrendWidgetProps) {
  const gradientId = `metric-trend-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`

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
            <InsightMetricGroup>
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

            <InsightVisualGroup>
              <div className={insightChartHeightClass}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_AREA_GRADIENT_FROM} stopOpacity={0.1} />
                        <stop offset="100%" stopColor={CHART_AREA_GRADIENT_FROM} stopOpacity={0} />
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
                      stroke={CHART_LINE}
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
            </InsightVisualGroup>

            <InsightFooter
              left={
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Users className="size-3.5 shrink-0" strokeWidth={2} />
                  <span className="truncate">{scopeLabel}</span>
                </div>
              }
              right={
                <div className="flex items-center gap-1.5 text-[10px] tabular-nums text-muted-foreground">
                  <Calendar className="size-3.5 shrink-0" strokeWidth={2} />
                  {rateLabel}
                </div>
              }
            />
          </InsightCardBody>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("@container flex h-full min-w-0 flex-col bg-card shadow-xs", className)}>
      <CardHeader className="flex-row items-start justify-between space-y-0 px-4 pb-2 pt-4">
        <h3 className="min-w-0 pr-2 text-sm font-semibold text-muted-foreground">{title}</h3>
        <WidgetHelpButton title={title} helpText={helpText} />
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4 pt-0">
        <div className={cn("flex flex-col", METRIC_WIDGET_STACK_GAP_CLASS)}>
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

        <div className="flex min-h-0 flex-1 flex-col pt-1">
          <div className="h-[4.75rem] w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_AREA_GRADIENT_FROM} stopOpacity={0.12} />
                    <stop offset="100%" stopColor={CHART_AREA_GRADIENT_FROM} stopOpacity={0} />
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
                  stroke={CHART_LINE}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-1 flex shrink-0 items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5 shrink-0" strokeWidth={2.25} />
            <span className="truncate">{scopeLabel}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5 shrink-0" strokeWidth={2.25} />
            <span className="tabular-nums">{rateLabel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
