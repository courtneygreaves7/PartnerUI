import { useMemo, useRef, useState, type FormEvent, type ReactNode } from "react"
import { ArrowLeft, Plus, Save, Trash2, Upload, X } from "lucide-react"

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
  PRODUCT_TYPE_OPTIONS,
  type AddProductFormValues,
  type ProductCapacityAllocation,
} from "@/lib/booking-engine-data"
import { getPasCapacityProviders } from "@/lib/pas-catalog-store"
import { cn } from "@/lib/utils"

type AddProductPageProps = {
  onBack: () => void
  onSubmit?: (values: AddProductFormValues) => void
}

type FieldErrors = Partial<Record<keyof AddProductFormValues, string>> & {
  capacityProviders?: string
}

const EMPTY_FORM: AddProductFormValues = {
  productType: "",
  name: "",
  capacityProviders: [],
  availableFrom: "",
  availableTo: "",
  maxCommissionPercent: "",
  notes: "",
  fileNames: [],
}

function validateForm(values: AddProductFormValues): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.productType.trim()) {
    errors.productType = "Select a product type"
  }

  if (!values.name.trim()) {
    errors.name = "Product name is required"
  }

  if (values.capacityProviders.length > 0) {
    const hasIncomplete = values.capacityProviders.some(
      (provider) => !provider.providerId || !provider.allocationPercent.trim()
    )
    if (hasIncomplete) {
      errors.capacityProviders = "Each capacity provider needs a provider and allocation"
    } else {
      const total = values.capacityProviders.reduce(
        (sum, provider) => sum + (Number.parseFloat(provider.allocationPercent) || 0),
        0
      )
      if (Math.abs(total - 100) > 0.01) {
        errors.capacityProviders = "Capacity allocations must total 100%"
      }
    }
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

export function AddProductPage({ onBack, onSubmit }: AddProductPageProps) {
  const [values, setValues] = useState<AddProductFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [typeOptions, setTypeOptions] = useState<string[]>(() => [...PRODUCT_TYPE_OPTIONS])
  const [showNewType, setShowNewType] = useState(false)
  const [newTypeName, setNewTypeName] = useState("")

  const capacityProviderOptions = useMemo(
    () => getPasCapacityProviders().map((provider) => ({ id: provider.id, name: provider.name })),
    []
  )

  const allocationTotal = useMemo(
    () =>
      values.capacityProviders.reduce(
        (sum, provider) => sum + (Number.parseFloat(provider.allocationPercent) || 0),
        0
      ),
    [values.capacityProviders]
  )

  function updateField<K extends keyof AddProductFormValues>(
    key: K,
    value: AddProductFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))

    if (submitted) {
      setErrors((prev) => {
        const nextValues = { ...values, [key]: value }
        const nextErrors = validateForm(nextValues)
        return { ...prev, [key]: nextErrors[key], capacityProviders: nextErrors.capacityProviders }
      })
    }
  }

  function updateCapacityProvider(index: number, updates: Partial<ProductCapacityAllocation>) {
    const capacityProviders = values.capacityProviders.map((provider, providerIndex) =>
      providerIndex === index ? { ...provider, ...updates } : provider
    )
    updateField("capacityProviders", capacityProviders)
  }

  function addCapacityProvider() {
    updateField("capacityProviders", [
      ...values.capacityProviders,
      { providerId: "", allocationPercent: "" },
    ])
  }

  function removeCapacityProvider(index: number) {
    updateField(
      "capacityProviders",
      values.capacityProviders.filter((_, providerIndex) => providerIndex !== index)
    )
  }

  function handleAddType() {
    const trimmed = newTypeName.trim()
    if (!trimmed) return
    setTypeOptions((current) => (current.includes(trimmed) ? current : [...current, trimmed]))
    updateField("productType", trimmed)
    setNewTypeName("")
    setShowNewType(false)
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
          <SectionHeader title="Product details" description="Type and name for this product" />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="productType" label="Product type" error={errors.productType}>
              <div className="flex flex-wrap items-start gap-2">
                <Select
                  value={values.productType || undefined}
                  onValueChange={(value) => updateField("productType", value)}
                >
                  <SelectTrigger
                    id="productType"
                    className={cn("h-9 min-w-[220px] flex-1 text-xs", fieldClass(Boolean(errors.productType)))}
                  >
                    <SelectValue placeholder="Select a product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 gap-1.5 text-xs"
                  onClick={() => setShowNewType((current) => !current)}
                >
                  <Plus className="size-3.5" />
                  Add new
                </Button>
              </div>
              {showNewType ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Input
                    value={newTypeName}
                    onChange={(event) => setNewTypeName(event.target.value)}
                    placeholder="New product type"
                    className="max-w-xs"
                  />
                  <Button type="button" className="h-9 text-xs" onClick={handleAddType}>
                    Save type
                  </Button>
                </div>
              ) : null}
            </FormField>

            <FormField id="name" label="Product name" error={errors.name}>
              <Input
                id="name"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={fieldClass(Boolean(errors.name))}
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <SectionHeader
              title="Capacity providers"
              description="Add one or more capacity providers and specify their allocation percentage."
            />
            <p className="text-sm font-medium text-muted-foreground">
              Total: {allocationTotal.toFixed(2)}%
            </p>
          </div>

          {errors.capacityProviders ? (
            <p className="text-xs text-destructive">{errors.capacityProviders}</p>
          ) : null}

          {values.capacityProviders.length > 0 ? (
            <div className="space-y-3">
              {values.capacityProviders.map((provider, index) => (
                <div
                  key={`capacity-provider-${index}`}
                  className="grid gap-3 rounded-lg border border-border/70 bg-muted/10 p-4 sm:grid-cols-[minmax(0,1fr)_140px_auto]"
                >
                  <FormField id={`provider-${index}`} label="Provider">
                    <Select
                      value={provider.providerId || undefined}
                      onValueChange={(value) =>
                        updateCapacityProvider(index, { providerId: value })
                      }
                    >
                      <SelectTrigger id={`provider-${index}`} className="h-9 text-xs">
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {capacityProviderOptions.length > 0 ? (
                          capacityProviderOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            Add capacity providers first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField id={`allocation-${index}`} label="Allocation (%)">
                    <Input
                      id={`allocation-${index}`}
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={provider.allocationPercent}
                      onChange={(event) =>
                        updateCapacityProvider(index, { allocationPercent: event.target.value })
                      }
                      placeholder="0.00"
                    />
                  </FormField>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => removeCapacityProvider(index)}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="rounded-lg border border-dashed border-border bg-muted/10 p-4">
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-1.5 text-xs"
              onClick={addCapacityProvider}
            >
              <Plus className="size-3.5" />
              Add capacity provider
            </Button>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeader title="Availability &amp; commission" />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="availableFrom" label="Available from">
              <Input
                id="availableFrom"
                type="date"
                value={values.availableFrom}
                onChange={(event) => updateField("availableFrom", event.target.value)}
              />
            </FormField>

            <FormField id="availableTo" label="Available to">
              <Input
                id="availableTo"
                type="date"
                value={values.availableTo}
                onChange={(event) => updateField("availableTo", event.target.value)}
              />
            </FormField>

            <FormField id="maxCommissionPercent" label="Maximum commission (%)" className="sm:col-span-2">
              <Input
                id="maxCommissionPercent"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={values.maxCommissionPercent}
                onChange={(event) => updateField("maxCommissionPercent", event.target.value)}
                placeholder="Enter a number"
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <SectionHeader title="Files" />
          <FileDropzone
            fileNames={values.fileNames}
            onFilesAdded={(names) =>
              updateField("fileNames", [...new Set([...values.fileNames, ...names])])
            }
          />
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5 shadow-xs">
          <FormField id="notes" label="Notes">
            <textarea
              id="notes"
              value={values.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              rows={4}
              className={textareaClass}
            />
          </FormField>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-xs backdrop-blur-sm">
          <Button type="button" variant="outline" className="h-9 gap-1.5 text-xs" onClick={onBack}>
            <X className="size-3.5" />
            Cancel
          </Button>
          <Button type="submit" className="h-9 gap-1.5 text-xs">
            <Save className="size-3.5" />
            Save product
          </Button>
        </div>
      </form>
    </div>
  )
}
