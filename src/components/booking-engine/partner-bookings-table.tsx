import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatCurrency,
  type PartnerBooking,
  type PartnerBookingStatus,
} from "@/lib/booking-engine-data"
import { cn } from "@/lib/utils"

type PartnerBookingsTableProps = {
  bookings: PartnerBooking[]
}

function StatusBadge({ status }: { status: PartnerBookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
        status === "confirmed" && "border-border text-foreground",
        status === "completed" && "border-border bg-muted/50 text-muted-foreground",
        status === "cancelled" && "border-border text-muted-foreground"
      )}
    >
      {status}
    </span>
  )
}

export function PartnerBookingsTable({ bookings }: PartnerBookingsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="h-10 px-4 text-xs">Ref</TableHead>
            <TableHead className="px-4 text-xs">Property</TableHead>
            <TableHead className="px-4 text-xs">Brand</TableHead>
            <TableHead className="px-4 text-xs">Check-in</TableHead>
            <TableHead className="px-4 text-right text-xs">Nights</TableHead>
            <TableHead className="px-4 text-right text-xs">Guests</TableHead>
            <TableHead className="px-4 text-right text-xs">Value</TableHead>
            <TableHead className="px-4 text-xs">Flexible Cancellation</TableHead>
            <TableHead className="px-4 text-xs">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {booking.id}
              </TableCell>
              <TableCell className="px-4 py-3 text-sm">{booking.property}</TableCell>
              <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                {booking.brand}
              </TableCell>
              <TableCell className="px-4 py-3 text-sm tabular-nums">{booking.checkIn}</TableCell>
              <TableCell className="px-4 py-3 text-right text-sm tabular-nums">
                {booking.nights}n
              </TableCell>
              <TableCell className="px-4 py-3 text-right text-sm tabular-nums">
                {booking.guests}
              </TableCell>
              <TableCell className="px-4 py-3 text-right text-sm tabular-nums">
                {formatCurrency(booking.value, booking.currency)}
              </TableCell>
              <TableCell className="px-4 py-3">
                {booking.hasCal ? (
                  <span className="inline-flex rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    Yes
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="px-4 py-3">
                <StatusBadge status={booking.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
