import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMember } from "@/lib/api/member";
import { gestionErrorMessage } from "@/lib/gestion-errors";
import type { CreateMemberInput } from "@/lib/schemas";
import { toast } from "sonner";

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMemberInput) => createMember(data),
    onSuccess: () => {
      toast.success("Membre créée");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error) => {
      toast.error(
        gestionErrorMessage(error, "Erreur lors de la création du membre"),
      );
    },
  });
}
