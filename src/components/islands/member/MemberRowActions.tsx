import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/islands/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/islands/ui/dialog";
import type { Member } from "@/lib/types";
import { useArchiveMember } from "@/hooks/members/useArchiveMember";
import { useRestoreMember } from "@/hooks/members/useRestoreMember";

interface MemberRowActionsProps {
  member: Member;
  onEdit: (member: Member) => void;
}

export default function MemberRowActions({
  member,
  onEdit,
}: MemberRowActionsProps) {
  const { mutate: archive, isPending: isArchiving } = useArchiveMember();
  const { mutate: restore, isPending: isRestoring } = useRestoreMember();
  const [confirmAction, setConfirmAction] = useState<
    "archive" | "restore" | null
  >(null);

  const decisionPending = isArchiving || isRestoring;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="btn-ghost size-8 p-0"
            aria-label={`Actions pour ${member.name}`}
          >
            <MoreHorizontal size={18} aria-hidden />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(member)}>
            Modifier
          </DropdownMenuItem>

          {!member.archived && (
            <DropdownMenuItem onClick={() => setConfirmAction("archive")}>
              Archiver
            </DropdownMenuItem>
          )}

          {member.archived && (
            <DropdownMenuItem onClick={() => setConfirmAction("restore")}>
              Restaurer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={confirmAction === "archive"}
        onOpenChange={(open) => !open && !decisionPending && setConfirmAction(null)}
      >
        <DialogContent showCloseButton className="bg-card">
          <DialogHeader>
            <DialogTitle>Archiver ce membre ?</DialogTitle>
            <DialogDescription>
              Le membre quittera la liste active. Vous pourrez le restaurer plus
              tard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              className="btn-outline"
              disabled={decisionPending}
              onClick={() => setConfirmAction(null)}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={decisionPending}
              aria-busy={isArchiving}
              onClick={() =>
                archive(member.id, { onSuccess: () => setConfirmAction(null) })
              }
            >
              {isArchiving ? "Archivage…" : "Archiver"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmAction === "restore"}
        onOpenChange={(open) => !open && !decisionPending && setConfirmAction(null)}
      >
        <DialogContent showCloseButton className="bg-card">
          <DialogHeader>
            <DialogTitle>Restaurer ce membre ?</DialogTitle>
            <DialogDescription>
              Le membre réapparaîtra dans la liste des membres actifs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              className="btn-outline"
              disabled={decisionPending}
              onClick={() => setConfirmAction(null)}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={decisionPending}
              aria-busy={isRestoring}
              onClick={() =>
                restore(member.id, { onSuccess: () => setConfirmAction(null) })
              }
            >
              {isRestoring ? "Restauration…" : "Restaurer"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
