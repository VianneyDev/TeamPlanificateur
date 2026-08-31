import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const entryPath = path.join(appRoot, "dist/server/entry.mjs");

const DUMMY_DATABASE_URL =
  "postgresql://ci:ci@127.0.0.1:5432/ci?sslmode=disable";

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not allocate a TCP port"));
        return;
      }
      const { port } = address;
      server.close((err) => (err ? reject(err) : resolve(port)));
    });
    server.on("error", reject);
  });
}

export type BuiltServer = {
  baseUrl: string;
  stop: () => Promise<void>;
};

/**
 * Start the compiled Astro Node server (`dist/server/entry.mjs`).
 * This is the seam that applies CSRF origin checking; Hono `app.request` does not.
 */
export async function startBuiltServer(): Promise<BuiltServer> {
  if (!existsSync(entryPath)) {
    throw new Error(
      `Missing ${entryPath}. Run pnpm --filter eccentric-equinox build before tests/ssr.`,
    );
  }

  const port = await getFreePort();
  const child: ChildProcess = spawn(process.execPath, [entryPath], {
    cwd: appRoot,
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
      NODE_ENV: "production",
      DATABASE_URL: process.env.DATABASE_URL || DUMMY_DATABASE_URL,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const stderrChunks: string[] = [];
  child.stderr?.on("data", (chunk: Buffer | string) => {
    stderrChunks.push(String(chunk));
  });

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(
        new Error(
          `Built server did not start on port ${port}. stderr:\n${stderrChunks.join("")}`,
        ),
      );
    }, 30_000);

    const onExit = (code: number | null) => {
      clearTimeout(timeout);
      reject(
        new Error(
          `Built server exited with code ${code} before listening. stderr:\n${stderrChunks.join("")}`,
        ),
      );
    };

    child.once("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
    child.once("exit", onExit);

    child.stdout?.on("data", (chunk: Buffer | string) => {
      if (String(chunk).includes("Server listening")) {
        clearTimeout(timeout);
        child.off("exit", onExit);
        resolve();
      }
    });
  });

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    stop: () =>
      new Promise((resolve, reject) => {
        child.once("exit", () => resolve());
        child.once("error", reject);
        child.kill("SIGTERM");
      }),
  };
}
