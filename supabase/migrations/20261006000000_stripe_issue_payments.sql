-- Reviewed against the production schema on 2026-10-06. Apply to an isolated
-- Supabase test project first. This migration does not publish ISSUE 02.
begin;

do $$
declare original text;
begin
  select pg_get_constraintdef(oid) into original from pg_constraint
  where conrelid='public.entitlements'::regclass and conname='entitlements_source_check';
  if original is null then raise exception 'Missing entitlements_source_check; audit the schema'; end if;
  if original not like '%''stripe''%' then
    if original <> 'CHECK ((source = ANY (ARRAY[''free''::text, ''google_play''::text, ''apple_app_store''::text, ''support''::text, ''admin''::text])))' then
      raise exception 'Entitlement sources changed; audit before migration';
    end if;
    alter table public.entitlements drop constraint entitlements_source_check;
    alter table public.entitlements add constraint entitlements_source_check
      check (source in ('free','google_play','apple_app_store','support','admin','stripe'));
  end if;
end $$;

create table if not exists public.stripe_issue_catalog (
  issue_id text primary key references public.issues(id),
  price_id text not null unique check (price_id ~ '^price_'),
  amount_jpy integer not null check (amount_jpy > 0),
  mode text not null check (mode in ('test','live')),
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.stripe_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  issue_id text not null references public.issues(id),
  mode text not null check (mode in ('test','live')),
  price_id text not null,
  amount_jpy integer not null check (amount_jpy > 0),
  session_id text unique,
  payment_intent_id text unique,
  status text not null default 'creating' check (status in ('creating','open','processing','paid','failed','expired','refunded','disputed')),
  expires_at timestamptz not null default now() + interval '1 hour',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists stripe_orders_owner_issue on public.stripe_orders(user_id,issue_id,mode,created_at desc);

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  mode text not null check (mode in ('test','live')),
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_issue_catalog enable row level security;
alter table public.stripe_orders enable row level security;
alter table public.stripe_webhook_events enable row level security;
revoke all on public.stripe_issue_catalog,public.stripe_orders,public.stripe_webhook_events from public,anon,authenticated;
grant select on public.stripe_orders to authenticated;
grant all on public.stripe_issue_catalog,public.stripe_orders,public.stripe_webhook_events to service_role;
drop policy if exists stripe_orders_select_own on public.stripe_orders;
create policy stripe_orders_select_own on public.stripe_orders for select to authenticated using (user_id=(select auth.uid()));

create or replace function public.stripe_prepare_order(p_user_id uuid,p_issue_id text,p_mode text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare catalog public.stripe_issue_catalog; issue public.issues; cached public.stripe_orders;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_issue_id || ':' || p_mode,0));
  select * into catalog from public.stripe_issue_catalog where issue_id=p_issue_id and mode=p_mode and enabled;
  select * into issue from public.issues where id=p_issue_id;
  if catalog.issue_id is null or issue.status <> 'published' or issue.storage_path is null
    or issue.price_jpy <> catalog.amount_jpy or issue.currency <> 'JPY' then raise exception 'SALES_CLOSED'; end if;
  if exists (select 1 from public.entitlements where user_id=p_user_id and issue_id=p_issue_id
    and status='active' and (expires_at is null or expires_at>now())) then
    return jsonb_build_object('status','already_owned');
  end if;
  -- Never expire an open/processing payment from a local timer: a delayed
  -- payment might still be payable. The signed Stripe event is authoritative.
  update public.stripe_orders set status='expired',updated_at=now()
    where user_id=p_user_id and issue_id=p_issue_id and mode=p_mode and status='creating' and expires_at<=now();
  select * into cached from public.stripe_orders where user_id=p_user_id and issue_id=p_issue_id and mode=p_mode
    and status in ('creating','open','processing') order by created_at desc limit 1;
  if cached.id is not null then
    if cached.amount_jpy<>catalog.amount_jpy or cached.price_id<>catalog.price_id then raise exception 'PRICE_CHANGED'; end if;
    return to_jsonb(cached);
  end if;
  if (select count(*) from public.stripe_orders where user_id=p_user_id and mode=p_mode
    and created_at>now()-interval '15 minutes')>=5 then raise exception 'RATE_LIMIT'; end if;
  insert into public.stripe_orders(user_id,issue_id,mode,price_id,amount_jpy)
    values(p_user_id,p_issue_id,p_mode,catalog.price_id,catalog.amount_jpy) returning * into cached;
  return to_jsonb(cached);
end $$;

create or replace function public.stripe_apply_event(
  p_event_id text,p_event_type text,p_order_id uuid,p_session_id text,p_intent_id text,
  p_state text,p_mode text,p_amount_jpy integer,p_price_id text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare item public.stripe_orders; changed integer;
begin
  if p_state not in ('processing','paid','failed','expired','refunded','disputed') then raise exception 'INVALID_STATE'; end if;
  select * into item from public.stripe_orders where id=p_order_id;
  if item.id is null then raise exception 'ORDER_NOT_FOUND'; end if;
  perform pg_advisory_xact_lock(hashtextextended(item.user_id::text || ':' || item.issue_id || ':' || item.mode,0));
  select * into item from public.stripe_orders where id=p_order_id for update;
  if item.mode<>p_mode or item.amount_jpy<>p_amount_jpy or item.price_id<>p_price_id
    or item.session_id is distinct from p_session_id or p_session_id is null
    or (item.payment_intent_id is not null and item.payment_intent_id is distinct from p_intent_id)
    or (p_state='paid' and p_intent_id is null) then raise exception 'PAYMENT_MISMATCH'; end if;
  insert into public.stripe_webhook_events(event_id,mode,event_type) values(p_event_id,p_mode,p_event_type)
    on conflict(event_id) do nothing;
  get diagnostics changed=row_count;
  if changed=0 then return jsonb_build_object('status','duplicate'); end if;
  if (item.status in ('refunded','disputed') and p_state not in ('refunded','disputed'))
    or (item.status='paid' and p_state in ('processing','failed','expired'))
    or (item.status in ('failed','expired') and p_state='processing') then
    return jsonb_build_object('status','ignored_stale_event');
  end if;
  update public.stripe_orders set status=p_state,payment_intent_id=coalesce(p_intent_id,payment_intent_id),updated_at=now() where id=p_order_id;
  if p_state='paid' then
    insert into public.entitlements(user_id,issue_id,source,status,expires_at)
      values(item.user_id,item.issue_id,'stripe','active',null)
      on conflict(user_id,issue_id) do update set source='stripe',status='active',expires_at=null,granted_at=now(),updated_at=now()
      where public.entitlements.source='stripe' or public.entitlements.status<>'active' or public.entitlements.expires_at<=now();
  elsif p_state in ('refunded','disputed') then
    update public.entitlements set status=case when p_state='refunded' then 'refunded' else 'revoked' end,updated_at=now()
      where user_id=item.user_id and issue_id=item.issue_id and source='stripe'
      and not exists (select 1 from public.stripe_orders o where o.user_id=item.user_id and o.issue_id=item.issue_id
        and o.mode=item.mode and o.status='paid');
  end if;
  return jsonb_build_object('status',p_state);
end $$;

revoke all on function public.stripe_prepare_order(uuid,text,text) from public,anon,authenticated;
revoke all on function public.stripe_apply_event(text,text,uuid,text,text,text,text,integer,text) from public,anon,authenticated;
grant execute on function public.stripe_prepare_order(uuid,text,text) to service_role;
grant execute on function public.stripe_apply_event(text,text,uuid,text,text,text,text,integer,text) to service_role;
commit;
