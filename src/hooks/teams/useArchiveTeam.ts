import { useMutation, useQueryClient } from "@tanstack/react-query";
import { archiveTeam } from "@/lib/api/team";
import { toast } from "sonner";

export function useArchiveTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveTeam(id),
    onSuccess: () => {
      toast.success("Équipe archivée");
      queryClient.invalidateQueries({
        queryKey: ["teams"],
        exact: false,
      });
    },
  });
}
