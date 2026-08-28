import { afterEach, describe, expect, it } from "vitest";
import { apiRequest } from "./helpers";
import { isWeekendDate } from "@/lib/day-off-range";

const VALID_TOKEN = "test-demo-reset-token";

type TeamRow = {
  id: string;
  name: string;
  archived: boolean;
};

type MemberRow = {
  id: string;
  name: string;
  role: string;
  isExternal: boolean;
  archived: boolean;
  teams: { id: string; name: string; archived: boolean }[];
};

type Paginated<T> = {
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
};

type ResetBody = {
  ok: boolean;
  teams: number;
  members: number;
  leaveRequests: number;
  leaveRequestDates: number;
  daysOff: number;
  monthlyWorkedDays: number;
};

type LeaveRequestRow = {
  id: string;
  memberId: string;
  status: string;
  dates: { date: string }[];
};

function restoreEnv(
  key: "DEMO_RESET_ENABLED" | "DEMO_RESET_TOKEN",
  previous: string | undefined,
) {
  if (previous === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = previous;
  }
}

function enableReset() {
  process.env.DEMO_RESET_ENABLED = "true";
  process.env.DEMO_RESET_TOKEN = VALID_TOKEN;
}

function resetRequest() {
  return apiRequest("/api/jobs/reset-demo", {
    method: "POST",
    headers: { "x-demo-reset-token": VALID_TOKEN },
  });
}

async function listMembers(): Promise<MemberRow[]> {
  const response = await apiRequest("/api/members?status=all&limit=200");
  expect(response.status).toBe(200);
  return ((await response.json()) as Paginated<MemberRow>).data;
}

async function listTeams(): Promise<TeamRow[]> {
  const response = await apiRequest("/api/teams?status=all&limit=200");
  expect(response.status).toBe(200);
  return ((await response.json()) as Paginated<TeamRow>).data;
}

function directorySnapshot(members: MemberRow[], teams: TeamRow[]) {
  return {
    teams: teams
      .map((team) => ({ name: team.name, archived: team.archived }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    members: members
      .map((member) => ({
        name: member.name,
        role: member.role,
        isExternal: member.isExternal,
        archived: member.archived,
        teams: member.teams.map((team) => team.name).sort(),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

describe("POST /api/jobs/reset-demo", () => {
  const previousEnabled = process.env.DEMO_RESET_ENABLED;
  const previousToken = process.env.DEMO_RESET_TOKEN;

  afterEach(() => {
    restoreEnv("DEMO_RESET_ENABLED", previousEnabled);
    restoreEnv("DEMO_RESET_TOKEN", previousToken);
  });

  it("returns 403 when DEMO_RESET_ENABLED is not true, even with a valid token", async () => {
    delete process.env.DEMO_RESET_ENABLED;
    process.env.DEMO_RESET_TOKEN = VALID_TOKEN;

    const response = await apiRequest("/api/jobs/reset-demo", {
      method: "POST",
      headers: { "x-demo-reset-token": VALID_TOKEN },
    });

    expect(response.status).toBe(403);
  });

  it("returns 403 when the token is missing", async () => {
    process.env.DEMO_RESET_ENABLED = "true";
    process.env.DEMO_RESET_TOKEN = VALID_TOKEN;

    const response = await apiRequest("/api/jobs/reset-demo", {
      method: "POST",
    });

    expect(response.status).toBe(403);
  });

  it("returns 403 when the token is incorrect", async () => {
    process.env.DEMO_RESET_ENABLED = "true";
    process.env.DEMO_RESET_TOKEN = VALID_TOKEN;

    const response = await apiRequest("/api/jobs/reset-demo", {
      method: "POST",
      headers: { "x-demo-reset-token": "not-the-token" },
    });

    expect(response.status).toBe(403);
  });

  it("wipes preexisting data and recreates a demonstrative dataset", async () => {
    enableReset();

    const marker = `wipe-me-${Date.now()}`;
    const created = await apiRequest("/api/teams", {
      method: "POST",
      body: { name: marker },
    });
    expect(created.status).toBe(201);

    const response = await resetRequest();
    expect(response.status).toBe(200);
    const body = (await response.json()) as ResetBody;
    expect(body.ok).toBe(true);
    expect(body.teams).toBeGreaterThanOrEqual(3);
    expect(body.members).toBeGreaterThan(10);
    expect(body.leaveRequests).toBeGreaterThanOrEqual(1);
    expect(body.leaveRequestDates).toBeGreaterThanOrEqual(1);
    expect(body.daysOff).toBeGreaterThanOrEqual(1);
    expect(body.monthlyWorkedDays).toBeGreaterThanOrEqual(1);

    const teams = await listTeams();
    expect(teams.some((team) => team.name === marker)).toBe(false);

    const members = await listMembers();
    expect(members).toHaveLength(body.members);
    expect(members.some((member) => member.isExternal && !member.archived)).toBe(
      true,
    );

    const activePage = await apiRequest("/api/members?status=active&limit=10");
    expect(activePage.status).toBe(200);
    const activeBody = (await activePage.json()) as Paginated<MemberRow>;
    expect(activeBody.pagination.total).toBeGreaterThan(10);
    expect(activeBody.pagination.totalPages).toBeGreaterThan(1);

    const manager = members.find(
      (member) => member.role === "manager" && !member.archived,
    );
    expect(manager).toBeDefined();

    const pendingResponse = await apiRequest(
      "/api/leave-requests?status=pending",
      { actingMemberId: manager!.id },
    );
    expect(pendingResponse.status).toBe(200);
    const pending = (await pendingResponse.json()) as { data: LeaveRequestRow[] };
    expect(pending.data.length).toBeGreaterThanOrEqual(1);

    const today = new Date().toISOString().slice(0, 10);
    for (const request of pending.data) {
      for (const entry of request.dates) {
        const date = entry.date.slice(0, 10);
        expect(date > today).toBe(true);
        expect(isWeekendDate(date)).toBe(false);
      }
    }

    const workedResponse = await apiRequest("/api/monthly-worked-days", {
      actingMemberId: manager!.id,
    });
    expect(workedResponse.status).toBe(200);
    const worked = (await workedResponse.json()) as { data: unknown[] };
    expect(worked.data.length).toBe(body.monthlyWorkedDays);
  });

  it("is idempotent across consecutive runs", async () => {
    enableReset();

    const firstResponse = await resetRequest();
    expect(firstResponse.status).toBe(200);
    const first = (await firstResponse.json()) as ResetBody;
    expect(first.ok).toBe(true);
    expect(first.members).toBeGreaterThan(10);
    expect(first.teams).toBeGreaterThanOrEqual(3);
    const firstSnapshot = directorySnapshot(
      await listMembers(),
      await listTeams(),
    );

    const secondResponse = await resetRequest();
    expect(secondResponse.status).toBe(200);
    const second = (await secondResponse.json()) as ResetBody;
    expect(second).toEqual(first);
    expect(
      directorySnapshot(await listMembers(), await listTeams()),
    ).toEqual(firstSnapshot);
  });

  it("keeps every active Member on at least one non-archived Team", async () => {
    enableReset();

    const response = await resetRequest();
    expect(response.status).toBe(200);
    const body = (await response.json()) as ResetBody;
    expect(body.members).toBeGreaterThan(10);

    const members = await listMembers();
    expect(members).toHaveLength(body.members);
    const active = members.filter((member) => !member.archived);
    expect(active.length).toBeGreaterThan(0);

    for (const member of active) {
      expect(
        member.teams.some((team) => !team.archived),
        `${member.name} has no non-archived Team`,
      ).toBe(true);
    }
  });
});
