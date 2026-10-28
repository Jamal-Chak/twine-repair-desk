import {guard,json,requireStaff} from '../../../../lib/server';
export const dynamic='force-dynamic';
export async function GET(){return guard(async()=>{const u=await requireStaff();return json({name:u.displayName,email:u.email})})}
