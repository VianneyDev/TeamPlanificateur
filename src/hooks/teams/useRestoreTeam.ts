import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restoreTeam } from "@/lib/api/team";
import { toast } from "sonner";

export function useRestoreTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreTeam(id),
    onSuccess: () => {
      toast.success("Équipe restaurée");
      queryClient.invalidateQueries({
        queryKey: ["teams"],
        exact: false,
      });
    },
  });
}
