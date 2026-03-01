import { useMutation, useQueryClient } from "@tanstack/react-query";
import { archiveMember } from "@/lib/api/member";
import { toast } from "sonner";

export function useArchiveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveMember(id),
    onSuccess: () => {
      toast.success("Membre archivé");
      queryClient.invalidateQueries({
        queryKey: ["members"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
