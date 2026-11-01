import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';
import { runInThisContext } from 'node:vm';
import { resolve, dirname } from 'node:path';

const require = createRequire(import.meta.url);

// Set up an in-memory SQLite database with the production schema.
const sql = new DatabaseSync(':memory:');
sql.exec(readFileSync('drizzle/0000_careless_moonstone.sql', 'utf8'));

// Simulated ChatGPT/SIWC identity for staff routes.
const identity = { userId: 'owner', email: 'owner@example.com' };

/** Build a mock Cloudflare environment binding. */
function makeEnv(ownerEmail: string, dbOk: boolean) {
  return {
    OWNER_EMAIL: ownerEmail,
    DB: dbOk
      ? {
          prepare(query: string) {
            const stmt = sql.prepare(query);
            return {
              bind(...args: unknown[]) {
                (stmt as unknown as { bind(...a: unknown[]): void }).bind(...args);
                return this;
              },
              async first() {
                return stmt.get() || null;
              },
              async all() {
                return { results: stmt.all() };
              },
              async run() {
                const r = stmt.run();
                return { meta: { changes: r.changes } };
              },
              async execute() {
                return this.all();
              },
            };
          },
        }
      : undefined,
  };
}

/**
 * Transpile and load a TypeScript module in a VM context with a mocked
 * `cloudflare:workers` binding. Recursively resolves relative imports.
 */
function loadModule(file: string, env: Record<string, unknown>, parentDir?: string) {
  const baseDir = parentDir || process.cwd();
  const resolved = resolve(baseDir, file);
  const code = ts.transpileModule(readFileSync(resolved, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  const mod = { exports: {} };

  function req(name: string) {
    if (name === 'cloudflare:workers') return { env };
    if (name.endsWith('chatgpt-auth')) {
      return { getChatGPTUser: async () => identity };
    }
    if (name.startsWith('.')) {
      const candidate = resolve(dirname(resolved), name);
      try { return loadModule(candidate + '.ts', env, dirname(resolved)); } catch { return loadModule(candidate, env, dirname(resolved)); }
    }
    return require(name);
  }

  runInThisContext(
    '(function(require,module,exports){' + code + '\n})',
    { filename: resolved }
  )(req, mod, mod.exports);
  return mod.exports as { GET: () => Promise<Response> };
}

test('health: returns 200 healthy when database is connected', async () => {
  const env = makeEnv('owner@example.com', true);
  const mod = loadModule('app/api/health/route.ts', env);
  const res = await mod.GET();
  const body = (await res.json()) as {
    status: string;
    timestamp: string;
    database: string;
  };

  assert.equal(res.status, 200);
  assert.equal(body.status, 'healthy');
  assert.equal(body.database, 'connected');
  assert.ok(body.timestamp, 'timestamp should be present');
  assert.ok(Date.parse(body.timestamp), 'timestamp should be a valid ISO string');
});

test('health: returns 503 unhealthy when database binding is missing', async () => {
  const env = makeEnv('owner@example.com', false);
  const mod = loadModule('app/api/health/route.ts', env);
  const res = await mod.GET();
  const body = (await res.json()) as {
    status: string;
    error: string;
  };

  assert.equal(res.status, 503);
  assert.equal(body.status, 'unhealthy');
  assert.ok(body.error, 'error message should be present');
});
