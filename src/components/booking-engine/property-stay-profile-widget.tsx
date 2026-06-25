import { Shield } from "lucide-react"

import {
  InsightBadge,
  InsightBenchmarkBar,
  InsightDistributionBars,
  InsightFooter,
  InsightWidgetHeader,
} from "@/components/booking-engine/property-insight-primitives"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { PropertyStayProfileInsight } from "@/lib/property-insights-data"
import { cn } from "@/lib/utils"

type PropertyStayProfileWidgetProps = {
  data: PropertyStayProfileInsight
  helpText?: string
  className?: string
}

export function PropertyStayProfileWidget({
  data,
  helpText,
  className,
}: PropertyStayProfileWidgetProps) {
  return (
    <Card className={cn("@container flex h-full min-w-0 flex-col bg-card shadow-xs", className)}>
      <CardHeader className="space-y-0 pb-2">
        <InsightWidgetHeader
          title={data.title}
          subtitle={data.subtitle}
          helpText={helpText}
          badges={
            <InsightBadge>
              Portfolio: {data.portfolioAvg}
            </InsightBadge>
          }
        />
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4 pt-0">
        <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
          {data.valueLabel}
        </p>

        <InsightBenchmarkBar
          percent={data.benchmarkPercent}
          label={`${data.benchmarkPercent}% of portfolio avg`}
        />

        <InsightDistributionBars title={data.distributionTitle} items={data.distribution} />

        <InsightFooter
          left={
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Shield className="size-3.5 shrink-0" strokeWidth={2} />
              <span>
                <span className="font-medium text-foreground">CAL bookings</span> · {data.calFooter}
              </span>
            </div>
          }
        />
      </CardContent>
    </Card>
  )
}
