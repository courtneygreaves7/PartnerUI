import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import { ArrowLeft, Building2, Plus, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
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
  PARTNER_CONNECTION_DESCRIPTIONS,
  PARTNER_CONNECTION_LABELS,
  PARTNER_CONNECTION_TYPES,
  PARTNER_GROUP_OPTIONS,
  type AddPartnerBrandValues,
  type AddPartnerFormValues,
  type PartnerConnectionType,
  type PartnerCurrency,
  type PartnerProduct,
} from "@/lib/booking-engine-data"
import { cn } from "@/lib/utils"
import { Field } from "@/components/ui/field"

type AddPartnerPageProps = {
  onBack: () => void
  onSubmit?: (values: AddPartnerFormValues) => void
  initialValues?: AddPartnerFormValues
  pageTitle?: string
  submitLabel?: string
}

type FieldErrors = Partial<Record<keyof AddPartnerFormValues, string>> & {
  brands?: string
}

const EMPTY_FORM: AddPartnerFormValues = {
  companyRegistrationNumber: "",
  name: "",
  initials: "",
  partnerGroup: "",
  notes: "",
  brands: [{ name: "", policyGroup: "" }],
  addressLine1: "",
  addressLine2: "",
  city: "",
  postcode: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  propertyManagementSystem: "",
  propertyCount: "",
  bookingCount: "",
  connectionType: "API",
  currencies: ["GBP"],
  products: ["CAL"],
  accountManager: "",
  goLiveDate: "",
  status: "draft",
  fileNames: [],
}

const COMPANY_LOOKUP: Record<string, { name: string; city: string; postcode: string }> = {
  "12345678": {
    name: "Lakeside Holiday Lets Ltd",
    city: "Ambleside",
    postcode: "LA22 0AB",
  },
  "87654321": {
    name: "Coastal Stays Group Ltd",
    city: "Brighton",
    postcode: "BN1 4GH",
  },
}

function deriveInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .replace(/[OI]/gi, "")
    .slice(0, 4)
    .toUpperCase()
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function validateForm(values: AddPartnerFormValues): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.name.trim()) {
    errors.name = "Partner name is required"
  }

  if (!values.initials.trim()) {
    errors.initials = "Partner code is required"
  } else if (!/^[A-HJ-NP-Z0-9]{2,4}$/i.test(values.initials.trim())) {
    errors.initials = "Use 2–4 characters; cannot include O or I"
  } else if (/[OI]/i.test(values.initials)) {
    errors.initials = "Partner code cannot contain the letters O or I"
  }

  if (!values.partnerGroup.trim()) {
    errors.partnerGroup = "Select a partner group"
  }

  if (!values.addressLine1.trim()) {
    errors.addressLine1 = "Address line 1 is required"
  }

  if (!values.city.trim()) {
    errors.city = "City or town is required"
  }

  if (!values.postcode.trim()) {
    errors.postcode = "Postcode is required"
  }

  if (!values.contactName.trim()) {
    errors.contactName = "Contact name is required"
  }

  if (!values.contactEmail.trim()) {
    errors.contactEmail = "Contact email is required"
  } else if (!validateEmail(values.contactEmail)) {
    errors.contactEmail = "Enter a valid email address"
  }

  if (values.currencies.length === 0) {
    errors.currencies = "Select at least one currency"
  }

  if (values.products.length === 0) {
    errors.products = "Select at least one product"
  }

  if (!values.brands.some((brand) => brand.name.trim())) {
    errors.brands = "Add at least one brand with a name"
  }

  return errors
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
      {children}
    </p>
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

function ToggleChip({
  selected,
  onToggle,
  children,
}: {
  selected: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-9 items-center rounded-md border px-3 text-xs font-medium transition-colors",
        selected
          ? "border-foreground/20 bg-foreground text-background"
          : "border-input bg-field text-foreground hover:bg-accent"
      )}
    >
      {children}
    </button>
  )
}

function toggleInList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
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

export function AddPartnerPage({
  onBack,
  onSubmit,
  initialValues,
  pageTitle = "New partner",
  submitLabel = "Save partner",
}: AddPartnerPageProps) {
  const [values, setValues] = useState<AddPartnerFormValues>(initialValues ?? EMPTY_FORM)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [initialsTouched, setInitialsTouched] = useState(Boolean(initialValues?.initials))
  const [groupOptions, setGroupOptions] = useState<string[]>(() => {
    const options: string[] = [...PARTNER_GROUP_OPTIONS]
    const group = initialValues?.partnerGroup?.trim()
    if (group && !options.includes(group)) {
      options.push(group)
    }
    return options
  })
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (!initialValues || hydratedRef.current) return
    setValues(initialValues)
    setInitialsTouched(true)
    hydratedRef.current = true
  }, [initialValues])

  function updateField<K extends keyof AddPartnerFormValues>(
    key: K,
    value: AddPartnerFormValues[K]
  ) {
    setValues((prev) => {
      const next = { ...prev, [key]: value }

      if (key === "name" && !initialsTouched) {
        next.initials = deriveInitials(String(value))
      }

      return next
    })

    if (submitted) {
      setErrors((prev) => {
        const nextValues = { ...values, [key]: value }
        if (key === "name" && !initialsTouched) {
          nextValues.initials = deriveInitials(String(value))
        }
        const nextErrors = validateForm(nextValues)
        return { ...prev, [key]: nextErrors[key] }
      })
    }
  }

  function updateBrand(index: number, updates: Partial<AddPartnerBrandValues>) {
    setValues((prev) => {
      const brands = prev.brands.map((brand, brandIndex) =>
        brandIndex === index ? { ...brand, ...updates } : brand
      )
      return { ...prev, brands }
    })

    if (submitted) {
      setErrors((prev) => {
        const brands = values.brands.map((brand, brandIndex) =>
          brandIndex === index ? { ...brand, ...updates } : brand
        )
        const nextValues = { ...values, brands }
        const nextErrors = validateForm(nextValues)
        return { ...prev, brands: nextErrors.brands }
      })
    }
  }

  function addBrand() {
    updateField("brands", [...values.brands, { name: "", policyGroup: "" }])
  }

  function removeBrand(index: number) {
    if (values.brands.length <= 1) return
    updateField(
      "brands",
      values.brands.filter((_, brandIndex) => brandIndex !== index)
    )
  }

  function handleCompanySearch() {
    const key = values.companyRegistrationNumber.trim()
    const match = COMPANY_LOOKUP[key]
    if (!match) return

    updateField("name", match.name)
    updateField("city", match.city)
    updateField("postcode", match.postcode)
    if (!values.addressLine1.trim()) {
      updateField("addressLine1", "1 High Street")
    }
  }

  function handleAddGroup() {
    const trimmed = newGroupName.trim()
    if (!trimmed) return
    setGroupOptions((current) =>
      current.includes(trimmed) ? current : [...current, trimmed]
    )
    updateField("partnerGroup", trimmed)
    setNewGroupName("")
    setShowNewGroup(false)
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
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight">{pageTitle}</h1>
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
        <article className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex flex-col items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
              <Building2 className="size-4" strokeWidth={2} />
            </div>
            <Label
              htmlFor="companyRegistrationNumber"
              className="text-sm font-semibold normal-case tracking-normal text-foreground"
            >
              Company registration number
            </Label>
          </div>

          <div className="mt-5 space-y-2">
            <p className="text-xs text-muted-foreground">
              Search Companies House to pre-fill partner details
            </p>
            <div className="flex w-full min-w-0 flex-wrap items-center gap-2">
              <Input
                id="companyRegistrationNumber"
                value={values.companyRegistrationNumber}
                onChange={(event) =>
                  updateField("companyRegistrationNumber", event.target.value)
                }
                placeholder="e.g. 12345678"
                className="h-9 min-w-0 flex-1 text-xs sm:max-w-xs"
              />
              <Button
                type="button"
                className="h-9 shrink-0 text-xs"
                onClick={handleCompanySearch}
                disabled={!values.companyRegistrationNumber.trim()}
              >
                Search
              </Button>
            </div>
          </div>
        </article>

        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeading>Partner details</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="initials"
              label="Partner code"
              hint="Partner code cannot contain the letters O or I"
              error={errors.initials}
            >
              <Input
                id="initials"
                value={values.initials}
                onChange={(event) => {
                  setInitialsTouched(true)
                  updateField(
                    "initials",
                    event.target.value.toUpperCase().replace(/[OI]/gi, "")
                  )
                }}
                placeholder="PRAL"
                maxLength={4}
                aria-invalid={Boolean(errors.initials)}
                className={cn("uppercase", fieldClass(Boolean(errors.initials)))}
              />
            </FormField>

            <FormField id="name" label="Partner name" error={errors.name}>
              <Input
                id="name"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="e.g. Lakeside Holiday Lets Ltd"
                aria-invalid={Boolean(errors.name)}
                className={fieldClass(Boolean(errors.name))}
              />
            </FormField>
          </div>

          <FormField id="partnerGroup" label="Partner group" error={errors.partnerGroup}>
            <div className="flex flex-wrap items-start gap-2">
              <Select
                value={values.partnerGroup || undefined}
                onValueChange={(value) => updateField("partnerGroup", value)}
              >
                <SelectTrigger id="partnerGroup" className="h-9 min-w-[220px] flex-1 text-xs">
                  <SelectValue placeholder="Select a partner group" />
                </SelectTrigger>
                <SelectContent>
                  {groupOptions.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                className="h-9 gap-1.5 text-xs"
                onClick={() => setShowNewGroup((current) => !current)}
              >
                <Plus className="size-3.5" />
                Add new
              </Button>
            </div>
            {showNewGroup ? (
              <div className="flex flex-wrap gap-2 pt-1">
                <Input
                  value={newGroupName}
                  onChange={(event) => setNewGroupName(event.target.value)}
                  placeholder="New group name"
                  className="max-w-xs"
                />
                <Button type="button" className="h-9 text-xs" onClick={handleAddGroup}>
                  Save group
                </Button>
              </div>
            ) : null}
          </FormField>

          <FormField id="notes" label="Notes">
            <textarea
              id="notes"
              value={values.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              rows={4}
              placeholder="Onboarding context, commercial terms, or technical requirements…"
              className={textareaClass}
            />
          </FormField>
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeading>Partner files</SectionHeading>
          <FileDropzone
            fileNames={values.fileNames}
            onFilesAdded={(names) =>
              updateField("fileNames", [...new Set([...values.fileNames, ...names])])
            }
          />
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeading>Address information</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="addressLine1" label="Address line 1" error={errors.addressLine1}>
              <Input
                id="addressLine1"
                value={values.addressLine1}
                onChange={(event) => updateField("addressLine1", event.target.value)}
                className={fieldClass(Boolean(errors.addressLine1))}
              />
            </FormField>
            <FormField id="addressLine2" label="Address line 2">
              <Input
                id="addressLine2"
                value={values.addressLine2}
                onChange={(event) => updateField("addressLine2", event.target.value)}
              />
            </FormField>
            <FormField id="city" label="City / town" error={errors.city}>
              <Input
                id="city"
                value={values.city}
                onChange={(event) => updateField("city", event.target.value)}
                className={fieldClass(Boolean(errors.city))}
              />
            </FormField>
            <FormField id="postcode" label="Postcode" error={errors.postcode}>
              <Input
                id="postcode"
                value={values.postcode}
                onChange={(event) => updateField("postcode", event.target.value)}
                className={fieldClass(Boolean(errors.postcode))}
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeading>Contact information</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-3">
            <FormField id="contactName" label="Contact name" error={errors.contactName}>
              <Input
                id="contactName"
                value={values.contactName}
                onChange={(event) => updateField("contactName", event.target.value)}
                className={fieldClass(Boolean(errors.contactName))}
              />
            </FormField>
            <FormField id="contactEmail" label="Contact email" error={errors.contactEmail}>
              <Input
                id="contactEmail"
                type="email"
                value={values.contactEmail}
                onChange={(event) => updateField("contactEmail", event.target.value)}
                className={fieldClass(Boolean(errors.contactEmail))}
              />
            </FormField>
            <FormField id="contactPhone" label="Contact phone">
              <Input
                id="contactPhone"
                type="tel"
                value={values.contactPhone}
                onChange={(event) => updateField("contactPhone", event.target.value)}
                placeholder="+44 7700 900000"
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeading>Business metrics</SectionHeading>
          <FormField id="propertyManagementSystem" label="Property management system">
            <Input
              id="propertyManagementSystem"
              value={values.propertyManagementSystem}
              onChange={(event) =>
                updateField("propertyManagementSystem", event.target.value)
              }
              placeholder="e.g. Guesty, SuperControl"
            />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="propertyCount" label="Number of properties">
              <Input
                id="propertyCount"
                type="number"
                min={0}
                value={values.propertyCount}
                onChange={(event) => updateField("propertyCount", event.target.value)}
                placeholder="Enter a number"
              />
            </FormField>
            <FormField id="bookingCount" label="Number of bookings">
              <Input
                id="bookingCount"
                type="number"
                min={0}
                value={values.bookingCount}
                onChange={(event) => updateField("bookingCount", event.target.value)}
                placeholder="Enter a number"
              />
            </FormField>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
            <SectionHeading>Connection &amp; setup</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="connectionType" label="Data connection">
              <Select
                value={values.connectionType}
                onValueChange={(value: PartnerConnectionType) =>
                  updateField("connectionType", value)
                }
              >
                <SelectTrigger id="connectionType" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PARTNER_CONNECTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {PARTNER_CONNECTION_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {PARTNER_CONNECTION_DESCRIPTIONS[values.connectionType]}
              </p>
            </FormField>

            <FormField id="status" label="Setup status">
              <Select
                value={values.status}
                onValueChange={(value: "draft" | "active") => updateField("status", value)}
              >
                <SelectTrigger id="status" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft — setup in progress</SelectItem>
                  <SelectItem value="active">Active — ready for bookings</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="currencies" label="Supported currencies" error={errors.currencies}>
              <div className="flex flex-wrap gap-2">
                {(["GBP", "EUR"] as PartnerCurrency[]).map((currency) => (
                  <ToggleChip
                    key={currency}
                    selected={values.currencies.includes(currency)}
                    onToggle={() =>
                      updateField("currencies", toggleInList(values.currencies, currency))
                    }
                  >
                    {currency}
                  </ToggleChip>
                ))}
              </div>
            </FormField>

            <FormField id="products" label="Products" error={errors.products}>
              <div className="flex flex-wrap gap-2">
                {(["CAL", "DDL"] as PartnerProduct[]).map((product) => (
                  <ToggleChip
                    key={product}
                    selected={values.products.includes(product)}
                    onToggle={() =>
                      updateField("products", toggleInList(values.products, product))
                    }
                  >
                    {product}
                  </ToggleChip>
                ))}
              </div>
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="accountManager" label="Account manager">
              <Input
                id="accountManager"
                value={values.accountManager}
                onChange={(event) => updateField("accountManager", event.target.value)}
                placeholder="Cover Genius owner"
              />
            </FormField>
            <FormField id="goLiveDate" label="Target go-live date">
              <Input
                id="goLiveDate"
                type="date"
                value={values.goLiveDate}
                onChange={(event) => updateField("goLiveDate", event.target.value)}
              />
            </FormField>
          </div>
          </div>

          <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionHeading>Brands</SectionHeading>
              <Button type="button" variant="outline" className="h-8 gap-1.5 text-xs" onClick={addBrand}>
                <Plus className="size-3.5" />
                Add brand
              </Button>
            </div>
            {errors.brands ? (
              <p className="text-xs text-destructive">{errors.brands}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Add one or more brands for this partner.
              </p>
            )}
            <div className="space-y-4">
              {values.brands.map((brand, index) => (
                <div
                  key={`brand-${index}`}
                  className="rounded-lg border border-border/70 bg-muted/10 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">Brand {index + 1}</p>
                    {values.brands.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => removeBrand(index)}
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <FormField id={`brand-name-${index}`} label="Brand name">
                    <Input
                      id={`brand-name-${index}`}
                      value={brand.name}
                      onChange={(event) => updateBrand(index, { name: event.target.value })}
                      placeholder="e.g. Alpha"
                    />
                  </FormField>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-xs backdrop-blur-sm">
          <Button type="button" variant="outline" className="h-9 text-xs" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" className="h-9 text-xs">
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  )
}
