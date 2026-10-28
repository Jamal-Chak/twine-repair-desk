# TwineEngine Repair Desk

A working single-owner service-enquiry pilot: a customer intake form, D1 persistence, protected staff dashboard, status changes, internal notes, activity history, search and CSV export.

## Current scope
- Requests save in the server database, not localStorage. Failed requests retain form input; retries reuse the request UUID.
- Every staff API checks trusted Sites identity. The configured OWNER_EMAIL bootstraps one permanent owner user ID. Other identities are denied. Never expose this Worker behind an untrusted proxy that permits callers to spoof identity headers.
- Status writes use record versions and a transactional batch to avoid lost updates.
- Input size limits, validation, same-origin mutation checks, honeypot and hourly rate limits protect intake. CSV output escapes cells and neutralises common formula prefixes.
- No automatic email, SMS, WhatsApp, AI answers, payments or booking confirmation. Staff must check the dashboard and contact customers themselves.
- This is a private pilot, not an operational repair company. Use fictional details until a real operator is configured.

## Development
Use Node 22.13+ and the pinned pnpm version. Install with `pnpm install`, then `pnpm db:generate` only after schema changes. Run `node --experimental-transform-types --test tests/domain.test.ts` and `pnpm exec tsc --noEmit`.

Sites uses the supplied build/preview scripts and managed D1 binding `DB`. Keep the Sites integration, worker and scripts. Set OWNER_EMAIL through Sites runtime environment settings; never commit credentials. Build with the Sites build helper. Apply the generated SQL to local D1 before testing. Hosted migrations are applied during deployment. The hosting manifest binds this checkout to the existing Site; cloning the GitHub repository does not automatically deploy it.

## Before real customers
Verify the owner sign-in flow on the hosted gateway, submit an end-to-end enquiry, update it and check it from another session. Configure the actual business identity, service coverage, contact details and privacy notice. Agree retention/deletion handling and test database backup and restore. Set up monitoring and an operational routine or notification provider. Explicitly change site access to public only when intake is ready; staff routes stay owner-only.

No automated data deletion or recovery process has been verified. Export is a convenience, not a complete database backup (it excludes activity history). The dashboard exports at most 10,000 records, lists 100 per page and displays the newest 100 history events per request. Owner replacement requires a controlled database operation. This version supports one business and one owner.
