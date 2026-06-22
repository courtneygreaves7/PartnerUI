export type ComponentPropDoc = {
  name: string
  type: string
  required?: boolean
  defaultValue?: string
  description: string
}

export type ComponentCatalogEntry = {
  id: string
  name: string
  category: string
  description: string
  whenToUse: string
  importPath: string
  filePath: string
  props: ComponentPropDoc[]
  usageExample: string
  notes?: string[]
}

export type ComponentCategory = {
  id: string
  title: string
  description: string
}

export const componentCategories: ComponentCategory[] = [
  {
    id: "metric-widgets",
    title: "Metric widgets",
    description:
      "Card-based data displays for headlines, dual metrics, lists, and snapshots. Used across Insights and Booking engine.",
  },
  {
    id: "booking-engine",
    title: "Booking engine",
    description: "Components specific to partner, property, and volume views.",
  },
  {
    id: "insights",
    title: "Insights",
    description: "Filters, snapshots, and report sections for the Insights experience.",
  },
  {
    id: "navigation",
    title: "Navigation",
    description: "In-app navigation helpers and section jump menus.",
  },
  {
    id: "compare",
    title: "Compare",
    description: "Side-by-side partner comparison UI.",
  },
  {
    id: "auth",
    title: "Authentication",
    description: "Login and access screens.",
  },
  {
    id: "report-layout",
    title: "Report & layout",
    description: "Section wrappers, export controls, and page structure for Insights reports.",
  },
  {
    id: "charts",
    title: "Charts",
    description: "Recharts-based visualisations with shared legend and tooltip patterns.",
  },
  {
    id: "ui-primitives",
    title: "UI primitives",
    description: "ShadCN building blocks — Button, Card, Table, Select, and more.",
  },
]

export const componentsCatalog: ComponentCatalogEntry[] = [
  {
    id: "headline-data-widget",
    name: "HeadlineDataWidget",
    category: "metric-widgets",
    description:
      "A single primary metric with a card title, large value, and supporting label. Optional help tooltip in the header.",
    whenToUse:
      "Use for one headline number — total bookings, revenue, occupancy rate, or any metric that stands alone.",
    importPath: '@/components/widgets/headline-data-widget',
    filePath: "src/components/widgets/headline-data-widget.tsx",
    props: [
      { name: "title", type: "string", required: true, description: "Card heading shown in muted text." },
      { name: "value", type: "string", required: true, description: "Primary figure. Pre-format numbers and currency." },
      { name: "label", type: "string", required: true, description: "Supporting context below the value (italic)." },
      { name: "helpText", type: "string", description: "Tooltip content for the help button." },
      { name: "valueClassName", type: "string", description: "Override value typography. See FIGURE_30PX_CLASS / FIGURE_20PX_CLASS." },
      { name: "className", type: "string", description: "Additional classes on the Card root (e.g. flex-1 for grid stretch)." },
    ],
    usageExample: `import { HeadlineDataWidget } from "@/components/widgets/headline-data-widget"
import { FIGURE_30PX_CLASS } from "@/lib/figure-styles"

<HeadlineDataWidget
  title="Revenue"
  value="£284,560,000"
  label="GBP · all partners"
  helpText="Combined revenue across all partners and brands."
  valueClassName={FIGURE_30PX_CLASS}
/>`,
    notes: [
      "Card uses h-full — pair with items-stretch grids for equal-height layouts.",
      "Wrap in TooltipProvider when using helpText.",
    ],
  },
  {
    id: "dual-data-widget",
    name: "DualDataWidget",
    category: "metric-widgets",
    description:
      "Two side-by-side metrics separated by a vertical divider. Optional shared primary title and help tooltip.",
    whenToUse:
      "Use for paired comparisons — GBP/EUR, CAL/DDL, Partner/Brand, Sales/Properties.",
    importPath: '@/components/dual-data-widget',
    filePath: "src/components/dual-data-widget.tsx",
    props: [
      { name: "primaryTitle", type: "string", description: "Optional card header. Omit for a headerless dual card." },
      { name: "datasetA", type: "DualDataDataset", required: true, description: "Left column: title, value, clarification." },
      { name: "datasetB", type: "DualDataDataset", required: true, description: "Right column: title, value, clarification." },
      { name: "helpText", type: "string", description: "Tooltip for the primary title help button." },
      { name: "valueClassName", type: "string", description: "Shared typography class for both values." },
      { name: "className", type: "string", description: "Additional classes on the Card root." },
    ],
    usageExample: `import { DualDataWidget } from "@/components/dual-data-widget"

<DualDataWidget
  primaryTitle="Product split"
  datasetA={{
    title: "CAL",
    value: "23,304",
    clarification: "3% take-up",
  }}
  datasetB={{
    title: "DDL",
    value: "18,422",
    clarification: "2% take-up",
  }}
  helpText="Supporting context for this headline metric."
/>`,
    notes: [
      "Uses @container for responsive value sizing (text-2xl → text-3xl).",
      "DualDataDataset type is exported from the same module.",
    ],
  },
  {
    id: "dual-data-list-widget",
    name: "DualDataListWidget",
    category: "metric-widgets",
    description: "A titled card with stacked label/value rows and an optional help tooltip.",
    whenToUse: "Use for short vertical lists of related metrics under one heading.",
    importPath: '@/components/widgets/dual-data-list-widget',
    filePath: "src/components/widgets/dual-data-list-widget.tsx",
    props: [
      { name: "title", type: "string", required: true, description: "Centred card heading." },
      { name: "rows", type: "DualDataListRow[]", required: true, description: "Array of { label, value } pairs." },
      { name: "helpText", type: "string", description: "Tooltip content for the help button." },
    ],
    usageExample: `import { DualDataListWidget } from "@/components/widgets/dual-data-list-widget"

<DualDataListWidget
  title="Engagement"
  rows={[
    { label: "Cancellation rate", value: "4.2%" },
    { label: "Repeat guests", value: "18%" },
  ]}
/>`,
  },
  {
    id: "breakdown-data-widget",
    name: "BreakdownDataWidget",
    category: "metric-widgets",
    description:
      "Large centred primary metric with two supporting sub-metrics in a side column.",
    whenToUse: "Use when one headline figure needs two related breakdown values alongside it.",
    importPath: '@/components/widgets/breakdown-data-widget',
    filePath: "src/components/widgets/breakdown-data-widget.tsx",
    props: [
      { name: "title", type: "string", required: true, description: "Heading above the primary value." },
      { name: "primaryValue", type: "string", required: true, description: "Large central figure." },
      { name: "primaryLabel", type: "string", required: true, description: "Label below the primary value." },
      { name: "subdataA", type: "BreakdownSubdata", required: true, description: "{ label, value, helpText? }" },
      { name: "subdataB", type: "BreakdownSubdata", required: true, description: "{ label, value, helpText? }" },
    ],
    usageExample: `import { BreakdownDataWidget } from "@/components/widgets/breakdown-data-widget"

<BreakdownDataWidget
  title="Total volume"
  primaryValue="94,200"
  primaryLabel="All partners"
  subdataA={{ label: "CAL attach", value: "12,480" }}
  subdataB={{ label: "DDL attach", value: "8,920" }}
/>`,
  },
  {
    id: "data-snapshot-widget",
    name: "DataSnapshotWidget",
    category: "metric-widgets",
    description:
      "Scrollable key-value rows with a card title. Optional overview link in the header.",
    whenToUse: "Use for property overview fields, engagement stats, or any label/value table in a card.",
    importPath: '@/components/widgets/data-snapshot-widget',
    filePath: "src/components/widgets/data-snapshot-widget.tsx",
    props: [
      { name: "title", type: "string", required: true, description: "Card heading." },
      { name: "rows", type: "DataSnapshotRow[]", required: true, description: "Array of { label, value }." },
      { name: "overviewHref", type: "string", description: "Optional link URL shown in the header." },
      { name: "overviewLabel", type: "string", defaultValue: "Link to Overview", description: "Link label text." },
      { name: "className", type: "string", description: "Card root classes (e.g. h-full)." },
      { name: "valueClassName", type: "string", description: "Typography override for row values." },
      { name: "compact", type: "boolean", defaultValue: "false", description: "Tighter row padding and smaller text." },
    ],
    usageExample: `import { DataSnapshotWidget } from "@/components/widgets/data-snapshot-widget"

<DataSnapshotWidget
  title="Overview"
  className="h-full"
  rows={[
    { label: "Property type", value: "Cottage" },
    { label: "Bedrooms", value: "4" },
  ]}
/>`,
    notes: ["Row values default to text-sm — use valueClassName only when emphasising figures."],
  },
  {
    id: "graph-widget",
    name: "GraphWidget",
    category: "metric-widgets",
    description:
      "Self-contained line chart card with title, explanation, toggleable legend layers, and Recharts.",
    whenToUse: "Use for embeddable multi-series line charts inside a card shell.",
    importPath: '@/components/widgets/graph-widget',
    filePath: "src/components/widgets/graph-widget.tsx",
    props: [
      { name: "title", type: "string", required: true, description: "Chart card heading." },
      { name: "explanation", type: "string", required: true, description: "Subtitle describing the chart." },
      { name: "layers", type: "GraphLayer[]", required: true, description: "{ id, label, color, dataKey }[]" },
      { name: "data", type: "Record<string, string | number>[]", required: true, description: "Recharts data array." },
      { name: "xAxisKey", type: "string", required: true, description: "Key for the X axis (e.g. date or label)." },
      { name: "className", type: "string", description: "Card root classes." },
    ],
    usageExample: `import { GraphWidget } from "@/components/widgets/graph-widget"

<GraphWidget
  title="Daily trend"
  explanation="Bookings made per day"
  xAxisKey="date"
  layers={[
    { id: "bookings", label: "Bookings", color: "#3b82f6", dataKey: "bookings" },
  ]}
  data={[{ date: "1 Jan", bookings: 420 }]}
/>`,
    notes: ["For full-width Insights charts, see the Charts section — they use ReportSection instead."],
  },
  {
    id: "widget-help-button",
    name: "WidgetHelpButton",
    category: "metric-widgets",
    description: "Circular help icon with optional tooltip. Used in widget card headers.",
    whenToUse: "Compose into custom widgets when you need the standard help affordance.",
    importPath: '@/components/widgets/widget-help-button',
    filePath: "src/components/widgets/widget-help-button.tsx",
    props: [
      { name: "title", type: "string", required: true, description: "Accessible label context for the button." },
      { name: "helpText", type: "string", description: "Tooltip body. Icon renders non-interactive if omitted." },
    ],
    usageExample: `import { WidgetHelpButton } from "@/components/widgets/widget-help-button"

<WidgetHelpButton
  title="Revenue"
  helpText="Combined revenue across all partners and brands."
/>`,
    notes: ["Must be rendered inside a TooltipProvider."],
  },
  {
    id: "partner-volume-widget",
    name: "PartnerVolumeWidget",
    category: "booking-engine",
    description:
      "Compact stacked dual-metric card for partner cards — volume row (Sales/Properties) above product split (CAL/DDL).",
    whenToUse: "Use inside expanded PartnerCard sidebars on the Booking engine page.",
    importPath: '@/components/booking-engine/partner-volume-widget',
    filePath: "src/components/booking-engine/partner-volume-widget.tsx",
    props: [
      { name: "volume", type: "{ datasetA, datasetB }", required: true, description: "Top row — typically Sales and Properties." },
      { name: "productSplit", type: "{ datasetA, datasetB }", required: true, description: "Bottom row — typically With CAL and With DDL." },
      { name: "className", type: "string", description: "Card root classes." },
    ],
    usageExample: `import { PartnerVolumeWidget } from "@/components/booking-engine/partner-volume-widget"

<PartnerVolumeWidget
  volume={{
    datasetA: { title: "Sales", value: "42,310", clarification: "Total bookings" },
    datasetB: { title: "Properties", value: "8,420", clarification: "On platform" },
  }}
  productSplit={{
    datasetA: { title: "With CAL", value: "1,104", clarification: "2.6% of bookings" },
    datasetB: { title: "With DDL", value: "12", clarification: "0.0% of bookings" },
  }}
/>`,
    notes: ["Uses smaller typography than DualDataWidget — optimised for narrow sidebar width."],
  },
  {
    id: "report-section",
    name: "ReportSection",
    category: "report-layout",
    description:
      "Insights report section wrapper with uppercase title, optional header actions, and export snapshot button.",
    whenToUse: "Wrap every exportable block on the Insights report page and chart components.",
    importPath: '@/components/report-section',
    filePath: "src/components/report-section.tsx",
    props: [
      { name: "title", type: "string", required: true, description: "Uppercase section heading." },
      { name: "exportSlug", type: "string", required: true, description: "Filename slug for PNG export." },
      { name: "filters", type: "ActiveFilters", description: "Appended to export filename." },
      { name: "headingClassName", type: "string", description: "Override header row spacing." },
      { name: "headerActions", type: "ReactNode", description: "Extra controls beside the export button." },
      { name: "children", type: "ReactNode", required: true, description: "Section content." },
    ],
    usageExample: `import { ReportSection } from "@/components/report-section"

<ReportSection
  title="Bookings"
  exportSlug="bookings"
  filters={filters}
  headerActions={<BreakdownToggle />}
>
  <BookingsGrid />
</ReportSection>`,
    notes: [
      "Attaches a ref to the section root for html2canvas export.",
      "Elements with data-snapshot-exclude are omitted from exports.",
    ],
  },
  {
    id: "export-snapshot-button",
    name: "ExportSnapshotButton",
    category: "report-layout",
    description: "Camera icon button that exports a DOM subtree as a PNG snapshot.",
    whenToUse: "Composed into ReportSection. Can be used standalone with a getTarget ref callback.",
    importPath: '@/components/export-snapshot-button',
    filePath: "src/components/export-snapshot-button.tsx",
    props: [
      { name: "getTarget", type: "() => HTMLElement | null", required: true, description: "Returns the element to capture." },
      { name: "exportSlug", type: "string", required: true, description: "Base filename slug." },
      { name: "filters", type: "ActiveFilters", description: "Filter context appended to filename." },
    ],
    usageExample: `import { ExportSnapshotButton } from "@/components/export-snapshot-button"

<ExportSnapshotButton
  getTarget={() => sectionRef.current}
  exportSlug="bookings"
  filters={filters}
/>`,
  },
  {
    id: "interactive-chart-legend",
    name: "InteractiveChartLegend",
    category: "charts",
    description: "Clickable Recharts legend that toggles series visibility.",
    whenToUse: "Pass as Legend content in Recharts LineChart / BarChart components.",
    importPath: '@/components/charts/interactive-chart-legend',
    filePath: "src/components/charts/interactive-chart-legend.tsx",
    props: [
      { name: "payload", type: "LegendPayload[]", description: "From Recharts Legend content render prop." },
      { name: "hiddenKeys", type: "Set<string>", required: true, description: "Currently hidden series keys." },
      { name: "onToggleSeries", type: "(key: string) => void", required: true, description: "Toggle callback from useHiddenChartSeries." },
    ],
    usageExample: `import { InteractiveChartLegend } from "@/components/charts/interactive-chart-legend"
import { useHiddenChartSeries } from "@/components/charts/use-hidden-chart-series"

const { hiddenKeys, toggleSeries, isHidden } = useHiddenChartSeries(SERIES_KEYS)

<Legend content={(props) => (
  <InteractiveChartLegend
    payload={props.payload}
    hiddenKeys={hiddenKeys}
    onToggleSeries={toggleSeries}
  />
)} />`,
    notes: [
      "Pair with useHiddenChartSeries hook and Line hide={isHidden(key)}.",
      "Chart height constant: CHART_HEIGHT (320px) in src/lib/chart-styles.ts.",
    ],
  },
  {
    id: "bookings-vs-stays-chart",
    name: "BookingsVsStaysChart",
    category: "charts",
    description: "Daily line chart comparing bookings made vs stays starting.",
    whenToUse: "Insights report — Bookings made vs stays starting per day section.",
    importPath: '@/components/charts/bookings-vs-stays-chart',
    filePath: "src/components/charts/bookings-vs-stays-chart.tsx",
    props: [
      { name: "filters", type: "ActiveFilters", required: true, description: "Active filter set from the sidebar." },
      { name: "compact", type: "boolean", description: "Strip ReportSection wrapper for dashboard carousel slides." },
    ],
    usageExample: `import { BookingsVsStaysChart } from "@/components/charts/bookings-vs-stays-chart"

<BookingsVsStaysChart filters={filters} />`,
  },
  {
    id: "abv-per-day-chart",
    name: "AbvPerDayChart",
    category: "charts",
    description: "Daily ABV (excl. fees) line chart with partner-level series.",
    whenToUse: "Insights report — ABV per day section.",
    importPath: '@/components/charts/abv-per-day-chart',
    filePath: "src/components/charts/abv-per-day-chart.tsx",
    props: [
      { name: "filters", type: "ActiveFilters", required: true, description: "Active filter set." },
      { name: "compact", type: "boolean", description: "Dashboard carousel mode." },
    ],
    usageExample: `import { AbvPerDayChart } from "@/components/charts/abv-per-day-chart"

<AbvPerDayChart filters={filters} />`,
  },
  {
    id: "lead-time-chart",
    name: "LeadTimeChart",
    category: "charts",
    description: "Daily average booking-to-stay lead time with partner breakdown.",
    whenToUse: "Insights report — Lead time per day section.",
    importPath: '@/components/charts/lead-time-chart',
    filePath: "src/components/charts/lead-time-chart.tsx",
    props: [
      { name: "filters", type: "ActiveFilters", required: true, description: "Active filter set." },
      { name: "compact", type: "boolean", description: "Dashboard carousel mode." },
    ],
    usageExample: `import { LeadTimeChart } from "@/components/charts/lead-time-chart"

<LeadTimeChart filters={filters} />`,
  },
  {
    id: "bookings-made-per-day-chart",
    name: "BookingsMadePerDayChart",
    category: "charts",
    description: "Daily booking count bar chart.",
    whenToUse: "Insights report — Bookings made per day section.",
    importPath: '@/components/charts/bookings-made-per-day-chart',
    filePath: "src/components/charts/bookings-made-per-day-chart.tsx",
    props: [
      { name: "filters", type: "ActiveFilters", required: true, description: "Active filter set." },
      { name: "compact", type: "boolean", description: "Dashboard carousel mode." },
    ],
    usageExample: `import { BookingsMadePerDayChart } from "@/components/charts/bookings-made-per-day-chart"

<BookingsMadePerDayChart filters={filters} />`,
  },
  {
    id: "cal-ddl-takeup-chart",
    name: "CalDdlTakeupChart",
    category: "charts",
    description: "Daily CAL and DDL take-up percentage line chart.",
    whenToUse: "Insights report — CAL & DDL take-up section (often full-width).",
    importPath: '@/components/charts/cal-ddl-takeup-chart',
    filePath: "src/components/charts/cal-ddl-takeup-chart.tsx",
    props: [
      { name: "filters", type: "ActiveFilters", required: true, description: "Active filter set." },
      { name: "compact", type: "boolean", description: "Dashboard carousel mode." },
    ],
    usageExample: `import { CalDdlTakeupChart } from "@/components/charts/cal-ddl-takeup-chart"

<CalDdlTakeupChart filters={filters} />`,
  },
]

export const figureStyleTokens = [
  { name: "FIGURE_30PX_CLASS", value: "text-[30px] leading-none", usage: "Booking engine revenue, large headline figures" },
  { name: "FIGURE_20PX_CLASS", value: "text-[20px] leading-none", usage: "Property page and Insights card figures" },
  { name: "CHART_HEIGHT", value: "320", usage: "Shared ResponsiveContainer height for Insights charts" },
]
