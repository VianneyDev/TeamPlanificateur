import type {
  CreateTeamInput,
  TeamStatus,
  UpdateTeamInput,
} from "@/lib/schemas";
import type { Team } from "@/lib/types";

export async function fetchTeams(
  status: TeamStatus = "active",
): Promise<Team[]> {
  const response = await fetch(`/api/teams?status=${status}`);

  if (!response.ok) {
    throw new Error("Failed to fetch teams");
  }

  return response.json();
}

export async function createTeam(data: CreateTeamInput): Promise<Team> {
  const response = await fetch("/api/teams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create team");
  }

  return response.json();
}

export async function updateTeam(data: UpdateTeamInput): Promise<Team> {
  const response = await fetch("/api/teams", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update team");
  }

  return response.json();
}

export async function archiveTeam(id: string): Promise<Team> {
  return updateTeam({ id, archived: true });
}

export async function restoreTeam(id: string): Promise<Team> {
  return updateTeam({ id, archived: false });
}
