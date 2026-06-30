import { useId } from "react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { MetricTrendPoint } from "@/components/widgets/metric-trend-widget"
import { CHART_AREA_GRADIENT_FROM, CHART_LINE } from "@/lib/chart-colors"
import { FIGURE_24PX_CLASS } from "@/lib/figure-styles"
import { cn } from "@/lib/utils"
import { WidgetHelpButton } from "@/components/widgets/widget-help-button"

export type HeadlineDataWidgetProps = {
  title: string
  value: string
  label: string
  helpText?: string
  valueClassName?: string
  chartData?: MetricTrendPoint[]
  className?: string
}

export function HeadlineDataWidget({
  title,
  value,
  label,
  helpText,
  valueClassName,
  chartData,
  className,
}: HeadlineDataWidgetProps) {
  const gradientId = `headline-sparkline-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`

  return (
    <Card className={cn("@container flex h-full min-w-0 flex-col bg-card shadow-xs", className)}>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-0">
        <h3 className="min-w-0 pr-2 text-sm font-semibold text-muted-foreground">{title}</h3>
        <WidgetHelpButton title={title} helpText={helpText} />
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pb-5 pt-1">
        <p
          className={cn(
            "font-bold tracking-tight tabular-nums text-foreground",
            valueClassName ?? FIGURE_24PX_CLASS
          )}
        >
          {value}
        </p>
        {chartData ? (
          <div className="h-16 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_AREA_GRADIENT_FROM} stopOpacity={0.12} />
                    <stop offset="100%" stopColor={CHART_AREA_GRADIENT_FROM} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_LINE}
                  strokeWidth={1.5}
                  strokeOpacity={0.55}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : null}
        <p className="text-xs italic text-muted-foreground @sm:text-sm">{label}</p>
      </CardContent>
    </Card>
  )
}
