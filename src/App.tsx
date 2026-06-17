import { useEffect, useState } from "react"
import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  Download,
  SquareChartGantt,
  ArrowLeftRight,
  Zap,
  LogOut,
  MoonStar,
  Settings2,
  Sun,
} from "lucide-react"

import { BookingEnginePage } from "@/components/booking-engine-page"
import { ComparePage } from "@/components/compare-page"
import { FilterSidebar } from "@/components/filter-sidebar"
import { LoginPage } from "@/components/login-page"
import { SectionNav } from "@/components/section-nav"
import { AverageBookingValueSnapshot } from "@/components/average-booking-value-snapshot"
import { BookingsSnapshot } from "@/components/bookings-snapshot"
import { CalFinancials } from "@/components/cal-financials"
import { TimingSnapshot } from "@/components/timing-snapshot"
import { AbvPerDayChart } from "@/components/charts/abv-per-day-chart"
import { BookingsMadePerDayChart } from "@/components/charts/bookings-made-per-day-chart"
import { BookingsVsStaysChart } from "@/components/charts/bookings-vs-stays-chart"
import { CalDdlTakeupChart } from "@/components/charts/cal-ddl-takeup-chart"
import { LeadTimeChart } from "@/components/charts/lead-time-chart"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { type ActiveFilters, DEFAULT_FILTERS } from "@/lib/chart-data"

const navItems = [
  { id: "booking-engine" as const, label: "Booking engine", icon: Zap },
  { id: "insights" as const, label: "Insights", icon: BarChart3 },
  { id: "admin" as const, label: "Admin", icon: Settings2 },
]

type ActiveSection = (typeof navItems)[number]["id"]
type InsightsView = "insights" | "compare"

function SectionDivider() {
  return <div aria-hidden className="h-px w-full bg-border" />
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState<ActiveSection>("booking-engine")
  const [insightsView, setInsightsView] = useState<InsightsView>("insights")
  const [hasRun, setHasRun] = useState(false)
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(DEFAULT_FILTERS)

  function handleLogout() {
    setIsAuthenticated(false)
    setHasRun(false)
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="relative h-screen overflow-hidden bg-background text-foreground">

      {/* ── Ambient brand glows ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,var(--glow-pink)_0%,transparent_68%)]" />
        <div className="absolute -bottom-40 left-[20%] h-[480px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,var(--glow-green)_0%,transparent_68%)]" />
        <div className="absolute top-[35%] right-[38%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,var(--glow-blue)_0%,transparent_72%)]" />
      </div>

      {/* ── Main grid ── */}
      <div
        className={cn(
          "relative z-10 grid h-full",
          leftSidebarOpen ? "grid-cols-[230px_1fr]" : "grid-cols-[52px_1fr]"
        )}
      >
        {/* ════ Left sidebar ════ */}
        <aside className="relative flex h-full min-h-0 flex-col overflow-visible">
          {leftSidebarOpen ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-visible">
              <div className="px-5">
                <div className="flex h-16 shrink-0 items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <SquareChartGantt className="size-5 shrink-0 text-foreground" />
                    <span className="truncate text-base font-semibold tracking-tight">Keystone</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => setLeftSidebarOpen(false)}
                    aria-label="Minimise sidebar"
                    title="Minimise sidebar"
                  >
                    <ChevronsLeft className="size-4" />
                  </Button>
                </div>

                <nav className="mt-3 space-y-0.5">
                  {navItems.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveSection(id)}
                      aria-current={activeSection === id ? "page" : undefined}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        activeSection === id
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="relative z-30 mt-auto shrink-0 overflow-visible px-5 pb-6 pt-4">
                {activeSection === "insights" && hasRun && <SectionNav />}
                <Button
                  variant="outline"
                  className={cn("w-full justify-center gap-2 bg-card", hasRun && "mt-4")}
                  onClick={handleLogout}
                >
                  <LogOut className="size-4 shrink-0" />
                  Log out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col items-center overflow-visible px-2">
              <div className="flex h-16 w-full shrink-0 items-center justify-center border-b border-border/50">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  onClick={() => setLeftSidebarOpen(true)}
                  aria-label="Expand sidebar"
                  title="Expand sidebar"
                >
                  <ChevronsRight className="size-4" />
                </Button>
              </div>

              <nav className="mt-4 flex w-full flex-col items-center gap-1">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                    aria-current={activeSection === id ? "page" : undefined}
                    title={label}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-md transition-colors",
                      activeSection === id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
              </nav>

              <div className="relative z-30 mt-auto flex w-full shrink-0 flex-col items-center gap-1 overflow-visible px-2 pb-4 pt-4">
                {activeSection === "insights" && hasRun && <SectionNav collapsed />}
                <button
                  type="button"
                  title="Log out"
                  aria-label="Log out"
                  onClick={handleLogout}
                  className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* ════ Main column — wrapped panel ════ */}
        <div className="flex h-full min-h-0 min-w-0 flex-col p-3 pl-0">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-[0_1px_0_rgb(255_255_255_/_0.4)_inset] backdrop-blur-md dark:shadow-none">

          {/* ── Top nav ── */}
          <header className="relative flex h-14 shrink-0 items-center justify-between px-5">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Keystone</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {activeSection === "booking-engine"
                      ? "Booking engine"
                      : activeSection === "admin"
                        ? "Admin"
                        : insightsView === "compare"
                          ? "Compare"
                          : "Insights"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-9 shrink-0 rounded-full"
                onClick={() => setIsDark((value) => !value)}
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="size-4" /> : <MoonStar className="size-4" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 gap-2 rounded-full px-3"
                    aria-label="User menu"
                  >
                    <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand-dark-blue)] text-[10px] font-semibold text-[var(--brand-light-blue)]">
                      CG
                      <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full border-2 border-background bg-emerald-500" />
                    </span>
                    <span className="text-sm font-medium">Courtney</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Courtney Greaves</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsDark((v) => !v)}>
                    {isDark ? <Sun className="size-4" /> : <MoonStar className="size-4" />}
                    {isDark ? "Light mode" : "Dark mode"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                    <ArrowUpRight className="size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Bottom separator */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border/50"
            />
          </header>

          {/* ── Center + right sidebar ── */}
          <div
            className={cn(
              "grid min-h-0 flex-1 overflow-hidden",
              activeSection === "insights" && insightsView !== "compare"
                ? "grid-cols-[1fr_300px]"
                : "grid-cols-1"
            )}
          >
            {/* Center stage */}
            <div className="min-h-0 min-w-0 overflow-hidden">
              <section className="h-full overflow-y-auto px-20 py-12 xl:px-24 xl:py-14">
              {activeSection === "booking-engine" ? (
                <BookingEnginePage />
              ) : activeSection === "admin" ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/10 py-14 text-center">
                  <div className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <Settings2 className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Admin</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Admin tools will be available here soon.
                    </p>
                  </div>
                </div>
              ) : (
                <>
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                  {insightsView !== "compare" && (
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1">
                      <BarChart3 className="size-3.5 text-muted-foreground" />
                      <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                        Analytics
                      </span>
                    </div>
                  )}
                  <h1 className="text-[22px] font-semibold tracking-tight">
                    {insightsView === "compare"
                      ? "Compare partners"
                      : "Sales, cancellation & re-let metrics"}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {insightsView === "compare"
                      ? "Set filters for a primary and comparison side, then run to review metrics side by side."
                      : "Real-time across 3 partners"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" className="text-xs">
                    <Calendar className="size-3.5" />
                    Schedule report
                  </Button>
                  <Button
                    variant="outline"
                    className="text-xs"
                    onClick={() =>
                      setInsightsView((view) => (view === "compare" ? "insights" : "compare"))
                    }
                  >
                    {insightsView === "compare" ? (
                      <>
                        <ArrowLeftRight className="size-3.5" />
                        Exit compare
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="size-3.5" />
                        Compare
                      </>
                    )}
                  </Button>
                  <Button className="text-xs">
                    <Download className="size-3.5" />
                    Export
                  </Button>
                </div>
              </div>

              {insightsView === "compare" ? (
                <ComparePage />
              ) : !hasRun ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/10 py-14 text-center">
                  <div className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <BarChart3 className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">No data to display</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Select your filters in the panel on the right, then press <strong>Run</strong> to load the report.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div id="section-bookings" className="scroll-mt-6 py-8">
                    <BookingsSnapshot filters={activeFilters} />
                  </div>
                  <SectionDivider />

                  <div id="section-abv" className="scroll-mt-6 py-8">
                    <AverageBookingValueSnapshot filters={activeFilters} />
                  </div>
                  <SectionDivider />

                  <div id="section-cal" className="scroll-mt-6 py-8">
                    <CalFinancials filters={activeFilters} />
                  </div>
                  <SectionDivider />

                  <div id="section-timing" className="scroll-mt-6 py-8">
                    <TimingSnapshot filters={activeFilters} />
                  </div>
                  <SectionDivider />

                  <div id="section-bookings-vs-stays" className="scroll-mt-6 py-8">
                    <BookingsVsStaysChart filters={activeFilters} />
                  </div>
                  <SectionDivider />

                  <div id="section-abv-per-day" className="scroll-mt-6 py-8">
                    <AbvPerDayChart filters={activeFilters} />
                  </div>
                  <SectionDivider />

                  <div id="section-lead-time" className="scroll-mt-6 py-8">
                    <LeadTimeChart filters={activeFilters} />
                  </div>
                  <SectionDivider />

                  <div id="section-bookings-per-day" className="scroll-mt-6 py-8">
                    <BookingsMadePerDayChart filters={activeFilters} />
                  </div>
                  <SectionDivider />

                  <div id="section-cal-ddl-takeup" className="scroll-mt-6 py-8">
                    <CalDdlTakeupChart filters={activeFilters} />
                  </div>
                </div>
              )}
                </>
              )}
              </section>
            </div>

            {activeSection === "insights" && insightsView !== "compare" && (
              <FilterSidebar
                onRun={(filters) => {
                  setActiveFilters(filters)
                  setHasRun(true)
                }}
              />
            )}
          </div>

          </div>{/* end rounded panel */}
        </div>{/* end main column */}
      </div>
    </div>
  )
}

export default App
