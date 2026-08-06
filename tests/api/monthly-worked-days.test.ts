import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { apiRequest } from "./helpers";

type MemberBody = {
  id: string;
  name: string;
  role: string;
  isExternal: boolean;
};

type MonthlyWorkedDaysBody = {
  id: string;
  memberId: string;
  year: number;
  month: number;
  days: number;
};

type ListBody = {
  data: MonthlyWorkedDaysBody[];
};

function currentYearMonth(now = new Date()) {
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function pastYearMonth(now = new Date()) {
  const { year, month } = currentYearMonth(now);
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

function futureYearMonth(now = new Date()) {
  const { year, month } = currentYearMonth(now);
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

describe("Monthly Worked Days API", () => {
  const suffix = `mwd-${Date.now()}`;
  const now = new Date();
  const past = pastYearMonth(now);
  const current = currentYearMonth(now);
  const future = futureYearMonth(now);

  let teamId: string;
  let externalMemberId: string;
  let otherExternalId: string;
  let internalMemberId: string;
  let managerId: string;
  let managerExternalId: string;

  beforeAll(async () => {
    const teamRes = await apiRequest("/api/teams", {
      method: "POST",
      body: { name: `${suffix}-team` },
    });
    expect(teamRes.status).toBe(201);
    teamId = (await teamRes.json()).id;

    const createMember = async (body: Record<string, unknown>) => {
      const res = await apiRequest("/api/members", {
        method: "POST",
        body: { teamIds: [teamId], ...body },
      });
      expect(res.status).toBe(201);
      return (await res.json()) as MemberBody;
    };

    externalMemberId = (
      await createMember({
        name: `${suffix}-external`,
        role: "member",
        isExternal: true,
      })
    ).id;

    otherExternalId = (
      await createMember({
        name: `${suffix}-other-external`,
        role: "member",
        isExternal: true,
      })
    ).id;

    internalMemberId = (
      await createMember({
        name: `${suffix}-internal`,
        role: "member",
        isExternal: false,
      })
    ).id;

    managerId = (
      await createMember({
        name: `${suffix}-manager`,
        role: "manager",
        isExternal: false,
      })
    ).id;

    managerExternalId = (
      await createMember({
        name: `${suffix}-manager-external`,
        role: "manager",
        isExternal: true,
      })
    ).id;
  });

  afterAll(async () => {
    for (const id of [
      externalMemberId,
      otherExternalId,
      internalMemberId,
      managerId,
      managerExternalId,
    ]) {
      if (id) {
        await apiRequest(`/api/members/${id}/archive`, { method: "POST" });
      }
    }
  });

  it("lets an External Member upsert their own past-month declaration", async () => {
    const putRes = await apiRequest("/api/monthly-worked-days", {
      method: "PUT",
      actingMemberId: externalMemberId,
      body: {
        memberId: externalMemberId,
        year: past.year,
        month: past.month,
        days: 12,
      },
    });

    expect(putRes.status).toBe(200);
    const saved = (await putRes.json()) as MonthlyWorkedDaysBody;
    expect(saved).toEqual(
      expect.objectContaining({
        memberId: externalMemberId,
        year: past.year,
        month: past.month,
        days: 12,
      }),
    );

    const listRes = await apiRequest("/api/monthly-worked-days", {
      actingMemberId: externalMemberId,
    });
    expect(listRes.status).toBe(200);
    const list = (await listRes.json()) as ListBody;
    expect(
      list.data.some(
        (row) =>
          row.memberId === externalMemberId &&
          row.year === past.year &&
          row.month === past.month &&
          row.days === 12,
      ),
    ).toBe(true);
  });

  it("allows the current calendar month", async () => {
    const putRes = await apiRequest("/api/monthly-worked-days", {
      method: "PUT",
      actingMemberId: externalMemberId,
      body: {
        memberId: externalMemberId,
        year: current.year,
        month: current.month,
        days: 8,
      },
    });

    expect(putRes.status).toBe(200);
    const saved = (await putRes.json()) as MonthlyWorkedDaysBody;
    expect(saved.days).toBe(8);
    expect(saved.year).toBe(current.year);
    expect(saved.month).toBe(current.month);
  });

  it("rejects future months", async () => {
    const putRes = await apiRequest("/api/monthly-worked-days", {
      method: "PUT",
      actingMemberId: externalMemberId,
      body: {
        memberId: externalMemberId,
        year: future.year,
        month: future.month,
        days: 10,
      },
    });

    expect(putRes.status).toBe(400);
    const body = await putRes.json();
    expect(body).toEqual(
      expect.objectContaining({
        code: "FUTURE_MONTH_NOT_ALLOWED",
      }),
    );
  });

  it("rejects Monthly Worked Days for a non-external Member", async () => {
    const putRes = await apiRequest("/api/monthly-worked-days", {
      method: "PUT",
      actingMemberId: managerId,
      body: {
        memberId: internalMemberId,
        year: past.year,
        month: past.month,
        days: 5,
      },
    });

    expect(putRes.status).toBe(400);
    const body = await putRes.json();
    expect(body).toEqual(
      expect.objectContaining({
        code: "MEMBER_NOT_EXTERNAL",
      }),
    );
  });

  it("forbids a non-Manager from reading or writing another Member's counts", async () => {
    await apiRequest("/api/monthly-worked-days", {
      method: "PUT",
      actingMemberId: otherExternalId,
      body: {
        memberId: otherExternalId,
        year: past.year,
        month: past.month,
        days: 3,
      },
    });

    const putRes = await apiRequest("/api/monthly-worked-days", {
      method: "PUT",
      actingMemberId: externalMemberId,
      body: {
        memberId: otherExternalId,
        year: past.year,
        month: past.month,
        days: 7,
      },
    });
    expect(putRes.status).toBe(403);

    const listRes = await apiRequest(
      `/api/monthly-worked-days?memberId=${otherExternalId}`,
      { actingMemberId: externalMemberId },
    );
    expect(listRes.status).toBe(403);

    const ownListRes = await apiRequest("/api/monthly-worked-days", {
      actingMemberId: externalMemberId,
    });
    expect(ownListRes.status).toBe(200);
    const ownList = (await ownListRes.json()) as ListBody;
    expect(ownList.data.every((row) => row.memberId === externalMemberId)).toBe(
      true,
    );
    expect(ownList.data.some((row) => row.memberId === otherExternalId)).toBe(
      false,
    );
  });

  it("lets a Manager correct any External Member's declaration", async () => {
    const putRes = await apiRequest("/api/monthly-worked-days", {
      method: "PUT",
      actingMemberId: managerId,
      body: {
        memberId: externalMemberId,
        year: past.year,
        month: past.month,
        days: 20,
      },
    });

    expect(putRes.status).toBe(200);
    const saved = (await putRes.json()) as MonthlyWorkedDaysBody;
    expect(saved.days).toBe(20);

    const listRes = await apiRequest(
      `/api/monthly-worked-days?memberId=${externalMemberId}`,
      { actingMemberId: managerId },
    );
    expect(listRes.status).toBe(200);
    const list = (await listRes.json()) as ListBody;
    expect(
      list.data.some(
        (row) =>
          row.memberId === externalMemberId &&
          row.year === past.year &&
          row.month === past.month &&
          row.days === 20,
      ),
    ).toBe(true);
  });

  it("lets a Manager External manage their own declarations", async () => {
    const putRes = await apiRequest("/api/monthly-worked-days", {
      method: "PUT",
      actingMemberId: managerExternalId,
      body: {
        memberId: managerExternalId,
        year: past.year,
        month: past.month,
        days: 15,
      },
    });

    expect(putRes.status).toBe(200);
    const saved = (await putRes.json()) as MonthlyWorkedDaysBody;
    expect(saved).toEqual(
      expect.objectContaining({
        memberId: managerExternalId,
        days: 15,
      }),
    );
  });

  it("lets a Manager External correct another External Member's declaration", async () => {
    const putRes = await apiRequest("/api/monthly-worked-days", {
      method: "PUT",
      actingMemberId: managerExternalId,
      body: {
        memberId: otherExternalId,
        year: past.year,
        month: past.month,
        days: 9,
      },
    });

    expect(putRes.status).toBe(200);
    const saved = (await putRes.json()) as MonthlyWorkedDaysBody;
    expect(saved).toEqual(
      expect.objectContaining({
        memberId: otherExternalId,
        days: 9,
      }),
    );
  });

  it("rejects Monthly Worked Days for an Archived External Member", async () => {
    const archivedRes = await apiRequest("/api/members", {
      method: "POST",
      body: {
        name: `${suffix}-archived-external`,
        role: "member",
        teamIds: [teamId],
        isExternal: true,
      },
    });
    expect(archivedRes.status).toBe(201);
    const archivedId = ((await archivedRes.json()) as MemberBody).id;

    const archiveRes = await apiRequest(`/api/members/${archivedId}/archive`, {
      method: "POST",
    });
    expect(archiveRes.status).toBe(200);

    const putRes = await apiRequest("/api/monthly-worked-days", {
      method: "PUT",
      actingMemberId: managerId,
      body: {
        memberId: archivedId,
        year: past.year,
        month: past.month,
        days: 4,
      },
    });

    expect(putRes.status).toBe(400);
    const body = await putRes.json();
    expect(body).toEqual(
      expect.objectContaining({
        code: "MEMBER_ARCHIVED",
      }),
    );
  });

  it("requires an Acting Member", async () => {
    const putRes = await apiRequest("/api/monthly-worked-days", {
      method: "PUT",
      body: {
        memberId: externalMemberId,
        year: past.year,
        month: past.month,
        days: 1,
      },
    });
    expect(putRes.status).toBe(401);

    const listRes = await apiRequest("/api/monthly-worked-days");
    expect(listRes.status).toBe(401);
  });
});
