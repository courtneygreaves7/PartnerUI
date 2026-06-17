import { useState } from "react"
import {
  CalendarCheck,
  Download,
  Home,
  Zap,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react"

import { PartnerCard } from "@/components/booking-engine/partner-card"
import { PropertyPage } from "@/components/booking-engine/property-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  BOOKING_ENGINE_PARTNERS,
  BOOKING_ENGINE_SUMMARY,
  formatCount,
} from "@/lib/booking-engine-data"
import { MOCK_PROPERTY } from "@/lib/property-data"

const summaryItems: { label: string; value: string; icon: LucideIcon }[] = [
  { label: "Partners", value: formatCount(BOOKING_ENGINE_SUMMARY.partners), icon: Users },
  {
    label: "Active brands",
    value: formatCount(BOOKING_ENGINE_SUMMARY.activeBrands),
    icon: Tags,
  },
  {
    label: "Total bookings",
    value: formatCount(BOOKING_ENGINE_SUMMARY.totalBookings),
    icon: CalendarCheck,
  },
  {
    label: "Total properties",
    value: formatCount(BOOKING_ENGINE_SUMMARY.totalProperties),
    icon: Home,
  },
]

export function BookingEnginePage() {
  const [expandedPartnerId, setExpandedPartnerId] = useState<string>("partner-a")
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)

  if (selectedPropertyId) {
    return (
      <PropertyPage
        property={MOCK_PROPERTY}
        onBack={() => setSelectedPropertyId(null)}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1">
            <Zap className="size-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Booking engine
            </span>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight">Partners &amp; policies</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Configure partner connections, manage brands, and review active policy rates across the
            booking engine.
          </p>
        </div>

        <Button className="text-xs">
          <Download className="size-3.5" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="items-center">
              <div className="flex items-center gap-2">
                <div className="grid size-7 place-items-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-3.5" />
                </div>
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  {label}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-medium tracking-tight tabular-nums">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {BOOKING_ENGINE_PARTNERS.map((partner) => (
          <PartnerCard
            key={partner.id}
            partner={partner}
            expanded={expandedPartnerId === partner.id}
            onToggle={() =>
              setExpandedPartnerId((current) =>
                current === partner.id ? "" : partner.id
              )
            }
            onViewProperty={() => setSelectedPropertyId(MOCK_PROPERTY.id)}
          />
        ))}
      </div>
    </div>
  )
}
