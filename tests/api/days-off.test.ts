import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { apiRequest } from "./helpers";

type MemberBody = {
  id: string;
};

type DayOffBody = {
  id: string;
  date: string;
  memberId: string;
};

type ToggleBody = {
  active: boolean;
  dayOff: DayOffBody | null;
};

type ListBody = {
  data: DayOffBody[];
};

describe("Day Offs API", () => {
  const suffix = `day-offs-${Date.now()}`;
  const year = new Date().getUTCFullYear();
  const firstDate = `${year}-02-12`;
  const secondDate = `${year}-08-21`;

  let teamId: string;
  let actingMemberId: string;
  let otherMemberId: string;
  let archivedMemberId: string;

  beforeAll(async () => {
    const teamResponse = await apiRequest("/api/teams", {
      method: "POST",
      body: { name: `${suffix}-team` },
    });
    expect(teamResponse.status).toBe(201);
    teamId = (await teamResponse.json()).id;

    const createMember = async (name: string) => {
      const response = await apiRequest("/api/members", {
        method: "POST",
        body: {
          name,
          role: "member",
          teamIds: [teamId],
          isExternal: false,
        },
      });
      expect(response.status).toBe(201);
      return ((await response.json()) as MemberBody).id;
    };

    actingMemberId = await createMember(`${suffix}-acting`);
    otherMemberId = await createMember(`${suffix}-other`);
    archivedMemberId = await createMember(`${suffix}-archived`);

    const archiveResponse = await apiRequest(
      `/api/members/${archivedMemberId}/archive`,
      { method: "POST" },
    );
    expect(archiveResponse.status).toBe(200);
  });

  afterAll(async () => {
    for (const id of [actingMemberId, otherMemberId]) {
      if (id) {
        await apiRequest(`/api/members/${id}/archive`, { method: "POST" });
      }
    }
  });

  it("lets the Acting Member toggle one full calendar day on and off", async () => {
    const createResponse = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { date: firstDate },
    });

    expect(createResponse.status).toBe(200);
    const created = (await createResponse.json()) as ToggleBody;
    expect(created).toEqual({
      active: true,
      dayOff: expect.objectContaining({
        date: `${firstDate}T00:00:00.000Z`,
        memberId: actingMemberId,
      }),
    });

    const listResponse = await apiRequest(`/api/days-off?year=${year}`, {
      actingMemberId,
    });
    expect(listResponse.status).toBe(200);
    const list = (await listResponse.json()) as ListBody;
    expect(list.data).toEqual([
      expect.objectContaining({
        date: `${firstDate}T00:00:00.000Z`,
        memberId: actingMemberId,
      }),
    ]);

    const removeResponse = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { date: firstDate },
    });
    expect(removeResponse.status).toBe(200);
    expect(await removeResponse.json()).toEqual({
      active: false,
      dayOff: null,
    });
  });

  it("uses the Acting Member cookie for both toggle ownership and listing", async () => {
    const otherToggleResponse = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId: otherMemberId,
      body: { date: secondDate },
    });
    expect(otherToggleResponse.status).toBe(200);

    const actingToggleResponse = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { date: firstDate },
    });
    expect(actingToggleResponse.status).toBe(200);

    const actingListResponse = await apiRequest(`/api/days-off?year=${year}`, {
      actingMemberId,
    });
    expect(actingListResponse.status).toBe(200);
    const actingList = (await actingListResponse.json()) as ListBody;
    expect(actingList.data).toHaveLength(1);
    expect(actingList.data[0]).toEqual(
      expect.objectContaining({
        memberId: actingMemberId,
        date: `${firstDate}T00:00:00.000Z`,
      }),
    );
  });

  it("rejects a new Day Off for an Archived Acting Member", async () => {
    const response = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId: archivedMemberId,
      body: { date: firstDate },
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        code: "MEMBER_ARCHIVED",
      }),
    );
  });

  it("requires an Acting Member for listing and toggling", async () => {
    const listResponse = await apiRequest(`/api/days-off?year=${year}`);
    expect(listResponse.status).toBe(401);

    const toggleResponse = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      body: { date: firstDate },
    });
    expect(toggleResponse.status).toBe(401);
  });
});
