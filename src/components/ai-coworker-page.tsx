import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  ArrowUp,
  Lightbulb,
  Plus,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  Waypoints,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AI_COWORKER_EXAMPLE_PROMPTS,
  buildAiCoworkerReply,
  type AiChatMessage,
} from "@/lib/ai-coworker-knowledge"
import { PARTNER_BRANDING } from "@/lib/partner-branding"
import { cn } from "@/lib/utils"

const EXAMPLE_PROMPT_ICONS: LucideIcon[] = [
  RefreshCcw,
  Waypoints,
  TrendingUp,
  Lightbulb,
]

const EXAMPLE_PROMPTS = AI_COWORKER_EXAMPLE_PROMPTS.map((prompt, index) => ({
  prompt,
  icon: EXAMPLE_PROMPT_ICONS[index] ?? Sparkles,
}))

function timeOfDayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, partIndex) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={partIndex} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={partIndex}>{part}</span>
  })
}

function signalMeta(signal: string) {
  if (signal === "risk") {
    return {
      label: "Gap to close",
      className: "border-destructive/25 bg-destructive/10 text-destructive",
    }
  }
  if (signal === "opportunity") {
    return {
      label: "Growth chance",
      className: "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200",
    }
  }
  return {
    label: "Working well",
    className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  }
}

function renderSignalBadge(signal: string, key: string | number) {
  const meta = signalMeta(signal.trim())
  return (
    <span
      key={key}
      className={cn(
        "inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        meta.className
      )}
    >
      {meta.label}
    </span>
  )
}

function renderMetricsRow(raw: string, key: string | number) {
  const parts = raw
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean)

  return (
    <div key={key} className="flex flex-wrap gap-1.5">
      {parts.map((part, partIndex) => (
        <span
          key={`${key}-${partIndex}`}
          className="inline-flex items-center rounded-md border border-border/70 bg-muted/50 px-2 py-1 text-[12px] font-medium text-foreground"
        >
          {renderInline(part)}
        </span>
      ))}
    </div>
  )
}

function renderAskChip(
  prompt: string,
  key: string | number,
  onAsk?: (prompt: string) => void
) {
  if (!onAsk) {
    return (
      <p key={key} className="text-sm leading-relaxed text-primary">
        {prompt}
      </p>
    )
  }

  return (
    <button
      key={key}
      type="button"
      onClick={() => onAsk(prompt)}
      className="flex w-full items-start gap-2 rounded-lg border border-primary/20 bg-primary/[0.06] px-3 py-2 text-left text-sm leading-snug text-primary transition-colors hover:border-primary/35 hover:bg-primary/[0.1]"
    >
      <Sparkles className="mt-0.5 size-3.5 shrink-0" />
      <span>
        <span className="font-medium">Explore: </span>
        {prompt}
      </span>
    </button>
  )
}

function renderBullet(line: string, key: string | number, compact = false) {
  return (
    <div
      key={key}
      className={cn(
        "flex gap-2.5 leading-relaxed",
        compact ? "text-sm" : "text-[15px]"
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-full bg-primary/70",
          compact ? "mt-[0.45rem] size-1.5" : "mt-[0.55rem] size-1.5"
        )}
      />
      <p className="min-w-0 text-foreground">{renderInline(line.slice(2))}</p>
    </div>
  )
}

function parseTableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
}

function isTableSeparator(cells: string[]) {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function renderMarkdownTable(rawRows: string[], key: string | number) {
  const parsed = rawRows.map(parseTableCells).filter((cells) => cells.length > 0)
  if (parsed.length === 0) return null

  const header = parsed[0]!
  const body = parsed.slice(1).filter((cells) => !isTableSeparator(cells))

  return (
    <div
      key={key}
      className="overflow-x-auto rounded-xl border border-border/60 bg-card/60 shadow-xs"
    >
      <table className="w-full min-w-[18rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40">
            {header.map((cell, cellIndex) => (
              <th
                key={`${key}-h-${cellIndex}`}
                className={cn(
                  "px-3 py-2.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase",
                  cellIndex > 0 && "text-right tabular-nums"
                )}
              >
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr
              key={`${key}-r-${rowIndex}`}
              className="border-b border-border/40 last:border-b-0"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={`${key}-r-${rowIndex}-c-${cellIndex}`}
                  className={cn(
                    "px-3 py-2.5 text-[13px] leading-snug text-foreground",
                    cellIndex === 0
                      ? "font-medium text-muted-foreground"
                      : "text-right font-semibold tabular-nums"
                  )}
                >
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function renderMessageLine(
  line: string,
  key: string | number,
  onAsk?: (prompt: string) => void
) {
  if (line.startsWith("## ")) {
    return (
      <h2
        key={key}
        className="pt-4 text-base font-semibold tracking-tight text-foreground first:pt-0"
      >
        {line.slice(3)}
      </h2>
    )
  }

  if (line.startsWith("### ")) {
    return (
      <h3
        key={key}
        className="pt-3 text-sm font-semibold tracking-tight text-foreground"
      >
        {line.slice(4)}
      </h3>
    )
  }

  if (line.startsWith(">>> ")) {
    return renderAskChip(line.slice(4), key, onAsk)
  }

  if (line.startsWith(":::signal ")) {
    return renderSignalBadge(line.slice(10), key)
  }

  if (line.startsWith(":::metrics ")) {
    return renderMetricsRow(line.slice(11), key)
  }

  if (line.startsWith("> ")) {
    return (
      <div
        key={key}
        className="rounded-xl border border-primary/15 bg-primary/[0.04] px-3.5 py-2.5 text-sm leading-relaxed text-foreground"
      >
        {renderInline(line.slice(2))}
      </div>
    )
  }

  const numbered = line.match(/^(\d+)\.\s+(.*)$/)
  if (numbered) {
    return (
      <div
        key={key}
        className="flex gap-3 rounded-xl border border-border/60 bg-card/80 px-3.5 py-3 shadow-xs"
      >
        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
          {numbered[1]}
        </span>
        <div className="min-w-0 space-y-1 text-sm leading-relaxed text-foreground">
          {renderInline(numbered[2]!)}
        </div>
      </div>
    )
  }

  if (line.startsWith("• ") || line.startsWith("- ")) {
    return renderBullet(line, key)
  }

  return (
    <p key={key} className="text-[15px] leading-relaxed text-foreground">
      {renderInline(line)}
    </p>
  )
}

function renderMessageText(text: string, onAsk?: (prompt: string) => void) {
  const lines = text.split("\n")
  const nodes: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]!

    if (!line.trim()) {
      nodes.push(<div key={`gap-${index}`} className="h-2.5" />)
      index += 1
      continue
    }

    // Markdown pipe tables → styled HTML table
    if (line.trim().startsWith("|")) {
      const tableLines: string[] = []
      let cursor = index
      while (cursor < lines.length && lines[cursor]!.trim().startsWith("|")) {
        tableLines.push(lines[cursor]!.trim())
        cursor += 1
      }
      const table = renderMarkdownTable(tableLines, `table-${index}`)
      if (table) nodes.push(table)
      index = cursor
      continue
    }

    // Group #### opportunity headings with following body lines into one card
    if (line.startsWith("#### ")) {
      const body: string[] = []
      let cursor = index + 1
      while (cursor < lines.length && lines[cursor]!.trim()) {
        const next = lines[cursor]!
        if (
          next.startsWith("## ") ||
          next.startsWith("### ") ||
          next.startsWith("#### ")
        ) {
          break
        }
        body.push(next)
        cursor += 1
      }

      nodes.push(
        <div
          key={`card-${index}`}
          className="rounded-xl border border-border/60 bg-card/80 px-3.5 py-3.5 shadow-xs"
        >
          <h4 className="text-sm font-semibold tracking-tight text-foreground">
            {line.slice(5)}
          </h4>
          <div className="mt-2.5 space-y-2">
            {body.map((bodyLine, bodyIndex) => {
              const bodyKey = `${index}-b-${bodyIndex}`
              if (bodyLine.startsWith(":::signal ")) {
                return renderSignalBadge(bodyLine.slice(10), bodyKey)
              }
              if (bodyLine.startsWith(":::metrics ")) {
                return renderMetricsRow(bodyLine.slice(11), bodyKey)
              }
              if (bodyLine.startsWith(">>> ")) {
                return renderAskChip(bodyLine.slice(4), bodyKey, onAsk)
              }
              if (bodyLine.startsWith("• ") || bodyLine.startsWith("- ")) {
                return renderBullet(bodyLine, bodyKey, true)
              }
              return (
                <p
                  key={bodyKey}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {renderInline(bodyLine)}
                </p>
              )
            })}
          </div>
        </div>
      )
      index = cursor
      continue
    }

    nodes.push(renderMessageLine(line, index, onAsk))
    index += 1
  }

  return nodes
}

function Composer({
  input,
  setInput,
  isThinking,
  onSend,
  inputRef,
  large = false,
}: {
  input: string
  setInput: (value: string) => void
  isThinking: boolean
  onSend: (text: string) => void
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  large?: boolean
}) {
  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      onSend(input)
    }
  }

  return (
    <form
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_8px_30px_rgb(var(--primary-rgb)_/_0.06)]",
        large && "shadow-[0_12px_40px_rgb(var(--primary-rgb)_/_0.08)]",
        !large && "flex items-center"
      )}
      onSubmit={(event) => {
        event.preventDefault()
        onSend(input)
      }}
    >
      <textarea
        ref={inputRef}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={onKeyDown}
        rows={large ? 3 : 1}
        placeholder="Ask AI a question or make a request…"
        className={cn(
          "w-full resize-none bg-transparent px-5 text-[15px] leading-[1.4] outline-none placeholder:text-muted-foreground",
          large ? "min-h-[7.5rem] pt-5 pb-14 pr-5" : "h-14 py-[1.125rem] pr-14"
        )}
      />
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex items-center gap-2 px-3",
          large && "inset-x-0 top-auto bottom-0 items-center justify-between pb-3"
        )}
      >
        {large ? (
          <div className="flex items-center gap-1.5 pl-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
              <Sparkles className="size-3" />
              Partner data
            </span>
          </div>
        ) : null}
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isThinking}
          aria-label="Send message"
          className="size-9 rounded-full"
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </form>
  )
}

export function AiCoworkerPage({
  partnerName = PARTNER_BRANDING.userDisplayName,
  pendingPrompt = null,
  onPendingPromptConsumed,
}: {
  partnerName?: string
  /** When set, auto-sends this prompt once (e.g. from Insights Act links). */
  pendingPrompt?: string | null
  onPendingPromptConsumed?: () => void
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const consumedPromptRef = useRef<string | null>(null)

  const hasUserMessage = messages.some((m) => m.role === "user")

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isThinking])

  useEffect(() => {
    inputRef.current?.focus()
  }, [hasUserMessage])

  function startNewChat() {
    setMessages([])
    setInput("")
    setIsThinking(false)
    consumedPromptRef.current = null
    window.setTimeout(() => inputRef.current?.focus(), 50)
  }

  function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isThinking) return

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: trimmed },
    ])
    setInput("")
    setIsThinking(true)

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: buildAiCoworkerReply(trimmed, partnerName),
        },
      ])
      setIsThinking(false)
    }, 550)
  }

  useEffect(() => {
    if (!pendingPrompt) return
    if (consumedPromptRef.current === pendingPrompt) return
    consumedPromptRef.current = pendingPrompt
    sendMessage(pendingPrompt)
    onPendingPromptConsumed?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per pending prompt
  }, [pendingPrompt])

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-[#f7f9fc] shadow-xs dark:bg-card">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgb(var(--primary-rgb)_/_0.12),_transparent_65%)]"
      />

      <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-xs backdrop-blur-sm">
            <Sparkles className="size-3.5 text-primary" />
            AI Coworker
          </span>
        </div>
        <Button
          type="button"
          size="sm"
          className="h-9 gap-1.5 rounded-full px-4"
          onClick={startNewChat}
        >
          <Plus className="size-3.5" />
          New thread
        </Button>
      </div>

      {!hasUserMessage ? (
        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-8">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center pt-4">
            <div className="relative mb-5">
              <div
                aria-hidden
                className="absolute inset-0 scale-150 rounded-full bg-primary/20 blur-2xl"
              />
              <div className="relative grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary via-primary to-[var(--brand-primary-dark)] shadow-[0_10px_32px_rgb(var(--primary-rgb)_/_0.32)] ring-4 ring-white/60">
                <Sparkles className="size-5 text-white" />
              </div>
            </div>

            <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground">
              {timeOfDayGreeting()}, {partnerName}
            </h1>
            <p className="mt-1.5 max-w-lg text-center text-sm text-muted-foreground sm:text-base">
              Ask how Flexible Cancellation drives max revenue — conversion, margin, behaviour, and
              re-lets.
            </p>

            <div className="mt-8 w-full max-w-2xl">
              <Composer
                input={input}
                setInput={setInput}
                isThinking={isThinking}
                onSend={sendMessage}
                inputRef={inputRef}
                large
              />
            </div>

            <div className="mt-8 w-full max-w-3xl">
              <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Get started with an example below
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {EXAMPLE_PROMPTS.map(({ prompt, icon: Icon }) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={isThinking}
                    onClick={() => sendMessage(prompt)}
                    className="flex min-h-[7.5rem] flex-col justify-between rounded-2xl border border-border/60 bg-card/80 p-4 text-left shadow-xs transition-colors hover:border-primary/30 hover:bg-card disabled:opacity-50"
                  >
                    <p className="text-sm leading-snug text-foreground">{prompt}</p>
                    <span className="mt-3 grid size-8 place-items-center rounded-full bg-muted text-muted-foreground">
                      <Icon className="size-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div ref={listRef} className="relative z-10 min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-full",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" ? (
                    <div className="flex max-w-full gap-3">
                      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-[var(--brand-primary-dark)] text-[9px] font-bold text-primary-foreground">
                        AI
                      </span>
                      <div className="min-w-0 max-w-xl space-y-1.5 pt-0.5">
                        {renderMessageText(message.text, sendMessage)}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[85%] rounded-3xl bg-card px-4 py-2.5 text-[15px] leading-relaxed text-foreground shadow-xs ring-1 ring-border/60">
                      {message.text}
                    </div>
                  )}
                </div>
              ))}

              {isThinking ? (
                <div className="flex gap-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-[var(--brand-primary-dark)] text-[9px] font-bold text-primary-foreground">
                    AI
                  </span>
                  <div className="flex items-center gap-1.5 pt-2 text-muted-foreground">
                    <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70" />
                    <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:120ms]" />
                    <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:240ms]" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="relative z-10 shrink-0 px-5 pb-5 pt-2">
            <div className="mx-auto w-full max-w-2xl">
              <Composer
                input={input}
                setInput={setInput}
                isThinking={isThinking}
                onSend={sendMessage}
                inputRef={inputRef}
              />
              <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
                Answers use the same figures as Insights and Reporting.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
