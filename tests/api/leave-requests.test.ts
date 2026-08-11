import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import {
  DAY_OFF_CREATE_FORBIDDEN_CODE,
  INVALID_TRANSITION_CODE,
  MEMBER_ARCHIVED_CODE,
  WEEKEND_NOT_ALLOWED_CODE,
} from "@/lib/leave-request-codes";
import { apiRequest } from "./helpers";

type MemberBody = {
  id: string;
};

type LeaveRequestDateBody = {
  date: string;
};

type LeaveRequestBody = {
  id: string;
  memberId: string;
  status: string;
  dates: LeaveRequestDateBody[];
};

type ListBody = {
  data: LeaveRequestBody[];
};

describe("Leave Requests API (non-manager submit path)", () => {
  const suffix = `leave-req-${Date.now()}`;
  const year = new Date().getUTCFullYear();

  const weekdayPair = (() => {
    for (let day = 1; day <= 28; day++) {
      const monday = `${year}-09-${String(day).padStart(2, "0")}`;
      if (new Date(`${monday}T00:00:00.000Z`).getUTCDay() !== 1) continue;
      const tuesdayDate = new Date(`${monday}T00:00:00.000Z`);
      tuesdayDate.setUTCDate(tuesdayDate.getUTCDate() + 1);
      return {
        monday,
        tuesday: tuesdayDate.toISOString().slice(0, 10),
      };
    }
    throw new Error("No Monday found in September");
  })();

  const weekendDate = (() => {
    for (let day = 1; day <= 28; day++) {
      const saturday = `${year}-10-${String(day).padStart(2, "0")}`;
      if (new Date(`${saturday}T00:00:00.000Z`).getUTCDay() === 6) {
        return saturday;
      }
    }
    throw new Error("No Saturday found in October");
  })();

  let teamId: string;
  let actingMemberId: string;
  let otherMemberId: string;
  let managerId: string;
  let archivedMemberId: string;

  beforeAll(async () => {
    const teamResponse = await apiRequest("/api/teams", {
      method: "POST",
      body: { name: `${suffix}-team` },
    });
    expect(teamResponse.status).toBe(201);
    teamId = (await teamResponse.json()).id;

    const createMember = async (
      name: string,
      options: { role?: string } = {},
    ) => {
      const response = await apiRequest("/api/members", {
        method: "POST",
        body: {
          name,
          role: options.role ?? "member",
          teamIds: [teamId],
          isExternal: false,
        },
      });
      expect(response.status).toBe(201);
      return ((await response.json()) as MemberBody).id;
    };

    actingMemberId = await createMember(`${suffix}-acting`);
    otherMemberId = await createMember(`${suffix}-other`);
    managerId = await createMember(`${suffix}-manager`, { role: "manager" });
    archivedMemberId = await createMember(`${suffix}-archived`);

    const archiveResponse = await apiRequest(
      `/api/members/${archivedMemberId}/archive`,
      { method: "POST" },
    );
    expect(archiveResponse.status).toBe(200);
  });

  afterAll(async () => {
    for (const id of [actingMemberId, otherMemberId, managerId]) {
      if (id) {
        await apiRequest(`/api/members/${id}/archive`, { method: "POST" });
      }
    }
  });

  it("lets a non-manager submit a pending Leave Request for weekdays", async () => {
    const response = await apiRequest("/api/leave-requests", {
      method: "POST",
      actingMemberId,
      body: { dates: [weekdayPair.monday, weekdayPair.tuesday] },
    });

    expect(response.status).toBe(201);
    const created = (await response.json()) as LeaveRequestBody;
    expect(created).toEqual(
      expect.objectContaining({
        memberId: actingMemberId,
        status: "pending",
        dates: expect.arrayContaining([
          expect.objectContaining({
            date: `${weekdayPair.monday}T00:00:00.000Z`,
          }),
          expect.objectContaining({
            date: `${weekdayPair.tuesday}T00:00:00.000Z`,
          }),
        ]),
      }),
    );
    expect(created.dates).toHaveLength(2);

    const listResponse = await apiRequest("/api/leave-requests", {
      actingMemberId,
    });
    expect(listResponse.status).toBe(200);
    const list = (await listResponse.json()) as ListBody;
    expect(
      list.data.some(
        (request) =>
          request.id === created.id && request.status === "pending",
      ),
    ).toBe(true);

    // cleanup via withdraw
    const withdraw = await apiRequest(
      `/api/leave-requests/${created.id}/withdraw`,
      { method: "POST", actingMemberId },
    );
    expect(withdraw.status).toBe(200);
  });

  it("does not materialize Day Offs on Leave Request submit", async () => {
    const date = weekdayPair.monday;
    const createResponse = await apiRequest("/api/leave-requests", {
      method: "POST",
      actingMemberId,
      body: { dates: [date] },
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as LeaveRequestBody;

    const daysOff = await apiRequest(`/api/days-off?year=${year}`, {
      actingMemberId,
    });
    expect(daysOff.status).toBe(200);
    const body = (await daysOff.json()) as {
      data: { memberId: string; date: string }[];
    };
    expect(
      body.data.some(
        (dayOff) =>
          dayOff.memberId === actingMemberId &&
          dayOff.date === `${date}T00:00:00.000Z`,
      ),
    ).toBe(false);

    await apiRequest(`/api/leave-requests/${created.id}/withdraw`, {
      method: "POST",
      actingMemberId,
    });
  });

  it("includes the requester's pending dates on Team Calendar reads", async () => {
    const date = weekdayPair.tuesday;
    const createResponse = await apiRequest("/api/leave-requests", {
      method: "POST",
      actingMemberId,
      body: { dates: [date] },
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as LeaveRequestBody;

    const listResponse = await apiRequest(`/api/days-off?year=${year}`, {
      actingMemberId,
    });
    expect(listResponse.status).toBe(200);
    const list = (await listResponse.json()) as {
      data: unknown[];
      pending: {
        leaveRequestId: string;
        memberId: string;
        date: string;
      }[];
    };

    expect(list.pending).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          leaveRequestId: created.id,
          memberId: actingMemberId,
          date: `${date}T00:00:00.000Z`,
        }),
      ]),
    );

    const teammateView = await apiRequest(`/api/days-off?year=${year}`, {
      actingMemberId: otherMemberId,
    });
    expect(teammateView.status).toBe(200);
    const teammateBody = (await teammateView.json()) as {
      pending: { leaveRequestId: string }[];
    };
    expect(
      teammateBody.pending?.some(
        (entry) => entry.leaveRequestId === created.id,
      ) ?? false,
    ).toBe(false);

    await apiRequest(`/api/leave-requests/${created.id}/withdraw`, {
      method: "POST",
      actingMemberId,
    });
  });

  it("rejects Leave Request writes that include a weekend date", async () => {
    const response = await apiRequest("/api/leave-requests", {
      method: "POST",
      actingMemberId,
      body: { dates: [weekdayPair.monday, weekendDate] },
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      expect.objectContaining({ code: WEEKEND_NOT_ALLOWED_CODE }),
    );
  });

  it("rejects Leave Request creation for an Archived Member", async () => {
    const response = await apiRequest("/api/leave-requests", {
      method: "POST",
      actingMemberId: archivedMemberId,
      body: { dates: [weekdayPair.monday] },
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      expect.objectContaining({ code: MEMBER_ARCHIVED_CODE }),
    );
  });

  it("lets the requester withdraw a pending Leave Request", async () => {
    const createResponse = await apiRequest("/api/leave-requests", {
      method: "POST",
      actingMemberId,
      body: { dates: [weekdayPair.monday] },
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as LeaveRequestBody;

    const withdraw = await apiRequest(
      `/api/leave-requests/${created.id}/withdraw`,
      { method: "POST", actingMemberId },
    );
    expect(withdraw.status).toBe(200);
    expect(await withdraw.json()).toEqual(
      expect.objectContaining({
        id: created.id,
        status: "withdrawn",
      }),
    );
  });

  it("rejects withdraw on terminal statuses", async () => {
    const createResponse = await apiRequest("/api/leave-requests", {
      method: "POST",
      actingMemberId,
      body: { dates: [weekdayPair.tuesday] },
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as LeaveRequestBody;

    await db.leaveRequest.update({
      where: { id: created.id },
      data: { status: "approved" },
    });

    const withdrawApproved = await apiRequest(
      `/api/leave-requests/${created.id}/withdraw`,
      { method: "POST", actingMemberId },
    );
    expect(withdrawApproved.status).toBe(409);
    expect(await withdrawApproved.json()).toEqual(
      expect.objectContaining({ code: INVALID_TRANSITION_CODE }),
    );

    await db.leaveRequest.update({
      where: { id: created.id },
      data: { status: "rejected" },
    });

    const withdrawRejected = await apiRequest(
      `/api/leave-requests/${created.id}/withdraw`,
      { method: "POST", actingMemberId },
    );
    expect(withdrawRejected.status).toBe(409);
    expect(await withdrawRejected.json()).toEqual(
      expect.objectContaining({ code: INVALID_TRANSITION_CODE }),
    );

    await db.leaveRequest.update({
      where: { id: created.id },
      data: { status: "withdrawn" },
    });

    const withdrawAgain = await apiRequest(
      `/api/leave-requests/${created.id}/withdraw`,
      { method: "POST", actingMemberId },
    );
    expect(withdrawAgain.status).toBe(409);
    expect(await withdrawAgain.json()).toEqual(
      expect.objectContaining({ code: INVALID_TRANSITION_CODE }),
    );
  });

  it("forbids withdrawing another Member's Leave Request", async () => {
    const createResponse = await apiRequest("/api/leave-requests", {
      method: "POST",
      actingMemberId,
      body: { dates: [weekdayPair.monday] },
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as LeaveRequestBody;

    const forbidden = await apiRequest(
      `/api/leave-requests/${created.id}/withdraw`,
      { method: "POST", actingMemberId: otherMemberId },
    );
    expect(forbidden.status).toBe(403);

    await apiRequest(`/api/leave-requests/${created.id}/withdraw`, {
      method: "POST",
      actingMemberId,
    });
  });

  it("lists mes demandes with statuses for the Acting Member only", async () => {
    const mine = await apiRequest("/api/leave-requests", {
      method: "POST",
      actingMemberId,
      body: { dates: [weekdayPair.monday] },
    });
    expect(mine.status).toBe(201);
    const mineBody = (await mine.json()) as LeaveRequestBody;

    const theirs = await apiRequest("/api/leave-requests", {
      method: "POST",
      actingMemberId: otherMemberId,
      body: { dates: [weekdayPair.tuesday] },
    });
    expect(theirs.status).toBe(201);
    const theirsBody = (await theirs.json()) as LeaveRequestBody;

    const listResponse = await apiRequest("/api/leave-requests", {
      actingMemberId,
    });
    expect(listResponse.status).toBe(200);
    const list = (await listResponse.json()) as ListBody;
    const ids = new Set(list.data.map((request) => request.id));
    expect(ids.has(mineBody.id)).toBe(true);
    expect(ids.has(theirsBody.id)).toBe(false);

    await apiRequest(`/api/leave-requests/${mineBody.id}/withdraw`, {
      method: "POST",
      actingMemberId,
    });
    await apiRequest(`/api/leave-requests/${theirsBody.id}/withdraw`, {
      method: "POST",
      actingMemberId: otherMemberId,
    });
  });

  it("requires an Acting Member to submit or list Leave Requests", async () => {
    const createResponse = await apiRequest("/api/leave-requests", {
      method: "POST",
      body: { dates: [weekdayPair.monday] },
    });
    expect(createResponse.status).toBe(401);

    const listResponse = await apiRequest("/api/leave-requests");
    expect(listResponse.status).toBe(401);
  });

  it("keeps Manager Day Off bypass working (non-regression)", async () => {
    const targetDate = weekdayPair.monday;
    const createResponse = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId: managerId,
      body: { date: targetDate, memberId: otherMemberId },
    });
    expect(createResponse.status).toBe(200);
    expect(await createResponse.json()).toEqual({
      active: true,
      dayOff: expect.objectContaining({
        date: `${targetDate}T00:00:00.000Z`,
        memberId: otherMemberId,
      }),
    });

    const removeResponse = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId: managerId,
      body: { date: targetDate, memberId: otherMemberId },
    });
    expect(removeResponse.status).toBe(200);
    expect(await removeResponse.json()).toEqual({
      active: false,
      dayOff: null,
    });
  });

  it("forbids non-managers from creating Day Offs directly", async () => {
    const response = await apiRequest("/api/days-off/toggle", {
      method: "PUT",
      actingMemberId,
      body: { date: weekdayPair.monday },
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual(
      expect.objectContaining({ code: DAY_OFF_CREATE_FORBIDDEN_CODE }),
    );
  });
});
