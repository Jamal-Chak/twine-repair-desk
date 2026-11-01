import { db, json } from '../../../lib/server';
import { logError } from '../../../lib/logger';
import { requiredEnv } from '../../../lib/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    requiredEnv('OWNER_EMAIL');
    const database = db();
    // Check tables used by the application, not just whether D1 responds.
    await database.batch([
      database.prepare('SELECT id FROM enquiries LIMIT 1'),
      database.prepare('SELECT id FROM events LIMIT 1'),
      database.prepare('SELECT role FROM staff LIMIT 1'),
      database.prepare('SELECT key FROM rate_limits LIMIT 1'),
    ]);
    return json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'ready',
    });
  } catch (e) {
    logError('Health check failed', e);
    return json(
      {
        status: 'unhealthy',
        message: 'The service is temporarily unavailable.',
      },
      503
    );
  }
}
