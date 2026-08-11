import type { CreateLeaveRequestInput } from "@/lib/schemas";
import type { LeaveRequest } from "@/lib/types";
import { throwIfNotOk } from "@/lib/api/errors";

export async function fetchLeaveRequests(): Promise<{ data: LeaveRequest[] }> {
  const response = await fetch("/api/leave-requests");
  await throwIfNotOk(response, "Failed to fetch Leave Requests");
  return response.json();
}

export async function createLeaveRequest(
  data: CreateLeaveRequestInput,
): Promise<LeaveRequest> {
  const response = await fetch("/api/leave-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await throwIfNotOk(response, "Failed to create Leave Request");
  return response.json();
}

export async function withdrawLeaveRequest(
  id: string,
): Promise<LeaveRequest> {
  const response = await fetch(`/api/leave-requests/${id}/withdraw`, {
    method: "POST",
  });
  await throwIfNotOk(response, "Failed to withdraw Leave Request");
  return response.json();
}
