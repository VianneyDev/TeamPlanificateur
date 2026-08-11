import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/islands/ui/dialog";
import type { Team } from "@/lib/types";
import { useCreateTeam } from "@/hooks/teams/useCreateTeam";
import { useUpdateTeam } from "@/hooks/teams/useUpdateTeam";

type TeamModalProps = {
  mode?: "create" | "update";
  team?: Team;
  open?: boolean;
  onClose?: () => void;
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
    if (mode === "update" && team) {
      setName(team.name);
      return;
    }
    setName("");
  }, [mode, team]);

  const hasChanges = !team || name.trim() !== (team.name ?? "").trim();
  const canSubmit = name.trim() && (mode !== "update" || hasChanges);
  const isPending = isCreating || isUpdating;

  const handleSubmit = () => {
    if (mode === "update" && team) {
      updateTeam(
        { id: team.id, data: { name: name.trim() } },
        {
          onSuccess: () => {
            if (onClose) onClose();
          },
        },
      );
      return;
    }

    createTeam(
      { name: name.trim() },
      {
        onSuccess: () => {
          if (onClose) onClose();
          setName("");
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && onClose) onClose();
      }}
    >
      {mode === "create" && (
        <DialogTrigger asChild>
          <button className="px-3 py-2 bg-muted rounded">
            <Plus size={18} />
          </button>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "update" ? "Modifier l’équipe" : "Nouvelle équipe"}
          </DialogTitle>
          <DialogDescription>Entrez le nom de l’équipe.</DialogDescription>
        </DialogHeader>

        <input
          className="w-full border rounded px-3 py-2 my-2"
          placeholder="Nom de l’équipe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <DialogFooter>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className="bg-primary text-foreground px-4 py-2 rounded hover:brightness-95 transition-colors disabled:opacity-50"
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
      </DialogContent>
    </Dialog>
  );
}
