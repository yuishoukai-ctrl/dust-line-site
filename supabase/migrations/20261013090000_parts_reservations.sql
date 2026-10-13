-- Free, non-binding physical-product reservations. No payment or magazine rights.
create table public.parts_reservation_catalog (
  product_slug text primary key,
  product_name text not null,
  planned_price_jpy integer not null check (planned_price_jpy > 0),
  max_quantity integer not null default 10 check (max_quantity between 1 and 10),
  enabled boolean not null default false
);
insert into public.parts_reservation_catalog (product_slug, product_name, planned_price_jpy) values
  ('f450gs-radiator-guard', 'BMW F 450 GS向け ラジエーターガード', 12800),
  ('f450gs-rear-master-cylinder-guard', 'BMW F 450 GS向け リアマスターシリンダーカップガード', 4980);

create table public.parts_reservations (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.parts_reservation_catalog(product_slug),
  quantity integer not null check (quantity between 1 and 10),
  contact_name text not null check (length(contact_name) between 1 and 80),
  contact_email text not null check (length(contact_email) between 3 and 254),
  email_key text not null check (email_key ~ '^[0-9a-f]{64}$'),
  status text not null default 'requested' check (status in ('requested', 'contacted', 'cancelled')),
  policy_version text not null,
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index parts_reservations_one_active on public.parts_reservations(product_slug, email_key) where status <> 'cancelled';

-- Retry receipts map to a private canonical request. Duplicate guests cannot
-- read or overwrite the original name, email or quantity.
create table public.parts_reservation_receipts (
  request_id uuid primary key,
  reservation_id uuid not null references public.parts_reservations(id),
  fingerprint text not null check (fingerprint ~ '^[0-9a-f]{64}$'),
  email_key text not null check (email_key ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);
create index parts_reservation_receipts_recent on public.parts_reservation_receipts(created_at, email_key);

alter table public.parts_reservation_catalog enable row level security;
alter table public.parts_reservations enable row level security;
alter table public.parts_reservation_receipts enable row level security;
revoke all on public.parts_reservation_catalog, public.parts_reservations, public.parts_reservation_receipts from public, anon, authenticated;
grant all on public.parts_reservation_catalog, public.parts_reservations, public.parts_reservation_receipts to service_role;

create function public.parts_receive_reservation(
  p_request_id uuid, p_product text, p_quantity integer, p_name text,
  p_email text, p_email_key text, p_fingerprint text, p_policy_version text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  item public.parts_reservation_catalog%rowtype;
  receipt public.parts_reservation_receipts%rowtype;
  reservation_id uuid;
begin
  if p_request_id is null or p_product is null or p_quantity is null or p_name is null or p_email is null
    or p_email_key is null or p_fingerprint is null or p_policy_version is distinct from '2026-10-13-v1'
    or length(trim(p_name)) not between 1 and 80 or length(p_email) not between 3 and 254
    or p_email <> lower(trim(p_email)) or p_email_key !~ '^[0-9a-f]{64}$' or p_fingerprint !~ '^[0-9a-f]{64}$'
    then raise exception 'INVALID_INPUT'; end if;
  -- Serializes the limits and uniqueness checks for concurrent requests.
  perform pg_advisory_xact_lock(20261013, 1);
  select * into receipt from public.parts_reservation_receipts where request_id = p_request_id;
  if found then
    if receipt.fingerprint <> p_fingerprint then raise exception 'RETRY_CONFLICT'; end if;
    return jsonb_build_object('request_id', p_request_id);
  end if;
  select * into item from public.parts_reservation_catalog where product_slug = p_product;
  if not found or not item.enabled then raise exception 'CLOSED'; end if;
  if p_quantity < 1 or p_quantity > item.max_quantity then raise exception 'INVALID_INPUT'; end if;
  if (select count(*) from public.parts_reservation_receipts where email_key = p_email_key and created_at > now() - interval '15 minutes') >= 5
    or (select count(*) from public.parts_reservation_receipts where created_at > now() - interval '15 minutes') >= 250
    then raise exception 'RATE_LIMIT'; end if;
  select id into reservation_id from public.parts_reservations where product_slug = p_product and email_key = p_email_key and status <> 'cancelled';
  if not found then
    insert into public.parts_reservations(product_slug, quantity, contact_name, contact_email, email_key, policy_version)
      values(p_product, p_quantity, trim(p_name), p_email, p_email_key, p_policy_version) returning id into reservation_id;
  end if;
  insert into public.parts_reservation_receipts(request_id, reservation_id, fingerprint, email_key)
    values(p_request_id, reservation_id, p_fingerprint, p_email_key);
  return jsonb_build_object('request_id', p_request_id);
end;
$$;
revoke all on function public.parts_receive_reservation(uuid,text,integer,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.parts_receive_reservation(uuid,text,integer,text,text,text,text,text) to service_role;
