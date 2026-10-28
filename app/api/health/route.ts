import {db,guard,json} from '../../../lib/server';
export const dynamic='force-dynamic';
export async function GET(){return guard(async()=>{await db().prepare('SELECT id FROM enquiries LIMIT 1').first();return json({status:'ok'})})}
