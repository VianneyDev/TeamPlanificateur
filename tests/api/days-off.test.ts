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
  const thirdDate = `${year}-03-16`; // Monday (weekdays-only writes)
  const rangeStart = `${year}-04-01`;
  const rangeMid = `${year}-04-02`;
  const rangeEnd = `${year}-04-03`;
  // Friday → Tuesday spanning a weekend (year-relative)
  const friToTue = (() => {
    for (let day = 1; day <= 28; day++) {
      const friday = `${year}-06-${String(day).padStart(2, "0")}`;
      if (new Date(`${friday}T00:00:00.000Z`).getUTCDay() !== 5) continue;

      const shift = (offset: number) => {
        const date = new Date(`${friday}T00:00:00.000Z`);
        date.setUTCDate(date.getUTCDate() + offset);
        return date.toISOString().slice(0, 10);
      };

      return {
        friday,
        saturday: shift(1),
        sunday: shift(2),
        monday: shift(3),
        tuesday: shift(4),
      };
    }
    throw new Error("No Friday found in June");
  })();

  let teamId: string;
  let otherTeamId: string;
  let actingMemberId: string;
  let otherMemberId: string;
  let outsiderMemberId: string;
  let archivedMemberId: string;
  let managerId: string;

  beforeAll(async () => {
    const teamResponse = await apiRequest("/api/teams", {
      method: "POST",
      body: { name: `${suffix}-team` },
    });
    expect(teamResponse.status).toBe(201);
    teamId = (await teamResponse.json()).id;

    const otherTeamResponse = await apiRequest("/api/teams", {
      method: "POST",
      body: { name: `${suffix}-other-team` },
    });
    expect(otherTeamResponse.status).toBe(201);
    otherTeamId = (await otherTeamResponse.json()).id;

    const createMember = async (
      name: string,
      options: { role?: string; teamIds?: string[] } = {},
    ) => {
      const response = await apiRequest("/api/members", {
        method: "POST",
        body: {
          name,
          role: options.role ?? "member",
          teamIds: options.teamIds ?? [teamId],
          isExternal: false,
        },
      });
      expect(response.status).toBe(201);
      return ((await response.json()) as MemberBody).id;
    };

    actingMemberId = await createMember(`${suffix}-acting`);
    otherMemberId = await createMember(`${suffix}-other`);
    outsiderMemberId = await createMember(`${suffix}-outsider`, {
      teamIds: [otherTeamId],
    });
    managerId = await createMember(`${suffix}-manager`, { role: "manager" });
    archivedMemberId = await createMember(`${suffix}-archived`);

    const archiveResponse = await apiRequest(
      `/api/members/${archivedMemberId}/archive`,
      { method: "POST" },
    );
    expect(archiveResponse.status).toBe(200);
  });

  afterAll(async () => {
    for (const id of [actingMemberId, otherMemberId, outsiderMemberId, managerId]) {
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

  it("lists Day Offs for active Members who share a Team with a non-manager", async () => {
    const teammateToggle = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId: otherMemberId,
      body: { date: secondDate },
    });
    expect(teammateToggle.status).toBe(200);

    const outsiderToggle = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId: outsiderMemberId,
      body: { date: thirdDate },
    });
    expect(outsiderToggle.status).toBe(200);

    const actingToggle = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { date: firstDate },
    });
    expect(actingToggle.status).toBe(200);

    const listResponse = await apiRequest(`/api/days-off?year=${year}`, {
      actingMemberId,
    });
    expect(listResponse.status).toBe(200);
    const list = (await listResponse.json()) as ListBody;
    const memberIds = new Set(list.data.map((dayOff) => dayOff.memberId));

    expect(memberIds.has(actingMemberId)).toBe(true);
    expect(memberIds.has(otherMemberId)).toBe(true);
    expect(memberIds.has(outsiderMemberId)).toBe(false);
    expect(
      list.data.some(
        (dayOff) =>
          dayOff.memberId === actingMemberId &&
          dayOff.date === `${firstDate}T00:00:00.000Z`,
      ),
    ).toBe(true);
    expect(
      list.data.some(
        (dayOff) =>
          dayOff.memberId === otherMemberId &&
          dayOff.date === `${secondDate}T00:00:00.000Z`,
      ),
    ).toBe(true);
  });

  it("lets a Manager list Day Offs across the organisation excluding Archived Members", async () => {
    const managerViewDate = `${year}-05-20`;
    const soonArchivedDate = `${year}-05-21`;

    const soonArchivedResponse = await apiRequest("/api/members", {
      method: "POST",
      body: {
        name: `${suffix}-soon-archived`,
        role: "member",
        teamIds: [otherTeamId],
        isExternal: false,
      },
    });
    expect(soonArchivedResponse.status).toBe(201);
    const soonArchivedId = ((await soonArchivedResponse.json()) as MemberBody)
      .id;

    const outsiderToggle = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId: outsiderMemberId,
      body: { date: managerViewDate },
    });
    expect(outsiderToggle.status).toBe(200);
    expect((await outsiderToggle.json()) as ToggleBody).toEqual(
      expect.objectContaining({ active: true }),
    );

    const beforeArchiveToggle = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId: managerId,
      body: { date: soonArchivedDate, memberId: soonArchivedId },
    });
    expect(beforeArchiveToggle.status).toBe(200);

    const archiveSoon = await apiRequest(
      `/api/members/${soonArchivedId}/archive`,
      { method: "POST" },
    );
    expect(archiveSoon.status).toBe(200);

    const listResponse = await apiRequest(`/api/days-off?year=${year}`, {
      actingMemberId: managerId,
    });
    expect(listResponse.status).toBe(200);
    const list = (await listResponse.json()) as ListBody;
    const memberIds = new Set(list.data.map((dayOff) => dayOff.memberId));

    expect(memberIds.has(outsiderMemberId)).toBe(true);
    expect(memberIds.has(actingMemberId)).toBe(true);
    expect(memberIds.has(otherMemberId)).toBe(true);
    expect(memberIds.has(archivedMemberId)).toBe(false);
    expect(memberIds.has(soonArchivedId)).toBe(false);
    expect(
      list.data.some(
        (dayOff) =>
          dayOff.memberId === outsiderMemberId &&
          dayOff.date === `${managerViewDate}T00:00:00.000Z`,
      ),
    ).toBe(true);
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

  it("forbids a non-manager from toggling another Member's Day Offs", async () => {
    const response = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { date: `${year}-06-10`, memberId: otherMemberId },
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual(
      expect.objectContaining({ error: "Forbidden" }),
    );
  });

  it("lets a Manager toggle Day Offs for another Member", async () => {
    const targetDate = `${year}-06-11`;
    const createResponse = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId: managerId,
      body: { date: targetDate, memberId: outsiderMemberId },
    });
    expect(createResponse.status).toBe(200);
    expect(await createResponse.json()).toEqual({
      active: true,
      dayOff: expect.objectContaining({
        date: `${targetDate}T00:00:00.000Z`,
        memberId: outsiderMemberId,
      }),
    });

    const removeResponse = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId: managerId,
      body: { date: targetDate, memberId: outsiderMemberId },
    });
    expect(removeResponse.status).toBe(200);
    expect(await removeResponse.json()).toEqual({
      active: false,
      dayOff: null,
    });
  });

  it("applies a homogeneous toggle across a contiguous date range", async () => {
    const setResponse = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { from: rangeStart, to: rangeEnd },
    });
    expect(setResponse.status).toBe(200);
    const setBody = await setResponse.json();
    expect(setBody).toEqual({
      active: true,
      dayOffs: expect.arrayContaining([
        expect.objectContaining({
          memberId: actingMemberId,
          date: `${rangeStart}T00:00:00.000Z`,
        }),
        expect.objectContaining({
          memberId: actingMemberId,
          date: `${rangeMid}T00:00:00.000Z`,
        }),
        expect.objectContaining({
          memberId: actingMemberId,
          date: `${rangeEnd}T00:00:00.000Z`,
        }),
      ]),
    });
    expect(setBody.dayOffs).toHaveLength(3);

    const clearResponse = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { from: rangeStart, to: rangeEnd },
    });
    expect(clearResponse.status).toBe(200);
    expect(await clearResponse.json()).toEqual({
      active: false,
      dayOffs: [],
    });
  });

  it("sets the whole range to Day Off when only some days are already off", async () => {
    const partialDate = rangeMid;
    const partialToggle = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { date: partialDate },
    });
    expect(partialToggle.status).toBe(200);

    const setResponse = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { from: rangeStart, to: rangeEnd },
    });
    expect(setResponse.status).toBe(200);
    const setBody = await setResponse.json();
    expect(setBody.active).toBe(true);
    expect(setBody.dayOffs).toHaveLength(3);

    // cleanup
    await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { from: rangeStart, to: rangeEnd },
    });
  });

  it("lets a Manager apply a range toggle for another Member", async () => {
    const from = `${year}-07-01`;
    const to = `${year}-07-02`;
    const setResponse = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId: managerId,
      body: { from, to, memberId: otherMemberId },
    });
    expect(setResponse.status).toBe(200);
    expect(await setResponse.json()).toEqual({
      active: true,
      dayOffs: expect.arrayContaining([
        expect.objectContaining({ memberId: otherMemberId }),
      ]),
    });

    const forbidden = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { from, to, memberId: otherMemberId },
    });
    expect(forbidden.status).toBe(403);
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

  it("rejects a single-day toggle on a weekend date", async () => {
    const response = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { date: friToTue.saturday },
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        code: "WEEKEND_NOT_ALLOWED",
      }),
    );
  });

  it("rejects a range toggle when from or to falls on a weekend", async () => {
    const fromWeekend = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { from: friToTue.saturday, to: friToTue.tuesday },
    });
    expect(fromWeekend.status).toBe(400);
    expect(await fromWeekend.json()).toEqual(
      expect.objectContaining({ code: "WEEKEND_NOT_ALLOWED" }),
    );

    const toWeekend = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { from: friToTue.friday, to: friToTue.sunday },
    });
    expect(toWeekend.status).toBe(400);
    expect(await toWeekend.json()).toEqual(
      expect.objectContaining({ code: "WEEKEND_NOT_ALLOWED" }),
    );
  });

  it("expands Friday→Tuesday to three weekdays only", async () => {
    const setResponse = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { from: friToTue.friday, to: friToTue.tuesday },
    });
    expect(setResponse.status).toBe(200);
    const setBody = await setResponse.json();
    expect(setBody.active).toBe(true);
    expect(setBody.dayOffs).toHaveLength(3);
    expect(setBody.dayOffs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: `${friToTue.friday}T00:00:00.000Z`,
        }),
        expect.objectContaining({
          date: `${friToTue.monday}T00:00:00.000Z`,
        }),
        expect.objectContaining({
          date: `${friToTue.tuesday}T00:00:00.000Z`,
        }),
      ]),
    );

    const clearResponse = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { from: friToTue.friday, to: friToTue.tuesday },
    });
    expect(clearResponse.status).toBe(200);
    expect(await clearResponse.json()).toEqual({
      active: false,
      dayOffs: [],
    });
  });

  it("gives Managers no weekend bypass on Day Off writes", async () => {
    const response = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId: managerId,
      body: { date: friToTue.sunday, memberId: otherMemberId },
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      expect.objectContaining({ code: "WEEKEND_NOT_ALLOWED" }),
    );
  });
});
