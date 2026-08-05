import type {
  CreateMemberInput,
  UpdateMemberInput,
  PatchMemberInput,
  MemberStatus,
} from "@/lib/schemas";
import type { Member } from "@/lib/types";
import { throwIfNotOk } from "@/lib/api/errors";

export type { MemberStatus };

export async function fetchMembers(
  status: MemberStatus = "active",
  page: number,
  search: string,
  options?: { isExternal?: boolean },
): Promise<{
  data: Member[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  const params = new URLSearchParams({
    status,
    page: String(page),
    limit: "10",
  });
  if (search) params.set("search", search);
  if (options?.isExternal !== undefined) {
    params.set("isExternal", String(options.isExternal));
  }

  const response = await fetch(`/api/members?${params}`);
  await throwIfNotOk(response, "Failed to fetch members");
  return response.json();
}

export async function createMember(data: CreateMemberInput): Promise<Member> {
  const response = await fetch("/api/members", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  await throwIfNotOk(response, "Failed to create member");
  return response.json();
}

export async function updateMember(data: UpdateMemberInput): Promise<Member> {
  const response = await fetch("/api/members", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  await throwIfNotOk(response, "Failed to update member");
  return response.json();
}

export async function patchMember(
  id: string,
  data: PatchMemberInput,
): Promise<Member> {
  const response = await fetch(`/api/members/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await throwIfNotOk(response, "Failed to patch member");
  return response.json();
}

export async function archiveMember(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/members/${id}/archive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  await throwIfNotOk(response, "Failed to archive member");
  return response.json();
}

export async function restoreMember(id: string): Promise<Member> {
  return updateMember({ id, archived: false });
}
