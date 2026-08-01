import { useState } from "react"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BDX_CLAIMS_ROWS,
  BDX_RELETS_ROWS,
  BDX_SALES_ROWS,
  BDX_SUBMISSIONS,
  buildBdxCsv,
  buildCombinedBdxCsv,
  downloadBdxCsv,
  formatBdxMoney,
  type BdxDatasetKind,
} from "@/lib/bdx-submissions-data"
import { cn } from "@/lib/utils"

const PANEL = "rounded-2xl border border-border/60 bg-card p-4 shadow-xs"
const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"

const TABS: Array<{ id: BdxDatasetKind; label: string }> = [
  { id: "sales", label: "Sales" },
  { id: "claims", label: "Claims" },
  { id: "relets", label: "Relets" },
]

export function BdxSubmissionsPanel() {
  const [tab, setTab] = useState<BdxDatasetKind>("sales")
  const activeMeta = BDX_SUBMISSIONS.find((item) => item.kind === tab)

  function handleDownload(kind: BdxDatasetKind) {
    downloadBdxCsv(`bdx-${kind}-jul-2026.csv`, buildBdxCsv(kind))
  }

  function handleDownloadAll() {
    downloadBdxCsv("bdx-sales-claims-relets-jul-2026.csv", buildCombinedBdxCsv())
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={MONO_LABEL}>Bordereaux</p>
          <h2 className="mt-1 text-sm font-semibold tracking-tight text-foreground">
            BDX submissions
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Sales, claims and relets submitted for the period — view and download in one place.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleDownloadAll}>
          <Download className="size-3.5" />
          Download all
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {BDX_SUBMISSIONS.map((item) => (
          <button
            key={item.kind}
            type="button"
            onClick={() => setTab(item.kind)}
            className={cn(
              PANEL,
              "flex flex-col gap-2 text-left transition-colors",
              tab === item.kind
                ? "border-primary/40 ring-1 ring-primary/20"
                : "hover:bg-muted/30"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                {item.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {item.periodLabel} · submitted {item.submittedAt}
            </p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {item.rowCount} rows
            </p>
          </button>
        ))}
      </div>

      <div className={cn(PANEL, "space-y-4")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  tab === item.id
                    ? "border-foreground/20 bg-background text-foreground shadow-sm"
                    : "border-transparent bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => handleDownload(tab)}>
            <Download className="size-3.5" />
            Download {activeMeta?.label ?? "CSV"}
          </Button>
        </div>

        {activeMeta ? (
          <p className="text-xs text-muted-foreground">
            {activeMeta.label} · {activeMeta.periodLabel} · submitted {activeMeta.submittedAt} ·{" "}
            {activeMeta.status}
          </p>
        ) : null}

        <div className="overflow-hidden rounded-lg border border-border">
          {tab === "sales" ? <SalesTable /> : null}
          {tab === "claims" ? <ClaimsTable /> : null}
          {tab === "relets" ? <ReletsTable /> : null}
        </div>
      </div>
    </section>
  )
}

function SalesTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableHead className="h-10 px-3 text-xs">Booking ref</TableHead>
          <TableHead className="px-3 text-xs">Property</TableHead>
          <TableHead className="px-3 text-xs">Product</TableHead>
          <TableHead className="px-3 text-xs">Channel</TableHead>
          <TableHead className="px-3 text-xs">Sale date</TableHead>
          <TableHead className="px-3 text-right text-xs">Premium</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {BDX_SALES_ROWS.map((row) => (
          <TableRow key={row.bookingRef}>
            <TableCell className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
              {row.bookingRef}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-sm">{row.property}</TableCell>
            <TableCell className="px-3 py-2.5 text-sm text-muted-foreground">
              {row.product}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-sm text-muted-foreground">
              {row.channel}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-sm tabular-nums">{row.saleDate}</TableCell>
            <TableCell className="px-3 py-2.5 text-right text-sm font-medium tabular-nums">
              {formatBdxMoney(row.premium)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ClaimsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableHead className="h-10 px-3 text-xs">Claim ref</TableHead>
          <TableHead className="px-3 text-xs">Booking ref</TableHead>
          <TableHead className="px-3 text-xs">Type</TableHead>
          <TableHead className="px-3 text-xs">Notified</TableHead>
          <TableHead className="px-3 text-xs">Status</TableHead>
          <TableHead className="px-3 text-right text-xs">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {BDX_CLAIMS_ROWS.map((row) => (
          <TableRow key={row.claimRef}>
            <TableCell className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
              {row.claimRef}
            </TableCell>
            <TableCell className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
              {row.bookingRef}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-sm">{row.claimType}</TableCell>
            <TableCell className="px-3 py-2.5 text-sm tabular-nums">{row.notifiedAt}</TableCell>
            <TableCell className="px-3 py-2.5 text-sm text-muted-foreground">
              {row.status}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-right text-sm font-medium tabular-nums">
              {formatBdxMoney(row.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ReletsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableHead className="h-10 px-3 text-xs">Cancelled ref</TableHead>
          <TableHead className="px-3 text-xs">Re-let ref</TableHead>
          <TableHead className="px-3 text-xs">Property</TableHead>
          <TableHead className="px-3 text-xs">Channel</TableHead>
          <TableHead className="px-3 text-xs">Re-let date</TableHead>
          <TableHead className="px-3 text-right text-xs">Value recovered</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {BDX_RELETS_ROWS.map((row) => (
          <TableRow key={row.cancelledRef}>
            <TableCell className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
              {row.cancelledRef}
            </TableCell>
            <TableCell className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
              {row.reletRef}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-sm">{row.property}</TableCell>
            <TableCell className="px-3 py-2.5 text-sm text-muted-foreground">
              {row.channel}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-sm tabular-nums">{row.reletDate}</TableCell>
            <TableCell className="px-3 py-2.5 text-right text-sm font-medium tabular-nums">
              {formatBdxMoney(row.valueRecovered)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
