import { useQuery } from "@tanstack/react-query";
import { fetchLeaveRequests } from "@/lib/api/leave-request";

export function leaveRequestsQueryKey() {
  return ["leave-requests"] as const;
}

export function useLeaveRequests() {
  return useQuery({
    queryKey: leaveRequestsQueryKey(),
    queryFn: fetchLeaveRequests,
  });
}
