import { useState } from "react"
import { Download } from "lucide-react"

import { PartnerCard } from "@/components/booking-engine/partner-card"
import { PropertiesListPage } from "@/components/booking-engine/properties-list-page"
import { PropertyPage } from "@/components/booking-engine/property-page"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DataSnapshotWidget } from "@/components/widgets/data-snapshot-widget"
import { HeadlineDataWidget } from "@/components/widgets/headline-data-widget"
import {
  BOOKING_ENGINE_PARTNERS,
  BOOKING_ENGINE_SUMMARY,
  formatCount,
  formatCurrency,
} from "@/lib/booking-engine-data"
import { MOCK_PROPERTY } from "@/lib/property-data"
import { getPropertiesForPartner } from "@/lib/properties-list-data"

export function BookingEnginePage() {
  const [expandedPartnerId, setExpandedPartnerId] = useState<string>("partner-a")
  const [propertiesPartnerId, setPropertiesPartnerId] = useState<string | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)

  const propertiesPartner = BOOKING_ENGINE_PARTNERS.find(
    (partner) => partner.id === propertiesPartnerId
  )

  if (selectedPropertyId) {
    return (
      <PropertyPage
        property={MOCK_PROPERTY}
        onBack={() => setSelectedPropertyId(null)}
      />
    )
  }

  if (propertiesPartner) {
    return (
      <PropertiesListPage
        partner={propertiesPartner}
        properties={getPropertiesForPartner(propertiesPartner.id)}
        onBack={() => setPropertiesPartnerId(null)}
        onViewProperty={setSelectedPropertyId}
      />
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
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

        <div className="@container min-w-0">
          <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,260px)]">
            <HeadlineDataWidget
              title="Total bookings"
              value={formatCount(BOOKING_ENGINE_SUMMARY.totalBookings)}
              label="Across all partners"
              helpText="Total bookings processed through the booking engine."
            />
            <HeadlineDataWidget
              title="Revenue"
              value={formatCurrency(BOOKING_ENGINE_SUMMARY.totalRevenue, "GBP")}
              label="GBP · all partners"
              helpText="Combined revenue across all partners and brands."
            />
            <div className="@md:col-span-2 @4xl:col-span-1">
              <DataSnapshotWidget
                title="Engine overview"
                rows={[
                  { label: "Partners", value: formatCount(BOOKING_ENGINE_SUMMARY.partners) },
                  { label: "Active brands", value: formatCount(BOOKING_ENGINE_SUMMARY.activeBrands) },
                  { label: "Total properties", value: formatCount(BOOKING_ENGINE_SUMMARY.totalProperties) },
                  { label: "Cancellations", value: formatCount(BOOKING_ENGINE_SUMMARY.totalCancellations) },
                ]}
              />
            </div>
          </div>
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
              onViewProperty={() => setPropertiesPartnerId(partner.id)}
            />
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
