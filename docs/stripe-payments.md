# Stripe payments: prepared, not deployed

This branch implements one-time digital issue purchases. Production sales remain disabled.

Implementation plan and verification evidence:
`C:\Users\81702\Documents\DUSTLINE\commerce\magazine-direct-sales\2026-10-06_stripe-onboarding\Stripe導入計画とテスト接続手順_v01.md`

## Test isolation

- Use a dedicated Supabase test project (or local Supabase) and the DUSTLINE Stripe sandbox.
- Never use the production database `vndhldmmhvmpqvaizqci` for test purchases. The handler rejects that pairing.
- The inherited `supabase/config.toml` still names the production project. Always specify the approved test project explicitly when deploying; do not use an implicit project link.
- No production users, private magazine files, or personal data should be copied into fixtures.
- The migration expects the existing issues/entitlements schema. Audit it before applying to an external project.
- Test fixture: a synthetic paid issue-02 and PDF, published only in the test project.

Sandbox Price: `price_1UNJLJEgCXEuSuaxQ1ytNWt0` (JPY 1480, one-time).

## Configuration

Server-only Supabase Secrets (actual values must never enter Git, chat, or the client bundle):

```text
STRIPE_MODE=test
ISSUE_PAYMENTS_ENABLED=false
STRIPE_RESTRICTED_KEY=<owner-saved rk_test key>
STRIPE_WEBHOOK_SECRET=<owner-saved webhook signing secret>
PAYMENT_SITE_URL=http://127.0.0.1:4186
PAYMENT_ALLOWED_ORIGINS=http://127.0.0.1:4186
```

The test project's standard `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are also needed. Use the matching test-project `VITE_SUPABASE_URL` and public `VITE_SUPABASE_ANON_KEY` in the local frontend. `VITE_ISSUE_PAYMENTS_ENABLED=true` enables the local panel. Server and catalogue flags independently gate sales.

Start with restricted permissions: Checkout Sessions create/read, Prices read, PaymentIntents read, Charges read. Verify permission dependencies in the Stripe UI/API; exact dashboard dependencies have not yet been tested. The application does not create products or issue refunds.

Webhook target: `https://<approved-test-project>.supabase.co/functions/v1/stripe-issue-webhook`

```text
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired
charge.refunded
charge.dispute.created
charge.dispute.closed
```

Both functions use `verify_jwt=false`: checkout validates the user's token itself with Auth.getUser, and the webhook validates the raw Stripe signature. Never remove those checks.

## Verification

```text
npm test
npx --yes deno check supabase/functions/issue-checkout/index.ts supabase/functions/stripe-issue-webhook/index.ts
npm run build
```

Local results: 89 passing tests, Deno checks passed, 35 prerendered routes verified, desktop + 390px mobile inspection. Tests use real PGlite SQL and Stripe SDK signatures, but fake payment API data. Single-connection database tests are not distributed concurrency tests.

Cloud acceptance still required: verified signup → hosted test Checkout → signed webhook → entitlement → library → private PDF → logout denial → re-login access. Test cancellation, retry, delayed payment, full refund, and foreign-account denial too. Check restricted permissions and webhook delivery on the actual deployed functions.

Full refunds revoke Stripe-origin access; partial refunds keep it. Disputes suspend access; closed disputes require operator review. Reconcile paid orders with entitlements and retry failed webhook processing before launch.

Production migration, keys, webhook, account activation, finished issue-02 PDF, and public sales launch require separate review. Pausing sales must retain webhook processing and existing order-status reads.
