import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/islands/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/islands/ui/dialog";
import type { Team } from "@/lib/types";
import { useArchiveTeam } from "@/hooks/teams/useArchiveTeam";
import { useDeleteTeam } from "@/hooks/teams/useDeleteTeam";
import { useRestoreTeam } from "@/hooks/teams/useRestoreTeam";

interface TeamRowActionsProps {
  team: Team;
  onEdit: (team: Team) => void;
}

export default function TeamRowActions({ team, onEdit }: TeamRowActionsProps) {
  const { mutate: archive } = useArchiveTeam();
  const { mutate: restore } = useRestoreTeam();
  const { mutate: remove } = useDeleteTeam();
  const [confirmAction, setConfirmAction] = useState<
    "archive" | "restore" | "delete" | null
  >(null);

  const handleArchive = () => {
    archive(team.id);
    setConfirmAction(null);
  };

  const handleRestore = () => {
    restore(team.id);
    setConfirmAction(null);
  };

  const handleDelete = () => {
    remove(team.id);
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
          <DropdownMenuItem onClick={() => onEdit(team)}>
            Modifier
          </DropdownMenuItem>

          {!team.archived && (
            <DropdownMenuItem onClick={() => setConfirmAction("archive")}>
              Archiver
            </DropdownMenuItem>
          )}

          {team.archived && (
            <DropdownMenuItem onClick={() => setConfirmAction("restore")}>
              Restaurer
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setConfirmAction("delete")}>
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={confirmAction === "archive"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Archiver cette équipe ?</DialogTitle>
            <DialogDescription>
              L’équipe sera archivée et n’apparaîtra plus dans la liste active.
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
            <DialogTitle>Restaurer cette équipe ?</DialogTitle>
            <DialogDescription>
              L’équipe réapparaîtra dans la liste des équipes actives.
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

      <Dialog
        open={confirmAction === "delete"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Supprimer cette équipe ?</DialogTitle>
            <DialogDescription>
              Cette action est définitive. Impossible si des membres actifs
              n’auraient plus d’équipe.
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
              onClick={handleDelete}
            >
              Supprimer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
