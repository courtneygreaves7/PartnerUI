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
  formatRate,
  type PolicyRate,
} from "@/lib/booking-engine-data"
import { cn } from "@/lib/utils"

type PolicyRatesTableProps = {
  policies: PolicyRate[]
  selectedBrandId: string | null
}

export function PolicyRatesTable({ policies, selectedBrandId }: PolicyRatesTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 dark:bg-canvas dark:hover:bg-canvas">
            <TableHead className="h-12 px-5">Name / valid dates</TableHead>
            <TableHead className="px-5 text-right">Net rate</TableHead>
            <TableHead className="px-5 text-right">Gross rate</TableHead>
            <TableHead className="px-5 text-right">CAL commission</TableHead>
            <TableHead className="px-5 text-right">Max liability</TableHead>
            <TableHead className="px-5">Currency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy) => {
            const isHighlighted = selectedBrandId === policy.brandId
            const isActive = policy.status === "active"

            return (
              <TableRow
                key={policy.id}
                className={cn(isHighlighted && "bg-muted/40")}
              >
                <TableCell className="px-5 py-4">
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        isActive ? "bg-primary" : "bg-muted-foreground/40"
                      )}
                    />
                    <div>
                      <p
                        className={cn(
                          "font-medium text-foreground",
                          !isActive && "font-normal text-muted-foreground"
                        )}
                      >
                        {policy.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {policy.validFrom} – {policy.validTo}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-right font-mono text-sm tabular-nums text-foreground">
                  {formatRate(policy.netRate)}
                </TableCell>
                <TableCell className="px-5 py-4 text-right font-mono text-sm tabular-nums text-foreground">
                  {formatRate(policy.grossRate)}
                </TableCell>
                <TableCell className="px-5 py-4 text-right font-mono text-sm tabular-nums text-foreground">
                  {policy.calCommission > 0 ? `${formatRate(policy.calCommission)}%` : "—"}
                </TableCell>
                <TableCell className="px-5 py-4 text-right font-mono text-sm tabular-nums text-foreground">
                  {formatCurrency(policy.maxLiability, policy.currency)}
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-foreground">{policy.currency}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
