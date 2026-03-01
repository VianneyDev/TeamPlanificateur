import { useMutation, useQueryClient } from "@tanstack/react-query";
import { archiveMember } from "@/lib/api/member";
import type { Member } from "@/lib/types";
import { toast } from "sonner";

export function useArchiveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveMember(id),

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

      const member = previousAll?.find((m) => m.id === id);

      if (!member) {
        return { previousActive, previousArchived, previousAll };
      }

      // update active > on enlève le membre
      queryClient.setQueryData<Member[]>(
        ["members", "active"],
        (old: any[] = []) => old.filter((m) => m.id !== id),
      );

      // update all > on passe archived à true
      queryClient.setQueryData<Member[]>(
        ["members", "all"],
        (old: any[] = []) =>
          old.map((m) => (m.id === id ? { ...m, archived: true } : m)),
      );

      // update archived > on l'ajoute
      queryClient.setQueryData<Member[]>(
        ["members", "archived"],
        (old: any[] = []) => [{ ...member, archived: true }, ...old],
      );

      return { previousActive, previousArchived, previousAll };
    },

    onError: (_err, _id, context) => {
      // rollback si erreur
      queryClient.setQueryData(["members", "active"], context?.previousActive);
      queryClient.setQueryData(
        ["members", "archived"],
        context?.previousArchived,
      );
      queryClient.setQueryData(["members", "all"], context?.previousAll);
    },

    onSettled: () => {
      toast.success("Membre archivé");
      // synchronisation finale avec serveur
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
