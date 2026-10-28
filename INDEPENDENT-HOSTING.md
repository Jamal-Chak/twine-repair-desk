# Branded login migration — not deployed

This branch replaces the app's ChatGPT identity checks with Supabase email/password authentication. The existing private Sites deployment is unchanged. Deploy this branch on an independent Cloudflare Workers setup to remove the Sites sign-in gateway. Buying a domain alone does not change that gateway.

## Required accounts and settings
1. Create a Supabase project. Disable public signups. Create/confirm the single staff account through the provider's administration flow; the owner sets their own password securely. Copy its immutable user UUID.
2. Configure server-side runtime values: SUPABASE_URL (HTTPS project origin), SUPABASE_PUBLISHABLE_KEY (publishable or legacy anon key, never service-role), OWNER_AUTH_USER_ID (the staff UUID). No password belongs in source, environment settings or chat.
3. Deploy the Vinext worker with an independently owned Cloudflare D1 binding called DB and apply drizzle migrations. Replace Sites-specific build/deployment configuration for the target hosting account. This repository still contains Sites build integration; independent deployment packaging is not complete.
4. Keep `/`, `/privacy`, and intake public. `/login` is the TwineEngine staff page. Every admin API verifies the cookie's token against Supabase and checks the configured staff UUID. Do not place a provider-wide login gate in front of the public form.
5. Use HTTPS. Cookies use the __Host prefix, Secure, HttpOnly and SameSite=Strict. Sessions last at most one hour, with re-login rather than silent refresh. No access or refresh token is stored in browser localStorage. Logout clears this browser's cookie; it does not revoke an already copied access token before its expiry.
6. Test real login, rejected non-staff access, session expiry, logout, enquiry submission, staff edits, exports and database recovery before opening to customers. Migrate any existing records separately and verify counts. Never overwrite the original data during a trial deployment.

## Current limits
Password-reset email flow and automatic notification delivery are not implemented. Use provider administration for staff recovery until a tested recovery flow and branded mail sender are configured. Do not use the old ChatGPT-auth integration test as evidence for this branch: its identity mocks target the previous version. A domain and graphic logo are optional; a text wordmark is already included.
