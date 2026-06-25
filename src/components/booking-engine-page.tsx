import { useMemo, useState } from "react"
import {
  Banknote,
  Download,
  LayoutGrid,
  Network,
  PencilLine,
  Plus,
  Search,
  ShoppingCart,
} from "lucide-react"

import {
  PasSummaryMetricCard,
  PAS_BOOKINGS_CHART_STUB,
  PAS_BRANDS_CHART_STUB,
  PAS_PARTNERS_CHART_STUB,
  PAS_REVENUE_CHART_STUB,
  PAS_YTD_MONTH_LABELS,
} from "@/components/booking-engine/pas-summary-metric-card"
import {
  PartnerDetailPanel,
  type PartnerDetailTab,
} from "@/components/booking-engine/partner-detail-panel"
import { PartnerListItem } from "@/components/booking-engine/partner-list-item"
import { PropertyPage } from "@/components/booking-engine/property-page"
import type { BookingEngineView } from "@/components/landing-dashboard-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  BOOKING_ENGINE_PARTNERS,
  BOOKING_ENGINE_SUMMARY,
  formatCount,
  formatCurrency,
  getBrandsTrendContext,
  getBookingsTrendContext,
  getPartnerTags,
  getPartnerTrendContext,
  getRevenueTrendContext,
  type Partner,
} from "@/lib/booking-engine-data"
import { MOCK_PROPERTY } from "@/lib/property-data"

const DEFAULT_PARTNER_ID = BOOKING_ENGINE_PARTNERS[0]?.id ?? ""

function partnerMatchesSearch(partner: Partner, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    partner.name,
    partner.initials,
    partner.dataRoute,
    partner.connectionType,
    ...partner.currencies,
    ...partner.products,
    ...getPartnerTags(partner),
    ...partner.brands.map((brand) => brand.name),
    ...partner.brands.map((brand) => brand.policyGroup),
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(q)
}

function getInitialPasState(initialView: BookingEngineView) {
  switch (initialView) {
    case "properties":
      return {
        selectedPartnerId: DEFAULT_PARTNER_ID,
        initialTab: "properties" as PartnerDetailTab,
        editorMode: false,
      }
    case "bookings":
      return {
        selectedPartnerId: DEFAULT_PARTNER_ID,
        initialTab: "bookings" as PartnerDetailTab,
        editorMode: false,
      }
    case "partners":
    default:
      return {
        selectedPartnerId: DEFAULT_PARTNER_ID,
        initialTab: "overview" as PartnerDetailTab,
        editorMode: false,
      }
  }
}

type BookingEnginePageProps = {
  initialView?: BookingEngineView
}

export function BookingEnginePage({ initialView = "partners" }: BookingEnginePageProps) {
  const initialState = getInitialPasState(initialView)
  const [selectedPartnerId, setSelectedPartnerId] = useState(initialState.selectedPartnerId)
  const [activeTab, setActiveTab] = useState<PartnerDetailTab>(initialState.initialTab)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [editorMode] = useState(initialState.editorMode)
  const [partnerSearch, setPartnerSearch] = useState("")

  const filteredPartners = useMemo(
    () => BOOKING_ENGINE_PARTNERS.filter((partner) => partnerMatchesSearch(partner, partnerSearch)),
    [partnerSearch]
  )

  const selectedPartner =
    BOOKING_ENGINE_PARTNERS.find((partner) => partner.id === selectedPartnerId) ??
    filteredPartners[0] ??
    BOOKING_ENGINE_PARTNERS[0]

  const maxPartnerBookings = useMemo(
    () => Math.max(...BOOKING_ENGINE_PARTNERS.map((partner) => partner.activity.bookings)),
    []
  )

  if (selectedPropertyId) {
    return (
      <PropertyPage
        property={MOCK_PROPERTY}
        onBack={() => setSelectedPropertyId(null)}
      />
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <div className="shrink-0 space-y-4 border-b border-border pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-[180px]">
              <h1 className="text-[22px] font-semibold tracking-tight">Partners &amp; policies</h1>
              <p className="mt-1 text-sm text-muted-foreground">YTD to June 2026</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="h-9 gap-2 text-xs">
                <Download className="size-3.5" />
                Export
              </Button>
              <Button className="h-9 gap-2 text-xs">
                <Plus className="size-3.5" />
                Add partner
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <PasSummaryMetricCard
              title="Total bookings (sales)"
              value={formatCount(BOOKING_ENGINE_SUMMARY.totalBookings)}
              icon={ShoppingCart}
              trendLabel="+12%"
              trendContext={getBookingsTrendContext()}
              chartValues={PAS_BOOKINGS_CHART_STUB}
              chartLabels={PAS_YTD_MONTH_LABELS}
            />
            <PasSummaryMetricCard
              title="Total revenue (GBP)"
              value={formatCurrency(BOOKING_ENGINE_SUMMARY.totalRevenue, "GBP")}
              icon={Banknote}
              trendLabel="+5.4%"
              trendContext={getRevenueTrendContext()}
              chartValues={PAS_REVENUE_CHART_STUB}
              chartLabels={PAS_YTD_MONTH_LABELS}
            />
            <PasSummaryMetricCard
              title="Connected partners"
              value={String(BOOKING_ENGINE_SUMMARY.partners)}
              icon={Network}
              trendLabel="+17%"
              trendContext={getPartnerTrendContext()}
              chartValues={PAS_PARTNERS_CHART_STUB}
              chartLabels={PAS_YTD_MONTH_LABELS}
            />
            <PasSummaryMetricCard
              title="Active brands"
              value={String(BOOKING_ENGINE_SUMMARY.activeBrands)}
              icon={LayoutGrid}
              trendLabel="+8%"
              trendContext={getBrandsTrendContext()}
              chartValues={PAS_BRANDS_CHART_STUB}
              chartLabels={PAS_YTD_MONTH_LABELS}
            />
          </div>
        </div>

        {editorMode ? (
          <div className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
            <PencilLine className="size-3.5 shrink-0 text-foreground" />
            <span>
              Editor mode — open the Brands tab and use Edit rates to update policy values.
            </span>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[232px_minmax(0,1fr)] lg:items-stretch">
          <div className="contents lg:block lg:relative lg:min-h-0">
            <aside className="flex min-h-0 flex-col lg:absolute lg:inset-0">
              <p className="mb-3 shrink-0 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              {partnerSearch.trim()
                ? `${filteredPartners.length} of ${BOOKING_ENGINE_PARTNERS.length} partners`
                : `${BOOKING_ENGINE_PARTNERS.length} partners`}
            </p>
            <div className="relative mb-3 shrink-0">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={partnerSearch}
                onChange={(event) => {
                  const query = event.target.value
                  setPartnerSearch(query)
                  const matches = BOOKING_ENGINE_PARTNERS.filter((partner) =>
                    partnerMatchesSearch(partner, query)
                  )
                  if (
                    matches.length > 0 &&
                    !matches.some((partner) => partner.id === selectedPartnerId)
                  ) {
                    setSelectedPartnerId(matches[0].id)
                  }
                }}
                className="h-9 pl-9 text-xs"
                placeholder="Search partners…"
                aria-label="Search partners"
              />
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {filteredPartners.length > 0 ? (
                filteredPartners.map((partner) => (
                  <PartnerListItem
                    key={partner.id}
                    partner={partner}
                    selected={partner.id === selectedPartner?.id}
                    maxBookings={maxPartnerBookings}
                    onSelect={() => setSelectedPartnerId(partner.id)}
                  />
                ))
              ) : (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                  No partners match your search.
                </p>
              )}
            </div>
            </aside>
          </div>

          <main className="flex min-h-0 min-w-0 flex-col">
            {selectedPartner ? (
              <PartnerDetailPanel
                partner={selectedPartner}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onViewProperty={setSelectedPropertyId}
              />
            ) : null}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
