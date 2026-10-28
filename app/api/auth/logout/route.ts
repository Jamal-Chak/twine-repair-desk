import {guard,json,origin} from '../../../../lib/server';
import {sessionHeader} from '../../../../lib/staff-auth';
export async function POST(req:Request){return guard(async()=>{origin(req);const res=json({ok:true});res.headers.set('Set-Cookie',sessionHeader('',0));return res})}
