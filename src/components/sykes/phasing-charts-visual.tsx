import { useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { CollapsibleDataTable, VisualCard } from "@/components/sykes/sykes-visual-primitives"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CHART_HEIGHT } from "@/lib/chart-styles"
import type { MonthlyTripleSeries } from "@/lib/sykes-dashboard-data"
import {
  MARGIN_EARNED_FC_DATA,
  TRIPLE_SERIES_COLORS,
  TRIPLE_SERIES_LABELS,
} from "@/lib/sykes-dashboard-data"

const TICK_STYLE = { fontSize: 11, fill: "var(--color-muted-foreground)" }

function TripleSeriesTable({ data }: { data: MonthlyTripleSeries[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Metric</TableHead>
          {data.map((row) => (
            <TableHead key={row.month} className="text-center">
              {row.month}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {(["bookings", "cancellations", "relets"] as const).map((key) => (
          <TableRow key={key}>
            <TableCell className="font-medium">{TRIPLE_SERIES_LABELS[key]}</TableCell>
            {data.map((row) => (
              <TableCell key={row.month} className="text-center tabular-nums">
                {row[key].toLocaleString("en-GB")}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function TripleBarChart({
  data,
  yAxisMax,
}: {
  data: MonthlyTripleSeries[]
  yAxisMax?: number
}) {
  const maxValue = Math.max(...data.flatMap((row) => [row.bookings, row.cancellations, row.relets]))
  const axisMax = yAxisMax ?? Math.ceil(maxValue / 500) * 500

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="month" tick={TICK_STYLE} tickLine={false} axisLine={false} />
        <YAxis
          tick={TICK_STYLE}
          tickLine={false}
          axisLine={false}
          width={48}
          domain={[0, axisMax]}
        />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="bookings"
          name={TRIPLE_SERIES_LABELS.bookings}
          fill={TRIPLE_SERIES_COLORS.bookings}
          radius={[2, 2, 0, 0]}
        />
        <Bar
          dataKey="cancellations"
          name={TRIPLE_SERIES_LABELS.cancellations}
          fill={TRIPLE_SERIES_COLORS.cancellations}
          radius={[2, 2, 0, 0]}
        />
        <Bar
          dataKey="relets"
          name={TRIPLE_SERIES_LABELS.relets}
          fill={TRIPLE_SERIES_COLORS.relets}
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

type PhasingChartsVisualProps = {
  eventsSummer: MonthlyTripleSeries[]
  eventsDeclining: MonthlyTripleSeries[]
  departures: MonthlyTripleSeries[]
}

export function PhasingChartsVisual({
  eventsSummer,
  eventsDeclining,
  departures,
}: PhasingChartsVisualProps) {
  const [view, setView] = useState<"summer" | "declining">("summer")
  const eventData = view === "summer" ? eventsSummer : eventsDeclining

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <VisualCard
        title="Margin earned from FC bookings"
        subtitle="Phasing of margin across the year"
        className="xl:col-span-2"
      >
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <AreaChart data={MARGIN_EARNED_FC_DATA} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="marginFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="month" tick={TICK_STYLE} tickLine={false} axisLine={false} />
            <YAxis tick={TICK_STYLE} tickLine={false} axisLine={false} width={48} domain={[0, 1200]} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              name="FC Bookings Made"
              stroke="var(--brand-primary)"
              strokeWidth={2}
              fill="url(#marginFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <CollapsibleDataTable title="View monthly data table">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Metric</TableHead>
                {MARGIN_EARNED_FC_DATA.map((row) => (
                  <TableHead key={row.month} className="text-center">
                    {row.month}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">FC Bookings Made</TableCell>
                {MARGIN_EARNED_FC_DATA.map((row) => (
                  <TableCell key={row.month} className="text-center tabular-nums">
                    {row.value.toLocaleString("en-GB")}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CollapsibleDataTable>
      </VisualCard>

      <VisualCard
        title="Bookings, cancellations & relets"
        subtitle="Based on date that event happened"
        action={
          <div className="flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
            {(["summer", "declining"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={
                  view === key
                    ? "rounded-md bg-card px-2.5 py-1 font-medium shadow-xs"
                    : "px-2.5 py-1 text-muted-foreground"
                }
              >
                {key === "summer" ? "Seasonal peak" : "Declining trend"}
              </button>
            ))}
          </div>
        }
      >
        <TripleBarChart data={eventData} yAxisMax={view === "summer" ? 2500 : 1200} />
        <CollapsibleDataTable title="View monthly data table">
          <TripleSeriesTable data={eventData} />
        </CollapsibleDataTable>
      </VisualCard>

      <VisualCard
        title="Departures, cancellations & relets"
        subtitle="Based on date of departure"
      >
        <TripleBarChart data={departures} yAxisMax={2500} />
        <CollapsibleDataTable title="View monthly data table">
          <TripleSeriesTable data={departures} />
        </CollapsibleDataTable>
      </VisualCard>
    </div>
  )
}
