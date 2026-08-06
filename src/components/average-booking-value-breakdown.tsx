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

type AbvRow = {
  brand: string
  ccy: string
  abv: string
  calAbv: string
  abvIncFee: string
  calPricePct: string
  color: string
}

const rows: AbvRow[] = [
  { brand: "Partner Alpha", ccy: "GBP", abv: "£742", calAbv: "£890", abvIncFee: "£768", calPricePct: "7.2%", color: "bg-blue-500" },
  { brand: "Partner Beta", ccy: "GBP", abv: "£615", calAbv: "—", abvIncFee: "£638", calPricePct: "—", color: "bg-cyan-500" },
  { brand: "Partner Gamma (DK)", ccy: "EUR", abv: "€1,180", calAbv: "€1,340", abvIncFee: "€1,210", calPricePct: "9.4%", color: "bg-amber-500" },
  { brand: "Partner Gamma (EUR)", ccy: "EUR", abv: "€1,320", calAbv: "—", abvIncFee: "€1,365", calPricePct: "—", color: "bg-violet-500" },
  { brand: "Partner Delta (EUR)", ccy: "EUR", abv: "€2,850", calAbv: "—", abvIncFee: "€2,920", calPricePct: "—", color: "bg-rose-500" },
  { brand: "Partner Epsilon", ccy: "GBP", abv: "£3,100", calAbv: "—", abvIncFee: "£3,180", calPricePct: "—", color: "bg-lime-500" },
  { brand: "Partner Zeta (DK)", ccy: "EUR", abv: "€1,050", calAbv: "€1,210", abvIncFee: "€1,085", calPricePct: "9.8%", color: "bg-pink-500" },
  { brand: "Partner Zeta (EUR)", ccy: "EUR", abv: "€1,140", calAbv: "€1,255", abvIncFee: "€1,175", calPricePct: "9.9%", color: "bg-orange-500" },
]

export function AverageBookingValueBreakdown() {
  const [open, setOpen] = useState(false)

  return (
    <section className="rounded-xl border border-border bg-card shadow-xs">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold">Average booking value (ABV) by partner</h3>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Hide ABV breakdown" : "Show ABV breakdown"}
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
              <TableHead className="text-right">ABV</TableHead>
              <TableHead className="text-right">CAL ABV</TableHead>
              <TableHead className="text-right">ABV inc. fee</TableHead>
              <TableHead className="text-right">CAL price %</TableHead>
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
                <TableCell className="text-right tabular-nums">{row.abv}</TableCell>
                <TableCell className="text-right tabular-nums text-primary">
                  {row.calAbv}
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.abvIncFee}</TableCell>
                <TableCell className="text-right tabular-nums text-primary">
                  {row.calPricePct}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </section>
  )
}
