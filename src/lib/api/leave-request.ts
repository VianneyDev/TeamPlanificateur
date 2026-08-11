import type { CreateLeaveRequestInput } from "@/lib/schemas";
import type { LeaveRequest } from "@/lib/types";
import { throwIfNotOk } from "@/lib/api/errors";

export async function fetchLeaveRequests(options?: {
  status?: LeaveRequest["status"];
}): Promise<{ data: LeaveRequest[] }> {
  const params = new URLSearchParams();
  if (options?.status) {
    params.set("status", options.status);
  }
  const query = params.toString();
  const response = await fetch(
    query ? `/api/leave-requests?${query}` : "/api/leave-requests",
  );
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

export async function approveLeaveRequest(
  id: string,
): Promise<LeaveRequest> {
  const response = await fetch(`/api/leave-requests/${id}/approve`, {
    method: "POST",
  });
  await throwIfNotOk(response, "Failed to approve Leave Request");
  return response.json();
}

export async function rejectLeaveRequest(id: string): Promise<LeaveRequest> {
  const response = await fetch(`/api/leave-requests/${id}/reject`, {
    method: "POST",
  });
  await throwIfNotOk(response, "Failed to reject Leave Request");
  return response.json();
}
