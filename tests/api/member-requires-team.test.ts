import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { apiRequest } from "./helpers";

type TeamBody = { id: string; name: string; archived: boolean };
type MemberBody = {
  id: string;
  name: string;
  archived: boolean;
  teams: { id: string }[];
};

describe("active Member must belong to at least one Team", () => {
  const suffix = `req-team-${Date.now()}`;

  let soloTeamId: string;
  let sharedTeamId: string;
  let otherTeamId: string;
  let soloMemberId: string;
  let sharedMemberId: string;
  let multiMemberId: string;

  beforeAll(async () => {
    const soloTeamRes = await apiRequest("/api/teams", {
      method: "POST",
      body: { name: `${suffix}-solo-team` },
    });
    expect(soloTeamRes.status).toBe(201);
    soloTeamId = ((await soloTeamRes.json()) as TeamBody).id;

    const sharedTeamRes = await apiRequest("/api/teams", {
      method: "POST",
      body: { name: `${suffix}-shared-team` },
    });
    expect(sharedTeamRes.status).toBe(201);
    sharedTeamId = ((await sharedTeamRes.json()) as TeamBody).id;

    const otherTeamRes = await apiRequest("/api/teams", {
      method: "POST",
      body: { name: `${suffix}-other-team` },
    });
    expect(otherTeamRes.status).toBe(201);
    otherTeamId = ((await otherTeamRes.json()) as TeamBody).id;

    const soloMemberRes = await apiRequest("/api/members", {
      method: "POST",
      body: {
        name: `${suffix}-solo-member`,
        role: "member",
        teamIds: [soloTeamId],
      },
    });
    expect(soloMemberRes.status).toBe(201);
    soloMemberId = ((await soloMemberRes.json()) as MemberBody).id;

    const sharedMemberRes = await apiRequest("/api/members", {
      method: "POST",
      body: {
        name: `${suffix}-shared-member`,
        role: "member",
        teamIds: [sharedTeamId],
      },
    });
    expect(sharedMemberRes.status).toBe(201);
    sharedMemberId = ((await sharedMemberRes.json()) as MemberBody).id;

    const multiMemberRes = await apiRequest("/api/members", {
      method: "POST",
      body: {
        name: `${suffix}-multi-member`,
        role: "manager",
        teamIds: [sharedTeamId, otherTeamId],
      },
    });
    expect(multiMemberRes.status).toBe(201);
    multiMemberId = ((await multiMemberRes.json()) as MemberBody).id;
  });

  afterAll(async () => {
    for (const id of [soloMemberId, sharedMemberId, multiMemberId]) {
      if (id) {
        await apiRequest(`/api/members/${id}/archive`, { method: "POST" });
      }
    }
  });

  it("rejects creating an active Member without at least one Team", async () => {
    const response = await apiRequest("/api/members", {
      method: "POST",
      body: {
        name: `${suffix}-orphan-create`,
        role: "member",
        teamIds: [],
      },
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        code: "MEMBER_REQUIRES_TEAM",
        error: expect.stringMatching(/Team/i),
      }),
    );
  });

  it("rejects updating an active Member's Teams to an empty list", async () => {
    const response = await apiRequest(`/api/members/${soloMemberId}`, {
      method: "PATCH",
      body: {
        name: `${suffix}-solo-member`,
        role: "member",
        teamIds: [],
      },
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        code: "MEMBER_REQUIRES_TEAM",
        error: expect.stringMatching(/Team/i),
      }),
    );

    const stillThere = await apiRequest(
      `/api/members?search=${encodeURIComponent(`${suffix}-solo-member`)}&status=active`,
    );
    expect(stillThere.status).toBe(200);
    const list = await stillThere.json();
    const member = list.data.find((m: MemberBody) => m.id === soloMemberId);
    expect(member?.teams?.map((t: { id: string }) => t.id)).toContain(
      soloTeamId,
    );
  });

  it("rejects archiving a Team that would orphan an active Member", async () => {
    const response = await apiRequest("/api/teams", {
      method: "PUT",
      body: { id: soloTeamId, archived: true },
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        code: "TEAM_WOULD_ORPHAN_MEMBERS",
        error: expect.stringMatching(/Member|Team/i),
      }),
    );
  });

  it("rejects deleting a Team that would orphan an active Member", async () => {
    const response = await apiRequest("/api/teams", {
      method: "DELETE",
      body: { id: sharedTeamId },
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        code: "TEAM_WOULD_ORPHAN_MEMBERS",
        error: expect.stringMatching(/Member|Team/i),
      }),
    );
  });

  it("allows archiving a Team when every active Member still has another Team", async () => {
    // sharedMember only has sharedTeam — move them onto otherTeam first
    const reassign = await apiRequest(`/api/members/${sharedMemberId}`, {
      method: "PATCH",
      body: {
        name: `${suffix}-shared-member`,
        role: "member",
        teamIds: [otherTeamId],
      },
    });
    expect(reassign.status).toBe(200);

    // multiMember still has otherTeam after sharedTeam is archived
    const response = await apiRequest("/api/teams", {
      method: "PUT",
      body: { id: sharedTeamId, archived: true },
    });
    expect(response.status).toBe(200);
  });
});
