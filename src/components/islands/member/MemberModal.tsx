import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/islands/ui/dialog";
import { useCreateMember } from "@/hooks/members/useCreateMember";
import { useUpdateMember } from "@/hooks/members/useUpdateMember";

type MemberModalProps = {
  teams: any[];
  mode?: "create" | "update";
  member?: any;
  open?: boolean;
  onClose?: () => void;
};

export default function MemberModal({
  teams,
  mode = "create",
  member,
  open,
  onClose,
}: MemberModalProps) {
  const { mutate, isPending } = useCreateMember();
  const { mutate: updateMember } = useUpdateMember();

  const [name, setName] = useState("");
  const [role, setRole] = useState<"member" | "manager">("member");
  const [teamIds, setTeamIds] = useState<string[]>([]);

  useEffect(() => {
    setTeamIds([]);
  }, [role]);

  useEffect(() => {
    if (mode === "update" && member) {
      setName(member.name);
      setRole(member.role);
      setTeamIds(member.teams.map((t: any) => t.id));
    }
  }, [mode, member]);

  const canSubmit = name.trim() && (role === "manager" || teamIds.length > 0);

  const handleSubmit = () => {
    if (mode === "update" && member) {
      updateMember({ id: member.id, data: { name, role, teamIds } });
    } else {
      mutate(
        { name, role, teamIds },
        {
          onSuccess: () => {
            if (onClose) onClose();
            setName("");
            setRole("member");
            setTeamIds([]);
          },
        },
      );
    }
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
          <button className="px-3 py-2 bg-slate-800 rounded">
            <Plus size={18} />
          </button>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "update" ? "Modifier le membre" : "Nouveau membre"}
          </DialogTitle>
        </DialogHeader>

        <input
          className="w-full border rounded px-3 py-2 my-2"
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "manager" | "member")}
        >
          <option value="member">Membre</option>
          <option value="manager">Manager</option>
        </select>

        {role === "member" && (
          <select
            className="w-full border rounded px-3 py-2 my-2"
            value={teamIds[0] ?? ""}
            onChange={(e) => setTeamIds([e.target.value])}
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
        )}

        {role === "manager" && (
          <div className="space-y-2 my-2">
            {teams.map((team) => (
              <label key={team.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
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

        <DialogFooter>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
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
