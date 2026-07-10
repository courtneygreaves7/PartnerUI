import { useEffect, useRef, useState } from "react"
import {
  Check,
  Flag,
  ImagePlus,
  LifeBuoy,
  MessageSquareText,
  Send,
  TriangleAlert,
  X,
} from "lucide-react"

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
import { PARTNER_BRANDING } from "@/lib/partner-branding"
import { cn } from "@/lib/utils"

const PANEL = "rounded-2xl border border-border/60 bg-card p-6 shadow-xs"
const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"

const REQUEST_TYPES = [
  {
    value: "report",
    label: "Report an issue",
    description: "Something looks wrong in the data or product",
    icon: TriangleAlert,
  },
  {
    value: "flag",
    label: "Flag something",
    description: "Call out a risk, anomaly, or urgent concern",
    icon: Flag,
  },
  {
    value: "feedback",
    label: "Provide feedback",
    description: "Share ideas to improve the partner experience",
    icon: MessageSquareText,
  },
  {
    value: "help",
    label: "General help",
    description: "Ask a question or request assistance from Pikl",
    icon: LifeBuoy,
  },
] as const

type RequestType = (typeof REQUEST_TYPES)[number]["value"]

type SupportForm = {
  requestType: RequestType
  name: string
  email: string
  subject: string
  message: string
}

type ScreenshotAttachment = {
  file: File
  previewUrl: string
}

const INITIAL_FORM: SupportForm = {
  requestType: "help",
  name: PARTNER_BRANDING.userDisplayName,
  email: "george.nunn@sykescottages.co.uk",
  subject: "",
  message: "",
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function SupportPage() {
  const [form, setForm] = useState<SupportForm>(INITIAL_FORM)
  const [screenshot, setScreenshot] = useState<ScreenshotAttachment | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (screenshot) URL.revokeObjectURL(screenshot.previewUrl)
    }
  }, [screenshot])

  function updateField<K extends keyof SupportForm>(key: K, value: SupportForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSubmitted(false)
    setError(null)
  }

  function clearScreenshot() {
    setScreenshot((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl)
      return null
    })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleScreenshotChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, or WebP).")
      event.target.value = ""
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Screenshots must be under 8 MB.")
      event.target.value = ""
      return
    }

    setScreenshot((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl)
      return { file, previewUrl: URL.createObjectURL(file) }
    })
    setSubmitted(false)
    setError(null)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) {
      setError("Please add a subject and message before sending.")
      return
    }
    if (!form.email.trim()) {
      setError("Please include a contact email so Pikl can reply.")
      return
    }
    setSubmitted(true)
    setError(null)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className={MONO_LABEL}>Help & contact</p>
        <h1 className="mt-1 text-[22px] font-semibold tracking-tight">Support</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reach out to Pikl for help with {PARTNER_BRANDING.shortName} — report issues, flag
          concerns, or share feedback.
        </p>
      </div>

      <section className={PANEL}>
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <LifeBuoy className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Contact Pikl</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Messages go to the Pikl partner support team. We usually reply within one business
              day.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">What do you need?</p>
            <div className="flex flex-wrap gap-2">
              {REQUEST_TYPES.map((option) => {
                const Icon = option.icon
                const isActive = form.requestType === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    title={option.description}
                    onClick={() => updateField("requestType", option.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="support-name">Your name</Label>
              <Input
                id="support-name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                autoComplete="name"
              />
            </Field>
            <Field>
              <Label htmlFor="support-email">Email</Label>
              <Input
                id="support-email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                autoComplete="email"
              />
            </Field>
          </div>

          <Field>
            <Label htmlFor="support-subject">Subject</Label>
            <Input
              id="support-subject"
              value={form.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              placeholder="Short summary of your request"
            />
          </Field>

          <Field>
            <Label htmlFor="support-priority">Priority</Label>
            <Select defaultValue="normal">
              <SelectTrigger id="support-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low — whenever convenient</SelectItem>
                <SelectItem value="normal">Normal — within a business day</SelectItem>
                <SelectItem value="high">High — needs attention soon</SelectItem>
                <SelectItem value="urgent">Urgent — blocking partner work</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <Label htmlFor="support-message">Message</Label>
            <textarea
              id="support-message"
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              rows={6}
              placeholder="Share the details Pikl should know — include brands, dates, or screens if useful."
              className="flex min-h-32 w-full rounded-md border border-input bg-field px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </Field>

          <Field>
            <Label htmlFor="support-screenshot">Screenshot</Label>
            <input
              ref={fileInputRef}
              id="support-screenshot"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="sr-only"
              onChange={handleScreenshotChange}
            />

            {screenshot ? (
              <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                <div className="relative">
                  <img
                    src={screenshot.previewUrl}
                    alt="Screenshot preview"
                    className="max-h-48 w-full object-contain bg-muted/40"
                  />
                  <button
                    type="button"
                    onClick={clearScreenshot}
                    className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-background/90 text-muted-foreground shadow-sm ring-1 ring-border transition-colors hover:text-foreground"
                    aria-label="Remove screenshot"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {screenshot.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(screenshot.file.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Replace
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/[0.04]"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <ImagePlus className="size-4" />
                </span>
                <span className="text-sm font-medium text-foreground">Upload a screenshot</span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG, or WebP · up to 8 MB
                </span>
              </button>
            )}
          </Field>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {error ? (
              <p className="text-xs font-medium text-destructive">{error}</p>
            ) : submitted ? (
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <Check className="size-3.5" />
                Message sent to Pikl support
                {screenshot ? " with screenshot" : ""}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Sent to Pikl · {PARTNER_BRANDING.contactEmail}
              </p>
            )}
            <Button type="submit" className="gap-1.5">
              <Send className="size-3.5" />
              Send to Pikl
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
