import { useMutation, useQueryClient } from "@tanstack/react-query";
import { archiveTeam } from "@/lib/api/team";
import { gestionErrorMessage } from "@/lib/gestion-errors";
import type { Team } from "@/lib/types";
import { toast } from "sonner";

export function useArchiveTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveTeam(id),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["teams"] });

      const previousActive = queryClient.getQueryData<Team[]>([
        "teams",
        "active",
      ]);
      const previousArchived = queryClient.getQueryData<Team[]>([
        "teams",
        "archived",
      ]);
      const previousAll = queryClient.getQueryData<Team[]>(["teams", "all"]);

      const team = previousAll?.find((t) => t.id === id);

      if (!team) {
        return { previousActive, previousArchived, previousAll };
      }

      queryClient.setQueryData<Team[]>(
        ["teams", "active"],
        (old: Team[] | undefined = []) => old.filter((t) => t.id !== id),
      );

      queryClient.setQueryData<Team[]>(
        ["teams", "all"],
        (old: Team[] | undefined = []) =>
          old.map((t) => (t.id === id ? { ...t, archived: true } : t)),
      );

      queryClient.setQueryData<Team[]>(
        ["teams", "archived"],
        (old: Team[] | undefined = []) => [{ ...team, archived: true }, ...old],
      );

      return { previousActive, previousArchived, previousAll };
    },

    onError: (error, _id, context) => {
      queryClient.setQueryData(["teams", "active"], context?.previousActive);
      queryClient.setQueryData(
        ["teams", "archived"],
        context?.previousArchived,
      );
      queryClient.setQueryData(["teams", "all"], context?.previousAll);
      toast.error(
        gestionErrorMessage(error, "Erreur lors de l’archivage de l’équipe"),
      );
    },

    onSuccess: () => {
      toast.success("Équipe archivée");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
