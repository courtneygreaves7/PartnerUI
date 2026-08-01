import { Info } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { FIGURE_24PX_CLASS } from "@/lib/figure-styles"
import {
  OCCUPANCY_BY_BEDROOM,
  OCCUPANCY_BY_BEDROOM_HELP,
  OCCUPANCY_BY_DEPARTURE_WEEK,
  OCCUPANCY_BY_WEEK_HELP,
  OCCUPANCY_KPI_CARDS,
  OCCUPANCY_METHOD_HELP,
  OCCUPANCY_METHOD_NOTE,
  OCCUPANCY_SERIES_COLORS,
  formatDaysRatio,
  formatOccupancyPct,
  occupancyGapPp,
  type OccupancyWeekPoint,
} from "@/lib/occupancy-insights-data"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const PANEL = "rounded-2xl border border-border/60 bg-card p-3 shadow-xs"
const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"

const TICK = { fontSize: 11, fill: "var(--color-muted-foreground)" }

function MeasureHelp({ title, help }: { title: string; help: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`More information about ${title}`}
        >
          <Info className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64 text-left">
        {help}
      </TooltipContent>
    </Tooltip>
  )
}

function PanelTitle({
  title,
  help,
  className,
}: {
  title: string
  help: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <MeasureHelp title={title} help={help} />
    </div>
  )
}

function OccupancyKpiCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {OCCUPANCY_KPI_CARDS.map((card) => (
        <div key={card.id} className={cn(PANEL, "flex flex-col gap-3")}>
          <div className="flex items-center gap-1.5">
            <p className={MONO_LABEL}>{card.label}</p>
            <MeasureHelp title={card.label} help={card.help} />
          </div>
          <div>
            <p className={cn("font-bold tracking-tight tabular-nums text-foreground", FIGURE_24PX_CLASS)}>
              {card.value}
            </p>
            <p
              className={cn(
                "mt-1 text-xs font-medium tabular-nums",
                card.higherIsBetter && card.delta.startsWith("+")
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-muted-foreground"
              )}
            >
              {card.delta}
            </p>
          </div>
          {card.context.map((line) => (
            <p key={line} className="mt-auto text-[11px] text-muted-foreground">
              {line}
            </p>
          ))}
        </div>
      ))}
    </div>
  )
}

function DepartureWeekChart() {
  return (
    <div className={PANEL}>
      <div className="mb-4">
        <PanelTitle
          title="Partner vs market by departure week"
          help={OCCUPANCY_BY_WEEK_HELP}
        />
        <p className="mt-0.5 text-xs text-muted-foreground">
          Days booked ÷ days available · stays departing each week · Jun–Aug 2026
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ background: OCCUPANCY_SERIES_COLORS.partner }}
            />
            Partner
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ background: OCCUPANCY_SERIES_COLORS.market }}
            />
            Market
          </span>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={OCCUPANCY_BY_DEPARTURE_WEEK}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="weekLabel"
              tick={TICK}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[50, 100]}
              tick={TICK}
              tickLine={false}
              axisLine={false}
              width={36}
              tickFormatter={(v) => `${v}%`}
            />
            <RechartsTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const point = payload[0]?.payload as OccupancyWeekPoint | undefined
                if (!point) return null
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
                    <p className="font-medium text-foreground">
                      {point.week} · {label}
                    </p>
                    <p className="mt-1.5 tabular-nums text-foreground">
                      Partner {formatOccupancyPct(point.partner)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDaysRatio(point.partnerBooked, point.partnerAvailable)}
                    </p>
                    <p className="mt-1 tabular-nums text-muted-foreground">
                      Market {formatOccupancyPct(point.market)}
                    </p>
                  </div>
                )
              }}
            />
            <Line
              type="monotone"
              dataKey="partner"
              name="Partner"
              stroke={OCCUPANCY_SERIES_COLORS.partner}
              strokeWidth={2.5}
              dot={{ r: 3, fill: OCCUPANCY_SERIES_COLORS.partner }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="market"
              name="Market"
              stroke={OCCUPANCY_SERIES_COLORS.market}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 2.5, fill: OCCUPANCY_SERIES_COLORS.market }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function BedroomOccupancyPanel() {
  const max = Math.max(
    ...OCCUPANCY_BY_BEDROOM.flatMap((row) => [row.partner, row.market]),
    1
  )

  return (
    <div className={PANEL}>
      <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={MONO_LABEL}>Gold dust</p>
          <PanelTitle
            title="Occupancy by bedrooms"
            help={OCCUPANCY_BY_BEDROOM_HELP}
            className="mt-1"
          />
          <p className="mt-1 max-w-xl text-xs text-muted-foreground">
            Partner vs market by bedroom count, using days booked ÷ days available.
            Larger homes often hide the biggest occupancy opportunity.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-primary" />
            Partner
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-slate-400" />
            Market
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-0">
        <div className="mb-1 grid grid-cols-[5rem_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
          <span>Bedrooms</span>
          <span className="text-right">Partner</span>
          <span className="w-14 text-center">Gap</span>
          <span>Market</span>
        </div>

        {OCCUPANCY_BY_BEDROOM.map((row) => {
          const gap = occupancyGapPp(row.partner, row.market)
          const partnerWidth = `${(row.partner / max) * 100}%`
          const marketWidth = `${(row.market / max) * 100}%`

          return (
            <div
              key={row.bedroomKey}
              className="border-b border-border/60 py-3 last:border-b-0"
            >
              <div className="grid grid-cols-[5rem_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{row.bedrooms}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {row.properties} props
                  </p>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="w-11 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                      {formatOccupancyPct(row.partner)}
                    </p>
                    <div className="h-2 min-w-0 flex-1 rounded-full bg-muted">
                      <div
                        className="ml-auto h-2 rounded-full bg-primary"
                        style={{ width: partnerWidth }}
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-right text-[10px] tabular-nums text-muted-foreground sm:pr-0">
                    {formatDaysRatio(row.partnerBooked, row.partnerAvailable)}
                  </p>
                </div>

                <div
                  className={cn(
                    "w-14 text-center text-xs font-semibold tabular-nums",
                    gap > 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : gap < 0
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-muted-foreground"
                  )}
                >
                  {gap > 0 ? "+" : ""}
                  {gap}pp
                </div>

                <div className="flex min-w-0 items-center gap-2">
                  <div className="h-2 min-w-0 flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-slate-400"
                      style={{ width: marketWidth }}
                    />
                  </div>
                  <p className="w-11 shrink-0 text-sm tabular-nums text-muted-foreground">
                    {formatOccupancyPct(row.market)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function OccupancyInsightsDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <p className={MONO_LABEL}>Capacity</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          Occupancy
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Partner vs market across departure weeks, with bedroom mix as the
          high-value cut.
        </p>
        <div className="mt-3 flex max-w-2xl items-start gap-2 rounded-xl border border-border/70 bg-muted/30 px-3 py-2.5">
          <MeasureHelp title="Occupancy method" help={OCCUPANCY_METHOD_HELP} />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {OCCUPANCY_METHOD_NOTE}
          </p>
        </div>
      </div>

      <OccupancyKpiCards />
      <DepartureWeekChart />
      <BedroomOccupancyPanel />
    </div>
  )
}
