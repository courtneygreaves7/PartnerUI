import { TrendingDown } from "lucide-react"

import {
  InsightBadge,
  InsightBenchmarkBar,
  InsightCardBody,
  InsightFooter,
  InsightMetricGroup,
  InsightMiniSparkline,
  InsightVisualGroup,
  InsightWidgetHeader,
  insightCardHeaderClass,
} from "@/components/booking-engine/property-insight-primitives"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { PropertyCancelBenchmarkInsight } from "@/lib/property-insights-data"
import { cn } from "@/lib/utils"

type PropertyCancelBenchmarkWidgetProps = {
  data: PropertyCancelBenchmarkInsight
  helpText?: string
  className?: string
}

export function PropertyCancelBenchmarkWidget({
  data,
  helpText,
  className,
}: PropertyCancelBenchmarkWidgetProps) {
  const vsLabel =
    data.vsPortfolio > 0
      ? `+${data.vsPortfolio} vs portfolio`
      : `${data.vsPortfolio} vs portfolio`

  return (
    <Card className={cn("@container flex h-full min-w-0 flex-col bg-card shadow-xs", className)}>
      <CardHeader className={insightCardHeaderClass}>
        <InsightWidgetHeader title={data.title} subtitle={data.subtitle} helpText={helpText} />
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <InsightCardBody>
          <InsightMetricGroup>
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {data.valueLabel}
              </p>
              <InsightBadge variant="positive">
                <TrendingDown className="size-3 shrink-0" strokeWidth={2.25} />
                {vsLabel}
              </InsightBadge>
            </div>
          </InsightMetricGroup>

          <InsightVisualGroup>
            <InsightBenchmarkBar
              percent={data.benchmarkPercent}
              label={`${data.benchmarkPercent}% of portfolio avg`}
            />
            <InsightMiniSparkline data={data.monthlyTrend} height={48} />
          </InsightVisualGroup>

          <InsightFooter
            left={
              <p className="text-[10px] text-muted-foreground">
                <span className="font-medium text-foreground">12M portfolio average</span>{" "}
                {data.portfolioAvgLabel}
              </p>
            }
          />
        </InsightCardBody>
      </CardContent>
    </Card>
  )
}
