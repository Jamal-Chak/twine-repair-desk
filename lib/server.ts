import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
import { HttpError } from './domain';
import { logError } from './logger';
import { requiredEnv } from './env';
export function db(){if(!env.DB)throw new HttpError(503,'Storage is temporarily unavailable.');return env.DB}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export async function guard(fn:()=>Promise<Response>){try{return await fn()}catch(e){if(e instanceof HttpError)return json({error:e.message},e.status);logError('Repair Desk request failed', e, { status: e instanceof HttpError ? e.status : undefined });return json({error:'Something went wrong. Please try again shortly.'},503)}}
export function origin(req:Request){const value=req.headers.get('Origin');if(!value||value!==new URL(req.url).origin)throw new HttpError(403,'Request origin is not allowed.');if(req.headers.get('Sec-Fetch-Site')==='cross-site')throw new HttpError(403,'Cross-site requests are not allowed.')}
export async function body(req:Request){if(!req.headers.get('Content-Type')?.startsWith('application/json'))throw new HttpError(415,'JSON content is required.');const reader=req.body?.getReader();if(!reader)throw new HttpError(400,'Request body is required.');let size=0;const chunks:Uint8Array[]=[];while(true){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>16384){await reader.cancel();throw new HttpError(413,'Request is too large.')}chunks.push(r.value)}const data=new Uint8Array(size);let offset=0;for(const c of chunks){data.set(c,offset);offset+=c.length}try{return JSON.parse(new TextDecoder().decode(data))}catch{throw new HttpError(400,'Invalid JSON.')}}
export async function requireStaff(){const user=await getChatGPTUser();if(!user)throw new HttpError(401,'Sign in to access the staff dashboard.');const existing=await db().prepare("SELECT user_id FROM staff WHERE role='owner'").first<{user_id:string}>();if(existing){if(existing.user_id!==user.userId)throw new HttpError(403,'Your account does not have staff access.');return user}
 const ownerEmail = requiredEnv('OWNER_EMAIL');
 if (user.email.toLowerCase() !== ownerEmail.toLowerCase()) throw new HttpError(403, 'Your account does not have staff access.');
 await db().prepare("INSERT OR IGNORE INTO staff(role,user_id,created_at) VALUES('owner',?,?)").bind(user.userId,new Date().toISOString()).run();const bound=await db().prepare("SELECT user_id FROM staff WHERE role='owner'").first<{user_id:string}>();if(bound?.user_id!==user.userId)throw new HttpError(403,'Your account does not have staff access.');return user;
}
export interface RateLimitCtx {
  email?: string;
  userId?: string;
}

export interface RateLimitRule {
  keySuffix: string;
  windowMs: number;
  maxRequests: number;
  identifier: (req: Request, ctx?: RateLimitCtx) => string | null;
}

export async function rateLimit(
  req: Request,
  rules: RateLimitRule[],
  ctx?: RateLimitCtx,
): Promise<void> {
  const now = Date.now();

  const hash = async (s: string) =>
    Array.from(
      new Uint8Array(
        await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
      )
    )
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('');

  const checks: Array<{ key: string; max: number }> = [];

  for (const rule of rules) {
    const window = Math.floor(now / rule.windowMs);
    const identifier = await rule.identifier(req, ctx);
    if (!identifier) continue;
    const hashed = await hash(identifier);
    checks.push({
      key: `${rule.keySuffix}:${window}:${hashed}`,
      max: rule.maxRequests,
    });
  }

  if (checks.length === 0) return;

  const expiry = now + 7200000;

  const results = await db().batch(
    checks.map((k) =>
      db()
        .prepare(
          'INSERT INTO rate_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count'
        )
        .bind(k.key, expiry)
    )
  );

  // Avoid adding a global cleanup write to every API request.
  if (Math.random() < 0.01) {
    await db().prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(now).run();
  }

  if (
    results.some(
      (r, i) => Number((r.results[0] as { count?: number })?.count) > checks[i].max
    )
  ) {
    throw new HttpError(429, 'Too many requests. Please try again later.');
  }
}
