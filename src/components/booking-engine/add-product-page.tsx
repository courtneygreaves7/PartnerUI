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
import { type AddProductFormValues } from "@/lib/booking-engine-data"
import { cn } from "@/lib/utils"

type AddProductPageProps = {
  onBack: () => void
  onSubmit?: (values: AddProductFormValues) => void
}

type FieldErrors = Partial<Record<keyof AddProductFormValues, string>>

const EMPTY_FORM: AddProductFormValues = {
  code: "",
  name: "",
  description: "",
  status: "draft",
}

function validateForm(values: AddProductFormValues): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.code.trim()) {
    errors.code = "Product code is required"
  } else if (!/^[A-Z0-9]{2,6}$/i.test(values.code.trim())) {
    errors.code = "Use 2–6 letters or numbers"
  }

  if (!values.name.trim()) {
    errors.name = "Product name is required"
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

export function AddProductPage({ onBack, onSubmit }: AddProductPageProps) {
  const [values, setValues] = useState<AddProductFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)

  function updateField<K extends keyof AddProductFormValues>(
    key: K,
    value: AddProductFormValues[K]
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
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight">New product</h1>
        </div>

        <Button type="button" variant="outline" className="h-9 gap-2 text-xs" onClick={onBack}>
          <ArrowLeft className="size-3.5" />
          Back to partners
        </Button>
      </div>

      <form className="space-y-6 pb-24" onSubmit={handleSubmit} noValidate>
        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeading>Product details</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="code" label="Product code" hint="e.g. CAL, DDL" error={errors.code}>
              <Input
                id="code"
                value={values.code}
                onChange={(event) =>
                  updateField("code", event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                }
                placeholder="CAL"
                maxLength={6}
                className={cn("uppercase", fieldClass(Boolean(errors.code)))}
              />
            </FormField>

            <FormField id="name" label="Product name" error={errors.name}>
              <Input
                id="name"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="e.g. Cancellation cover"
                className={fieldClass(Boolean(errors.name))}
              />
            </FormField>

            <FormField id="status" label="Status" className="sm:col-span-2">
              <Select
                value={values.status}
                onValueChange={(value: "active" | "draft") => updateField("status", value)}
              >
                <SelectTrigger id="status" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft — setup in progress</SelectItem>
                  <SelectItem value="active">Active — available for policies</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="description" label="Description" className="sm:col-span-2">
              <textarea
                id="description"
                value={values.description}
                onChange={(event) => updateField("description", event.target.value)}
                rows={4}
                placeholder="What this product covers and when it applies…"
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
            Save product
          </Button>
        </div>
      </form>
    </div>
  )
}
