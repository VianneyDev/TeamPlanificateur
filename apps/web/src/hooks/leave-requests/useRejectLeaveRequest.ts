import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rejectLeaveRequest } from "@/lib/api/leave-request";
import { daysOffQueryKey } from "@/hooks/days-off/useDaysOff";
import { leaveRequestsQueryKey } from "@/hooks/leave-requests/useLeaveRequests";

export function useRejectLeaveRequest(year: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rejectLeaveRequest(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leaveRequestsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: daysOffQueryKey(year) }),
      ]);
      toast.success("Demande refusée");
    },
    onError: () => {
      toast.error("Impossible de refuser cette demande");
    },
  });
}
