import { useState, useEffect } from "react";

interface Team {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name: string;
  teamId: string;
}

export default function MemberSelector() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data));
  }, []);

  useEffect(() => {
    if (!selectedTeamId) {
      setMembers([]);
      return;
    }
    if (selectedTeamId) {
      fetch("/api/members", {
        headers: {
          "x-team-id": selectedTeamId,
        },
      })
        .then((res) => res.json())
        .then((data) => setMembers(data));
    }
  }, [selectedTeamId]);

  const handleSelect = () => {
    if (selectedMemberId) {
      document.cookie = `selectedMemberId=${selectedMemberId}; max-age=31536000; path=/`;
      window.location.reload();
    }
  };

  return (
    <div className="mb-6 p-4 bg-slate-500 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">
        Sélectionnez votre équipe et votre nom
      </h2>
      <div className="flex flex-col gap-4">
        <select
          value={selectedTeamId}
          onChange={(e) => {
            setSelectedTeamId(e.target.value);
            setSelectedMemberId("");
          }}
          className="px-4 py-2 border rounded"
        >
          <option value="">-- Choisir une équipe --</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        <select
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          disabled={!selectedTeamId}
          className="px-4 py-2 border rounded disabled:bg-gray-200"
        >
          <option value="">-- Choisir votre nom --</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleSelect}
          disabled={!selectedMemberId}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Valider
        </button>
      </div>
    </div>
  );
}
