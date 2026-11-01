# Production launch checklist

The code supports a single-owner service-enquiry pilot. A production launch is not complete until the hosted Site, business details, privacy terms, and recovery process have been confirmed by the operator.

## Runtime setup

- Set `OWNER_EMAIL` in the connected Site's runtime environment to the owner's ChatGPT account email. The first successful owner sign-in binds that identity permanently in the `staff` table.
- Confirm the hosting configuration binds the managed D1 database as `DB`; do not create a separate database or deploy this project with a generic Pages command. This repository is connected to an existing Site through `.openai/hosting.json`.
- Confirm the database has the schema in `drizzle/0000_careless_moonstone.sql`. The health route checks all application tables and returns `503` when storage or schema is unavailable.
- Keep the Site owner-only until the intake workflow is ready. Public intake is appropriate only after the business operator has approved the form and privacy text.

## Before accepting real enquiries

- Replace the pilot copy with the real business name, contact channel, service area, and service descriptions.
- Have the business operator review the privacy notice, retention period, deletion workflow, and applicable local privacy requirements. Records currently have no automatic deletion schedule.
- Verify the owner sign-in and a complete enquiry, review, status update, note, and CSV export on the hosted Site.
- Confirm the hosting provider's D1 backup and restore procedure, and perform a restore rehearsal. CSV export excludes activity history and is not a backup.
- Configure an external uptime monitor for `/api/health`; alert on non-200 responses. Review platform logs for errors.
- Agree who checks new enquiries and how quickly they respond. The app does not send notifications or confirm bookings.

## Current limits

- Owner access: one permanently bound staff identity.
- Intake: 3 requests/minute and 15/hour per IP; 5/hour per normalized email. Body limit: 16 KB.
- Admin reads: 30/minute per IP and owner. Status and note updates: 10/minute per IP and owner. CSV exports: 5/minute per IP and owner, maximum 10,000 enquiries.
- Dashboard: 100 records per page; up to 100 history events shown per enquiry.
- Security response headers are added by `worker/index.ts`. Strict framing and CSP directives are omitted because this app runs in an embedded Sites environment.

## Deployment and rollback

Use the connected Sites deployment workflow so its managed D1 binding and identity gateway remain attached. Follow that workflow's migration process. For rollback, restore the previous application deployment and keep additive database migrations in place unless the hosting operator has a separate tested schema rollback procedure.
