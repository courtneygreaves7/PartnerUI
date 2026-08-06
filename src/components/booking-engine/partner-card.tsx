import { useState } from "react"
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react"

import { PolicyRatesTable } from "@/components/booking-engine/policy-rates-table"
import { PartnerVolumeWidget } from "@/components/booking-engine/partner-volume-widget"
import { Button } from "@/components/ui/button"
import {
  formatBrandLabel,
  formatCount,
  type Partner,
} from "@/lib/booking-engine-data"
import { cn } from "@/lib/utils"

type PartnerCardProps = {
  partner: Partner
  expanded: boolean
  onToggle: () => void
  onViewProperty?: () => void
}

export function PartnerCard({ partner, expanded, onToggle, onViewProperty }: PartnerCardProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(
    partner.brands[0]?.id ?? null
  )

  const visiblePolicies = partner.policies
  const calPct =
    partner.activity.bookings > 0
      ? `${Math.round((partner.activity.withCal / partner.activity.bookings) * 100)}%`
      : "0%"
  const ddlPct =
    partner.activity.bookings > 0
      ? `${Math.round((partner.activity.withDdl / partner.activity.bookings) * 100)}%`
      : "0%"

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-4 px-6 py-4">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{partner.name}</p>
          <p className="text-xs text-muted-foreground">Data route: {partner.dataRoute}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            View bookings
            <ArrowRight className="size-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={onViewProperty}
          >
            View properties
            <ArrowRight className="size-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 shrink-0"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? `Collapse ${partner.name}` : `Expand ${partner.name}`}
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border">
          <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-stretch">
            <aside className="flex flex-col gap-4 border-border px-5 py-5 dark:bg-card lg:border-r">
              <PartnerVolumeWidget
                productSplit={{
                  datasetA: {
                    title: "With Flexible Cancellation",
                    value: formatCount(partner.activity.withCal),
                    clarification: `${calPct} of bookings`,
                  },
                  datasetB: {
                    title: "With Damage Deposit Waiver",
                    value: formatCount(partner.activity.withDdl),
                    clarification: `${ddlPct} of bookings`,
                  },
                }}
                volume={{
                  datasetA: {
                    title: "Sales",
                    value: formatCount(partner.activity.bookings),
                    clarification: "Total bookings",
                  },
                  datasetB: {
                    title: "Properties",
                    value: formatCount(partner.activity.properties),
                    clarification: "On platform",
                  },
                }}
              />

              <div>
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  Currencies
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {partner.currencies.map((currency) => (
                    <span
                      key={currency}
                      className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium"
                    >
                      {currency}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  Brands
                </p>
                <ul className="mt-3 space-y-2">
                  {partner.brands.map((brand) => (
                    <li key={brand.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedBrandId(brand.id)}
                        className={cn(
                          "w-full rounded-lg px-3.5 py-3 text-left transition-colors",
                          selectedBrandId === brand.id
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <p className="text-sm font-medium">{formatBrandLabel(brand.name)}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="bg-[var(--panel-bg)] px-7 py-7 dark:bg-canvas">
              <p className="mb-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Product rates
              </p>
              <PolicyRatesTable policies={visiblePolicies} selectedBrandId={selectedBrandId} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
