import { useState, useEffect } from "react";
import { ChevronDown, User } from "lucide-react";
import { Badge } from "@vianneytraina/ui";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/islands/ui/select";
import { MAX_LIST_PAGE_SIZE } from "@/lib/schemas/pagination";
import {
  MEMBER_ROLE_EXPLANATIONS,
  MEMBER_ROLE_GUIDE_HINT,
} from "@/lib/member-role-explanations";
import { memberRoleLabel } from "@/lib/member-role-label";

interface Team {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name: string;
  role: string;
  isExternal: boolean;
}

export function MemberNameWithRole({
  name,
  role,
  isExternal,
}: {
  name: string;
  role: string;
  isExternal: boolean;
}) {
  return (
    <span className="flex max-w-full min-w-0 flex-wrap items-center gap-2">
      <span className="break-words">{name}</span>
      <Badge className="shrink-0">{memberRoleLabel({ role, isExternal })}</Badge>
    </span>
  );
}

type MemberSelectorProps = {
  demoResetEnabled?: boolean;
};

function DemoRoleGuide() {
  const [open, setOpen] = useState(false);

  return (
    <section
      className="mb-5 space-y-2.5 rounded-md border border-border bg-muted/50 p-3 text-left"
      aria-label="Que permet chaque rôle"
    >
      <div className="rounded border border-primary/20 bg-accent/50 px-2.5 py-1.5 text-xs font-medium text-accent-foreground">
        {MEMBER_ROLE_GUIDE_HINT}
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between rounded px-0.5 py-0.5 text-xs font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>Détail des rôles</span>
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <dl className="space-y-2.5 border-t border-border/60 pt-2.5">
          {MEMBER_ROLE_EXPLANATIONS.map((entry) => (
            <div
              key={`${entry.role}-${entry.isExternal}`}
              className="flex flex-col gap-1"
            >
              <dt>
                <Badge className="shrink-0">{memberRoleLabel(entry)}</Badge>
              </dt>
              <dd className="text-xs leading-relaxed text-muted-foreground">
                {entry.description}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

export function MemberSelectorForm({
  demoResetEnabled = false,
}: MemberSelectorProps) {
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
    <div className="p-8">
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

      {demoResetEnabled ? <DemoRoleGuide /> : null}

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
              className="h-auto min-h-9 w-full cursor-pointer whitespace-normal data-[size=default]:h-auto *:data-[slot=select-value]:line-clamp-none *:data-[slot=select-value]:flex-wrap"
            >
              <SelectValue placeholder="Choisir votre nom" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem
                  key={member.id}
                  value={member.id}
                  className="h-auto cursor-pointer flex-wrap whitespace-normal *:[span]:last:min-w-0 *:[span]:last:flex-wrap"
                >
                  <MemberNameWithRole
                    name={member.name}
                    role={member.role}
                    isExternal={member.isExternal}
                  />
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
  );
}

export default function MemberSelector({
  demoResetEnabled = false,
}: MemberSelectorProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="panel w-full max-w-md">
        <MemberSelectorForm demoResetEnabled={demoResetEnabled} />
      </div>
    </div>
  );
}
