# TwineEngine Repair Desk

A single-owner service enquiry pilot with public intake, D1 persistence, a protected staff dashboard, status changes, internal notes, activity history, search, and CSV export.

## Scope and safeguards

- Staff APIs validate the trusted Sites identity. `OWNER_EMAIL` bootstraps one permanent owner identity; all other identities are denied. Do not put the Worker behind a proxy that lets callers spoof identity headers.
- Intake validates inputs, checks same-origin mutations, uses a honeypot, and applies per-IP and per-email rate limits. Status updates use record versions and a database batch to avoid lost updates.
- CSV cells are quoted and common formula prefixes are neutralized.
- The app does not send email, SMS, or WhatsApp messages, confirm bookings, or process payments. Staff must check the dashboard and contact customers.
- This is a pilot, not an operational repair company. Use fictional details until a real operator has approved the service and privacy information.

## Development

Use Node 22.13+ and the pinned pnpm version. Install with `pnpm install`. The repository's CI workflow runs typecheck, lint, unit and integration tests, then a production build.

Keep the Sites integration, worker, and scripts. Set `OWNER_EMAIL` through the connected Site's runtime environment; never commit credentials. The hosting manifest binds this checkout to the existing Site and managed D1 database. Cloning the repository does not deploy it. Local database setup and hosted migrations should follow the connected Sites workflow.

## Before launch

Configure the real business identity, service coverage, contact details, and privacy notice. Agree a retention and deletion process, test database backup and restore, and set up monitoring for `/api/health`. Confirm who checks new enquiries and how they follow up. Make the Site public only after the operator has approved intake; staff APIs remain owner-only.

There is no automatic record deletion schedule. CSV export excludes activity history and is not a database backup. The dashboard lists 100 records per page, exports at most 10,000 records, and shows the newest 100 events per enquiry. The system supports one business and one permanently bound owner.

See [PRODUCTION-READINESS.md](PRODUCTION-READINESS.md) for the launch checklist and current limits.

## Response security

The Worker adds `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`, plus HSTS on HTTPS requests. Frame restrictions and a strict Content Security Policy are omitted because the app runs in an embedded Sites environment and its framework hydration needs a compatible policy.
