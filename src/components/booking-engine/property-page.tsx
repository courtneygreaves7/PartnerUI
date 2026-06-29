import { useId, useState, type ReactNode } from "react"
import {
  ArrowLeft,
  Bath,
  BedDouble,
  ChevronRight,
  ExternalLink,
  Home,
  MapPin,
  PawPrint,
  Star,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts"

import { PropertyBookingsTable } from "@/components/booking-engine/property-bookings-table"
import { PropertyDetailsPanel } from "@/components/booking-engine/property-details"
import {
  PropertyInsights,
} from "@/components/booking-engine/property-insights"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { formatBrandLabel } from "@/lib/booking-engine-data"
import { metricCardGridClass } from "@/lib/card-layout"
import { PROPERTY_BOOKINGS_INSIGHT, PROPERTY_OCCUPANCY, PROPERTY_AVG_NIGHTS } from "@/lib/property-insights-data"
import type { InsightTrendPoint } from "@/lib/property-insights-data"
import { type Property, type PropertyBooking } from "@/lib/property-data"
import { WILLOWCROFT_HOUSE_DETAILS } from "@/lib/property-details-data"
import { cn } from "@/lib/utils"

type PropertyPageProps = {
  property: Property
  onBack: () => void
}

const PROPERTY_TABS = [
  { id: "overview", label: "Overview" },
  { id: "bookings", label: "Bookings" },
  { id: "financials", label: "Financials" },
  { id: "settings", label: "Settings" },
] as const

function overviewValue(label: string) {
  return WILLOWCROFT_HOUSE_DETAILS.overview.find((field) => field.label === label)?.value ?? "—"
}

function formatPartnerLabel(name: string) {
  return name.replace(/^Partner /, "")
}

function relationshipInitials(name: string) {
  return name
    .replace(/^Partner /, "")
    .replace(/^Brand /, "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function RelationshipLogo({
  initials,
  variant = "partner",
}: {
  initials: string
  variant?: "partner" | "brand"
}) {
  return (
    <div
      className={cn(
        "mb-2.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-[10px] font-semibold tracking-wide",
        variant === "brand"
          ? "bg-amber-500/10 text-amber-800 dark:text-amber-300"
          : "bg-muted text-muted-foreground"
      )}
    >
      {initials}
    </div>
  )
}

function PropertyPanel({
  title,
  children,
  className,
  action,
}: {
  title: string
  children: ReactNode
  className?: string
  action?: React.ReactNode
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-xs",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function BookingStatusPill({ status }: { status: PropertyBooking["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
        status === "confirmed"
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-muted text-muted-foreground"
      )}
    >
      {status}
    </span>
  )
}

function SpecListRow({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: LucideIcon
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
      <dt className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5 shrink-0" strokeWidth={2} />
        <span>{label}</span>
      </dt>
      <dd className="shrink-0 text-right text-xs font-semibold text-foreground">
        {highlight ? (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-400">
            {value}
          </span>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function HeaderMetricChart({
  variant,
  data,
}: {
  variant: "area" | "line" | "bars"
  data: InsightTrendPoint[]
}) {
  const gradientId = `header-metric-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const chartMargin = { top: 6, right: 2, left: 2, bottom: 2 }

  if (variant === "bars") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={chartMargin}>
          <Bar
            dataKey="value"
            fill="var(--foreground)"
            fillOpacity={0.32}
            radius={[5, 5, 0, 0]}
            maxBarSize={10}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (variant === "line") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={chartMargin}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--foreground)"
            strokeOpacity={0.55}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={chartMargin}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.12} />
            <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--foreground)"
          strokeWidth={1.75}
          strokeOpacity={0.55}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

type HeaderMetricChartConfig = {
  variant: "area" | "line" | "bars"
  data: InsightTrendPoint[]
}

function HeaderMetricCell({
  label,
  value,
  detail,
  tone = "neutral",
  chart,
}: {
  label: string
  value: string
  detail?: string
  tone?: "positive" | "negative" | "neutral"
  chart?: HeaderMetricChartConfig
}) {
  return (
    <div className="relative min-h-[5.5rem] overflow-hidden bg-card px-4 py-3.5">
      <div className="relative z-10 flex flex-col justify-center pr-[42%]">
        <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
          {label}
        </p>
        <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-foreground">
          {value}
        </p>
        {detail ? (
          <p
            className={cn(
              "mt-1 text-[11px] font-medium",
              tone === "positive" && "text-emerald-600 dark:text-emerald-400",
              tone === "negative" && "text-red-600 dark:text-red-400",
              tone === "neutral" && "text-muted-foreground"
            )}
          >
            {detail}
          </p>
        ) : null}
      </div>
      {chart ? (
        <div
          className="pointer-events-none absolute right-0 bottom-0 h-[52%] w-[54%] min-w-[5.5rem]"
          aria-hidden
        >
          <div className="absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-card to-transparent" />
          <HeaderMetricChart variant={chart.variant} data={chart.data} />
        </div>
      ) : null}
    </div>
  )
}

const HEADER_CANCELLATIONS_TREND: InsightTrendPoint[] = [
  { label: "J", value: 0 },
  { label: "F", value: 0 },
  { label: "M", value: 1 },
  { label: "A", value: 0 },
  { label: "M", value: 0 },
  { label: "J", value: 0 },
]

const HEADER_AVG_STAY_BARS: InsightTrendPoint[] = PROPERTY_AVG_NIGHTS.distribution.map(
  (item) => ({ label: item.label, value: item.count })
)

function PropertyPageHeading({
  property,
  propertyType,
  onBack,
}: {
  property: Property
  propertyType: string
  onBack: () => void
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-800 uppercase dark:text-amber-300">
            Active
          </span>
          <span className="text-xs text-muted-foreground">
            {propertyType} · {property.location}, {property.county}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{property.name}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          {property.postcode} · {property.county}, {property.country}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="h-9 gap-2 text-xs"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>
        <Button type="button" variant="outline" size="sm" className="h-9 text-xs">
          Edit property
        </Button>
        <Button type="button" size="sm" className="h-9 gap-1.5 text-xs">
          View listing
          <ExternalLink className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

function PropertyHeroRow({
  property,
  propertyType,
  grade,
  bedrooms,
  bathrooms,
  pets,
  avgNightsBooked,
  cancellationCount,
  cancellationRate,
}: {
  property: Property
  propertyType: string
  grade: string
  bedrooms: string
  bathrooms: string
  pets: string
  avgNightsBooked: string
  cancellationCount: number
  cancellationRate: string
}) {
  const capacityRows = [
    { icon: BedDouble, value: bedrooms, label: "Beds" },
    { icon: Bath, value: bathrooms, label: "Baths" },
    { icon: Users, value: property.maxOccupancy, label: "Guests" },
  ]

  const specRows = [
    { icon: Home, label: "Property type", value: propertyType },
    { icon: Star, label: "Grade", value: grade },
    { icon: MapPin, label: "Location", value: property.location },
    { icon: BedDouble, label: "Bedrooms", value: `${bedrooms} bed` },
    { icon: Bath, label: "Bathrooms", value: `${bathrooms} bath` },
    {
      icon: PawPrint,
      label: "Pets",
      value: pets,
      highlight: pets.toLowerCase() === "allowed",
    },
  ]

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(240px,288px)_minmax(200px,240px)_minmax(0,1fr)] xl:items-stretch">
        <div className="relative aspect-[21/9] min-h-[180px] overflow-hidden rounded-lg border border-border bg-muted/30 sm:aspect-[2.2/1] xl:aspect-auto xl:min-h-[220px]">
          <img
            src={property.imageUrl}
            alt={`${property.name} exterior`}
            className="absolute inset-0 h-full w-full object-cover object-[center_55%]"
          />
          <ul className="absolute top-3 right-3 flex items-center gap-2 rounded-lg border border-white/25 bg-black/35 px-2.5 py-1.5 shadow-sm backdrop-blur-md">
            {capacityRows.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-1"
                aria-label={`${item.value} ${item.label.toLowerCase()}`}
              >
                <item.icon className="size-3.5 shrink-0 text-white/90" strokeWidth={2} />
                <span className="text-xs font-semibold tabular-nums leading-none text-white">
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
          <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/55 to-transparent p-3 pt-10">
            <button
              type="button"
              className="rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
            >
              12 photos
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Specification
          </h2>
          <dl className="flex min-h-0 flex-1 flex-col">
            {specRows.map((row) => (
              <SpecListRow
                key={row.label}
                icon={row.icon}
                label={row.label}
                value={row.value}
                highlight={row.highlight}
              />
            ))}
          </dl>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-2 gap-px bg-border">
            <HeaderMetricCell
              label="Bookings"
              value={String(property.bookingCount)}
              detail="+2 this month"
              tone="positive"
              chart={{
                variant: "area",
                data: PROPERTY_BOOKINGS_INSIGHT.monthlyTrend,
              }}
            />
            <HeaderMetricCell
              label="Avg stay"
              value={avgNightsBooked}
              detail="Nights per booking"
              tone="neutral"
              chart={{
                variant: "bars",
                data: HEADER_AVG_STAY_BARS,
              }}
            />
            <HeaderMetricCell
              label="Cancellations"
              value={String(cancellationCount)}
              detail={`${cancellationRate}% rate`}
              tone="negative"
              chart={{
                variant: "line",
                data: HEADER_CANCELLATIONS_TREND,
              }}
            />
            <HeaderMetricCell
              label="Occupancy"
              value={PROPERTY_OCCUPANCY.rateLabel}
              detail="12-month rolling"
              tone="neutral"
              chart={{
                variant: "area",
                data: PROPERTY_OCCUPANCY.occupancyTrend,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function PropertyOverviewPanels({
  property,
  onViewAllBookings,
}: {
  property: Property
  onViewAllBookings: () => void
}) {
  const recentBookings = property.bookings.slice(0, 5)

  return (
    <div className="space-y-6">
      <div
        className={cn(
          metricCardGridClass,
          "grid-cols-1 md:grid-cols-2 xl:grid-cols-4 xl:items-stretch"
        )}
      >
        <PropertyPanel
          title="Location"
          className="md:col-span-2 xl:col-span-2"
          action={
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground"
            >
              Open in Maps
              <ExternalLink className="size-3" />
            </button>
          }
        >
          <div className="relative min-h-[132px] overflow-hidden rounded-lg border border-border bg-muted/20">
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(to_right,rgb(0_0_0/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_0_0/0.05)_1px,transparent_1px)] bg-size-[20px_20px]"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-4 text-center">
              <MapPin className="size-4 text-foreground" strokeWidth={2} />
              <p className="text-xs font-semibold text-foreground">{property.postcode}</p>
              <p className="text-[10px] text-muted-foreground">
                {property.county}, {property.country}
              </p>
            </div>
          </div>
        </PropertyPanel>

        <PropertyPanel title="Relationships" className="min-w-0">
          <div className="flex min-w-0 items-stretch pt-1">
            <div className="min-w-0 flex-1 pr-3">
              <RelationshipLogo
                initials={relationshipInitials(property.partner)}
                variant="partner"
              />
              <p className="text-[10px] text-muted-foreground">Booking partner</p>
              <p className="mt-1 text-base font-semibold tracking-tight text-foreground">
                {formatPartnerLabel(property.partner)}
              </p>
            </div>
            <div aria-hidden className="w-px shrink-0 self-stretch bg-border" />
            <div className="min-w-0 flex-1 pl-3">
              <RelationshipLogo
                initials={relationshipInitials(property.brand)}
                variant="brand"
              />
              <p className="text-[10px] text-muted-foreground">Property brand</p>
              <p className="mt-1 text-base font-semibold tracking-tight text-foreground">
                {formatBrandLabel(property.brand)}
              </p>
            </div>
          </div>
        </PropertyPanel>

        <PropertyPanel title="Quick actions" className="min-w-0">
          <ul className="space-y-0.5">
            {["Block dates", "Update pricing", "Message partner", "Generate report"].map(
              (action) => (
                <li key={action}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-md px-1 py-2 text-left text-xs text-foreground transition-colors hover:bg-muted/50"
                  >
                    {action}
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  </button>
                </li>
              )
            )}
          </ul>
        </PropertyPanel>
      </div>

      <PropertyPanel
        title="Recent bookings"
        action={
          <button
            type="button"
            onClick={onViewAllBookings}
            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground"
          >
            View all
            <ChevronRight className="size-3" />
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                <th className="pb-2 pr-3 font-semibold">Ref</th>
                <th className="pb-2 pr-3 font-semibold">Dates</th>
                <th className="pb-2 pr-3 font-semibold">Nights</th>
                <th className="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-3 font-mono text-[10px] text-muted-foreground">
                    {booking.id.slice(4, 12).toUpperCase()}
                  </td>
                  <td className="py-2.5 pr-3 text-foreground">
                    {booking.start} – {booking.end}
                  </td>
                  <td className="py-2.5 pr-3 tabular-nums text-foreground">{booking.nights}</td>
                  <td className="py-2.5">
                    <BookingStatusPill status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PropertyPanel>
    </div>
  )
}

export function PropertyPage({ property, onBack }: PropertyPageProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [listView, setListView] = useState<"list" | "timeline">("list")

  const cancellationCount = property.bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length
  const avgNightsBooked = (
    property.bookings.reduce((sum, booking) => sum + booking.nights, 0) /
    property.bookings.length
  ).toFixed(1)
  const cancellationRate = ((cancellationCount / property.bookings.length) * 100).toFixed(1)
  const propertyType = overviewValue("Type")
  const grade = overviewValue("Grade")
  const bedrooms = overviewValue("Bedrooms")
  const bathrooms = overviewValue("Bathrooms")
  const pets = overviewValue("Pets")

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <PropertyPageHeading
          property={property}
          propertyType={propertyType}
          onBack={onBack}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-5">
          <TabsList className="h-auto w-full justify-start rounded-lg bg-muted p-1">
            {PROPERTY_TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                {tab.id === "bookings" ? `${tab.label} (${property.bookingCount})` : tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-0 space-y-5">
            <PropertyHeroRow
              property={property}
              propertyType={propertyType}
              grade={grade}
              bedrooms={bedrooms}
              bathrooms={bathrooms}
              pets={pets}
              avgNightsBooked={avgNightsBooked}
              cancellationCount={cancellationCount}
              cancellationRate={cancellationRate}
            />
            <PropertyOverviewPanels
              property={property}
              onViewAllBookings={() => setActiveTab("bookings")}
            />
          </TabsContent>

          <TabsContent value="bookings" className="mt-0 space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant={listView === "list" ? "default" : "ghost"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setListView("list")}
              >
                List
              </Button>
              <Button
                variant={listView === "timeline" ? "default" : "ghost"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setListView("timeline")}
              >
                Timeline
              </Button>
            </div>

            {listView === "list" ? (
              <>
                <PropertyBookingsTable bookings={property.bookings} />
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                  <p>
                    Showing 1–{property.bookings.length} of {property.bookings.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs" disabled>
                      ← Prev
                    </Button>
                    <span className="text-xs">Page 1 of 1</span>
                    <Button variant="outline" size="sm" className="h-8 text-xs" disabled>
                      Next →
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/10 py-14 text-center">
                <p className="text-sm font-medium">Timeline view</p>
                <p className="text-sm text-muted-foreground">
                  Booking timeline will be available in a future release.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="financials" className="mt-0">
            <PropertyInsights />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <PropertyDetailsPanel details={WILLOWCROFT_HOUSE_DETAILS} />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
