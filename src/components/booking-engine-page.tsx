import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import {
  BarChart3,
  FileText,
  Package,
  PencilLine,
  Users,
} from "lucide-react"

import {
  PartnerDetailPanel,
  type PartnerDetailTab,
} from "@/components/booking-engine/partner-detail-panel"
import { AddPartnerPage } from "@/components/booking-engine/add-partner-page"
import { PartnerProfilePage } from "@/components/booking-engine/partner-profile-page"
import { AddPolicyPage } from "@/components/booking-engine/add-policy-page"
import { AddProductPage } from "@/components/booking-engine/add-product-page"
import { AddCapacityPage } from "@/components/booking-engine/add-capacity-page"
import { PartnersSidebar } from "@/components/booking-engine/partners-sidebar"
import { PropertyPage } from "@/components/booking-engine/property-page"
import type { BookingEngineAction, BookingEngineView } from "@/components/landing-dashboard-page"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  getPartnerTags,
  partnerToFormValues,
  type AddPartnerFormValues,
  type AddPolicyFormValues,
  type AddProductFormValues,
  type AddCapacityFormValues,
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
  updatePasPartner,
  updatePasPartnerBrand,
} from "@/lib/partner-store"
import { addPasCapacity, addPasProduct } from "@/lib/pas-catalog-store"
import { ScrollResetContainer } from "@/components/scroll-reset-container"
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
  sidebarMount?: HTMLElement | null
  onPartnersListVisibleChange?: (visible: boolean) => void
}

export function BookingEnginePage({
  initialView = "partners",
  initialAction,
  sidebarMount = null,
  onPartnersListVisibleChange,
}: BookingEnginePageProps) {
  const { toast } = useToast()
  const [partners, setPartners] = useState<Partner[]>(() => getPasPartners())
  const initialState = getInitialPasState(initialView, partners)
  const [selectedPartnerId, setSelectedPartnerId] = useState(initialState.selectedPartnerId)
  const [activeTab, setActiveTab] = useState<PartnerDetailTab>(initialState.initialTab)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [editorMode] = useState(initialState.editorMode)
  const [partnerSearch, setPartnerSearch] = useState("")
  const [showAddPartner, setShowAddPartner] = useState(initialAction === "add-partner")
  const [showAddPolicy, setShowAddPolicy] = useState(initialAction === "add-policy")
  const [showAddProduct, setShowAddProduct] = useState(initialAction === "add-product")
  const [showAddCapacity, setShowAddCapacity] = useState(initialAction === "add-capacity")
  const [partnerProfileId, setPartnerProfileId] = useState<string | null>(null)
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null)

  const filteredPartners = useMemo(
    () => partners.filter((partner) => partnerMatchesSearch(partner, partnerSearch)),
    [partners, partnerSearch]
  )

  const selectedPartner =
    partners.find((partner) => partner.id === selectedPartnerId) ??
    filteredPartners[0] ??
    partners[0]

  const profilePartner =
    partners.find((partner) => partner.id === partnerProfileId) ??
    (partnerProfileId ? selectedPartner : undefined)

  const editingPartner =
    partners.find((partner) => partner.id === editingPartnerId) ?? undefined

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
    toast({
      title: "Partner added",
      description: `${partner.name} is now in PAS.`,
    })
  }

  function handleAddPolicy(values: AddPolicyFormValues) {
    const policy = addPasPolicy(values.partnerId, values)
    const partner = partners.find((item) => item.id === values.partnerId)
    refreshPartners()
    setSelectedPartnerId(values.partnerId)
    setActiveTab("brands")
    setPartnerSearch("")
    setShowAddPolicy(false)
    toast({
      title: "Policy added",
      description: `${policy.name} added to ${partner?.name ?? "partner"}.`,
    })
  }

  function handleDeletePartner(targetPartnerId?: string) {
    const partnerId = targetPartnerId ?? selectedPartner?.id
    if (!partnerId) return
    if (deletePasPartner(partnerId)) {
      const nextPartners = getPasPartners()
      setPartners(nextPartners)
      setSelectedPartnerId(nextPartners[0]?.id ?? "")
      setPartnerProfileId(null)
      setEditingPartnerId(null)
    }
  }

  function handleUpdatePartner(values: AddPartnerFormValues) {
    if (!editingPartnerId) return
    const updated = updatePasPartner(editingPartnerId, values)
    if (!updated) return

    refreshPartners()
    setSelectedPartnerId(updated.id)
    setPartnerProfileId(updated.id)
    setEditingPartnerId(null)
    toast({
      title: "Partner updated",
      description: `${updated.name} has been saved.`,
    })
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

  function handleAddProduct(values: AddProductFormValues) {
    const product = addPasProduct(values)
    setShowAddProduct(false)
    toast({
      title: "Product added",
      description: `${product.name} is ready to use.`,
    })
  }

  function handleAddCapacity(values: AddCapacityFormValues) {
    const provider = addPasCapacity(values)
    setShowAddCapacity(false)
    toast({
      title: "Capacity added",
      description: `${provider.name} provider has been added.`,
    })
  }

  const detailContentResetKey = [
    selectedPartnerId,
    selectedPropertyId,
    partnerProfileId,
    editingPartnerId,
  ].join("|")

  const isPartnersListView = !(
    editingPartner ||
    (profilePartner && partnerProfileId) ||
    showAddCapacity ||
    showAddProduct ||
    showAddPolicy ||
    showAddPartner ||
    selectedPropertyId
  )

  useEffect(() => {
    onPartnersListVisibleChange?.(isPartnersListView)
    return () => onPartnersListVisibleChange?.(false)
  }, [isPartnersListView, onPartnersListVisibleChange])

  function handlePartnerSearchChange(query: string) {
    setPartnerSearch(query)
    const matches = partners.filter((partner) => partnerMatchesSearch(partner, query))
    if (matches.length > 0 && !matches.some((partner) => partner.id === selectedPartnerId)) {
      setSelectedPartnerId(matches[0].id)
    }
  }

  const partnersSidebar =
    isPartnersListView && sidebarMount
      ? createPortal(
          <PartnersSidebar
            partnerSearch={partnerSearch}
            onPartnerSearchChange={handlePartnerSearchChange}
            filteredPartners={filteredPartners}
            selectedPartnerId={selectedPartner?.id}
            maxBookings={maxPartnerBookings}
            onSelectPartner={setSelectedPartnerId}
          />,
          sidebarMount
        )
      : null

  if (editingPartner) {
    return (
      <ScrollResetContainer
        resetKey={`edit-partner-${editingPartnerId}`}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        <AddPartnerPage
          initialValues={partnerToFormValues(editingPartner)}
          pageTitle={`Edit ${editingPartner.name}`}
          submitLabel="Save changes"
          onBack={() => setEditingPartnerId(null)}
          onSubmit={handleUpdatePartner}
        />
      </ScrollResetContainer>
    )
  }

  if (profilePartner && partnerProfileId) {
    return (
      <ScrollResetContainer
        resetKey={`profile-${partnerProfileId}`}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        <PartnerProfilePage
          partner={profilePartner}
          canEdit={isUserAddedPartner(profilePartner.id)}
          canDelete={isUserAddedPartner(profilePartner.id)}
          onBack={() => setPartnerProfileId(null)}
          onEditPartner={() => setEditingPartnerId(profilePartner.id)}
          onDeletePartner={() => handleDeletePartner(profilePartner.id)}
        />
      </ScrollResetContainer>
    )
  }

  if (showAddCapacity) {
    return (
      <ScrollResetContainer
        resetKey="add-capacity"
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        <AddCapacityPage onBack={() => setShowAddCapacity(false)} onSubmit={handleAddCapacity} />
      </ScrollResetContainer>
    )
  }

  if (showAddProduct) {
    return (
      <ScrollResetContainer
        resetKey="add-product"
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        <AddProductPage onBack={() => setShowAddProduct(false)} onSubmit={handleAddProduct} />
      </ScrollResetContainer>
    )
  }

  if (showAddPolicy) {
    return (
      <ScrollResetContainer
        resetKey="add-policy"
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        <AddPolicyPage
          partners={partners}
          initialPartnerId={selectedPartnerId}
          onBack={() => setShowAddPolicy(false)}
          onSubmit={handleAddPolicy}
        />
      </ScrollResetContainer>
    )
  }

  if (showAddPartner) {
    return (
      <ScrollResetContainer
        resetKey="add-partner"
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        <AddPartnerPage
          onBack={() => setShowAddPartner(false)}
          onSubmit={handleAddPartner}
        />
      </ScrollResetContainer>
    )
  }

  if (selectedPropertyId) {
    return (
      <ScrollResetContainer
        resetKey={`property-${selectedPropertyId}`}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        <PropertyPage
          property={MOCK_PROPERTY}
          onBack={() => setSelectedPropertyId(null)}
        />
      </ScrollResetContainer>
    )
  }

  return (
    <TooltipProvider>
      {partnersSidebar}
      <div className="flex min-h-0 flex-1 flex-col gap-5">
        <div className="shrink-0 border-b border-border pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-[180px]">
              <h1 className="text-[22px] font-semibold tracking-tight">Partners &amp; policies</h1>
              <p className="mt-1 text-sm text-muted-foreground">YTD to June 2026</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="h-9 gap-2 text-xs"
                onClick={() => setShowAddPolicy(true)}
              >
                <FileText className="size-3.5" />
                Add policy
              </Button>
              <Button
                variant="outline"
                className="h-9 gap-2 text-xs"
                onClick={() => setShowAddPartner(true)}
              >
                <Users className="size-3.5" />
                Add partner
              </Button>
              <Button
                variant="outline"
                className="h-9 gap-2 text-xs"
                onClick={() => setShowAddProduct(true)}
              >
                <Package className="size-3.5" />
                Add product
              </Button>
              <Button
                variant="outline"
                className="h-9 gap-2 text-xs"
                onClick={() => setShowAddCapacity(true)}
              >
                <BarChart3 className="size-3.5" />
                Add capacity
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

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {selectedPartner ? (
            <PartnerDetailPanel
              partner={selectedPartner}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onViewProperty={setSelectedPropertyId}
              onOpenPartnerProfile={() => setPartnerProfileId(selectedPartner.id)}
              contentResetKey={detailContentResetKey}
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
    </TooltipProvider>
  )
}
