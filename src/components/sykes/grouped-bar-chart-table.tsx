import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  TRIPLE_SERIES_COLORS,
  TRIPLE_SERIES_LABELS,
} from "@/lib/sykes-dashboard-data"

const TICK_STYLE = { fontSize: 11, fill: "var(--color-muted-foreground)" }

type GroupedBarChartTableProps = {
  title: string
  data: MonthlyTripleSeries[]
  yAxisMax?: number
}

export function GroupedBarChartTable({ title, data, yAxisMax }: GroupedBarChartTableProps) {
  const maxValue = Math.max(
    ...data.flatMap((row) => [row.bookings, row.cancellations, row.relets])
  )
  const axisMax = yAxisMax ?? Math.ceil(maxValue / 500) * 500

  return (
    <Card className="bg-card shadow-xs">
      <CardHeader className="pb-2">
        <h3 className="text-center text-sm font-semibold text-foreground">{title}</h3>
      </CardHeader>
      <CardContent className="space-y-4 pb-5">
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
              tickFormatter={(value) => (value as number).toLocaleString("en-GB")}
            />
            <Tooltip
              formatter={(value, name) => [
                Number(value).toLocaleString("en-GB"),
                TRIPLE_SERIES_LABELS[name as keyof typeof TRIPLE_SERIES_LABELS] ?? String(name),
              ]}
            />
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

        <div className="overflow-x-auto rounded-lg border border-border">
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
              <TableRow>
                <TableCell className="font-medium">{TRIPLE_SERIES_LABELS.bookings}</TableCell>
                {data.map((row) => (
                  <TableCell key={row.month} className="text-center tabular-nums">
                    {row.bookings.toLocaleString("en-GB")}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{TRIPLE_SERIES_LABELS.cancellations}</TableCell>
                {data.map((row) => (
                  <TableCell key={row.month} className="text-center tabular-nums">
                    {row.cancellations.toLocaleString("en-GB")}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{TRIPLE_SERIES_LABELS.relets}</TableCell>
                {data.map((row) => (
                  <TableCell key={row.month} className="text-center tabular-nums">
                    {row.relets.toLocaleString("en-GB")}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
