import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ChannelCellVariant, ChannelGridCell, ChannelGridRow } from "@/lib/sykes-dashboard-data"
import { cn } from "@/lib/utils"

const CHANNEL_COLUMNS = [
  { key: "website", label: "Website" },
  { key: "app", label: "App" },
  { key: "offline", label: "Offline" },
  { key: "ota", label: "OTA" },
  { key: "direct", label: "Direct" },
  { key: "total", label: "Total" },
] as const

const CELL_VARIANT_CLASS: Record<ChannelCellVariant, string> = {
  channel: "bg-rose-100 text-rose-950",
  volume: "bg-emerald-100 text-emerald-950",
  attachment: "bg-orange-100 text-orange-950",
  rate: "bg-rose-100 text-rose-950",
  direct: "bg-emerald-100 text-emerald-950",
  total: "border border-border bg-zinc-100 text-zinc-800",
  empty: "border border-dashed border-border bg-muted/40 text-muted-foreground",
}

function ChannelCellBox({ cell }: { cell: ChannelGridCell }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "flex min-h-9 min-w-[3.25rem] items-center justify-center rounded px-2 py-1.5 text-xs font-semibold tabular-nums",
          CELL_VARIANT_CLASS[cell.variant]
        )}
      >
        {cell.value || "\u00a0"}
      </div>
    </div>
  )
}

type ChannelGridTableProps = {
  rows: ChannelGridRow[]
  className?: string
}

export function ChannelGridTable({ rows, className }: ChannelGridTableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[14rem]">Metric</TableHead>
            {CHANNEL_COLUMNS.map((column) => (
              <TableHead key={column.key} className="text-center">
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="text-sm font-medium">{row.label}</TableCell>
              {CHANNEL_COLUMNS.map((column) => (
                <TableCell key={column.key} className="text-center">
                  <ChannelCellBox cell={row[column.key]} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
