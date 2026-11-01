export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  ts: string;
  message: string;
  [key: string]: unknown;
}

/** Emit one structured JSON log line. Safe to call in worker and preview contexts. */
export function log(level: LogLevel, message: string, args: Record<string, unknown> = {}): void {
  const entry: LogEntry = { level, ts: new Date().toISOString(), message, ...args };

  try {
    console.log(JSON.stringify(entry));
  } catch {
    // No usable output stream in this context; the log line is dropped.
  }
}

/** Log an unexpected error with useful context for operational triage. */
export function logError(
  message: string,
  error: unknown,
  args: Record<string, unknown> = {},
): void {
  log("error", message, {
    ...args,
    error:
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : String(error),
  });
}
