import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertMonthlyWorkedDays } from "@/lib/api/monthly-worked-days";
import type { UpsertMonthlyWorkedDaysInput } from "@/lib/schemas";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";

function upsertErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "FUTURE_MONTH_NOT_ALLOWED") {
      return "Les mois futurs ne sont pas autorisés";
    }
    if (error.code === "MEMBER_NOT_EXTERNAL") {
      return "Seuls les membres externes ont des jours travaillés";
    }
    if (error.code === "MEMBER_ARCHIVED") {
      return "Impossible de déclarer pour un membre archivé";
    }
    if (error.code === "DAYS_EXCEED_MONTH") {
      return "Le nombre de jours dépasse la longueur du mois";
    }
    return error.message;
  }
  return "Erreur lors de l'enregistrement";
}

export function useUpsertMonthlyWorkedDays() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertMonthlyWorkedDaysInput) =>
      upsertMonthlyWorkedDays(data),
    onSuccess: () => {
      toast.success("Jours travaillés enregistrés");
      queryClient.invalidateQueries({ queryKey: ["monthly-worked-days"] });
    },
    onError: (error) => {
      toast.error(upsertErrorMessage(error));
    },
  });
}
