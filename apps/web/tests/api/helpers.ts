import app from "@/lib/api/app";

export type ApiRequestOptions = {
  method?: string;
  /** Acting Member id; sent as the production `selectedMemberId` cookie. */
  actingMemberId?: string;
  body?: unknown;
  headers?: HeadersInit;
};

/**
 * Call the Hono API the same way Astro does (`app.fetch` / `app.request`),
 * optionally with a `selectedMemberId` cookie.
 */
export function apiRequest(path: string, options: ApiRequestOptions = {}) {
  const headers = new Headers(options.headers);

  if (options.actingMemberId) {
    const existing = headers.get("Cookie");
    const actingCookie = `selectedMemberId=${options.actingMemberId}`;
    headers.set(
      "Cookie",
      existing ? `${existing}; ${actingCookie}` : actingCookie,
    );
  }

  const init: RequestInit = {
    method: options.method ?? "GET",
    headers,
  };

  if (options.body !== undefined) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    init.body = JSON.stringify(options.body);
  }

  return app.request(path, init);
}
