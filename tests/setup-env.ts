import { existsSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envTestPath = path.join(root, ".env.test");
const envDevPath = path.join(root, ".env");

/**
 * Load the Neon test-branch URL before any test imports `@/lib/db`.
 * `override: true` wins over a pre-existing shell DATABASE_URL and over
 * later `import "dotenv/config"` in db.ts (which does not override).
 */
if (!existsSync(envTestPath)) {
  throw new Error(
    "Missing .env.test. Copy .env.test.example and set DATABASE_URL to your dedicated Neon test branch.",
  );
}

const loaded = loadEnv({ path: envTestPath, override: true });
if (loaded.error) {
  throw loaded.error;
}

if (!process.env.DATABASE_URL) {
  throw new Error(".env.test must define DATABASE_URL");
}

/**
 * Neon pooler vs direct endpoints for the same branch differ by a `-pooler`
 * hostname segment. Compare on the branch endpoint id so either form still
 * catches a mis-pointed .env.test.
 */
function neonEndpointId(hostname: string): string {
  return hostname.replace(/-pooler(?=\.)/, "").split(".")[0] ?? hostname;
}

/** Refuse to run if the test URL targets the same Neon endpoint as local .env (dev). */
if (existsSync(envDevPath)) {
  const devEnv: Record<string, string> = {};
  loadEnv({ path: envDevPath, processEnv: devEnv });
  const devUrl = devEnv.DATABASE_URL;
  if (devUrl) {
    const testId = neonEndpointId(new URL(process.env.DATABASE_URL).hostname);
    const devId = neonEndpointId(new URL(devUrl).hostname);
    if (testId === devId) {
      throw new Error(
        "Refusing to run tests: .env.test DATABASE_URL targets the same Neon endpoint as .env (dev). " +
          "Point .env.test at a dedicated Neon test branch so the suite cannot pollute Gestion.",
      );
    }
  }
}
