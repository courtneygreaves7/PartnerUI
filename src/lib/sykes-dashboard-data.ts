export const SYKES_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

export const PHASING_BANNER_TITLE =
  "Phasing of Margin earned from Flexible Cancellation; When people are travelling; cancellation/relet rate"

export const PARTNER_REVENUE = {
  headline: "£1.8m",
  headlineNote: "(net of insurance premium rate + IPT)",
  drivers: [
    { label: "Attachment (Average)", value: "14%" },
    { label: "Margin (ex. VAT) £m", value: "£900k" },
    { label: "Incremental Cancellations & Relets", value: "£100k" },
    {
      label: "Website Conversion*",
      value: "£800k p/a",
      note: "*measured as +1% during testing",
    },
    { label: "Total", value: "£1,800k", highlight: true },
  ],
} as const

export const ADDITIONAL_PARTNER_REVENUE = {
  headline: "£x",
  drivers: [
    {
      label: "Gross Bookings",
      value: "690k",
      trend: "+500",
      side: "65% % Product available",
    },
    {
      label: "Average Lead Time v Non-FC",
      value: "125 Days",
      trend: "+15",
      side: "£100k Est Value TBC",
    },
    {
      label: "Average Length of Stay v Non-FC",
      value: "6.1 Days",
      trend: "+0.5",
      side: "£100k Est Value TBC",
    },
    {
      label: "Average Customer Spend per Booking v Non-FC",
      value: "£899",
      trend: "+3",
      side: "£100k Est Value TBC",
    },
    {
      label: "Average Pikl'd Stay IPB",
      value: "£4.0",
      trend: "+1",
      side: "£100k Est Value TBC",
      note:
        "(Partner Revenue (net of insurance premium rate + IPT) / bookings with a product avail)",
    },
  ],
} as const

export const MARKET_COMPARISON_METRICS = [
  "Cancellation Rate",
  "Rebookability Rate",
  "Rebookability Average value",
  "Average Lead Time",
  "Average Length of Stay",
] as const

export const DASHBOARD_FOOTNOTES = [
  "Conversion would need to pro-rata based on date range being looked at",
  "Need green or red metrics - e.g. Average Length of FC Booking, and can we ascribe a £value to it",
] as const

export const PROPOSITION_NOTES = {
  layout:
    "Could have 2 sections or include a filter by Product to see each",
  flexibleCancellation:
    "[Split by type using a product filter eg. Same day, 7 day...] [May not get stats by device?]",
} as const

export const TOTAL_PRODUCTS_SUMMARY = [
  { label: "Total Bookings", value: "690k" },
  { label: "% of Bookings that are offered a product", value: "65%" },
  { label: "Total Bookings offered a Product", value: "448,500" },
  { label: "Total Margin Earned", value: "800k" },
  { label: "Income per Booking Achieved", value: "4.01" },
] as const

export type ChannelCellVariant =
  | "channel"
  | "volume"
  | "attachment"
  | "rate"
  | "direct"
  | "total"
  | "empty"

export type ChannelGridCell = {
  value: string
  variant: ChannelCellVariant
}

export type ChannelGridRow = {
  label: string
  website: ChannelGridCell
  app: ChannelGridCell
  offline: ChannelGridCell
  ota: ChannelGridCell
  direct: ChannelGridCell
  total: ChannelGridCell
}

const channelPlaceholder = (letter: string): ChannelGridCell => ({
  value: letter,
  variant: "channel",
})

const volumePlaceholder = (letter: string): ChannelGridCell => ({
  value: letter,
  variant: "volume",
})
const attachmentPlaceholder = (): ChannelGridCell => ({
  value: "%",
  variant: "attachment",
})
const directFormula = (): ChannelGridCell => ({
  value: "A+B+C",
  variant: "direct",
})
const totalFormula = (): ChannelGridCell => ({
  value: "A+B+C+D",
  variant: "total",
})
const rateValue = (value: string): ChannelGridCell => ({
  value,
  variant: "rate",
})
const emptyCell = (): ChannelGridCell => ({
  value: "—",
  variant: "empty",
})

function placeholderRow(label: string): ChannelGridRow {
  return {
    label,
    website: channelPlaceholder("A"),
    app: channelPlaceholder("B"),
    offline: channelPlaceholder("C"),
    ota: channelPlaceholder("D"),
    direct: directFormula(),
    total: totalFormula(),
  }
}

function volumeRow(label: string): ChannelGridRow {
  return {
    label,
    website: volumePlaceholder("A"),
    app: volumePlaceholder("B"),
    offline: volumePlaceholder("C"),
    ota: volumePlaceholder("D"),
    direct: directFormula(),
    total: totalFormula(),
  }
}

export const FLEXIBLE_CANCELLATION_GRID: ChannelGridRow[] = [
  volumeRow("FC Bookings"),
  {
    label: "FC Attachment",
    website: attachmentPlaceholder(),
    app: attachmentPlaceholder(),
    offline: attachmentPlaceholder(),
    ota: attachmentPlaceholder(),
    direct: attachmentPlaceholder(),
    total: attachmentPlaceholder(),
  },
  {
    label: "FC Guest Price Avg % [still works with dynamic]",
    website: rateValue("10%"),
    app: rateValue("10%"),
    offline: rateValue("10%"),
    ota: rateValue("10%"),
    direct: rateValue("10%"),
    total: rateValue("10%"),
  },
  {
    label: "FC Insurance Premium Rate Avg % [still works with dynamic]",
    website: rateValue("6.35%"),
    app: rateValue("6.35%"),
    offline: rateValue("6.35%"),
    ota: rateValue("6.35%"),
    direct: rateValue("6.35%"),
    total: rateValue("6.35%"),
  },
  {
    label: "FC Partner Margin £",
    website: channelPlaceholder("A"),
    app: channelPlaceholder("B"),
    offline: channelPlaceholder("C"),
    ota: channelPlaceholder("D"),
    direct: directFormula(),
    total: totalFormula(),
  },
  {
    label: "Commission and Booking Fee Benefit from Incremental Cancellations",
    website: channelPlaceholder("A"),
    app: channelPlaceholder("B"),
    offline: channelPlaceholder("C"),
    ota: channelPlaceholder("D"),
    direct: directFormula(),
    total: totalFormula(),
  },
  {
    label: "Out of Test Conversion Benefit (1% = x) 1% = £900,000",
    website: rateValue("1.0%"),
    app: { value: "N/A", variant: "empty" },
    offline: { value: "N/A", variant: "empty" },
    ota: { value: "N/A", variant: "empty" },
    direct: emptyCell(),
    total: emptyCell(),
  },
]

export const DAMAGE_DEPOSIT_WAIVER_GRID: ChannelGridRow[] = [
  volumeRow("DDL Bookings"),
  {
    label: "DDL Attachment",
    website: attachmentPlaceholder(),
    app: attachmentPlaceholder(),
    offline: attachmentPlaceholder(),
    ota: attachmentPlaceholder(),
    direct: attachmentPlaceholder(),
    total: attachmentPlaceholder(),
  },
  {
    label: "DDL Guest Price Avg %",
    website: rateValue("£30"),
    app: rateValue("£30"),
    offline: rateValue("£30"),
    ota: rateValue("£30"),
    direct: rateValue("£30"),
    total: rateValue("£30"),
  },
  {
    label: "DDL Insurance Premium Rate Avg%",
    website: rateValue("2.12%"),
    app: rateValue("2.12%"),
    offline: rateValue("2.12%"),
    ota: rateValue("2.12%"),
    direct: rateValue("2.12%"),
    total: rateValue("2.12%"),
  },
  {
    label: "DDL Partner Margin £",
    website: channelPlaceholder("A"),
    app: channelPlaceholder("B"),
    offline: channelPlaceholder("C"),
    ota: channelPlaceholder("D"),
    direct: directFormula(),
    total: totalFormula(),
  },
  {
    label: "Out of Test Conversion Benefit",
    website: { value: "", variant: "attachment" },
    app: { value: "N/A", variant: "empty" },
    offline: { value: "N/A", variant: "empty" },
    ota: { value: "N/A", variant: "empty" },
    direct: emptyCell(),
    total: emptyCell(),
  },
]

export const CONTRIBUTION_TO_PERFORMANCE_GRID: ChannelGridRow[] = [
  placeholderRow("Cancellation Volume"),
  placeholderRow("Cancellation Avg %"),
]

export const PERFORMANCE_METRICS_GRID: ChannelGridRow[] = [
  placeholderRow("Cancellation Volume FC"),
  placeholderRow("Cancellation % Avg FC"),
  placeholderRow("Relet Volume"),
  placeholderRow("Re-let % Avg"),
  placeholderRow("Re-Let Value Avg"),
  placeholderRow("Re-Let Volume FC"),
  placeholderRow("Re-let % FC Avg"),
  placeholderRow("Re-Let Value FC Avg"),
  placeholderRow("Average Length of Booking"),
  placeholderRow("Average Length of Booking FC"),
  placeholderRow("Average Lead time between Booking and Travel"),
  placeholderRow("Average Lead time between Booking and Travel FC"),
  {
    label: "Average Holiday Value Per Booking £",
    website: channelPlaceholder("A"),
    app: channelPlaceholder("B"),
    offline: channelPlaceholder("C"),
    ota: channelPlaceholder("D"),
    direct: { value: "A+B+C", variant: "attachment" },
    total: totalFormula(),
  },
  placeholderRow("Average Holiday Value Per Booking with FC £"),
  placeholderRow("Average Lead time between Booking and Cancellation"),
  placeholderRow("Average Lead time between Booking and Cancellation FC"),
  placeholderRow("Average Lead time between Cancellation and Relet"),
  placeholderRow("Average Lead time between Cancellation and Relet FC"),
]

export const FINANCIALS_GRID: ChannelGridRow[] = [
  placeholderRow("Insurance Premium Paid £"),
  placeholderRow("Claims Made £"),
  placeholderRow("Re-Let Rental Charges Paid to Insurer £"),
  placeholderRow("Re-Let Rental Charges Potential (Paid and Potential) £"),
  placeholderRow("Loss Ratio % on Paid Re-Let"),
  placeholderRow("Loss Ratio % on Re-Let Potential (Paid and Potential)"),
]

export type MonthlyTripleSeries = {
  month: string
  bookings: number
  cancellations: number
  relets: number
}

export const MARGIN_EARNED_FC_DATA = SYKES_MONTHS.map((month, index) => {
  const values = [1000, 800, 700, 600, 600, 600, 600, 600, 600, 600, 600, 600]
  return { month, value: values[index] }
})

export const EVENTS_BY_DATE_SUMMER_DATA: MonthlyTripleSeries[] = [
  { month: "Jan", bookings: 200, cancellations: 20, relets: 12 },
  { month: "Feb", bookings: 200, cancellations: 20, relets: 12 },
  { month: "Mar", bookings: 400, cancellations: 40, relets: 24 },
  { month: "Apr", bookings: 600, cancellations: 60, relets: 36 },
  { month: "May", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Jun", bookings: 800, cancellations: 80, relets: 48 },
  { month: "Jul", bookings: 1500, cancellations: 150, relets: 90 },
  { month: "Aug", bookings: 2000, cancellations: 200, relets: 120 },
  { month: "Sep", bookings: 800, cancellations: 80, relets: 48 },
  { month: "Oct", bookings: 400, cancellations: 40, relets: 24 },
  { month: "Nov", bookings: 200, cancellations: 20, relets: 12 },
  { month: "Dec", bookings: 250, cancellations: 25, relets: 15 },
]

export const EVENTS_BY_DATE_DECLINING_DATA: MonthlyTripleSeries[] = [
  { month: "Jan", bookings: 1000, cancellations: 100, relets: 60 },
  { month: "Feb", bookings: 800, cancellations: 80, relets: 48 },
  { month: "Mar", bookings: 700, cancellations: 70, relets: 42 },
  { month: "Apr", bookings: 600, cancellations: 60, relets: 36 },
  { month: "May", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Jun", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Jul", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Aug", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Sep", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Oct", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Nov", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Dec", bookings: 600, cancellations: 60, relets: 36 },
]

export const DEPARTURES_BY_DATE_DATA = EVENTS_BY_DATE_SUMMER_DATA

export const TRIPLE_SERIES_COLORS = {
  bookings: "#1e3a5f",
  cancellations: "#e87722",
  relets: "#1a5c3e",
} as const

export const TRIPLE_SERIES_LABELS = {
  bookings: "FC Bookings Made",
  cancellations: "FC Cancellations",
  relets: "FC Relets",
} as const
