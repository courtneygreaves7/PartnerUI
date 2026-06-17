import { useState, type ReactNode } from "react"
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Gauge,
  Percent,
  PoundSterling,
  Timer,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { getPartnerRows } from "@/components/bookings-snapshot"
import { AbvPerDayChart } from "@/components/charts/abv-per-day-chart"
import { BookingsMadePerDayChart } from "@/components/charts/bookings-made-per-day-chart"
import { BookingsVsStaysChart } from "@/components/charts/bookings-vs-stays-chart"
import { CalDdlTakeupChart } from "@/components/charts/cal-ddl-takeup-chart"
import { LeadTimeChart } from "@/components/charts/lead-time-chart"
import { DashboardFilterBar } from "@/components/dashboard-filter-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  type ActiveFilters,
  getAbvProfile,
  getBookingProfile,
  getCalFinProfile,
  getTimingProfile,
} from "@/lib/chart-data"

type InsightsDashboardPageProps = {
  filters: ActiveFilters
  hasRun: boolean
  onRun: (filters: ActiveFilters) => void
}

type KpiCard = {
  label: string
  value: string
  subtext?: string
  icon: LucideIcon
}

type DashboardSlide = {
  id: string
  title: string
  heading: string
  description: string
  content: ReactNode
}

function DashboardKpiCard({ label, value, subtext, icon: Icon }: KpiCard) {
  return (
    <Card className="shadow-none">
      <CardHeader className="items-center p-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-3.5" />
          </div>
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-xl font-medium tracking-tight tabular-nums">{value}</p>
        <p className="mt-1 min-h-4 text-[11px] text-muted-foreground">{subtext ?? "\u00a0"}</p>
      </CardContent>
    </Card>
  )
}

function KpiGrid({ kpis, columns }: { kpis: KpiCard[]; columns: string }) {
  return (
    <div className={cn("grid gap-3", columns)}>
      {kpis.map((kpi) => (
        <DashboardKpiCard key={kpi.label} {...kpi} />
      ))}
    </div>
  )
}

function DashboardCarousel({ slides }: { slides: DashboardSlide[] }) {
  const [index, setIndex] = useState(0)
  const current = slides[index]

  function goPrev() {
    setIndex((currentIndex) => (currentIndex === 0 ? slides.length - 1 : currentIndex - 1))
  }

  function goNext() {
    setIndex((currentIndex) => (currentIndex === slides.length - 1 ? 0 : currentIndex + 1))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-2.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0"
          onClick={goPrev}
          aria-label="Previous section"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="min-w-0 flex-1 text-center">
          <h2 className="truncate text-base font-semibold">{current.title}</h2>
          <p className="text-xs text-muted-foreground">
            {index + 1} of {slides.length}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0"
          onClick={goNext}
          aria-label="Next section"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border px-3 py-2">
        {slides.map((slide, slideIndex) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setIndex(slideIndex)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors",
              slideIndex === index
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {slide.title}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-5 pt-12 pb-6">
          <div className="mb-5">
            <h3 className="text-sm font-semibold">{current.heading}</h3>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
              {current.description}
            </p>
          </div>
          <div className="w-full">{current.content}</div>
        </div>
      </div>
    </div>
  )
}

function formatFilterLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function InsightsDashboardPage({ filters, hasRun, onRun }: InsightsDashboardPageProps) {
  const booking = getBookingProfile(filters)
  const abv = getAbvProfile(filters)
  const calFin = getCalFinProfile(filters)
  const timing = getTimingProfile(filters)
  const partnerRows = getPartnerRows(filters)

  const bookingKpis: KpiCard[] = [
    { label: "Total bookings", value: booking.total, icon: CalendarCheck },
    { label: "CAL sales", value: booking.calSales, icon: TrendingUp },
    { label: "CAL take-up %", value: booking.calPct, icon: Percent },
    { label: "DDL sales", value: booking.ddlSales, icon: CreditCard },
    { label: "DDL take-up %", value: booking.ddlPct, icon: Gauge },
  ]

  const abvKpis: KpiCard[] = [
    {
      label: "ABV (excl. fee) GBP",
      value: abv.gbpAbv,
      subtext: abv.gbpCal,
      icon: Wallet,
    },
    {
      label: "ABV (excl. fee) EUR",
      value: abv.eurAbv,
      subtext: abv.eurCal,
      icon: Wallet,
    },
    {
      label: "ABV inc. fee GBP",
      value: abv.gbpAbvFee,
      subtext: abv.gbpCalFee,
      icon: FileText,
    },
    {
      label: "ABV inc. fee EUR",
      value: abv.eurAbvFee,
      subtext: abv.eurCalFee,
      icon: FileText,
    },
    {
      label: "CAL customer price",
      value: abv.calPct,
      subtext: "% of ABV inc. booking fee",
      icon: Percent,
    },
  ]

  const calFinancialKpis: KpiCard[] = [
    { label: "Total payable", value: calFin.totalPayable, icon: DollarSign },
    { label: "IPT", value: calFin.ipt, icon: DollarSign },
    { label: "PISL comm", value: calFin.pislComm, icon: DollarSign },
    { label: "Capacity net", value: calFin.capacityNet, icon: DollarSign },
    { label: "PISL payable", value: calFin.pislPayable, icon: DollarSign },
    { label: "Premium inc. IPT", value: calFin.premiumInc, icon: PoundSterling },
    { label: "GWP", value: calFin.gwp, subtext: "Gross written premium", icon: PoundSterling },
  ]

  const timingKpis: KpiCard[] = [
    {
      label: "Avg booking to stay GBP",
      value: timing.gbpDays,
      subtext: timing.gbpCal,
      icon: Clock,
    },
    {
      label: "Avg booking to stay EUR",
      value: timing.eurDays,
      subtext: timing.eurCal,
      icon: Clock,
    },
    {
      label: "Avg cancel to stay",
      value: "—",
      subtext: "Days from cancellation to stay start",
      icon: Timer,
    },
  ]

  const slides: DashboardSlide[] = [
    {
      id: "bookings",
      title: "Bookings",
      heading: "Booking volume & take-up",
      description:
        "Total bookings alongside CAL and DDL sales and take-up rates for your selected partners, brands and period.",
      content: <KpiGrid kpis={bookingKpis} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" />,
    },
    {
      id: "abv",
      title: "Average booking value",
      heading: "Average booking value",
      description:
        "ABV in GBP and EUR, with and without booking fees, plus CAL customer price as a share of ABV.",
      content: <KpiGrid kpis={abvKpis} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" />,
    },
    {
      id: "cal-financials",
      title: "CAL financials (GBP)",
      heading: "CAL financials",
      description:
        "Premium breakdown in GBP — payable totals, IPT, commissions, capacity net and gross written premium.",
      content: (
        <KpiGrid kpis={calFinancialKpis} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" />
      ),
    },
    {
      id: "timing",
      title: "Timing",
      heading: "Booking & cancellation timing",
      description:
        "Average lead time from booking to stay start, by currency, plus days from cancellation to stay.",
      content: <KpiGrid kpis={timingKpis} columns="grid-cols-1 sm:grid-cols-3" />,
    },
    {
      id: "bookings-vs-stays",
      title: "Bookings vs stays per day",
      heading: "Bookings made vs stays starting",
      description:
        "Daily trend comparing new bookings against stays commencing, useful for spotting demand vs occupancy shifts.",
      content: <BookingsVsStaysChart filters={filters} compact />,
    },
    {
      id: "cal-ddl-takeup",
      title: "CAL & DDL take-up %",
      heading: "CAL & DDL take-up",
      description:
        "Daily take-up percentages for cancellation liability and deposit loss cover, including partner-level splits.",
      content: <CalDdlTakeupChart filters={filters} compact />,
    },
    {
      id: "lead-time",
      title: "Lead time per day",
      heading: "Lead time per day",
      description:
        "How far in advance guests book, tracked daily across total volume and individual partners.",
      content: <LeadTimeChart filters={filters} compact />,
    },
    {
      id: "abv-per-day",
      title: "ABV per day",
      heading: "ABV per day",
      description:
        "Daily average booking value excluding fees, broken down by partner for the filtered period.",
      content: <AbvPerDayChart filters={filters} compact />,
    },
    {
      id: "bookings-per-day",
      title: "Bookings made per day",
      heading: "Bookings made per day",
      description:
        "Daily booking count across the selected filters — a quick read on volume momentum through the month.",
      content: <BookingsMadePerDayChart filters={filters} compact />,
    },
    {
      id: "partners",
      title: "Partner performance",
      heading: "Partner performance",
      description:
        "Side-by-side bookings, CAL and DDL totals by brand and currency for the active filter set.",
      content: (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="h-11 px-5">Brand</TableHead>
              <TableHead className="px-5">CCY</TableHead>
              <TableHead className="px-5 text-right">Bookings</TableHead>
              <TableHead className="px-5 text-right">CAL</TableHead>
              <TableHead className="px-5 text-right">DDL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partnerRows.map((row) => (
              <TableRow key={row.brand}>
                <TableCell className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${row.color}`} />
                    <span className="text-sm">{row.brand}</span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 text-sm text-muted-foreground">{row.ccy}</TableCell>
                <TableCell className="px-5 py-3 text-right text-sm tabular-nums">
                  {row.bookings}
                </TableCell>
                <TableCell className="px-5 py-3 text-right text-sm tabular-nums text-primary dark:text-blue-400">
                  {row.cal}
                </TableCell>
                <TableCell className="px-5 py-3 text-right text-sm tabular-nums text-amber-600 dark:text-amber-400">
                  {row.ddl}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ),
    },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap gap-2">
        {[
          formatFilterLabel(filters.partner),
          formatFilterLabel(filters.brand),
          filters.dateRange.replace(/-/g, " "),
          `${filters.month} ${filters.year}`,
        ].map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-4 gap-3">
        <div className="col-span-3 flex min-h-0 min-w-0 flex-col">
          {!hasRun ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/10 py-10 text-center">
              <p className="text-sm font-medium">No data to display</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Adjust filters on the right, then press <strong>Run</strong> to load the dashboard.
              </p>
            </div>
          ) : (
            <DashboardCarousel slides={slides} />
          )}
        </div>

        <div className="col-span-1 min-h-0 min-w-0">
          <DashboardFilterBar filters={filters} onRun={onRun} />
        </div>
      </div>
    </div>
  )
}
