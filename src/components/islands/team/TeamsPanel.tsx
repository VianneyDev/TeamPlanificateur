import { useTeams } from "@/hooks/teams/useTeams";
import TeamModal from "@/components/islands/team/TeamModal";

export default function TeamsPanel() {
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
          </tr>
        </thead>
        <tbody>
          {teams.map((team: any) => (
            <tr>
              <td className="px-4 py-3">{team.name}</td>
              <td className="px-4 py-3">{team.members.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
