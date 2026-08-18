export type ApiErrorBody = {
  error?: string;
  code?: string;
};

export class ApiError extends Error {
  readonly code?: string;
  readonly status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function throwIfNotOk(
  response: Response,
  fallback: string,
): Promise<void> {
  if (response.ok) return;

  let message = fallback;
  let code: string | undefined;

  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.error === "string" && body.error.length > 0) {
      message = body.error;
    }
    if (typeof body.code === "string") {
      code = body.code;
    }
  } catch {
    // keep fallback
  }

  throw new ApiError(message, response.status, code);
}
