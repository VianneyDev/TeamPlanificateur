import { useQuery } from "@tanstack/react-query";
import { fetchMembers } from "@/lib/api/member";

export function useMembers(teamId?: string) {
  return useQuery({
    queryKey: ["members", teamId],
    queryFn: () => fetchMembers(teamId),
  });
}
