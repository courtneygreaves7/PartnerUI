import { ArrowLeft, X } from "lucide-react"

import { PropertiesTable } from "@/components/booking-engine/properties-table"
import { DualDataWidget } from "@/components/dual-data-widget"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { HeadlineDataWidget } from "@/components/widgets/headline-data-widget"
import { formatCount, type Partner } from "@/lib/booking-engine-data"
import { type PropertyListItem } from "@/lib/properties-list-data"

type PropertiesListPageProps = {
  partner: Partner
  properties: PropertyListItem[]
  onBack: () => void
  onViewProperty: (propertyId: string) => void
}

export function PropertiesListPage({
  partner,
  properties,
  onBack,
  onViewProperty,
}: PropertiesListPageProps) {
  const totalBookings = properties.reduce((sum, property) => sum + property.bookings, 0)

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <nav className="text-xs text-muted-foreground">
              <span>Booking engine</span>
              <span className="mx-2">/</span>
              <span className="text-foreground">Properties</span>
            </nav>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="shrink-0 text-xs"
            >
              <ArrowLeft className="size-3.5" />
              Back to partners
            </Button>
          </div>

          <h1 className="text-[22px] font-semibold tracking-tight">Properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">{partner.name}</p>
        </div>

        <div className="@container min-w-0">
          <div className="grid grid-cols-1 gap-4 @md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
            <HeadlineDataWidget
              title="Properties"
              value={formatCount(partner.activity.properties)}
              label={`Listed for ${partner.name}`}
            />
            <DualDataWidget
              primaryTitle="Partner activity"
              datasetA={{
                title: "Bookings",
                value: formatCount(partner.activity.bookings),
                clarification: `${formatCount(totalBookings)} in this list`,
              }}
              datasetB={{
                title: "With CAL",
                value: formatCount(partner.activity.withCal),
                clarification: `${formatCount(partner.activity.withDdl)} with DDL`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/50 px-4 py-3">
          <p className="text-sm text-foreground">
            Showing properties for <span className="font-semibold">{partner.name}</span>
          </p>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear filter
            <X className="size-3.5" />
          </button>
        </div>

        <PropertiesTable properties={properties} onViewProperty={onViewProperty} />

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>
            Showing 1–{properties.length} of {formatCount(partner.activity.properties)}
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
      </div>
    </TooltipProvider>
  )
}
