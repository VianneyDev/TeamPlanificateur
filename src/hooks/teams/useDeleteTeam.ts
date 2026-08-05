import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTeam } from "@/lib/api/team";
import { gestionErrorMessage } from "@/lib/gestion-errors";
import { toast } from "sonner";

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),

    onError: (error) => {
      toast.error(
        gestionErrorMessage(
          error,
          "Erreur lors de la suppression de l’équipe",
        ),
      );
    },

    onSuccess: () => {
      toast.success("Équipe supprimée");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
