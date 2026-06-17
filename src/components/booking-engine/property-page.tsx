import { useState } from "react"
import {
  ArrowLeft,
  Ban,
  BedDouble,
  CalendarCheck,
  MapPin,
  Moon,
  Users,
} from "lucide-react"

import { PropertyBookingsTable } from "@/components/booking-engine/property-bookings-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Property } from "@/lib/property-data"

type PropertyPageProps = {
  property: Property
  onBack: () => void
}

type SnapshotCard = {
  label: string
  value: string
  subtext?: string
  icon: typeof Users
}

export function PropertyPage({ property, onBack }: PropertyPageProps) {
  const [listView, setListView] = useState<"list" | "timeline">("list")

  const cancellationCount = property.bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length
  const avgNightsBooked = (
    property.bookings.reduce((sum, booking) => sum + booking.nights, 0) /
    property.bookings.length
  ).toFixed(1)

  const snapshotCards: SnapshotCard[] = [
    {
      label: "Partner / brand",
      value: property.partner,
      subtext: property.brand,
      icon: Users,
    },
    {
      label: "Location",
      value: property.location,
      subtext: property.country,
      icon: MapPin,
    },
    {
      label: "Max occupancy",
      value: property.maxOccupancy,
      icon: BedDouble,
    },
    {
      label: "Bookings",
      value: String(property.bookingCount),
      subtext: "total bookings",
      icon: CalendarCheck,
    },
    {
      label: "Avg nights booked",
      value: avgNightsBooked,
      subtext: "per booking",
      icon: Moon,
    },
    {
      label: "Cancellations",
      value: String(cancellationCount),
      subtext: "all time",
      icon: Ban,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to partners
        </button>

        <nav className="mb-3 text-xs text-muted-foreground">
          <span>Booking engine</span>
          <span className="mx-2">/</span>
          <span>Properties</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">{property.id}</span>
        </nav>

        <h1 className="text-[22px] font-semibold tracking-tight">{property.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{property.id}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
            <img
              src={property.imageUrl}
              alt={`${property.name} exterior`}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-[#f3f6f9] dark:bg-muted/20">
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(to_right,rgb(36_55_72/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(36_55_72/0.06)_1px,transparent_1px)] bg-size-[28px_28px]"
            />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                <div className="grid size-10 place-items-center rounded-full bg-background shadow-xs">
                  <MapPin className="size-5 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-foreground">{property.location}</p>
                <p className="text-xs">{property.country}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid auto-rows-fr grid-cols-1 gap-3 min-[900px]:grid-cols-3">
          {snapshotCards.map((card) => (
            <SnapshotCard key={card.label} {...card} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Tabs defaultValue="bookings">
          <TabsList className="bg-[var(--brand-grey-blue)] dark:bg-muted">
            <TabsTrigger value="bookings">Bookings ({property.bookingCount})</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
        </Tabs>

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
      </div>
    </div>
  )
}

function SnapshotCard({ label, value, subtext, icon: Icon }: SnapshotCard) {
  return (
    <Card className="flex h-full flex-col shadow-none">
      <CardHeader className="items-center p-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-3" />
          </div>
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-3 pt-0">
        <p className="text-base font-medium tracking-tight">{value}</p>
        <p className="mt-1 min-h-4 text-[11px] text-muted-foreground">{subtext ?? "\u00a0"}</p>
      </CardContent>
    </Card>
  )
}
