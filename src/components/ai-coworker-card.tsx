import { useEffect, useId, useRef, useState } from "react"
import { Send, Sparkles, X } from "lucide-react"
import { createPortal } from "react-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AiCoworkerCardProps = {
  collapsed?: boolean
  partnerName?: string
}

type ChatMessage = {
  id: string
  role: "assistant" | "user"
  text: string
}

const SUGGESTIONS = [
  "Draft a monthly insights report",
  "Summarise CAL performance",
  "Compare brands this quarter",
  "Flag unusual cancellation rates",
] as const

function buildReply(prompt: string): string {
  const lower = prompt.toLowerCase()
  if (lower.includes("report") || lower.includes("draft")) {
    return "I can draft a partner insights report from your current filters — bookings, CAL/DDL attachment, and contribution metrics. Want me to prepare a PowerPoint-ready summary?"
  }
  if (lower.includes("cal")) {
    return "Flexible Cancellation looks strong on website and app channels. I can break out attachment, margin, and incremental relets by brand if useful."
  }
  if (lower.includes("brand") || lower.includes("compare")) {
    return "I can compare Manor Cottages, Lake Lovers, and Dream Cottages using the same portfolio shares as Reporting. Which two brands should I put side by side?"
  }
  if (lower.includes("cancel")) {
    return "I can scan contribution metrics for counties or brands with elevated cancellation rates and flag anything unusual. Prefer a UK-wide view or a specific brand?"
  }
  return "Happy to help with reports, insights, and partner tasks. Try one of the suggestions below, or tell me what you need."
}

function AiCoworkerDialog({
  open,
  partnerName,
  onClose,
}: {
  open: boolean
  partnerName: string
  onClose: () => void
}) {
  const titleId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `Hi ${partnerName} — I'm your AI coworker. I can draft reports, pull insights, and help with partner tasks. What would you like to do?`,
    },
  ])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => {
      document.body.style.overflow = previousOverflow
      window.clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isThinking, open])

  function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isThinking) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsThinking(true)

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: buildReply(trimmed),
        },
      ])
      setIsThinking(false)
    }, 650)
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px]"
        aria-label="Close AI coworker dialogue"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex h-[min(34rem,88vh)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-border/70 bg-gradient-to-r from-primary/[0.08] to-transparent px-4 py-3">
          <div className="relative shrink-0">
            <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#0047b3] text-primary-foreground shadow-md ring-2 ring-white/40">
              <span className="text-xs font-bold tracking-tight">AI</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-card" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 id={titleId} className="text-sm font-semibold text-foreground">
                AI Coworker
              </h2>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="size-2.5" />
                Online
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Reports, insights & partner tasks</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  message.role === "user"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md border border-border/70 bg-muted/50 text-foreground"
                )}
              >
                {message.text}
              </div>
            </div>
          ))}

          {isThinking ? (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-border/70 bg-muted/50 px-3.5 py-2.5 text-sm text-muted-foreground">
                <span className="inline-flex gap-1">
                  <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70" />
                  <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:120ms]" />
                  <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 space-y-3 border-t border-border/70 px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={isThinking}
                onClick={() => sendMessage(suggestion)}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage(input)
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about reports, insights, or tasks…"
              className="flex h-10 min-w-0 flex-1 rounded-xl border border-input bg-field px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button
              type="submit"
              size="icon"
              className="size-10 shrink-0 rounded-xl"
              disabled={!input.trim() || isThinking}
              aria-label="Send message"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  )
}

function AiCoworkerAvatarButton({
  onClick,
  label = "Ask AI Coworker",
}: {
  onClick: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="group relative flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105"
    >
      <span className="absolute inset-0 rounded-full bg-primary/30 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
      <span className="relative flex size-7 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold tracking-tight">
        AI
      </span>
      <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-background" />
    </button>
  )
}

export function AiCoworkerCard({
  collapsed = false,
  partnerName = "George",
}: AiCoworkerCardProps) {
  const [minimized, setMinimized] = useState(false)
  const [open, setOpen] = useState(false)

  if (collapsed) {
    return (
      <>
        <AiCoworkerAvatarButton onClick={() => setOpen(true)} />
        <AiCoworkerDialog
          open={open}
          partnerName={partnerName}
          onClose={() => setOpen(false)}
        />
      </>
    )
  }

  if (minimized) {
    return (
      <div className="flex justify-center">
        <AiCoworkerAvatarButton
          label="Show AI Coworker"
          onClick={() => setMinimized(false)}
        />
      </div>
    )
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-card to-card p-3.5 shadow-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-primary/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-8 left-4 size-16 rounded-full bg-sky-300/20 blur-2xl"
        />

        <button
          type="button"
          onClick={() => setMinimized(true)}
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Minimize AI Coworker"
        >
          <X className="size-3" />
        </button>

        <div className="relative flex flex-col items-center text-center">
          <div className="relative shrink-0">
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-full",
                "bg-gradient-to-br from-primary to-[#0047b3] text-primary-foreground shadow-md",
                "ring-2 ring-white/40"
              )}
            >
              <span className="text-xs font-bold tracking-tight">AI</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-card" />
          </div>

          <div className="mt-2.5 flex items-center justify-center gap-1.5">
            <p className="text-sm font-semibold text-foreground">AI Coworker</p>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="size-2.5" />
              AI
            </span>
          </div>

          <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
            Hi {partnerName} — I can draft reports, pull insights, and handle partner tasks for you.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          className="relative mt-3 h-8 w-full gap-1.5 text-xs"
          onClick={() => setOpen(true)}
        >
          <Sparkles className="size-3" />
          Ask AI Coworker
        </Button>
      </div>

      <AiCoworkerDialog
        open={open}
        partnerName={partnerName}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
