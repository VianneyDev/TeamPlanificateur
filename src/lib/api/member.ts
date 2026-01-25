export async function fetchMembers(teamId?: string) {
  const url = teamId ? `/api/members?teamId=${teamId}` : "/api/members";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch members");
  }

  return response.json();
}

export async function createMember(data: {
  name: string;
  teamId: string;
  role?: string;
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
