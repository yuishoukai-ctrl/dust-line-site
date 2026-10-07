-- Minimal representation of the columns/constraints observed in production.
-- All users and PDFs here are synthetic fixtures, not production data.
create role anon;
create role authenticated;
create role service_role bypassrls;
create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$$;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;
create table public.issues(id text primary key, status text not null, price_jpy integer not null, currency text not null default 'JPY', storage_path text);
create table public.entitlements(
  id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),issue_id text not null references public.issues(id),
  source text not null constraint entitlements_source_check check(source=any(array['free'::text,'google_play'::text,'apple_app_store'::text,'support'::text,'admin'::text])),
  status text not null default 'active' check(status in ('pending','active','revoked','refunded')),
  granted_at timestamptz not null default now(),expires_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(user_id,issue_id)
);
alter table public.entitlements enable row level security;
grant select on public.entitlements to authenticated;
create policy entitlements_select_own on public.entitlements for select to authenticated using(user_id=auth.uid());
create function public.has_issue_access(requested_issue_id text) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.issues issue where issue.id=requested_issue_id and issue.status='published' and (issue.price_jpy=0 or exists(
    select 1 from public.entitlements entitlement where entitlement.user_id=auth.uid() and entitlement.issue_id=issue.id and entitlement.status='active' and (entitlement.expires_at is null or entitlement.expires_at>now())
  )));
$$;
