import type { ToggleDayOffInput } from "@/lib/schemas";
import type {
  DayOff,
  PendingLeaveDate,
  ToggleDayOffRangeResult,
  ToggleDayOffResult,
} from "@/lib/types";
import { throwIfNotOk } from "@/lib/api/errors";

export async function fetchDaysOff(
  year: number,
): Promise<{ data: DayOff[]; pending: PendingLeaveDate[] }> {
  const response = await fetch(`/api/days-off?year=${year}`);
  await throwIfNotOk(response, "Failed to fetch Day Offs");
  return response.json();
}

export async function toggleDayOff(
  data: ToggleDayOffInput,
): Promise<ToggleDayOffResult | ToggleDayOffRangeResult> {
  const response = await fetch("/api/days-off/toggle", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await throwIfNotOk(response, "Failed to toggle Day Off");
  return response.json();
}

export function isRangeToggleResult(
  result: ToggleDayOffResult | ToggleDayOffRangeResult,
): result is ToggleDayOffRangeResult {
  return "dayOffs" in result;
}
