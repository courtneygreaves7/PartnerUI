import { useMemo } from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type TimelineEvent = {
  id: string
  label: string
  /** Inclusive start day index along the timeline (0-based). */
  start: number
  /** Inclusive end day index along the timeline (0-based). */
  end: number
  tone?: "primary" | "accent" | "muted"
}

export type EventTimelineWidgetProps = {
  title: string
  explanation?: string
  /** Total number of day slots on the axis. */
  days: number
  events: TimelineEvent[]
  axisLabels?: string[]
  className?: string
}

const TONE_CLASS: Record<NonNullable<TimelineEvent["tone"]>, string> = {
  primary: "bg-primary/80",
  accent: "bg-sky-400/80",
  muted: "bg-muted-foreground/35",
}

type LaneEvent = TimelineEvent & { lane: number }

function assignLanes(events: TimelineEvent[]): LaneEvent[] {
  const sorted = [...events].sort((a, b) => a.start - b.start || a.end - b.end)
  const laneEnds: number[] = []
  const placed: LaneEvent[] = []

  for (const event of sorted) {
    let lane = laneEnds.findIndex((end) => event.start > end)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(event.end)
    } else {
      laneEnds[lane] = event.end
    }
    placed.push({ ...event, lane })
  }

  return placed
}

/** Plots events on a horizontal timeline, stacking overlaps onto separate lanes. */
export function EventTimelineWidget({
  title,
  explanation,
  days,
  events,
  axisLabels,
  className,
}: EventTimelineWidgetProps) {
  const placed = useMemo(() => assignLanes(events), [events])
  const laneCount = Math.max(1, ...placed.map((event) => event.lane + 1))
  const labels =
    axisLabels && axisLabels.length > 0
      ? axisLabels
      : Array.from({ length: Math.min(days, 7) }, (_, index) => `Day ${index + 1}`)

  return (
    <Card className={cn("bg-card shadow-xs", className)}>
      <CardHeader className="flex-col items-start gap-1 pb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {explanation ? (
          <p className="text-xs text-muted-foreground">{explanation}</p>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4 pb-5">
        <div className="relative overflow-x-auto rounded-xl border border-border/70 bg-muted/20 p-4">
          <div
            className="relative min-w-[28rem]"
            style={{ height: `${laneCount * 2.25 + 1.5}rem` }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 grid grid-cols-[repeat(var(--timeline-days),minmax(0,1fr))] gap-0"
              style={{ ["--timeline-days" as string]: days }}
            >
              {Array.from({ length: days }).map((_, index) => (
                <div key={index} className="border-r border-border/40 last:border-r-0" />
              ))}
            </div>

            {placed.map((event) => {
              const widthDays = Math.max(1, event.end - event.start + 1)
              const left = (event.start / days) * 100
              const width = (widthDays / days) * 100
              return (
                <div
                  key={event.id}
                  title={`${event.label} · days ${event.start + 1}–${event.end + 1}`}
                  className={cn(
                    "absolute flex h-7 items-center overflow-hidden rounded-md px-2 text-[11px] font-medium text-white shadow-xs",
                    TONE_CLASS[event.tone ?? "primary"]
                  )}
                  style={{
                    left: `${left}%`,
                    width: `calc(${width}% - 4px)`,
                    top: `${event.lane * 2.25}rem`,
                  }}
                >
                  <span className="truncate">{event.label}</span>
                </div>
              )
            })}
          </div>

          <div className="mt-3 flex justify-between gap-2 text-[10px] text-muted-foreground">
            {labels.map((label) => (
              <span key={label} className="min-w-0 truncate">
                {label}
              </span>
            ))}
          </div>
        </div>

        <ul className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {events.map((event) => (
            <li key={event.id} className="inline-flex items-center gap-1.5">
              <span
                className={cn(
                  "size-2.5 rounded-sm",
                  TONE_CLASS[event.tone ?? "primary"]
                )}
              />
              {event.label}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
