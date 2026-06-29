import { useRef, useState, type FormEvent, type ReactNode } from "react"
import { ArrowLeft, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  POLICY_CLIP_BASIS_OPTIONS,
  POLICY_CONDUCT_RISK_OPTIONS,
  POLICY_DISTRIBUTION_OPTIONS,
  POLICY_RATING_BASIS_OPTIONS,
  POLICY_SETTLEMENT_BASIS_OPTIONS,
  type AddPolicyFormValues,
  type Partner,
  type PartnerProduct,
  type PolicyFormType,
} from "@/lib/booking-engine-data"
import { cn } from "@/lib/utils"

type AddPolicyPageProps = {
  partners: Partner[]
  initialPartnerId?: string
  onBack: () => void
  onSubmit?: (values: AddPolicyFormValues) => void
}

type FieldErrors = Partial<Record<keyof AddPolicyFormValues, string>>

const EMPTY_FORM: AddPolicyFormValues = {
  policyType: "policy",
  inceptionDate: "",
  expiryDate: "",
  partnerId: "",
  product: "",
  policyReference: "",
  distribution: "",
  partnerContributionPercent: "",
  notes: "",
  fileNames: [],
  capacityPolicyNumber: "",
  lineslipReference: "",
  umr: "",
  policyDocumentIssueDate: "",
  ratingBasis: "",
  settlementBasis: "",
  clipBasisType: "",
  daysBeforeStayDate: "",
  clipBasisNotes: "",
  insuredLimit: "",
  netRateExIpt: "",
  grossRateIncIpt: "",
  commissionPercent: "",
  grossPremiumEstimate: "",
  netPremiumEstimate: "",
  conductRiskRating: "",
  incomeRelatedToConsumers: "",
  policyCountRelatedToConsumers: "",
  cancellationDaysBeforeBooking: "",
  cancellationTimeOfDay: "",
}

const POLICY_TYPE_OPTIONS: {
  value: PolicyFormType
  title: string
  description: string
}[] = [
  { value: "policy", title: "Policy", description: "Create a full policy" },
  { value: "quote", title: "Quote", description: "Create a quote" },
]

function validateForm(values: AddPolicyFormValues): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.inceptionDate.trim()) {
    errors.inceptionDate = "Inception date is required"
  }

  if (!values.partnerId.trim()) {
    errors.partnerId = "Select a partner"
  }

  if (!values.product) {
    errors.product = "Select a product"
  }

  return errors
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
      {description ? (
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

function FormField({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <Field className={className}>
      <Label htmlFor={id} className="font-semibold normal-case tracking-normal text-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </Field>
  )
}

function FileDropzone({
  fileNames,
  onFilesAdded,
}: {
  fileNames: string[]
  onFilesAdded: (names: string[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return
    const names = Array.from(fileList).map((file) => file.name)
    onFilesAdded(names)
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          addFiles(event.dataTransfer.files)
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
          isDragging
            ? "border-foreground/40 bg-muted/50"
            : "border-border bg-muted/20 hover:bg-muted/35"
        )}
      >
        <Upload className="size-5 text-muted-foreground" strokeWidth={2} />
        <p className="mt-3 text-sm font-semibold text-foreground">Drag &amp; drop files here</p>
        <p className="mt-1 text-xs text-muted-foreground">
          or click to select multiple files (max 200MB each)
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(event) => addFiles(event.target.files)}
        />
      </div>
      {fileNames.length > 0 ? (
        <ul className="space-y-1.5 rounded-lg border border-border bg-muted/20 px-3 py-2">
          {fileNames.map((name) => (
            <li key={name} className="truncate text-xs text-muted-foreground">
              {name}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function PolicyTypeOption({
  value,
  title,
  description,
  selected,
  onSelect,
}: {
  value: PolicyFormType
  title: string
  description: string
  selected: boolean
  onSelect: (value: PolicyFormType) => void
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
        selected
          ? "border-foreground/30 bg-muted/40"
          : "border-border bg-background hover:bg-muted/20"
      )}
    >
      <input
        type="radio"
        name="policyType"
        value={value}
        checked={selected}
        onChange={() => onSelect(value)}
        className="mt-1 size-4 shrink-0 accent-foreground"
      />
      <span>
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
      </span>
    </label>
  )
}

export function AddPolicyPage({
  partners,
  initialPartnerId,
  onBack,
  onSubmit,
}: AddPolicyPageProps) {
  const [values, setValues] = useState<AddPolicyFormValues>(() => {
    const defaultPartnerId =
      initialPartnerId && partners.some((partner) => partner.id === initialPartnerId)
        ? initialPartnerId
        : (partners[0]?.id ?? "")

    return {
      ...EMPTY_FORM,
      partnerId: defaultPartnerId,
    }
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const selectedPartner = partners.find((partner) => partner.id === values.partnerId)
  const productOptions = selectedPartner?.products ?? (["CAL", "DDL"] as PartnerProduct[])

  function updateField<K extends keyof AddPolicyFormValues>(
    key: K,
    value: AddPolicyFormValues[K]
  ) {
    setValues((prev) => {
      const next = { ...prev, [key]: value }

      if (key === "partnerId" && typeof value === "string") {
        const partner = partners.find((item) => item.id === value)
        if (partner && !partner.products.includes(next.product as PartnerProduct)) {
          next.product = partner.products[0] ?? ""
        }
      }

      return next
    })

    if (submitted) {
      setErrors((prev) => {
        const nextValues = { ...values, [key]: value }
        const nextErrors = validateForm(nextValues)
        return { ...prev, [key]: nextErrors[key] }
      })
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)

    const nextErrors = validateForm(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      onSubmit?.(values)
      if (!onSubmit) {
        onBack()
      }
    }
  }

  const fieldClass = (hasError: boolean) =>
    cn(hasError && "border-destructive focus-visible:ring-destructive/30")

  const textareaClass =
    "flex min-h-[96px] w-full resize-y rounded-md border border-input bg-field px-3 py-2 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Partners &amp; policies</p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight">New policy</h1>
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-9 gap-2 text-xs"
          onClick={onBack}
        >
          <ArrowLeft className="size-3.5" />
          Back to partners
        </Button>
      </div>

      <form className="space-y-6 pb-24" onSubmit={handleSubmit} noValidate>
        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeader
            title="Main details"
            description="Basic information about the policy"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="policyType" label="Status" className="sm:col-span-2">
              <div className="grid gap-3 sm:grid-cols-2">
                {POLICY_TYPE_OPTIONS.map((option) => (
                  <PolicyTypeOption
                    key={option.value}
                    value={option.value}
                    title={option.title}
                    description={option.description}
                    selected={values.policyType === option.value}
                    onSelect={(value) => updateField("policyType", value)}
                  />
                ))}
              </div>
            </FormField>

            <FormField id="inceptionDate" label="Inception date" error={errors.inceptionDate}>
              <Input
                id="inceptionDate"
                type="date"
                value={values.inceptionDate}
                onChange={(event) => updateField("inceptionDate", event.target.value)}
                aria-invalid={Boolean(errors.inceptionDate)}
                className={fieldClass(Boolean(errors.inceptionDate))}
              />
            </FormField>

            <FormField id="expiryDate" label="Expiry date">
              <Input
                id="expiryDate"
                type="date"
                value={values.expiryDate}
                onChange={(event) => updateField("expiryDate", event.target.value)}
              />
            </FormField>

            <FormField id="partnerId" label="Partner" error={errors.partnerId}>
              <Select
                value={values.partnerId || undefined}
                onValueChange={(value) => updateField("partnerId", value)}
              >
                <SelectTrigger
                  id="partnerId"
                  className={cn("h-9 text-xs", fieldClass(Boolean(errors.partnerId)))}
                >
                  <SelectValue placeholder="Select a partner" />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="product" label="Product" error={errors.product}>
              <Select
                value={values.product || undefined}
                onValueChange={(value: PartnerProduct) => updateField("product", value)}
              >
                <SelectTrigger
                  id="product"
                  className={cn("h-9 text-xs", fieldClass(Boolean(errors.product)))}
                >
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {productOptions.map((product) => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="policyReference" label="Policy reference">
              <Input
                id="policyReference"
                value={values.policyReference}
                onChange={(event) => updateField("policyReference", event.target.value)}
              />
            </FormField>

            <FormField id="distribution" label="Distribution">
              <Select
                value={values.distribution || undefined}
                onValueChange={(value) => updateField("distribution", value)}
              >
                <SelectTrigger id="distribution" className="h-9 text-xs">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {POLICY_DISTRIBUTION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="partnerContributionPercent" label="Partner contribution amount (%)">
              <Input
                id="partnerContributionPercent"
                type="number"
                min={0}
                max={100}
                value={values.partnerContributionPercent}
                onChange={(event) =>
                  updateField("partnerContributionPercent", event.target.value)
                }
                placeholder="Enter a number"
              />
            </FormField>

            <FormField id="notes" label="Notes" className="sm:col-span-2">
              <textarea
                id="notes"
                value={values.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                rows={4}
                className={textareaClass}
              />
            </FormField>

            <FormField id="files" label="Files" className="sm:col-span-2">
              <FileDropzone
                fileNames={values.fileNames}
                onFilesAdded={(names) =>
                  updateField("fileNames", [...new Set([...values.fileNames, ...names])])
                }
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeader
            title="References"
            description="Reference numbers and identifiers"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="capacityPolicyNumber" label="Capacity policy number">
              <Input
                id="capacityPolicyNumber"
                value={values.capacityPolicyNumber}
                onChange={(event) => updateField("capacityPolicyNumber", event.target.value)}
              />
            </FormField>

            <FormField id="lineslipReference" label="Lineslip reference">
              <Input
                id="lineslipReference"
                value={values.lineslipReference}
                onChange={(event) => updateField("lineslipReference", event.target.value)}
              />
            </FormField>

            <FormField id="umr" label="Unique market reference (UMR)">
              <Input
                id="umr"
                value={values.umr}
                onChange={(event) => updateField("umr", event.target.value)}
              />
            </FormField>

            <FormField id="policyDocumentIssueDate" label="Policy document issue date">
              <Input
                id="policyDocumentIssueDate"
                type="date"
                value={values.policyDocumentIssueDate}
                onChange={(event) => updateField("policyDocumentIssueDate", event.target.value)}
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeader
            title="Policy config"
            description="Policy configuration and settings"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="ratingBasis" label="Rating basis">
              <Select
                value={values.ratingBasis || undefined}
                onValueChange={(value) => updateField("ratingBasis", value)}
              >
                <SelectTrigger id="ratingBasis" className="h-9 text-xs">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {POLICY_RATING_BASIS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="settlementBasis" label="Settlement basis">
              <Select
                value={values.settlementBasis || undefined}
                onValueChange={(value) => updateField("settlementBasis", value)}
              >
                <SelectTrigger id="settlementBasis" className="h-9 text-xs">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {POLICY_SETTLEMENT_BASIS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="space-y-4 rounded-lg border border-border/70 bg-muted/10 p-4 sm:col-span-2">
              <p className="text-sm font-semibold text-foreground">Clip basis</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField id="clipBasisType" label="Clip basis type">
                  <Select
                    value={values.clipBasisType || undefined}
                    onValueChange={(value) => updateField("clipBasisType", value)}
                  >
                    <SelectTrigger id="clipBasisType" className="h-9 text-xs">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {POLICY_CLIP_BASIS_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField id="daysBeforeStayDate" label="Days before stay date">
                  <Input
                    id="daysBeforeStayDate"
                    value={values.daysBeforeStayDate}
                    onChange={(event) => updateField("daysBeforeStayDate", event.target.value)}
                    placeholder="Number of days before stay date"
                  />
                </FormField>

                <FormField id="clipBasisNotes" label="Additional notes" className="sm:col-span-2">
                  <Input
                    id="clipBasisNotes"
                    value={values.clipBasisNotes}
                    onChange={(event) => updateField("clipBasisNotes", event.target.value)}
                  />
                </FormField>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeader title="Rating" description="Financial information and calculations" />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="insuredLimit" label="Insured limit">
              <Input
                id="insuredLimit"
                type="number"
                min={0}
                value={values.insuredLimit}
                onChange={(event) => updateField("insuredLimit", event.target.value)}
                placeholder="Enter a number"
              />
            </FormField>

            <FormField id="netRateExIpt" label="Net rate exc. IPT (%)">
              <Input
                id="netRateExIpt"
                type="number"
                min={0}
                step="0.01"
                value={values.netRateExIpt}
                onChange={(event) => updateField("netRateExIpt", event.target.value)}
                placeholder="Enter a number"
              />
            </FormField>

            <FormField id="grossRateIncIpt" label="Gross rate inc. IPT (%)">
              <Input
                id="grossRateIncIpt"
                type="number"
                min={0}
                step="0.01"
                value={values.grossRateIncIpt}
                onChange={(event) => updateField("grossRateIncIpt", event.target.value)}
                placeholder="Enter a number"
              />
            </FormField>

            <FormField id="commissionPercent" label="Comm % (%)">
              <Input
                id="commissionPercent"
                type="number"
                min={0}
                step="0.01"
                value={values.commissionPercent}
                onChange={(event) => updateField("commissionPercent", event.target.value)}
                placeholder="Enter a number"
              />
            </FormField>

            <FormField id="grossPremiumEstimate" label="Gross premium estimate">
              <Input
                id="grossPremiumEstimate"
                type="number"
                min={0}
                value={values.grossPremiumEstimate}
                onChange={(event) => updateField("grossPremiumEstimate", event.target.value)}
                placeholder="Enter a number"
              />
            </FormField>

            <FormField id="netPremiumEstimate" label="Net premium estimate">
              <Input
                id="netPremiumEstimate"
                type="number"
                min={0}
                value={values.netPremiumEstimate}
                onChange={(event) => updateField("netPremiumEstimate", event.target.value)}
                placeholder="Enter a number"
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeader
            title="Consumer duty"
            description="Consumer protection and risk assessment"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="conductRiskRating" label="Conduct risk rating">
              <Select
                value={values.conductRiskRating || undefined}
                onValueChange={(value) => updateField("conductRiskRating", value)}
              >
                <SelectTrigger id="conductRiskRating" className="h-9 text-xs">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {POLICY_CONDUCT_RISK_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="incomeRelatedToConsumers" label="% income related to consumers">
              <Input
                id="incomeRelatedToConsumers"
                type="number"
                min={0}
                max={100}
                value={values.incomeRelatedToConsumers}
                onChange={(event) =>
                  updateField("incomeRelatedToConsumers", event.target.value)
                }
                placeholder="Enter a number"
              />
            </FormField>

            <FormField id="policyCountRelatedToConsumers" label="% policy count related to consumers">
              <Input
                id="policyCountRelatedToConsumers"
                type="number"
                min={0}
                max={100}
                value={values.policyCountRelatedToConsumers}
                onChange={(event) =>
                  updateField("policyCountRelatedToConsumers", event.target.value)
                }
                placeholder="Enter a number"
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeader
            title="Booking cancellation period"
            description="Cancellation product only"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="cancellationDaysBeforeBooking" label="Days before booking">
              <Input
                id="cancellationDaysBeforeBooking"
                type="number"
                min={0}
                value={values.cancellationDaysBeforeBooking}
                onChange={(event) =>
                  updateField("cancellationDaysBeforeBooking", event.target.value)
                }
                placeholder="Enter a number"
              />
            </FormField>

            <FormField id="cancellationTimeOfDay" label="Time of day">
              <Input
                id="cancellationTimeOfDay"
                type="time"
                value={values.cancellationTimeOfDay}
                onChange={(event) =>
                  updateField("cancellationTimeOfDay", event.target.value)
                }
              />
            </FormField>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-xs backdrop-blur-sm">
          <Button type="button" variant="outline" className="h-9 text-xs" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" className="h-9 text-xs">
            Save policy
          </Button>
        </div>
      </form>
    </div>
  )
}
