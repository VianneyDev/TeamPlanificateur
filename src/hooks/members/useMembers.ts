import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchMembers, type MemberStatus } from "@/lib/api/member";

export function useMembers(params: {
  status?: MemberStatus;
  page: number;
  search: string;
}) {
  const { status = "active", page, search } = params;

  return useQuery({
    queryKey: ["members", status, page, search],
    queryFn: () => fetchMembers(status, page, search),
    placeholderData: keepPreviousData,
  });
}
