import { useState } from "react";
import { useTeams } from "@/hooks/teams/useTeams";
import type { Team } from "@/lib/types";
import TeamModal from "@/components/islands/team/TeamModal";
import TeamRowActions from "@/components/islands/team/TeamRowActions";

export default function TeamsPanel() {
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const { data: teams, isLoading, error } = useTeams();

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

      <table className="w-full text-sm">
        <thead className="text-slate-400">
          <tr>
            <th className="px-4 py-3 text-left">Nom</th>
            <th className="px-4 py-3 text-left">Membres</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(teams ?? []).map((team: Team) => (
            <tr key={team.id}>
              <td className="px-4 py-3">{team.name}</td>
              <td className="px-4 py-3">{team.members.length}</td>
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
