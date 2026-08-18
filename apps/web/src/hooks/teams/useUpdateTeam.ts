import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeam } from "@/lib/api/team";
import { gestionErrorMessage } from "@/lib/gestion-errors";
import type { Team } from "@/lib/types";
import { toast } from "sonner";

type UpdateTeamVariables = {
  id: string;
  data: { name?: string; archived?: boolean };
};

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateTeamVariables) =>
      updateTeam({ id, ...data }),

    onMutate: async ({ id, data }: UpdateTeamVariables) => {
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

      const team =
        previousAll?.find((t) => t.id === id) ??
        previousActive?.find((t) => t.id === id) ??
        previousArchived?.find((t) => t.id === id);

      if (!team) {
        return { previousActive, previousArchived, previousAll };
      }

      const updated: Team = { ...team, ...data };

      if (data.archived === true) {
        queryClient.setQueryData<Team[]>(
          ["teams", "active"],
          (old: Team[] | undefined = []) => old.filter((t) => t.id !== id),
        );
        queryClient.setQueryData<Team[]>(
          ["teams", "archived"],
          (old: Team[] | undefined = []) => [updated, ...old],
        );
      } else if (data.archived === false) {
        queryClient.setQueryData<Team[]>(
          ["teams", "archived"],
          (old: Team[] | undefined = []) => old.filter((t) => t.id !== id),
        );
        queryClient.setQueryData<Team[]>(
          ["teams", "active"],
          (old: Team[] | undefined = []) => [updated, ...old],
        );
      }

      const applyPatch = (old: Team[] | undefined = []) =>
        old.map((t) => (t.id === id ? updated : t));

      queryClient.setQueryData<Team[]>(
        ["teams", "all"],
        (old: Team[] | undefined = []) => applyPatch(old),
      );
      if (data.archived === undefined) {
        queryClient.setQueryData<Team[]>(
          ["teams", "active"],
          (old: Team[] | undefined = []) => applyPatch(old),
        );
        queryClient.setQueryData<Team[]>(
          ["teams", "archived"],
          (old: Team[] | undefined = []) => applyPatch(old),
        );
      }

      return { previousActive, previousArchived, previousAll };
    },

    onError: (error, _variables, context) => {
      queryClient.setQueryData(["teams", "active"], context?.previousActive);
      queryClient.setQueryData(
        ["teams", "archived"],
        context?.previousArchived,
      );
      queryClient.setQueryData(["teams", "all"], context?.previousAll);
      toast.error(
        gestionErrorMessage(error, "Erreur lors de la mise à jour de l’équipe"),
      );
    },

    onSuccess: () => {
      toast.success("Équipe mise à jour");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
