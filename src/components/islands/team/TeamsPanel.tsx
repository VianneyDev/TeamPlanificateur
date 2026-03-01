import { useState } from "react";
import { useTeams } from "@/hooks/teams/useTeams";
import type { TeamStatus } from "@/lib/schemas";
import type { Team } from "@/lib/types";
import TeamModal from "@/components/islands/team/TeamModal";
import TeamRowActions from "@/components/islands/team/TeamRowActions";

const STATUS_OPTIONS: { value: TeamStatus; label: string }[] = [
  { value: "active", label: "Actives" },
  { value: "archived", label: "Archivées" },
  { value: "all", label: "Toutes" },
];

export default function TeamsPanel() {
  const [status, setStatus] = useState<TeamStatus>("active");
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const { data: teams = [], isLoading, error } = useTeams(status);

  if (isLoading) {
    return <div className="text-slate-400">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-400">Erreur lors du chargement</div>;
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Équipes</h2>
        {!isLoading && <TeamModal />}
      </div>

      <div className="flex gap-1 p-2 border-b border-slate-700">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatus(opt.value)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              status === opt.value
                ? "bg-slate-600 text-white"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <table className="w-full text-sm">
        <thead className="text-slate-400">
          <tr>
            <th className="px-4 py-3 text-left">Nom</th>
            <th className="px-4 py-3 text-left">Membres</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                Aucune équipe trouvée
              </td>
            </tr>
          )}

          {teams.map((team: Team) => (
            <tr key={team.id}>
              <td className="px-4 py-3">
                {team.name}

                {team.archived && (
                  <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">
                    Archivé
                  </span>
                )}
              </td>

              <td className="px-4 py-3">{team._count.members ?? 0}</td>
              <td className="px-4 py-3 text-right">
                <TeamRowActions
                  team={team}
                  onEdit={(team: Team) => setEditingTeam(team)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingTeam && (
        <TeamModal
          mode="update"
          team={editingTeam}
          open={true}
          onClose={() => setEditingTeam(null)}
        />
      )}
    </div>
  );
}
