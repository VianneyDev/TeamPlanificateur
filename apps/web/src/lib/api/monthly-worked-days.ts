import type { UpsertMonthlyWorkedDaysInput } from "@/lib/schemas";
import type { MonthlyWorkedDays } from "@/lib/types";
import { throwIfNotOk } from "@/lib/api/errors";

export async function fetchMonthlyWorkedDays(options?: {
  memberId?: string;
}): Promise<{ data: MonthlyWorkedDays[] }> {
  const params = new URLSearchParams();
  if (options?.memberId) params.set("memberId", options.memberId);

  const query = params.toString();
  const response = await fetch(
    `/api/monthly-worked-days${query ? `?${query}` : ""}`,
  );
  await throwIfNotOk(response, "Failed to fetch Monthly Worked Days");
  return response.json();
}

export async function upsertMonthlyWorkedDays(
  data: UpsertMonthlyWorkedDaysInput,
): Promise<MonthlyWorkedDays> {
  const response = await fetch("/api/monthly-worked-days", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await throwIfNotOk(response, "Failed to save Monthly Worked Days");
  return response.json();
}
