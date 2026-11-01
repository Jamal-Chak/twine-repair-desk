import { body, db, guard, json, origin, rateLimit } from '../../../lib/server';
import { validateEnquiry } from '../../../lib/domain';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  return guard(async () => {
    origin(req);
    const data = validateEnquiry(await body(req));
    await rateLimit(req, [
      {
        keySuffix: 'enquiries:ip:min',
        windowMs: 60000,
        maxRequests: 3,
        identifier: (r) => r.headers.get('cf-connecting-ip') || 'unknown',
      },
      {
        keySuffix: 'enquiries:ip:hour',
        windowMs: 3600000,
        maxRequests: 15,
        identifier: (r) => r.headers.get('cf-connecting-ip') || 'unknown',
      },
      {
        keySuffix: 'enquiries:email:hour',
        windowMs: 3600000,
        maxRequests: 5,
        identifier: (_r, ctx) => ctx?.email || null,
      },
    ], { email: data.email });
    const now = new Date().toISOString();
    await db().prepare("INSERT OR IGNORE INTO enquiries(id,name,phone,email,area,service,description,status,created_at,updated_at,version) VALUES(?,?,?,?,?,?,?,'New',?,?,1)").bind(data.id,data.name,data.phone,data.email,data.area,data.service,data.description,now,now).run();
    return json({ id: data.id, reference: data.id }, 201);
  });
}
