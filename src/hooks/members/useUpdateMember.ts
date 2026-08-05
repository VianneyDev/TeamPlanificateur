import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchMember } from "@/lib/api/member";
import { gestionErrorMessage } from "@/lib/gestion-errors";
import type { Member } from "@/lib/types";
import { toast } from "sonner";

type UpdateMemberVariables = {
  id: string;
  data: { name: string; role?: "member" | "manager"; teamIds?: string[] };
};

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateMemberVariables) => patchMember(id, data),

    onMutate: async ({ id, data }: UpdateMemberVariables) => {
      await queryClient.cancelQueries({ queryKey: ["members"] });

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

      const updated: Member = { ...member, ...data };

      const applyPatch = (old: Member[] | undefined = []) =>
        old.map((m) => (m.id === id ? updated : m));

      queryClient.setQueryData<Member[]>(
        ["members", "active"],
        (old: Member[] | undefined = []) => applyPatch(old),
      );
      queryClient.setQueryData<Member[]>(
        ["members", "archived"],
        (old: Member[] | undefined = []) => applyPatch(old),
      );
      queryClient.setQueryData<Member[]>(
        ["members", "all"],
        (old: Member[] | undefined = []) => applyPatch(old),
      );

      return { previousActive, previousArchived, previousAll };
    },

    onError: (error, _variables, context) => {
      queryClient.setQueryData(["members", "active"], context?.previousActive);
      queryClient.setQueryData(
        ["members", "archived"],
        context?.previousArchived,
      );
      queryClient.setQueryData(["members", "all"], context?.previousAll);
      toast.error(
        gestionErrorMessage(error, "Erreur lors de la mise à jour du membre"),
      );
    },

    onSuccess: () => {
      toast.success("Membre mis à jour");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
