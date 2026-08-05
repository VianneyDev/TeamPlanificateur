import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restoreMember } from "@/lib/api/member";
import { gestionErrorMessage } from "@/lib/gestion-errors";
import type { Member } from "@/lib/types";
import { toast } from "sonner";

export function useRestoreMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreMember(id),

    onMutate: async (id: string) => {
      // stop toutes les requêtes en cours
      await queryClient.cancelQueries({ queryKey: ["members"] });

      // snapshot du cache pour rollback
      const previousActive = queryClient.getQueryData<Member[]>([
        "members",
        "active",
      ]);
      const previousArchived = queryClient.getQueryData<Member[]>([
        "members",
        "archived",
      ]);
      const previousAll = queryClient.getQueryData<Member[]>([
        "members",
        "all",
      ]);

      const member = previousArchived?.find((m) => m.id === id);

      if (!member) {
        return { previousActive, previousArchived, previousAll };
      }

      // ARCHIVED > remove
      queryClient.setQueryData<Member[]>(
        ["members", "archived"],
        (old: Member[] | undefined = []) => old.filter((m) => m.id !== id),
      );

      // ACTIVE > add
      queryClient.setQueryData<Member[]>(
        ["members", "active"],
        (old: Member[] | undefined = []) => [{ ...member, archived: false }, ...old],
      );

      // ALL > update flag
      queryClient.setQueryData<Member[]>(
        ["members", "all"],
        (old: Member[] | undefined = []) =>
          old.map((m) => (m.id === id ? { ...m, archived: false } : m)),
      );

      return { previousActive, previousArchived, previousAll };
    },

    onError: (error, _id, context) => {
      queryClient.setQueryData(["members", "active"], context?.previousActive);
      queryClient.setQueryData(
        ["members", "archived"],
        context?.previousArchived,
      );
      queryClient.setQueryData(["members", "all"], context?.previousAll);
      toast.error(
        gestionErrorMessage(error, "Erreur lors de la restauration du membre"),
      );
    },

    onSuccess: () => {
      toast.success("Membre restauré");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
