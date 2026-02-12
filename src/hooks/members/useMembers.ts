import { useQuery } from "@tanstack/react-query";
import { fetchMembers, type MemberStatus } from "@/lib/api/member";

export function useMembers(status: MemberStatus = "active") {
  return useQuery({
    queryKey: ["members", status],
    queryFn: () => fetchMembers(status),
  });
}
