import { useEffect, useState, type ReactNode } from "react"
import {
  BarChart3,
  Building2,
  Cable,
  CalendarClock,
  FileText,
  Mail,
  MapPin,
  Paperclip,
  PencilLine,
  Percent,
  Shield,
  SlidersHorizontal,
  SquareArrowOutUpRight,
  StickyNote,
  Tag,
  Trash2,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  PARTNER_CONNECTION_DESCRIPTIONS,
  PARTNER_CONNECTION_LABELS,
  formatBrandLabel,
  formatCount,
  type AddPolicyFormValues,
  type Brand,
  type Partner,
  type PolicyRate,
} from "@/lib/booking-engine-data"
import { cn } from "@/lib/utils"

function InfoSection({
  title,
  icon: Icon,
  onEdit,
  editDisabled = false,
  children,
}: {
  title: string
  icon?: LucideIcon
  onEdit?: () => void
  editDisabled?: boolean
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-border/70 bg-card shadow-xs">
      <div className="flex items-center gap-2.5 border-b border-border/50 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {Icon ? (
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
              <Icon className="size-3.5" strokeWidth={2} aria-hidden />
            </div>
          ) : null}
          <p className="text-xs font-semibold text-foreground">{title}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 shrink-0 gap-1 px-2.5 text-[11px]"
          onClick={onEdit}
          disabled={editDisabled || !onEdit}
          aria-label={`Edit ${title}`}
        >
          <PencilLine className="size-3" aria-hidden />
          Edit
        </Button>
      </div>
      <div className="px-4 py-3.5">{children}</div>
    </section>
  )
}

function InfoField({ label, value }: { label: string; value: ReactNode }) {
  const display =
    value != null && value !== "" ? value : <span className="text-muted-foreground">—</span>

  return (
    <div className="rounded-lg bg-muted/30 px-3 py-2.5">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm leading-snug text-foreground">{display}</dd>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  if (value == null || value === "") return null

  return <InfoField label={label} value={value} />
}

function InfoList({ items }: { items: { label: string; value: ReactNode }[] }) {
  const visible = items.filter((item) => item.value != null && item.value !== "")

  if (visible.length === 0) {
    return (
      <p className="rounded-lg bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
        No details recorded.
      </p>
    )
  }

  return (
    <dl className="space-y-2">
      {visible.map((item) => (
        <InfoRow key={item.label} label={item.label} value={item.value} />
      ))}
    </dl>
  )
}

function InfoListAlways({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="space-y-2">
      {items.map((item) => (
        <InfoField key={item.label} label={item.label} value={item.value} />
      ))}
    </dl>
  )
}

function InfoEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">{children}</p>
  )
}

function formatPartnerSetupStatus(status?: "draft" | "active") {
  if (status === "draft") return "Draft — setup in progress"
  if (status === "active") return "Active — ready for bookings"
  return ""
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

function InfoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-5 sm:grid-cols-2", className)}>{children}</div>
}

function InfoGridFull({ children }: { children: ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>
}

type PasInfoDrawerProps = {
  open: boolean
  title: string
  subtitle?: string
  size?: "default" | "wide"
  onClose: () => void
  onOpenPage?: () => void
  openPageLabel?: string
  children: ReactNode
  footer?: ReactNode
}

export function PasInfoDrawer({
  open,
  title,
  subtitle,
  size = "default",
  onClose,
  onOpenPage,
  openPageLabel = "Open full page",
  children,
  footer,
}: PasInfoDrawerProps) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
      return () => cancelAnimationFrame(frame)
    }

    setVisible(false)
  }, [open])

  useEffect(() => {
    if (!visible && mounted && !open) {
      const timer = window.setTimeout(() => setMounted(false), 300)
      return () => window.clearTimeout(timer)
    }
  }, [visible, mounted, open])

  useEffect(() => {
    if (!mounted) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [mounted, onClose])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out",
          visible ? "opacity-100" : "opacity-0"
        )}
        aria-label="Close details"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="pas-info-drawer-title"
        className={cn(
          "relative flex h-full w-full flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300 ease-out",
          size === "wide" ? "max-w-3xl" : "max-w-md",
          visible ? "translate-x-0" : "translate-x-full"
        )}
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
          <div className="flex shrink-0 items-center gap-1.5">
            {onOpenPage ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                onClick={onOpenPage}
                aria-label={openPageLabel}
                title={openPageLabel}
              >
                <SquareArrowOutUpRight className="size-4" />
              </Button>
            ) : null}
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
          </div>
        </header>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-muted/15 p-5">{children}</div>
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

export type PartnerInfoSection =
  | "company-registration"
  | "partner-details"
  | "address"
  | "contact"
  | "business-metrics"
  | "connection-setup"
  | "brands"
  | "files"

type PartnerInfoContentProps = {
  partner: Partner
  canEdit?: boolean
  onEditSection?: (section: PartnerInfoSection) => void
  onViewBrand?: (brandId: string) => void
}

export function PartnerInfoContent({
  partner,
  canEdit = false,
  onEditSection,
  onViewBrand,
}: PartnerInfoContentProps) {
  const onboarding = partner.onboarding
  const fileNames = onboarding?.fileNames ?? []
  const notes = onboarding?.notes ?? ""

  function sectionEdit(section: PartnerInfoSection) {
    return {
      onEdit: onEditSection ? () => onEditSection(section) : undefined,
      editDisabled: !canEdit,
    }
  }

  return (
    <InfoGrid>
      <InfoGridFull>
        <InfoSection
          title="Company registration"
          icon={Building2}
          {...sectionEdit("company-registration")}
        >
          <InfoListAlways
            items={[
              {
                label: "Company registration number",
                value: onboarding?.companyRegistrationNumber,
              },
            ]}
          />
        </InfoSection>
      </InfoGridFull>

      <InfoSection title="Partner details" icon={UserRound} {...sectionEdit("partner-details")}>
        <InfoListAlways
          items={[
            { label: "Partner code", value: partner.initials },
            { label: "Partner name", value: partner.name },
            { label: "Partner group", value: onboarding?.partnerGroup },
          ]}
        />
        <div className="mt-3 rounded-lg bg-muted/30 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <StickyNote className="size-3 shrink-0" aria-hidden />
            Notes
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {notes.trim() ? notes : "—"}
          </p>
        </div>
      </InfoSection>

      <InfoSection title="Address information" icon={MapPin} {...sectionEdit("address")}>
        <InfoListAlways
          items={[
            { label: "Address line 1", value: onboarding?.addressLine1 },
            { label: "Address line 2", value: onboarding?.addressLine2 },
            { label: "City / town", value: onboarding?.city },
            { label: "Postcode", value: onboarding?.postcode },
          ]}
        />
      </InfoSection>

      <InfoSection title="Contact information" icon={Mail} {...sectionEdit("contact")}>
        <InfoListAlways
          items={[
            { label: "Contact name", value: onboarding?.contactName },
            { label: "Contact email", value: onboarding?.contactEmail },
            { label: "Contact phone", value: onboarding?.contactPhone },
          ]}
        />
      </InfoSection>

      <InfoSection title="Business metrics" icon={BarChart3} {...sectionEdit("business-metrics")}>
        <InfoListAlways
          items={[
            {
              label: "Property management system",
              value: onboarding?.propertyManagementSystem,
            },
            {
              label: "Number of properties",
              value: onboarding?.propertyCount || formatCount(partner.activity.properties),
            },
            {
              label: "Number of bookings",
              value: onboarding?.bookingCount || formatCount(partner.activity.bookings),
            },
          ]}
        />
      </InfoSection>

      <InfoSection title="Connection & setup" icon={Cable} {...sectionEdit("connection-setup")}>
        <InfoListAlways
          items={[
            { label: "Data connection", value: PARTNER_CONNECTION_LABELS[partner.connectionType] },
            {
              label: "Connection method",
              value: PARTNER_CONNECTION_DESCRIPTIONS[partner.connectionType],
            },
            { label: "Data route", value: partner.dataRoute },
            {
              label: "Setup status",
              value:
                formatPartnerSetupStatus(onboarding?.status) ||
                (onboarding ? "" : "Active — ready for bookings"),
            },
            {
              label: "Supported currencies",
              value: partner.currencies.join(", "),
            },
            { label: "Products", value: partner.products.join(", ") },
            { label: "Account manager", value: onboarding?.accountManager },
            {
              label: "Target go-live date",
              value: onboarding?.goLiveDate
                ? formatDisplayDate(onboarding.goLiveDate)
                : "",
            },
          ]}
        />
      </InfoSection>

      <InfoSection title="Brands" icon={Tag} {...sectionEdit("brands")}>
        <ul className="space-y-3">
          {partner.brands.map((brand, index) => (
            <li
              key={brand.id}
              className="rounded-xl border border-border/60 bg-muted/20 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md bg-background text-muted-foreground">
                    <Tag className="size-3" aria-hidden />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Brand {index + 1}</p>
                </div>
                {onViewBrand ? (
                  <button
                    type="button"
                    onClick={() => onViewBrand(brand.id)}
                    className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View
                  </button>
                ) : null}
              </div>
              <InfoField label="Brand name" value={formatBrandLabel(brand.name)} />
            </li>
          ))}
        </ul>
      </InfoSection>

      <InfoGridFull>
        <InfoSection title="Partner files" icon={Paperclip} {...sectionEdit("files")}>
          {fileNames.length > 0 ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {fileNames.map((name) => (
                <li
                  key={name}
                  className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2"
                >
                  <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="truncate text-sm text-foreground">{name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <InfoEmpty>No files uploaded.</InfoEmpty>
          )}
        </InfoSection>
      </InfoGridFull>
    </InfoGrid>
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
    <InfoGrid>
      <InfoSection title="Brand details" icon={Tag}>
        <InfoList
          items={[
            { label: "Brand name", value: formatBrandLabel(brand.name) },
            { label: "Partner", value: partner.name },
            { label: "Partner code", value: partner.initials },
            { label: "Products", value: partner.products.join(", ") },
            { label: "Currencies", value: partner.currencies.join(", ") },
          ]}
        />
      </InfoSection>

      <InfoSection title="Summary" icon={BarChart3}>
        <InfoList
          items={[
            { label: "Total policies", value: String(policies.length) },
            { label: "Active policies", value: String(activePolicies.length) },
          ]}
        />
      </InfoSection>

      <InfoGridFull>
        <InfoSection title="Policies" icon={Shield}>
          {policies.length === 0 ? (
            <InfoEmpty>No policies linked to this brand yet.</InfoEmpty>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {policies.map((policy) => (
                <li
                  key={policy.id}
                  className={cn(
                    "rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5",
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
      </InfoGridFull>
    </InfoGrid>
  )
}

type BrandEditContentProps = {
  brand: Brand
  onSave: (updates: { name: string; policyGroup: string }) => void
  onCancel: () => void
}

export function BrandEditContent({ brand, onSave, onCancel }: BrandEditContentProps) {
  const [name, setName] = useState(brand.name)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(brand.name)
    setError(null)
  }, [brand.id, brand.name])

  function handleSave() {
    if (!name.trim()) {
      setError("Brand name is required")
      return
    }
    const trimmedName = name.trim()
    onSave({ name: trimmedName, policyGroup: trimmedName })
  }

  return (
    <div className="space-y-4">
      <Field>
        <Label htmlFor="edit-brand-name" className="font-semibold">
          Brand name
        </Label>
        <Input
          id="edit-brand-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Alpha"
        />
      </Field>
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
      <InfoGrid>
        <InfoSection title="Policy summary" icon={Shield}>
          <InfoList
            items={[
              { label: "Policy name", value: policy.name },
              { label: "Partner", value: partnerName },
              { label: "Brand", value: brandName },
              { label: "Valid from", value: policy.validFrom },
              { label: "Valid to", value: policy.validTo },
              { label: "Status", value: policy.status },
            ]}
          />
        </InfoSection>

        <InfoSection title="Rates on record" icon={Percent}>
          <InfoList
            items={[
              { label: "Net rate", value: `${policy.netRate.toFixed(2)}%` },
              { label: "Gross rate", value: `${policy.grossRate.toFixed(2)}%` },
              { label: "Commission", value: `${policy.calCommission.toFixed(1)}%` },
              { label: "Max liability", value: policy.maxLiability.toLocaleString() },
              { label: "Currency", value: policy.currency },
            ]}
          />
        </InfoSection>

        <InfoGridFull>
          <InfoEmpty>
            Full policy form details are only available for policies created in this session.
          </InfoEmpty>
        </InfoGridFull>
      </InfoGrid>
    )
  }

  return (
    <InfoGrid>
      <InfoSection title="Main details" icon={FileText}>
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
      </InfoSection>

      <InfoSection title="References" icon={Tag}>
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

      <InfoSection title="Policy config" icon={SlidersHorizontal}>
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

      <InfoSection title="Rating" icon={Percent}>
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

      <InfoSection title="Consumer duty" icon={Shield}>
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

      <InfoSection title="Booking cancellation period" icon={CalendarClock}>
        <InfoList
          items={[
            { label: "Days before booking", value: details.cancellationDaysBeforeBooking },
            { label: "Time of day", value: details.cancellationTimeOfDay },
          ]}
        />
      </InfoSection>

      <InfoSection title="Rates on record" icon={Percent}>
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

      {details.notes ? (
        <InfoGridFull>
          <InfoSection title="Notes" icon={StickyNote}>
            <p className="rounded-lg bg-muted/30 px-3 py-2.5 text-sm leading-relaxed text-foreground">
              {details.notes}
            </p>
          </InfoSection>
        </InfoGridFull>
      ) : null}

      {details.fileNames.length > 0 ? (
        <InfoGridFull>
          <InfoSection title="Policy files" icon={Paperclip}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {details.fileNames.map((name) => (
                <li
                  key={name}
                  className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2"
                >
                  <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="truncate text-sm text-foreground">{name}</span>
                </li>
              ))}
            </ul>
          </InfoSection>
        </InfoGridFull>
      ) : null}
    </InfoGrid>
  )
}
