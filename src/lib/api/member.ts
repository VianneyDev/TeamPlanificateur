import type {
  CreateMemberInput,
  UpdateMemberInput,
  PatchMemberInput,
  MemberStatus,
} from "@/lib/schemas";

export type { MemberStatus };

export async function fetchMembers(status: MemberStatus = "active") {
  const response = await fetch(`/api/members?status=${status}`);

  if (!response.ok) {
    throw new Error("Failed to fetch members");
  }

  return response.json();
}

export async function createMember(data: CreateMemberInput) {
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

export async function updateMember(data: UpdateMemberInput) {
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

export async function patchMember(id: string, data: PatchMemberInput) {
  const response = await fetch(`/api/members/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to patch member");
  return response.json();
}

export async function archiveMember(id: string) {
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

export async function restoreMember(id: string) {
  return updateMember({ id, archived: false });
}
