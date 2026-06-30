export type ColorToken = {
  name: string
  variable: string
  hex: string
  usage: string
  group: "Brand" | "Surface" | "Action" | "UI" | "Semantic"
}

export type TypographyScaleEntry = {
  name: string
  sample: string
  className: string
  specs: string
  usage: string
}

export const colorPaletteTokens: ColorToken[] = [
  {
    name: "Brand pink",
    variable: "--brand-pink",
    hex: "#ee2a7b",
    usage: "Primary brand accent and highlights.",
    group: "Brand",
  },
  {
    name: "Brand dark blue",
    variable: "--brand-dark-blue",
    hex: "#243748",
    usage: "Compare primary accent and deep brand tone.",
    group: "Brand",
  },
  {
    name: "Brand light blue",
    variable: "--brand-light-blue",
    hex: "#f1fdfe",
    usage: "Soft brand tint for light surfaces.",
    group: "Brand",
  },
  {
    name: "Brand green",
    variable: "--brand-green",
    hex: "#a2ffe3",
    usage: "Positive accent and ambient glow tone.",
    group: "Brand",
  },
  {
    name: "Brand grey blue",
    variable: "--brand-grey-blue",
    hex: "#f7fafc",
    usage: "Neutral brand-tinted background.",
    group: "Brand",
  },
  {
    name: "Background",
    variable: "--background",
    hex: "#ffffff",
    usage: "App shell and page background.",
    group: "Surface",
  },
  {
    name: "Foreground",
    variable: "--foreground",
    hex: "#18181b",
    usage: "Primary body text.",
    group: "Surface",
  },
  {
    name: "Card",
    variable: "--card",
    hex: "#ffffff",
    usage: "Card and panel surfaces.",
    group: "Surface",
  },
  {
    name: "Canvas",
    variable: "--canvas",
    hex: "#f4f4f5",
    usage: "Secondary workspace background.",
    group: "Surface",
  },
  {
    name: "Field",
    variable: "--field",
    hex: "#f4f4f5",
    usage: "Input and filter field fills.",
    group: "Surface",
  },
  {
    name: "Panel",
    variable: "--panel-bg",
    hex: "#fafafa",
    usage: "Main content panel background.",
    group: "Surface",
  },
  {
    name: "Primary",
    variable: "--primary",
    hex: "#27272a",
    usage: "Primary buttons and strong actions.",
    group: "Action",
  },
  {
    name: "Primary foreground",
    variable: "--primary-foreground",
    hex: "#ffffff",
    usage: "Text on primary actions.",
    group: "Action",
  },
  {
    name: "Muted",
    variable: "--muted",
    hex: "#f4f4f5",
    usage: "Subtle fills and table headers.",
    group: "UI",
  },
  {
    name: "Muted foreground",
    variable: "--muted-foreground",
    hex: "#71717a",
    usage: "Secondary labels and helper text.",
    group: "UI",
  },
  {
    name: "Accent",
    variable: "--accent",
    hex: "#f4f4f5",
    usage: "Hover states and selected nav items.",
    group: "UI",
  },
  {
    name: "Border",
    variable: "--border",
    hex: "#e4e4e7",
    usage: "Dividers, outlines, and table borders.",
    group: "UI",
  },
  {
    name: "Ring",
    variable: "--ring",
    hex: "#a1a1aa",
    usage: "Focus rings on interactive elements.",
    group: "UI",
  },
  {
    name: "Destructive",
    variable: "--destructive",
    hex: "#dc2626",
    usage: "Errors and destructive actions.",
    group: "Semantic",
  },
  {
    name: "Compare primary",
    variable: "--compare-primary",
    hex: "#243748",
    usage: "Primary series in Compare views.",
    group: "Semantic",
  },
  {
    name: "Compare comparison",
    variable: "--compare-comparison",
    hex: "#2563eb",
    usage: "Secondary series in Compare views.",
    group: "Semantic",
  },
  {
    name: "Chart primary",
    variable: "--chart-1",
    hex: "#4a8fad",
    usage: "Primary bars, lines, and sparklines.",
    group: "Semantic",
  },
  {
    name: "Chart secondary",
    variable: "--chart-2",
    hex: "#6b8fd4",
    usage: "Second series in multi-line charts.",
    group: "Semantic",
  },
  {
    name: "Chart positive",
    variable: "--chart-4",
    hex: "#2d9f7a",
    usage: "Positive metrics and CAL take-up series.",
    group: "Semantic",
  },
]

export const typographyTokens = {
  fontFamily: "Plus Jakarta Sans",
  fallback: "ui-sans-serif, system-ui, sans-serif",
  source: "Google Fonts",
  cssVariable: "--font-sans",
  weights: [200, 300, 400, 500, 600, 700, 800] as const,
}

export const typographyScale: TypographyScaleEntry[] = [
  {
    name: "Page title",
    sample: "Design system",
    className: "text-3xl font-semibold tracking-tight",
    specs: "30px / semibold / tight tracking",
    usage: "Top-level page headings.",
  },
  {
    name: "Section heading",
    sample: "Metric widgets",
    className: "text-xl font-semibold tracking-tight",
    specs: "20px / semibold",
    usage: "Category and section titles.",
  },
  {
    name: "Component title",
    sample: "HeadlineDataWidget",
    className: "text-lg font-semibold",
    specs: "18px / semibold",
    usage: "Individual component doc headings.",
  },
  {
    name: "Body",
    sample: "Insights snapshot for the selected period.",
    className: "text-[15px] leading-relaxed",
    specs: "15px / regular / relaxed leading",
    usage: "Intro copy and longer descriptions.",
  },
  {
    name: "UI label",
    sample: "On this page",
    className: "text-sm font-medium",
    specs: "14px / medium",
    usage: "Nav labels, form labels, and controls.",
  },
  {
    name: "Caption",
    sample: "44 components documented",
    className: "text-xs text-muted-foreground",
    specs: "12px / regular",
    usage: "Meta text, table hints, and footnotes.",
  },
  {
    name: "Figure 24px",
    sample: "£1.2m",
    className: "text-[24px] font-bold leading-none",
    specs: "24px / bold",
    usage: "Large revenue and headline metrics on cards.",
  },
  {
    name: "Figure 20px",
    sample: "842",
    className: "text-[20px] font-bold leading-none",
    specs: "20px / bold",
    usage: "Card figures on property and Insights views.",
  },
]
