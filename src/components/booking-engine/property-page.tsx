import { useState, type ReactNode } from "react"
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Calendar,
  ChevronRight,
  ExternalLink,
  MapPin,
  Users,
  XCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { PropertyBookingsTable } from "@/components/booking-engine/property-bookings-table"
import { PropertyDetailsPanel } from "@/components/booking-engine/property-details"
import { PropertyInsights } from "@/components/booking-engine/property-insights"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { formatBrandLabel } from "@/lib/booking-engine-data"
import { type Property, type PropertyBooking } from "@/lib/property-data"
import { WILLOWCROFT_HOUSE_DETAILS } from "@/lib/property-details-data"
import { cn } from "@/lib/utils"

type PropertyPageProps = {
  property: Property
  onBack: () => void
}

function overviewValue(label: string) {
  return WILLOWCROFT_HOUSE_DETAILS.overview.find((field) => field.label === label)?.value ?? "—"
}

function formatPartnerLabel(name: string) {
  return name.replace(/^Partner /, "")
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

function PropertyStatCard({
  title,
  value,
  subtitle,
  trend,
  trendTone = "neutral",
  icon: Icon,
  className,
}: {
  title: string
  value: string
  subtitle: string
  trend?: string
  trendTone?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  className?: string
}) {
  return (
    <article
      className={cn(
        "flex min-w-0 flex-col rounded-xl border border-border bg-card p-4 shadow-xs",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </p>
        <Icon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2} />
      </div>
      <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
      {trend ? (
        <p
          className={cn(
            "mt-1.5 text-[11px] font-medium",
            trendTone === "positive" && "text-emerald-600 dark:text-emerald-400",
            trendTone === "negative" && "text-red-600 dark:text-red-400",
            trendTone === "neutral" && "text-muted-foreground"
          )}
        >
          {trend}
        </p>
      ) : null}
    </article>
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

function PropertyOverviewTab({
  property,
  avgNightsBooked,
  cancellationCount,
  cancellationRate,
  onViewAllBookings,
}: {
  property: Property
  avgNightsBooked: string
  cancellationCount: number
  cancellationRate: string
  onViewAllBookings: () => void
}) {
  const propertyType = overviewValue("Type")
  const grade = overviewValue("Grade")
  const bedrooms = overviewValue("Bedrooms")
  const bathrooms = overviewValue("Bathrooms")
  const pets = overviewValue("Pets")
  const recentBookings = property.bookings.slice(0, 5)
  const specificationRows = [
    { label: "Property type", value: propertyType },
    { label: "Grade", value: grade },
    { label: "Location", value: property.location },
    { label: "Bedrooms", value: `${bedrooms} bed` },
    { label: "Bathrooms", value: `${bathrooms} bath` },
    {
      label: "Pets",
      value: pets,
      highlight: pets.toLowerCase() === "allowed",
    },
  ]
  const capacityRows = [
    { icon: BedDouble, value: bedrooms, label: "Beds" },
    { icon: Bath, value: bathrooms, label: "Baths" },
    { icon: Users, value: property.maxOccupancy, label: "Guests" },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(220px,280px)_minmax(300px,380px)_minmax(0,1fr)_minmax(0,1fr)] xl:items-stretch">
        <div className="relative aspect-[5/4] overflow-hidden rounded-xl border border-border bg-muted/30 sm:aspect-auto sm:min-h-[200px] xl:col-start-1 xl:row-span-2 xl:min-h-0">
          <img
            src={property.imageUrl}
            alt={`${property.name} exterior`}
            className="absolute inset-0 h-full w-full object-cover object-[center_62%]"
          />
          <ul className="absolute right-3 top-3 flex items-center gap-2.5 rounded-lg border border-white/25 bg-black/35 px-2.5 py-1.5 shadow-sm backdrop-blur-md">
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
          <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/55 to-transparent p-3 pt-12">
            <button
              type="button"
              className="rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
            >
              12 photos
            </button>
          </div>
        </div>

        <PropertyPanel title="Specification" className="xl:col-start-2 xl:row-span-2">
          <dl className="space-y-0">
            {specificationRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0 xl:py-2.5"
              >
                <dt className="text-xs text-muted-foreground">{row.label}</dt>
                <dd className="text-right text-xs font-semibold text-foreground">
                  {"highlight" in row && row.highlight ? (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-400">
                      {row.value}
                    </span>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </PropertyPanel>

        <PropertyStatCard
          title="Total bookings"
          value={String(property.bookingCount)}
          subtitle="All time"
          trend="+2 this month"
          trendTone="positive"
          icon={Calendar}
          className="xl:col-start-3 xl:row-start-1"
        />
        <PropertyStatCard
          title="Avg. stay length"
          value={avgNightsBooked}
          subtitle="Nights per booking"
          trend="Above average"
          trendTone="positive"
          icon={BedDouble}
          className="xl:col-start-4 xl:row-start-1"
        />
        <PropertyStatCard
          title="Cancellations"
          value={String(cancellationCount)}
          subtitle="All time"
          trend={`${cancellationRate}% rate`}
          trendTone="negative"
          icon={XCircle}
          className="xl:col-start-3 xl:row-start-2"
        />
        <PropertyStatCard
          title="Max occupancy"
          value={property.maxOccupancy}
          subtitle="Guests capacity"
          trend={`${bedrooms} bedrooms`}
          trendTone="neutral"
          icon={Users}
          className="xl:col-start-4 xl:row-start-2"
        />

        <PropertyPanel
          title="Location"
          className="xl:col-span-2 xl:col-start-1 xl:row-start-3"
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
          <div className="relative min-h-[140px] overflow-hidden rounded-lg border border-border bg-muted/20">
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

        <PropertyPanel title="Relationships" className="min-w-0 xl:col-start-3 xl:row-start-3">
          <div className="flex min-w-0 items-stretch">
            <div className="min-w-0 flex-1 pr-3">
              <p className="text-[10px] text-muted-foreground">Booking partner</p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                {formatPartnerLabel(property.partner)}
              </p>
              <p className="mt-0.5 text-[10px] italic text-muted-foreground">Connected partner</p>
            </div>
            <div aria-hidden className="w-px shrink-0 self-stretch bg-border" />
            <div className="min-w-0 flex-1 pl-3">
              <p className="text-[10px] text-muted-foreground">Property brand</p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                {formatBrandLabel(property.brand)}
              </p>
              <p className="mt-0.5 text-[10px] italic text-muted-foreground">Active brand policy</p>
            </div>
          </div>
        </PropertyPanel>

        <PropertyPanel title="Quick actions" className="min-w-0 xl:col-start-4 xl:row-start-3">
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

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-800 uppercase dark:text-amber-300">
                Active
              </span>
              <span className="text-xs text-muted-foreground">
                {propertyType} · {property.location}, {property.county}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {property.name}
            </h1>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-5">
          <TabsList className="h-auto w-full justify-start rounded-lg bg-muted p-1">
            {[
              { id: "overview", label: "Overview" },
              { id: "bookings", label: `Bookings (${property.bookingCount})` },
              { id: "insights", label: "Insights" },
              { id: "details", label: "Details" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <PropertyOverviewTab
              property={property}
              avgNightsBooked={avgNightsBooked}
              cancellationCount={cancellationCount}
              cancellationRate={cancellationRate}
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

          <TabsContent value="insights" className="mt-0">
            <PropertyInsights />
          </TabsContent>

          <TabsContent value="details" className="mt-0">
            <PropertyDetailsPanel details={WILLOWCROFT_HOUSE_DETAILS} />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
