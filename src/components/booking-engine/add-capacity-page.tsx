import { useRef, useState, type FormEvent, type ReactNode } from "react"
import { ArrowLeft, Save, Upload, X } from "lucide-react"

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
import { CAPACITY_TYPE_OPTIONS, type AddCapacityFormValues } from "@/lib/booking-engine-data"
import { cn } from "@/lib/utils"

type AddCapacityPageProps = {
  onBack: () => void
  onSubmit?: (values: AddCapacityFormValues) => void
}

type FieldErrors = Partial<Record<keyof AddCapacityFormValues, string>>

const EMPTY_FORM: AddCapacityFormValues = {
  name: "",
  type: "",
  liveDate: "",
  endDate: "",
  notes: "",
  fileNames: [],
}

function validateForm(values: AddCapacityFormValues): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.name.trim()) {
    errors.name = "Name is required"
  }

  if (!values.type.trim()) {
    errors.type = "Select a type"
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
  label,
}: {
  fileNames: string[]
  onFilesAdded: (names: string[]) => void
  label: string
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
      <p className="text-sm font-semibold text-foreground">{label}</p>
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
          <SectionHeader
            title="Capacity details"
            description="Provider name, type, and active dates"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="name" label="Name" error={errors.name}>
              <Input
                id="name"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={fieldClass(Boolean(errors.name))}
              />
            </FormField>

            <FormField id="type" label="Type" error={errors.type}>
              <Select
                value={values.type || undefined}
                onValueChange={(value) => updateField("type", value)}
              >
                <SelectTrigger
                  id="type"
                  className={cn("h-9 text-xs", fieldClass(Boolean(errors.type)))}
                >
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {CAPACITY_TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="liveDate" label="Live date">
              <Input
                id="liveDate"
                type="date"
                value={values.liveDate}
                onChange={(event) => updateField("liveDate", event.target.value)}
              />
            </FormField>

            <FormField id="endDate" label="End date">
              <Input
                id="endDate"
                type="date"
                value={values.endDate}
                onChange={(event) => updateField("endDate", event.target.value)}
              />
            </FormField>

            <div className="sm:col-span-2">
              <FileDropzone
                label="Capacity files"
                fileNames={values.fileNames}
                onFilesAdded={(names) =>
                  updateField("fileNames", [...new Set([...values.fileNames, ...names])])
                }
              />
            </div>

            <FormField id="notes" label="Notes" className="sm:col-span-2">
              <textarea
                id="notes"
                value={values.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                rows={4}
                className={textareaClass}
              />
            </FormField>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-xs backdrop-blur-sm">
          <Button type="button" variant="outline" className="h-9 gap-1.5 text-xs" onClick={onBack}>
            <X className="size-3.5" />
            Cancel
          </Button>
          <Button type="submit" className="h-9 gap-1.5 text-xs">
            <Save className="size-3.5" />
            Save capacity
          </Button>
        </div>
      </form>
    </div>
  )
}
