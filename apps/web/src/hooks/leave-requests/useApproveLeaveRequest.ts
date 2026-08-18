import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { approveLeaveRequest } from "@/lib/api/leave-request";
import { daysOffQueryKey } from "@/hooks/days-off/useDaysOff";
import { leaveRequestsQueryKey } from "@/hooks/leave-requests/useLeaveRequests";
import { ApiError } from "@/lib/api/errors";
import { MEMBER_ARCHIVED_CODE } from "@/lib/leave-request-codes";

export function useApproveLeaveRequest(year: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveLeaveRequest(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leaveRequestsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: daysOffQueryKey(year) }),
      ]);
      toast.success("Demande approuvée");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === MEMBER_ARCHIVED_CODE) {
        toast.error("Impossible d'approuver : le membre est archivé");
        return;
      }
      toast.error("Impossible d'approuver cette demande");
    },
  });
}
