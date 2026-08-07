# Billing — Secret Manager fix (completed)

## What was done (July 2026)

1. **Verified** ~20 enabled Secret Manager versions per Gmail secret (`GMAIL_*`) — root cause of ~₹8/day charges.
2. **Redeployed** Cloud Functions with `.env` credentials only (no `defineSecret`, no secret bindings).
3. **Deleted** all Gmail secret versions via `BackendCollageCampus/scripts/delete-gmail-secrets.ps1`.
4. **Removed** `sync-firebase-secrets.ps1` (it created a new Secret Manager version on every run and caused billing).
5. **Confirmed** `BackendCollageCampus/functions/.env` has all four Gmail keys; deploy logs show env vars loaded.

## Expected billing after fix

| Service | Cost |
|---------|------|
| Secret Manager | **₹0** (after secrets removed; allow 1–2 days for reports to update) |
| Cloud Functions | Free tier at current traffic |
| Hosting / Firestore | Free tier within limits |

## Set a budget alert (recommended, one-time in console)

1. Open [Billing budgets](https://console.cloud.google.com/billing/budgets?project=collage-campus1)
2. **Create budget** → amount **₹100/month** (adjust as needed)
3. Enable email alerts at **50%**, **90%**, **100%**

## Optional: disable Secret Manager API

Only after confirming no secrets remain:

[Secret Manager API](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com?project=collage-campus1) → **Disable**

## Manual email test

1. Go to https://collageship.web.app
2. Log in → apply to any college
3. Check inbox for confirmation from `collageship007@gmail.com`

Or locally (sends real email):

```bat
cd BackendCollageCampus\functions
node test-email.js
```

## Removed script (do not restore)

`sync-firebase-secrets.ps1` was deleted — it synced Gmail creds to Secret Manager and added ~₹8/day in charges after repeated deploys.

## If secrets reappear

```bat
powershell -ExecutionPolicy Bypass -File BackendCollageCampus\scripts\delete-gmail-secrets.ps1
firebase deploy --only functions
```
