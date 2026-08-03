import { useMemo, useRef, useState } from "react"
import {
  Archive,
  Download,
  FileText,
  Filter,
  Replace,
  Trash2,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PARTNER_BRANDING } from "@/lib/partner-branding"
import {
  formatSubmittedFileKind,
  INITIAL_SUBMITTED_FILES,
  summariseSubmittedFiles,
  type SubmittedFile,
  type SubmittedFileKind,
  type SubmittedFileStatus,
} from "@/lib/submitted-files-data"
import { cn } from "@/lib/utils"

const PANEL = "rounded-2xl border border-border/60 bg-card p-5 shadow-xs"
const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"

type StatusFilter = "all" | SubmittedFileStatus
type KindFilter = "all" | SubmittedFileKind

const STATUS_FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "Under review", label: "Under review" },
  { id: "Needs replacement", label: "Needs replacement" },
  { id: "Accepted", label: "Accepted" },
  { id: "Submitted", label: "Submitted" },
  { id: "Archived", label: "Archived" },
]

const KIND_FILTERS: Array<{ id: KindFilter; label: string }> = [
  { id: "all", label: "All types" },
  { id: "bordereaux", label: "Bordereaux" },
  { id: "claims", label: "Claims" },
  { id: "contract", label: "Contract" },
  { id: "evidence", label: "Evidence" },
  { id: "other", label: "Other" },
]

function statusTone(status: SubmittedFileStatus) {
  if (status === "Accepted") return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
  if (status === "Under review") return "bg-amber-500/10 text-amber-800 dark:text-amber-300"
  if (status === "Needs replacement") return "bg-rose-500/10 text-rose-700 dark:text-rose-300"
  if (status === "Archived") return "bg-muted text-muted-foreground"
  return "bg-primary/10 text-primary"
}

function guessKindFromName(name: string): SubmittedFileKind {
  const lower = name.toLowerCase()
  if (lower.includes("bdx") || lower.includes("bordereaux")) return "bordereaux"
  if (lower.includes("claim")) return "claims"
  if (lower.includes("contract") || lower.includes("addendum")) return "contract"
  if (lower.includes("evidence") || lower.endsWith(".pdf") || lower.endsWith(".png")) {
    return "evidence"
  }
  return "other"
}

function formatToday() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date())
}

function formatSize(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`
  return `${bytes} B`
}

export function SubmittedFilesPanel() {
  const inputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<SubmittedFile[]>(INITIAL_SUBMITTED_FILES)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [kindFilter, setKindFilter] = useState<KindFilter>("all")
  const [message, setMessage] = useState<string | null>(null)
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const summary = summariseSubmittedFiles(files)
  const visible = useMemo(() => {
    return files.filter((file) => {
      if (statusFilter !== "all" && file.status !== statusFilter) return false
      if (kindFilter !== "all" && file.kind !== kindFilter) return false
      return true
    })
  }, [files, statusFilter, kindFilter])

  function flash(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 3200)
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return
    const next: SubmittedFile[] = Array.from(fileList).map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      name: file.name,
      kind: guessKindFromName(file.name),
      periodLabel: "Current",
      submittedAt: formatToday(),
      submittedBy: PARTNER_BRANDING.userDisplayName,
      status: "Submitted" as const,
      sizeLabel: formatSize(file.size),
      notes: "Uploaded from Admin · awaiting review.",
    }))
    setFiles((prev) => [...next, ...prev])
    flash(
      next.length === 1
        ? `Uploaded ${next[0]!.name}.`
        : `Uploaded ${next.length} files.`
    )
  }

  function replaceFile(fileList: FileList | null) {
    if (!replaceTargetId || !fileList?.[0]) return
    const file = fileList[0]
    setFiles((prev) =>
      prev.map((item) =>
        item.id === replaceTargetId
          ? {
              ...item,
              name: file.name,
              sizeLabel: formatSize(file.size),
              submittedAt: formatToday(),
              submittedBy: PARTNER_BRANDING.userDisplayName,
              status: "Submitted",
              notes: "Replacement uploaded · awaiting review.",
            }
          : item
      )
    )
    flash(`Replaced with ${file.name}.`)
    setReplaceTargetId(null)
  }

  function archiveFile(id: string) {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, status: "Archived" as const } : file
      )
    )
    flash("File archived.")
  }

  function removeFile(id: string) {
    const target = files.find((file) => file.id === id)
    setFiles((prev) => prev.filter((file) => file.id !== id))
    flash(target ? `Removed ${target.name}.` : "File removed.")
  }

  function downloadFile(file: SubmittedFile) {
    const blob = new Blob(
      [
        `Partner submitted file stub\nName: ${file.name}\nKind: ${formatSubmittedFileKind(file.kind)}\nPeriod: ${file.periodLabel}\nStatus: ${file.status}\n`,
      ],
      { type: "text/plain;charset=utf-8" }
    )
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = file.name
    anchor.click()
    URL.revokeObjectURL(url)
    flash(`Download started for ${file.name}.`)
  }

  return (
    <section className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Active files", value: summary.active },
          { label: "Under review", value: summary.underReview },
          { label: "Needs replacement", value: summary.needsReplacement },
          { label: "Accepted", value: summary.accepted },
        ].map((item) => (
          <div key={item.label} className={PANEL}>
            <p className={MONO_LABEL}>{item.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div
        className={cn(
          PANEL,
          "border-dashed transition-colors",
          dragOver && "border-primary/40 bg-primary/[0.03]"
        )}
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragOver(false)
          addFiles(event.dataTransfer.files)
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Upload className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Upload a file</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Drop bordereaux, claims schedules, contracts, or evidence here — or browse from
                your device.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              multiple
              onChange={(event) => {
                addFiles(event.target.files)
                event.target.value = ""
              }}
            />
            <input
              ref={replaceInputRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                replaceFile(event.target.files)
                event.target.value = ""
              }}
            />
            <Button type="button" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload className="size-3.5" />
              Browse files
            </Button>
          </div>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.05] px-4 py-3 text-sm text-foreground">
          {message}
        </div>
      ) : null}

      <div className={cn(PANEL, "space-y-4")}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className={MONO_LABEL}>Library</p>
            <h2 className="mt-1 text-sm font-semibold text-foreground">Submitted files</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              View, download, replace, or archive files you have sent to Pikl.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="size-3.5" />
            {visible.length} shown
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatusFilter(item.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  statusFilter === item.id
                    ? "border-foreground/20 bg-background text-foreground shadow-sm"
                    : "border-transparent bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {KIND_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setKindFilter(item.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  kindFilter === item.id
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-transparent bg-muted/70 text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 px-6 py-12 text-center">
            <FileText className="size-8 text-muted-foreground/70" />
            <p className="text-sm font-medium text-foreground">No files match these filters</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Clear filters or upload a new file to see it here.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setStatusFilter("all")
                setKindFilter("all")
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-10 px-3 text-xs">File</TableHead>
                  <TableHead className="px-3 text-xs">Type</TableHead>
                  <TableHead className="px-3 text-xs">Period</TableHead>
                  <TableHead className="px-3 text-xs">Submitted</TableHead>
                  <TableHead className="px-3 text-xs">Status</TableHead>
                  <TableHead className="px-3 text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="px-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {file.sizeLabel}
                          {file.notes ? ` · ${file.notes}` : ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3 text-sm text-muted-foreground">
                      {formatSubmittedFileKind(file.kind)}
                    </TableCell>
                    <TableCell className="px-3 py-3 text-sm tabular-nums text-muted-foreground">
                      {file.periodLabel}
                    </TableCell>
                    <TableCell className="px-3 py-3 text-sm text-muted-foreground">
                      <div>{file.submittedAt}</div>
                      <div className="text-xs">{file.submittedBy}</div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                          statusTone(file.status)
                        )}
                      >
                        {file.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5"
                          onClick={() => downloadFile(file)}
                        >
                          <Download className="size-3.5" />
                          <span className="sr-only sm:not-sr-only">Download</span>
                        </Button>
                        {file.status !== "Archived" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5"
                            onClick={() => {
                              setReplaceTargetId(file.id)
                              window.setTimeout(() => replaceInputRef.current?.click(), 0)
                            }}
                          >
                            <Replace className="size-3.5" />
                            <span className="sr-only sm:not-sr-only">Replace</span>
                          </Button>
                        ) : null}
                        {file.status !== "Archived" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5"
                            onClick={() => archiveFile(file.id)}
                          >
                            <Archive className="size-3.5" />
                            <span className="sr-only sm:not-sr-only">Archive</span>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-rose-700 hover:text-rose-800"
                            onClick={() => removeFile(file.id)}
                          >
                            <Trash2 className="size-3.5" />
                            <span className="sr-only sm:not-sr-only">Remove</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </section>
  )
}
