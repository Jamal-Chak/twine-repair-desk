import { db, guard, json, requireStaff, rateLimit } from '../../../../lib/server';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  return guard(async () => {
    const user = await requireStaff();
    await rateLimit(req, [
      {
        keySuffix: 'admin:enquiries:ip:min',
        windowMs: 60000,
        maxRequests: 30,
        identifier: (r) => r.headers.get('cf-connecting-ip') || 'unknown',
      },
      {
        keySuffix: 'admin:enquiries:user:min',
        windowMs: 60000,
        maxRequests: 30,
        identifier: (_r, ctx) => ctx?.userId || null,
      },
    ], { userId: user.userId });
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').slice(0, 100);
    const offset = Math.max(0, Math.min(100000, Math.floor(Number(url.searchParams.get('offset')) || 0)));
    const pattern = '%' + q.replace(/[\\%_]/g, '\\$&') + '%';
    const rows = await db().prepare("SELECT * FROM enquiries WHERE name LIKE ? ESCAPE '\\' OR area LIKE ? ESCAPE '\\' OR service LIKE ? ESCAPE '\\' OR id LIKE ? ESCAPE '\\' ORDER BY created_at DESC LIMIT 100 OFFSET ?").bind(pattern, pattern, pattern, pattern, offset).all();
    const counts = await db().prepare('SELECT status,count(*) AS count FROM enquiries GROUP BY status').all();
    return json({ records: rows.results, counts: counts.results, hasMore: rows.results.length === 100, offset });
  });
}
