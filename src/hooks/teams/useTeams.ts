import { useQuery } from "@tanstack/react-query";
import { fetchTeams } from "@/lib/api/team";

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => fetchTeams(),
  });
}
