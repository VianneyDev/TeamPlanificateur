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
  const { mutate: archive, isPending: isArchiving } = useArchiveTeam();
  const { mutate: restore, isPending: isRestoring } = useRestoreTeam();
  const { mutate: remove, isPending: isDeleting } = useDeleteTeam();
  const [confirmAction, setConfirmAction] = useState<
    "archive" | "restore" | "delete" | null
  >(null);

  const decisionPending = isArchiving || isRestoring || isDeleting;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="btn-ghost size-8 p-0"
            aria-label={`Actions pour ${team.name}`}
          >
            <MoreHorizontal size={18} aria-hidden />
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

          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setConfirmAction("delete")}
          >
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={confirmAction === "archive"}
        onOpenChange={(open) => !open && !decisionPending && setConfirmAction(null)}
      >
        <DialogContent showCloseButton className="bg-card">
          <DialogHeader>
            <DialogTitle>Archiver cette équipe ?</DialogTitle>
            <DialogDescription>
              L’équipe quittera la liste active. Vous pourrez la restaurer plus
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
                archive(team.id, { onSuccess: () => setConfirmAction(null) })
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
            <DialogTitle>Restaurer cette équipe ?</DialogTitle>
            <DialogDescription>
              L’équipe réapparaîtra dans la liste des équipes actives.
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
                restore(team.id, { onSuccess: () => setConfirmAction(null) })
              }
            >
              {isRestoring ? "Restauration…" : "Restaurer"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmAction === "delete"}
        onOpenChange={(open) => !open && !decisionPending && setConfirmAction(null)}
      >
        <DialogContent showCloseButton className="bg-card">
          <DialogHeader>
            <DialogTitle>Supprimer cette équipe ?</DialogTitle>
            <DialogDescription>
              Action définitive. Impossible si des membres actifs n’auraient
              plus d’équipe.
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
              className="btn-danger"
              disabled={decisionPending}
              aria-busy={isDeleting}
              onClick={() =>
                remove(team.id, { onSuccess: () => setConfirmAction(null) })
              }
            >
              {isDeleting ? "Suppression…" : "Supprimer"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
