import { Calendar, Moon, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { WidgetHelpButton } from "@/components/widgets/widget-help-button"
import { PROPERTY_OCCUPANCY, type OccupancyMonthPoint } from "@/lib/property-insights-data"
import { cn } from "@/lib/utils"

type PropertyOccupancyWidgetProps = {
  helpText?: string
  className?: string
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

function StatColumn({
  label,
  value,
  unit,
  mutedValue,
}: {
  label: string
  value: string
  unit: string
  mutedValue?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center px-2 text-center">
      <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-lg font-bold tabular-nums tracking-tight",
          mutedValue ? "text-muted-foreground" : "text-foreground"
        )}
      >
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground">{unit || "\u00A0"}</p>
    </div>
  )
}

function monthBarClass(phase: OccupancyMonthPoint["phase"]) {
  switch (phase) {
    case "current":
      return "bg-foreground"
    case "past":
      return "bg-muted-foreground/45"
    case "future":
      return "bg-muted"
  }
}

export function PropertyOccupancyWidget({ helpText, className }: PropertyOccupancyWidgetProps) {
  const maxNights = Math.max(...PROPERTY_OCCUPANCY.monthlyBreakdown.map((m) => m.nights), 1)

  return (
    <Card className={cn("@container flex h-full min-w-0 flex-col bg-card shadow-xs", className)}>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Occupancy</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">12-month rolling</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
            <TrendingUp className="size-3 shrink-0" strokeWidth={2.25} />
            +{PROPERTY_OCCUPANCY.yoyChangePp}pp YoY
          </span>
          <WidgetHelpButton title="Occupancy" helpText={helpText} />
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4 pt-0">
        <OccupancyArcGauge percent={PROPERTY_OCCUPANCY.ratePercent} />

        <div className="flex items-stretch divide-x divide-border rounded-lg border border-border bg-muted/20 py-3">
          <StatColumn
            label="Booked"
            value={String(PROPERTY_OCCUPANCY.bookedNights)}
            unit="nights"
          />
          <StatColumn
            label="Available"
            value={String(PROPERTY_OCCUPANCY.availableDays)}
            unit="days"
          />
          <StatColumn
            label="Prior yr"
            value={`${PROPERTY_OCCUPANCY.priorYearRatePercent}%`}
            unit=""
            mutedValue
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-foreground">Monthly breakdown</p>
            <div className="flex items-center gap-2.5 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-muted-foreground/45" />
                Past
              </span>
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-foreground" />
                Now
              </span>
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-muted" />
                Future
              </span>
            </div>
          </div>

          <div className="mt-2 flex h-16 items-end gap-1">
            {PROPERTY_OCCUPANCY.monthlyBreakdown.map((month, index) => {
              const heightPct = month.nights ? Math.max(12, (month.nights / maxNights) * 100) : 8
              return (
                <div key={`${month.label}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-full rounded-sm transition-[height]",
                      monthBarClass(month.phase),
                      month.phase === "current" && "ring-1 ring-foreground/20"
                    )}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span
                    className={cn(
                      "text-[9px] font-medium tabular-nums",
                      month.phase === "current" ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {month.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Moon className="size-3.5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">
                Peak: {PROPERTY_OCCUPANCY.peakMonth}
              </p>
              <p className="text-[10px] tabular-nums text-muted-foreground">
                {PROPERTY_OCCUPANCY.peakNights} nights · {PROPERTY_OCCUPANCY.peakOccupancyPercent}%
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-[10px] tabular-nums text-muted-foreground">
            <Calendar className="size-3.5 shrink-0" strokeWidth={2} />
            {PROPERTY_OCCUPANCY.periodLabel}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
