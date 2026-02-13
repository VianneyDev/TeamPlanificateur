import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchMember } from "@/lib/api/member";
import { toast } from "sonner";

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; role?: "member" | "manager"; teamIds?: string[] };
    }) => patchMember(id, data),
    onSuccess: () => {
      toast.success("Membre mis à jour");
      queryClient.invalidateQueries({
        queryKey: ["members"],
        exact: false,
      });
    },
  });
}
