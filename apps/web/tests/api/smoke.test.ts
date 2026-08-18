import { describe, expect, it } from "vitest";
import { apiRequest } from "./helpers";

describe("Hono API smoke", () => {
  it("lists members over HTTP, with or without Acting Member cookie", async () => {
    const anonymous = await apiRequest("/api/members");
    expect(anonymous.status).toBe(200);

    const asActingMember = await apiRequest("/api/members", {
      actingMemberId: "acting-member-smoke",
    });
    expect(asActingMember.status).toBe(200);
    expect(asActingMember.headers.get("content-type")).toMatch(
      /application\/json/,
    );

    const body = await asActingMember.json();
    expect(body).toEqual(
      expect.objectContaining({
        data: expect.any(Array),
        pagination: expect.objectContaining({
          total: expect.any(Number),
          page: 1,
          limit: 10,
          totalPages: expect.any(Number),
        }),
      }),
    );
  });
});
