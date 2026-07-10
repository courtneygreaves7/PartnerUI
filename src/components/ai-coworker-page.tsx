import { useEffect, useRef, useState } from "react"
import {
  ArrowUp,
  BarChart3,
  Building2,
  LineChart,
  Plus,
  Shield,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  buildAiCoworkerReply,
  type AiChatMessage,
} from "@/lib/ai-coworker-knowledge"
import { PARTNER_BRANDING } from "@/lib/partner-branding"
import { cn } from "@/lib/utils"

const EXAMPLE_PROMPTS: Array<{ prompt: string; icon: LucideIcon }> = [
  {
    prompt: "Summarise portfolio performance for this month",
    icon: BarChart3,
  },
  {
    prompt: "How is Flexible Cancellation doing across channels?",
    icon: Shield,
  },
  {
    prompt: "Compare Manor Cottages vs Lake Lovers",
    icon: Building2,
  },
  {
    prompt: "How do we compare to market on cancellations?",
    icon: LineChart,
  },
]

function timeOfDayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

function renderMessageText(text: string) {
  const blocks = text.split("\n")
  return blocks.map((line, index) => {
    if (!line.trim()) {
      return <div key={index} className="h-2" />
    }

    if (line.startsWith("### ")) {
      return (
        <p key={index} className="pt-1 text-sm font-semibold text-foreground">
          {line.slice(4)}
        </p>
      )
    }

    if (line.startsWith("| ")) {
      return (
        <p
          key={index}
          className="font-mono text-[12px] leading-relaxed text-muted-foreground"
        >
          {line}
        </p>
      )
    }

    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return (
      <p key={index} className="text-[15px] leading-relaxed text-foreground">
        {parts.map((part, partIndex) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={partIndex} className="font-semibold text-foreground">
                {part.slice(2, -2)}
              </strong>
            )
          }
          return <span key={partIndex}>{part}</span>
        })}
      </p>
    )
  })
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
        "relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_8px_30px_rgb(0_107_255_/_0.06)]",
        large && "shadow-[0_12px_40px_rgb(0_107_255_/_0.08)]",
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
}: {
  partnerName?: string
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<AiChatMessage[]>([])

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

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-[#f7f9fc] shadow-xs dark:bg-card">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgb(0_107_255_/_0.10),_transparent_65%)]"
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
              <div className="relative grid size-14 place-items-center rounded-full bg-gradient-to-br from-[#4d9fff] via-primary to-[#0047b3] shadow-[0_10px_32px_rgb(0_107_255_/_0.32)] ring-4 ring-white/60">
                <Sparkles className="size-5 text-white" />
              </div>
            </div>

            <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {timeOfDayGreeting()}, {partnerName}
            </h1>
            <p className="mt-1.5 max-w-lg text-center text-sm text-muted-foreground sm:text-base">
              Ask for a report, comparison or more, I&apos;m here to help.
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
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
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
                      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-[#0047b3] text-[9px] font-bold text-primary-foreground">
                        AI
                      </span>
                      <div className="min-w-0 space-y-0.5 pt-0.5">
                        {renderMessageText(message.text)}
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
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-[#0047b3] text-[9px] font-bold text-primary-foreground">
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
