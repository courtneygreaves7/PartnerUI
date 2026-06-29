import { TrendingUp } from "lucide-react"

import {
  InsightBadge,
  InsightCardBody,
  InsightFooter,
  InsightStatRow,
  InsightVisualGroup,
  InsightWidgetHeader,
  insightCardHeaderClass,
} from "@/components/booking-engine/property-insight-primitives"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PROPERTY_OCCUPANCY } from "@/lib/property-insights-data"
import { cn } from "@/lib/utils"

type PropertyOccupancyWidgetProps = {
  helpText?: string
  className?: string
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const startX = cx + radius * Math.cos(startAngle)
  const startY = cy - radius * Math.sin(startAngle)
  const endX = cx + radius * Math.cos(endAngle)
  const endY = cy - radius * Math.sin(endAngle)
  const largeArc = startAngle - endAngle > Math.PI ? 1 : 0
  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`
}

function OccupancyArcGauge({ percent }: { percent: number }) {
  const radius = 72
  const cx = 100
  const cy = 92
  const clamped = Math.min(100, Math.max(0, percent))
  const startAngle = Math.PI
  const endAngle = 0
  const filledAngle = startAngle - (clamped / 100) * Math.PI

  const trackPath = describeArc(cx, cy, radius, startAngle, endAngle)
  const fillPath = describeArc(cx, cy, radius, startAngle, filledAngle)
  const ticks = [25, 50, 75]

  return (
    <div className="relative mx-auto w-full max-w-[200px]">
      <svg viewBox="0 0 200 108" className="h-auto w-full" aria-hidden>
        <path
          d={trackPath}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className="text-muted"
        />
        <path
          d={fillPath}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className="text-foreground"
        />
        {ticks.map((tick) => {
          const angle = startAngle - (tick / 100) * Math.PI
          const labelRadius = radius + 14
          const x = cx + labelRadius * Math.cos(angle)
          const y = cy - labelRadius * Math.sin(angle)
          return (
            <text
              key={tick}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[9px] tabular-nums"
            >
              {tick}%
            </text>
          )
        })}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-0.5 text-center">
        <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
          {PROPERTY_OCCUPANCY.rateLabel}
        </p>
        <p className="text-[11px] text-muted-foreground">occupancy rate</p>
      </div>
    </div>
  )
}

export function PropertyOccupancyWidget({ helpText, className }: PropertyOccupancyWidgetProps) {
  return (
    <Card className={cn("@container flex h-full min-w-0 flex-col bg-card shadow-xs", className)}>
      <CardHeader className={insightCardHeaderClass}>
        <InsightWidgetHeader
          title="Occupancy"
          subtitle="12-month rolling"
          helpText={helpText}
          badges={
            <InsightBadge variant="positive">
              <TrendingUp className="size-3 shrink-0" strokeWidth={2.25} />
              +{PROPERTY_OCCUPANCY.yoyChangePp}pp YoY
            </InsightBadge>
          }
        />
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <InsightCardBody>
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-5">
            <InsightVisualGroup className="items-center py-1">
              <OccupancyArcGauge percent={PROPERTY_OCCUPANCY.ratePercent} />
            </InsightVisualGroup>

            <InsightStatRow
              columns={[
                { label: "Booked", value: String(PROPERTY_OCCUPANCY.bookedNights), unit: "nights" },
                {
                  label: "Available",
                  value: String(PROPERTY_OCCUPANCY.availableDays),
                  unit: "days",
                },
                {
                  label: "Prior yr",
                  value: `${PROPERTY_OCCUPANCY.priorYearRatePercent}%`,
                  unit: `+${PROPERTY_OCCUPANCY.priorYearDeltaPp}pp`,
                },
              ]}
            />

            <div>
              <p className="mb-2 text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
                Peak period
              </p>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {PROPERTY_OCCUPANCY.peakMonth}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {PROPERTY_OCCUPANCY.peakNights} nights booked
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold tabular-nums text-foreground">
                    {PROPERTY_OCCUPANCY.peakOccupancyPercent}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">occupancy</p>
                </div>
              </div>
            </div>
          </div>

          <InsightFooter
            className="mt-0 shrink-0"
            left={
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {PROPERTY_OCCUPANCY.periodLabel}
              </span>
            }
            right={
              <span className="text-[10px] tabular-nums text-muted-foreground">
                vs {PROPERTY_OCCUPANCY.priorYearRatePercent}% prior year
              </span>
            }
          />
        </InsightCardBody>
      </CardContent>
    </Card>
  )
}
