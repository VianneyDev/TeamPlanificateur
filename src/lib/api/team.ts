import type { CreateTeamInput } from "@/lib/schemas";
import type { Team } from "@/lib/types";

export async function fetchTeams(): Promise<Team[]> {
  const response = await fetch("/api/teams");

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
