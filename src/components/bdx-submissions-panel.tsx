import { useState } from "react"
import { Check, Download, FileSpreadsheet, Table2 } from "lucide-react"

import { InsightsSection } from "@/components/insights-section"
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

const TABS: Array<{ id: BdxDatasetKind; label: string }> = [
  { id: "sales", label: "Sales" },
  { id: "claims", label: "Claims" },
  { id: "relets", label: "Relets" },
]

const CHANNEL_DOT: Record<string, string> = {
  Website: "bg-primary",
  App: "bg-amber-500",
  Offline: "bg-slate-400",
  OTA: "bg-emerald-500",
}

function MiniSpark({ values }: { values: number[] }) {
  return (
    <div className="flex h-8 items-end gap-0.5" aria-hidden>
      {values.map((value, index) => (
        <span
          key={index}
          className="w-1 rounded-sm bg-primary/70"
          style={{ height: `${Math.max(18, value)}%` }}
        />
      ))}
    </div>
  )
}

function ChannelCell({ channel }: { channel: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <span
        className={cn("size-1.5 rounded-full", CHANNEL_DOT[channel] ?? "bg-muted-foreground")}
      />
      {channel}
    </span>
  )
}

function MoneyBarCell({
  amount,
  max,
}: {
  amount: number
  max: number
}) {
  const width = Math.max(8, Math.round((amount / Math.max(max, 1)) * 100))
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-muted sm:block">
        <div className="h-full rounded-full bg-primary/80" style={{ width: `${width}%` }} />
      </div>
      <span className="text-sm font-medium tabular-nums text-foreground">
        {formatBdxMoney(amount)}
      </span>
    </div>
  )
}

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
    <div className="flex flex-col">
      <InsightsSection
        eyebrow="1 · Bordereaux"
        title="BDX submissions"
        description="Sales, claims and relets period extracts — open a card to inspect rows, then download CSV."
        badge={{ icon: FileSpreadsheet, label: "Extracts" }}
        showDivider={false}
      >
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadAll}
            className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
          >
            <Download className="size-3.5" />
            Download all
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {BDX_SUBMISSIONS.map((item) => {
            const active = tab === item.kind
            return (
              <button
                key={item.kind}
                type="button"
                onClick={() => setTab(item.kind)}
                className={cn(
                  PANEL,
                  "flex flex-col gap-3 p-5 text-left transition-colors",
                  active
                    ? "border-primary/40 bg-primary/[0.03] ring-1 ring-primary/20"
                    : "hover:bg-muted/30"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                      item.status === "Accepted"
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                    )}
                  >
                    {item.status === "Accepted" ? (
                      <Check className="size-3" strokeWidth={2.5} />
                    ) : null}
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.periodLabel} · submitted {item.submittedAt}
                </p>
                <div className="mt-auto flex items-end justify-between gap-3 pt-1">
                  <p className="text-sm font-medium tabular-nums text-foreground">
                    {item.rowCount} rows
                  </p>
                  <MiniSpark values={item.spark} />
                </div>
              </button>
            )
          })}
        </div>
      </InsightsSection>

      <InsightsSection
        eyebrow="2 · Detail"
        title={`${activeMeta?.label ?? "Extract"} rows`}
        description="Filter by sales, claims, or relets and download the active extract as CSV."
        badge={{ icon: Table2, label: "Table" }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-fit flex-wrap gap-1 rounded-full bg-muted p-1">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                  tab === item.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Button type="button" size="sm" onClick={() => handleDownload(tab)}>
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

        <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
          {tab === "sales" ? <SalesTable /> : null}
          {tab === "claims" ? <ClaimsTable /> : null}
          {tab === "relets" ? <ReletsTable /> : null}
        </div>
      </InsightsSection>
    </div>
  )
}

function SalesTable() {
  const maxPremium = Math.max(...BDX_SALES_ROWS.map((row) => row.premium), 1)

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
            <TableCell className="px-3 py-2.5 font-mono text-xs font-medium text-primary">
              {row.bookingRef}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-sm">{row.property}</TableCell>
            <TableCell className="px-3 py-2.5">
              <span className="inline-flex rounded-md border border-border/70 bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground">
                {row.product}
              </span>
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <ChannelCell channel={row.channel} />
            </TableCell>
            <TableCell className="px-3 py-2.5 text-sm tabular-nums text-muted-foreground">
              {row.saleDate}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-right">
              <MoneyBarCell amount={row.premium} max={maxPremium} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ClaimsTable() {
  const maxAmount = Math.max(...BDX_CLAIMS_ROWS.map((row) => row.amount), 1)

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
            <TableCell className="px-3 py-2.5 font-mono text-xs font-medium text-primary">
              {row.claimRef}
            </TableCell>
            <TableCell className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
              {row.bookingRef}
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <span className="inline-flex rounded-md border border-border/70 bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground">
                {row.claimType}
              </span>
            </TableCell>
            <TableCell className="px-3 py-2.5 text-sm tabular-nums text-muted-foreground">
              {row.notifiedAt}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-sm text-muted-foreground">
              {row.status}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-right">
              <MoneyBarCell amount={row.amount} max={maxAmount} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ReletsTable() {
  const maxValue = Math.max(...BDX_RELETS_ROWS.map((row) => row.valueRecovered), 1)

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
            <TableCell className="px-3 py-2.5 font-mono text-xs font-medium text-primary">
              {row.cancelledRef}
            </TableCell>
            <TableCell className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
              {row.reletRef}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-sm">{row.property}</TableCell>
            <TableCell className="px-3 py-2.5">
              <ChannelCell channel={row.channel} />
            </TableCell>
            <TableCell className="px-3 py-2.5 text-sm tabular-nums text-muted-foreground">
              {row.reletDate}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-right">
              <MoneyBarCell amount={row.valueRecovered} max={maxValue} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
