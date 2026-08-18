import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchTeams } from "@/lib/api/team";
import type { TeamStatus } from "@/lib/schemas";

/** For table views use default `limit`; for selects (e.g. member modal) pass a higher `limit`. */
export function useTeams(params: {
  status?: TeamStatus;
  page: number;
  search: string;
  limit?: number;
}) {
  const { status = "active", page, search, limit = 10 } = params;

  return useQuery({
    queryKey: ["teams", status, page, search, limit],
    queryFn: () => fetchTeams(status, page, search, limit),
    placeholderData: keepPreviousData,
  });
}
