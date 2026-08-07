import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleDayOff } from "@/lib/api/day-off";
import { daysOffQueryKey } from "@/hooks/days-off/useDaysOff";
import type { DayOff } from "@/lib/types";

type DayOffList = {
  data: DayOff[];
};

export function useToggleDayOff(year: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleDayOff,
    onSuccess: (result, variables) => {
      queryClient.setQueryData<DayOffList>(
        daysOffQueryKey(year),
        (current) => {
          if (!current) return current;

          const data = current.data.filter(
            (dayOff) => dayOff.date.slice(0, 10) !== variables.date,
          );
          if (result.active && result.dayOff) {
            data.push(result.dayOff);
            data.sort((a, b) => a.date.localeCompare(b.date));
          }

          return { data };
        },
      );
    },
    onError: () => {
      toast.error("Impossible de modifier ce jour de repos");
    },
  });
}
