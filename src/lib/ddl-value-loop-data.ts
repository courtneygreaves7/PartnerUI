/**
 * Damage Waiver act signals — attachment and margin opportunities by channel / segment.
 */

import {
  DAMAGE_DEPOSIT_WAIVER_GRID,
  DDL_ATTACHMENT_VALUE_PER_PP,
  formatAttachmentValuePerPp,
} from "@/lib/sykes-dashboard-data"

export type DdlSignal = "risk" | "opportunity" | "success"

export type DdlOpportunity = {
  id: string
  signal: DdlSignal
  title: string
  detail: string
  metricsList: Array<{ label: string; value: string }>
  actionLabel: string
  actionTarget: "ask-ai"
  askPrompt: string
  footnote?: string
}

export const DDL_LOOP_OPPORTUNITIES_HELP =
  "Signals flag where Damage Deposit Waiver (DDL) attachment is soft, where margin already pays, and where a small lift in take-up is worth chasing. Use Ask AI to dig into the segment."

function channelAttach(key: "website" | "app" | "offline" | "ota") {
  return DAMAGE_DEPOSIT_WAIVER_GRID[1][key].value
}

function channelMargin(key: "website" | "app" | "offline" | "ota") {
  return DAMAGE_DEPOSIT_WAIVER_GRID[4][key].value
}

const valuePerPpTotal =
  DDL_ATTACHMENT_VALUE_PER_PP.find((c) => c.key === "total")?.valuePerPp ?? 0

export const DDL_OPPORTUNITIES: DdlOpportunity[] = [
  {
    id: "ddl-ota-soft",
    signal: "risk",
    title: "OTA · soft take-up",
    detail:
      "OTA attachment trails direct channels — guests are less likely to take the waiver at checkout.",
    metricsList: [
      { label: "Attachment", value: channelAttach("ota") },
      { label: "Margin", value: channelMargin("ota") },
    ],
    actionLabel: "Ask AI",
    actionTarget: "ask-ai",
    askPrompt:
      "Where is Damage Waiver attachment weakest on OTA, and what would close the gap vs website?",
    footnote: "Priority: lift take-up where volume is high but conversion is soft",
  },
  {
    id: "ddl-offline-low",
    signal: "risk",
    title: "Offline · lowest attach",
    detail:
      "Offline has the softest Damage Waiver take-up — contact-centre scripts and offer timing may be leaving margin behind.",
    metricsList: [
      { label: "Attachment", value: channelAttach("offline") },
      { label: "Margin", value: channelMargin("offline") },
    ],
    actionLabel: "Ask AI",
    actionTarget: "ask-ai",
    askPrompt:
      "How should we improve Damage Waiver attachment on offline bookings without hurting conversion?",
  },
  {
    id: "ddl-website-strong",
    signal: "success",
    title: "Website · strongest attach",
    detail:
      "Website leads Damage Waiver take-up and margin — copy the checkout pattern into app and OTA where possible.",
    metricsList: [
      { label: "Attachment", value: channelAttach("website") },
      { label: "Margin", value: channelMargin("website") },
    ],
    actionLabel: "Ask AI",
    actionTarget: "ask-ai",
    askPrompt:
      "What makes website Damage Waiver attachment outperform other channels, and how do we replicate it?",
  },
  {
    id: "ddl-1pp-upside",
    signal: "opportunity",
    title: "Portfolio · +1pp upside",
    detail:
      "Raising Damage Waiver attachment by one percentage point is worth meaningful partner margin across the book.",
    metricsList: [
      { label: "1pp value", value: formatAttachmentValuePerPp(valuePerPpTotal) },
      { label: "Attach now", value: DAMAGE_DEPOSIT_WAIVER_GRID[1].total.value },
    ],
    actionLabel: "Ask AI",
    actionTarget: "ask-ai",
    askPrompt:
      "Where should we push Damage Waiver attachment first to capture the +1pp margin upside?",
  },
  {
    id: "ddl-app-gap",
    signal: "opportunity",
    title: "App · middle of the pack",
    detail:
      "App attachment sits between website and OTA — a focused in-app prompt could close the gap to web.",
    metricsList: [
      { label: "Attachment", value: channelAttach("app") },
      { label: "Margin", value: channelMargin("app") },
    ],
    actionLabel: "Ask AI",
    actionTarget: "ask-ai",
    askPrompt:
      "What app checkout changes would lift Damage Waiver attachment toward website levels?",
  },
  {
    id: "ddl-direct-margin",
    signal: "success",
    title: "Direct · margin engine",
    detail:
      "Direct channels carry most Damage Waiver margin. Protect offer rate here before chasing thinner OTA conversion.",
    metricsList: [
      { label: "Direct attach", value: DAMAGE_DEPOSIT_WAIVER_GRID[1].direct.value },
      { label: "Direct margin", value: DAMAGE_DEPOSIT_WAIVER_GRID[4].direct.value },
    ],
    actionLabel: "Ask AI",
    actionTarget: "ask-ai",
    askPrompt:
      "How concentrated is Damage Waiver margin on direct, and what risks diluting it?",
  },
]
