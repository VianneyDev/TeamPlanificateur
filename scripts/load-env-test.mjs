import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const envTestPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.env.test",
);

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
