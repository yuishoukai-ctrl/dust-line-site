# DUST LINE Cloudflare hosting

## Scope

Cloudflare Workers Static Assets serves the existing React/Vite build. GitHub continues to hold source and change history. Supabase continues to provide authentication, private magazine storage and purchase rights. Stripe Checkout and its existing Supabase webhook remain unchanged. New issue sales stay disabled.

`wrangler.json` contains no Worker script, custom domains, routes, database bindings or server credentials. Deploying it creates/updates `dust-line-site` on `workers.dev`; it does not switch `dustline.jp`.

## Build and verify

```powershell
npm ci
npm test
$env:VITE_ISSUE_PAYMENTS_ENABLED='false'
npm run build
npm run check:cloudflare
$env:WRANGLER_SEND_METRICS='false'
npx wrangler deploy --dry-run
npm run preview:cloudflare
```

The check enforces the static-file limits, required authentication/reader routes, and absence of known server-key/sandbox/fixture patterns. Public Supabase URL and anon key are expected in the client. Secret Stripe keys, service-role keys and webhook secrets must never be frontend build variables.

Cloudflare preserves directory routes such as `/account/login/` and `/issues/issue-01/`. New article/issue routes must be added to the existing prerender list before release. Missing paths return HTTP 404. Authentication, library, reader and issue-02 HTML shells use `Cache-Control: no-store`; private API/PDF authorization continues to be enforced by Supabase.

## Automated deployment

`.github/workflows/cloudflare.yml` tests, builds, checks and deploys. On `main`, it only runs automatically when the repository variable `SITE_HOSTING` is `cloudflare`. A manual dispatch can prepare the Cloudflare URL before the domain is switched. The inherited Pages workflow keeps running while that variable is unset or not `cloudflare`.

Required GitHub Actions secrets:

- Existing: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- New: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`.
- Existing optional variable: `VITE_GA4_MEASUREMENT_ID`.

Prefer an account-owned token scoped to **Specified Workers → dust-line-site → Individual Workers Editor**. This is the narrowly scoped policy prepared in the Cloudflare dashboard. Do not grant all-account, DNS, billing, database or Supabase access. The owner creates the token and stores it directly in this repository's Actions secrets; never put it in chat, source, reports or the company ledger. Verify an actual deployment with this token before calling CI complete; review any additional permission request before accepting it.

`VITE_ISSUE_PAYMENTS_ENABLED` is explicitly `false` in this workflow. Enabling sales is a separate, reviewed change after catalogue/content, Stripe readiness and paid-access checks.

## Domain cutover gate

1. Export the complete current DNS zone from **シンドメイン / シンクラウドアカウント**, the contract service confirmed by the owner on 2026-10-07. Official login guide: https://www.shin-domain.jp/support/manual/man_tool_info.php . Public DNS observations are only a partial backup, not a complete zone export. Do not infer the contract provider from `ns*.wpx.ne.jp` or direct the owner to the XServer account portal on that basis.
2. Add `dustline.jp` to the intended Cloudflare account with the Free plan. Review all imported records, including MX, SPF, DKIM, DMARC, Resend and domain-verification records. Mail records must remain DNS-only.
3. Verify the Cloudflare URL on desktop and mobile. Check directory redirects, account forms, sales-OFF UI and unauthenticated reader protection. Existing-account login can be tested on that URL; signup/reset email callbacks need approved redirect URLs or testing on the final canonical domain.
4. Record the actual assigned Cloudflare nameservers and the old zone/nameservers. Confirm the final DNS cutover scope before changing the registrar's nameservers.
5. When the Cloudflare zone is active, connect the Worker to `dustline.jp` and handle `www.dustline.jp` consistently. Preserve the canonical URL and existing paths. Do not cache Supabase responses or signed PDFs publicly.
6. After successful canonical-domain checks, set `SITE_HOSTING=cloudflare`. Verify an actual GitHub-to-Cloudflare release. Keep the previous Pages release and DNS backup available for rollback.

## Acceptance / rollback

- HTTPS, homepage, Parts and article routes work on PC and 390px mobile.
- Confirmed member can open the library and the actual 130-page issue-01 PDF; anonymous users cannot read private files.
- Signup/resend/6-digit verification and reset callbacks stay on the intended domain; emails still arrive.
- Issue-02 remains upcoming with its purchase button disabled; no live charge is performed as part of hosting migration.
- Existing Stripe webhook URL and Supabase allowed production origin remain `https://dustline.jp`.
- On failure, keep sales OFF and restore the saved web/DNS configuration. Change `SITE_HOSTING` back only as part of the reviewed rollback. A previous deployment existing does not by itself mean DNS/certificate rollback is immediate.

## Dependencies

Wrangler is pinned to 4.148.0. Overrides select patched `sharp` 0.35.5 and `source-map-js` 1.2.2 because the fresh install reported GHSA-wq5f-xc86-pv6w and GHSA-68fv-2mgg-jv7q. Recheck the lockfile and audit when Wrangler is upgraded.

## Official references (checked 2026-10-07)

- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
