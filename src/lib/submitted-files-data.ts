/** Partner-submitted files managed under Admin. */

export type SubmittedFileKind =
  | "bordereaux"
  | "claims"
  | "contract"
  | "evidence"
  | "other"

export type SubmittedFileStatus =
  | "Submitted"
  | "Under review"
  | "Accepted"
  | "Needs replacement"
  | "Archived"

export type SubmittedFile = {
  id: string
  name: string
  kind: SubmittedFileKind
  periodLabel: string
  submittedAt: string
  submittedBy: string
  status: SubmittedFileStatus
  sizeLabel: string
  notes?: string
}

export const SUBMITTED_FILE_KIND_LABELS: Record<SubmittedFileKind, string> = {
  bordereaux: "Bordereaux",
  claims: "Claims",
  contract: "Contract",
  evidence: "Evidence",
  other: "Other",
}

export const INITIAL_SUBMITTED_FILES: SubmittedFile[] = [
  {
    id: "file-bdx-jul",
    name: "bdx-sales-claims-relets-jul-2026.csv",
    kind: "bordereaux",
    periodLabel: "Jul 2026",
    submittedAt: "2 Aug 2026",
    submittedBy: "George Nunn",
    status: "Accepted",
    sizeLabel: "184 KB",
    notes: "Combined sales, claims and relets for July.",
  },
  {
    id: "file-bdx-jun",
    name: "bdx-sales-jun-2026.csv",
    kind: "bordereaux",
    periodLabel: "Jun 2026",
    submittedAt: "3 Jul 2026",
    submittedBy: "George Nunn",
    status: "Accepted",
    sizeLabel: "96 KB",
  },
  {
    id: "file-claims-aug",
    name: "claims-schedule-aug-2026.xlsx",
    kind: "claims",
    periodLabel: "Aug 2026",
    submittedAt: "28 Jul 2026",
    submittedBy: "George Nunn",
    status: "Under review",
    sizeLabel: "412 KB",
    notes: "Awaiting Pikl review before acceptance.",
  },
  {
    id: "file-evidence-1",
    name: "relet-proof-harbour-house.pdf",
    kind: "evidence",
    periodLabel: "Jul 2026",
    submittedAt: "18 Jul 2026",
    submittedBy: "George Nunn",
    status: "Needs replacement",
    sizeLabel: "1.2 MB",
    notes: "Please re-upload with booking references included.",
  },
  {
    id: "file-contract",
    name: "partner-schedule-addendum-2026.pdf",
    kind: "contract",
    periodLabel: "2026",
    submittedAt: "12 Jan 2026",
    submittedBy: "George Nunn",
    status: "Accepted",
    sizeLabel: "640 KB",
  },
  {
    id: "file-archived",
    name: "bdx-sales-may-2026.csv",
    kind: "bordereaux",
    periodLabel: "May 2026",
    submittedAt: "4 Jun 2026",
    submittedBy: "George Nunn",
    status: "Archived",
    sizeLabel: "88 KB",
  },
]

export function formatSubmittedFileKind(kind: SubmittedFileKind) {
  return SUBMITTED_FILE_KIND_LABELS[kind]
}

export function summariseSubmittedFiles(files: SubmittedFile[]) {
  const active = files.filter((file) => file.status !== "Archived")
  return {
    total: files.length,
    active: active.length,
    underReview: files.filter((file) => file.status === "Under review").length,
    needsReplacement: files.filter((file) => file.status === "Needs replacement").length,
    accepted: files.filter((file) => file.status === "Accepted").length,
  }
}
