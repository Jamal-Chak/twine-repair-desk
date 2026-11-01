import { env } from "cloudflare:workers";
import { HttpError } from "./domain";

/**
 * Read a required configuration value. Production deployments must set these
 * through the hosting runtime environment (e.g. OWNER_EMAIL); the D1 `DB`
 * binding is supplied via .openai/hosting.json and the generated wrangler.json.
 * Failing fast here is preferable to opaque authorization failures at request time.
 */
export function requiredEnv(name: string): string {
  const value =
    (env as unknown as Record<string, unknown> | undefined)?.[name] ??
    process.env[name];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(503, `Service is not configured: ${name} is missing.`);
  }
  return value.trim();
}
