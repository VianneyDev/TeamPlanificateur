import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/islands/ui/dialog";
import type { Team } from "@/lib/types";
import { useCreateTeam } from "@/hooks/teams/useCreateTeam";
import { useUpdateTeam } from "@/hooks/teams/useUpdateTeam";

type TeamModalProps = {
  mode?: "create" | "update";
  team?: Team;
  open: boolean;
  onClose: () => void;
};

export default function TeamModal({
  mode = "create",
  team,
  open,
  onClose,
}: TeamModalProps) {
  const { mutate: createTeam, isPending: isCreating } = useCreateTeam();
  const { mutate: updateTeam, isPending: isUpdating } = useUpdateTeam();

  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) return;
    if (mode === "update" && team) {
      setName(team.name);
      return;
    }
    setName("");
  }, [mode, team, open]);

  const hasChanges = !team || name.trim() !== (team.name ?? "").trim();
  const canSubmit = Boolean(name.trim()) && (mode !== "update" || hasChanges);
  const isPending = isCreating || isUpdating;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || isPending) return;

    if (mode === "update" && team) {
      updateTeam(
        { id: team.id, data: { name: name.trim() } },
        { onSuccess: () => onClose() },
      );
      return;
    }

    createTeam(
      { name: name.trim() },
      {
        onSuccess: () => {
          onClose();
          setName("");
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !isPending) onClose();
      }}
    >
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle>
            {mode === "update" ? "Modifier l’équipe" : "Nouvelle équipe"}
          </DialogTitle>
          <DialogDescription>
            {mode === "update"
              ? "Mettez à jour le nom de l’équipe."
              : "Créez une équipe pour y rattacher des membres."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-foreground">Nom</span>
            <input
              className="field"
              placeholder="Nom de l’équipe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </label>

          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              disabled={isPending}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isPending}
              className="btn-primary"
              aria-busy={isPending}
            >
              {mode === "update"
                ? isPending
                  ? "Enregistrement…"
                  : "Enregistrer"
                : isPending
                  ? "Création…"
                  : "Créer"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
