export async function fetchMembers(showArchived = false) {
  const response = await fetch(`/api/members?archived=${showArchived}`);

  if (!response.ok) {
    throw new Error("Failed to fetch members");
  }

  return response.json();
}

export async function createMember(data: {
  name: string;
  role: "member" | "manager";
  teamIds: string[];
}) {
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

export async function updateMember(data: {
  id: string;
  name?: string;
  role?: string;
  archived?: boolean;
}) {
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
