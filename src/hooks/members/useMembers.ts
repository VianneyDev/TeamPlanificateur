import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchMembers, type MemberStatus } from "@/lib/api/member";

export function useMembers(
  status: MemberStatus = "active",
  page: number,
  search: string,
) {
  return useQuery({
    queryKey: ["members", status, page, search],
    queryFn: () => fetchMembers(status, page, search),
    placeholderData: keepPreviousData,
  });
}
