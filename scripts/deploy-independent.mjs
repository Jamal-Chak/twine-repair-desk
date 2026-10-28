import {spawnSync} from 'node:child_process';
const id=process.env.D1_DATABASE_ID;
if(!id||! /^[a-f0-9-]{36}$/i.test(id)||id==='00000000-0000-4000-8000-000000000000')throw new Error('Set D1_DATABASE_ID to the independently owned Cloudflare database UUID before deploying.');
for(const args of [['node_modules/vinext/dist/cli.js','build'],['node_modules/wrangler/bin/wrangler.js','deploy','--config','dist/server/wrangler.json']]){const r=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});if(r.status!==0)process.exit(r.status||1)}
