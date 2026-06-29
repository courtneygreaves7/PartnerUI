import { useMemo, useState } from "react"
import {
  Download,
  FileText,
  PencilLine,
  Plus,
  Search,
} from "lucide-react"

import {
  PartnerDetailPanel,
  type PartnerDetailTab,
} from "@/components/booking-engine/partner-detail-panel"
import { AddPartnerPage } from "@/components/booking-engine/add-partner-page"
import { AddPolicyPage } from "@/components/booking-engine/add-policy-page"
import { PartnerListItem } from "@/components/booking-engine/partner-list-item"
import { PropertyPage } from "@/components/booking-engine/property-page"
import type { BookingEngineAction, BookingEngineView } from "@/components/landing-dashboard-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  getPartnerTags,
  type AddPartnerFormValues,
  type AddPolicyFormValues,
  type Partner,
} from "@/lib/booking-engine-data"
import {
  addPasPartner,
  addPasPolicy,
  deletePasPartner,
  deletePasPolicy,
  getPasPartners,
  getPasPolicyDetails,
  isUserAddedPartner,
  isUserAddedPolicy,
  updatePasPartnerBrand,
} from "@/lib/partner-store"
import { MOCK_PROPERTY } from "@/lib/property-data"

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
    partner.onboarding?.contactName,
    partner.onboarding?.contactEmail,
    partner.onboarding?.accountManager,
    partner.onboarding?.partnerGroup,
    partner.onboarding?.city,
    partner.onboarding?.postcode,
    partner.onboarding?.propertyManagementSystem,
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(q)
}

function getInitialPasState(initialView: BookingEngineView, partners: Partner[]) {
  const defaultPartnerId = partners[0]?.id ?? ""

  switch (initialView) {
    case "properties":
      return {
        selectedPartnerId: defaultPartnerId,
        initialTab: "properties" as PartnerDetailTab,
        editorMode: false,
      }
    case "bookings":
      return {
        selectedPartnerId: defaultPartnerId,
        initialTab: "bookings" as PartnerDetailTab,
        editorMode: false,
      }
    case "partners":
    default:
      return {
        selectedPartnerId: defaultPartnerId,
        initialTab: "overview" as PartnerDetailTab,
        editorMode: false,
      }
  }
}

type BookingEnginePageProps = {
  initialView?: BookingEngineView
  initialAction?: BookingEngineAction
}

export function BookingEnginePage({
  initialView = "partners",
  initialAction,
}: BookingEnginePageProps) {
  const [partners, setPartners] = useState<Partner[]>(() => getPasPartners())
  const initialState = getInitialPasState(initialView, partners)
  const [selectedPartnerId, setSelectedPartnerId] = useState(initialState.selectedPartnerId)
  const [activeTab, setActiveTab] = useState<PartnerDetailTab>(initialState.initialTab)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [editorMode] = useState(initialState.editorMode)
  const [partnerSearch, setPartnerSearch] = useState("")
  const [showAddPartner, setShowAddPartner] = useState(initialAction === "add-partner")
  const [showAddPolicy, setShowAddPolicy] = useState(initialAction === "add-policy")

  const filteredPartners = useMemo(
    () => partners.filter((partner) => partnerMatchesSearch(partner, partnerSearch)),
    [partners, partnerSearch]
  )

  const selectedPartner =
    partners.find((partner) => partner.id === selectedPartnerId) ??
    filteredPartners[0] ??
    partners[0]

  const maxPartnerBookings = useMemo(
    () => Math.max(1, ...partners.map((partner) => partner.activity.bookings)),
    [partners]
  )

  function refreshPartners() {
    setPartners(getPasPartners())
  }

  function handleAddPartner(values: AddPartnerFormValues) {
    const partner = addPasPartner(values)
    refreshPartners()
    setSelectedPartnerId(partner.id)
    setActiveTab("overview")
    setPartnerSearch("")
    setShowAddPartner(false)
  }

  function handleAddPolicy(values: AddPolicyFormValues) {
    addPasPolicy(values.partnerId, values)
    refreshPartners()
    setSelectedPartnerId(values.partnerId)
    setActiveTab("brands")
    setPartnerSearch("")
    setShowAddPolicy(false)
  }

  function handleDeletePartner() {
    if (!selectedPartner) return
    if (deletePasPartner(selectedPartner.id)) {
      const nextPartners = getPasPartners()
      setPartners(nextPartners)
      setSelectedPartnerId(nextPartners[0]?.id ?? "")
    }
  }

  function handleDeletePolicy(policyId: string) {
    if (deletePasPolicy(policyId)) {
      refreshPartners()
    }
  }

  function handleBrandUpdate(brandId: string, updates: { name: string; policyGroup: string }) {
    if (!selectedPartner) return
    if (updatePasPartnerBrand(selectedPartner.id, brandId, updates)) {
      refreshPartners()
    }
  }

  if (showAddPolicy) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <AddPolicyPage
          partners={partners}
          initialPartnerId={selectedPartnerId}
          onBack={() => setShowAddPolicy(false)}
          onSubmit={handleAddPolicy}
        />
      </div>
    )
  }

  if (showAddPartner) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <AddPartnerPage
          onBack={() => setShowAddPartner(false)}
          onSubmit={handleAddPartner}
        />
      </div>
    )
  }

  if (selectedPropertyId) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <PropertyPage
          property={MOCK_PROPERTY}
          onBack={() => setSelectedPropertyId(null)}
        />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-0 flex-1 flex-col gap-5">
        <div className="shrink-0 border-b border-border pb-5">
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
              <Button
                variant="outline"
                className="h-9 gap-2 text-xs"
                onClick={() => setShowAddPolicy(true)}
              >
                <FileText className="size-3.5" />
                Add policy
              </Button>
              <Button
                className="h-9 gap-2 text-xs"
                onClick={() => setShowAddPartner(true)}
              >
                <Plus className="size-3.5" />
                Add partner
              </Button>
            </div>
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

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[232px_minmax(0,1fr)] lg:items-stretch">
          <aside className="flex min-h-0 flex-col overflow-hidden">
            <div className="relative mb-3 shrink-0">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={partnerSearch}
                onChange={(event) => {
                  const query = event.target.value
                  setPartnerSearch(query)
                  const matches = partners.filter((partner) =>
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

          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {selectedPartner ? (
              <PartnerDetailPanel
                partner={selectedPartner}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onViewProperty={setSelectedPropertyId}
                canDeletePartner={isUserAddedPartner(selectedPartner.id)}
                canEditBrand={isUserAddedPartner(selectedPartner.id)}
                canDeletePolicy={isUserAddedPolicy}
                getPolicyDetails={getPasPolicyDetails}
                onDeletePartner={handleDeletePartner}
                onDeletePolicy={handleDeletePolicy}
                onBrandUpdate={handleBrandUpdate}
              />
            ) : null}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
