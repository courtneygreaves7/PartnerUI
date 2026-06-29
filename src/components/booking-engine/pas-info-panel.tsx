import { useEffect, useState, type ReactNode } from "react"
import { Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  PARTNER_CONNECTION_LABELS,
  formatBrandLabel,
  type AddPolicyFormValues,
  type Brand,
  type Partner,
  type PolicyRate,
} from "@/lib/booking-engine-data"
import { cn } from "@/lib/utils"

function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-muted/15">
      <div className="border-b border-border/60 px-4 py-2.5">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          {title}
        </p>
      </div>
      <div className="px-4 py-3">{children}</div>
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  if (value == null || value === "") return null

  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-foreground">{value}</dd>
    </div>
  )
}

function InfoList({ items }: { items: { label: string; value: ReactNode }[] }) {
  const visible = items.filter((item) => item.value != null && item.value !== "")

  if (visible.length === 0) {
    return <p className="text-sm text-muted-foreground">No details recorded.</p>
  }

  return (
    <dl className="divide-y divide-border/50">
      {visible.map((item) => (
        <InfoRow key={item.label} label={item.label} value={item.value} />
      ))}
    </dl>
  )
}

function formatDisplayDate(value: string) {
  if (!value.trim()) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatPolicyType(value: AddPolicyFormValues["policyType"]) {
  return value === "quote" ? "Quote" : "Policy"
}

type PasInfoDrawerProps = {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function PasInfoDrawer({ open, title, subtitle, onClose, children, footer }: PasInfoDrawerProps) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close details"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="pas-info-drawer-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 id="pas-info-drawer-title" className="text-base font-semibold text-foreground">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 shrink-0"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">{children}</div>
        {footer ? (
          <footer className="shrink-0 border-t border-border bg-background p-4">{footer}</footer>
        ) : null}
      </aside>
    </div>
  )
}

export function PasDeleteButton({
  label,
  onDelete,
  disabled,
}: {
  label: string
  onDelete: () => void
  disabled?: boolean
}) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      className="h-9 w-full gap-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={onDelete}
    >
      <Trash2 className="size-3.5" />
      {label}
    </Button>
  )
}

type PartnerInfoContentProps = {
  partner: Partner
}

export function PartnerInfoContent({ partner }: PartnerInfoContentProps) {
  const onboarding = partner.onboarding

  return (
    <div className="space-y-4">
      <InfoSection title="Partner profile">
        <InfoList
          items={[
            { label: "Partner name", value: partner.name },
            { label: "Partner code", value: partner.initials },
            { label: "Partner group", value: onboarding?.partnerGroup },
            {
              label: "Status",
              value: onboarding?.status === "draft" ? "Draft — setup in progress" : "Active",
            },
            { label: "Data connection", value: PARTNER_CONNECTION_LABELS[partner.connectionType] },
            { label: "Data route", value: partner.dataRoute },
            { label: "Products", value: partner.products.join(", ") },
            { label: "Currencies", value: partner.currencies.join(", ") },
          ]}
        />
      </InfoSection>

      {onboarding ? (
        <>
          <InfoSection title="Company">
            <InfoList
              items={[
                {
                  label: "Registration number",
                  value: onboarding.companyRegistrationNumber,
                },
                {
                  label: "Address",
                  value: [
                    onboarding.addressLine1,
                    onboarding.addressLine2,
                    onboarding.city,
                    onboarding.postcode,
                  ]
                    .filter(Boolean)
                    .join(", "),
                },
              ]}
            />
          </InfoSection>

          <InfoSection title="Contact">
            <InfoList
              items={[
                { label: "Contact name", value: onboarding.contactName },
                { label: "Email", value: onboarding.contactEmail },
                { label: "Phone", value: onboarding.contactPhone },
                { label: "Account manager", value: onboarding.accountManager },
              ]}
            />
          </InfoSection>

          <InfoSection title="Operations">
            <InfoList
              items={[
                { label: "PMS", value: onboarding.propertyManagementSystem },
                { label: "Properties", value: onboarding.propertyCount },
                { label: "Bookings", value: onboarding.bookingCount },
                { label: "Target go-live", value: formatDisplayDate(onboarding.goLiveDate) },
              ]}
            />
          </InfoSection>

          {onboarding.notes ? (
            <InfoSection title="Notes">
              <p className="text-sm leading-relaxed text-foreground">{onboarding.notes}</p>
            </InfoSection>
          ) : null}

          {onboarding.fileNames.length > 0 ? (
            <InfoSection title="Files">
              <ul className="space-y-1.5">
                {onboarding.fileNames.map((name) => (
                  <li key={name} className="truncate text-sm text-foreground">
                    {name}
                  </li>
                ))}
              </ul>
            </InfoSection>
          ) : null}
        </>
      ) : null}

      <InfoSection title="Brands">
        <ul className="space-y-2">
          {partner.brands.map((brand) => (
            <li
              key={brand.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background px-3 py-2"
            >
              <span className="text-sm font-medium text-foreground">
                {formatBrandLabel(brand.name)}
              </span>
              <span className="text-xs text-muted-foreground">{brand.policyGroup}</span>
            </li>
          ))}
        </ul>
      </InfoSection>
    </div>
  )
}

type BrandInfoContentProps = {
  partner: Partner
  brand: Brand
  policies: PolicyRate[]
  onViewPolicy?: (policyId: string) => void
}

export function BrandInfoContent({ partner, brand, policies, onViewPolicy }: BrandInfoContentProps) {
  const activePolicies = policies.filter((policy) => policy.status === "active")

  return (
    <div className="space-y-4">
      <InfoSection title="Brand details">
        <InfoList
          items={[
            { label: "Brand name", value: formatBrandLabel(brand.name) },
            { label: "Policy group", value: brand.policyGroup },
            { label: "Partner", value: partner.name },
            { label: "Partner code", value: partner.initials },
            { label: "Products", value: partner.products.join(", ") },
            { label: "Currencies", value: partner.currencies.join(", ") },
          ]}
        />
      </InfoSection>

      <InfoSection title="Policies">
        {policies.length === 0 ? (
          <p className="text-sm text-muted-foreground">No policies linked to this brand yet.</p>
        ) : (
          <ul className="space-y-2">
            {policies.map((policy) => (
              <li
                key={policy.id}
                className={cn(
                  "rounded-md border border-border/60 bg-background px-3 py-2.5",
                  policy.status === "ended" && "opacity-70"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{policy.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {policy.validFrom} → {policy.validTo}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {policy.status}
                    </span>
                    {onViewPolicy ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onViewPolicy(policy.id)}
                      >
                        View
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>Net {policy.netRate.toFixed(2)}%</span>
                  <span>Gross {policy.grossRate.toFixed(2)}%</span>
                  <span>Comm {policy.calCommission.toFixed(1)}%</span>
                  <span>{policy.currency}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </InfoSection>

      <InfoSection title="Summary">
        <InfoList
          items={[
            { label: "Total policies", value: String(policies.length) },
            { label: "Active policies", value: String(activePolicies.length) },
          ]}
        />
      </InfoSection>
    </div>
  )
}

type BrandEditContentProps = {
  brand: Brand
  onSave: (updates: { name: string; policyGroup: string }) => void
  onCancel: () => void
}

export function BrandEditContent({ brand, onSave, onCancel }: BrandEditContentProps) {
  const [name, setName] = useState(brand.name)
  const [policyGroup, setPolicyGroup] = useState(brand.policyGroup)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(brand.name)
    setPolicyGroup(brand.policyGroup)
    setError(null)
  }, [brand.id, brand.name, brand.policyGroup])

  function handleSave() {
    if (!name.trim()) {
      setError("Brand name is required")
      return
    }
    onSave({ name: name.trim(), policyGroup: policyGroup.trim() || name.trim() })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-brand-name" className="font-semibold">
          Brand name
        </Label>
        <Input
          id="edit-brand-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Brand Alpha"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-brand-group" className="font-semibold">
          Policy group
        </Label>
        <Input
          id="edit-brand-group"
          value={policyGroup}
          onChange={(event) => setPolicyGroup(event.target.value)}
          placeholder="Defaults to brand name"
        />
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="h-9 flex-1 text-xs" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" className="h-9 flex-1 text-xs" onClick={handleSave}>
          Save brand
        </Button>
      </div>
    </div>
  )
}

type PolicyInfoContentProps = {
  policy: PolicyRate
  details?: AddPolicyFormValues
  partnerName?: string
  brandName?: string
}

export function PolicyInfoContent({ policy, details, partnerName, brandName }: PolicyInfoContentProps) {
  if (!details) {
    return (
      <div className="space-y-4">
        <InfoSection title="Policy summary">
          <InfoList
            items={[
              { label: "Policy name", value: policy.name },
              { label: "Partner", value: partnerName },
              { label: "Brand", value: brandName },
              { label: "Valid from", value: policy.validFrom },
              { label: "Valid to", value: policy.validTo },
              { label: "Status", value: policy.status },
              { label: "Net rate", value: `${policy.netRate.toFixed(2)}%` },
              { label: "Gross rate", value: `${policy.grossRate.toFixed(2)}%` },
              { label: "Commission", value: `${policy.calCommission.toFixed(1)}%` },
              { label: "Max liability", value: policy.maxLiability.toLocaleString() },
              { label: "Currency", value: policy.currency },
            ]}
          />
        </InfoSection>
        <p className="text-xs text-muted-foreground">
          Full policy form details are only available for policies created in this session.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <InfoSection title="Main details">
        <InfoList
          items={[
            { label: "Status", value: formatPolicyType(details.policyType) },
            { label: "Inception date", value: formatDisplayDate(details.inceptionDate) },
            { label: "Expiry date", value: formatDisplayDate(details.expiryDate) },
            { label: "Partner", value: partnerName },
            { label: "Product", value: details.product },
            { label: "Policy reference", value: details.policyReference },
            { label: "Distribution", value: details.distribution },
            {
              label: "Partner contribution",
              value: details.partnerContributionPercent
                ? `${details.partnerContributionPercent}%`
                : "",
            },
          ]}
        />
        {details.notes ? (
          <p className="mt-3 rounded-md border border-border/60 bg-background px-3 py-2 text-sm leading-relaxed text-foreground">
            {details.notes}
          </p>
        ) : null}
        {details.fileNames.length > 0 ? (
          <ul className="mt-3 space-y-1">
            {details.fileNames.map((name) => (
              <li key={name} className="truncate text-sm text-foreground">
                {name}
              </li>
            ))}
          </ul>
        ) : null}
      </InfoSection>

      <InfoSection title="References">
        <InfoList
          items={[
            { label: "Capacity policy number", value: details.capacityPolicyNumber },
            { label: "Lineslip reference", value: details.lineslipReference },
            { label: "UMR", value: details.umr },
            {
              label: "Document issue date",
              value: formatDisplayDate(details.policyDocumentIssueDate),
            },
          ]}
        />
      </InfoSection>

      <InfoSection title="Policy config">
        <InfoList
          items={[
            { label: "Rating basis", value: details.ratingBasis },
            { label: "Settlement basis", value: details.settlementBasis },
            { label: "Clip basis type", value: details.clipBasisType },
            { label: "Days before stay", value: details.daysBeforeStayDate },
            { label: "Clip basis notes", value: details.clipBasisNotes },
          ]}
        />
      </InfoSection>

      <InfoSection title="Rating">
        <InfoList
          items={[
            { label: "Insured limit", value: details.insuredLimit },
            { label: "Net rate exc. IPT", value: details.netRateExIpt ? `${details.netRateExIpt}%` : "" },
            {
              label: "Gross rate inc. IPT",
              value: details.grossRateIncIpt ? `${details.grossRateIncIpt}%` : "",
            },
            { label: "Commission", value: details.commissionPercent ? `${details.commissionPercent}%` : "" },
            { label: "Gross premium estimate", value: details.grossPremiumEstimate },
            { label: "Net premium estimate", value: details.netPremiumEstimate },
          ]}
        />
      </InfoSection>

      <InfoSection title="Consumer duty">
        <InfoList
          items={[
            { label: "Conduct risk rating", value: details.conductRiskRating },
            {
              label: "% income related to consumers",
              value: details.incomeRelatedToConsumers
                ? `${details.incomeRelatedToConsumers}%`
                : "",
            },
            {
              label: "% policy count related to consumers",
              value: details.policyCountRelatedToConsumers
                ? `${details.policyCountRelatedToConsumers}%`
                : "",
            },
          ]}
        />
      </InfoSection>

      <InfoSection title="Booking cancellation period">
        <InfoList
          items={[
            { label: "Days before booking", value: details.cancellationDaysBeforeBooking },
            { label: "Time of day", value: details.cancellationTimeOfDay },
          ]}
        />
      </InfoSection>

      <InfoSection title="Rates on record">
        <InfoList
          items={[
            { label: "Valid from", value: policy.validFrom },
            { label: "Valid to", value: policy.validTo },
            { label: "Net rate", value: `${policy.netRate.toFixed(2)}%` },
            { label: "Gross rate", value: `${policy.grossRate.toFixed(2)}%` },
            { label: "Commission", value: `${policy.calCommission.toFixed(1)}%` },
            { label: "Max liability", value: policy.maxLiability.toLocaleString() },
            { label: "Currency", value: policy.currency },
            { label: "Brand", value: brandName },
          ]}
        />
      </InfoSection>
    </div>
  )
}
