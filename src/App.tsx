import { useEffect, useRef, useState } from "react"
import {
  BarChart3,
  Check,
  ChevronsLeft,
  FileText,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Map,
  MoonStar,
  SlidersHorizontal,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react"

import { FilterContextPill } from "@/components/filter-context-pill"
import { FilterSidebar } from "@/components/filter-sidebar"
import { AiCoworkerCard } from "@/components/ai-coworker-card"
import { AiCoworkerPage } from "@/components/ai-coworker-page"
import { AdminComponentsPage } from "@/components/admin-components-page"
import { AdminPage } from "@/components/admin-page"
import { LoginPage } from "@/components/login-page"
import {
  DEFAULT_REPORTING_FILTERS,
  ReportingFilterSidebar,
  type ReportingFilters,
} from "@/components/reporting-filter-sidebar"
import { ReportingPage } from "@/components/reporting-page"
import { InsightsAnchorNav } from "@/components/insights-anchor-nav"
import { InsightsMapPage } from "@/components/insights-map-page"
import { SupportPage, PiklPartnersSidebar } from "@/components/support-page"
import {
  InsightsCalPanel,
  InsightsContributionPanel,
  InsightsDdlPanel,
  InsightsOccupancyPanel,
  InsightsProductTabs,
  InsightsTopCards,
  PartnerLandingPage,
  type InsightsProductId,
} from "@/components/partner-landing-page"
import { PartnerLogo } from "@/components/partner-logo"
import { SykesPartnerDashboardPage } from "@/components/sykes-partner-dashboard-page"
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
import { PARTNER_BRANDING } from "@/lib/partner-branding"
import {
  BRAND_THEME_COPY,
  BRAND_THEME_LABELS,
  DEFAULT_BRAND_THEME,
  type BrandThemeId,
} from "@/lib/brand-theme"

type ActiveSection =
  | "dashboard"
  | "insights"
  | "reporting"
  | "ai-coworker"
  | "admin"
  | "components"
  | "support"
type InsightsView = "detail" | "map"

/** Set to true to restore the full Insights dashboard (kept intact). */
const SHOW_INSIGHTS_CONTENT = false

type NavItem = { id: ActiveSection; label: string; icon: LucideIcon }

const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  { label: "Overview", items: [{ id: "dashboard", label: "Home", icon: LayoutGrid }] },
  {
    label: "Analytics",
    items: [
      { id: "insights", label: "Insights", icon: BarChart3 },
      { id: "reporting", label: "Reporting", icon: FileText },
      { id: "ai-coworker", label: "AI Coworker", icon: Sparkles },
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "admin", label: "Admin", icon: SlidersHorizontal },
      // { id: "components", label: "Components", icon: Puzzle },
      { id: "support", label: "Support", icon: LifeBuoy },
    ],
  },
]

const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items)

const SECTION_LABELS: Record<ActiveSection, string> = {
  dashboard: "Home",
  insights: "Insights",
  reporting: "Reporting",
  "ai-coworker": "AI Coworker",
  admin: "Admin",
  components: "Components",
  support: "Support",
}

function NavItemButton({
  id,
  label,
  icon: Icon,
  activeSection,
  onSelect,
  collapsed = false,
}: {
  id: ActiveSection
  label: string
  icon: LucideIcon
  activeSection: ActiveSection
  onSelect: (id: ActiveSection) => void
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
            className={cn(
              "flex size-9 items-center justify-center rounded-md transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
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
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </button>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [brandTheme, setBrandTheme] = useState<BrandThemeId>(DEFAULT_BRAND_THEME)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard")
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(DEFAULT_FILTERS)
  const [reportingFilters, setReportingFilters] =
    useState<ReportingFilters>(DEFAULT_REPORTING_FILTERS)
  const [reportingHasRun, setReportingHasRun] = useState(false)
  const [reportingRunId, setReportingRunId] = useState(0)
  const [insightsProduct, setInsightsProduct] = useState<InsightsProductId>("cal")
  const [insightsView, setInsightsView] = useState<InsightsView>("detail")
  const [insightsScrollTarget, setInsightsScrollTarget] = useState<string | null>(null)
  const [aiPendingPrompt, setAiPendingPrompt] = useState<string | null>(null)
  const [insightsNavStuck, setInsightsNavStuck] = useState(false)
  const mainScrollRef = useRef<HTMLElement>(null)
  const insightsNavSentinelRef = useRef<HTMLDivElement>(null)

  function handleLogout() {
    setIsAuthenticated(false)
  }

  function handleOpenInsights(anchor?: string) {
    setActiveSection("insights")
    setInsightsView("detail")
    if (anchor) setInsightsScrollTarget(anchor)
  }

  useEffect(() => {
    if (activeSection !== "insights") setInsightsView("detail")
  }, [activeSection])

  useEffect(() => {
    const canShowFilters =
      activeSection === "reporting" ||
      (activeSection === "insights" && insightsView === "detail")
    if (canShowFilters) setFilterSidebarOpen(true)
  }, [activeSection, insightsView])

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

  useEffect(() => {
    document.documentElement.dataset.brand = brandTheme
  }, [brandTheme])

  useEffect(() => {
    if (activeSection !== "insights" || insightsView !== "detail" || SHOW_INSIGHTS_CONTENT) {
      setInsightsNavStuck(false)
      return
    }

    const sentinel = insightsNavSentinelRef.current
    const root = mainScrollRef.current
    if (!sentinel || !root) return

    const observer = new IntersectionObserver(
      ([entry]) => setInsightsNavStuck(!entry.isIntersecting),
      { root, threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [activeSection, insightsView])

  const brandCopy = BRAND_THEME_COPY[brandTheme]

  const showFilterSidebar =
    activeSection === "reporting" ||
    (activeSection === "insights" && insightsView === "detail")

  const showSupportPartnersSidebar = activeSection === "support"
  const showRightSidebar =
    (showFilterSidebar && filterSidebarOpen) || showSupportPartnersSidebar

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={() => {
          setIsAuthenticated(true)
          setActiveSection("dashboard")
        }}
      />
    )
  }

  return (
    <TooltipProvider>
    <div className="relative h-screen overflow-hidden bg-background text-foreground">
      <div
        className={cn(
          "relative z-10 grid h-full",
          leftSidebarOpen ? "grid-cols-[230px_1fr]" : "grid-cols-[52px_1fr]"
        )}
      >
        <aside className="relative flex h-full min-h-0 flex-col overflow-visible">
            {leftSidebarOpen ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-visible">
                <div className="shrink-0 px-5 pt-3">
                  <div className="flex h-16 shrink-0 items-center justify-between gap-2">
                    <PartnerLogo brandTheme={brandTheme} />
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
                    {NAV_GROUPS.map((group) => (
                      <div key={group.label} className="space-y-0.5">
                        <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                          {group.label}
                        </p>
                        {group.items.map((item) => (
                          <NavItemButton
                            key={item.id}
                            {...item}
                            activeSection={activeSection}
                            onSelect={setActiveSection}
                          />
                        ))}
                      </div>
                    ))}
                  </nav>
                </div>

                <div className="relative z-30 mt-auto shrink-0 space-y-3 overflow-visible px-5 pb-6 pt-4">
                  {activeSection === "insights" && SHOW_INSIGHTS_CONTENT ? <SectionNav /> : null}
                  <AiCoworkerCard
                    partnerName={PARTNER_BRANDING.userDisplayName}
                    onOpen={() => setActiveSection("ai-coworker")}
                  />
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
                <div className="flex h-16 w-full shrink-0 items-center justify-center border-b border-border/50 pt-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setLeftSidebarOpen(true)}
                        aria-label="Show navigation"
                        className="flex size-9 items-center justify-center rounded-md transition-colors hover:bg-accent/60"
                      >
                        <PartnerLogo compact brandTheme={brandTheme} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Show navigation</TooltipContent>
                  </Tooltip>
                </div>

                <nav className="mt-4 flex w-full flex-col items-center gap-1">
                  {NAV_ITEMS.map((item) => (
                    <NavItemButton
                      key={item.id}
                      {...item}
                      activeSection={activeSection}
                      onSelect={setActiveSection}
                      collapsed
                    />
                  ))}
                </nav>

                <div className="relative z-30 mt-auto flex w-full shrink-0 flex-col items-center gap-2 overflow-visible px-2 pb-4 pt-4">
                  {activeSection === "insights" && SHOW_INSIGHTS_CONTENT ? <SectionNav collapsed /> : null}
                  <AiCoworkerCard
                    collapsed
                    partnerName={PARTNER_BRANDING.userDisplayName}
                    onOpen={() => setActiveSection("ai-coworker")}
                  />
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

        <div className="flex h-full min-h-0 min-w-0 flex-col p-3 pl-0">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-[0_1px_0_rgb(255_255_255_/_0.4)_inset] backdrop-blur-md dark:shadow-none">
            <header className="relative flex h-14 shrink-0 items-center justify-between px-5">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">{brandCopy.shortName}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{SECTION_LABELS[activeSection]}</BreadcrumbPage>
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
                        GN
                        <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full border-2 border-background bg-muted-foreground" />
                      </span>
                      <span className="text-sm font-medium">{PARTNER_BRANDING.userDisplayName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{brandCopy.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsDark((v) => !v)}>
                      {isDark ? <Sun className="size-4" /> : <MoonStar className="size-4" />}
                      {isDark ? "Light mode" : "Dark mode"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {(["sykes", "pikl"] as const).map((id) => (
                      <DropdownMenuItem
                        key={id}
                        onClick={() => setBrandTheme(id)}
                        className="justify-between gap-2"
                      >
                        <span>{BRAND_THEME_LABELS[id]}</span>
                        {brandTheme === id ? (
                          <Check className="size-4 text-primary" />
                        ) : (
                          <span className="size-4" aria-hidden />
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                      <LogOut className="size-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border/50"
              />
            </header>

            <div
              className={cn(
                "relative grid min-h-0 flex-1 overflow-hidden",
                showRightSidebar ? "grid-cols-[1fr_300px]" : "grid-cols-1"
              )}
            >
              <div className="min-h-0 min-w-0 overflow-hidden">
                <section
                  id={APP_MAIN_SCROLL_ID}
                  ref={mainScrollRef}
                  className={cn(
                    "relative h-full min-h-0",
                    activeSection === "insights" && insightsView === "map"
                      ? "overflow-hidden"
                      : activeSection === "ai-coworker"
                        ? "overflow-hidden px-6 py-5 xl:px-10 xl:py-6"
                        : activeSection === "insights" && insightsView === "detail"
                          ? "overflow-y-auto"
                          : "overflow-y-auto px-10 py-10 xl:px-16 xl:py-14"
                  )}
                >
                  {activeSection === "insights" && insightsView === "detail" ? (
                    <div className="px-10 pt-10 pb-8 xl:px-16 xl:pt-14">
                      <h1 className="text-[22px] font-semibold tracking-tight">Insights</h1>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Detailed Pikl&apos;d Stays performance for {PARTNER_BRANDING.name}
                      </p>
                    </div>
                  ) : null}

                  {activeSection === "dashboard" ? (
                    <PartnerLandingPage onOpenInsights={() => handleOpenInsights()} />
                  ) : activeSection === "reporting" ? (
                    <ReportingPage
                      filters={reportingFilters}
                      hasRun={reportingHasRun}
                      runId={reportingRunId}
                    />
                  ) : activeSection === "ai-coworker" ? (
                    <AiCoworkerPage
                      partnerName={PARTNER_BRANDING.userDisplayName}
                      pendingPrompt={aiPendingPrompt}
                      onPendingPromptConsumed={() => setAiPendingPrompt(null)}
                    />
                  ) : activeSection === "support" ? (
                    <SupportPage />
                  ) : activeSection === "admin" ? (
                    <AdminPage />
                  ) : activeSection === "components" ? (
                    <AdminComponentsPage />
                  ) : activeSection === "insights" && insightsView === "map" ? (
                    <InsightsMapPage
                      filters={activeFilters}
                      onBack={() => setInsightsView("detail")}
                      onFilterRegion={(id) => {
                        setActiveFilters((prev) => ({ ...prev, county: id }))
                        setInsightsView("detail")
                      }}
                    />
                  ) : SHOW_INSIGHTS_CONTENT ? (
                    <SykesPartnerDashboardPage filters={activeFilters} />
                  ) : (
                    <div>
                      <div className="px-10 pb-10 xl:px-16">
                        <InsightsTopCards />
                      </div>
                      <div
                        ref={insightsNavSentinelRef}
                        className="h-px w-full"
                        aria-hidden
                      />
                      <div
                        className={cn(
                          "sticky top-0 z-30 isolate border-t border-b transition-[background-color,border-color,box-shadow] duration-200",
                          insightsNavStuck
                            ? "border-border/60 bg-[var(--brand-surface)] shadow-[0_8px_24px_-16px_rgb(0_0_0_/_0.35)] dark:bg-muted"
                            : "border-border/50 bg-[var(--panel-bg)]"
                        )}
                      >
                        <div className="flex w-full items-center gap-3 px-10 py-3 xl:px-16">
                          <div className="min-w-0 flex-1">
                            <InsightsProductTabs
                              value={insightsProduct}
                              onChange={setInsightsProduct}
                              elevated={insightsNavStuck}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "h-9 shrink-0 gap-1.5",
                              insightsNavStuck
                                ? "border-border/70 bg-[var(--panel-bg)] dark:bg-card"
                                : "bg-[var(--panel-bg)]"
                            )}
                            onClick={() => setInsightsView("map")}
                          >
                            <Map className="size-3.5" />
                            Map view
                          </Button>
                          {!filterSidebarOpen ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "h-9 shrink-0 gap-1.5",
                                insightsNavStuck
                                  ? "border-border/70 bg-[var(--panel-bg)] dark:bg-card"
                                  : "bg-[var(--panel-bg)]"
                              )}
                              onClick={() => setFilterSidebarOpen(true)}
                            >
                              <SlidersHorizontal className="size-3.5" />
                              Filters
                            </Button>
                          ) : null}
                          {SHOW_INSIGHTS_CONTENT ? (
                            <FilterContextPill filters={activeFilters} />
                          ) : null}
                        </div>
                        <div
                          className={cn(
                            "border-t px-10 py-2 xl:px-16",
                            insightsNavStuck ? "border-border/50" : "border-border/40"
                          )}
                        >
                          <InsightsAnchorNav
                            product={insightsProduct}
                            elevated={insightsNavStuck}
                          />
                        </div>
                      </div>
                      <div className="px-10 pt-10 pb-10 xl:px-16 xl:pb-14">
                        {insightsProduct === "cal" ? (
                          <InsightsCalPanel
                            onOpenRelets={() => setInsightsProduct("performance")}
                            onAskAi={(prompt) => {
                              setAiPendingPrompt(prompt)
                              setActiveSection("ai-coworker")
                            }}
                          />
                        ) : insightsProduct === "ddl" ? (
                          <InsightsDdlPanel
                            onAskAi={(prompt) => {
                              setAiPendingPrompt(prompt)
                              setActiveSection("ai-coworker")
                            }}
                          />
                        ) : insightsProduct === "occupancy" ? (
                          <InsightsOccupancyPanel />
                        ) : (
                          <InsightsContributionPanel filters={activeFilters} />
                        )}
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {showSupportPartnersSidebar ? (
                <PiklPartnersSidebar />
              ) : showFilterSidebar && filterSidebarOpen ? (
                activeSection === "reporting" ? (
                  <ReportingFilterSidebar
                    filters={reportingFilters}
                    hasRun={reportingHasRun}
                    onRun={(next) => {
                      setReportingFilters(next)
                      setReportingHasRun(true)
                      setReportingRunId((id) => id + 1)
                    }}
                    onClose={() => setFilterSidebarOpen(false)}
                  />
                ) : (
                  <FilterSidebar
                    filters={activeFilters}
                    onRun={setActiveFilters}
                    showCounty={activeSection === "insights" && insightsView === "map"}
                    onClose={() => setFilterSidebarOpen(false)}
                  />
                )
              ) : showFilterSidebar && !filterSidebarOpen ? (
                <div className="absolute inset-y-0 right-0 z-20 flex items-start pt-10 xl:pt-14">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setFilterSidebarOpen(true)}
                        className="pointer-events-auto flex h-[7.5rem] w-7 flex-col items-center justify-center gap-2 rounded-l-lg border border-r-0 border-border/60 bg-[var(--brand-surface)] text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground dark:bg-muted"
                        aria-label="Show filters"
                      >
                        <SlidersHorizontal className="size-3.5 shrink-0" />
                        <span
                          className="text-[10px] font-medium uppercase tracking-[0.16em]"
                          style={{ writingMode: "vertical-rl" }}
                        >
                          Filters
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Show filters</TooltipContent>
                  </Tooltip>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  )
}

export default App
