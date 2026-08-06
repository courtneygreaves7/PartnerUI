import { BRAND_IDS, BRAND_LABELS, BRAND_VOLUME_SHARE } from "@/lib/brand-metrics"
import {
  LIVE_CANCELLATIONS,
  PARTIAL_RELETS_INSIGHT,
  summariseLiveCancellations,
} from "@/lib/cancellations-releats-data"
import {
  getFcLoopOpportunities,
  getFcLoopSlice,
  matchFcLoopSliceFromPrompt,
} from "@/lib/fc-value-loop-data"
import { PARTNER_BRANDING } from "@/lib/partner-branding"
import {
  getRegionRecovery,
  getRegionRecoveryOpportunities,
  matchRegionRecoveryFromPrompt,
  wantsRegionRecoveryAdvice,
  type RegionRecoveryId,
} from "@/lib/region-recovery-data"
import { getBrandInsightSnapshot } from "@/lib/reporting-data"
import {
  ADDITIONAL_PARTNER_REVENUE,
  FC_VALUE_LOOP,
  FINANCIALS_GRID,
  MARKET_COMPARISON_VALUES,
  PARTNER_REVENUE,
  TOTAL_PRODUCTS_SUMMARY,
  summariseSalesCancelPeriod,
} from "@/lib/sykes-dashboard-data"

export type AiChatMessage = {
  id: string
  role: "assistant" | "user"
  text: string
}

/** Clickable starter prompts: max-revenue ops, not ancillary product asks. */
export const AI_COWORKER_EXAMPLE_PROMPTS = [
  "How do we drive max revenue with Flexible Cancellation: conversion, margin, and re-lets?",
  "Where can we increase re-lets and protect more revenue?",
  "Which regions have weak re-let recovery, and what does history predict?",
  "What is driving guest behaviour, and how should we run the business?",
] as const

export const AI_COWORKER_SUGGESTIONS = [
  ...AI_COWORKER_EXAMPLE_PROMPTS,
  "Jun 2025 – Jun 2026 sales vs cancellations: is cancellation rate improving?",
  "Which bedrooms and travel dates are leaking cancelled stays?",
  "Summarise portfolio performance",
  "Compare Manor vs Lake Lovers",
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
    `## Portfolio snapshot`,
    "",
    `Here is the current picture for **${PARTNER_BRANDING.name}** across all brands.`,
    "",
    "### Headline numbers",
    "",
    ...lines,
    "",
    "### Brand mix",
    "",
    `• ${BRAND_IDS.map((id) => `**${BRAND_LABELS[id]}** ${formatShare(BRAND_VOLUME_SHARE[id])}`).join(" · ")}`,
    "",
    "### Want to grow revenue next?",
    "",
    "Ask **where can we increase re-lets** for trends and practical opportunities.",
  ].join("\n")
}

function summariseCal(brandId?: string): string {
  const snap = brandId
    ? getBrandInsightSnapshot(brandId, "month")
    : portfolioSnapshot()
  const label = brandId ? snap.brandLabel : "all brands"

  return [
    `## Flexible Cancellation`,
    "",
    `A clear view for **${label}**.`,
    "",
    "### Current performance",
    "",
    `• **Bookings in scope:** ${formatCount(snap.calBookings)}`,
    `• **Guest take-up:** ${formatPct(snap.calAttachment)}`,
    `• **Margin earned:** ${formatMoney(snap.calMargin)}`,
    `• **Incremental benefit:** ${formatMoney(snap.calBenefit)}`,
    "",
    "### Grow from here",
    "",
    brandId
      ? "Ask for another brand, Damage Deposit Waiver side-by-side, or **where can we increase re-lets**."
      : `Manor leads volume (${formatShare(BRAND_VOLUME_SHARE["brand-a"])}). Ask for a brand breakdown, or **where can we increase re-lets**.`,
  ].join("\n")
}

function summariseDdl(brandId?: string): string {
  const snap = brandId
    ? getBrandInsightSnapshot(brandId, "month")
    : portfolioSnapshot()
  const label = brandId ? snap.brandLabel : "all brands"

  return [
    `## Damage Deposit Waiver`,
    "",
    `A clear view for **${label}**.`,
    "",
    "### Current performance",
    "",
    `• **Bookings in scope:** ${formatCount(snap.ddlBookings)}`,
    `• **Attachment rate:** ${formatPct(snap.ddlAttachment)}`,
    `• **Margin earned:** ${formatMoney(snap.ddlMargin)}`,
    `• **Direct benefit:** ${formatMoney(snap.ddlBenefit)}`,
    "",
    "### Want more?",
    "",
    "Ask for contribution metrics (cancellations, re-lets, lead times), or a Flexible Cancellation comparison.",
  ].join("\n")
}

function summariseCancellations(brandId?: string): string {
  const snap = brandId
    ? getBrandInsightSnapshot(brandId, "month")
    : portfolioSnapshot()
  const label = brandId ? snap.brandLabel : "all brands"
  const market = MARKET_COMPARISON_VALUES.find((m) => m.metric === "Cancellation rate")

  return [
    `## Cancellations & re-lets`,
    "",
    `A clear view for **${label}**.`,
    "",
    "### Current performance",
    "",
    `• **Cancellation volume:** ${formatCount(snap.cancellationVolume)}`,
    `• **Cancellation rate:** ${formatPct(snap.cancellationRate)}`,
    `• **Flexible Cancellation cancels:** ${formatCount(snap.cancellationVolumeFc)}`,
    `• **Re-let volume:** ${formatCount(snap.reletVolume)}`,
    `• **Re-let rate:** ${formatPct(snap.reletRate)}`,
    `• **Avg lead time:** ${formatDays(snap.avgLeadTravel)}`,
    `• **Avg holiday value:** ${formatMoney(snap.avgHolidayValue)}`,
    "",
    market
      ? `### Versus market\n\nPartner cancellation rate is **${market.value}** (${market.trend}) against market **${market.side.replace("Market ", "")}**.`
      : "",
    "",
    "### Grow from here",
    "",
    "Ask **where can we increase re-lets** for opportunities to protect and grow revenue from cancelled stays.",
  ]
    .filter(Boolean)
    .join("\n")
}

function opportunityNextStep(kind: "leak" | "undersold" | "split" | "region") {
  if (kind === "leak" || kind === "region") {
    return "Clear open cancels first, then check pricing and lead-in for this slice."
  }
  if (kind === "undersold") {
    return "Push Flexible Cancellation harder here: re-let demand already supports it."
  }
  return "Treat this as the playbook: look for similar long stays to split-fill."
}

/** Assess loop + ops data for re-let growth and revenue opportunities. */
function summariseReletOpportunities(): string {
  const snap = portfolioSnapshot()
  const live = summariseLiveCancellations(LIVE_CANCELLATIONS)
  const opportunities = getFcLoopOpportunities()
  const marketRelet = MARKET_COMPARISON_VALUES.find((m) => m.metric === "Relet rate")
  const guestTakeUp = FC_VALUE_LOOP.steps.find((s) => s.id === "sales")
  const relet = FC_VALUE_LOOP.steps.find((s) => s.id === "relet")
  const extra = FC_VALUE_LOOP.steps.find((s) => s.id === "incremental")
  const proof = PARTIAL_RELETS_INSIGHT.example
  const uplift = Math.round(
    ((proof.recoveredValue - proof.cancelledValue) / proof.cancelledValue) * 100
  )

  const opportunityBlocks = opportunities.flatMap((item, index) => [
    `#### ${index + 1}. ${item.title}`,
    `:::signal ${item.signal}`,
    `:::metrics ${item.metrics}`,
    item.detail,
    `**Next step:** ${opportunityNextStep(item.kind)}`,
    `>>> ${item.askPrompt}`,
    "",
  ])

  return [
    `## Gaps for growth`,
    "",
    `Where Flexible Cancellation can protect and grow revenue for **${PARTNER_BRANDING.shortName}**.`,
    "",
    "### At a glance",
    "",
    `• **Guest take-up:** ${guestTakeUp?.value ?? "12.5%"}`,
    `• **Product margin:** ${formatMoney(snap.calMargin)} (benefit ${formatMoney(snap.calBenefit)})`,
    `• **Re-let rate:** ${relet?.value ?? formatPct(snap.reletRate)}` +
      (marketRelet ? ` · market ${marketRelet.marketLabel}` : ""),
    `• **Extra from re-lets:** ${extra?.value ?? "£115k"}`,
    `• **Open cancels:** ${live.awaiting} stays · ~${formatMoney(live.valueAtRisk)} at risk`,
    "",
    "### Priority gaps",
    "",
    "Act on these first: bedrooms, travel dates, and regions with the clearest upside:",
    "",
    ...opportunityBlocks,
    "### This week",
    "",
    "1. **Push guest take-up where re-let is strong:** safest place to grow conversion and margin.",
    "2. **Clear open cancels:** recover live value before chasing new demand.",
    "3. **Fix high-cancel, low re-let slices:** fastest top-line leak.",
    "4. **Split-fill longer cancels:** e.g. 7 nights as 3n + 4n can beat one full rebook" +
      ` (example kept **${formatMoney(proof.recoveredValue)}** vs **${formatMoney(proof.cancelledValue)}**, +${uplift}%).`,
    "",
    "### Dig deeper",
    "",
    "Tap a gap above, or ask about a region, brand, or period trend.",
  ].join("\n")
}

function gapLabel(delta: number, unit = "pts") {
  if (Math.abs(delta) < 0.05) return `in line with portfolio`
  const sign = delta > 0 ? "+" : ""
  return `${sign}${delta.toFixed(1)} ${unit} vs portfolio`
}

/** Deep dive on one bedroom × departure slice from the value-loop cube. */
function summariseBookingTypeDrilldown(bedroomLabel: string, departureLabel: string): string {
  const slice = getFcLoopSlice(bedroomLabel, departureLabel)
  if (!slice) {
    return [
      `## I could not match that booking type`,
      "",
      "Try a prompt like **Drill into 5+ bed · Aug: cancel vs re-let by lead time**, or ask **where can we increase re-lets** for the opportunity list.",
    ].join("\n")
  }

  const { overall, byLeadTime, portfolioGap } = slice
  const gap = overall.cancel - overall.relet
  const weakestLead = [...byLeadTime].sort(
    (a, b) => b.metrics.cancel - b.metrics.relet - (a.metrics.cancel - a.metrics.relet)
  )[0]!
  const strongestRelet = [...byLeadTime].sort((a, b) => b.metrics.relet - a.metrics.relet)[0]!

  const leadLines = byLeadTime.map(
    (row) =>
      `• **${row.leadLabel}:** Cancel ${row.metrics.cancel}% · Re-let ${row.metrics.relet}% · Take-up ${row.metrics.sales}% · Kept ${row.metrics.recoveredPct}%`
  )

  const signal = gap >= 15 ? "risk" : overall.relet >= 70 && overall.sales < 16 ? "opportunity" : "success"
  const nextStep =
    gap >= 15
      ? "Treat this as a leak: clear open cancels, then tighten pricing and lead-in on the softest band."
      : overall.relet >= 70 && overall.sales < 16
        ? "Re-let demand looks healthy: push Flexible Cancellation harder on this bedroom and month."
        : "Copy what works in the strongest lead-time band into the weaker ones."

  return [
    `## ${slice.bedroomLabel} · ${slice.departureLabel}`,
    "",
    "A focused cut of this booking type, so you can act with confidence.",
    "",
    `:::signal ${signal}`,
    `:::metrics Cancel–re-let gap ${gap.toFixed(1)} pts`,
    "",
    "### Snapshot",
    "",
    `• **Guest take-up:** ${overall.sales}% · ${gapLabel(portfolioGap.sales)}`,
    `• **Cancel:** ${overall.cancel}% · ${gapLabel(portfolioGap.cancel)}`,
    `• **Re-let:** ${overall.relet}% · ${gapLabel(portfolioGap.relet)}`,
    `• **Value kept:** ${overall.recoveredPct}% · ${gapLabel(portfolioGap.recoveredPct)}`,
    "",
    "### By lead time",
    "",
    ...leadLines,
    "",
    "### Stand-outs",
    "",
    `• **Tightest gap:** ${weakestLead.leadLabel} (cancel ${weakestLead.metrics.cancel}% · re-let ${weakestLead.metrics.relet}%)`,
    `• **Best re-let:** ${strongestRelet.leadLabel} at ${strongestRelet.metrics.relet}%`,
    "",
    "### Next step",
    "",
    nextStep,
    "",
    "### Dig deeper",
    "",
    `>>> Compare brands on re-lets for ${slice.bedroomLabel} stays`,
    `>>> Where can we increase re-lets and protect more revenue?`,
    `>>> What trends support selling more Flexible Cancellation?`,
  ].join("\n")
}

function summariseRevenue(): string {
  const drivers = PARTNER_REVENUE.drivers
    .map((d) => `• **${d.label}:** ${d.value}`)
    .join("\n")
  const effect = ADDITIONAL_PARTNER_REVENUE.drivers
    .map((d) => {
      const note = d.versus ? `vs ${d.versus}` : d.side
      const roleNote = d.role === "volume" ? "volume base, not incremental" : "profile comparison"
      return `• **${d.label}:** ${d.value} (${d.trend})${note ? `: ${note}` : ""} · ${roleNote}`
    })
    .join("\n")

  return [
    `## Partner revenue`,
    "",
    `A clear view for **${PARTNER_BRANDING.shortName}**.`,
    "",
    "### Headline",
    "",
    `**${PARTNER_REVENUE.headline}** ${PARTNER_REVENUE.headlineNote}`,
    "",
    "### How it builds",
    "",
    drivers,
    "",
    "### Additional uplift",
    "",
    `Estimated Pikl'd Stays effect: **${ADDITIONAL_PARTNER_REVENUE.headline}**`,
    "",
    effect,
    "",
    "### Grow from here",
    "",
    "Ask **where can we increase re-lets** for practical opportunities to protect more of this revenue.",
  ].join("\n")
}

function summariseMarket(): string {
  const rows = MARKET_COMPARISON_VALUES.map(
    (m) => `• **${m.metric}:** ${m.value} (${m.trend}) vs ${m.side}`
  )
  return [
    `## Partner vs market`,
    "",
    "How your portfolio compares on the metrics that matter for growth.",
    "",
    "### Benchmarks",
    "",
    ...rows,
    "",
    "### The takeaway",
    "",
    "You are ahead on rebookability, lead time, and length of stay, with cancellation rate slightly better than market.",
    "",
    "Ask **where can we increase re-lets** to turn that advantage into clearer revenue actions.",
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
    `## Brand comparison`,
    "",
    `**${a.brandLabel}** vs **${b.brandLabel}**: side by side.`,
    "",
    "### Snapshot",
    "",
    `| Metric | ${a.brandLabel} | ${b.brandLabel} |`,
    `| --- | --- | --- |`,
    `| Portfolio share | ${formatShare(BRAND_VOLUME_SHARE[a.brandId as (typeof BRAND_IDS)[number]])} | ${formatShare(BRAND_VOLUME_SHARE[b.brandId as (typeof BRAND_IDS)[number]])} |`,
    `| Guest take-up | ${formatPct(a.calAttachment)} | ${formatPct(b.calAttachment)} |`,
    `| Flexible Cancellation margin | ${formatMoney(a.calMargin)} | ${formatMoney(b.calMargin)} |`,
    `| Damage Deposit Waiver attachment | ${formatPct(a.ddlAttachment)} | ${formatPct(b.ddlAttachment)} |`,
    `| Cancellation rate | ${formatPct(a.cancellationRate)} | ${formatPct(b.cancellationRate)} |`,
    `| Re-let rate | ${formatPct(a.reletRate)} | ${formatPct(b.reletRate)} |`,
    `| Avg lead time | ${formatDays(a.avgLeadTravel)} | ${formatDays(b.avgLeadTravel)} |`,
    "",
    "### The takeaway",
    "",
    a.calAttachment >= b.calAttachment
      ? `${a.brandLabel} leads on Flexible Cancellation guest take-up; ${b.brandLabel} ${a.calMargin >= b.calMargin ? "trails on margin given share" : "still contributes solid margin relative to share"}.`
      : `${b.brandLabel} leads on Flexible Cancellation guest take-up in this cut.`,
    "",
    "### Want more?",
    "",
    "Ask to include Dream Cottages, or focus on financials / re-lets only.",
  ].join("\n")
}

function summariseFinancials(): string {
  const rows = FINANCIALS_GRID.map((row) => `• **${row.label}:** ${row.total.value} (total)`)
  return [
    `## Contribution financials`,
    "",
    "Product cost and re-let economics that sit under Contribution to performance.",
    "",
    "### Totals",
    "",
    ...rows,
    "",
    "### Want more?",
    "",
    "Ask for cancellation and re-let volumes, or **where can we increase re-lets**.",
  ].join("\n")
}

function draftReport(): string {
  const snap = portfolioSnapshot()
  return [
    `## Monthly insights brief`,
    "",
    `A concise update for **${PARTNER_BRANDING.name}**.`,
    "",
    "### Headline",
    "",
    `Partner revenue **${PARTNER_REVENUE.headline}** after product cost, with estimated Pikl'd Stays uplift of **${ADDITIONAL_PARTNER_REVENUE.headline}**.`,
    "",
    "### Volume & attachment",
    "",
    TOTAL_PRODUCTS_SUMMARY.map((i) => `• **${i.label}:** ${i.value}`).join("\n"),
    "",
    "### Products",
    "",
    `• Flexible Cancellation attachment **${formatPct(snap.calAttachment)}**, margin **${formatMoney(snap.calMargin)}**`,
    `• Damage Deposit Waiver attachment **${formatPct(snap.ddlAttachment)}**, margin **${formatMoney(snap.ddlMargin)}**`,
    "",
    "### Cancellations & re-lets",
    "",
    `• Cancellation rate **${formatPct(snap.cancellationRate)}**, re-let rate **${formatPct(snap.reletRate)}**`,
    `• Avg lead time booking → travel **${formatDays(snap.avgLeadTravel)}**`,
    "",
    "### Brands",
    "",
    BRAND_IDS.map(
      (id) => `• **${BRAND_LABELS[id]}:** ${formatShare(BRAND_VOLUME_SHARE[id])} of volume`
    ).join("\n"),
    "",
    "### Next",
    "",
    "Ask for re-let growth opportunities, a brand comparison, or talking points for a commercial review.",
  ].join("\n")
}

function helpReply(partnerName: string): string {
  return [
    `## How I can help`,
    "",
    `I read live partner data for **${PARTNER_BRANDING.name}**, ${partnerName}.`,
    "",
    "Grow revenue through conversion, margin, behaviour, and re-lets with Flexible Cancellation, not as an add-on.",
    "",
    "### Gaps & growth",
    "",
    "• Where to **increase re-lets** and protect cancelled value",
    "• What is **driving guest behaviour**, and where to act",
    "• Soft **regions** and what history suggests next",
    "",
    "### Trends & detail",
    "",
    "• Sales vs cancellations (e.g. **Jun 2025 – Jun 2026**)",
    "• Portfolio, brand, and market comparisons",
    "",
    "### Get started",
    "",
    "Pick an example below, or ask in your own words.",
  ].join("\n")
}

function wantsReletOpportunityAdvice(lower: string) {
  const asksOpportunity =
    lower.includes("increas") ||
    lower.includes("opportunit") ||
    lower.includes("trend") ||
    lower.includes("leak") ||
    lower.includes("protect") ||
    lower.includes("grow revenue") ||
    lower.includes("more revenue") ||
    lower.includes("max revenue") ||
    lower.includes("maximise") ||
    lower.includes("maximize") ||
    lower.includes("value loop") ||
    lower.includes("where can") ||
    lower.includes("where should") ||
    lower.includes("how can we") ||
    lower.includes("how do we") ||
    lower.includes("leverage") ||
    lower.includes("act on") ||
    lower.includes("run the business") ||
    lower.includes("driving") ||
    lower.includes("behaviour") ||
    lower.includes("behavior") ||
    lower.includes("conversion") ||
    lower.includes("margin")

  const aboutRelets =
    lower.includes("relet") ||
    lower.includes("re-let") ||
    lower.includes("rebook") ||
    lower.includes("cancelled stay") ||
    lower.includes("flexible cancellation") ||
    lower.includes("cover take-up") ||
    lower.includes("guest take-up") ||
    lower.includes("cover conversion") ||
    lower.includes("value loop") ||
    lower.includes("max revenue") ||
    lower.includes("guest behaviour") ||
    lower.includes("guest behavior") ||
    lower.includes("run the business")

  return asksOpportunity && aboutRelets
}

function wantsSalesCancelTrendReport(lower: string) {
  const mentionsPeriod =
    (lower.includes("2025") && lower.includes("2026")) ||
    lower.includes("jun 2025") ||
    lower.includes("june 2025") ||
    lower.includes("last 12") ||
    lower.includes("past year") ||
    lower.includes("rolling year")

  const salesVsCancel =
    (lower.includes("sales") && lower.includes("cancel")) ||
    lower.includes("sales vs") ||
    lower.includes("bookings vs cancel")

  const cancelRateTrend =
    (lower.includes("cancellation rate") || lower.includes("cancel rate")) &&
    (lower.includes("improv") ||
      lower.includes("trend") ||
      lower.includes("getting better") ||
      lower.includes("worsen") ||
      lower.includes("going up") ||
      lower.includes("going down"))

  const periodReport =
    mentionsPeriod &&
    (lower.includes("sales") ||
      lower.includes("cancel") ||
      lower.includes("relet") ||
      lower.includes("re-let") ||
      lower.includes("report") ||
      lower.includes("trend"))

  return salesVsCancel || cancelRateTrend || periodReport
}

function summariseSalesCancelTrendReport(): string {
  const period = summariseSalesCancelPeriod()
  const trendLine =
    period.cancelTrend === "improving"
      ? `Yes: cancellation rate is **improving**. First half **${period.earlyCancelRate}%**, second half **${period.lateCancelRate}%** (**${period.cancelRateDelta.toFixed(1)} pp**).`
      : period.cancelTrend === "worsening"
        ? `No: cancellation rate is **worsening**. First half **${period.earlyCancelRate}%**, second half **${period.lateCancelRate}%** (**+${Math.abs(period.cancelRateDelta).toFixed(1)} pp**).`
        : `Cancellation rate is **broadly stable**. First half **${period.earlyCancelRate}%**, second half **${period.lateCancelRate}%** (**${period.cancelRateDelta >= 0 ? "+" : ""}${period.cancelRateDelta.toFixed(1)} pp**).`

  const monthlyLines = period.rows.map(
    (row) =>
      `• **${row.label}:** Sales ${formatCount(row.bookings)} · Cancels ${formatCount(row.cancellations)} (${row.cancelRate}%) · Re-lets ${formatCount(row.relets)} (${row.reletRate}%)`
  )

  return [
    `## Period report: sales vs cancellations`,
    "",
    `Departure-window view for **${PARTNER_BRANDING.shortName}** from **${period.fromLabel}** to **${period.toLabel}**.`,
    "",
    "> Same shape as Phasing & trends: bookings, cancels, and re-lets tied to when guests were due to travel.",
    "",
    "### Headline",
    "",
    trendLine,
    "",
    "### Totals for the window",
    "",
    `• **Sales (Flexible Cancellation bookings):** ${formatCount(period.bookings)}`,
    `• **Cancellations:** ${formatCount(period.cancellations)}`,
    `• **Cancellation rate:** ${period.cancelRate}%`,
    `• **Re-lets:** ${formatCount(period.relets)}`,
    `• **Re-let rate:** ${period.reletRate}%`,
    "",
    "### Start vs end of period",
    "",
    `• **${period.first.label}:** ${formatCount(period.first.bookings)} sales · ${period.first.cancelRate}% cancel · ${period.first.reletRate}% re-let`,
    `• **${period.toLabel}:** ${formatCount(period.last.bookings)} sales · ${period.last.cancelRate}% cancel · ${period.last.reletRate}% re-let`,
    `• Peak sales month: **${period.peak.label}** (${formatCount(period.peak.bookings)} bookings)`,
    `• Softest cancel rate: **${period.softestCancel.label}** (${period.softestCancel.cancelRate}%)`,
    `• Highest cancel rate: **${period.highestCancel.label}** (${period.highestCancel.cancelRate}%)`,
    "",
    "### Month by month",
    "",
    ...monthlyLines,
    "",
    "### What this means",
    "",
    period.cancelTrend === "improving"
      ? "Volume still peaks in summer, but a lower cancel rate into 2026 means less revenue at risk for the same sales. Keep pushing re-lets on peak months."
      : "Watch months where cancel rate is highest alongside re-let performance: that is where revenue protection pays off fastest.",
    "",
    "### Dig deeper",
    "",
    ">>> Where can we increase re-lets and protect more revenue?",
    ">>> Which bedrooms and travel dates are leaking cancelled stays?",
    ">>> Compare Manor vs Lake Lovers",
  ].join("\n")
}

function summariseRegionRecoveryOverview(): string {
  const opportunities = getRegionRecoveryOpportunities()
  const opportunityBlocks = opportunities.flatMap((item, index) => {
    const signal =
      item.kind === "leak" ? "risk" : item.kind === "watch" ? "opportunity" : "success"
    const nextStep =
      item.kind === "leak"
        ? "Prioritise open cancels and short-lead pricing in this region first."
        : item.kind === "watch"
          ? "Watch shoulder months and keep a re-let playbook ready before peak."
          : "Use this region as the benchmark when setting recovery targets elsewhere."

    return [
      `#### ${index + 1}. ${item.label}`,
      `:::signal ${signal}`,
      `:::metrics ${item.metrics}`,
      item.detail,
      `**Next step:** ${nextStep}`,
      `>>> ${item.askPrompt}`,
      "",
    ]
  })

  return [
    `## Region recovery gaps`,
    "",
    `Where cancelled stays fill again, and what history suggests next, for **${PARTNER_BRANDING.shortName}**.`,
    "",
    "> Outlooks extend the recent trend; they are indicative, not a guarantee.",
    "",
    "### Priority regions",
    "",
    ...opportunityBlocks,
    "### This week",
    "",
    "1. **Fix soft regions first:** high cancel with low re-let is recoverable revenue.",
    "2. **Copy strong regions:** where recovery regularly beats cancelled value.",
    "3. **Use history for planning:** drill in for the monthly series and next-quarter outlook.",
    "",
    "### Dig deeper",
    "",
    ">>> Drill into North East region recovery: historical re-let and outlook",
    ">>> Drill into South West region recovery: historical re-let and outlook",
    ">>> Where can we increase re-lets and protect more revenue?",
  ].join("\n")
}

function summariseRegionRecoveryDrilldown(regionId: RegionRecoveryId): string {
  const profile = getRegionRecovery(regionId)
  const { latest, outlook, trend, history } = profile
  const recent = history.slice(-6)
  const historyLines = recent.map(
    (row) =>
      `• **${row.label}:** Cancel ${row.cancelRate}% · Re-let ${row.reletRate}% · Kept ${row.recoveryRate}% · ${formatCount(row.cancellations)} → ${formatCount(row.relets)}`
  )

  const reletTrendLine =
    trend.reletDirection === "improving"
      ? `Re-let is **improving** (**+${trend.reletDelta} pp** first half → second half of the window).`
      : trend.reletDirection === "softening"
        ? `Re-let is **softening** (**${trend.reletDelta} pp** across the window).`
        : `Re-let is **broadly stable** (**${trend.reletDelta >= 0 ? "+" : ""}${trend.reletDelta} pp**).`

  const recoveryTrendLine =
    trend.recoveryDirection === "improving"
      ? `Value recovery is **improving** (**+${trend.recoveryDelta} pp**).`
      : trend.recoveryDirection === "softening"
        ? `Value recovery is **softening** (**${trend.recoveryDelta} pp**).`
        : `Value recovery is **broadly stable** (**${trend.recoveryDelta >= 0 ? "+" : ""}${trend.recoveryDelta} pp**).`

  return [
    `## ${profile.label}`,
    "",
    profile.character,
    "",
    "> History: Jun 2025 – Jun 2026. Outlook for Jul–Sep 2026 is indicative.",
    "",
    "### Latest",
    "",
    `:::metrics Cancel ${latest.cancelRate}% · Re-let ${latest.reletRate}% · Kept ${latest.recoveryRate}%`,
    `• **Volume:** ${formatCount(latest.cancellations)} cancels → ${formatCount(latest.relets)} re-lets`,
    "",
    "### Trend",
    "",
    reletTrendLine,
    recoveryTrendLine,
    "",
    "### Recent months",
    "",
    ...historyLines,
    "",
    "### Outlook",
    "",
    `**${outlook.label}** · confidence ${outlook.confidence}`,
    "",
    `:::metrics Cancel ${outlook.cancelRate}% · Re-let ${outlook.reletRate}% · Kept ${outlook.recoveryRate}%`,
    outlook.narrative,
    "",
    "### Next step",
    "",
    latest.reletRate < 55
      ? "Add this to the recovery watchlist: clear open cancels early, and price for short-lead demand before soft months."
      : latest.recoveryRate >= 100
        ? "Use this as proof that re-lets can beat cancelled value, and look for similar stay lengths to split-fill elsewhere."
        : "Keep the re-let playbook ready for peak months; history suggests recovery stays workable if demand holds.",
    "",
    "### Dig deeper",
    "",
    ">>> Which regions have weak re-let recovery, and what does history predict?",
    `>>> Compare brands on re-lets for ${profile.label}`,
    ">>> Where can we increase re-lets and protect more revenue?",
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

  const regionId = matchRegionRecoveryFromPrompt(prompt)
  const wantsRegionDrill =
    Boolean(regionId) &&
    (lower.includes("drill") ||
      lower.includes("break down") ||
      lower.includes("dig into") ||
      lower.includes("outlook") ||
      lower.includes("historical") ||
      lower.includes("predict") ||
      (lower.includes("region") && (lower.includes("recover") || lower.includes("relet") || lower.includes("re-let"))))

  if (wantsRegionDrill && regionId) {
    return summariseRegionRecoveryDrilldown(regionId)
  }

  if (wantsRegionRecoveryAdvice(lower)) {
    return summariseRegionRecoveryOverview()
  }

  const drillSlice = matchFcLoopSliceFromPrompt(prompt)
  const wantsDrill =
    Boolean(drillSlice) &&
    (lower.includes("drill") ||
      lower.includes("break down") ||
      lower.includes("dig into") ||
      lower.includes("by lead time") ||
      lower.includes("guest take-up vs") ||
      lower.includes("cover take-up vs") ||
      lower.includes("value kept"))

  if (wantsDrill && drillSlice) {
    return summariseBookingTypeDrilldown(drillSlice.bedroomLabel, drillSlice.departureLabel)
  }

  if (wantsSalesCancelTrendReport(lower)) {
    return summariseSalesCancelTrendReport()
  }

  if (wantsReletOpportunityAdvice(lower)) {
    return summariseReletOpportunities()
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
    (lower.includes("pikl") && !lower.includes("flexible"))
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
    if (brand && !lower.includes("compare")) {
      const snap = getBrandInsightSnapshot(brand, "month")
      return [
        `**${snap.brandLabel}** (${formatShare(BRAND_VOLUME_SHARE[brand])} of portfolio):`,
        "",
        ...snap.summary.map((s) => `• **${s.label}:** ${s.value}`),
        "",
        `Flexible Cancellation attachment **${formatPct(snap.calAttachment)}**, Damage Deposit Waiver **${formatPct(snap.ddlAttachment)}**, cancellation rate **${formatPct(snap.cancellationRate)}**.`,
        "",
        "Ask for Flexible Cancellation detail, cancellations, or a comparison with another brand.",
      ].join("\n")
    }
    return summarisePortfolio()
  }

  return [
    `## I can help with that`,
    "",
    `I looked across the **${PARTNER_BRANDING.shortName}** partner data.`,
    "",
    "### Try asking",
    "",
    "• **How do we drive max revenue with Flexible Cancellation: conversion, margin, and re-lets?**",
    "• **What is driving guest behaviour, and how should we run the business?**",
    "• **Where can we increase re-lets and protect more revenue?**",
    "",
    "Or pick an example prompt from the home screen.",
  ].join("\n")
}

export function welcomeAiMessage(partnerName: string): AiChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    text: [
      `## Welcome, ${partnerName}`,
      "",
      `I am your AI coworker for **${PARTNER_BRANDING.name}**.`,
      "",
      "I help you grow revenue through conversion, margin, behaviour, and re-lets with Flexible Cancellation, not as an add-on.",
      "",
      "### Get started",
      "",
      "Pick an example below, or ask in your own words.",
    ].join("\n"),
  }
}
