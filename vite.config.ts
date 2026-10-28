import vinext from 'vinext';
import {defineConfig} from 'vite';
import {cloudflare} from '@cloudflare/vite-plugin';
import publicSettings from './deployment.public.json';
export default defineConfig({plugins:[vinext(),cloudflare({viteEnvironment:{name:'rsc',childEnvironments:['ssr']},inspectorPort:false,config:{name:'twine-repair-desk',main:'./worker/independent.ts',compatibility_date:'2026-05-15',compatibility_flags:['nodejs_compat'],vars:publicSettings,d1_databases:[{binding:'DB',database_name:'twine-repair-desk',database_id:process.env.D1_DATABASE_ID||'00000000-0000-4000-8000-000000000000'}]}})]});
