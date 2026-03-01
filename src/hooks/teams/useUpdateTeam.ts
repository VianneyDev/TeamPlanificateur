import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeam } from "@/lib/api/team";
import { toast } from "sonner";

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; archived?: boolean };
    }) => updateTeam({ id, ...data }),
    onSuccess: () => {
      toast.success("Équipe mise à jour");
      queryClient.invalidateQueries({
        queryKey: ["teams"],
        exact: false,
      });
    },
  });
}
