import { useState, type FormEvent, type ReactNode } from "react"
import { ArrowLeft } from "lucide-react"

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
import { type AddCapacityFormValues, type PartnerProduct } from "@/lib/booking-engine-data"
import { cn } from "@/lib/utils"

type AddCapacityPageProps = {
  onBack: () => void
  onSubmit?: (values: AddCapacityFormValues) => void
}

type FieldErrors = Partial<Record<keyof AddCapacityFormValues, string>>

const EMPTY_FORM: AddCapacityFormValues = {
  name: "",
  policyReference: "",
  contactName: "",
  contactEmail: "",
  product: "",
  notes: "",
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function validateForm(values: AddCapacityFormValues): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.name.trim()) {
    errors.name = "Provider name is required"
  }

  if (!values.policyReference.trim()) {
    errors.policyReference = "Capacity policy reference is required"
  }

  if (!values.contactName.trim()) {
    errors.contactName = "Contact name is required"
  }

  if (!values.contactEmail.trim()) {
    errors.contactEmail = "Contact email is required"
  } else if (!validateEmail(values.contactEmail)) {
    errors.contactEmail = "Enter a valid email address"
  }

  if (!values.product) {
    errors.product = "Select a product"
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
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </Field>
  )
}

export function AddCapacityPage({ onBack, onSubmit }: AddCapacityPageProps) {
  const [values, setValues] = useState<AddCapacityFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)

  function updateField<K extends keyof AddCapacityFormValues>(
    key: K,
    value: AddCapacityFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))

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
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight">New capacity</h1>
        </div>

        <Button type="button" variant="outline" className="h-9 gap-2 text-xs" onClick={onBack}>
          <ArrowLeft className="size-3.5" />
          Back to partners
        </Button>
      </div>

      <form className="space-y-6 pb-24" onSubmit={handleSubmit} noValidate>
        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeading>Provider details</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="name" label="Provider name" error={errors.name}>
              <Input
                id="name"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="e.g. Lloyd's syndicate"
                className={fieldClass(Boolean(errors.name))}
              />
            </FormField>

            <FormField
              id="policyReference"
              label="Capacity policy reference"
              error={errors.policyReference}
            >
              <Input
                id="policyReference"
                value={values.policyReference}
                onChange={(event) => updateField("policyReference", event.target.value)}
                placeholder="e.g. CAP-2026-001"
                className={fieldClass(Boolean(errors.policyReference))}
              />
            </FormField>

            <FormField id="product" label="Linked product" error={errors.product}>
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
                  <SelectItem value="CAL">CAL</SelectItem>
                  <SelectItem value="DDL">DDL</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeading>Contact</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2">
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

            <FormField id="notes" label="Notes" className="sm:col-span-2">
              <textarea
                id="notes"
                value={values.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                rows={4}
                placeholder="Capacity terms, limits, or underwriting notes…"
                className={textareaClass}
              />
            </FormField>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-xs backdrop-blur-sm">
          <Button type="button" variant="outline" className="h-9 text-xs" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" className="h-9 text-xs">
            Save capacity
          </Button>
        </div>
      </form>
    </div>
  )
}
