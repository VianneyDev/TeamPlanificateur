import { useState, useEffect } from "react";
import { User } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/islands/ui/select";
import { MAX_LIST_PAGE_SIZE } from "@/lib/schemas/pagination";

interface Team {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name: string;
}

export default function MemberSelector() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams({
      status: "active",
      page: "1",
      limit: String(MAX_LIST_PAGE_SIZE),
    });
    fetch(`/api/teams?${params}`)
      .then((res) => res.json())
      .then((payload: { data?: Team[] }) => setTeams(payload.data ?? []))
      .catch(() => setTeams([]));
  }, []);

  useEffect(() => {
    if (!selectedTeamId) {
      setMembers([]);
      return;
    }
    const params = new URLSearchParams({
      teamId: selectedTeamId,
      status: "active",
      page: "1",
      limit: String(MAX_LIST_PAGE_SIZE),
    });
    fetch(`/api/members?${params}`)
      .then((res) => res.json())
      .then((payload: { data?: Member[] }) => setMembers(payload.data ?? []))
      .catch(() => setMembers([]));
  }, [selectedTeamId]);

  const handleSelect = () => {
    if (selectedMemberId) {
      document.cookie = `selectedMemberId=${selectedMemberId}; max-age=31536000; path=/`;
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="panel w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-accent text-primary">
            <User className="size-5" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Accès au planning
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sélectionnez votre équipe et votre nom
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="member-selector-team"
              className="text-sm font-medium text-foreground"
            >
              Équipe
            </label>
            <Select
              value={selectedTeamId}
              onValueChange={(value) => {
                setSelectedTeamId(value);
                setSelectedMemberId("");
              }}
            >
              <SelectTrigger
                id="member-selector-team"
                className="w-full cursor-pointer"
              >
                <SelectValue placeholder="Choisir une équipe" />
              </SelectTrigger>
              <SelectContent>
                {teams.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
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

          <div className="space-y-1.5">
            <label
              htmlFor="member-selector-member"
              className="text-sm font-medium text-foreground"
            >
              Membre
            </label>
            <Select
              value={selectedMemberId}
              onValueChange={setSelectedMemberId}
              disabled={!selectedTeamId}
            >
              <SelectTrigger
                id="member-selector-member"
                className="w-full cursor-pointer"
              >
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
            className="mt-2 w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-105 cursor-pointer disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:brightness-100"
          >
            Accéder au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
