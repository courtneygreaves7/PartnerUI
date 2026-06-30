import { Search } from "lucide-react"

import { PartnerListItem } from "@/components/booking-engine/partner-list-item"
import { Input } from "@/components/ui/input"
import type { Partner } from "@/lib/booking-engine-data"

type PartnersSidebarProps = {
  partnerSearch: string
  onPartnerSearchChange: (value: string) => void
  filteredPartners: Partner[]
  selectedPartnerId?: string
  maxBookings: number
  onSelectPartner: (partnerId: string) => void
}

export function PartnersSidebar({
  partnerSearch,
  onPartnerSearchChange,
  filteredPartners,
  selectedPartnerId,
  maxBookings,
  onSelectPartner,
}: PartnersSidebarProps) {
  return (
    <aside className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-px bg-border" />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div>
            <h2 className="text-sm font-semibold">Partners</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Select a partner to view brands, policies, and activity.
            </p>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={partnerSearch}
              onChange={(event) => onPartnerSearchChange(event.target.value)}
              className="h-9 rounded-full pl-9 text-xs"
              placeholder="Search partners…"
              aria-label="Search partners"
            />
          </div>

          <div className="space-y-2">
            {filteredPartners.length > 0 ? (
              filteredPartners.map((partner) => (
                <PartnerListItem
                  key={partner.id}
                  partner={partner}
                  selected={partner.id === selectedPartnerId}
                  maxBookings={maxBookings}
                  onSelect={() => onSelectPartner(partner.id)}
                />
              ))
            ) : (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No partners match your search.
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
