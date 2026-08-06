import {
  IMPACT_PERIODS,
  PORTFOLIO,
  type ImpactPeriodId,
} from "@/lib/mock-portfolio/derive"
import { formatGbp, formatPct, formatPp, formatVolume } from "@/lib/mock-portfolio/format"

function round(n: number, decimals = 0) {
  const f = 10 ** decimals
  return Math.round(n * f) / f
}

/** Rate / profile shifts so period filters change Home metrics (YTD = baseline anchors). */
const PERIOD_SHIFT: Record<
  ImpactPeriodId,
  {
    cancelPp: number
    attachmentPp: number
    reletPp: number
    rebookPp: number
    rebookValue: number
    leadDays: number
    losDays: number
    spend: number
    ipb: number
    volumeTrend: number
  }
> = {
  mtd: {
    cancelPp: 0.5,
    attachmentPp: -1.0,
    reletPp: -4,
    rebookPp: -2,
    rebookValue: -15,
    leadDays: -8,
    losDays: -0.3,
    spend: -18,
    ipb: -0.4,
    volumeTrend: 35,
  },
  qtd: {
    cancelPp: 0.2,
    attachmentPp: -0.4,
    reletPp: -2,
    rebookPp: -1,
    rebookValue: -8,
    leadDays: -3,
    losDays: -0.1,
    spend: -8,
    ipb: -0.15,
    volumeTrend: 110,
  },
  ytd: {
    cancelPp: 0,
    attachmentPp: 0,
    reletPp: 0,
    rebookPp: 0,
    rebookValue: 0,
    leadDays: 0,
    losDays: 0,
    spend: 0,
    ipb: 0,
    volumeTrend: 420,
  },
  all: {
    cancelPp: -0.3,
    attachmentPp: 0.5,
    reletPp: 2,
    rebookPp: 1,
    rebookValue: 12,
    leadDays: 4,
    losDays: 0.2,
    spend: 12,
    ipb: 0.25,
    volumeTrend: 680,
  },
}

export function periodWeight(period: ImpactPeriodId) {
  return IMPACT_PERIODS.find((p) => p.id === period)?.weight ?? 1
}

/** Months visible in sparklines for the selected period (YTD ends at Jul). */
export function periodMonthCount(period: ImpactPeriodId) {
  if (period === "mtd") return 1
  if (period === "qtd") return 3
  if (period === "ytd") return 7
  return 12
}

export function homeMetricsForPeriod(period: ImpactPeriodId) {
  const weight = periodWeight(period)
  const shift = PERIOD_SHIFT[period]

  const cancelPct = round(PORTFOLIO.fcCancelPct + shift.cancelPp, 1)
  const marketCancelPct = round(PORTFOLIO.market.cancelPct + shift.cancelPp * 0.4, 1)
  const attachmentPct = round(PORTFOLIO.attachmentPct + shift.attachmentPp, 1)
  const marketAttachmentPct = round(
    PORTFOLIO.market.attachmentPct + shift.attachmentPp * 0.5,
    1
  )
  const reletPct = round(PORTFOLIO.reletPct + shift.reletPp, 1)
  const marketReletPct = round(PORTFOLIO.market.reletPct + shift.reletPp * 0.5, 1)
  const rebookPct = round(PORTFOLIO.market.rebookabilityPct + 3 + shift.rebookPp, 0)
  const marketRebookPct = round(PORTFOLIO.market.rebookabilityPct + shift.rebookPp * 0.5, 0)
  const rebookValue = PORTFOLIO.market.rebookabilityValue + 25 + shift.rebookValue
  const marketRebookValue = PORTFOLIO.market.rebookabilityValue + Math.round(shift.rebookValue * 0.4)

  const leadDays = PORTFOLIO.profile.leadTimeDays + shift.leadDays
  const marketLeadDays = PORTFOLIO.market.leadTimeDays + Math.round(shift.leadDays * 0.4)
  const losDays = round(PORTFOLIO.profile.losDays + shift.losDays, 1)
  const marketLosDays = round(PORTFOLIO.market.losDays + shift.losDays * 0.4, 1)
  const spend = PORTFOLIO.profile.spendPerBooking + shift.spend
  const ipb = round(PORTFOLIO.profile.ipb + shift.ipb, 1)

  const margin = Math.round(PORTFOLIO.fcMargin * weight)
  const conversion = Math.round(PORTFOLIO.conversionUplift * weight)
  const incremental = Math.round(PORTFOLIO.incrementalTotal * weight)
  const generated = margin + conversion + incremental
  const bookings = Math.round(PORTFOLIO.bookings * weight)

  const cancelDelta = round(cancelPct - marketCancelPct, 1)
  const attachmentDelta = round(attachmentPct - marketAttachmentPct, 1)
  const reletDelta = round(reletPct - marketReletPct, 1)
  const rebookDelta = round(rebookPct - marketRebookPct, 1)

  return {
    period,
    weight,
    monthCount: periodMonthCount(period),
    stays: {
      attachmentPct,
      attachmentLabel: formatPct(attachmentPct, 1),
      margin,
      marginLabel: formatGbp(margin, "thousands"),
      incremental,
      incrementalLabel: formatGbp(incremental, "thousands"),
      conversion,
      conversionLabel: `${formatGbp(conversion, "thousands")} p/a`,
      generated,
      generatedLabel: formatGbp(generated, "thousands"),
      headline: formatGbp(generated, "compact"),
      support: {
        attachment: `vs ${Math.round(PORTFOLIO.offerRate * 100)}% product availability`,
        margin: `${Math.round((margin / generated) * 100)}% of total partner revenue`,
        incremental: `${Math.round((incremental / generated) * 100)}% of total partner revenue`,
        conversion: "Website conversion uplift",
        total: "(after product cost)",
      },
      driverBars: [
        {
          label: "Incremental",
          width: `${Math.round((incremental / margin) * 100)}%`,
          color: "#0054CC",
          value: formatGbp(incremental, "thousands"),
        },
        {
          label: "Website",
          width: `${Math.round((conversion / margin) * 100)}%`,
          color: "#3389FF",
          value: formatGbp(conversion, "thousands"),
        },
        {
          label: "Margin",
          width: "100%",
          color: "#99C4FF",
          value: formatGbp(margin, "thousands"),
        },
      ] as const,
    },
    effect: {
      bookings,
      bookingsLabel: formatVolume(bookings),
      bookingsTrend: `+${shift.volumeTrend}`,
      leadDays,
      leadLabel: `${leadDays} days`,
      leadTrend: `+${leadDays - PORTFOLIO.profile.leadTimeWithoutFc}`,
      leadVersus: `${PORTFOLIO.profile.leadTimeWithoutFc} days without Flexible Cancellation`,
      losDays,
      losLabel: `${losDays} days`,
      losTrend: `+${(losDays - PORTFOLIO.profile.losWithoutFc).toFixed(1)}`,
      losVersus: `${PORTFOLIO.profile.losWithoutFc} days without Flexible Cancellation`,
      spend,
      spendLabel: `£${spend}`,
      spendTrend: `+£${spend - PORTFOLIO.profile.spendWithoutFc}`,
      spendVersus: `£${PORTFOLIO.profile.spendWithoutFc} without Flexible Cancellation`,
      ipb,
      ipbLabel: `£${ipb.toFixed(1)}`,
      ipbTrend: `+£${(ipb - PORTFOLIO.profile.ipbWithoutFc).toFixed(1)}`,
      ipbVersus: `£${PORTFOLIO.profile.ipbWithoutFc.toFixed(1)} without Flexible Cancellation`,
      offerPct: Math.round(PORTFOLIO.offerRate * 100),
    },
    market: [
      {
        metric: "Cancellation rate",
        chartLabel: "Cancel rate",
        value: formatPct(cancelPct, 1),
        partner: cancelPct,
        market: marketCancelPct,
        marketLabel: formatPct(marketCancelPct, 1),
        trend: formatPp(cancelDelta),
        tone: (cancelDelta <= 0 ? "up" : "down") as "up" | "down",
        side: `Market ${formatPct(marketCancelPct, 1)}`,
      },
      {
        metric: "Attachment rate",
        chartLabel: "Attachment",
        value: formatPct(attachmentPct, 1),
        partner: attachmentPct,
        market: marketAttachmentPct,
        marketLabel: formatPct(marketAttachmentPct, 1),
        trend: formatPp(attachmentDelta),
        tone: (attachmentDelta >= 0 ? "up" : "down") as "up" | "down",
        side: `Market ${formatPct(marketAttachmentPct, 1)}`,
      },
      {
        metric: "Relet rate",
        chartLabel: "Relet rate",
        value: formatPct(reletPct, 1),
        partner: reletPct,
        market: marketReletPct,
        marketLabel: formatPct(marketReletPct, 1),
        trend: formatPp(reletDelta),
        tone: (reletDelta >= 0 ? "up" : "down") as "up" | "down",
        side: `Market ${formatPct(marketReletPct, 1)}`,
      },
      {
        metric: "Rebookability rate",
        chartLabel: "Rebook rate",
        value: formatPct(rebookPct, 0),
        partner: rebookPct,
        market: marketRebookPct,
        marketLabel: formatPct(marketRebookPct, 0),
        trend: formatPp(rebookDelta),
        tone: (rebookDelta >= 0 ? "up" : "down") as "up" | "down",
        side: `Market ${formatPct(marketRebookPct, 0)}`,
      },
      {
        metric: "Rebookability average value",
        chartLabel: "Rebook value",
        value: `£${rebookValue}`,
        partner: rebookValue,
        market: marketRebookValue,
        marketLabel: `£${marketRebookValue}`,
        trend: `+£${rebookValue - marketRebookValue}`,
        tone: "up" as const,
        side: `Market £${marketRebookValue}`,
      },
      {
        metric: "Average lead time",
        chartLabel: "Lead time",
        value: `${leadDays} days`,
        partner: leadDays,
        market: marketLeadDays,
        marketLabel: `${marketLeadDays} days`,
        trend: `+${leadDays - marketLeadDays}`,
        tone: "up" as const,
        side: `Market ${marketLeadDays} days`,
      },
      {
        metric: "Average length of stay",
        chartLabel: "Length of stay",
        value: `${losDays} days`,
        partner: losDays,
        market: marketLosDays,
        marketLabel: `${marketLosDays} days`,
        trend: `+${(losDays - marketLosDays).toFixed(1)}`,
        tone: "up" as const,
        side: `Market ${marketLosDays} days`,
      },
    ],
  }
}

export type HomePeriodMetrics = ReturnType<typeof homeMetricsForPeriod>
