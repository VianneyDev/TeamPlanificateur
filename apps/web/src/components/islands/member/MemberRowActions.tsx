import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@vianneytraina/ui";
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
            className="btn-ghost touch-target p-0"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archiver ce membre ?</DialogTitle>
            <DialogDescription>
              Le membre quittera la liste active. Vous pourrez le restaurer plus
              tard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              intent="neutral"
              emphasis="outline"
              disabled={decisionPending}
              onClick={() => setConfirmAction(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              disabled={decisionPending}
              aria-busy={isArchiving}
              onClick={() =>
                archive(member.id, { onSuccess: () => setConfirmAction(null) })
              }
            >
              {isArchiving ? "Archivage…" : "Archiver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmAction === "restore"}
        onOpenChange={(open) => !open && !decisionPending && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurer ce membre ?</DialogTitle>
            <DialogDescription>
              Le membre réapparaîtra dans la liste des membres actifs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              intent="neutral"
              emphasis="outline"
              disabled={decisionPending}
              onClick={() => setConfirmAction(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              disabled={decisionPending}
              aria-busy={isRestoring}
              onClick={() =>
                restore(member.id, { onSuccess: () => setConfirmAction(null) })
              }
            >
              {isRestoring ? "Restauration…" : "Restaurer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
