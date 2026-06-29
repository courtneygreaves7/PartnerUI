import { ArrowRight } from "lucide-react"

import {
  formatCompactCount,
  getPartnerTags,
  type Partner,
} from "@/lib/booking-engine-data"
import { cn } from "@/lib/utils"

type PartnerListItemProps = {
  partner: Partner
  selected: boolean
  maxBookings: number
  onSelect: () => void
}

export function PartnerListItem({
  partner,
  selected,
  maxBookings,
  onSelect,
}: PartnerListItemProps) {
  const tags = getPartnerTags(partner).slice(0, 2)
  const volumePct = maxBookings > 0 ? (partner.activity.bookings / maxBookings) * 100 : 0

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border px-3 py-3 text-left transition-colors",
        selected
          ? "border-foreground/25 bg-muted/50"
          : "border-border bg-card hover:bg-muted/30"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-semibold text-foreground">{partner.name}</p>
        {selected ? (
          <ArrowRight
            className="size-4 shrink-0 text-foreground"
            strokeWidth={2}
            aria-hidden
          />
        ) : null}
      </div>
      {partner.onboarding?.status === "draft" ? (
        <span className="mt-1 inline-flex rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Draft
        </span>
      ) : null}
      <div className="mt-1.5 flex items-center gap-2 text-[11px]">
        <span className="font-semibold tabular-nums text-foreground">
          {partner.brands.length} brands
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="font-semibold tabular-nums text-foreground">
          {formatCompactCount(partner.activity.properties)} props
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Volume</span>
          <span className="font-semibold tabular-nums text-foreground">
            {formatCompactCount(partner.activity.bookings)}
          </span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground/35"
            style={{ width: `${volumePct}%` }}
          />
        </div>
      </div>
    </button>
  )
}
