import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLeaveRequest } from "@/lib/api/leave-request";
import { daysOffQueryKey } from "@/hooks/days-off/useDaysOff";
import { leaveRequestsQueryKey } from "@/hooks/leave-requests/useLeaveRequests";
import type { CreateLeaveRequestInput } from "@/lib/schemas";

export function useCreateLeaveRequest(year: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveRequestInput) => createLeaveRequest(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leaveRequestsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: daysOffQueryKey(year) }),
      ]);
      toast.success("Demande de congés envoyée");
    },
    onError: () => {
      toast.error("Impossible d'envoyer la demande de congés");
    },
  });
}
