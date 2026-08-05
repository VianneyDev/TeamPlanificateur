import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { apiRequest } from "./helpers";

type MemberRow = {
  id: string;
  name: string;
  isExternal: boolean;
};

type MembersListBody = {
  data: MemberRow[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
};

describe("GET /api/members?isExternal=true", () => {
  const suffix = `isext-${Date.now()}`;
  const internalName = `${suffix}-internal`;
  const externalName = `${suffix}-external`;

  let teamId: string;
  let internalId: string;
  let externalId: string;

  beforeAll(async () => {
    const teamRes = await apiRequest("/api/teams", {
      method: "POST",
      body: { name: `${suffix}-team` },
    });
    expect(teamRes.status).toBe(201);
    const team = await teamRes.json();
    teamId = team.id;

    const internalRes = await apiRequest("/api/members", {
      method: "POST",
      body: {
        name: internalName,
        role: "member",
        teamIds: [teamId],
        isExternal: false,
      },
    });
    expect(internalRes.status).toBe(201);
    internalId = (await internalRes.json()).id;

    const externalRes = await apiRequest("/api/members", {
      method: "POST",
      body: {
        name: externalName,
        role: "member",
        teamIds: [teamId],
        isExternal: true,
      },
    });
    expect(externalRes.status).toBe(201);
    externalId = (await externalRes.json()).id;
  });

  afterAll(async () => {
    if (internalId) {
      await apiRequest(`/api/members/${internalId}/archive`, { method: "POST" });
    }
    if (externalId) {
      await apiRequest(`/api/members/${externalId}/archive`, { method: "POST" });
    }
  });

  it("returns only External Members", async () => {
    const response = await apiRequest(
      `/api/members?isExternal=true&search=${encodeURIComponent(suffix)}&status=active`,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/application\/json/);

    const body = (await response.json()) as MembersListBody;
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.every((member) => member.isExternal === true)).toBe(true);
    expect(body.data.map((member) => member.id)).toContain(externalId);
    expect(body.data.map((member) => member.id)).not.toContain(internalId);
    expect(body.data.map((member) => member.name)).toContain(externalName);
    expect(body.data.map((member) => member.name)).not.toContain(internalName);
  });
});
