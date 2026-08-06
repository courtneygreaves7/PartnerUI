import { useEffect, useRef } from "react"

import { FileText } from "lucide-react"

import { ChannelGridTable } from "@/components/sykes/channel-grid-table"
import { CollapsibleDataTable } from "@/components/sykes/sykes-visual-primitives"
import { CompareMetricSection } from "@/components/compare/compare-metric-section"
import { ReportSection } from "@/components/report-section"
import type { ReportingFilters } from "@/components/reporting-filter-sidebar"
import { PARTNER_BRANDING } from "@/lib/partner-branding"
import {
  buildReportingCompareSections,
  formatReportingContext,
  getBrandInsightSnapshot,
  REPORTING_BRAND_LABELS,
  type BrandInsightSnapshot,
} from "@/lib/reporting-data"
import { cn } from "@/lib/utils"

type ReportingPageProps = {
  filters: ReportingFilters
  hasRun: boolean
  /** Increments each time Run report is clicked — scrolls to the report. */
  runId?: number
}

const PANEL = "rounded-2xl border border-border/60 bg-card p-5 shadow-xs"
const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"

function sectionSlug(title: string) {
  return `report-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`
}

function BrandSummaryCards({ snapshot }: { snapshot: BrandInsightSnapshot }) {
  return (
    <div className="@container">
      <div className="grid gap-3 @min-[40rem]:grid-cols-2 @min-[64rem]:grid-cols-5">
        {snapshot.summary.map((item) => (
          <div key={item.label} className={cn(PANEL, "flex flex-col gap-2 p-4")}>
            <p className="text-[12px] leading-snug text-muted-foreground">{item.label}</p>
            <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BrandChannelBreakdown({
  snapshot,
  accent,
}: {
  snapshot: BrandInsightSnapshot
  accent: "primary" | "comparison"
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "h-8 w-1 shrink-0 rounded-full",
            accent === "primary" ? "bg-compare-primary" : "bg-compare-comparison"
          )}
        />
        <div>
          <p className={MONO_LABEL}>Brand</p>
          <p className="text-sm font-semibold text-foreground">{snapshot.brandLabel}</p>
        </div>
      </div>

      <ReportSection title="Flexible Cancellation" exportSlug={sectionSlug(`${snapshot.brandId}-cal`)}>
        <CollapsibleDataTable title="Flexible Cancellation channel breakdown" defaultOpen>
          <ChannelGridTable rows={snapshot.calGrid} className="border-0 shadow-none" />
        </CollapsibleDataTable>
      </ReportSection>

      <ReportSection title="Damage Deposit Waiver" exportSlug={sectionSlug(`${snapshot.brandId}-ddl`)}>
        <CollapsibleDataTable title="Damage Deposit Waiver channel breakdown" defaultOpen={false}>
          <ChannelGridTable rows={snapshot.ddlGrid} className="border-0 shadow-none" />
        </CollapsibleDataTable>
      </ReportSection>

      <ReportSection
        title="Contribution to performance"
        exportSlug={sectionSlug(`${snapshot.brandId}-contribution`)}
      >
        <CollapsibleDataTable title="Cancellations, relets & lead times" defaultOpen={false}>
          <ChannelGridTable rows={snapshot.contributionGrid} className="border-0 shadow-none" />
        </CollapsibleDataTable>
      </ReportSection>
    </div>
  )
}

function CompareReport({ filters }: { filters: ReportingFilters }) {
  const sections = buildReportingCompareSections(filters)
  const brandA = getBrandInsightSnapshot(filters.brandA, filters.period)
  const brandB = getBrandInsightSnapshot(filters.brandB, filters.period)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4">
        <div className="flex min-w-0 flex-1 items-stretch gap-3">
          <span className="w-1 shrink-0 rounded-full bg-compare-primary" />
          <div className="min-w-0">
            <p className={MONO_LABEL}>Brand A</p>
            <p className="truncate text-sm font-medium">
              {REPORTING_BRAND_LABELS[filters.brandA] ?? filters.brandA}
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          vs
        </span>

        <div className="flex min-w-0 flex-1 items-stretch justify-end gap-3">
          <div className="min-w-0 text-right">
            <p className={MONO_LABEL}>Brand B</p>
            <p className="truncate text-sm font-medium">
              {REPORTING_BRAND_LABELS[filters.brandB] ?? filters.brandB}
            </p>
          </div>
          <span className="w-1 shrink-0 rounded-full bg-compare-comparison" />
        </div>
      </div>

      <div className="space-y-5">
        {sections.map((section) => (
          <CompareMetricSection
            key={section.title}
            section={section}
            exportSlug={sectionSlug(section.title)}
          />
        ))}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <BrandChannelBreakdown snapshot={brandA} accent="primary" />
        <BrandChannelBreakdown snapshot={brandB} accent="comparison" />
      </div>
    </div>
  )
}

function SingleBrandReport({ filters }: { filters: ReportingFilters }) {
  const snapshot = getBrandInsightSnapshot(filters.brandA, filters.period)

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card px-5 py-4">
        <p className={MONO_LABEL}>Brand</p>
        <p className="mt-1 text-sm font-medium text-foreground">{snapshot.brandLabel}</p>
      </div>

      <BrandSummaryCards snapshot={snapshot} />

      <div className="space-y-5">
        <ReportSection title="Flexible Cancellation" exportSlug={sectionSlug("cal")}>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className={cn(PANEL, "p-4")}>
              <p className="text-xs text-muted-foreground">Flexible Cancellation bookings</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {snapshot.calGrid[0]?.total.value}
              </p>
            </div>
            <div className={cn(PANEL, "p-4")}>
              <p className="text-xs text-muted-foreground">Flexible Cancellation attachment</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {snapshot.calGrid[1]?.total.value}
              </p>
            </div>
            <div className={cn(PANEL, "p-4")}>
              <p className="text-xs text-muted-foreground">Flexible Cancellation partner margin</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {snapshot.calGrid[4]?.total.value}
              </p>
            </div>
          </div>
          <CollapsibleDataTable title="Flexible Cancellation channel breakdown" defaultOpen>
            <ChannelGridTable rows={snapshot.calGrid} className="border-0 shadow-none" />
          </CollapsibleDataTable>
        </ReportSection>

        <ReportSection title="Damage Deposit Waiver" exportSlug={sectionSlug("ddl")}>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className={cn(PANEL, "p-4")}>
              <p className="text-xs text-muted-foreground">Damage Deposit Waiver bookings</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {snapshot.ddlGrid[0]?.total.value}
              </p>
            </div>
            <div className={cn(PANEL, "p-4")}>
              <p className="text-xs text-muted-foreground">Damage Deposit Waiver attachment</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {snapshot.ddlGrid[1]?.total.value}
              </p>
            </div>
            <div className={cn(PANEL, "p-4")}>
              <p className="text-xs text-muted-foreground">Damage Deposit Waiver partner margin</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {snapshot.ddlGrid[4]?.total.value}
              </p>
            </div>
          </div>
          <CollapsibleDataTable title="Damage Deposit Waiver channel breakdown" defaultOpen>
            <ChannelGridTable rows={snapshot.ddlGrid} className="border-0 shadow-none" />
          </CollapsibleDataTable>
        </ReportSection>

        <ReportSection title="Contribution to performance" exportSlug={sectionSlug("contribution")}>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className={cn(PANEL, "p-4")}>
              <p className="text-xs text-muted-foreground">Cancellation volume</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {snapshot.contributionGrid[0]?.total.value}
              </p>
            </div>
            <div className={cn(PANEL, "p-4")}>
              <p className="text-xs text-muted-foreground">Cancellation avg %</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {snapshot.contributionGrid[1]?.total.value}
              </p>
            </div>
            <div className={cn(PANEL, "p-4")}>
              <p className="text-xs text-muted-foreground">Relet volume</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {snapshot.contributionGrid[4]?.total.value}
              </p>
            </div>
            <div className={cn(PANEL, "p-4")}>
              <p className="text-xs text-muted-foreground">Avg holiday value</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {
                  snapshot.contributionGrid.find(
                    (row) => row.label === "Average Holiday Value Per Booking £"
                  )?.total.value
                }
              </p>
            </div>
          </div>
          <CollapsibleDataTable title="Cancellations, relets & lead times" defaultOpen>
            <ChannelGridTable rows={snapshot.contributionGrid} className="border-0 shadow-none" />
          </CollapsibleDataTable>
        </ReportSection>
      </div>
    </div>
  )
}

export function ReportingPage({ filters, hasRun, runId = 0 }: ReportingPageProps) {
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasRun || runId < 1) return
    const timer = window.setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
    return () => window.clearTimeout(timer)
  }, [hasRun, runId])

  return (
    <div className="space-y-6">
      <div
        ref={reportRef}
        id="reporting-brand-performance"
        className="scroll-mt-6 space-y-6"
      >
        <div className="flex flex-col gap-1">
          <p className={MONO_LABEL}>Insights report</p>
          <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
            Brand performance
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasRun
              ? formatReportingContext(filters)
              : `Build and run brand comparison reports for ${PARTNER_BRANDING.name}.`}
          </p>
        </div>

        {!hasRun ? (
          <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-24 text-center">
            <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
              <FileText className="size-4" />
            </span>
            <p className="mt-4 text-sm font-semibold text-foreground">No report yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Choose a period and brands in the filter bar, then run a report to compare Insights
              metrics side by side.
            </p>
          </div>
        ) : filters.compareEnabled ? (
          <CompareReport filters={filters} />
        ) : (
          <SingleBrandReport filters={filters} />
        )}
      </div>
    </div>
  )
}
