import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type PropertyBooking } from "@/lib/property-data"
import { cn } from "@/lib/utils"

type PropertyBookingsTableProps = {
  bookings: PropertyBooking[]
}

function StatusBadge({ status }: { status: PropertyBooking["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "confirmed"
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
          : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200"
      )}
    >
      {status === "confirmed" ? "Confirmed" : "Cancelled"}
    </span>
  )
}

export function PropertyBookingsTable({ bookings }: PropertyBookingsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="h-12 px-5">Booking ID</TableHead>
            <TableHead className="px-5">Booked</TableHead>
            <TableHead className="px-5">Start</TableHead>
            <TableHead className="px-5">End</TableHead>
            <TableHead className="px-5 text-right">Nights</TableHead>
            <TableHead className="px-5">Products</TableHead>
            <TableHead className="px-5">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="px-5 py-4 font-mono text-xs text-muted-foreground">
                {booking.id}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm">{booking.booked}</TableCell>
              <TableCell className="px-5 py-4 text-sm">{booking.start}</TableCell>
              <TableCell className="px-5 py-4 text-sm">{booking.end}</TableCell>
              <TableCell className="px-5 py-4 text-right text-sm tabular-nums">
                {booking.nights}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm text-muted-foreground">
                {booking.products}
              </TableCell>
              <TableCell className="px-5 py-4">
                <StatusBadge status={booking.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
