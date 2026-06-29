import { Shield, TrendingUp } from "lucide-react"
import { useId } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts"

import {
  InsightBadge,
  InsightCardBody,
  InsightFooter,
  InsightMetricGroup,
  InsightRankedBarList,
  InsightVisualGroup,
  insightCardHeaderClass,
  insightChartHeightClass,
} from "@/components/booking-engine/property-insight-primitives"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { WidgetHelpButton } from "@/components/widgets/widget-help-button"
import { PROPERTY_AVG_BOOKING_VALUE_INSIGHT } from "@/lib/property-insights-data"
import { FIGURE_24PX_CLASS } from "@/lib/figure-styles"
import { cn } from "@/lib/utils"

const TICK_STYLE = { fontSize: 11, fill: "var(--color-muted-foreground)" }

const SEGMENT_BAR_CLASSES = [
  "bg-foreground",
  "bg-muted-foreground/60",
] as const

type PropertyAvgBookingValueWidgetProps = {
  helpText?: string
  className?: string
}

export function PropertyAvgBookingValueWidget({
  helpText,
  className,
}: PropertyAvgBookingValueWidgetProps) {
  const data = PROPERTY_AVG_BOOKING_VALUE_INSIGHT
  const gradientId = `property-abv-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`

  return (
    <Card className={cn("@container flex h-full min-w-0 flex-col bg-card shadow-xs", className)}>
      <CardHeader className={insightCardHeaderClass}>
        <div className="flex w-full items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 text-sm font-semibold text-foreground">Avg booking value</h3>
          <WidgetHelpButton title="Avg booking value" helpText={helpText} />
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
                {data.value}
              </p>
              <InsightBadge variant="positive">
                <TrendingUp className="size-3 shrink-0" strokeWidth={2.25} />
                {data.trendLabel}
              </InsightBadge>
            </div>
            <p className="text-xs text-muted-foreground">{data.comparisonLabel}</p>
          </InsightMetricGroup>

          <div className="flex min-h-0 flex-1 flex-col justify-center gap-5">
            <InsightVisualGroup className="gap-4">
              <div className={insightChartHeightClass}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
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
                  aria-label={data.seasonBreakdown
                    .map((row) => `${row.sharePercent}% ${row.label}`)
                    .join(", ")}
                >
                  {data.seasonBreakdown.map((row, index) => (
                    <div
                      key={row.label}
                      className={cn(
                        "h-full",
                        SEGMENT_BAR_CLASSES[index] ?? "bg-muted-foreground/20"
                      )}
                      style={{ width: `${row.sharePercent}%` }}
                    />
                  ))}
                </div>
                {data.seasonBreakdown.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="size-2 shrink-0 rounded-full bg-muted-foreground" aria-hidden />
                      <span className="truncate text-xs text-muted-foreground">{row.label}</span>
                    </div>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </InsightVisualGroup>

            <InsightRankedBarList
              title="Monthly breakdown"
              variant="monthly"
              items={data.monthlyBreakdown.map((row) => ({
                label: row.label,
                barValue: row.bookings,
                detail: `${row.bookings} booking${row.bookings === 1 ? "" : "s"}`,
                amount: row.amount,
              }))}
            />
          </div>

          <InsightFooter
            className="mt-0 shrink-0"
            left={
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Shield className="size-3.5 shrink-0" strokeWidth={2} />
                <span>{data.footerLabel}</span>
              </div>
            }
          />
        </InsightCardBody>
      </CardContent>
    </Card>
  )
}
