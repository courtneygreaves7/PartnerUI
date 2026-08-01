import PptxGenJS from "pptxgenjs"

import type { ActiveFilters } from "@/lib/chart-data"
import { formatFilterContext } from "@/lib/chart-data"
import { UK_PITCH_DECK_HIGHLIGHTS } from "@/lib/insights-map-data"
import { PARTNER_BRANDING } from "@/lib/partner-branding"
import {
  DAMAGE_DEPOSIT_WAIVER_GRID,
  FLEXIBLE_CANCELLATION_GRID,
  GROSS_BOOKINGS_TREND,
  MARKET_COMPARISON_VALUES,
  PARTNER_REVENUE,
  TOTAL_PRODUCTS_SUMMARY,
} from "@/lib/sykes-dashboard-data"

const COLORS = {
  blue: "006BFF",
  blueDark: "0054CC",
  blueLight: "EEF5FF",
  accent: "3389FF",
  charcoal: "18181B",
  muted: "5B6B85",
  white: "FFFFFF",
  grey: "F4F6F9",
  greyBorder: "D5E0EA",
} as const

const FONT = "Arial"

type Slide = PptxGenJS.Slide

function gridTotal(rowIndex: number, grid: typeof FLEXIBLE_CANCELLATION_GRID) {
  return grid[rowIndex]?.total.value ?? "—"
}

function periodLabel(filters: ActiveFilters) {
  return filters.dateRange === "year-to-month-end"
    ? `${filters.month} ${filters.year} (YTD)`
    : `${filters.month} ${filters.year}`
}

function buildFilename(filters: ActiveFilters) {
  const slug = filters.month.toLowerCase().replace(/\s+/g, "-")
  return `sykes-insights-${slug}-${filters.year}.pptx`
}

function addFooter(slide: Slide, period: string, slideNum: number) {
  slide.addText(`${PARTNER_BRANDING.shortName} Holiday Cottages`, {
    x: 0.55,
    y: 5.12,
    w: 4.5,
    h: 0.28,
    fontSize: 7.5,
    color: COLORS.muted,
    fontFace: FONT,
  })
  slide.addText(period, {
    x: 7.2,
    y: 5.12,
    w: 1.8,
    h: 0.28,
    fontSize: 7.5,
    color: COLORS.muted,
    fontFace: FONT,
    align: "right",
  })
  slide.addText(String(slideNum).padStart(2, "0"), {
    x: 9.15,
    y: 5.12,
    w: 0.45,
    h: 0.28,
    fontSize: 7.5,
    color: COLORS.muted,
    fontFace: FONT,
    align: "right",
  })
}

function addTag(
  slide: Slide,
  ShapeType: PptxGenJS["ShapeType"],
  text: string,
  x: number,
  y: number
) {
  const w = Math.min(2.4, text.length * 0.075 + 0.45)
  slide.addShape(ShapeType.roundRect, {
    x,
    y,
    w,
    h: 0.3,
    fill: { color: COLORS.blueLight },
    line: { color: COLORS.blue, width: 0.5 },
    rectRadius: 0.06,
  })
  slide.addText(text.toUpperCase(), {
    x: x + 0.12,
    y,
    w: w - 0.2,
    h: 0.3,
    fontSize: 7,
    bold: true,
    color: COLORS.blue,
    fontFace: FONT,
    valign: "middle",
  })
}

function addKpiCard(
  slide: Slide,
  ShapeType: PptxGenJS["ShapeType"],
  opts: {
    x: number
    y: number
    w: number
    h: number
    value: string
    label: string
    dark?: boolean
  }
) {
  const { x, y, w, h, value, label, dark = false } = opts
  slide.addShape(ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    fill: { color: dark ? COLORS.charcoal : COLORS.white },
    line: { color: dark ? COLORS.charcoal : COLORS.greyBorder, width: 0.75 },
    rectRadius: 0.1,
  })
  slide.addText(value, {
    x: x + 0.18,
    y: y + 0.22,
    w: w - 0.36,
    h: 0.65,
    fontSize: value.length > 6 ? 22 : 28,
    bold: true,
    color: dark ? COLORS.white : COLORS.blue,
    fontFace: FONT,
  })
  slide.addText(label, {
    x: x + 0.18,
    y: y + 0.92,
    w: w - 0.36,
    h: 0.55,
    fontSize: 8.5,
    color: dark ? "B8C4D9" : COLORS.muted,
    fontFace: FONT,
    lineSpacingMultiple: 1.1,
  })
}

function addSectionSlide(
  pptx: PptxGenJS,
  title: string,
  subtitle: string,
  period: string,
  slideNum: number
) {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.blue }
  slide.addText(title, {
    x: 0.75,
    y: 1.85,
    w: 8.5,
    h: 1.1,
    fontSize: 36,
    bold: true,
    color: COLORS.white,
    fontFace: FONT,
  })
  slide.addText(subtitle, {
    x: 0.75,
    y: 3.05,
    w: 7.5,
    h: 0.6,
    fontSize: 14,
    color: "D6E8FF",
    fontFace: FONT,
  })
  addFooter(slide, period, slideNum)
  return slide
}

export async function downloadInsightsPitchDeck(filters: ActiveFilters): Promise<void> {
  const pptx = new PptxGenJS()
  const { ShapeType, ChartType } = pptx
  pptx.layout = "LAYOUT_16x9"
  pptx.author = PARTNER_BRANDING.name
  pptx.company = PARTNER_BRANDING.name
  pptx.title = `${PARTNER_BRANDING.shortName} Partner Insights`
  pptx.subject = formatFilterContext(filters)

  const period = periodLabel(filters)
  const context = formatFilterContext(filters)
  let slideNum = 1

  // ── 1. Cover ──────────────────────────────────────────────────────────────
  {
    const slide = pptx.addSlide()
    slide.background = { color: COLORS.blue }
    slide.addShape(ShapeType.ellipse, {
      x: 7.2,
      y: -0.8,
      w: 4.5,
      h: 4.5,
      fill: { color: COLORS.blueDark, transparency: 35 },
      line: { color: COLORS.blueDark, transparency: 100 },
    })
    slide.addShape(ShapeType.ellipse, {
      x: -1.2,
      y: 3.8,
      w: 3.2,
      h: 3.2,
      fill: { color: COLORS.accent, transparency: 55 },
      line: { color: COLORS.accent, transparency: 100 },
    })
    slide.addText("Partner Insights", {
      x: 0.75,
      y: 1.55,
      w: 8.5,
      h: 0.55,
      fontSize: 14,
      color: "D6E8FF",
      fontFace: FONT,
      charSpacing: 3,
    })
    slide.addText("Performance &\nProduct Report", {
      x: 0.75,
      y: 2.1,
      w: 8,
      h: 1.5,
      fontSize: 40,
      bold: true,
      color: COLORS.white,
      fontFace: FONT,
      lineSpacingMultiple: 1.05,
    })
    slide.addText(context, {
      x: 0.75,
      y: 3.85,
      w: 7,
      h: 0.45,
      fontSize: 12,
      color: "E8F2FF",
      fontFace: FONT,
    })
    slide.addText(PARTNER_BRANDING.name, {
      x: 0.75,
      y: 5.05,
      w: 5,
      h: 0.35,
      fontSize: 9,
      color: "B8D4FF",
      fontFace: FONT,
    })
    slideNum++
  }

  // ── 2. Agenda ─────────────────────────────────────────────────────────────
  {
    const slide = pptx.addSlide()
    slide.background = { color: COLORS.white }
    addTag(slide, ShapeType, "Contents", 0.75, 0.65)
    slide.addText("What's inside", {
      x: 0.75,
      y: 1.05,
      w: 4.5,
      h: 0.75,
      fontSize: 30,
      bold: true,
      color: COLORS.charcoal,
      fontFace: FONT,
    })
    const items = [
      "01  Executive summary",
      "02  Product performance",
      "03  Flexible Cancellation",
      "04  Damage Deposit Waiver",
      "05  Revenue drivers",
      "06  Market & regional view",
    ]
    items.forEach((item, i) => {
      slide.addText(item, {
        x: 5.1,
        y: 1.0 + i * 0.62,
        w: 4.2,
        h: 0.5,
        fontSize: 13,
        color: i === 0 ? COLORS.blue : COLORS.charcoal,
        fontFace: FONT,
        bold: i === 0,
      })
    })
    addFooter(slide, period, slideNum++)
  }

  // ── 3. Executive summary ──────────────────────────────────────────────────
  {
    const slide = pptx.addSlide()
    slide.background = { color: COLORS.white }
    addTag(slide, ShapeType, "Overview", 0.75, 0.65)
    slide.addText("Strong product performance\nacross the portfolio", {
      x: 0.75,
      y: 1.05,
      w: 4.8,
      h: 1.4,
      fontSize: 26,
      bold: true,
      color: COLORS.charcoal,
      fontFace: FONT,
      lineSpacingMultiple: 1.1,
    })
    slide.addText(
      "Partner products are driving attachment, margin, and incremental booking value — with consistent outperformance vs market benchmarks.",
      {
        x: 0.75,
        y: 2.55,
        w: 4.5,
        h: 1.2,
        fontSize: 11,
        color: COLORS.muted,
        fontFace: FONT,
        lineSpacingMultiple: 1.35,
      }
    )

    slide.addShape(ShapeType.roundRect, {
      x: 5.35,
      y: 0.55,
      w: 4.1,
      h: 4.55,
      fill: { color: COLORS.blue },
      line: { color: COLORS.blue },
      rectRadius: 0.12,
    })

    const kpis = [
      { value: TOTAL_PRODUCTS_SUMMARY[0].value, label: "Gross bookings" },
      { value: PARTNER_REVENUE.drivers[0].value, label: "Attachment (avg)" },
      { value: `£${TOTAL_PRODUCTS_SUMMARY[3].value}`, label: "Total margin earned" },
    ]
    kpis.forEach((kpi, i) => {
      slide.addText(kpi.value, {
        x: 5.65,
        y: 0.95 + i * 1.35,
        w: 3.5,
        h: 0.7,
        fontSize: 34,
        bold: true,
        color: COLORS.white,
        fontFace: FONT,
        align: "right",
      })
      slide.addText(kpi.label, {
        x: 5.65,
        y: 1.55 + i * 1.35,
        w: 3.5,
        h: 0.35,
        fontSize: 10,
        color: "D6E8FF",
        fontFace: FONT,
        align: "right",
      })
    })
    addFooter(slide, period, slideNum++)
  }

  // ── 4. Product performance grid ───────────────────────────────────────────
  {
    const slide = pptx.addSlide()
    slide.background = { color: COLORS.grey }
    addTag(slide, ShapeType, "Products", 0.75, 0.55)
    slide.addText("Product snapshot", {
      x: 0.75,
      y: 0.95,
      w: 5,
      h: 0.65,
      fontSize: 28,
      bold: true,
      color: COLORS.charcoal,
      fontFace: FONT,
    })
    slide.addText("Key volume and margin indicators for the selected period.", {
      x: 0.75,
      y: 1.65,
      w: 4.5,
      h: 0.5,
      fontSize: 10.5,
      color: COLORS.muted,
      fontFace: FONT,
    })

    const cards = [
      TOTAL_PRODUCTS_SUMMARY[0],
      TOTAL_PRODUCTS_SUMMARY[1],
      TOTAL_PRODUCTS_SUMMARY[3],
      TOTAL_PRODUCTS_SUMMARY[4],
    ]
    const positions = [
      { x: 0.75, y: 2.35 },
      { x: 5.15, y: 2.35 },
      { x: 0.75, y: 3.85 },
      { x: 5.15, y: 3.85 },
    ]
    cards.forEach((card, i) => {
      addKpiCard(slide, ShapeType, {
        ...positions[i],
        w: 4.1,
        h: 1.35,
        value: card.value.startsWith("£") ? card.value : card.value,
        label: card.label,
        dark: i === 3,
      })
    })
    addFooter(slide, period, slideNum++)
  }

  // ── 5. CAL section divider ────────────────────────────────────────────────
  addSectionSlide(
    pptx,
    "Flexible Cancellation",
    "Attachment, margin, and incremental booking benefit by channel.",
    period,
    slideNum++
  )

  // ── 6. CAL insights ───────────────────────────────────────────────────────
  {
    const slide = pptx.addSlide()
    slide.background = { color: COLORS.white }
    addTag(slide, ShapeType, "CAL", 0.75, 0.6)
    slide.addText("Flexible Cancellation\nis performing strongly", {
      x: 0.75,
      y: 1.0,
      w: 4.4,
      h: 1.2,
      fontSize: 24,
      bold: true,
      color: COLORS.charcoal,
      fontFace: FONT,
      lineSpacingMultiple: 1.08,
    })
    slide.addText(
      "High website attachment and consistent margin contribution. Incremental cancellations and relets add further partner value.",
      {
        x: 0.75,
        y: 2.35,
        w: 4.2,
        h: 1.1,
        fontSize: 10.5,
        color: COLORS.muted,
        fontFace: FONT,
        lineSpacingMultiple: 1.35,
      }
    )

    const calMetrics = [
      { value: gridTotal(0, FLEXIBLE_CANCELLATION_GRID), label: "FC bookings" },
      { value: gridTotal(1, FLEXIBLE_CANCELLATION_GRID), label: "FC attachment" },
      { value: gridTotal(4, FLEXIBLE_CANCELLATION_GRID), label: "Partner margin" },
    ]
    calMetrics.forEach((m, i) => {
      slide.addText(m.value, {
        x: 0.75,
        y: 3.55 + i * 0.55,
        w: 1.8,
        h: 0.45,
        fontSize: 20,
        bold: true,
        color: COLORS.blue,
        fontFace: FONT,
      })
      slide.addText(m.label, {
        x: 2.6,
        y: 3.62 + i * 0.55,
        w: 2.5,
        h: 0.35,
        fontSize: 10,
        color: COLORS.muted,
        fontFace: FONT,
        valign: "middle",
      })
    })

    slide.addChart(
      ChartType.bar,
      [
        {
          name: "FC by channel",
          labels: ["Website", "App", "Offline", "OTA"],
          values: [48300, 19320, 9660, 19320],
        },
      ],
      {
        x: 5.2,
        y: 0.85,
        w: 4.35,
        h: 3.85,
        barDir: "col",
        chartColors: [COLORS.blueDark, COLORS.blue, COLORS.accent, "8CB8FF"],
        showLegend: false,
        showTitle: false,
        valAxisMaxVal: 55000,
        catAxisLabelFontSize: 9,
        valAxisLabelFontSize: 8,
        dataLabelFontSize: 8,
        dataLabelPosition: "outEnd",
        dataLabelColor: COLORS.muted,
      }
    )
    addFooter(slide, period, slideNum++)
  }

  // ── 7. DDL section divider ────────────────────────────────────────────────
  addSectionSlide(
    pptx,
    "Damage Deposit Waiver",
    "Growing attachment with healthy margin per booking.",
    period,
    slideNum++
  )

  // ── 8. DDL insights ───────────────────────────────────────────────────────
  {
    const slide = pptx.addSlide()
    slide.background = { color: COLORS.white }
    addTag(slide, ShapeType, "DDL", 0.75, 0.6)
    slide.addText("Damage Deposit Waiver\nadds incremental margin", {
      x: 0.75,
      y: 1.0,
      w: 4.4,
      h: 1.2,
      fontSize: 24,
      bold: true,
      color: COLORS.charcoal,
      fontFace: FONT,
      lineSpacingMultiple: 1.08,
    })
    slide.addText(
      "DDL continues to convert on direct channels with a steady guest price and competitive premium rate.",
      {
        x: 0.75,
        y: 2.35,
        w: 4.2,
        h: 1.0,
        fontSize: 10.5,
        color: COLORS.muted,
        fontFace: FONT,
        lineSpacingMultiple: 1.35,
      }
    )

    const ddlMetrics = [
      { value: gridTotal(0, DAMAGE_DEPOSIT_WAIVER_GRID), label: "DDL bookings" },
      { value: gridTotal(1, DAMAGE_DEPOSIT_WAIVER_GRID), label: "DDL attachment" },
      { value: gridTotal(4, DAMAGE_DEPOSIT_WAIVER_GRID), label: "Partner margin" },
    ]
    ddlMetrics.forEach((m, i) => {
      addKpiCard(slide, ShapeType, {
        x: 5.15,
        y: 0.85 + i * 1.45,
        w: 4.1,
        h: 1.25,
        value: m.value,
        label: m.label,
        dark: i === 2,
      })
    })
    addFooter(slide, period, slideNum++)
  }

  // ── 9. Revenue drivers ────────────────────────────────────────────────────
  {
    const slide = pptx.addSlide()
    slide.background = { color: COLORS.white }
    addTag(slide, ShapeType, "Revenue", 0.75, 0.6)
    slide.addText("Revenue drivers", {
      x: 0.75,
      y: 1.0,
      w: 4.5,
      h: 0.7,
      fontSize: 28,
      bold: true,
      color: COLORS.charcoal,
      fontFace: FONT,
    })
    slide.addText(`Total partner revenue ${PARTNER_REVENUE.headline}`, {
      x: 0.75,
      y: 1.75,
      w: 4.2,
      h: 0.4,
      fontSize: 12,
      color: COLORS.blue,
      fontFace: FONT,
      bold: true,
    })
    slide.addText(PARTNER_REVENUE.headlineNote, {
      x: 0.75,
      y: 2.15,
      w: 4,
      h: 0.35,
      fontSize: 9,
      color: COLORS.muted,
      fontFace: FONT,
    })

    const driverLabels = ["Incremental", "Website conv.", "Margin", "Total"]
    const driverValues = [100, 800, 900, 1800]
    slide.addChart(
      ChartType.bar,
      [
        {
          name: "£k",
          labels: driverLabels,
          values: driverValues,
        },
      ],
      {
        x: 0.65,
        y: 2.65,
        w: 5.5,
        h: 2.55,
        barDir: "col",
        chartColors: [COLORS.blueDark, COLORS.accent, COLORS.blue, COLORS.charcoal],
        showLegend: false,
        valAxisMaxVal: 2000,
        catAxisLabelFontSize: 9,
        dataLabelFontSize: 9,
        dataLabelPosition: "outEnd",
        dataLabelFormatCode: "£#,##0k",
      }
    )

    slide.addChart(
      ChartType.line,
      [
        {
          name: "Bookings",
          labels: GROSS_BOOKINGS_TREND.map((d) => d.label),
          values: GROSS_BOOKINGS_TREND.map((d) => d.value),
        },
      ],
      {
        x: 5.55,
        y: 2.65,
        w: 3.85,
        h: 2.55,
        chartColors: [COLORS.blue],
        lineSize: 2.5,
        showLegend: false,
        catAxisLabelFontSize: 9,
        valAxisLabelFontSize: 8,
        showTitle: false,
      }
    )
    slide.addText("Gross bookings trend", {
      x: 5.55,
      y: 2.35,
      w: 3.5,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: COLORS.charcoal,
      fontFace: FONT,
    })
    addFooter(slide, period, slideNum++)
  }

  // ── 10. Market benchmarks ─────────────────────────────────────────────────
  {
    const slide = pptx.addSlide()
    slide.background = { color: COLORS.blue }
    slide.addText("Market benchmarks", {
      x: 0.75,
      y: 0.65,
      w: 5,
      h: 0.65,
      fontSize: 28,
      bold: true,
      color: COLORS.white,
      fontFace: FONT,
    })
    slide.addText("Partner metrics vs market — selected highlights.", {
      x: 0.75,
      y: 1.3,
      w: 4.5,
      h: 0.4,
      fontSize: 11,
      color: "D6E8FF",
      fontFace: FONT,
    })

    const marketCards = MARKET_COMPARISON_VALUES.slice(0, 4)
    const positions = [
      { x: 5.0, y: 0.55 },
      { x: 7.05, y: 0.55 },
      { x: 5.0, y: 2.85 },
      { x: 7.05, y: 2.85 },
    ]
    marketCards.forEach((item, i) => {
      addKpiCard(slide, ShapeType, {
        ...positions[i],
        w: 1.85,
        h: 2.05,
        value: item.value,
        label: `${item.metric}\n${item.side}`,
        dark: i === 3,
      })
    })
    addFooter(slide, period, slideNum++)
  }

  // ── 11. Regional spotlight ────────────────────────────────────────────────
  {
    const slide = pptx.addSlide()
    slide.background = { color: COLORS.white }
    addTag(slide, ShapeType, "Regional", 0.75, 0.6)
    slide.addText("Top UK counties", {
      x: 0.75,
      y: 1.0,
      w: 4.5,
      h: 0.7,
      fontSize: 28,
      bold: true,
      color: COLORS.charcoal,
      fontFace: FONT,
    })
    slide.addText("Bookings volume across key UK destinations.", {
      x: 0.75,
      y: 1.75,
      w: 4.2,
      h: 0.4,
      fontSize: 10.5,
      color: COLORS.muted,
      fontFace: FONT,
    })

    const topRegions = [...UK_PITCH_DECK_HIGHLIGHTS]

    topRegions.forEach((region, i) => {
      const barW = (region.bookings / topRegions[0].bookings) * 3.2
      const y = 2.35 + i * 0.58
      slide.addText(region.name, {
        x: 0.75,
        y,
        w: 1.6,
        h: 0.4,
        fontSize: 10,
        color: COLORS.charcoal,
        fontFace: FONT,
        valign: "middle",
      })
      slide.addShape(ShapeType.roundRect, {
        x: 2.5,
        y: y + 0.08,
        w: barW,
        h: 0.24,
        fill: { color: i === 0 ? COLORS.blue : COLORS.accent },
        line: { color: i === 0 ? COLORS.blue : COLORS.accent },
        rectRadius: 0.12,
      })
      slide.addText(region.bookings.toLocaleString("en-GB"), {
        x: 2.5 + barW + 0.15,
        y,
        w: 1.2,
        h: 0.4,
        fontSize: 10,
        bold: true,
        color: COLORS.blue,
        fontFace: FONT,
        valign: "middle",
      })
    })

    slide.addShape(ShapeType.roundRect, {
      x: 5.35,
      y: 0.55,
      w: 4.1,
      h: 4.55,
      fill: { color: COLORS.charcoal },
      line: { color: COLORS.charcoal },
      rectRadius: 0.12,
    })
    slide.addText("232", {
      x: 5.65,
      y: 1.5,
      w: 3.5,
      h: 1.2,
      fontSize: 72,
      bold: true,
      color: COLORS.white,
      fontFace: FONT,
      align: "center",
    })
    slide.addText("UK counties &\nunitary authorities", {
      x: 5.65,
      y: 2.75,
      w: 3.5,
      h: 0.8,
      fontSize: 14,
      color: "B8C4D9",
      fontFace: FONT,
      align: "center",
      lineSpacingMultiple: 1.2,
    })
    slide.addText(
      `${topRegions[0].name} leads with ${topRegions[0].bookings.toLocaleString("en-GB")} bookings`,
      {
        x: 5.65,
        y: 3.85,
        w: 3.5,
        h: 0.7,
        fontSize: 10,
        color: "8FA3BE",
        fontFace: FONT,
        align: "center",
        lineSpacingMultiple: 1.2,
      }
    )
    addFooter(slide, period, slideNum++)
  }

  // ── 12. Key takeaways ─────────────────────────────────────────────────────
  {
    const slide = pptx.addSlide()
    slide.background = { color: COLORS.grey }
    addTag(slide, ShapeType, "Summary", 0.75, 0.6)
    slide.addText("Key takeaways", {
      x: 0.75,
      y: 1.0,
      w: 5,
      h: 0.7,
      fontSize: 28,
      bold: true,
      color: COLORS.charcoal,
      fontFace: FONT,
    })

    const takeaways = [
      `${TOTAL_PRODUCTS_SUMMARY[0].value} gross bookings with ${PARTNER_REVENUE.drivers[0].value} average attachment.`,
      `Flexible Cancellation margin of ${gridTotal(4, FLEXIBLE_CANCELLATION_GRID)} with strong website conversion.`,
      `Damage Deposit Waiver contributing ${gridTotal(4, DAMAGE_DEPOSIT_WAIVER_GRID)} in partner margin.`,
      `Outperforming market on cancellation rate, rebookability, and lead time.`,
    ]
    takeaways.forEach((text, i) => {
      slide.addShape(ShapeType.ellipse, {
        x: 0.85,
        y: 2.05 + i * 0.85,
        w: 0.18,
        h: 0.18,
        fill: { color: COLORS.blue },
        line: { color: COLORS.blue },
      })
      slide.addText(text, {
        x: 1.2,
        y: 1.9 + i * 0.85,
        w: 8.2,
        h: 0.65,
        fontSize: 12,
        color: COLORS.charcoal,
        fontFace: FONT,
        lineSpacingMultiple: 1.25,
        valign: "middle",
      })
    })
    addFooter(slide, period, slideNum++)
  }

  // ── 13. Closing ───────────────────────────────────────────────────────────
  {
    const slide = pptx.addSlide()
    slide.background = { color: COLORS.blue }
    slide.addShape(ShapeType.ellipse, {
      x: 3.8,
      y: 1.2,
      w: 2.4,
      h: 2.4,
      fill: { color: COLORS.white, transparency: 90 },
      line: { color: COLORS.white, transparency: 100 },
    })
    slide.addText("Thank you", {
      x: 0.75,
      y: 1.85,
      w: 8.5,
      h: 0.9,
      fontSize: 40,
      bold: true,
      color: COLORS.white,
      fontFace: FONT,
      align: "center",
    })
    slide.addText("Questions or follow-up?", {
      x: 0.75,
      y: 2.85,
      w: 8.5,
      h: 0.45,
      fontSize: 16,
      color: "D6E8FF",
      fontFace: FONT,
      align: "center",
    })
    slide.addText(PARTNER_BRANDING.contactEmail, {
      x: 0.75,
      y: 3.45,
      w: 8.5,
      h: 0.4,
      fontSize: 12,
      color: COLORS.white,
      fontFace: FONT,
      align: "center",
      underline: { style: "sng" },
    })
    slide.addText(PARTNER_BRANDING.name, {
      x: 0.75,
      y: 5.05,
      w: 8.5,
      h: 0.35,
      fontSize: 9,
      color: "B8D4FF",
      fontFace: FONT,
      align: "center",
    })
  }

  const fileName = buildFilename(filters)
  const blob = (await pptx.write({ outputType: "blob" })) as Blob
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
