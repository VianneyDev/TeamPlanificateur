import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restoreMember } from "@/lib/api/member";
import { toast } from "sonner";

export function useRestoreMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreMember(id),
    onSuccess: () => {
      toast.success("Membre restauré");
      queryClient.invalidateQueries({
        queryKey: ["members"],
        exact: false,
      });
    },
  });
}
