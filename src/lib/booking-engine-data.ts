export type PolicyStatus = "active" | "ended"

export type PolicyRate = {
  id: string
  brandId: string
  name: string
  validFrom: string
  validTo: string
  status: PolicyStatus
  netRate: number
  grossRate: number
  calCommission: number
  maxLiability: number
  currency: "GBP" | "EUR"
}

export type Brand = {
  id: string
  name: string
  policyGroup: string
}

export type PartnerBookingStatus = "confirmed" | "completed" | "cancelled"

export type PartnerBooking = {
  id: string
  property: string
  brand: string
  checkIn: string
  nights: number
  guests: number
  value: number
  currency: "GBP" | "EUR"
  hasCal: boolean
  status: PartnerBookingStatus
}

export type Partner = {
  id: string
  name: string
  initials: string
  dataRoute: string
  connectionType: string
  products: ("CAL" | "DDL")[]
  activity: {
    bookings: number
    properties: number
    withCal: number
    withDdl: number
    revenue: number
  }
  currencies: ("GBP" | "EUR")[]
  brands: Brand[]
  policies: PolicyRate[]
}

export const BOOKING_ENGINE_PARTNERS: Partner[] = [
  {
    id: "partner-a",
    name: "Partner Alpha",
    initials: "PRAL",
    dataRoute: "API — EUR, GBP",
    connectionType: "API",
    products: ["CAL", "DDL"],
    activity: {
      bookings: 798_000,
      properties: 125_364,
      withCal: 18_536,
      withDdl: 2,
      revenue: 227_100_000,
    },
    currencies: ["EUR", "GBP"],
    brands: [
      { id: "a-brand-1", name: "Brand Alpha", policyGroup: "Partner Alpha GB 4" },
      { id: "a-brand-2", name: "Brand Beta", policyGroup: "Partner Alpha GB 4" },
      { id: "a-brand-3", name: "Brand Gamma", policyGroup: "Partner Alpha DK 2" },
      { id: "a-brand-4", name: "Brand Delta", policyGroup: "Partner Alpha EUR 3" },
    ],
    policies: [
      {
        id: "a-p1",
        brandId: "a-brand-1",
        name: "Partner Alpha GB 4",
        validFrom: "1 Jun 2026",
        validTo: "ongoing",
        status: "active",
        netRate: 6.4,
        grossRate: 7.17,
        calCommission: 32,
        maxLiability: 10_000,
        currency: "GBP",
      },
      {
        id: "a-p2",
        brandId: "a-brand-2",
        name: "Partner Alpha GB 4",
        validFrom: "26 Dec 2025",
        validTo: "7 Apr 2026",
        status: "active",
        netRate: 6.4,
        grossRate: 7.17,
        calCommission: 32,
        maxLiability: 10_000,
        currency: "GBP",
      },
      {
        id: "a-p3",
        brandId: "a-brand-3",
        name: "Partner Alpha DK 2",
        validFrom: "1 Jan 2026",
        validTo: "ongoing",
        status: "active",
        netRate: 5.8,
        grossRate: 6.45,
        calCommission: 28,
        maxLiability: 8_500,
        currency: "EUR",
      },
      {
        id: "a-p4",
        brandId: "a-brand-4",
        name: "Partner Alpha EUR 3",
        validFrom: "15 Mar 2025",
        validTo: "30 Nov 2025",
        status: "ended",
        netRate: 5.2,
        grossRate: 5.9,
        calCommission: 26,
        maxLiability: 7_500,
        currency: "EUR",
      },
    ],
  },
  {
    id: "partner-b",
    name: "Partner Beta",
    initials: "PRBE",
    dataRoute: "API — GBP",
    connectionType: "API",
    products: ["DDL"],
    activity: {
      bookings: 54_000,
      properties: 18_420,
      withCal: 0,
      withDdl: 18_420,
      revenue: 19_400_000,
    },
    currencies: ["GBP"],
    brands: [
      { id: "b-brand-1", name: "Brand Alpha", policyGroup: "Partner Beta GB 1" },
      { id: "b-brand-2", name: "Brand Beta", policyGroup: "Partner Beta GB 1" },
    ],
    policies: [
      {
        id: "b-p1",
        brandId: "b-brand-1",
        name: "Partner Beta GB 1",
        validFrom: "1 Apr 2026",
        validTo: "ongoing",
        status: "active",
        netRate: 4.9,
        grossRate: 5.55,
        calCommission: 0,
        maxLiability: 5_000,
        currency: "GBP",
      },
      {
        id: "b-p2",
        brandId: "b-brand-2",
        name: "Partner Beta GB 1",
        validFrom: "10 Jan 2025",
        validTo: "31 Mar 2026",
        status: "ended",
        netRate: 4.5,
        grossRate: 5.1,
        calCommission: 0,
        maxLiability: 4_500,
        currency: "GBP",
      },
    ],
  },
  {
    id: "partner-c",
    name: "Partner Gamma",
    initials: "PRGM",
    dataRoute: "S3 — GBP",
    connectionType: "S3",
    products: ["CAL"],
    activity: {
      bookings: 31_000,
      properties: 4_768,
      withCal: 4_768,
      withDdl: 0,
      revenue: 38_060_000,
    },
    currencies: ["GBP"],
    brands: [{ id: "c-brand-1", name: "Brand Alpha", policyGroup: "Partner Gamma GB 2" }],
    policies: [
      {
        id: "c-p1",
        brandId: "c-brand-1",
        name: "Partner Gamma GB 2",
        validFrom: "1 Feb 2026",
        validTo: "ongoing",
        status: "active",
        netRate: 7.1,
        grossRate: 7.85,
        calCommission: 35,
        maxLiability: 12_000,
        currency: "GBP",
      },
    ],
  },
  {
    id: "partner-d",
    name: "Partner Delta",
    initials: "PRDT",
    dataRoute: "API — EUR",
    connectionType: "API",
    products: ["CAL"],
    activity: {
      bookings: 22_400,
      properties: 6_120,
      withCal: 5_840,
      withDdl: 0,
      revenue: 12_800_000,
    },
    currencies: ["EUR"],
    brands: [
      { id: "d-brand-1", name: "Brand Alpha", policyGroup: "Partner Delta EUR 1" },
      { id: "d-brand-2", name: "Brand Beta", policyGroup: "Partner Delta EUR 1" },
    ],
    policies: [
      {
        id: "d-p1",
        brandId: "d-brand-1",
        name: "Partner Delta EUR 1",
        validFrom: "1 Mar 2026",
        validTo: "ongoing",
        status: "active",
        netRate: 5.5,
        grossRate: 6.2,
        calCommission: 30,
        maxLiability: 9_000,
        currency: "EUR",
      },
      {
        id: "d-p2",
        brandId: "d-brand-2",
        name: "Partner Delta EUR 1",
        validFrom: "1 Sep 2025",
        validTo: "28 Feb 2026",
        status: "ended",
        netRate: 5.1,
        grossRate: 5.8,
        calCommission: 28,
        maxLiability: 8_000,
        currency: "EUR",
      },
    ],
  },
  {
    id: "partner-e",
    name: "Partner Epsilon",
    initials: "PREP",
    dataRoute: "FTP — GBP",
    connectionType: "FTP",
    products: ["DDL"],
    activity: {
      bookings: 18_200,
      properties: 3_450,
      withCal: 0,
      withDdl: 3_450,
      revenue: 8_600_000,
    },
    currencies: ["GBP"],
    brands: [{ id: "e-brand-1", name: "Brand Alpha", policyGroup: "Partner Epsilon GB 1" }],
    policies: [
      {
        id: "e-p1",
        brandId: "e-brand-1",
        name: "Partner Epsilon GB 1",
        validFrom: "15 Apr 2026",
        validTo: "ongoing",
        status: "active",
        netRate: 4.2,
        grossRate: 4.85,
        calCommission: 0,
        maxLiability: 4_000,
        currency: "GBP",
      },
    ],
  },
  {
    id: "partner-f",
    name: "Partner Zeta",
    initials: "PRZT",
    dataRoute: "API — EUR, GBP",
    connectionType: "API",
    products: ["CAL", "DDL"],
    activity: {
      bookings: 16_300,
      properties: 2_890,
      withCal: 1_240,
      withDdl: 890,
      revenue: 7_200_000,
    },
    currencies: ["EUR", "GBP"],
    brands: [
      { id: "f-brand-1", name: "Brand Alpha", policyGroup: "Partner Zeta DK 2" },
      { id: "f-brand-2", name: "Brand Beta", policyGroup: "Partner Zeta EUR 2" },
    ],
    policies: [
      {
        id: "f-p1",
        brandId: "f-brand-1",
        name: "Partner Zeta DK 2",
        validFrom: "1 Jan 2026",
        validTo: "ongoing",
        status: "active",
        netRate: 6.0,
        grossRate: 6.75,
        calCommission: 31,
        maxLiability: 8_500,
        currency: "EUR",
      },
      {
        id: "f-p2",
        brandId: "f-brand-2",
        name: "Partner Zeta EUR 2",
        validFrom: "1 Jan 2026",
        validTo: "ongoing",
        status: "active",
        netRate: 5.9,
        grossRate: 6.6,
        calCommission: 29,
        maxLiability: 7_800,
        currency: "EUR",
      },
    ],
  },
  {
    id: "partner-g",
    name: "Partner Eta",
    initials: "PRETA",
    dataRoute: "S3 — EUR",
    connectionType: "S3",
    products: ["CAL"],
    activity: {
      bookings: 9_800,
      properties: 1_420,
      withCal: 1_420,
      withDdl: 0,
      revenue: 4_100_000,
    },
    currencies: ["EUR"],
    brands: [{ id: "g-brand-1", name: "Brand Alpha", policyGroup: "Partner Eta EUR 1" }],
    policies: [
      {
        id: "g-p1",
        brandId: "g-brand-1",
        name: "Partner Eta EUR 1",
        validFrom: "1 May 2026",
        validTo: "ongoing",
        status: "active",
        netRate: 6.8,
        grossRate: 7.5,
        calCommission: 33,
        maxLiability: 11_000,
        currency: "EUR",
      },
    ],
  },
]

export const BOOKING_ENGINE_SUMMARY = {
  partners: BOOKING_ENGINE_PARTNERS.length,
  activeBrands: BOOKING_ENGINE_PARTNERS.reduce((sum, partner) => sum + partner.brands.length, 0),
  users: 24,
  activePolicies: BOOKING_ENGINE_PARTNERS.reduce(
    (sum, partner) => sum + partner.policies.length,
    0
  ),
  totalBookings: BOOKING_ENGINE_PARTNERS.reduce(
    (sum, partner) => sum + partner.activity.bookings,
    0
  ),
  totalProperties: BOOKING_ENGINE_PARTNERS.reduce(
    (sum, partner) => sum + partner.activity.properties,
    0
  ),
  totalWithCal: BOOKING_ENGINE_PARTNERS.reduce(
    (sum, partner) => sum + partner.activity.withCal,
    0
  ),
  totalWithDdl: BOOKING_ENGINE_PARTNERS.reduce(
    (sum, partner) => sum + partner.activity.withDdl,
    0
  ),
  totalCancellations: 73_236,
  totalRevenue: BOOKING_ENGINE_PARTNERS.reduce(
    (sum, partner) => sum + partner.activity.revenue,
    0
  ),
}

export function formatCount(value: number) {
  return value.toLocaleString("en-GB")
}

export function formatRate(value: number) {
  return value.toFixed(3)
}

export function formatCurrency(value: number, currency: "GBP" | "EUR") {
  const symbol = currency === "GBP" ? "£" : "€"
  return `${symbol}${value.toLocaleString("en-GB")}`
}

export function formatCompactCount(value: number) {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k`
  }
  return value.toLocaleString("en-GB")
}

export function formatCompactCurrency(value: number, currency: "GBP" | "EUR" = "GBP") {
  const symbol = currency === "GBP" ? "£" : "€"
  if (value >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${symbol}${Math.round(value / 1_000)}k`
  }
  return formatCurrency(value, currency)
}

export function formatBrandLabel(name: string) {
  return name.replace(/^Brand\s+/i, "")
}

export function getPartnerTags(partner: Partner) {
  const [method, currencies] = partner.dataRoute.split(" — ")
  const routeTag = currencies ? `${method} → ${currencies}` : method
  return [method, routeTag, ...partner.currencies]
}

export function getPartnerConnectionBreakdown() {
  const counts = new Map<string, number>()

  for (const partner of BOOKING_ENGINE_PARTNERS) {
    counts.set(partner.connectionType, (counts.get(partner.connectionType) ?? 0) + 1)
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

export function getTopPartnersByBrandCount(limit = 3) {
  return [...BOOKING_ENGINE_PARTNERS]
    .sort((a, b) => b.brands.length - a.brands.length)
    .slice(0, limit)
}

export function getPartnerConnectionFooter() {
  return getPartnerConnectionBreakdown()
    .map(([type, count]) => `${count} ${type}`)
    .join(" · ")
}

export function getTopPartnersBrandFooter() {
  return getTopPartnersByBrandCount(3)
    .map((partner) => `${partner.name.replace(/^Partner /, "")} ${partner.brands.length}`)
    .join(" · ")
}

export function getPartnerTrendContext() {
  const partnerCounts = [4, 5, 5, 6, 6, 7]
  const added = partnerCounts.at(-1)! - partnerCounts[0]
  return added > 0 ? `${added} new partner${added === 1 ? "" : "s"} since January` : "Stable since January"
}

export function getBookingsTrendContext() {
  const monthlyBookings = [780, 810, 835, 860, 890, 950]
  const lastMonth = monthlyBookings.at(-2)!
  const current = monthlyBookings.at(-1)!
  const change = current - lastMonth
  return `+${formatCount(change)} bookings vs last month (+12%)`
}

export function getRevenueTrendContext() {
  const aheadPct = 5.4
  const aheadAmount = Math.round(
    BOOKING_ENGINE_SUMMARY.totalRevenue * (aheadPct / 100) / (1 + aheadPct / 100)
  )
  return `${formatCompactCurrency(aheadAmount)} ahead of YTD target (+${aheadPct}%)`
}

export function getBrandsTrendContext() {
  const brandCounts = [9, 10, 11, 11, 12, 13]
  const added = brandCounts.at(-1)! - brandCounts[0]
  return added > 0 ? `${added} brands added YTD` : "Stable YTD"
}

const PARTNER_A_BOOKINGS: PartnerBooking[] = [
  { id: "BK-10042", property: "Willowcroft House", brand: "Brand Alpha", checkIn: "12 Jul 2026", nights: 7, guests: 4, value: 1820, currency: "GBP", hasCal: true, status: "confirmed" },
  { id: "BK-10038", property: "The Old Mill", brand: "Brand Beta", checkIn: "5 Aug 2026", nights: 5, guests: 2, value: 1240, currency: "GBP", hasCal: true, status: "confirmed" },
  { id: "BK-10031", property: "Hillcrest Lodge", brand: "Brand Gamma", checkIn: "18 Jun 2026", nights: 3, guests: 6, value: 980, currency: "GBP", hasCal: false, status: "completed" },
  { id: "BK-10029", property: "Riverside Cottage", brand: "Brand Alpha", checkIn: "22 Sep 2026", nights: 4, guests: 3, value: 1100, currency: "GBP", hasCal: true, status: "confirmed" },
  { id: "BK-10024", property: "Stone Barn", brand: "Brand Delta", checkIn: "1 May 2026", nights: 2, guests: 2, value: 640, currency: "EUR", hasCal: true, status: "cancelled" },
  { id: "BK-10019", property: "Meadow View", brand: "Brand Beta", checkIn: "14 Oct 2026", nights: 6, guests: 5, value: 1560, currency: "GBP", hasCal: true, status: "confirmed" },
  { id: "BK-10015", property: "Oak Tree Farm", brand: "Brand Gamma", checkIn: "3 Jul 2026", nights: 7, guests: 4, value: 1720, currency: "GBP", hasCal: false, status: "completed" },
  { id: "BK-10011", property: "Lakeside Retreat", brand: "Brand Alpha", checkIn: "28 Aug 2026", nights: 5, guests: 2, value: 1380, currency: "GBP", hasCal: true, status: "confirmed" },
  { id: "BK-10008", property: "Harbour House", brand: "Brand Delta", checkIn: "9 Nov 2026", nights: 4, guests: 3, value: 1050, currency: "EUR", hasCal: true, status: "confirmed" },
  { id: "BK-10003", property: "Garden Cottage", brand: "Brand Beta", checkIn: "16 Dec 2026", nights: 3, guests: 2, value: 720, currency: "GBP", hasCal: false, status: "cancelled" },
]

const PARTNER_BOOKING_TRENDS: Record<string, { label: string; value: number }[]> = {
  "partner-a": [
    { label: "Jul", value: 62 },
    { label: "Aug", value: 71 },
    { label: "Sep", value: 58 },
    { label: "Oct", value: 74 },
    { label: "Nov", value: 69 },
    { label: "Dec", value: 81 },
    { label: "Jan", value: 55 },
    { label: "Feb", value: 63 },
    { label: "Mar", value: 77 },
    { label: "Apr", value: 84 },
    { label: "May", value: 91 },
    { label: "Jun", value: 88 },
  ],
  "partner-b": [
    { label: "Jul", value: 4 },
    { label: "Aug", value: 5 },
    { label: "Sep", value: 4 },
    { label: "Oct", value: 6 },
    { label: "Nov", value: 5 },
    { label: "Dec", value: 7 },
    { label: "Jan", value: 3 },
    { label: "Feb", value: 4 },
    { label: "Mar", value: 5 },
    { label: "Apr", value: 6 },
    { label: "May", value: 7 },
    { label: "Jun", value: 6 },
  ],
  "partner-c": [
    { label: "Jul", value: 2 },
    { label: "Aug", value: 3 },
    { label: "Sep", value: 2 },
    { label: "Oct", value: 3 },
    { label: "Nov", value: 2 },
    { label: "Dec", value: 4 },
    { label: "Jan", value: 2 },
    { label: "Feb", value: 2 },
    { label: "Mar", value: 3 },
    { label: "Apr", value: 3 },
    { label: "May", value: 4 },
    { label: "Jun", value: 3 },
  ],
}

export function getBookingsForPartner(partnerId: string): PartnerBooking[] {
  if (partnerId === "partner-a") return PARTNER_A_BOOKINGS
  return PARTNER_A_BOOKINGS.slice(0, 4).map((booking, index) => ({
    ...booking,
    id: `BK-${partnerId.slice(-1)}00${index + 1}`,
    brand: index % 2 === 0 ? "Brand Alpha" : "Brand Beta",
  }))
}

export function getPartnerBookingTrend(partnerId: string) {
  return PARTNER_BOOKING_TRENDS[partnerId] ?? PARTNER_BOOKING_TRENDS["partner-a"]
}
