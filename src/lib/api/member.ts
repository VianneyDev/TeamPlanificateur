import type {
  CreateMemberInput,
  UpdateMemberInput,
  PatchMemberInput,
  MemberStatus,
} from "@/lib/schemas";
import type { Member } from "@/lib/types";

export type { MemberStatus };

export async function fetchMembers(
  status: MemberStatus = "active",
  page: number,
  search: string,
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

  const response = await fetch(`/api/members?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch members");
  }

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

  if (!response.ok) {
    throw new Error("Failed to create member");
  }

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

  if (!response.ok) {
    throw new Error("Failed to update member");
  }

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
  if (!response.ok) throw new Error("Failed to patch member");
  return response.json();
}

export async function archiveMember(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/members/${id}/archive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to archive member");
  }

  return response.json();
}

export async function restoreMember(id: string): Promise<Member> {
  return updateMember({ id, archived: false });
}
