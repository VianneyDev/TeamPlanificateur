import { useQuery } from "@tanstack/react-query";
import { fetchTeams } from "@/lib/api/team";
import type { TeamStatus } from "@/lib/schemas";

export function useTeams(status: TeamStatus = "active") {
  return useQuery({
    queryKey: ["teams", status],
    queryFn: () => fetchTeams(status),
  });
}
