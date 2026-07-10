import type { ReactNode } from "react"

import { DualDataWidget } from "@/components/dual-data-widget"
import { BreakdownDataWidget } from "@/components/widgets/breakdown-data-widget"
import { DataSnapshotWidget } from "@/components/widgets/data-snapshot-widget"
import { DataTableWidget } from "@/components/widgets/data-table-widget"
import { EventTimelineWidget } from "@/components/widgets/event-timeline-widget"
import { GraphWidget } from "@/components/widgets/graph-widget"
import { HeadlineDataWidget } from "@/components/widgets/headline-data-widget"
import { StackedDataWidget } from "@/components/widgets/stacked-data-widget"
import { PARTNER_BRANDING } from "@/lib/partner-branding"

const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"

const PANEL =
  "flex min-w-0 flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-5 shadow-xs"

const GRAPH_DATA = [
  { month: "Jan", cal: 42, ddl: 28, market: 35 },
  { month: "Feb", cal: 48, ddl: 30, market: 36 },
  { month: "Mar", cal: 55, ddl: 33, market: 38 },
  { month: "Apr", cal: 61, ddl: 36, market: 40 },
  { month: "May", cal: 68, ddl: 39, market: 42 },
  { month: "Jun", cal: 74, ddl: 44, market: 45 },
]

function WidgetSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className={PANEL}>
      <div>
        <p className={MONO_LABEL}>Widget</p>
        <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

export function AdminComponentsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className={MONO_LABEL}>Administration</p>
        <h1 className="mt-1 text-[22px] font-semibold tracking-tight">Components</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Reusable data widgets for {PARTNER_BRANDING.shortName} partner insights. Use these
          building blocks across Insights, Reporting, and property views.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <WidgetSection
          title="Headline data"
          description="A single important value with a title and optional clarification label."
        >
          <HeadlineDataWidget
            className="h-auto"
            title="Total bookings"
            value="10,000"
            label="across all partners"
            helpText="Total bookings across the selected partners and brands for the current period."
          />
        </WidgetSection>

        <WidgetSection
          title="Stacked data"
          description="Two stacked data points with a primary title — useful for date ranges and paired metrics."
        >
          <StackedDataWidget
            title="Booking window"
            helpText="Shows the selected reporting period against the comparison period."
            rows={[
              { label: "Current period", value: "1 Jan – 30 Jun 2026" },
              { label: "Comparison period", value: "1 Jan – 30 Jun 2025" },
            ]}
          />
        </WidgetSection>

        <WidgetSection
          title="Dual data"
          description="Two results for the same query side by side, each with a clarification label."
        >
          <DualDataWidget
            className="h-auto"
            primaryTitle="Product attachment"
            helpText="CAL and DDL attachment for the current filter set."
            datasetA={{
              title: "Flexible cancellation",
              value: "14%",
              clarification: "of offered bookings",
            }}
            datasetB={{
              title: "Damage deposit waiver",
              value: "9%",
              clarification: "of offered bookings",
            }}
          />
        </WidgetSection>
      </div>

      <WidgetSection
        title="Data snapshot"
        description="A compact snapshot of a data segment with an optional link to the full overview."
      >
        <div className="max-w-xl">
          <DataSnapshotWidget
            title="County snapshot"
            overviewHref="#overview"
            overviewLabel="Link to overview"
            rows={[
              { label: "Bookings", value: "45,959" },
              { label: "Revenue", value: "£88k" },
              { label: "ABV", value: "£933" },
              { label: "CAL take-up", value: "3.0%" },
              { label: "With CAL", value: "1,379" },
              { label: "Cancel rate", value: "7.0%" },
            ]}
          />
        </div>
      </WidgetSection>

      <WidgetSection
        title="Breakdown data"
        description="A primary value with two supplementary breakdown figures."
      >
        <div className="max-w-2xl">
          <BreakdownDataWidget
            title="Partner revenue"
            primaryValue="£1.8m"
            primaryLabel="net of premium + IPT"
            subdataA={{
              label: "Margin (ex. VAT)",
              value: "£900k",
              helpText: "Partner margin excluding VAT.",
            }}
            subdataB={{
              label: "Website conversion",
              value: "£800k",
            }}
          />
        </div>
      </WidgetSection>

      <WidgetSection
        title="Graph"
        description="Line or bar trends with toggleable data layers."
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <GraphWidget
            title="Attachment trend"
            explanation="Monthly CAL and DDL attachment versus market."
            xAxisKey="month"
            data={GRAPH_DATA}
            layers={[
              { id: "cal", label: "CAL", color: "#006BFF", dataKey: "cal" },
              { id: "ddl", label: "DDL", color: "#F59E0B", dataKey: "ddl" },
              { id: "market", label: "Market", color: "#94A3B8", dataKey: "market" },
            ]}
          />
          <GraphWidget
            title="Volume by month"
            explanation="Bar view of the same series for denser comparisons."
            variant="bar"
            xAxisKey="month"
            data={GRAPH_DATA}
            layers={[
              { id: "cal", label: "CAL", color: "#006BFF", dataKey: "cal" },
              { id: "ddl", label: "DDL", color: "#F59E0B", dataKey: "ddl" },
            ]}
          />
        </div>
      </WidgetSection>

      <WidgetSection
        title="Data table"
        description="Tabular query results with column headings and optional detail links."
      >
        <DataTableWidget
          columns={[
            { key: "brand", heading: "Brand" },
            { key: "bookings", heading: "Bookings", align: "right" },
            { key: "attachment", heading: "Attachment", align: "right" },
            { key: "margin", heading: "Margin", align: "right" },
            { key: "cancel", heading: "Cancel rate", align: "right" },
          ]}
          rows={[
            {
              id: "manor",
              primary: "Manor Cottages",
              cells: {
                bookings: "289k",
                attachment: "14.4%",
                margin: "£378k",
                cancel: "7.1%",
              },
              href: "#manor",
            },
            {
              id: "lake",
              primary: "Lake Lovers",
              cells: {
                bookings: "179k",
                attachment: "13.2%",
                margin: "£234k",
                cancel: "8.0%",
              },
              href: "#lake",
            },
            {
              id: "dream",
              primary: "Dream Cottages",
              cells: {
                bookings: "221k",
                attachment: "14.2%",
                margin: "£288k",
                cancel: "7.4%",
              },
              href: "#dream",
            },
          ]}
        />
      </WidgetSection>

      <WidgetSection
        title="Event timeline"
        description="Plot bookings along a timeline, stacking overlapping stays onto separate lanes."
      >
        <EventTimelineWidget
          title="Property bookings"
          explanation="Overlapping stays are separated onto additional lanes."
          days={30}
          axisLabels={["1", "5", "10", "15", "20", "25", "30"]}
          events={[
            { id: "b1", label: "Booking A", start: 1, end: 7, tone: "primary" },
            { id: "b2", label: "Booking B", start: 5, end: 12, tone: "accent" },
            { id: "b3", label: "Booking C", start: 14, end: 20, tone: "primary" },
            { id: "b4", label: "Booking D", start: 18, end: 26, tone: "muted" },
            { id: "b5", label: "Booking E", start: 22, end: 28, tone: "accent" },
          ]}
        />
      </WidgetSection>
    </div>
  )
}
