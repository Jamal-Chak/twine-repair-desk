# TwineEngine Repair Desk

Interactive repair-enquiry demo built with HTML, CSS and JavaScript. No dependencies, database or API keys are required.

## Run locally

From the repository folder on Windows:

```powershell
py -m http.server 8000 --directory dist
```

Open http://localhost:8000. On macOS/Linux use `python3` instead of `py`. Alternatively, serve `dist` using VS Code Live Server.

## Files

- `dist/index.html`: interface and responsive styles
- `dist/app.js`: form submission, search, details, status changes and local storage

## Demo workflow

1. Open Customer view and enter fictional contact details.
2. Submit an enquiry, then open Business dashboard.
3. Move the request through New, Contacted and Closed.
4. Search by name, service, area or reference.
5. Use Reset demo to restore the fictional examples.

## Limitations

This is a demonstration, not a production customer-management system. Records are stored only in the current browser under `twine-repair-desk-v1`. They do not synchronise between devices. Clearing browser data or resetting the demo removes changes. No emails, calls, SMS or WhatsApp messages are sent. There is no AI chatbot, staff authentication, payment processing or confirmed booking flow. Do not enter real customer data.

## Validation

JavaScript syntax can be checked with `node --check dist/app.js`. The demo was manually checked for submission, status changes, search, reload persistence and reset. Further security, accessibility and device testing is needed before a live implementation.

## Deployment

Serve the `dist` directory on a static web host; no build step is needed. This repository is a code copy of the privately hosted Sites demonstration. Changes here do not automatically update that deployment.

## Future implementation

A live service needs server-side validation, shared storage, staff access controls, appropriate data handling, monitoring and backups. Notifications and AI are separately scoped additions.
