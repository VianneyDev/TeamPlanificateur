import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CLOUD_RUN_HOSTNAME } from "../../cloud-run-hostname.mjs";
import { startBuiltServer, type BuiltServer } from "./helpers";

const PUBLIC_HOST = CLOUD_RUN_HOSTNAME;
const PUBLIC_ORIGIN = `https://${PUBLIC_HOST}`;

const FORM_HEADERS = {
  "content-type": "application/x-www-form-urlencoded",
} as const;

describe("built server CSRF origin check (logout)", () => {
  let server: BuiltServer | undefined;

  beforeAll(async () => {
    server = await startBuiltServer();
  });

  afterAll(async () => {
    await server?.stop();
  });

  function runningServer(): BuiltServer {
    if (!server) {
      throw new Error("Built server is not running");
    }
    return server;
  }

  it("accepts a browser logout POST whose Origin is https while the process listens on http", async () => {
    const response = await fetch(`${runningServer().baseUrl}/api/logout`, {
      method: "POST",
      redirect: "manual",
      headers: {
        ...FORM_HEADERS,
        origin: PUBLIC_ORIGIN,
        "x-forwarded-proto": "https",
        "x-forwarded-host": PUBLIC_HOST,
      },
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/");
  });

  it("still rejects a form POST whose Origin does not match the forwarded host", async () => {
    const response = await fetch(`${runningServer().baseUrl}/api/logout`, {
      method: "POST",
      redirect: "manual",
      headers: {
        ...FORM_HEADERS,
        origin: "https://evil.example",
        "x-forwarded-proto": "https",
        "x-forwarded-host": PUBLIC_HOST,
      },
    });

    expect(response.status).toBe(403);
    expect(await response.text()).toBe(
      "Cross-site POST form submissions are forbidden",
    );
  });

  it("lets a job POST without Origin reach the handler", async () => {
    const response = await fetch(`${runningServer().baseUrl}/api/jobs/daily-recap`, {
      method: "POST",
      headers: { "content-type": "application/json" },
    });

    expect(response.status).toBe(403);
    expect(response.headers.get("content-type")).toMatch(/application\/json/);
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
  });
});
