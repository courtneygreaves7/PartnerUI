import { useState } from "react"
import { ArrowLeft } from "lucide-react"

import {
  PartnerInfoContent,
  PasDeleteButton,
  type PartnerInfoSection,
} from "@/components/booking-engine/pas-info-panel"
import { PasConfirmDialog } from "@/components/booking-engine/pas-confirm-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import type { Partner } from "@/lib/booking-engine-data"

type PartnerProfilePageProps = {
  partner: Partner
  canEdit: boolean
  canDelete?: boolean
  onBack: () => void
  onEditPartner: () => void
  onDeletePartner?: () => void
}

export function PartnerProfilePage({
  partner,
  canEdit,
  canDelete,
  onBack,
  onEditPartner,
  onDeletePartner,
}: PartnerProfilePageProps) {
  const { toast } = useToast()
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleEditSection(section: PartnerInfoSection) {
    if (!canEdit) {
      toast({
        title: "Editing unavailable",
        description: "Only partners you added in this session can be edited.",
      })
      return
    }

    if (section === "brands") {
      onEditPartner()
      return
    }

    onEditPartner()
  }

  function handleDeleteRequest() {
    if (!canDelete || !onDeletePartner) return
    setDeleteOpen(true)
  }

  function confirmDelete() {
    onDeletePartner?.()
    setDeleteOpen(false)
    onBack()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              {partner.initials.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Partner profile</p>
              <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-foreground">
                {partner.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Full onboarding details, connection setup, and linked brands
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-9 gap-2 text-xs"
            onClick={onBack}
          >
            <ArrowLeft className="size-3.5" />
            Back to partners
          </Button>
        </div>

        <PartnerInfoContent
          partner={partner}
          canEdit
          onEditSection={handleEditSection}
        />

        {canDelete && onDeletePartner ? (
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <PasDeleteButton label="Delete partner" onDelete={handleDeleteRequest} />
          </div>
        ) : null}
      </div>

      <PasConfirmDialog
        open={deleteOpen}
        title={`Delete ${partner.name}?`}
        description="This removes the partner and any policies you added for them. This action cannot be undone."
        confirmLabel="Delete partner"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}
