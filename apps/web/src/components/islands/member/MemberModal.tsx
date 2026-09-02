import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  TextField,
} from "@vianneytraina/ui";
import type { Member, Team } from "@/lib/types";
import { useCreateMember } from "@/hooks/members/useCreateMember";
import { useUpdateMember } from "@/hooks/members/useUpdateMember";

type MemberModalProps = {
  teams: Team[];
  mode?: "create" | "update";
  member?: Member;
  open: boolean;
  onClose: () => void;
  /** Applied on create (e.g. Externes tab). */
  defaultIsExternal?: boolean;
};

export default function MemberModal({
  teams,
  mode = "create",
  member,
  open,
  onClose,
  defaultIsExternal = false,
}: MemberModalProps) {
  const { mutate: createMember, isPending: isCreating } = useCreateMember();
  const { mutate: updateMember, isPending: isUpdating } = useUpdateMember();

  const [name, setName] = useState("");
  const [role, setRole] = useState<"member" | "manager">("member");
  const [teamIds, setTeamIds] = useState<string[]>([]);

  useEffect(() => {
    if (mode !== "update") setTeamIds([]);
  }, [role, mode]);

  useEffect(() => {
    if (!open) return;
    if (mode === "update" && member) {
      setName(member.name);
      setRole(member.role as "member" | "manager");
      setTeamIds(member.teams?.map((t) => t.id) ?? []);
      return;
    }
    setName("");
    setRole("member");
    setTeamIds([]);
  }, [mode, member, open]);

  const initialTeamIds = member?.teams?.map((t) => t.id) ?? [];
  const teamIdsChanged =
    teamIds.length !== initialTeamIds.length ||
    [...teamIds].sort().join() !== [...initialTeamIds].sort().join();
  const hasChanges =
    !member ||
    name.trim() !== (member.name ?? "").trim() ||
    role !== member.role ||
    teamIdsChanged;

  const canSubmit =
    Boolean(name.trim()) &&
    teamIds.length > 0 &&
    (mode !== "update" || hasChanges);
  const isPending = isCreating || isUpdating;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || isPending) return;

    if (mode === "update" && member) {
      updateMember(
        { id: member.id, data: { name, role, teamIds } },
        { onSuccess: () => onClose() },
      );
      return;
    }

    createMember(
      {
        name,
        role,
        teamIds,
        ...(defaultIsExternal ? { isExternal: true } : {}),
      },
      {
        onSuccess: () => {
          onClose();
          setName("");
          setRole("member");
          setTeamIds([]);
        },
      },
    );
  };

  const isExternalEntity =
    defaultIsExternal || Boolean(member?.isExternal);
  const entityLabel = isExternalEntity ? "externe" : "membre";

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !isPending) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "update"
              ? isExternalEntity
                ? "Modifier l'externe"
                : "Modifier le membre"
              : isExternalEntity
                ? "Nouvel externe"
                : "Nouveau membre"}
          </DialogTitle>
          <DialogDescription>
            {isExternalEntity
              ? "Les membres externes déclarent leurs jours travaillés mensuels (indépendants des jours de repos)."
              : "Rattachez le membre à au moins une équipe."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="member-name">Nom</Label>
            <TextField
              id="member-name"
              placeholder={`Nom du ${entityLabel}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="member-role">Rôle</Label>
            <select
              id="member-role"
              className="field"
              value={role}
              onChange={(e) => setRole(e.target.value as "manager" | "member")}
            >
              <option value="member">Membre</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          {role === "member" && (
            <div className="space-y-1.5">
              <Label htmlFor="member-team">Équipe</Label>
              <select
                id="member-team"
                className="field"
                value={teamIds[0] ?? ""}
                onChange={(e) => setTeamIds([e.target.value])}
                required
              >
                <option value="" disabled>
                  Sélectionner une équipe
                </option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              {teams.length === 0 && (
                <span className="block text-xs text-muted-foreground">
                  Aucune équipe active - créez-en une dans l’onglet Équipes.
                </span>
              )}
            </div>
          )}

          {role === "manager" && (
            <fieldset className="space-y-2 border-0 p-0">
              <legend className="text-sm font-medium text-foreground">
                Équipes
              </legend>
              {teams.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune équipe active - créez-en une dans l’onglet Équipes.
                </p>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-3">
                  {teams.map((team) => (
                    <label
                      key={team.id}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border-input"
                        checked={teamIds.includes(team.id)}
                        onChange={(e) =>
                          setTeamIds((prev) =>
                            e.target.checked
                              ? [...prev, team.id]
                              : prev.filter((id) => id !== team.id),
                          )
                        }
                      />
                      {team.name}
                    </label>
                  ))}
                </div>
              )}
              {teamIds.length === 0 && teams.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Sélectionnez au moins une équipe.
                </p>
              )}
            </fieldset>
          )}

          <DialogFooter>
            <Button type="button" intent="neutral" emphasis="outline" onClick={onClose} disabled={isPending}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isPending}
              aria-busy={isPending}
            >
              {mode === "update"
                ? isPending
                  ? "Enregistrement…"
                  : "Enregistrer"
                : isPending
                  ? "Création…"
                  : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
