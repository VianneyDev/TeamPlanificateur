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
  const { mutate: archive } = useArchiveMember();
  const { mutate: restore } = useRestoreMember();
  const [confirmAction, setConfirmAction] = useState<
    "archive" | "restore" | null
  >(null);

  const handleArchive = () => {
    archive(member.id);
    setConfirmAction(null);
  };

  const handleRestore = () => {
    restore(member.id);
    setConfirmAction(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button>
            <MoreHorizontal size={18} />
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
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Archiver ce membre ?</DialogTitle>
            <DialogDescription>
              Le membre sera archivé et n’apparaîtra plus dans la liste active.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className="px-3 py-2 rounded border border-border hover:bg-muted"
              onClick={() => setConfirmAction(null)}
            >
              Annuler
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-foreground"
              onClick={handleArchive}
            >
              Archiver
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmAction === "restore"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Restaurer ce membre ?</DialogTitle>
            <DialogDescription>
              Le membre réapparaîtra dans la liste des membres actifs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className="px-3 py-2 rounded border border-border hover:bg-muted"
              onClick={() => setConfirmAction(null)}
            >
              Annuler
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded bg-muted hover:bg-muted"
              onClick={handleRestore}
            >
              Restaurer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
