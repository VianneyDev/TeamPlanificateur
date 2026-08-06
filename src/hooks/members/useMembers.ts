import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchMembers, type MemberStatus } from "@/lib/api/member";

/** `search` should be a stabilized value (e.g. debounced) to avoid a network request on every keystroke. */
export function useMembers(params: {
  status?: MemberStatus;
  page: number;
  search: string;
  isExternal?: boolean;
  /** For selects (e.g. Monthly Worked Days) pass a higher `limit`. */
  limit?: number;
  enabled?: boolean;
}) {
  const {
    status = "active",
    page,
    search,
    isExternal,
    limit = 10,
    enabled = true,
  } = params;

  return useQuery({
    queryKey: ["members", status, page, search, isExternal ?? null, limit],
    queryFn: () =>
      fetchMembers(status, page, search, { isExternal, limit }),
    placeholderData: keepPreviousData,
    enabled,
  });
}
