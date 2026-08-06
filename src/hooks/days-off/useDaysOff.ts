import { useQuery } from "@tanstack/react-query";
import { fetchDaysOff } from "@/lib/api/day-off";

export function daysOffQueryKey(year: number) {
  return ["days-off", year] as const;
}

export function useDaysOff(year: number) {
  return useQuery({
    queryKey: daysOffQueryKey(year),
    queryFn: () => fetchDaysOff(year),
  });
}
