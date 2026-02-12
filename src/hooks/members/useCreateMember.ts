import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMember } from "@/lib/api/member";
import { toast } from "sonner";

type CreateMemberInput = {
  name: string;
  role: "member" | "manager";
  teamIds: string[];
};

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMemberInput) => createMember(data),
    onSuccess: () => {
      toast.success("Membre créée");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => {
      toast.error("Erreur lors de la création du membre");
    },
  });
}
