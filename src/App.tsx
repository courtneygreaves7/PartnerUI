import { useEffect, useRef, useState } from "react"
import {
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  MoonStar,
  SlidersHorizontal,
  Sun,
  type LucideIcon,
} from "lucide-react"

import { FilterContextPill } from "@/components/filter-context-pill"
import { FilterSidebar } from "@/components/filter-sidebar"
import { LoginPage } from "@/components/login-page"
import {
  InsightsCalPanel,
  InsightsDdlPanel,
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

type ActiveSection = "dashboard" | "insights" | "reporting" | "admin" | "support"

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
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "admin", label: "Admin", icon: SlidersHorizontal },
      { id: "support", label: "Support", icon: LifeBuoy },
    ],
  },
]

const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items)

const SECTION_LABELS: Record<ActiveSection, string> = {
  dashboard: "Home",
  insights: "Insights",
  reporting: "Reporting",
  admin: "Admin",
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
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard")
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(DEFAULT_FILTERS)
  const [insightsProduct, setInsightsProduct] = useState<InsightsProductId>("cal")
  const [insightsScrollTarget, setInsightsScrollTarget] = useState<string | null>(null)
  const mainScrollRef = useRef<HTMLElement>(null)

  function handleLogout() {
    setIsAuthenticated(false)
  }

  function handleOpenInsights(anchor?: string) {
    setActiveSection("insights")
    if (anchor) setInsightsScrollTarget(anchor)
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

  const showFilterSidebar = activeSection === "insights"

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
    <div className="relative h-screen overflow-hidden bg-background text-foreground">
      <div
        className={cn(
          "relative z-10 grid h-full",
          leftSidebarOpen ? "grid-cols-[230px_1fr]" : "grid-cols-[52px_1fr]"
        )}
      >
        <aside className="relative flex h-full min-h-0 flex-col overflow-visible">
          <TooltipProvider>
            {leftSidebarOpen ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-visible">
                <div className="shrink-0 px-5">
                  <div className="flex h-16 shrink-0 items-center justify-between gap-2">
                    <PartnerLogo />
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

        <div className="flex h-full min-h-0 min-w-0 flex-col p-3 pl-0">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-[0_1px_0_rgb(255_255_255_/_0.4)_inset] backdrop-blur-md dark:shadow-none">
            <header className="relative flex h-14 shrink-0 items-center justify-between px-5">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">{PARTNER_BRANDING.shortName}</BreadcrumbLink>
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
                        SH
                        <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full border-2 border-background bg-muted-foreground" />
                      </span>
                      <span className="text-sm font-medium">Partner</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{PARTNER_BRANDING.name}</DropdownMenuLabel>
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

              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border/50"
              />
            </header>

            <div
              className={cn(
                "relative grid min-h-0 flex-1 overflow-hidden",
                showFilterSidebar ? "grid-cols-[1fr_300px]" : "grid-cols-1"
              )}
            >
              <div className="min-h-0 min-w-0 overflow-hidden">
                <section
                  id={APP_MAIN_SCROLL_ID}
                  ref={mainScrollRef}
                  className="relative h-full min-h-0 overflow-y-auto px-10 py-10 xl:px-16 xl:py-14"
                >
                  {activeSection === "insights" ? (
                    <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h1 className="text-[22px] font-semibold tracking-tight">Insights</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Detailed Pikl&apos;d Stays performance for {PARTNER_BRANDING.name}
                        </p>
                      </div>
                      {SHOW_INSIGHTS_CONTENT ? (
                        <FilterContextPill filters={activeFilters} />
                      ) : null}
                    </div>
                  ) : null}

                  {activeSection === "dashboard" ? (
                    <PartnerLandingPage onOpenInsights={() => handleOpenInsights()} />
                  ) : activeSection === "reporting" ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-24 text-center">
                      <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
                        <FileText className="size-4" />
                      </span>
                      <p className="mt-4 text-sm font-semibold text-foreground">Reporting</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Scheduled reports, exports, and custom report builders will be available
                        here soon.
                      </p>
                    </div>
                  ) : activeSection === "support" ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-24 text-center">
                      <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
                        <LifeBuoy className="size-4" />
                      </span>
                      <p className="mt-4 text-sm font-semibold text-foreground">Support</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Help articles, contact options, and support tickets will be available
                        here soon.
                      </p>
                    </div>
                  ) : activeSection === "admin" ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-24 text-center">
                      <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
                        <SlidersHorizontal className="size-4" />
                      </span>
                      <p className="mt-4 text-sm font-semibold text-foreground">Admin</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Account, team, and configuration settings will be available here soon.
                      </p>
                    </div>
                  ) : SHOW_INSIGHTS_CONTENT ? (
                    <SykesPartnerDashboardPage filters={activeFilters} />
                  ) : (
                    <div className="space-y-6">
                      <InsightsTopCards />
                      <InsightsProductTabs value={insightsProduct} onChange={setInsightsProduct} />
                      {insightsProduct === "cal" ? <InsightsCalPanel /> : <InsightsDdlPanel />}
                    </div>
                  )}
                </section>
              </div>

              {showFilterSidebar ? (
                <FilterSidebar filters={activeFilters} onRun={setActiveFilters} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
