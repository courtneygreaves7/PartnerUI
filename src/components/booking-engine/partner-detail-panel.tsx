import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react"
import { Eye, PencilLine, Search, Tag, Zap } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { PartnerBookingsTable } from "@/components/booking-engine/partner-bookings-table"
import {
  BrandEditContent,
  BrandInfoContent,
  PartnerInfoContent,
  PasDeleteButton,
  PasInfoDrawer,
  PolicyInfoContent,
  type PartnerInfoSection,
} from "@/components/booking-engine/pas-info-panel"
import { PasConfirmDialog } from "@/components/booking-engine/pas-confirm-dialog"
import { PolicyRatesTable } from "@/components/booking-engine/policy-rates-table"
import { PropertiesTable } from "@/components/booking-engine/properties-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import {
  formatBrandLabel,
  formatCompactCount,
  formatCompactCurrency,
  formatCount,
  getBookingsForPartner,
  getPartnerBookingTrend,
  type AddPolicyFormValues,
  type Partner,
  type PolicyRate,
} from "@/lib/booking-engine-data"
import { getPropertiesForPartner, type PropertyListItem } from "@/lib/properties-list-data"
import { useScrollToTopOnChange } from "@/lib/scroll-to-top"
import { cn } from "@/lib/utils"

export type PartnerDetailTab = "overview" | "brands" | "bookings" | "properties"

type InfoView =
  | { type: "partner" }
  | { type: "brand"; brandId: string }
  | { type: "brand-edit"; brandId: string }
  | { type: "policy"; policyId: string }

type PartnerDetailPanelProps = {
  partner: Partner
  onViewProperty: (propertyId: string) => void
  activeTab: PartnerDetailTab
  onTabChange: (tab: PartnerDetailTab) => void
  onOpenPartnerProfile?: () => void
  contentResetKey?: string
  canDeletePartner?: boolean
  canEditBrand?: boolean
  canDeletePolicy?: (policyId: string) => boolean
  getPolicyDetails?: (policyId: string) => AddPolicyFormValues | undefined
  onDeletePartner?: () => void
  onDeletePolicy?: (policyId: string) => void
  onBrandUpdate?: (brandId: string, updates: { name: string; policyGroup: string }) => void
}

const TAB_ITEMS: { id: PartnerDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "brands", label: "Brands" },
  { id: "bookings", label: "Bookings" },
  { id: "properties", label: "Properties" },
]

function PartnerStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[88px] rounded-lg border border-border bg-muted/25 px-4 py-3">
      <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  )
}

function TabSummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col justify-center px-4 py-3">
      <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  )
}

function TabSearchInput({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative w-full sm:min-w-[220px] sm:max-w-xs">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input className="h-10 bg-background pl-9 text-xs" placeholder={placeholder} />
    </div>
  )
}

function TabSummaryBar({
  metrics,
  searchPlaceholder,
}: {
  metrics: { label: string; value: string }[]
  searchPlaceholder?: string
}) {
  return (
    <div className={cn("flex flex-col gap-4", searchPlaceholder && "lg:flex-row lg:items-stretch")}>
      <div
        className={cn(
          "grid w-full min-w-0 grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card sm:divide-x sm:divide-y-0",
          metrics.length >= 4 ? "sm:grid-cols-4" : "sm:grid-cols-3"
        )}
      >
        {metrics.map((metric) => (
          <TabSummaryMetric key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>
      {searchPlaceholder ? (
        <div className="flex shrink-0 items-center lg:w-64">
          <TabSearchInput placeholder={searchPlaceholder} />
        </div>
      ) : null}
    </div>
  )
}

function SectionCard({
  title,
  subtitle,
  children,
  className,
  contentClassName,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card", className)}>
      <div className="shrink-0 border-b border-border/60 px-4 py-3">
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          {title}
        </p>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className={cn("p-4", contentClassName)}>{children}</div>
    </section>
  )
}

function OverviewTab({
  partner,
  onViewBrand,
}: {
  partner: Partner
  onViewBrand: (brandId: string) => void
}) {
  const gradientId = `pas-trend-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const trend = getPartnerBookingTrend(partner.id)
  const activePolicies = partner.policies.filter((policy) => policy.status === "active")

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px] xl:items-stretch">
      <SectionCard title="Booking trend" subtitle="12-month volume">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Daily booking volume</p>
          <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            +12.0% YoY
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={32}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickFormatter={(value) => `${value}k`}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--foreground)"
                strokeWidth={1.5}
                fill={`url(#${gradientId})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
        <SectionCard
          title="Brands"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          contentClassName="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <ul className="space-y-2">
            {partner.brands.map((brand) => (
              <li
                key={brand.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Tag className="size-3.5 shrink-0 text-muted-foreground" />
                  <p className="truncate text-sm font-medium text-foreground">
                    {formatBrandLabel(brand.name)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onViewBrand(brand.id)}
                  className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Active policies"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          contentClassName="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <ul className="space-y-3">
            {activePolicies.map((policy) => (
              <li key={policy.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs text-foreground">
                    {policy.validFrom} → {policy.validTo}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                    {policy.calCommission.toFixed(1)}%
                  </span>
                  <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {policy.currency}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  )
}

function BrandsTab({
  partner,
  onViewBrand,
  onEditBrand,
  onViewPolicy,
  canEditBrand,
}: {
  partner: Partner
  onViewBrand: (brandId: string) => void
  onEditBrand: (brandId: string) => void
  onViewPolicy: (policyId: string) => void
  canEditBrand?: boolean
}) {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(
    partner.brands[0]?.id ?? null
  )
  const [policies, setPolicies] = useState<PolicyRate[]>(partner.policies)
  const [isEditingRates, setIsEditingRates] = useState(false)

  useEffect(() => {
    setPolicies(partner.policies)
    setSelectedBrandId(partner.brands[0]?.id ?? null)
    setIsEditingRates(false)
  }, [partner.id, partner.policies, partner.brands])

  const selectedBrand = partner.brands.find((brand) => brand.id === selectedBrandId)
  const visiblePolicies = selectedBrandId
    ? policies.filter((policy) => policy.brandId === selectedBrandId)
    : policies

  const handlePolicyChange = (policyId: string, updates: Partial<PolicyRate>) => {
    setPolicies((current) =>
      current.map((policy) => (policy.id === policyId ? { ...policy, ...updates } : policy))
    )
  }

  const handleCancelEdit = () => {
    setPolicies(partner.policies)
    setIsEditingRates(false)
  }

  const handleDoneEdit = () => {
    setIsEditingRates(false)
  }

  return (
    <div className="grid min-h-[420px] gap-0 overflow-hidden rounded-lg border border-border lg:grid-cols-[180px_minmax(0,1fr)]">
      <aside className="flex flex-col border-b border-border bg-muted/20 p-4 lg:border-r lg:border-b-0">
        <div className="min-h-0 flex-1">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Brands
          </p>
          <ul className="mt-2 space-y-1.5">
            {partner.brands.map((brand) => {
              const brandPolicyCount = policies.filter(
                (policy) => policy.brandId === brand.id
              ).length

              return (
                <li key={brand.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedBrandId(brand.id)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                      selectedBrandId === brand.id
                        ? "bg-muted ring-1 ring-foreground/15"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {formatBrandLabel(brand.name)}
                      </p>
                      <span className="shrink-0 rounded-md bg-background px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                        {brandPolicyCount}
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>

      <div className="min-w-0 bg-[var(--panel-bg)] p-5 dark:bg-canvas">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Policy rates
            </p>
            {selectedBrand ? (
              <p className="mt-1 text-sm text-foreground">
                {formatBrandLabel(selectedBrand.name)}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedBrand ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => onViewBrand(selectedBrand.id)}
                >
                  <Eye className="size-3.5" />
                  View brand
                </Button>
                {canEditBrand ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => onEditBrand(selectedBrand.id)}
                  >
                    <PencilLine className="size-3.5" />
                    Edit brand
                  </Button>
                ) : null}
              </>
            ) : null}
            {isEditingRates ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleDoneEdit}
                >
                  Done
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setIsEditingRates(true)}
              >
                <Zap className="size-3.5" />
                Quick edit rates
              </Button>
            )}
          </div>
        </div>
        <PolicyRatesTable
          policies={visiblePolicies}
          selectedBrandId={selectedBrandId}
          editable={isEditingRates}
          onPolicyChange={handlePolicyChange}
          onViewPolicy={!isEditingRates ? onViewPolicy : undefined}
        />
      </div>
    </div>
  )
}

function BookingsTab({ partner }: { partner: Partner }) {
  const bookings = getBookingsForPartner(partner.id)
  const [filter, setFilter] = useState<"all" | "cal" | "confirmed">("all")

  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      if (filter === "cal") return booking.hasCal
      if (filter === "confirmed") return booking.status === "confirmed"
      return true
    })
  }, [bookings, filter])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: `All (${bookings.length})` },
              { id: "cal", label: `CAL (${bookings.filter((b) => b.hasCal).length})` },
              {
                id: "confirmed",
                label: `Confirmed (${bookings.filter((b) => b.status === "confirmed").length})`,
              },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === item.id
                  ? "border-foreground/20 bg-muted text-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/40"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <TabSearchInput placeholder="Search bookings…" />
      </div>
      <PartnerBookingsTable bookings={filtered} />
    </div>
  )
}

function PropertiesTab({
  partner,
  properties,
  onViewProperty,
}: {
  partner: Partner
  properties: PropertyListItem[]
  onViewProperty: (propertyId: string) => void
}) {
  const listedBookings = properties.reduce((sum, property) => sum + property.bookings, 0)

  return (
    <div className="space-y-4">
      <TabSummaryBar
        metrics={[
          { label: "Properties", value: formatCount(properties.length) },
          { label: "Bookings", value: formatCount(partner.activity.bookings) },
          { label: "With CAL", value: formatCount(partner.activity.withCal) },
          { label: "With DDL", value: formatCount(partner.activity.withDdl) },
        ]}
      />
      <PropertiesTable properties={properties} onViewProperty={onViewProperty} embedded />
      <p className="text-xs text-muted-foreground">
        {formatCount(listedBookings)} bookings across listed properties
      </p>
    </div>
  )
}

export function PartnerDetailPanel({
  partner,
  onViewProperty,
  activeTab,
  onTabChange,
  onOpenPartnerProfile,
  contentResetKey = "",
  canDeletePartner,
  canEditBrand,
  canDeletePolicy,
  getPolicyDetails,
  onDeletePartner,
  onDeletePolicy,
  onBrandUpdate,
}: PartnerDetailPanelProps) {
  const properties = getPropertiesForPartner(partner.id)
  const bookings = getBookingsForPartner(partner.id)
  const { toast } = useToast()
  const tabPanelRef = useRef<HTMLDivElement>(null)
  const [infoView, setInfoView] = useState<InfoView | null>(null)
  const [deletePartnerOpen, setDeletePartnerOpen] = useState(false)

  useScrollToTopOnChange(tabPanelRef, [activeTab, partner.id, contentResetKey])

  useEffect(() => {
    setInfoView(null)
  }, [partner.id])

  const viewedBrand =
    infoView?.type === "brand" || infoView?.type === "brand-edit"
      ? partner.brands.find((brand) => brand.id === infoView.brandId)
      : undefined

  const editingBrand =
    infoView?.type === "brand-edit"
      ? partner.brands.find((brand) => brand.id === infoView.brandId)
      : undefined

  const viewedPolicy =
    infoView?.type === "policy"
      ? partner.policies.find((policy) => policy.id === infoView.policyId)
      : undefined

  const viewedPolicyBrand = viewedPolicy
    ? partner.brands.find((brand) => brand.id === viewedPolicy.brandId)
    : undefined

  function handleDeletePartnerRequest() {
    if (!canDeletePartner || !onDeletePartner) return
    setDeletePartnerOpen(true)
  }

  function confirmDeletePartner() {
    if (!canDeletePartner || !onDeletePartner) return
    onDeletePartner()
    setDeletePartnerOpen(false)
    setInfoView(null)
  }

  function handleDeletePolicy(policyId: string) {
    if (!canDeletePolicy?.(policyId) || !onDeletePolicy) return
    const policy = partner.policies.find((item) => item.id === policyId)
    if (
      window.confirm(`Delete policy ${policy?.name ?? "record"}? This cannot be undone.`)
    ) {
      onDeletePolicy(policyId)
      setInfoView(null)
    }
  }

  function openPolicyView(policyId: string) {
    setInfoView({ type: "policy", policyId })
  }

  function handleEditPartnerSection(section: PartnerInfoSection) {
    if (!canDeletePartner) return

    if (section === "brands") {
      setInfoView(null)
      onTabChange("brands")
      return
    }

    toast({
      title: "Edit coming soon",
      description: "Editing this section will be available in a future update.",
    })
  }

  const tabCounts: Record<PartnerDetailTab, number | null> = {
    overview: null,
    brands: partner.brands.length,
    bookings: bookings.length,
    properties: properties.length,
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground">
              {partner.initials.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">{partner.name}</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setInfoView({ type: "partner" })}
            >
              <Eye className="size-3.5" />
              View details
            </Button>
          </div>
          <div className="flex flex-wrap items-stretch gap-2">
            <PartnerStat label="Bookings" value={formatCompactCount(partner.activity.bookings)} />
            <PartnerStat
              label="Revenue"
              value={formatCompactCurrency(partner.activity.revenue)}
            />
            <PartnerStat label="CAL" value={formatCount(partner.activity.withCal)} />
            <PartnerStat label="Brands" value={String(partner.brands.length)} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1 border-b border-border/60 pb-0">
          {TAB_ITEMS.map((tab) => {
            const count = tabCounts[tab.id]
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-t-lg px-4 py-2.5 transition-colors",
                  isActive
                    ? "bg-muted/70 text-foreground"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "font-medium",
                    tab.id === "overview" ? "text-sm" : "text-sm font-semibold"
                  )}
                >
                  {tab.label}
                </span>
                {count != null ? (
                  <span
                    className={cn(
                      "min-w-[1.25rem] rounded-md px-1.5 py-0.5 text-center text-xs font-bold tabular-nums",
                      isActive
                        ? "bg-foreground/10 text-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      <div
        ref={tabPanelRef}
        className={cn(
          "min-h-0 flex-1 p-5",
          activeTab === "overview" ? "overflow-hidden" : "overflow-y-auto"
        )}
      >
        {activeTab === "overview" ? (
          <OverviewTab
            partner={partner}
            onViewBrand={(brandId) => setInfoView({ type: "brand", brandId })}
          />
        ) : null}
        {activeTab === "brands" ? (
          <BrandsTab
            partner={partner}
            canEditBrand={canEditBrand}
            onViewBrand={(brandId) => setInfoView({ type: "brand", brandId })}
            onEditBrand={(brandId) => setInfoView({ type: "brand-edit", brandId })}
            onViewPolicy={openPolicyView}
          />
        ) : null}
        {activeTab === "bookings" ? <BookingsTab partner={partner} /> : null}
        {activeTab === "properties" ? (
          <PropertiesTab
            partner={partner}
            properties={properties}
            onViewProperty={onViewProperty}
          />
        ) : null}
      </div>

      <PasInfoDrawer
        open={infoView?.type === "partner"}
        size="wide"
        title={partner.name}
        subtitle="Partner profile and onboarding details"
        onClose={() => setInfoView(null)}
        onOpenPage={
          onOpenPartnerProfile
            ? () => {
                setInfoView(null)
                onOpenPartnerProfile()
              }
            : undefined
        }
        openPageLabel="Open partner profile"
        footer={
          canDeletePartner && onDeletePartner ? (
            <PasDeleteButton label="Delete partner" onDelete={handleDeletePartnerRequest} />
          ) : undefined
        }
      >
        <PartnerInfoContent
          partner={partner}
          canEdit={Boolean(canDeletePartner)}
          onEditSection={handleEditPartnerSection}
          onViewBrand={(brandId) => setInfoView({ type: "brand", brandId })}
        />
      </PasInfoDrawer>

      <PasInfoDrawer
        open={infoView?.type === "brand" && Boolean(viewedBrand)}
        size="wide"
        title={viewedBrand ? formatBrandLabel(viewedBrand.name) : "Brand"}
        subtitle={viewedBrand ? formatBrandLabel(viewedBrand.name) : undefined}
        onClose={() => setInfoView(null)}
      >
        {viewedBrand ? (
          <BrandInfoContent
            partner={partner}
            brand={viewedBrand}
            policies={partner.policies.filter((policy) => policy.brandId === viewedBrand.id)}
            onViewPolicy={openPolicyView}
          />
        ) : null}
      </PasInfoDrawer>

      <PasInfoDrawer
        open={infoView?.type === "brand-edit" && Boolean(editingBrand)}
        title={editingBrand ? formatBrandLabel(editingBrand.name) : "Edit brand"}
        subtitle="Update brand name"
        onClose={() => setInfoView(null)}
      >
        {editingBrand && onBrandUpdate ? (
          <BrandEditContent
            brand={editingBrand}
            onCancel={() => setInfoView(null)}
            onSave={(updates) => {
              onBrandUpdate(editingBrand.id, updates)
              setInfoView(null)
            }}
          />
        ) : null}
      </PasInfoDrawer>

      <PasInfoDrawer
        open={infoView?.type === "policy" && Boolean(viewedPolicy)}
        size="wide"
        title={viewedPolicy?.name ?? "Policy"}
        subtitle={viewedPolicyBrand ? formatBrandLabel(viewedPolicyBrand.name) : undefined}
        onClose={() => setInfoView(null)}
        footer={
          viewedPolicy && canDeletePolicy?.(viewedPolicy.id) && onDeletePolicy ? (
            <PasDeleteButton
              label="Delete policy"
              onDelete={() => handleDeletePolicy(viewedPolicy.id)}
            />
          ) : undefined
        }
      >
        {viewedPolicy ? (
          <PolicyInfoContent
            policy={viewedPolicy}
            details={getPolicyDetails?.(viewedPolicy.id)}
            partnerName={partner.name}
            brandName={
              viewedPolicyBrand ? formatBrandLabel(viewedPolicyBrand.name) : undefined
            }
          />
        ) : null}
      </PasInfoDrawer>

      <PasConfirmDialog
        open={deletePartnerOpen}
        title={`Delete ${partner.name}?`}
        description="This removes the partner and any policies you added for them. This action cannot be undone."
        confirmLabel="Delete partner"
        onConfirm={confirmDeletePartner}
        onCancel={() => setDeletePartnerOpen(false)}
      />
    </div>
  )
}
