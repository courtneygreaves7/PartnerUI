import { BRAND_IDS, BRAND_LABELS, BRAND_VOLUME_SHARE } from "@/lib/brand-metrics"
import { PARTNER_BRANDING } from "@/lib/partner-branding"
import { getBrandInsightSnapshot } from "@/lib/reporting-data"
import {
  ADDITIONAL_PARTNER_REVENUE,
  FINANCIALS_GRID,
  MARKET_COMPARISON_VALUES,
  PARTNER_REVENUE,
  TOTAL_PRODUCTS_SUMMARY,
} from "@/lib/sykes-dashboard-data"

export type AiChatMessage = {
  id: string
  role: "assistant" | "user"
  text: string
}

export const AI_COWORKER_SUGGESTIONS = [
  "Summarise portfolio performance",
  "How is Flexible Cancellation doing?",
  "Compare Manor vs Lake Lovers",
  "What are our cancellation rates?",
  "Break down partner revenue",
  "How do we compare to market?",
] as const

function formatShare(share: number) {
  return `${Math.round(share * 100)}%`
}

function brandSnapshots() {
  return BRAND_IDS.map((id) => getBrandInsightSnapshot(id, "month"))
}

function portfolioSnapshot() {
  return getBrandInsightSnapshot("all-brands", "month")
}

function formatMoney(n: number) {
  if (Math.abs(n) >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}m`
  if (Math.abs(n) >= 1_000) return `£${Math.round(n / 1_000)}k`
  return `£${Math.round(n).toLocaleString("en-GB")}`
}

function formatCount(n: number) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return Math.round(n).toLocaleString("en-GB")
}

function formatPct(n: number) {
  return `${n.toFixed(1)}%`
}

function formatDays(n: number) {
  return `${n.toFixed(1)} days`
}

function detectBrand(prompt: string): (typeof BRAND_IDS)[number] | null {
  const lower = prompt.toLowerCase()
  if (lower.includes("manor")) return "brand-a"
  if (lower.includes("lake")) return "brand-b"
  if (lower.includes("dream")) return "brand-c"
  return null
}

function summarisePortfolio(): string {
  const lines = TOTAL_PRODUCTS_SUMMARY.map(
    (item) => `• **${item.label}:** ${item.value} (${item.trend})`
  )
  return [
    `Here's the current **${PARTNER_BRANDING.name}** portfolio snapshot across all brands:`,
    "",
    ...lines,
    "",
    `Portfolio mix: ${BRAND_IDS.map((id) => `${BRAND_LABELS[id]} ${formatShare(BRAND_VOLUME_SHARE[id])}`).join(", ")}.`,
    "",
    "I can go deeper on CAL, DDL, cancellations, revenue, or a brand comparison — just say the word.",
  ].join("\n")
}

function summariseCal(brandId?: string): string {
  const snap = brandId
    ? getBrandInsightSnapshot(brandId, "month")
    : portfolioSnapshot()
  const label = brandId ? snap.brandLabel : "all brands"

  return [
    `**Flexible Cancellation (CAL)** — ${label}:`,
    "",
    `• Bookings in scope: **${formatCount(snap.calBookings)}**`,
    `• Attachment rate: **${formatPct(snap.calAttachment)}**`,
    `• Margin earned: **${formatMoney(snap.calMargin)}**`,
    `• Incremental benefit: **${formatMoney(snap.calBenefit)}**`,
    "",
    brandId
      ? `Want the same view for another brand, or DDL side-by-side?`
      : `Manor leads volume (${formatShare(BRAND_VOLUME_SHARE["brand-a"])}). Ask for a brand-level CAL breakdown if useful.`,
  ].join("\n")
}

function summariseDdl(brandId?: string): string {
  const snap = brandId
    ? getBrandInsightSnapshot(brandId, "month")
    : portfolioSnapshot()
  const label = brandId ? snap.brandLabel : "all brands"

  return [
    `**Damage Deposit Waiver (DDL)** — ${label}:`,
    "",
    `• Bookings in scope: **${formatCount(snap.ddlBookings)}**`,
    `• Attachment rate: **${formatPct(snap.ddlAttachment)}**`,
    `• Margin earned: **${formatMoney(snap.ddlMargin)}**`,
    `• Direct benefit: **${formatMoney(snap.ddlBenefit)}**`,
    "",
    "I can also pull contribution metrics (cancellations, relets, lead times) for this scope.",
  ].join("\n")
}

function summariseCancellations(brandId?: string): string {
  const snap = brandId
    ? getBrandInsightSnapshot(brandId, "month")
    : portfolioSnapshot()
  const label = brandId ? snap.brandLabel : "all brands"
  const market = MARKET_COMPARISON_VALUES.find((m) => m.metric === "Cancellation rate")

  return [
    `**Cancellations & relets** — ${label}:`,
    "",
    `• Cancellation volume: **${formatCount(snap.cancellationVolume)}**`,
    `• Cancellation avg rate: **${formatPct(snap.cancellationRate)}**`,
    `• FC cancellation volume: **${formatCount(snap.cancellationVolumeFc)}**`,
    `• Relet volume: **${formatCount(snap.reletVolume)}**`,
    `• Re-let rate: **${formatPct(snap.reletRate)}**`,
    `• Avg lead time (booking → travel): **${formatDays(snap.avgLeadTravel)}**`,
    `• Avg holiday value / booking: **${formatMoney(snap.avgHolidayValue)}**`,
    "",
    market
      ? `Market benchmark cancellation rate is **${market.side.replace("Market ", "")}** (partner ${market.value}, ${market.trend}).`
      : "",
  ]
    .filter(Boolean)
    .join("\n")
}

function summariseRevenue(): string {
  const drivers = PARTNER_REVENUE.drivers
    .map((d) => `• **${d.label}:** ${d.value}`)
    .join("\n")
  const effect = ADDITIONAL_PARTNER_REVENUE.drivers
    .map((d) => `• **${d.label}:** ${d.value} (${d.trend}) — ${d.side}`)
    .join("\n")

  return [
    `**Pikl'd Stays partner revenue** for ${PARTNER_BRANDING.shortName}:`,
    "",
    `Headline total: **${PARTNER_REVENUE.headline}** ${PARTNER_REVENUE.headlineNote}`,
    "",
    drivers,
    "",
    `**Additional / effect uplift:** **${ADDITIONAL_PARTNER_REVENUE.headline}**`,
    "",
    effect,
  ].join("\n")
}

function summariseMarket(): string {
  const rows = MARKET_COMPARISON_VALUES.map(
    (m) => `• **${m.metric}:** ${m.value} (${m.trend}) vs ${m.side}`
  )
  return [
    `**Partner vs market** benchmarks:`,
    "",
    ...rows,
    "",
    "Overall the portfolio is ahead on rebookability, lead time, and length of stay, with cancellation rate slightly better than market.",
  ].join("\n")
}

function compareBrands(prompt: string): string {
  const snaps = brandSnapshots()
  const mentioned = BRAND_IDS.filter((id) => {
    const name = BRAND_LABELS[id].toLowerCase()
    return prompt.toLowerCase().includes(name.split(" ")[0]!)
  })

  const a = mentioned[0] ? snaps.find((s) => s.brandId === mentioned[0])! : snaps[0]!
  const b = mentioned[1]
    ? snaps.find((s) => s.brandId === mentioned[1])!
    : snaps.find((s) => s.brandId !== a.brandId)!

  return [
    `**Brand comparison:** ${a.brandLabel} vs ${b.brandLabel}`,
    "",
    `| Metric | ${a.brandLabel} | ${b.brandLabel} |`,
    `| --- | --- | --- |`,
    `| Portfolio share | ${formatShare(BRAND_VOLUME_SHARE[a.brandId as (typeof BRAND_IDS)[number]])} | ${formatShare(BRAND_VOLUME_SHARE[b.brandId as (typeof BRAND_IDS)[number]])} |`,
    `| CAL attachment | ${formatPct(a.calAttachment)} | ${formatPct(b.calAttachment)} |`,
    `| CAL margin | ${formatMoney(a.calMargin)} | ${formatMoney(b.calMargin)} |`,
    `| DDL attachment | ${formatPct(a.ddlAttachment)} | ${formatPct(b.ddlAttachment)} |`,
    `| Cancellation rate | ${formatPct(a.cancellationRate)} | ${formatPct(b.cancellationRate)} |`,
    `| Relet rate | ${formatPct(a.reletRate)} | ${formatPct(b.reletRate)} |`,
    `| Avg lead time | ${formatDays(a.avgLeadTravel)} | ${formatDays(b.avgLeadTravel)} |`,
    "",
    a.calAttachment >= b.calAttachment
      ? `${a.brandLabel} leads on CAL attachment; ${b.brandLabel} ${a.calMargin >= b.calMargin ? "trails on margin given share" : "still contributes solid margin relative to share"}.`
      : `${b.brandLabel} leads on CAL attachment in this cut.`,
    "",
    "Say if you want Dream Cottages included, or a focus on financials / relets only.",
  ].join("\n")
}

function summariseFinancials(): string {
  const rows = FINANCIALS_GRID.map((row) => `• **${row.label}:** ${row.total.value} (total)`)
  return [
    `**Contribution financials** (insurance / re-let economics):`,
    "",
    ...rows,
    "",
    "These sit under Contribution to performance on Insights. I can also walk through cancellation and relet volumes.",
  ].join("\n")
}

function draftReport(): string {
  const snap = portfolioSnapshot()
  return [
    `Here's a concise **monthly insights brief** for ${PARTNER_BRANDING.name}:`,
    "",
    "### Headline",
    `Partner revenue **${PARTNER_REVENUE.headline}** net of premium + IPT, with estimated Pikl'd Stays uplift of **${ADDITIONAL_PARTNER_REVENUE.headline}**.`,
    "",
    "### Volume & attachment",
    TOTAL_PRODUCTS_SUMMARY.map((i) => `• ${i.label}: **${i.value}**`).join("\n"),
    "",
    "### Products",
    `• CAL attachment **${formatPct(snap.calAttachment)}**, margin **${formatMoney(snap.calMargin)}**`,
    `• DDL attachment **${formatPct(snap.ddlAttachment)}**, margin **${formatMoney(snap.ddlMargin)}**`,
    "",
    "### Contribution",
    `• Cancellation rate **${formatPct(snap.cancellationRate)}**, relet rate **${formatPct(snap.reletRate)}**`,
    `• Avg lead time booking → travel **${formatDays(snap.avgLeadTravel)}**`,
    "",
    "### Brands",
    BRAND_IDS.map(
      (id) => `• ${BRAND_LABELS[id]}: ${formatShare(BRAND_VOLUME_SHARE[id])} of volume`
    ).join("\n"),
    "",
    "I can expand any section, export talking points for a pitch deck, or compare two brands next.",
  ].join("\n")
}

function helpReply(partnerName: string): string {
  return [
    `I can report on live partner data for **${PARTNER_BRANDING.name}**, ${partnerName}. Try asking about:`,
    "",
    "• Portfolio / bookings / margin summary",
    "• Flexible Cancellation (CAL) or Damage Deposit Waiver (DDL)",
    "• Cancellations, relets, and lead times",
    "• Partner revenue and Pikl'd Stays effect",
    "• Brand comparisons (Manor, Lake Lovers, Dream)",
    "• Market benchmarks",
    "• Financials (premium, claims, loss ratios)",
    "",
    "Or pick a suggestion below.",
  ].join("\n")
}

/** Rule-based coworker replies grounded in dashboard / reporting data. */
export function buildAiCoworkerReply(prompt: string, partnerName = "George"): string {
  const lower = prompt.toLowerCase()
  const brand = detectBrand(prompt)

  if (
    /^(hi|hello|hey|help|what can you)\b/.test(lower) ||
    lower.includes("what can you do")
  ) {
    return helpReply(partnerName)
  }

  if (
    lower.includes("draft") ||
    lower.includes("brief") ||
    (lower.includes("report") && !lower.includes("reporting page"))
  ) {
    return draftReport()
  }

  if (
    lower.includes("compare") ||
    (lower.includes("vs") && (lower.includes("manor") || lower.includes("lake") || lower.includes("dream"))) ||
    (lower.includes("manor") && (lower.includes("lake") || lower.includes("dream")))
  ) {
    return compareBrands(prompt)
  }

  if (
    lower.includes("market") ||
    lower.includes("benchmark") ||
    lower.includes("vs market")
  ) {
    return summariseMarket()
  }

  if (
    lower.includes("revenue") ||
    lower.includes("£1.8") ||
    lower.includes("partner revenue") ||
    lower.includes("uplift") ||
    lower.includes("pikl")
  ) {
    return summariseRevenue()
  }

  if (
    lower.includes("financial") ||
    lower.includes("loss ratio") ||
    lower.includes("premium") ||
    lower.includes("claims")
  ) {
    return summariseFinancials()
  }

  if (
    lower.includes("cancel") ||
    lower.includes("relet") ||
    lower.includes("re-let") ||
    lower.includes("lead time")
  ) {
    return summariseCancellations(brand ?? undefined)
  }

  if (
    lower.includes("ddl") ||
    lower.includes("damage deposit") ||
    lower.includes("waiver")
  ) {
    return summariseDdl(brand ?? undefined)
  }

  if (
    lower.includes("cal") ||
    lower.includes("flexible cancellation") ||
    lower.includes("attachment")
  ) {
    return summariseCal(brand ?? undefined)
  }

  if (
    lower.includes("brand") ||
    lower.includes("manor") ||
    lower.includes("lake") ||
    lower.includes("dream") ||
    lower.includes("portfolio") ||
    lower.includes("summar") ||
    lower.includes("overview") ||
    lower.includes("performance") ||
    lower.includes("booking") ||
    lower.includes("margin")
  ) {
    if (brand && (lower.includes("cal") || lower.includes("ddl") || lower.includes("cancel"))) {
      // already handled above; fall through
    }
    if (brand && !lower.includes("compare")) {
      const snap = getBrandInsightSnapshot(brand, "month")
      return [
        `**${snap.brandLabel}** (${formatShare(BRAND_VOLUME_SHARE[brand])} of portfolio):`,
        "",
        ...snap.summary.map((s) => `• **${s.label}:** ${s.value}`),
        "",
        `CAL attachment **${formatPct(snap.calAttachment)}**, DDL **${formatPct(snap.ddlAttachment)}**, cancellation rate **${formatPct(snap.cancellationRate)}**.`,
        "",
        "Ask for CAL detail, cancellations, or a comparison with another brand.",
      ].join("\n")
    }
    return summarisePortfolio()
  }

  return [
    `I looked across the ${PARTNER_BRANDING.shortName} partner data for that.`,
    "",
    "I can pull numbers on bookings, CAL/DDL, cancellations, revenue, brands, market benchmarks, or draft a short report.",
    "",
    `Try: “Summarise portfolio performance”, “How is Flexible Cancellation doing?”, or “Compare Manor vs Lake Lovers”.`,
  ].join("\n")
}

export function welcomeAiMessage(partnerName: string): AiChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    text: `Hi ${partnerName} — I'm your AI coworker for **${PARTNER_BRANDING.name}**. I can report on bookings, CAL/DDL, cancellations, revenue, brand comparisons, and market benchmarks from the live dashboard data. What would you like to look at?`,
  }
}
