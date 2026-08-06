import { useState } from "react"
import { LayoutList } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type PartnerRow = {
  brand: string
  ccy: string
  bookings: string
  cal: string
  ddl: string
  color: string
}

const rows: PartnerRow[] = [
  { brand: "Partner Alpha", ccy: "GBP", bookings: "42,310", cal: "1,104 2.6%", ddl: "12 0.0%", color: "bg-blue-500" },
  { brand: "Partner Beta", ccy: "GBP", bookings: "38,750", cal: "892 2.3%", ddl: "8 0.0%", color: "bg-cyan-500" },
  { brand: "Partner Gamma (DK)", ccy: "EUR", bookings: "9,420", cal: "310 3.3%", ddl: "0 0.0%", color: "bg-amber-500" },
  { brand: "Partner Gamma (EUR)", ccy: "EUR", bookings: "7,880", cal: "0 0.0%", ddl: "0 0.0%", color: "bg-violet-500" },
  { brand: "Partner Delta (EUR)", ccy: "EUR", bookings: "5,640", cal: "0 0.0%", ddl: "0 0.0%", color: "bg-rose-500" },
  { brand: "Partner Epsilon", ccy: "GBP", bookings: "4,200", cal: "0 0.0%", ddl: "0 0.0%", color: "bg-lime-500" },
  { brand: "Partner Zeta (DK)", ccy: "EUR", bookings: "11,800", cal: "620 5.3%", ddl: "18 0.2%", color: "bg-pink-500" },
  { brand: "Partner Zeta (EUR)", ccy: "EUR", bookings: "4,500", cal: "284 6.3%", ddl: "10 0.2%", color: "bg-orange-500" },
]

export function PartnerBreakdown() {
  const [open, setOpen] = useState(false)

  return (
    <section className="mt-6 rounded-xl border border-border bg-card shadow-xs">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold">Partner breakdown</h3>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Hide partner breakdown" : "Show partner breakdown"}
          className={`rounded-md p-1.5 transition-colors hover:bg-accent ${open ? "text-foreground" : "text-muted-foreground"}`}
        >
          <LayoutList className="size-4" />
        </button>
      </div>

      {open ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>CCY</TableHead>
              <TableHead className="text-right">Bookings</TableHead>
              <TableHead className="text-right">Flexible Cancellation (CAL)</TableHead>
              <TableHead className="text-right">Damage Deposit Waiver (DDL)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.brand}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${row.color}`} />
                    <span>{row.brand}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.ccy}</TableCell>
                <TableCell className="text-right tabular-nums">{row.bookings}</TableCell>
                <TableCell className="text-right tabular-nums text-primary">
                  {row.cal}
                </TableCell>
                <TableCell className="text-right tabular-nums text-amber-600 dark:text-muted-foreground">
                  {row.ddl}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </section>
  )
}
