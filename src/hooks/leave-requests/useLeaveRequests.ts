import { useQuery } from "@tanstack/react-query";
import { fetchLeaveRequests } from "@/lib/api/leave-request";
import type { LeaveRequestStatus } from "@/lib/types";

export function leaveRequestsQueryKey(status?: LeaveRequestStatus) {
  return status
    ? (["leave-requests", { status }] as const)
    : (["leave-requests"] as const);
}

export function useLeaveRequests(status?: LeaveRequestStatus) {
  return useQuery({
    queryKey: leaveRequestsQueryKey(status),
    queryFn: () => fetchLeaveRequests(status ? { status } : undefined),
  });
}
