import type { FinancialBreakdownRow } from "@/components/widgets/metric-financial-trend-widget"
import type { MetricTrendPoint } from "@/components/widgets/metric-trend-widget"

export type PropertyInsightMetric = {
  id: string
  label: string
  value: string
  subtext?: string
}

export type MonthlyTrendPoint = {
  month: string
  bookingsMade: number
  stayStartMonth: number
}

export type BookingSourceItem = {
  label: string
  value: number
  type: "Channel" | "Web traffic"
  isWebTraffic?: boolean
  vsOther?: number
}

export type OccupancyMonthPoint = {
  label: string
  nights: number
  phase: "past" | "current" | "future"
}

export const PROPERTY_OCCUPANCY = {
  ratePercent: 33.4,
  rateLabel: "33.4%",
  yoyChangePp: 4.2,
  bookedNights: 122,
  availableDays: 365,
  priorYearRatePercent: 29.2,
  periodLabel: "Jun 2025 – Jun 2026",
  peakMonth: "Aug",
  peakNights: 32,
  peakOccupancyPercent: 72,
  monthlyBreakdown: [
    { label: "J", nights: 8, phase: "past" },
    { label: "F", nights: 14, phase: "past" },
    { label: "M", nights: 11, phase: "past" },
    { label: "A", nights: 9, phase: "past" },
    { label: "M", nights: 12, phase: "past" },
    { label: "J", nights: 10, phase: "current" },
    { label: "J", nights: 0, phase: "future" },
    { label: "A", nights: 32, phase: "future" },
    { label: "S", nights: 18, phase: "future" },
    { label: "O", nights: 6, phase: "future" },
    { label: "N", nights: 2, phase: "future" },
    { label: "D", nights: 0, phase: "future" },
  ] satisfies OccupancyMonthPoint[],
}

export const PROPERTY_INSIGHT_METRICS: PropertyInsightMetric[] = [
  {
    id: "avg-lead-days",
    label: "Avg lead days",
    value: "79.7 days",
    subtext: "booking date to stay",
  },
  {
    id: "avg-cancel-from-booking",
    label: "Avg cancel — from booking",
    value: "214.6 days",
    subtext: "days after booking made",
  },
  {
    id: "avg-cancel-to-stay",
    label: "Avg cancel — to stay",
    value: "130.5 days",
    subtext: "days before stay start",
  },
  {
    id: "avg-booking-value",
    label: "Avg booking value",
    value: "£648.55",
    subtext: "GBP",
  },
  {
    id: "cal-coverage",
    label: "CAL coverage",
    value: "0.0%",
    subtext: "0 of 12",
  },
  {
    id: "ddl-coverage",
    label: "DDL coverage",
    value: "0.0%",
    subtext: "0 of 12",
  },
  {
    id: "avg-nights",
    label: "Avg nights",
    value: "10.2",
    subtext: "per stay",
  },
  {
    id: "avg-guests",
    label: "Avg guests",
    value: "2.7",
    subtext: "per stay",
  },
  {
    id: "occupancy",
    label: "Occupancy (12M)",
    value: PROPERTY_OCCUPANCY.rateLabel,
    subtext: "nights booked / 365",
  },
  {
    id: "cancellation-rate",
    label: "Cancellation rate",
    value: "8.3%",
    subtext: "12 total bookings",
  },
  {
    id: "repeat-guests",
    label: "Repeat guests",
    value: "1",
    subtext: "guests with 2+ bookings",
  },
]

export const PROPERTY_PORTFOLIO_BENCHMARKS = {
  avgLeadDays: "92.4 days",
  avgCancelToStay: "156 days",
  avgCancelFromBooking: "248 days",
  avgNights: "11.4",
  avgGuests: "3.2",
  cancellationRate: "6.2%",
  avgBookingValue: "£712",
}

export const PROPERTY_MONTHLY_TRENDS: MonthlyTrendPoint[] = [
  { month: "Aug 25", bookingsMade: 1, stayStartMonth: 0 },
  { month: "Dec 25", bookingsMade: 1, stayStartMonth: 0 },
  { month: "Jan 26", bookingsMade: 1, stayStartMonth: 1 },
  { month: "Feb 26", bookingsMade: 5, stayStartMonth: 2 },
  { month: "Mar 26", bookingsMade: 1, stayStartMonth: 2 },
  { month: "Apr 26", bookingsMade: 0, stayStartMonth: 2 },
  { month: "May 26", bookingsMade: 0, stayStartMonth: 2 },
  { month: "Jul 26", bookingsMade: 0, stayStartMonth: 2 },
  { month: "Aug 26", bookingsMade: 0, stayStartMonth: 2 },
]

export const PROPERTY_BOOKING_VALUE_TREND: MetricTrendPoint[] = [
  { label: "Jan", value: 612 },
  { label: "Feb", value: 628 },
  { label: "Mar", value: 641 },
  { label: "Apr", value: 655 },
  { label: "May", value: 638 },
  { label: "Jun", value: 649 },
]

export const PROPERTY_BOOKINGS_COUNT_TREND: MetricTrendPoint[] = [
  { label: "Jan", value: 1 },
  { label: "Feb", value: 5 },
  { label: "Mar", value: 1 },
  { label: "Apr", value: 0 },
  { label: "May", value: 0 },
  { label: "Jun", value: 0 },
]

export const PROPERTY_LEAD_DAYS_TREND: MetricTrendPoint[] = [
  { label: "Jan", value: 88 },
  { label: "Feb", value: 82 },
  { label: "Mar", value: 76 },
  { label: "Apr", value: 74 },
  { label: "May", value: 81 },
  { label: "Jun", value: 80 },
]

export const PROPERTY_REPEAT_GUESTS_TREND: MetricTrendPoint[] = [
  { label: "Jan", value: 0 },
  { label: "Feb", value: 0 },
  { label: "Mar", value: 0 },
  { label: "Apr", value: 0 },
  { label: "May", value: 0 },
  { label: "Jun", value: 1 },
]

export const PROPERTY_RANKED_BOOKING_SOURCES: BookingSourceItem[] = [
  { label: "Direct", value: 8, type: "Channel" },
  { label: "Airbnb", value: 3, type: "Channel" },
  { label: "Booking.com", value: 1, type: "Channel" },
  { label: "Website traffic", value: 12, type: "Web traffic", isWebTraffic: true, vsOther: 0 },
]

export function parseInsightNumeric(value: string) {
  const match = value.replace(/,/g, "").match(/[\d.]+/)
  return match ? Number.parseFloat(match[0]) : null
}

export function getInsightBenchmarkPercent(value: string, benchmark: string) {
  const current = parseInsightNumeric(value)
  const target = parseInsightNumeric(benchmark)
  if (!current || !target) return 0
  return Math.round((current / target) * 100)
}

export function getBookingSourceBreakdown(): FinancialBreakdownRow[] {
  const channels = PROPERTY_RANKED_BOOKING_SOURCES.filter((source) => !source.isWebTraffic)
  const total = channels.reduce((sum, source) => sum + source.value, 0)

  return channels.map((source) => ({
    label: source.label,
    value: `${source.value} bookings`,
    sharePercent: total ? Math.round((source.value / total) * 100) : 0,
  }))
}

export function getBookingSourceTotal() {
  return PROPERTY_RANKED_BOOKING_SOURCES.filter((source) => !source.isWebTraffic).reduce(
    (sum, source) => sum + source.value,
    0
  )
}

export function getDirectSharePercent() {
  const breakdown = getBookingSourceBreakdown()
  return breakdown.find((row) => row.label === "Direct")?.sharePercent ?? 0
}
