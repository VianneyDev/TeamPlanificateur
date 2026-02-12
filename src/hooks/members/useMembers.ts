import { useQuery } from "@tanstack/react-query";
import { fetchMembers } from "@/lib/api/member";

export function useMembers(showArchived: boolean) {
  return useQuery({
    queryKey: ["members", showArchived],
    queryFn: () => fetchMembers(showArchived),
  });
}
