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
import { MARGIN_EARNED_FC_DATA } from "@/lib/sykes-dashboard-data"

const TICK_STYLE = { fontSize: 11, fill: "var(--color-muted-foreground)" }

export function MarginEarnedChartTable() {
  return (
    <Card className="bg-card shadow-xs">
      <CardHeader className="pb-2">
        <h3 className="text-center text-sm font-semibold text-foreground">
          Margin Earned from FC Bookings
        </h3>
      </CardHeader>
      <CardContent className="space-y-4 pb-5">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={MARGIN_EARNED_FC_DATA} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="month" tick={TICK_STYLE} tickLine={false} axisLine={false} />
            <YAxis
              tick={TICK_STYLE}
              tickLine={false}
              axisLine={false}
              width={48}
              domain={[0, 1200]}
              tickFormatter={(value) => (value as number).toLocaleString("en-GB")}
            />
            <Tooltip
              formatter={(value) => [
                Number(value).toLocaleString("en-GB"),
                "FC Bookings Made",
              ]}
            />
            <Legend />
            <Bar
              dataKey="value"
              name="FC Bookings Made"
              fill="var(--brand-primary)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="overflow-x-auto rounded-lg border border-border">
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
        </div>
      </CardContent>
    </Card>
  )
}
