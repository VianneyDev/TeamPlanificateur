import type {
  CreateTeamInput,
  TeamStatus,
  UpdateTeamInput,
} from "@/lib/schemas";
import type { Team } from "@/lib/types";
import { throwIfNotOk } from "@/lib/api/errors";

export type TeamsListResponse = {
  data: Team[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export async function fetchTeams(
  status: TeamStatus = "active",
  page = 1,
  search = "",
  limit = 10,
): Promise<TeamsListResponse> {
  const params = new URLSearchParams({
    status,
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);

  const response = await fetch(`/api/teams?${params}`);
  await throwIfNotOk(response, "Failed to fetch teams");
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

  await throwIfNotOk(response, "Failed to create team");
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

  await throwIfNotOk(response, "Failed to update team");
  return response.json();
}

export async function archiveTeam(id: string): Promise<Team> {
  return updateTeam({ id, archived: true });
}

export async function restoreTeam(id: string): Promise<Team> {
  return updateTeam({ id, archived: false });
}
