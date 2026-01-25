import { useMembers } from "@/hooks/members/useMembers";

type MembersPanelProps = {
  teamId?: string;
};

export default function MembersPanel({ teamId }: MembersPanelProps) {
  const { data: members, isLoading, error } = useMembers(teamId);

  if (isLoading) {
    return <div className="text-slate-400">Chargement des membres…</div>;
  }

  if (error) {
    return (
      <div className="text-red-400">Erreur lors du chargement des membres</div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Membres</h2>

        {/* modal MemberModal */}
      </div>

      <table className="w-full text-sm">
        <thead className="text-slate-400">
          <tr>
            <th className="px-4 py-3 text-left">Nom</th>
            <th className="px-4 py-3 text-left">Équipe</th>
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {members.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                Aucun membre trouvé
              </td>
            </tr>
          )}

          {members.map((member: any) => (
            <tr
              key={member.id}
              className="border-t border-slate-800 hover:bg-slate-800/40"
            >
              <td className="px-4 py-3 text-white">{member.name}</td>

              <td className="px-4 py-3 text-slate-300">
                {member.team?.name ?? "—"}
              </td>

              <td className="px-4 py-3 text-slate-300 capitalize">
                {member.role}
              </td>

              <td className="px-4 py-3 text-right">
                {/* <MemberRowActions member={member} /> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
