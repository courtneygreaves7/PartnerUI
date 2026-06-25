import type { ComponentCatalogEntry, ComponentCodeSnippet } from "@/lib/components-catalog"

const metricGridLayout = `import { metricCardGridClass } from "@/lib/card-layout"
import { cn } from "@/lib/utils"

<div className={cn(metricCardGridClass, "grid-cols-1 @4xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)]")}>
  <HeadlineDataWidget ... />
  <DualDataWidget ... />
</div>`

const figureTokens = `import { FIGURE_24PX_CLASS, FIGURE_20PX_CLASS } from "@/lib/figure-styles"

// Default card figures (24px)
valueClassName={FIGURE_24PX_CLASS}

// Compact property / insights tabs (20px)
valueClassName={FIGURE_20PX_CLASS}`

export const componentCodeSnippets: Record<string, ComponentCodeSnippet[]> = {
  "headline-data-widget": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Card root
"@container flex h-full min-w-0 flex-col bg-card shadow-xs"

// Title
"text-sm font-semibold text-muted-foreground"

// Value (default)
"font-bold tracking-tight tabular-nums text-foreground"
// + FIGURE_24PX_CLASS → text-[24px] leading-none

// Label
"text-xs italic text-muted-foreground @sm:text-sm"`,
    },
    {
      id: "layout",
      label: "Layout",
      code: metricGridLayout,
    },
    {
      id: "tokens",
      label: "Tokens",
      code: figureTokens,
    },
  ],
  "dual-data-widget": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Card root — same as HeadlineDataWidget
"@container flex h-full min-w-0 flex-col bg-card shadow-xs"

// Column title
"truncate text-sm font-semibold text-muted-foreground"

// Value
"mt-2 font-bold tracking-tight tabular-nums text-foreground"

// Divider
"w-px shrink-0 self-stretch bg-border"

// Clarification
"mt-1.5 truncate text-xs italic text-muted-foreground @sm:text-sm"`,
    },
    {
      id: "layout",
      label: "Layout",
      code: metricGridLayout,
    },
    {
      id: "tokens",
      label: "Tokens",
      code: figureTokens,
    },
  ],
  "product-split-widget": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Card root
"@container flex h-full min-w-0 flex-col bg-card shadow-xs"

// Total badge
"rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"

// Share bar track
"flex h-2 w-full overflow-hidden rounded-full bg-muted"

// Segment detail panel
"overflow-hidden rounded-lg border border-border"
"grid min-w-0 grid-cols-2 divide-x divide-border"

// Take-up badge
"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
"bg-muted text-muted-foreground"`,
    },
    {
      id: "tokens",
      label: "Tokens",
      code: `import { FIGURE_24PX_CLASS } from "@/lib/figure-styles"

// Share bar: bg-foreground + bg-muted-foreground/50 on bg-muted track
// Legend dots and take-up badges use muted-foreground tones
// Segment values use FIGURE_24PX_CLASS`,
    },
  ],
  "metric-financial-trend-widget": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Segmented breakdown bar
"flex h-2 w-full overflow-hidden rounded-full bg-muted"
// Segments: bg-foreground, bg-muted-foreground/60, bg-muted-foreground/30

// Breakdown row
"flex items-center justify-between gap-3"
// Dot + label / value

// Footer
"flex items-center gap-1.5 border-t border-border pt-2 text-xs text-muted-foreground"`,
    },
    {
      id: "tokens",
      label: "Tokens",
      code: `import { buildCalFinBreakdown, buildFinancialTrendChart, deriveFinancialTrendMeta } from "@/lib/chart-data"
import { METRIC_WIDGET_STACK_GAP_CLASS } from "@/lib/figure-styles"`,
    },
  ],
  "metric-trend-widget": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Value + trend badge row
"flex flex-wrap items-baseline gap-x-2 gap-y-1"

// Trend badge
"inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"

// Sparkline area
stroke="var(--foreground)" fill with foreground gradient at 12% opacity

// Footer
"flex items-center justify-between gap-2 border-t border-border pt-2"`,
    },
    {
      id: "tokens",
      label: "Tokens",
      code: `import { FIGURE_24PX_CLASS, METRIC_WIDGET_STACK_GAP_CLASS } from "@/lib/figure-styles"
import { buildBookingTrendChart, deriveBookingTrendMeta } from "@/lib/chart-data"`,
    },
  ],
  "metric-benchmark-widget": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Value + CAL on one row
"flex flex-wrap items-baseline gap-2"
// Vertically centred in card body
"flex min-h-0 flex-1 items-center"
// + METRIC_WIDGET_STACK_GAP_CLASS → gap-2 (8px)
"flex h-2 w-full overflow-hidden rounded-full bg-muted"

// Benchmark bar fill
"h-full bg-foreground transition-[width]"

// Comparison row
"flex items-center gap-1 text-xs text-muted-foreground"`,
    },
    {
      id: "tokens",
      label: "Tokens",
      code: `import { FIGURE_24PX_CLASS, METRIC_WIDGET_STACK_GAP_CLASS } from "@/lib/figure-styles"

// Values use FIGURE_24PX_CLASS
// Value + CAL group uses METRIC_WIDGET_STACK_GAP_CLASS (8px)
// Bar fill uses bg-foreground on bg-muted track`,
    },
  ],
  "metric-gauge-widget": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Card root — same as HeadlineDataWidget
"@container flex h-full min-w-0 flex-col bg-card shadow-xs"

// Gauge track (SVG)
"text-muted"

// Gauge fill (SVG)
"text-foreground"

// Footer label
"text-xs leading-snug text-muted-foreground"`,
    },
    {
      id: "tokens",
      label: "Tokens",
      code: `import { FIGURE_24PX_CLASS } from "@/lib/figure-styles"

// Values use FIGURE_24PX_CLASS
// gaugePercent drives the semi-circular arc (0–100)`,
    },
  ],
  "dual-data-list-widget": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Row
"flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0"

// Label
"text-sm text-muted-foreground"

// Value
"text-sm font-bold tabular-nums text-foreground"`,
    },
  ],
  "breakdown-data-widget": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Grid layout
"grid gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"

// Primary value
"font-bold tracking-tight tabular-nums text-foreground"
// + FIGURE_24PX_CLASS

// Sub-metric
"text-lg font-bold tabular-nums text-foreground"`,
    },
  ],
  "data-snapshot-widget": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Row
"flex items-center justify-between gap-4 border-t border-border"

// Label / value (default)
"text-sm text-muted-foreground"
"text-sm font-medium"`,
    },
  ],
  "graph-widget": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Card header value
"text-sm font-semibold text-muted-foreground"

// Chart area uses ResponsiveContainer — see Charts section`,
    },
    {
      id: "tokens",
      label: "Tokens",
      code: `import { CHART_HEIGHT } from "@/lib/chart-styles"

<ResponsiveContainer width="100%" height={CHART_HEIGHT} />`,
    },
  ],
  "widget-help-button": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `"inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"`,
    },
  ],
  "partner-volume-widget": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Metric value (compact sidebar)
"text-lg font-bold tracking-tight tabular-nums text-foreground"`,
    },
  ],
  "report-section": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Section wrapper
"flex h-full min-w-0 flex-col"

// Heading row
"flex items-center justify-between gap-3 mb-4"

// Section title
"text-xs font-semibold tracking-wide uppercase"`,
    },
    {
      id: "layout",
      label: "Layout",
      code: `<ReportSection title="Bookings" exportSlug="bookings" filters={filters}>
  <div className="@container flex min-h-0 min-w-0 flex-1 flex-col">
    {/* metric card grid */}
  </div>
</ReportSection>`,
    },
  ],
  "export-snapshot-button": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Uses Button variant="outline" size="icon"
// Parent section needs ref={snapshotRef} on <section>`,
    },
  ],
  "filter-sidebar": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Aside shell
"relative flex min-h-0 flex-col overflow-hidden"

// Left divider (300px right column)
"absolute inset-y-0 left-0 w-px bg-border"

// Scroll body
"flex-1 space-y-6 overflow-y-auto px-6 py-6"

// Section heading
"text-sm font-semibold"

// Metric toggle buttons
"w-full justify-start gap-2" // variant default | outline`,
    },
    {
      id: "layout",
      label: "Layout",
      code: `// App.tsx — right column in grid
<div className="grid min-h-0 flex-1 grid-cols-[1fr_300px] overflow-hidden">
  <section className="overflow-y-auto px-20 py-12">{/* report */}</section>
  <FilterSidebar onRun={setActiveFilters} />
</div>`,
    },
  ],
  "bookings-snapshot": [
    {
      id: "layout",
      label: "Layout",
      code: `<ReportSection title="Bookings" exportSlug="bookings" filters={filters}>
  <div className="@container flex min-h-0 min-w-0 flex-1 flex-col">
    <div className={cn(metricCardGridClass, "grid-cols-1 @md:grid-cols-2")}>
      <MetricTrendWidget title="Total bookings" ... />
      <ProductSplitWidget totalLabel="3,258 total" ... />
    </div>
  </div>
</ReportSection>`,
    },
    {
      id: "tokens",
      label: "Tokens",
      code: figureTokens,
    },
  ],
  "average-booking-value-snapshot": [
    {
      id: "layout",
      label: "Layout",
      code: `<div className={cn(metricCardGridClass, "grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-3")}>
  <MetricGaugeWidget title="CAL customer price" ... />
  <MetricBenchmarkWidget title="ABV excl. booking fee" ... />
  <MetricBenchmarkWidget title="ABV inc. booking fee" ... />
</div>`,
    },
  ],
  "interactive-chart-legend": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Legend pill
"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-opacity"
// hidden series: opacity-40`,
    },
  ],
  "bookings-vs-stays-chart": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Wrapped in ReportSection — chart fills flex-1 column
<div className="flex min-h-0 flex-1 flex-col">
  <ResponsiveContainer width="100%" height={CHART_HEIGHT} />
</div>`,
    },
    {
      id: "tokens",
      label: "Tokens",
      code: `import { CHART_HEIGHT } from "@/lib/chart-styles"

// Shared chart height: 320px
export const CHART_HEIGHT = 320`,
    },
  ],
  "abv-per-day-chart": [
    { id: "tokens", label: "Tokens", code: `import { CHART_HEIGHT } from "@/lib/chart-styles"` },
  ],
  "lead-time-chart": [
    { id: "tokens", label: "Tokens", code: `import { CHART_HEIGHT } from "@/lib/chart-styles"` },
  ],
  "bookings-made-per-day-chart": [
    { id: "tokens", label: "Tokens", code: `import { CHART_HEIGHT } from "@/lib/chart-styles"` },
  ],
  "cal-ddl-takeup-chart": [
    { id: "tokens", label: "Tokens", code: `import { CHART_HEIGHT } from "@/lib/chart-styles"` },
  ],
  "ui-button": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Variants: default | outline | ghost | destructive | secondary | link
// Sizes: default | sm | lg | icon

<Button variant="outline" size="sm" className="h-8 text-xs">
  Export
</Button>

<Button variant="ghost" size="icon" className="size-9">
  <Icon className="size-4" />
</Button>`,
    },
  ],
  "ui-card": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Card root
"rounded-xl border border-border bg-card text-card-foreground shadow-xs"

// CardHeader
"flex items-start justify-between gap-2 p-4 pb-2"

// CardContent
"p-4 pt-0"`,
    },
  ],
  "ui-select": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// SelectTrigger (default)
"flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm"

// Pair with Label
<div className="flex flex-col gap-2">
  <Label htmlFor="partner">Partner</Label>
  <Select>...</Select>
</div>`,
    },
  ],
  "ui-table": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Header cell
"text-left text-xs font-medium text-muted-foreground"

// Body cell
"px-4 py-3 align-top tabular-nums"

// Row hover
"hover:bg-muted/40"`,
    },
  ],
  "ui-tabs": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// TabsList
"inline-flex h-9 items-center rounded-md bg-muted p-1 text-muted-foreground"

// TabsTrigger (active)
"data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"

// Insights / property tabs
<TabsList className="bg-accent dark:bg-muted">`,
    },
  ],
  "ui-input": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"`,
    },
  ],
  "ui-tooltip": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Wrap once at section root
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>{/* button */}</TooltipTrigger>
    <TooltipContent>Helper text</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
    },
  ],
  "partner-card": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Accordion card
"rounded-xl border border-border bg-card shadow-xs"

// Expanded sidebar column
"flex flex-col gap-4 border-border px-5 py-5 lg:border-r"`,
    },
  ],
  "compare-header": [
    {
      id: "layout",
      label: "Layout",
      code: `<div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
  <CompareFilterPanel variant="primary" ... />
  <div className="flex flex-col items-center justify-center gap-3 px-2 py-6">VS</div>
  <CompareFilterPanel variant="comparison" ... />
</div>`,
    },
  ],
  "section-nav": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Sticky jump links
"whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-muted-foreground"

// Link
"flex items-center gap-3 py-1.5 pl-4 pr-6 text-xs"`,
    },
  ],
  "cal-financials": [
    {
      id: "layout",
      label: "Layout",
      code: `<div className={cn(metricCardGridClass, "grid-cols-1 @4xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)]")}>
  <MetricFinancialTrendWidget title="Total payable" ... />
  <DataSnapshotWidget title="Financial breakdown" rows={rows} />
</div>`,
    },
  ],
  "timing-snapshot": [
    {
      id: "layout",
      label: "Layout",
      code: `<div className={cn(metricCardGridClass, "grid-cols-1 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,240px)]")}>
  <DualDataWidget primaryTitle="Avg booking to stay" ... />
  <HeadlineDataWidget title="Avg cancellation to stay" ... />
</div>`,
    },
  ],
  "dashboard-filter-bar": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Compact filter card — mirrors FilterSidebar fields
"rounded-xl border border-border bg-card p-4 shadow-xs"
"flex flex-col gap-4"`,
    },
  ],
  "compare-filter-panel": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `"rounded-xl border border-border bg-card p-5 shadow-xs"
"text-[11px] font-bold tracking-widest text-muted-foreground uppercase"`,
    },
  ],
  "compare-metric-section": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Delta tone
"text-rose-600 dark:text-muted-foreground" // negative
"text-emerald-600" // positive`,
    },
  ],
  "properties-table": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Table wrapper
"overflow-hidden rounded-xl border border-border bg-card"`,
    },
  ],
  "property-bookings-table": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Status badge
"bg-muted text-foreground dark:bg-muted dark:text-foreground" // confirmed
"bg-red-100 text-red-800 dark:bg-muted dark:text-muted-foreground" // cancelled`,
    },
  ],
  "policy-rates-table": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `"bg-card hover:bg-card dark:bg-card dark:hover:bg-card" // header row`,
    },
  ],
  "ui-label": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `"text-sm font-medium leading-none"`,
    },
  ],
  "ui-breadcrumb": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `"flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"`,
    },
  ],
  "ui-separator": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `"shrink-0 bg-border" // horizontal: h-px w-full`,
    },
  ],
  "ui-dropdown-menu": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `<DropdownMenuContent align="end" className="w-48">
  <DropdownMenuItem>...</DropdownMenuItem>
</DropdownMenuContent>`,
    },
  ],
  "partner-breakdown": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// EUR column accent
"text-right tabular-nums text-amber-600 dark:text-muted-foreground"`,
    },
  ],
  "timing-breakdown": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Partner breakdown table inside ReportSection`,
    },
  ],
  "average-booking-value-breakdown": [
    {
      id: "tailwind",
      label: "Tailwind",
      code: `// Partner breakdown table inside ReportSection`,
    },
  ],
}

export function getComponentCodeSnippets(entry: ComponentCatalogEntry): ComponentCodeSnippet[] {
  const extra = componentCodeSnippets[entry.id] ?? []
  const inline = entry.codeSnippets ?? []

  const merged = new Map<string, ComponentCodeSnippet>()
  merged.set("usage", { id: "usage", label: "Usage", code: entry.usageExample })

  for (const snippet of [...extra, ...inline]) {
    merged.set(snippet.id, snippet)
  }

  return [...merged.values()].filter((snippet) => snippet.code.trim().length > 0)
}
