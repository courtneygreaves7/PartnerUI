import type { ComponentCatalogEntry } from "@/lib/components-catalog"

export const componentsCatalogExtra: ComponentCatalogEntry[] = [
  {
    id: "filter-sidebar",
    name: "FilterSidebar",
    category: "insights",
    description:
      "Right-hand filter panel on Insights. Partner, brand, date range, metric toggles, sort, and Run action.",
    whenToUse: "Always visible on the Insights report view — primary filter control surface.",
    importPath: "@/components/filter-sidebar",
    filePath: "src/components/filter-sidebar.tsx",
    props: [
      { name: "onRun", type: "(filters: ActiveFilters) => void", required: true, description: "Called when Run is pressed with the selected filter state." },
    ],
    usageExample: `import { FilterSidebar } from "@/components/filter-sidebar"

<FilterSidebar onRun={(filters) => setActiveFilters(filters)} />`,
    notes: ["Fixed 300px column in App shell grid. Uses ShadCN Select and Button."],
  },
  {
    id: "dashboard-filter-bar",
    name: "DashboardFilterBar",
    category: "insights",
    description: "Compact vertical filter bar used in the Insights dashboard carousel view.",
    whenToUse: "Dashboard carousel mode — same filters as FilterSidebar in a card layout.",
    importPath: "@/components/dashboard-filter-bar",
    filePath: "src/components/dashboard-filter-bar.tsx",
    props: [
      { name: "filters", type: "ActiveFilters", required: true, description: "Current filter state to seed controls." },
      { name: "onRun", type: "(filters: ActiveFilters) => void", required: true, description: "Run callback." },
    ],
    usageExample: `import { DashboardFilterBar } from "@/components/dashboard-filter-bar"

<DashboardFilterBar filters={filters} onRun={onRun} />`,
  },
  {
    id: "bookings-snapshot",
    name: "BookingsSnapshot",
    category: "insights",
    description: "ReportSection with total bookings headline, CAL/DDL product split, and optional partner breakdown table.",
    whenToUse: "Top of Insights report — Booking volume section.",
    importPath: "@/components/bookings-snapshot",
    filePath: "src/components/bookings-snapshot.tsx",
    props: [
      { name: "filters", type: "ActiveFilters", required: true, description: "Active filter set." },
    ],
    usageExample: `import { BookingsSnapshot } from "@/components/bookings-snapshot"

<BookingsSnapshot filters={filters} />`,
  },
  {
    id: "average-booking-value-snapshot",
    name: "AverageBookingValueSnapshot",
    category: "insights",
    description: "ABV excl/inc fee dual widgets, CAL customer price headline, and optional partner ABV table.",
    whenToUse: "Insights report — Average booking value section.",
    importPath: "@/components/average-booking-value-snapshot",
    filePath: "src/components/average-booking-value-snapshot.tsx",
    props: [
      { name: "filters", type: "ActiveFilters", required: true, description: "Active filter set." },
    ],
    usageExample: `import { AverageBookingValueSnapshot } from "@/components/average-booking-value-snapshot"

<AverageBookingValueSnapshot filters={filters} />`,
  },
  {
    id: "cal-financials",
    name: "CalFinancials",
    category: "insights",
    description: "CAL financials section — total payable headline plus financial breakdown snapshot.",
    whenToUse: "Insights report — CAL financials (GBP) section.",
    importPath: "@/components/cal-financials",
    filePath: "src/components/cal-financials.tsx",
    props: [
      { name: "filters", type: "ActiveFilters", required: true, description: "Active filter set." },
    ],
    usageExample: `import { CalFinancials } from "@/components/cal-financials"

<CalFinancials filters={filters} />`,
  },
  {
    id: "timing-snapshot",
    name: "TimingSnapshot",
    category: "insights",
    description: "Booking and cancellation timing metrics with optional partner breakdown table.",
    whenToUse: "Insights report — Booking & cancellation timing section.",
    importPath: "@/components/timing-snapshot",
    filePath: "src/components/timing-snapshot.tsx",
    props: [
      { name: "filters", type: "ActiveFilters", required: true, description: "Active filter set." },
    ],
    usageExample: `import { TimingSnapshot } from "@/components/timing-snapshot"

<TimingSnapshot filters={filters} />`,
  },
  {
    id: "timing-breakdown",
    name: "TimingBreakdown",
    category: "insights",
    description: "Standalone timing-by-partner table block.",
    whenToUse: "Extended timing analysis views.",
    importPath: "@/components/timing-breakdown",
    filePath: "src/components/timing-breakdown.tsx",
    props: [],
    usageExample: `import { TimingBreakdown } from "@/components/timing-breakdown"

<TimingBreakdown />`,
  },
  {
    id: "partner-breakdown",
    name: "PartnerBreakdown",
    category: "insights",
    description: "Partner performance table with brand, currency, bookings, CAL, and DDL columns.",
    whenToUse: "Insights dashboard partner performance slide.",
    importPath: "@/components/partner-breakdown",
    filePath: "src/components/partner-breakdown.tsx",
    props: [],
    usageExample: `import { PartnerBreakdown } from "@/components/partner-breakdown"

<PartnerBreakdown filters={filters} />`,
  },
  {
    id: "average-booking-value-breakdown",
    name: "AverageBookingValueBreakdown",
    category: "insights",
    description: "Extended ABV breakdown table by partner.",
    whenToUse: "Detailed ABV analysis beyond the snapshot card.",
    importPath: "@/components/average-booking-value-breakdown",
    filePath: "src/components/average-booking-value-breakdown.tsx",
    props: [],
    usageExample: `import { AverageBookingValueBreakdown } from "@/components/average-booking-value-breakdown"

<AverageBookingValueBreakdown />`,
  },
  {
    id: "section-nav",
    name: "SectionNav",
    category: "navigation",
    description: "Jump-to-section menu for the Insights report. Expands a popover list of anchored sections.",
    whenToUse: "Left sidebar footer on Insights — quick navigation to report sections.",
    importPath: "@/components/section-nav",
    filePath: "src/components/section-nav.tsx",
    props: [
      { name: "collapsed", type: "boolean", defaultValue: "false", description: "Icon-only mode when left nav is collapsed." },
    ],
    usageExample: `import { SectionNav } from "@/components/section-nav"

<SectionNav collapsed={!leftSidebarOpen} />`,
    notes: ["Scroll targets use id=\"section-*\" anchors on InsightsReportPage."],
  },
  {
    id: "compare-filter-panel",
    name: "CompareFilterPanel",
    category: "compare",
    description: "Filter panel for one side of the Compare view — primary or comparison variant.",
    whenToUse: "Compare partners page — one panel per comparison side.",
    importPath: "@/components/compare/compare-filter-panel",
    filePath: "src/components/compare/compare-filter-panel.tsx",
    props: [
      { name: "variant", type: '"primary" | "comparison"', required: true, description: "Visual variant for left/right panel." },
      { name: "filters", type: "CompareSideFilters", required: true, description: "Side-specific filter state." },
      { name: "onChange", type: "(filters) => void", required: true, description: "Filter change handler." },
      { name: "disablePartnerId", type: "string", description: "Partner ID to disable on comparison side." },
    ],
    usageExample: `import { CompareFilterPanel } from "@/components/compare/compare-filter-panel"

<CompareFilterPanel
  variant="primary"
  filters={leftFilters}
  onChange={setLeftFilters}
/>`,
  },
  {
    id: "compare-header",
    name: "CompareHeader",
    category: "compare",
    description: "Header row labelling primary vs comparison sides in the Compare view.",
    whenToUse: "Top of Compare page above metric sections.",
    importPath: "@/components/compare/compare-header",
    filePath: "src/components/compare/compare-header.tsx",
    props: [
      { name: "primaryDraft", type: "CompareSideFilters", required: true, description: "Primary side filter draft state." },
      { name: "comparisonDraft", type: "CompareSideFilters", required: true, description: "Comparison side filter draft state." },
      { name: "onPrimaryChange", type: "(filters) => void", required: true, description: "Primary filter change handler." },
      { name: "onComparisonChange", type: "(filters) => void", required: true, description: "Comparison filter change handler." },
      { name: "onRun", type: "() => void", required: true, description: "Run comparison callback." },
    ],
    usageExample: `import { CompareHeader } from "@/components/compare/compare-header"

<CompareHeader
  primaryDraft={leftFilters}
  comparisonDraft={rightFilters}
  onPrimaryChange={setLeftFilters}
  onComparisonChange={setRightFilters}
  onRun={handleRun}
/>`,
  },
  {
    id: "compare-metric-section",
    name: "CompareMetricSection",
    category: "compare",
    description: "Butterfly chart section comparing left/right metric values with delta display.",
    whenToUse: "Each metric group on the Compare page.",
    importPath: "@/components/compare/compare-metric-section",
    filePath: "src/components/compare/compare-metric-section.tsx",
    props: [
      { name: "section", type: "CompareSection", required: true, description: "Section title and metrics array." },
      { name: "exportSlug", type: "string", required: true, description: "Filename slug for PNG export." },
      { name: "filters", type: "ActiveFilters", description: "For export snapshot filename." },
    ],
    usageExample: `import { CompareMetricSection } from "@/components/compare/compare-metric-section"

<CompareMetricSection section={bookingSection} exportSlug="compare-bookings" filters={filters} />`,
  },
  {
    id: "partner-card",
    name: "PartnerCard",
    category: "booking-engine",
    description: "Expandable partner row with volume widget, brand list, currencies, and policy rates table.",
    whenToUse: "Booking engine partners list — one card per connected partner.",
    importPath: "@/components/booking-engine/partner-card",
    filePath: "src/components/booking-engine/partner-card.tsx",
    props: [
      { name: "partner", type: "Partner", required: true, description: "Partner data object." },
      { name: "expanded", type: "boolean", required: true, description: "Whether detail panel is open." },
      { name: "onToggle", type: "() => void", required: true, description: "Expand/collapse handler." },
      { name: "onViewProperty", type: "() => void", description: "View properties navigation callback." },
    ],
    usageExample: `import { PartnerCard } from "@/components/booking-engine/partner-card"

<PartnerCard
  partner={partner}
  expanded={expanded}
  onToggle={() => setExpanded(!expanded)}
  onViewProperty={() => navigateToProperties(partner.id)}
/>`,
  },
  {
    id: "policy-rates-table",
    name: "PolicyRatesTable",
    category: "booking-engine",
    description: "Policy rates table with net/gross rates, CAL commission, and status indicators.",
    whenToUse: "Inside expanded PartnerCard — policy rates panel.",
    importPath: "@/components/booking-engine/policy-rates-table",
    filePath: "src/components/booking-engine/policy-rates-table.tsx",
    props: [
      { name: "policies", type: "PolicyRate[]", required: true, description: "Policy rate rows." },
      { name: "selectedBrandId", type: "string | null", required: true, description: "Highlights rows for selected brand." },
    ],
    usageExample: `import { PolicyRatesTable } from "@/components/booking-engine/policy-rates-table"

<PolicyRatesTable policies={partner.policies} selectedBrandId={brandId} />`,
  },
  {
    id: "properties-table",
    name: "PropertiesTable",
    category: "booking-engine",
    description: "Sortable properties list with code, name, partner, postcode, and view action.",
    whenToUse: "Properties list page under a partner.",
    importPath: "@/components/booking-engine/properties-table",
    filePath: "src/components/booking-engine/properties-table.tsx",
    props: [
      { name: "properties", type: "PropertyListItem[]", required: true, description: "Property rows." },
      { name: "onViewProperty", type: "(id: string) => void", required: true, description: "View property callback." },
    ],
    usageExample: `import { PropertiesTable } from "@/components/booking-engine/properties-table"

<PropertiesTable properties={properties} onViewProperty={setSelectedId} />`,
  },
  {
    id: "property-bookings-table",
    name: "PropertyBookingsTable",
    category: "booking-engine",
    description: "Bookings table for a single property — dates, guest, status, and value.",
    whenToUse: "Property page Bookings tab.",
    importPath: "@/components/booking-engine/property-bookings-table",
    filePath: "src/components/booking-engine/property-bookings-table.tsx",
    props: [
      { name: "bookings", type: "PropertyBooking[]", required: true, description: "Booking rows for the property." },
    ],
    usageExample: `import { PropertyBookingsTable } from "@/components/booking-engine/property-bookings-table"

<PropertyBookingsTable bookings={property.bookings} />`,
  },
  {
    id: "login-page",
    name: "LoginPage",
    category: "auth",
    description: "Keystone login screen with email/password validation and branded layout.",
    whenToUse: "Unauthenticated entry point — rendered when isAuthenticated is false.",
    importPath: "@/components/login-page",
    filePath: "src/components/login-page.tsx",
    props: [
      { name: "onLogin", type: "() => void", required: true, description: "Called on successful form submit." },
    ],
    usageExample: `import { LoginPage } from "@/components/login-page"

<LoginPage onLogin={() => setIsAuthenticated(true)} />`,
  },
  {
    id: "ui-button",
    name: "Button",
    category: "ui-primitives",
    description: "Primary action button with variant and size options.",
    whenToUse: "All clickable actions — use variant=\"outline\" for secondary, ghost for tertiary.",
    importPath: "@/components/ui/button",
    filePath: "src/components/ui/button.tsx",
    props: [
      { name: "variant", type: '"default" | "outline" | "ghost"', defaultValue: "default", description: "Visual style." },
      { name: "size", type: '"default" | "sm" | "icon"', defaultValue: "default", description: "Button size." },
    ],
    usageExample: `import { Button } from "@/components/ui/button"

<Button variant="outline" size="sm">Schedule report</Button>`,
  },
  {
    id: "ui-card",
    name: "Card",
    category: "ui-primitives",
    description: "Container surface with optional header, content, and footer slots.",
    whenToUse: "Base shell for widgets, filters, and grouped content.",
    importPath: "@/components/ui/card",
    filePath: "src/components/ui/card.tsx",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Use CardHeader, CardContent, CardFooter." },
    ],
    usageExample: `import { Card, CardHeader, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>`,
  },
  {
    id: "ui-select",
    name: "Select",
    category: "ui-primitives",
    description: "Radix-based dropdown select for filter controls and forms.",
    whenToUse: "Single-choice fields — partner, brand, date range, sort order.",
    importPath: "@/components/ui/select",
    filePath: "src/components/ui/select.tsx",
    props: [
      { name: "value", type: "string", description: "Controlled value." },
      { name: "onValueChange", type: "(value: string) => void", description: "Change handler." },
    ],
    usageExample: `import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

<Select value={partner} onValueChange={setPartner}>
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent>
    <SelectItem value="all-partners">All partners</SelectItem>
  </SelectContent>
</Select>`,
  },
  {
    id: "ui-table",
    name: "Table",
    category: "ui-primitives",
    description: "Semantic table primitives for data-heavy views.",
    whenToUse: "Partner breakdowns, properties lists, bookings, policy rates.",
    importPath: "@/components/ui/table",
    filePath: "src/components/ui/table.tsx",
    props: [],
    usageExample: `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

<Table>...</Table>`,
  },
  {
    id: "ui-tabs",
    name: "Tabs",
    category: "ui-primitives",
    description: "Tabbed content switcher.",
    whenToUse: "Property page (Bookings / Insights / Details), Compare filter modes.",
    importPath: "@/components/ui/tabs",
    filePath: "src/components/ui/tabs.tsx",
    props: [
      { name: "defaultValue", type: "string", description: "Initially active tab." },
    ],
    usageExample: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="bookings">
  <TabsList>
    <TabsTrigger value="bookings">Bookings</TabsTrigger>
  </TabsList>
  <TabsContent value="bookings">...</TabsContent>
</Tabs>`,
  },
  {
    id: "ui-input",
    name: "Input",
    category: "ui-primitives",
    description: "Text input field.",
    whenToUse: "Forms — login email/password, search fields.",
    importPath: "@/components/ui/input",
    filePath: "src/components/ui/input.tsx",
    props: [
      { name: "type", type: "string", description: "HTML input type." },
      { name: "placeholder", type: "string", description: "Placeholder text." },
    ],
    usageExample: `import { Input } from "@/components/ui/input"

<Input type="email" placeholder="you@company.com" />`,
  },
  {
    id: "ui-label",
    name: "Label",
    category: "ui-primitives",
    description: "Accessible form label linked to inputs via htmlFor.",
    whenToUse: "All filter and form fields.",
    importPath: "@/components/ui/label",
    filePath: "src/components/ui/label.tsx",
    props: [
      { name: "htmlFor", type: "string", description: "Associated input id." },
    ],
    usageExample: `import { Label } from "@/components/ui/label"

<Label htmlFor="partner-filter">Partner</Label>`,
  },
  {
    id: "ui-tooltip",
    name: "Tooltip",
    category: "ui-primitives",
    description: "Hover/focus tooltip built on Radix.",
    whenToUse: "Widget help buttons, icon actions, truncated labels.",
    importPath: "@/components/ui/tooltip",
    filePath: "src/components/ui/tooltip.tsx",
    props: [],
    usageExample: `import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild><button>?</button></TooltipTrigger>
    <TooltipContent>Help text</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
    notes: ["Wrap app sections in TooltipProvider once at the root."],
  },
  {
    id: "ui-breadcrumb",
    name: "Breadcrumb",
    category: "ui-primitives",
    description: "Navigation breadcrumb trail.",
    whenToUse: "App header and nested page hierarchy.",
    importPath: "@/components/ui/breadcrumb",
    filePath: "src/components/ui/breadcrumb.tsx",
    props: [],
    usageExample: `import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb"

<Breadcrumb>...</Breadcrumb>`,
  },
  {
    id: "ui-separator",
    name: "Separator",
    category: "ui-primitives",
    description: "Horizontal or vertical divider line.",
    whenToUse: "Separating filter groups, sidebar sections.",
    importPath: "@/components/ui/separator",
    filePath: "src/components/ui/separator.tsx",
    props: [
      { name: "orientation", type: '"horizontal" | "vertical"', defaultValue: "horizontal", description: "Divider direction." },
    ],
    usageExample: `import { Separator } from "@/components/ui/separator"

<Separator />`,
  },
  {
    id: "ui-dropdown-menu",
    name: "DropdownMenu",
    category: "ui-primitives",
    description: "Radix dropdown menu for user menu and contextual actions.",
    whenToUse: "App header user menu, action overflow menus.",
    importPath: "@/components/ui/dropdown-menu",
    filePath: "src/components/ui/dropdown-menu.tsx",
    props: [],
    usageExample: `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

<DropdownMenu>...</DropdownMenu>`,
  },
]
