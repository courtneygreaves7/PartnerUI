import type { ReactNode } from "react"

import { ChannelGridTable } from "@/components/sykes/channel-grid-table"
import { PhasingChartsVisual } from "@/components/sykes/phasing-charts-visual"
import {
  PropositionVisualSection,
  RevenueOverviewVisual,
  TotalProductsVisual,
} from "@/components/sykes/revenue-overview-visual"
import {
  CollapsibleDataTable,
  KpiTile,
  ProgressMetricRow,
  VisualCard,
} from "@/components/sykes/sykes-visual-primitives"
import { SykesSectionBanner } from "@/components/sykes/sykes-section-banner"
import type { ActiveFilters } from "@/lib/chart-data"
import {
  CONTRIBUTION_TO_PERFORMANCE_GRID,
  DAMAGE_DEPOSIT_WAIVER_GRID,
  DASHBOARD_FOOTNOTES,
  DEPARTURES_BY_DATE_DATA,
  EVENTS_BY_DATE_DECLINING_DATA,
  EVENTS_BY_DATE_SUMMER_DATA,
  FINANCIALS_GRID,
  FLEXIBLE_CANCELLATION_GRID,
  PERFORMANCE_METRICS_GRID,
  PHASING_BANNER_TITLE,
  PROPOSITION_NOTES,
} from "@/lib/sykes-dashboard-data"
import { cn } from "@/lib/utils"

type SykesPartnerDashboardPageProps = {
  filters: ActiveFilters
}

function DashboardSection({
  id,
  title,
  note,
  children,
  className,
}: {
  id: string
  title: string
  note?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 space-y-5", className)}>
      <div className="space-y-1">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      </div>
      {children}
    </section>
  )
}

function SectionDivider() {
  return <div aria-hidden className="my-10 h-px w-full bg-border/60" />
}

function PerformanceMetricsVisual() {
  const categories = [
    { title: "Cancellation & relet", rows: PERFORMANCE_METRICS_GRID.slice(0, 8) },
    { title: "Booking behaviour", rows: PERFORMANCE_METRICS_GRID.slice(8, 14) },
    { title: "Lead times", rows: PERFORMANCE_METRICS_GRID.slice(14) },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {categories.map((category) => (
          <VisualCard key={category.title} title={category.title} subtitle="By channel · A–D">
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {category.rows.map((row, index) => (
                <ProgressMetricRow
                  key={row.label}
                  label={row.label}
                  value={row.website.value}
                  percent={[78, 65, 52, 88, 71, 60, 55, 48, 82, 74, 68, 59, 76, 63, 58, 50, 72, 66][index] ?? 55}
                  tone={index % 3 === 0 ? "brand" : index % 3 === 1 ? "accent" : "muted"}
                />
              ))}
            </div>
          </VisualCard>
        ))}
      </div>
      <CollapsibleDataTable title="View full performance metrics table">
        <ChannelGridTable rows={PERFORMANCE_METRICS_GRID} className="border-0 shadow-none" />
      </CollapsibleDataTable>
    </div>
  )
}

function FinancialsVisual() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FINANCIALS_GRID.map((row, index) => (
          <KpiTile
            key={row.label}
            label={row.label}
            value={row.website.value}
            hint={`Direct ${row.direct.value} · Total ${row.total.value}`}
            className={index === 0 ? "border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/5" : undefined}
          />
        ))}
      </div>
      <CollapsibleDataTable title="View full financials breakdown by channel">
        <ChannelGridTable rows={FINANCIALS_GRID} className="border-0 shadow-none" />
      </CollapsibleDataTable>
    </div>
  )
}

export function SykesPartnerDashboardPage({ filters }: SykesPartnerDashboardPageProps) {
  return (
    <div className="space-y-0">
      <DashboardSection id="section-revenue-overview" title="Partner performance overview">
        <p className="text-xs text-muted-foreground">
          {filters.month} {filters.year}
          {filters.dateRange === "year-to-month-end" ? " · year to month-end" : ""}
        </p>
        <RevenueOverviewVisual />
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3">
          <ol className="list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
            {DASHBOARD_FOOTNOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ol>
        </div>
      </DashboardSection>

      <SectionDivider />

      <DashboardSection
        id="section-total-products"
        title="Total products"
        note={PROPOSITION_NOTES.layout}
      >
        <TotalProductsVisual />
      </DashboardSection>

      <SectionDivider />

      <DashboardSection
        id="section-flexible-cancellation"
        title="Flexible cancellation"
        note={PROPOSITION_NOTES.flexibleCancellation}
      >
        <PropositionVisualSection
          title="Flexible cancellation performance"
          subtitle="Volume, attachment and margin by channel"
          accentClass="border-violet-100 bg-gradient-to-br from-violet-50/50 to-card"
          channelBars={[
            { label: "Website", value: "A" },
            { label: "App", value: "B" },
            { label: "Offline", value: "C" },
            { label: "OTA", value: "D" },
          ]}
          rateCards={[
            { label: "FC guest price avg", value: "10%", tone: "bg-rose-50/80" },
            { label: "Insurance premium rate avg", value: "6.35%", tone: "bg-rose-50/80" },
            { label: "Out of test conversion", value: "1.0%", tone: "bg-orange-50/80" },
            { label: "Conversion benefit", value: "1% = £900,000", tone: "bg-orange-50/80" },
          ]}
          table={
            <CollapsibleDataTable title="View full flexible cancellation table">
              <ChannelGridTable rows={FLEXIBLE_CANCELLATION_GRID} className="border-0 shadow-none" />
            </CollapsibleDataTable>
          }
        />
      </DashboardSection>

      <SectionDivider />

      <DashboardSection id="section-damage-deposit-waiver" title="Damage deposit waiver">
        <PropositionVisualSection
          title="Damage deposit waiver performance"
          subtitle="Volume, attachment and margin by channel"
          accentClass="border-sky-100 bg-gradient-to-br from-sky-50/50 to-card"
          channelBars={[
            { label: "Website", value: "A" },
            { label: "App", value: "B" },
            { label: "Offline", value: "C" },
            { label: "OTA", value: "D" },
          ]}
          rateCards={[
            { label: "DDL guest price avg", value: "£30", tone: "bg-rose-50/80" },
            { label: "Insurance premium rate avg", value: "2.12%", tone: "bg-rose-50/80" },
            { label: "Out of test conversion", value: "—", tone: "bg-orange-50/80" },
            { label: "App / Offline / OTA", value: "N/A", tone: "bg-muted/30" },
          ]}
          table={
            <CollapsibleDataTable title="View full damage deposit waiver table">
              <ChannelGridTable rows={DAMAGE_DEPOSIT_WAIVER_GRID} className="border-0 shadow-none" />
            </CollapsibleDataTable>
          }
        />
      </DashboardSection>

      <SectionDivider />

      <DashboardSection id="section-contribution" title="Contribution to performance">
        <div className="grid gap-4 md:grid-cols-2">
          <KpiTile label="Cancellation volume" value="A" hint="Website · expand for all channels" />
          <KpiTile label="Cancellation avg %" value="%" hint="Across all channels" />
        </div>
        <CollapsibleDataTable title="View contribution breakdown by channel">
          <ChannelGridTable rows={CONTRIBUTION_TO_PERFORMANCE_GRID} className="border-0 shadow-none" />
        </CollapsibleDataTable>
      </DashboardSection>

      <SectionDivider />

      <DashboardSection id="section-performance-metrics" title="Performance metrics by channel">
        <PerformanceMetricsVisual />
      </DashboardSection>

      <SectionDivider />

      <DashboardSection id="section-financials" title="Financials">
        <SykesSectionBanner title="FINANCIALS [Consider split into proposition]" className="mb-2" />
        <FinancialsVisual />
      </DashboardSection>

      <SectionDivider />

      <DashboardSection id="section-phasing" title="Phasing & event trends">
        <SykesSectionBanner title={PHASING_BANNER_TITLE} className="mb-2" />
        <PhasingChartsVisual
          eventsSummer={EVENTS_BY_DATE_SUMMER_DATA}
          eventsDeclining={EVENTS_BY_DATE_DECLINING_DATA}
          departures={DEPARTURES_BY_DATE_DATA}
        />
      </DashboardSection>
    </div>
  )
}
