import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeam } from "@/lib/api/team";
import { toast } from "sonner";

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      toast.success("Équipe créée");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: () => {
      toast.error("Erreur lors de la création");
    },
  });
}
