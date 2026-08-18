import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restoreTeam } from "@/lib/api/team";
import type { Team } from "@/lib/types";
import { toast } from "sonner";

export function useRestoreTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreTeam(id),

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

      const team = previousArchived?.find((t) => t.id === id);

      if (!team) {
        return { previousActive, previousArchived, previousAll };
      }

      queryClient.setQueryData<Team[]>(
        ["teams", "archived"],
        (old: Team[] | undefined = []) => old.filter((t) => t.id !== id),
      );

      queryClient.setQueryData<Team[]>(
        ["teams", "active"],
        (old: Team[] | undefined = []) => [{ ...team, archived: false }, ...old],
      );

      queryClient.setQueryData<Team[]>(
        ["teams", "all"],
        (old: Team[] | undefined = []) =>
          old.map((t) => (t.id === id ? { ...t, archived: false } : t)),
      );

      return { previousActive, previousArchived, previousAll };
    },

    onError: (_err, _id, context) => {
      queryClient.setQueryData(["teams", "active"], context?.previousActive);
      queryClient.setQueryData(
        ["teams", "archived"],
        context?.previousArchived,
      );
      queryClient.setQueryData(["teams", "all"], context?.previousAll);
    },

    onSettled: () => {
      toast.success("Équipe restaurée");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
