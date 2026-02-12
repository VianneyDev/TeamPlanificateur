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

export default function MemberModal({ teams }: { teams: any[] }) {
  const { mutate, isPending } = useCreateMember();

  const [name, setName] = useState("");
  const [role, setRole] = useState<"member" | "manager">("member");
  const [teamIds, setTeamIds] = useState<string[]>([]);

  useEffect(() => {
    setTeamIds([]);
  }, [role]);

  const canSubmit = name.trim() && (role === "manager" || teamIds.length > 0);

  const handleSubmit = () => {
    mutate({
      name,
      role,
      teamIds,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild className="px-3 py-2 bg-slate-800 rounded">
        <div className="flex items-center justify-between border-b border-slate-700">
          <Plus size={18} />
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau membre</DialogTitle>
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
                        : prev.filter((id) => id !== team.id)
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
            disabled={!canSubmit || isPending}
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Création…" : "Créer"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
