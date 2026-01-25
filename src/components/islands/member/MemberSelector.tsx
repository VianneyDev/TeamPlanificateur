import { useState, useEffect } from "react";
import { User } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/islands/ui/select";

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
      fetch(`/api/members?teamId=${selectedTeamId}`)
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
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-xl bg-slate-700/60 backdrop-blur rounded-2xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 size-12 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-full">
            <User />
          </div>
          <h2 className="text-2xl font-semibold text-gray-100">
            Accès au planning
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Sélectionnez votre équipe et votre nom
          </p>
        </div>

        <div className="space-y-5">
          {/* Team */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Équipe</label>
            <Select
              value={selectedTeamId}
              onValueChange={(value) => {
                setSelectedTeamId(value);
                setSelectedMemberId("");
              }}
            >
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Choisir une équipe" />
              </SelectTrigger>
              <SelectContent>
                {teams.length === 0 ? (
                  <div className="px-4 py-2 text-muted-foreground text-sm">
                    Chargement...
                  </div>
                ) : (
                  teams.map((team) => (
                    <SelectItem
                      key={team.id}
                      value={team.id}
                      className="cursor-pointer"
                    >
                      {team.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Member */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Membre</label>
            <Select
              value={selectedMemberId}
              onValueChange={setSelectedMemberId}
              disabled={!selectedTeamId}
            >
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Choisir votre nom" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem
                    key={member.id}
                    value={member.id}
                    className="cursor-pointer"
                  >
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={handleSelect}
            disabled={!selectedMemberId}
            className="w-full mt-4 bg-blue-600 rounded-lg text-white font-medium py-2.5 cursor-pointer
                      hover:bg-blue-500 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Accéder au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
