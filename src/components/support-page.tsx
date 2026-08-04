import { useEffect, useRef, useState } from "react"
import {
  Check,
  FilePlus,
  Flag,
  ImagePlus,
  LifeBuoy,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  TriangleAlert,
  X,
} from "lucide-react"

import piklPartnerPhoto from "@/assets/pikl-partner-contact.png"
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
const CARD_PANEL = "rounded-2xl border border-border/60 bg-card p-5 shadow-xs"
const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

type PiklPartner = (typeof PARTNER_BRANDING.piklPartners)[number]

function partnerInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function PiklPartnerCard({ partner }: { partner: PiklPartner }) {
  const mailto = `mailto:${partner.email}?subject=${encodeURIComponent(
    `${PARTNER_BRANDING.shortName} · Partner enquiry`
  )}`
  const tel = `tel:${partner.phone.replace(/\s+/g, "")}`

  return (
    <div className={cn(CARD_PANEL, "relative flex w-full flex-col gap-4")}>
      <div className="flex items-start justify-between gap-2">
        {partner.photo === "amelia" ? (
          <img
            src={piklPartnerPhoto}
            alt={partner.name}
            className="size-10 shrink-0 rounded-xl object-cover ring-1 ring-border/70"
          />
        ) : partner.photo === "support" ? (
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <LifeBuoy className="size-4" aria-hidden />
            <span className="sr-only">Support</span>
          </span>
        ) : (
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-semibold text-primary">
            {partnerInitials(partner.name)}
          </span>
        )}
        <a
          href={partner.linkedInUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`${partner.name} on LinkedIn`}
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LinkedInIcon className="size-3.5" />
        </a>
      </div>

      <div className="space-y-1">
        <p className="text-[13px] leading-snug text-muted-foreground">{partner.role}</p>
        <p className="text-xl font-bold tracking-tight text-foreground">{partner.name}</p>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <a
            href={mailto}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary transition-colors hover:bg-primary/15"
          >
            <Mail className="size-3" />
            Email
          </a>
          <a
            href={tel}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
          >
            <Phone className="size-3" />
            Call
          </a>
        </div>
      </div>

      <div className="mt-auto space-y-0.5">
        <p className="truncate text-xs text-muted-foreground">{partner.email}</p>
        <p className="text-xs tabular-nums text-muted-foreground">{partner.phoneDisplay}</p>
        <p className="pt-1 text-xs text-muted-foreground">{partner.detail}</p>
      </div>
    </div>
  )
}

/** Right-rail contacts panel — same chrome as Insights Filters. */
export function PiklPartnersSidebar() {
  return (
    <aside className="relative flex min-h-0 flex-col bg-[var(--brand-surface)] dark:bg-muted">
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-px bg-border" />

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Your Pikl Partners</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Email or call your team — LinkedIn in the corner of each card.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {PARTNER_BRANDING.piklPartners.map((partner) => (
            <PiklPartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      </div>
    </aside>
  )
}

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

type FileAttachment = {
  file: File
}

const INITIAL_FORM: SupportForm = {
  requestType: "help",
  name: PARTNER_BRANDING.userDisplayName,
  email: "george.nunn@sykescottages.co.uk",
  subject: "",
  message: "",
}

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function SupportPage() {
  const [form, setForm] = useState<SupportForm>(INITIAL_FORM)
  const [attachment, setAttachment] = useState<FileAttachment | null>(null)
  const [screenshot, setScreenshot] = useState<ScreenshotAttachment | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const screenshotInputRef = useRef<HTMLInputElement>(null)

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

  function clearAttachment() {
    setAttachment(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function clearScreenshot() {
    setScreenshot((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl)
      return null
    })
    if (screenshotInputRef.current) screenshotInputRef.current.value = ""
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError("Files must be under 8 MB.")
      event.target.value = ""
      return
    }

    setAttachment({ file })
    setSubmitted(false)
    setError(null)
  }

  function handleScreenshotChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, or WebP).")
      event.target.value = ""
      return
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
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
    <div className="mx-auto w-full max-w-3xl space-y-6">
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
            <Label htmlFor="support-file">File</Label>
            <input
              ref={fileInputRef}
              id="support-file"
              type="file"
              accept=".pdf,.csv,.xlsx,.xls,.doc,.docx,.txt,.zip,application/pdf,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/zip"
              className="sr-only"
              onChange={handleFileChange}
            />

            {attachment ? (
              <div className="flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-border bg-muted/30 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {attachment.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.file.size)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Replace
                  </Button>
                  <button
                    type="button"
                    onClick={clearAttachment}
                    className="grid size-7 place-items-center rounded-full bg-background/90 text-muted-foreground shadow-sm ring-1 ring-border transition-colors hover:text-foreground"
                    aria-label="Remove file"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/[0.04]"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FilePlus className="size-4" />
                </span>
                <span className="text-sm font-medium text-foreground">Upload a file</span>
                <span className="text-xs text-muted-foreground">
                  PDF, CSV, Excel, or ZIP · up to 8 MB
                </span>
              </button>
            )}
          </Field>

          <Field>
            <Label htmlFor="support-screenshot">Screenshot</Label>
            <input
              ref={screenshotInputRef}
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
                    onClick={() => screenshotInputRef.current?.click()}
                  >
                    Replace
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => screenshotInputRef.current?.click()}
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
                {attachment || screenshot
                  ? ` with ${[attachment && "file", screenshot && "screenshot"].filter(Boolean).join(" & ")}`
                  : ""}
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
