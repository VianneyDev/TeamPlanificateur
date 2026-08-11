import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isRangeToggleResult, toggleDayOff } from "@/lib/api/day-off";
import { daysOffQueryKey } from "@/hooks/days-off/useDaysOff";
import type { DayOff, PendingLeaveDate } from "@/lib/types";

type DayOffList = {
  data: DayOff[];
  pending: PendingLeaveDate[];
};

function sortDayOffs(data: DayOff[]) {
  return data.sort(
    (a, b) =>
      a.date.localeCompare(b.date) || a.memberId.localeCompare(b.memberId),
  );
}

export function useToggleDayOff(year: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleDayOff,
    onSuccess: (result, variables) => {
      queryClient.setQueryData<DayOffList>(
        daysOffQueryKey(year),
        (current) => {
          if (!current) return current;

          if (isRangeToggleResult(result)) {
            const from = variables.from!;
            const to = variables.to!;
            const memberId =
              variables.memberId ?? result.dayOffs[0]?.memberId;

            if (!memberId) {
              void queryClient.invalidateQueries({
                queryKey: daysOffQueryKey(year),
              });
              return current;
            }

            const data = current.data.filter((dayOff) => {
              const key = dayOff.date.slice(0, 10);
              const inRange = key >= from && key <= to;
              return !(inRange && dayOff.memberId === memberId);
            });

            if (result.active) {
              data.push(...result.dayOffs);
            }

            return { ...current, data: sortDayOffs(data) };
          }

          const dateKey = variables.date!;
          const memberId =
            result.dayOff?.memberId ?? variables.memberId;

          const data = current.data.filter((dayOff) => {
            if (dayOff.date.slice(0, 10) !== dateKey) return true;
            if (!memberId) return true;
            return dayOff.memberId !== memberId;
          });

          if (result.active && result.dayOff) {
            data.push(result.dayOff);
          }

          return { ...current, data: sortDayOffs(data) };
        },
      );
    },
    onError: () => {
      toast.error("Impossible de modifier ce jour de repos");
    },
  });
}
