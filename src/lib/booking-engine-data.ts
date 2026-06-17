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

export type Partner = {
  id: string
  name: string
  initials: string
  dataRoute: string
  products: ("CAL" | "DDL")[]
  activity: {
    bookings: number
    properties: number
    withCal: number
    withDdl: number
  }
  currencies: ("GBP" | "EUR")[]
  brands: Brand[]
  policies: PolicyRate[]
}

export const BOOKING_ENGINE_PARTNERS: Partner[] = [
  {
    id: "partner-a",
    name: "Partner A",
    initials: "PRTA",
    dataRoute: "API — EUR, GBP",
    products: ["CAL", "DDL"],
    activity: {
      bookings: 797_615,
      properties: 125_364,
      withCal: 18_536,
      withDdl: 2,
    },
    currencies: ["EUR", "GBP"],
    brands: [
      { id: "a-brand-1", name: "Brand A", policyGroup: "Partner A GB 4" },
      { id: "a-brand-2", name: "Brand B", policyGroup: "Partner A GB 4" },
      { id: "a-brand-3", name: "Brand C", policyGroup: "Partner A DK 2" },
      { id: "a-brand-4", name: "Brand D", policyGroup: "Partner A EUR 3" },
    ],
    policies: [
      {
        id: "a-p1",
        brandId: "a-brand-1",
        name: "Partner A GB 4",
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
        name: "Partner A GB 4",
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
        name: "Partner A DK 2",
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
        name: "Partner A EUR 3",
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
    name: "Partner B",
    initials: "PRTB",
    dataRoute: "API — GBP",
    products: ["DDL"],
    activity: {
      bookings: 54_210,
      properties: 18_420,
      withCal: 0,
      withDdl: 18_420,
    },
    currencies: ["GBP"],
    brands: [
      { id: "b-brand-1", name: "Brand A", policyGroup: "Partner B GB 1" },
      { id: "b-brand-2", name: "Brand B", policyGroup: "Partner B GB 1" },
    ],
    policies: [
      {
        id: "b-p1",
        brandId: "b-brand-1",
        name: "Partner B GB 1",
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
        name: "Partner B GB 1",
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
    name: "Partner C",
    initials: "PRTC",
    dataRoute: "S3 — GBP",
    products: ["CAL"],
    activity: {
      bookings: 30_543,
      properties: 4_768,
      withCal: 4_768,
      withDdl: 0,
    },
    currencies: ["GBP"],
    brands: [{ id: "c-brand-1", name: "Brand A", policyGroup: "Partner C GB 2" }],
    policies: [
      {
        id: "c-p1",
        brandId: "c-brand-1",
        name: "Partner C GB 2",
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
]

export const BOOKING_ENGINE_SUMMARY = {
  partners: BOOKING_ENGINE_PARTNERS.length,
  activeBrands: BOOKING_ENGINE_PARTNERS.reduce((sum, partner) => sum + partner.brands.length, 0),
  totalBookings: BOOKING_ENGINE_PARTNERS.reduce(
    (sum, partner) => sum + partner.activity.bookings,
    0
  ),
  totalProperties: BOOKING_ENGINE_PARTNERS.reduce(
    (sum, partner) => sum + partner.activity.properties,
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
