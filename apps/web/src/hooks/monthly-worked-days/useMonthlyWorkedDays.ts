import { useQuery } from "@tanstack/react-query";
import { fetchMonthlyWorkedDays } from "@/lib/api/monthly-worked-days";

export function useMonthlyWorkedDays(params?: { memberId?: string }) {
  const memberId = params?.memberId;

  return useQuery({
    queryKey: ["monthly-worked-days", memberId ?? null],
    queryFn: () => fetchMonthlyWorkedDays({ memberId }),
  });
}
