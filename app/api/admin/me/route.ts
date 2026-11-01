import { guard, json, requireStaff, rateLimit } from '../../../../lib/server';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  return guard(async () => {
    const u = await requireStaff();
    await rateLimit(req, [
      {
        keySuffix: 'admin:me:ip:min',
        windowMs: 60000,
        maxRequests: 60,
        identifier: (r) => r.headers.get('cf-connecting-ip') || 'unknown',
      },
      {
        keySuffix: 'admin:me:user:min',
        windowMs: 60000,
        maxRequests: 60,
        identifier: (_r, ctx) => ctx?.userId || null,
      },
    ], { userId: u.userId });
    return json({ name: u.displayName, email: u.email });
  });
}
