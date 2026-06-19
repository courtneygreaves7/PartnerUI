import { useState } from "react"
import { ArrowLeft, MapPin } from "lucide-react"

import { PropertyBookingsTable } from "@/components/booking-engine/property-bookings-table"
import { PropertyDetailsPanel } from "@/components/booking-engine/property-details"
import { PropertyInsights } from "@/components/booking-engine/property-insights"
import { DualDataWidget } from "@/components/dual-data-widget"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DataSnapshotWidget } from "@/components/widgets/data-snapshot-widget"
import { HeadlineDataWidget } from "@/components/widgets/headline-data-widget"
import { type Property } from "@/lib/property-data"
import { WILLOWCROFT_HOUSE_DETAILS } from "@/lib/property-details-data"

type PropertyPageProps = {
  property: Property
  onBack: () => void
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

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <nav className="text-xs text-muted-foreground">
              <span>Booking engine</span>
              <span className="mx-2">/</span>
              <span>Properties</span>
              <span className="mx-2">/</span>
              <span className="text-foreground">{property.id}</span>
            </nav>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="shrink-0 text-xs"
            >
              <ArrowLeft className="size-3.5" />
              Back to properties
            </Button>
          </div>

          <h1 className="text-[22px] font-semibold tracking-tight">{property.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {property.postcode}, {property.county}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <div className="flex h-full min-h-0 flex-col gap-3 sm:flex-row">
            <div className="relative min-h-48 flex-1 overflow-hidden rounded-xl border border-border bg-muted/45 sm:min-h-0 dark:bg-muted/20">
              <img
                src={property.imageUrl}
                alt={`${property.name} exterior`}
                className="absolute inset-0 h-full w-full object-cover object-[center_62%]"
              />
            </div>

            <div className="relative min-h-48 flex-1 overflow-hidden rounded-xl border border-border bg-muted/45 sm:min-h-0 dark:bg-muted/20">
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_right,rgb(0_0_0/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_0_0/0.06)_1px,transparent_1px)] bg-size-[28px_28px] dark:bg-[linear-gradient(to_right,rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.06)_1px,transparent_1px)]"
              />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                  <div className="grid size-10 place-items-center rounded-full bg-background shadow-xs">
                    <MapPin className="size-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{property.postcode}</p>
                  <p className="text-xs">
                    {property.county}, {property.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="@container flex min-w-0 flex-col gap-4">
            <HeadlineDataWidget
              title="Bookings"
              value={String(property.bookingCount)}
              label="Total bookings"
            />
            <DualDataWidget
              primaryTitle="Stay profile"
              datasetA={{
                title: "Avg nights",
                value: avgNightsBooked,
                clarification: "Per booking",
              }}
              datasetB={{
                title: "Cancellations",
                value: String(cancellationCount),
                clarification: "All time",
              }}
            />
            <DataSnapshotWidget
              title="At a glance"
              rows={[
                { label: "Partner", value: property.partner },
                { label: "Brand", value: property.brand },
                { label: "Location", value: `${property.postcode}, ${property.county}` },
                { label: "Max occupancy", value: property.maxOccupancy },
              ]}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Tabs defaultValue="bookings" className="gap-5">
            <TabsList className="bg-accent dark:bg-muted">
              <TabsTrigger value="bookings">Bookings ({property.bookingCount})</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="details">Property details</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="space-y-5">
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

            <TabsContent value="insights">
              <PropertyInsights />
            </TabsContent>

            <TabsContent value="details">
              <PropertyDetailsPanel details={WILLOWCROFT_HOUSE_DETAILS} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  )
}
