import { useEffect, useRef, useState } from "react"
import {
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  SquareChartGantt,
  Zap,
  LogOut,
  MoonStar,
  Settings2,
  Sun,
  type LucideIcon,
} from "lucide-react"

import { BookingEnginePage } from "@/components/booking-engine-page"
import {
  LandingDashboardPage,
  type BookingEngineAction,
  type BookingEngineView,
  type LandingDestination,
} from "@/components/landing-dashboard-page"
import { DesignSystemView } from "@/components/components-page"
import { FilterContextPill } from "@/components/filter-context-pill"
import { FilterSidebar } from "@/components/filter-sidebar"
import { InsightsReportPage } from "@/components/insights-report-page"
import { LoginPage } from "@/components/login-page"
import { SectionNav } from "@/components/section-nav"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { APP_MAIN_SCROLL_ID, scrollAppMainToTop, scrollToTop } from "@/lib/scroll-to-top"
import { type ActiveFilters, DEFAULT_FILTERS } from "@/lib/chart-data"

const navGroups = [
  {
    heading: "Overview",
    items: [{ id: "home" as const, label: "Home", icon: LayoutDashboard }],
  },
  {
    heading: "Operations",
    items: [{ id: "booking-engine" as const, label: "PAS", icon: Zap }],
  },
  {
    heading: "Business Intelligence",
    items: [{ id: "insights" as const, label: "Insights", icon: BarChart3 }],
  },
  {
    heading: "Administration",
    items: [{ id: "admin" as const, label: "Admin", icon: Settings2 }],
  },
] as const

/** Re-enable when the design system page is ready to surface documented components. */
const SHOW_DESIGN_SYSTEM_NAV = false

type NavItemId = (typeof navGroups)[number]["items"][number]["id"]
type ActiveSection = NavItemId | "components"

const sectionLabels: Record<ActiveSection, string> = {
  home: "Home",
  "booking-engine": "PAS",
  insights: "Insights",
  admin: "Admin",
  components: "Design system",
}

const navItemClassName = (isActive: boolean) =>
  cn(
    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
  )

const collapsedNavItemClassName = (isActive: boolean) =>
  cn(
    "flex size-9 items-center justify-center rounded-md transition-colors",
    isActive
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
  )

function NavItemButton({
  id,
  label,
  icon: Icon,
  activeSection,
  onSelect,
  collapsed = false,
}: {
  id: NavItemId
  label: string
  icon: LucideIcon
  activeSection: ActiveSection
  onSelect: (id: NavItemId) => void
  collapsed?: boolean
}) {
  const isActive = activeSection === id

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onSelect(id)}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
            className={collapsedNavItemClassName(isActive)}
          >
            <Icon className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-current={isActive ? "page" : undefined}
      className={navItemClassName(isActive)}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </button>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState<ActiveSection>("home")
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(DEFAULT_FILTERS)
  const [insightsScrollTarget, setInsightsScrollTarget] = useState<string | null>(null)
  const [bookingEngineView, setBookingEngineView] = useState<BookingEngineView>("partners")
  const [bookingEngineAction, setBookingEngineAction] = useState<BookingEngineAction | undefined>()
  const [bookingEngineNavigationKey, setBookingEngineNavigationKey] = useState(0)
  const mainScrollRef = useRef<HTMLElement>(null)

  function handleLogout() {
    setIsAuthenticated(false)
  }

  function handleSectionSelect(section: ActiveSection) {
    if (section === "booking-engine" && activeSection !== "booking-engine") {
      setBookingEngineView("partners")
      setBookingEngineAction(undefined)
      setBookingEngineNavigationKey((key) => key + 1)
    }
    setActiveSection(section)
  }

  function handleLandingNavigate(destination: LandingDestination) {
    setActiveSection(destination.section)
    if (destination.section === "booking-engine") {
      setBookingEngineView(destination.view ?? "partners")
      setBookingEngineAction(destination.action)
      setBookingEngineNavigationKey((key) => key + 1)
    }
    if (destination.section === "insights" && destination.anchor) {
      setInsightsScrollTarget(destination.anchor)
    }
  }

  useEffect(() => {
    if (activeSection !== "insights" || !insightsScrollTarget) return

    const timer = window.setTimeout(() => {
      const el = document.getElementById(insightsScrollTarget)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
      setInsightsScrollTarget(null)
    }, 150)

    return () => window.clearTimeout(timer)
  }, [activeSection, insightsScrollTarget])

  useEffect(() => {
    if (activeSection === "insights" && insightsScrollTarget) return
    scrollAppMainToTop()
    scrollToTop(mainScrollRef.current)
  }, [activeSection, insightsScrollTarget])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  const showRightSidebar =
    activeSection === "insights" || activeSection === "components"

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={() => {
          setIsAuthenticated(true)
          setActiveSection("home")
        }}
      />
    )
  }

  return (
    <div className="relative h-screen overflow-hidden bg-background text-foreground">

      {/* ── Main grid ── */}
      <div
        className={cn(
          "relative z-10 grid h-full",
          leftSidebarOpen ? "grid-cols-[230px_1fr]" : "grid-cols-[52px_1fr]"
        )}
      >
        {/* ════ Left sidebar ════ */}
        <aside className="relative flex h-full min-h-0 flex-col overflow-visible">
          <TooltipProvider>
          {leftSidebarOpen ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-visible">
              <div className="px-5">
                <div className="flex h-16 shrink-0 items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <SquareChartGantt className="size-5 shrink-0 text-foreground" />
                    <span className="truncate text-base font-semibold tracking-tight">Keystone</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 shrink-0"
                        onClick={() => setLeftSidebarOpen(false)}
                        aria-label="Hide navigation"
                      >
                        <ChevronsLeft className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Hide navigation</TooltipContent>
                  </Tooltip>
                </div>

                <nav className="mt-3 space-y-5">
                  {navGroups.map((group) => (
                    <div key={group.heading}>
                      <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                        {group.heading}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map((item) => (
                          <NavItemButton
                            key={item.id}
                            {...item}
                            activeSection={activeSection}
                            onSelect={handleSectionSelect}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              <div className="relative z-30 mt-auto shrink-0 space-y-4 overflow-visible px-5 pb-6 pt-4">
                {SHOW_DESIGN_SYSTEM_NAV ? (
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2 bg-card"
                    onClick={() => setActiveSection("components")}
                  >
                    Design system
                  </Button>
                ) : null}
                {activeSection === "insights" && <SectionNav />}
                <Button
                  variant="outline"
                  className="w-full justify-center gap-2 bg-card"
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9"
                      onClick={() => setLeftSidebarOpen(true)}
                      aria-label="Show navigation"
                    >
                      <ChevronsRight className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Show navigation</TooltipContent>
                </Tooltip>
              </div>

              <nav className="mt-4 flex w-full flex-col items-center">
                {navGroups.map((group, groupIndex) => (
                  <div
                    key={group.heading}
                    className={cn(
                      "flex w-full flex-col items-center gap-1",
                      groupIndex > 0 && "mt-2 border-t border-border/50 pt-2"
                    )}
                  >
                    {group.items.map((item) => (
                      <NavItemButton
                        key={item.id}
                        {...item}
                        activeSection={activeSection}
                        onSelect={handleSectionSelect}
                        collapsed
                      />
                    ))}
                  </div>
                ))}
              </nav>

              <div className="relative z-30 mt-auto flex w-full shrink-0 flex-col items-center gap-1 overflow-visible px-2 pb-4 pt-4">
                {SHOW_DESIGN_SYSTEM_NAV ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setActiveSection("components")}
                        aria-label="Design system"
                        className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                      >
                        <SquareChartGantt className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Design system</TooltipContent>
                  </Tooltip>
                ) : null}
                {activeSection === "insights" && <SectionNav collapsed />}
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
          </TooltipProvider>
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
                  <BreadcrumbPage>{sectionLabels[activeSection]}</BreadcrumbPage>
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
                    <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                      CG
                      <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full border-2 border-background bg-[var(--brand-green)]" />
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
                    <LogOut className="size-4" />
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
              "relative grid min-h-0 flex-1 overflow-hidden",
              showRightSidebar ? "grid-cols-[1fr_300px]" : "grid-cols-1"
            )}
          >
            {activeSection === "components" ? (
              <DesignSystemView />
            ) : (
              <>
                <div className="min-h-0 min-w-0 overflow-hidden">
                  <section
                    id={APP_MAIN_SCROLL_ID}
                    ref={mainScrollRef}
                    className={cn(
                      "relative h-full min-h-0 px-20 xl:px-24",
                      activeSection === "booking-engine"
                        ? "flex flex-col overflow-hidden py-8 xl:py-10"
                        : "overflow-y-auto py-12 xl:py-14"
                    )}
                  >
                    {activeSection === "home" ? (
                      <LandingDashboardPage
                        filters={activeFilters}
                        onNavigate={handleLandingNavigate}
                      />
                    ) : activeSection === "booking-engine" ? (
                      <BookingEnginePage
                        key={bookingEngineNavigationKey}
                        initialView={bookingEngineView}
                        initialAction={bookingEngineAction}
                      />
                    ) : activeSection === "admin" ? (
                      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/10 py-14 text-center">
                        <div className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
                          <Settings2 className="size-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Administration</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Backend tools for users, system configuration, and platform
                            management will be available here soon.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <h1 className="text-[22px] font-semibold tracking-tight">
                              Sales, cancellation & re-let metrics
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Real-time across 3 partners
                            </p>
                          </div>

                          <FilterContextPill filters={activeFilters} />
                        </div>

                        <InsightsReportPage filters={activeFilters} wideLayout={false} />
                      </>
                    )}
                  </section>
                </div>

                {showRightSidebar ? (
                  <FilterSidebar
                    filters={activeFilters}
                    onRun={setActiveFilters}
                  />
                ) : null}
              </>
            )}
          </div>

          </div>{/* end rounded panel */}
        </div>{/* end main column */}
      </div>
    </div>
  )
}

export default App
