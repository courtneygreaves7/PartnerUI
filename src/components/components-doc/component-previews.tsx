import { useRef, useState } from "react"

import { AverageBookingValueBreakdown } from "@/components/average-booking-value-breakdown"
import { AverageBookingValueSnapshot } from "@/components/average-booking-value-snapshot"
import { BookingsSnapshot } from "@/components/bookings-snapshot"
import { PolicyRatesTable } from "@/components/booking-engine/policy-rates-table"
import { PartnerCard } from "@/components/booking-engine/partner-card"
import { PartnerVolumeWidget } from "@/components/booking-engine/partner-volume-widget"
import { PropertiesTable } from "@/components/booking-engine/properties-table"
import { PropertyBookingsTable } from "@/components/booking-engine/property-bookings-table"
import { CalFinancials } from "@/components/cal-financials"
import { AbvPerDayChart } from "@/components/charts/abv-per-day-chart"
import { BookingsMadePerDayChart } from "@/components/charts/bookings-made-per-day-chart"
import { BookingsVsStaysChart } from "@/components/charts/bookings-vs-stays-chart"
import { CalDdlTakeupChart } from "@/components/charts/cal-ddl-takeup-chart"
import { InteractiveChartLegend } from "@/components/charts/interactive-chart-legend"
import { LeadTimeChart } from "@/components/charts/lead-time-chart"
import { useHiddenChartSeries } from "@/components/charts/use-hidden-chart-series"
import { CompareFilterPanel } from "@/components/compare/compare-filter-panel"
import { CompareHeader } from "@/components/compare/compare-header"
import { CompareMetricSection } from "@/components/compare/compare-metric-section"
import { PreviewShell } from "@/components/components-doc/preview-shell"
import { DashboardFilterBar } from "@/components/dashboard-filter-bar"
import { DualDataWidget } from "@/components/dual-data-widget"
import { ExportSnapshotButton } from "@/components/export-snapshot-button"
import { FilterSidebar } from "@/components/filter-sidebar"
import { LoginPage } from "@/components/login-page"
import { PartnerBreakdown } from "@/components/partner-breakdown"
import { ReportSection } from "@/components/report-section"
import { SectionNav } from "@/components/section-nav"
import { TimingBreakdown } from "@/components/timing-breakdown"
import { TimingSnapshot } from "@/components/timing-snapshot"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { BreakdownDataWidget } from "@/components/widgets/breakdown-data-widget"
import { DataSnapshotWidget } from "@/components/widgets/data-snapshot-widget"
import { DualDataListWidget } from "@/components/widgets/dual-data-list-widget"
import { GraphWidget } from "@/components/widgets/graph-widget"
import { HeadlineDataWidget } from "@/components/widgets/headline-data-widget"
import { MetricBenchmarkWidget } from "@/components/widgets/metric-benchmark-widget"
import { MetricFinancialTrendWidget } from "@/components/widgets/metric-financial-trend-widget"
import { MetricGaugeWidget } from "@/components/widgets/metric-gauge-widget"
import { MetricTrendWidget } from "@/components/widgets/metric-trend-widget"
import { ProductSplitWidget } from "@/components/widgets/product-split-widget"
import { WidgetHelpButton } from "@/components/widgets/widget-help-button"
import { BOOKING_ENGINE_PARTNERS } from "@/lib/booking-engine-data"
import { DEFAULT_FILTERS } from "@/lib/chart-data"
import {
  buildCompareSections,
  DEFAULT_COMPARE_SIDE,
  type CompareSideFilters,
} from "@/lib/compare-data"
import { FIGURE_24PX_CLASS } from "@/lib/figure-styles"
import { MOCK_PROPERTY } from "@/lib/property-data"
import { getPropertiesForPartner } from "@/lib/properties-list-data"

const graphSampleData = [
  { label: "Jan", layer1: 12, layer2: 8, layer3: 4 },
  { label: "Feb", layer1: 18, layer2: 11, layer3: 6 },
  { label: "Mar", layer1: 24, layer2: 15, layer3: 9 },
  { label: "Apr", layer1: 31, layer2: 19, layer3: 11 },
  { label: "May", layer1: 38, layer2: 23, layer3: 13 },
  { label: "Jun", layer1: 46, layer2: 28, layer3: 15 },
]

const snapshotRows = [
  { label: "Property type", value: "Cottage" },
  { label: "Bedrooms", value: "4" },
  { label: "Bathrooms", value: "2" },
  { label: "Max occupancy", value: "6 guests" },
]

function CompareFilterPanelPreview() {
  const [filters, setFilters] = useState<CompareSideFilters>(DEFAULT_COMPARE_SIDE)

  return (
    <CompareFilterPanel variant="primary" filters={filters} onChange={setFilters} />
  )
}

function CompareHeaderPreview() {
  const [primary, setPrimary] = useState<CompareSideFilters>(DEFAULT_COMPARE_SIDE)
  const [comparison, setComparison] = useState<CompareSideFilters>({
    ...DEFAULT_COMPARE_SIDE,
    partner: "partner-b",
  })

  return (
    <CompareHeader
      primaryDraft={primary}
      comparisonDraft={comparison}
      onPrimaryChange={setPrimary}
      onComparisonChange={setComparison}
      onRun={() => undefined}
    />
  )
}

function ChartLegendPreview() {
  const { hiddenKeys, toggleSeries } = useHiddenChartSeries(["made", "starting"])

  return (
    <InteractiveChartLegend
      payload={[
        { dataKey: "made", value: "Made", color: "#3b82f6", type: "line" },
        { dataKey: "starting", value: "Starting", color: "#a855f7", type: "line" },
      ]}
      hiddenKeys={hiddenKeys}
      onToggleSeries={toggleSeries}
    />
  )
}

function ExportSnapshotPreview() {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-sm font-medium">Sample export target</p>
        <ExportSnapshotButton getTarget={() => ref.current} exportSlug="preview" />
      </div>
      <div ref={ref} className="rounded-lg border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
        This panel would be captured as PNG.
      </div>
    </div>
  )
}

function ReportSectionPreview() {
  return (
    <ReportSection title="Bookings" exportSlug="bookings-preview" filters={DEFAULT_FILTERS}>
      <HeadlineDataWidget
        title="Total bookings"
        value="124,500"
        label="All selected partners and brands"
      />
    </ReportSection>
  )
}

export function ComponentPreview({ id }: { id: string }) {
  const filters = DEFAULT_FILTERS
  const partner = BOOKING_ENGINE_PARTNERS[0]
  const compareSection = buildCompareSections(DEFAULT_COMPARE_SIDE, {
    ...DEFAULT_COMPARE_SIDE,
    partner: "partner-b",
  })[0]

  switch (id) {
    case "headline-data-widget":
      return (
        <HeadlineDataWidget
          title="Total bookings"
          value="128,450"
          label="All selected partners and brands"
          helpText="Supporting context for this headline metric."
          valueClassName={FIGURE_24PX_CLASS}
        />
      )
    case "metric-trend-widget":
      return (
        <MetricTrendWidget
          title="Total bookings"
          value="124,500"
          trendLabel="+14.0%"
          trend="up"
          comparisonLabel="vs 109,200 prior period"
          chartData={[
            { label: "Jul", value: 15800 },
            { label: "Sep", value: 16600 },
            { label: "Nov", value: 17400 },
            { label: "Jan", value: 18300 },
            { label: "Mar", value: 19500 },
            { label: "May", value: 20750 },
          ]}
          scopeLabel="All selected partners and brands"
          rateLabel="~4,150 /day"
          helpText="Total bookings across selected partners and brands."
        />
      )
    case "metric-financial-trend-widget":
      return (
        <MetricFinancialTrendWidget
          title="Total payable"
          value="£214,500"
          trendLabel="+7.5%"
          trend="up"
          comparisonLabel="vs £199,500 prior period"
          chartData={[
            { label: "Jul", value: 27200 },
            { label: "Sep", value: 28600 },
            { label: "Nov", value: 30000 },
            { label: "Jan", value: 31500 },
            { label: "Mar", value: 33600 },
            { label: "May", value: 35750 },
          ]}
          breakdownRows={[
            { label: "Premium inc. IPT", value: "£328,400", sharePercent: 42 },
            { label: "GWP", value: "£306,000", sharePercent: 39 },
            { label: "PISL amount payable", value: "£154,600", sharePercent: 19 },
          ]}
          footerLabel="GBP · primary liability"
          helpText="Total CAL financial liability across selected partners."
        />
      )
    case "dual-data-widget":
      return (
        <DualDataWidget
          primaryTitle="Product split"
          datasetA={{ title: "CAL", value: "23,304", clarification: "3% take-up" }}
          datasetB={{ title: "DDL", value: "18,422", clarification: "2% take-up" }}
          helpText="Supporting context for this headline metric."
        />
      )
    case "product-split-widget":
      return (
        <ProductSplitWidget
          totalLabel="3,258 total"
          segmentA={{
            label: "CAL",
            value: "3,210",
            sharePercent: 98.5,
            takeUpLabel: "3.8% take-up",
            trend: "up",
          }}
          segmentB={{
            label: "DDL",
            value: "48",
            sharePercent: 1.5,
            takeUpLabel: "1.5% take-up",
            trend: "down",
          }}
          helpText="Bookings with CAL or DDL attached across selected partners."
          menuItems={[{ label: "Export data" }]}
        />
      )
    case "metric-gauge-widget":
      return (
        <MetricGaugeWidget
          title="CAL customer price"
          value="8.4%"
          gaugePercent={8.4}
          label="% of ABV inc. booking fee"
          helpText="CAL customer price as a share of average booking value including fees."
        />
      )
    case "metric-benchmark-widget":
      return (
        <MetricBenchmarkWidget
          title="ABV excl. booking fee"
          value="£742"
          comparisonLabel="CAL £890"
          benchmarkPercent={83}
          benchmarkLabel="83% of CAL benchmark"
          helpText="Average booking value excluding the booking fee vs CAL benchmark."
        />
      )
    case "dual-data-list-widget":
      return (
        <DualDataListWidget
          title="Engagement"
          rows={[
            { label: "Cancellation rate", value: "4.2%" },
            { label: "Repeat guests", value: "18%" },
          ]}
        />
      )
    case "breakdown-data-widget":
      return (
        <BreakdownDataWidget
          title="Total volume"
          primaryValue="94,200"
          primaryLabel="All partners"
          subdataA={{ label: "CAL attach", value: "12,480" }}
          subdataB={{ label: "DDL attach", value: "8,920" }}
        />
      )
    case "data-snapshot-widget":
      return <DataSnapshotWidget title="Overview" rows={snapshotRows} />
    case "graph-widget":
      return (
        <GraphWidget
          title="Daily trend"
          explanation="Multi-series line chart with toggleable layers"
          xAxisKey="label"
          layers={[
            { id: "l1", label: "Series A", color: "#2563eb", dataKey: "layer1" },
            { id: "l2", label: "Series B", color: "#dc2626", dataKey: "layer2" },
          ]}
          data={graphSampleData}
        />
      )
    case "widget-help-button":
      return (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">Hover the icon →</span>
          <WidgetHelpButton title="Example metric" helpText="Supporting context for this headline metric." />
        </div>
      )
    case "partner-volume-widget":
      return (
        <PartnerVolumeWidget
          volume={{
            datasetA: { title: "Sales", value: "42,310", clarification: "Total bookings" },
            datasetB: { title: "Properties", value: "8,420", clarification: "On platform" },
          }}
          productSplit={{
            datasetA: { title: "With CAL", value: "1,104", clarification: "2.6% of bookings" },
            datasetB: { title: "With DDL", value: "12", clarification: "0.0% of bookings" },
          }}
        />
      )
    case "report-section":
      return <ReportSectionPreview />
    case "export-snapshot-button":
      return <ExportSnapshotPreview />
    case "interactive-chart-legend":
      return <ChartLegendPreview />
    case "bookings-vs-stays-chart":
      return <BookingsVsStaysChart filters={filters} compact />
    case "abv-per-day-chart":
      return <AbvPerDayChart filters={filters} compact />
    case "lead-time-chart":
      return <LeadTimeChart filters={filters} compact />
    case "bookings-made-per-day-chart":
      return <BookingsMadePerDayChart filters={filters} compact />
    case "cal-ddl-takeup-chart":
      return <CalDdlTakeupChart filters={filters} compact />
    case "filter-sidebar":
      return (
        <PreviewShell className="h-[540px] w-full max-w-[300px] bg-background">
          <FilterSidebar filters={DEFAULT_FILTERS} onRun={() => undefined} />
        </PreviewShell>
      )
    case "dashboard-filter-bar":
      return (
        <PreviewShell className="h-[480px] w-full max-w-[240px] bg-background">
          <DashboardFilterBar filters={filters} onRun={() => undefined} />
        </PreviewShell>
      )
    case "bookings-snapshot":
      return <BookingsSnapshot filters={filters} />
    case "average-booking-value-snapshot":
      return <AverageBookingValueSnapshot filters={filters} />
    case "cal-financials":
      return <CalFinancials filters={filters} />
    case "timing-snapshot":
      return <TimingSnapshot filters={filters} />
    case "timing-breakdown":
      return <TimingBreakdown />
    case "partner-breakdown":
      return <PartnerBreakdown />
    case "average-booking-value-breakdown":
      return <AverageBookingValueBreakdown />
    case "section-nav":
      return (
        <PreviewShell className="max-w-xs bg-background p-4">
          <SectionNav />
        </PreviewShell>
      )
    case "compare-filter-panel":
      return (
        <PreviewShell className="max-w-md bg-background">
          <CompareFilterPanelPreview />
        </PreviewShell>
      )
    case "compare-header":
      return (
        <PreviewShell className="bg-background p-4">
          <CompareHeaderPreview />
        </PreviewShell>
      )
    case "compare-metric-section":
      return compareSection ? (
        <CompareMetricSection
          section={compareSection}
          exportSlug="compare-bookings"
          filters={filters}
        />
      ) : null
    case "partner-card":
      return (
        <PartnerCard
          partner={partner}
          expanded
          onToggle={() => undefined}
          onViewProperty={() => undefined}
        />
      )
    case "policy-rates-table":
      return (
        <PolicyRatesTable
          policies={partner.policies.slice(0, 4)}
          selectedBrandId={partner.brands[0]?.id ?? null}
        />
      )
    case "properties-table":
      return (
        <PropertiesTable
          properties={getPropertiesForPartner("partner-a").slice(0, 4)}
          onViewProperty={() => undefined}
        />
      )
    case "property-bookings-table":
      return <PropertyBookingsTable bookings={MOCK_PROPERTY.bookings.slice(0, 5)} />
    case "login-page":
      return (
        <PreviewShell className="relative h-[420px] bg-background">
          <div className="origin-top scale-[0.72]">
            <LoginPage onLogin={() => undefined} />
          </div>
        </PreviewShell>
      )
    case "ui-button":
      return (
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
        </div>
      )
    case "ui-card":
      return (
        <Card className="max-w-sm">
          <CardHeader>
            <h3 className="text-sm font-semibold">Card title</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Card content area for widgets and forms.</p>
          </CardContent>
        </Card>
      )
    case "ui-select":
      return (
        <Field className="max-w-xs">
          <Label htmlFor="preview-select">Partner</Label>
          <Select defaultValue="all-partners">
            <SelectTrigger id="preview-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-partners">All partners</SelectItem>
              <SelectItem value="partner-a">Partner Alpha</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      )
    case "ui-table":
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead className="text-right">Bookings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Partner Alpha</TableCell>
              <TableCell className="text-right tabular-nums">42,310</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Partner Beta</TableCell>
              <TableCell className="text-right tabular-nums">38,750</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
    case "ui-tabs":
      return (
        <Tabs defaultValue="bookings" className="max-w-md">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="bookings" className="text-sm text-muted-foreground">
            Bookings tab content
          </TabsContent>
        </Tabs>
      )
    case "ui-input":
      return (
        <Field className="max-w-xs">
          <Label htmlFor="preview-email">Email</Label>
          <Input id="preview-email" type="email" placeholder="you@company.com" />
        </Field>
      )
    case "ui-label":
      return (
        <Field className="max-w-xs">
          <Label htmlFor="preview-label">Partner</Label>
          <Input id="preview-label" readOnly value="All partners" />
        </Field>
      )
    case "ui-tooltip":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              Hover me
            </Button>
          </TooltipTrigger>
          <TooltipContent>Tooltip content appears here</TooltipContent>
        </Tooltip>
      )
    case "ui-breadcrumb":
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Policy admin system</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Properties</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    case "ui-separator":
      return (
        <div className="max-w-xs space-y-4">
          <p className="text-sm">Content above</p>
          <Separator />
          <p className="text-sm text-muted-foreground">Content below</p>
        </div>
      )
    case "ui-dropdown-menu":
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>See App header user menu for full DropdownMenu composition.</span>
        </div>
      )
    default:
      return (
        <p className="text-sm text-muted-foreground">
          Preview not yet configured for this component.
        </p>
      )
  }
}

export function getPreviewLayout(id: string) {
  const wide = [
    "graph-widget",
    "bookings-snapshot",
    "average-booking-value-snapshot",
    "cal-financials",
    "timing-snapshot",
    "partner-card",
    "compare-header",
    "compare-metric-section",
    "bookings-vs-stays-chart",
    "abv-per-day-chart",
    "lead-time-chart",
    "cal-ddl-takeup-chart",
    "login-page",
  ]

  const inset = [
    "headline-data-widget",
    "metric-trend-widget",
    "metric-financial-trend-widget",
    "dual-data-widget",
    "product-split-widget",
    "metric-gauge-widget",
    "metric-benchmark-widget",
    "breakdown-data-widget",
    "data-snapshot-widget",
    "dual-data-list-widget",
    "partner-volume-widget",
  ]

  return { wide: wide.includes(id), inset: inset.includes(id) }
}
