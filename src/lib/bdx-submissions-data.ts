/** Mock BDX (bordereaux) submissions — sales, claims, and relets in one place. */

export type BdxDatasetKind = "sales" | "claims" | "relets"

export type BdxSubmissionMeta = {
  kind: BdxDatasetKind
  label: string
  periodLabel: string
  submittedAt: string
  status: "Accepted" | "Pending"
  rowCount: number
}

export type BdxSalesRow = {
  bookingRef: string
  property: string
  product: string
  channel: string
  saleDate: string
  premium: number
}

export type BdxClaimsRow = {
  claimRef: string
  bookingRef: string
  claimType: string
  notifiedAt: string
  status: string
  amount: number
}

export type BdxReletsRow = {
  cancelledRef: string
  reletRef: string
  property: string
  channel: string
  reletDate: string
  valueRecovered: number
}

export const BDX_SUBMISSIONS: BdxSubmissionMeta[] = [
  {
    kind: "sales",
    label: "Sales",
    periodLabel: "Jul 2026",
    submittedAt: "2 Aug 2026",
    status: "Accepted",
    rowCount: 8,
  },
  {
    kind: "claims",
    label: "Claims",
    periodLabel: "Jul 2026",
    submittedAt: "2 Aug 2026",
    status: "Accepted",
    rowCount: 5,
  },
  {
    kind: "relets",
    label: "Relets",
    periodLabel: "Jul 2026",
    submittedAt: "2 Aug 2026",
    status: "Accepted",
    rowCount: 6,
  },
]

export const BDX_SALES_ROWS: BdxSalesRow[] = [
  {
    bookingRef: "BK-20481",
    property: "Willowcroft House",
    product: "Flexible Cancellation",
    channel: "Website",
    saleDate: "3 Jul 2026",
    premium: 86,
  },
  {
    bookingRef: "BK-20474",
    property: "Harbour House",
    product: "Flexible Cancellation",
    channel: "OTA",
    saleDate: "5 Jul 2026",
    premium: 62,
  },
  {
    bookingRef: "BK-20466",
    property: "The Old Mill",
    product: "Damage Deposit Waiver",
    channel: "App",
    saleDate: "8 Jul 2026",
    premium: 30,
  },
  {
    bookingRef: "BK-20459",
    property: "Stone Barn",
    product: "Flexible Cancellation",
    channel: "Offline",
    saleDate: "11 Jul 2026",
    premium: 94,
  },
  {
    bookingRef: "BK-20451",
    property: "Lakeside Retreat",
    product: "Flexible Cancellation",
    channel: "Website",
    saleDate: "14 Jul 2026",
    premium: 78,
  },
  {
    bookingRef: "BK-20442",
    property: "Meadow View",
    product: "Damage Deposit Waiver",
    channel: "OTA",
    saleDate: "18 Jul 2026",
    premium: 28,
  },
  {
    bookingRef: "BK-20438",
    property: "Hillcrest Lodge",
    product: "Flexible Cancellation",
    channel: "Website",
    saleDate: "22 Jul 2026",
    premium: 71,
  },
  {
    bookingRef: "BK-20430",
    property: "Riverside Cottage",
    product: "Flexible Cancellation",
    channel: "App",
    saleDate: "27 Jul 2026",
    premium: 55,
  },
]

export const BDX_CLAIMS_ROWS: BdxClaimsRow[] = [
  {
    claimRef: "CL-1182",
    bookingRef: "BK-20391",
    claimType: "Guest cancellation",
    notifiedAt: "6 Jul 2026",
    status: "Paid",
    amount: 1240,
  },
  {
    claimRef: "CL-1188",
    bookingRef: "BK-20405",
    claimType: "Guest cancellation",
    notifiedAt: "12 Jul 2026",
    status: "Paid",
    amount: 890,
  },
  {
    claimRef: "CL-1194",
    bookingRef: "BK-20418",
    claimType: "Damage",
    notifiedAt: "19 Jul 2026",
    status: "Open",
    amount: 320,
  },
  {
    claimRef: "CL-1199",
    bookingRef: "BK-20427",
    claimType: "Guest cancellation",
    notifiedAt: "24 Jul 2026",
    status: "Paid",
    amount: 1560,
  },
  {
    claimRef: "CL-1203",
    bookingRef: "BK-20435",
    claimType: "Guest cancellation",
    notifiedAt: "29 Jul 2026",
    status: "Pending",
    amount: 980,
  },
]

export const BDX_RELETS_ROWS: BdxReletsRow[] = [
  {
    cancelledRef: "BK-20438",
    reletRef: "BK-20502",
    property: "Hillcrest Lodge",
    channel: "Website",
    reletDate: "25 Jul 2026",
    valueRecovered: 1180,
  },
  {
    cancelledRef: "BK-20430",
    reletRef: "BK-20495",
    property: "Riverside Cottage",
    channel: "App",
    reletDate: "24 Jul 2026",
    valueRecovered: 920,
  },
  {
    cancelledRef: "BK-20421",
    reletRef: "BK-20488",
    property: "Oak Tree Farm",
    channel: "Offline",
    reletDate: "23 Jul 2026",
    valueRecovered: 1680,
  },
  {
    cancelledRef: "BK-20412",
    reletRef: "BK-20479",
    property: "Garden Cottage",
    channel: "OTA",
    reletDate: "22 Jul 2026",
    valueRecovered: 845,
  },
  {
    cancelledRef: "BK-20398",
    reletRef: "BK-20471",
    property: "Willowcroft House",
    channel: "Website",
    reletDate: "20 Jul 2026",
    valueRecovered: 1320,
  },
  {
    cancelledRef: "BK-20384",
    reletRef: "BK-20463",
    property: "The Old Mill",
    channel: "App",
    reletDate: "18 Jul 2026",
    valueRecovered: 990,
  },
]

export function formatBdxMoney(value: number) {
  return `£${value.toLocaleString("en-GB")}`
}

function escapeCsv(value: string | number) {
  const text = String(value)
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function rowsToCsv(headers: string[], rows: Array<Array<string | number>>) {
  return [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n")
}

export function buildBdxCsv(kind: BdxDatasetKind): string {
  if (kind === "sales") {
    return rowsToCsv(
      ["Booking ref", "Property", "Product", "Channel", "Sale date", "Premium"],
      BDX_SALES_ROWS.map((row) => [
        row.bookingRef,
        row.property,
        row.product,
        row.channel,
        row.saleDate,
        row.premium,
      ])
    )
  }
  if (kind === "claims") {
    return rowsToCsv(
      ["Claim ref", "Booking ref", "Claim type", "Notified", "Status", "Amount"],
      BDX_CLAIMS_ROWS.map((row) => [
        row.claimRef,
        row.bookingRef,
        row.claimType,
        row.notifiedAt,
        row.status,
        row.amount,
      ])
    )
  }
  return rowsToCsv(
    [
      "Cancelled ref",
      "Re-let ref",
      "Property",
      "Channel",
      "Re-let date",
      "Value recovered",
    ],
    BDX_RELETS_ROWS.map((row) => [
      row.cancelledRef,
      row.reletRef,
      row.property,
      row.channel,
      row.reletDate,
      row.valueRecovered,
    ])
  )
}

export function buildCombinedBdxCsv() {
  const sections: Array<{ kind: BdxDatasetKind; title: string }> = [
    { kind: "sales", title: "SALES" },
    { kind: "claims", title: "CLAIMS" },
    { kind: "relets", title: "RELETS" },
  ]
  return sections
    .map(({ kind, title }) => `${title}\n${buildBdxCsv(kind)}`)
    .join("\n\n")
}

export function downloadBdxCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
