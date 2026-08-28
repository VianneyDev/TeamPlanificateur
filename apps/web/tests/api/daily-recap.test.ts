import { describe, expect, it } from "vitest";
import { apiRequest } from "./helpers";

describe("Daily recap job", () => {
  it("rejects missing or invalid recap token", async () => {
    const missing = await apiRequest("/api/jobs/daily-recap", {
      method: "POST",
    });
    expect(missing.status).toBe(403);

    const invalid = await apiRequest("/api/jobs/daily-recap", {
      method: "POST",
      headers: { "x-recap-token": "not-the-token" },
    });
    expect(invalid.status).toBe(403);
  });
});
