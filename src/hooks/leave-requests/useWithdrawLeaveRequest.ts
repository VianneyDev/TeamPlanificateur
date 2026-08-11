import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { withdrawLeaveRequest } from "@/lib/api/leave-request";
import { daysOffQueryKey } from "@/hooks/days-off/useDaysOff";
import { leaveRequestsQueryKey } from "@/hooks/leave-requests/useLeaveRequests";

export function useWithdrawLeaveRequest(year: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => withdrawLeaveRequest(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leaveRequestsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: daysOffQueryKey(year) }),
      ]);
      toast.success("Demande retirée");
    },
    onError: () => {
      toast.error("Impossible de retirer cette demande");
    },
  });
}
