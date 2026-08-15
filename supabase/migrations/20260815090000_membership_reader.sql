-- DUST LINE Web reader: non-destructive configuration for the existing schema.
-- The project already contains public.issues, public.entitlements,
-- public.has_issue_access(text), and the storage SELECT policy.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('magazines', 'magazines', false, 209715200, array['application/pdf']::text[])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into public.issues (
  id,
  issue_number,
  title,
  subtitle,
  status,
  price_jpy,
  currency,
  storage_path,
  published_at
)
values (
  'issue-01',
  1,
  'DUST LINE 創刊号',
  '創刊号は無料（校了前・仮PDF）',
  'published',
  0,
  'JPY',
  'issue-01/dust-line-issue-01-sample.pdf',
  '2026-09-01 00:00:00+09'
)
on conflict (id) do update
set issue_number = excluded.issue_number,
    title = excluded.title,
    subtitle = excluded.subtitle,
    status = excluded.status,
    price_jpy = excluded.price_jpy,
    currency = excluded.currency,
    storage_path = excluded.storage_path,
    published_at = excluded.published_at;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'reader_download_entitled_magazines'
  ) then
    create policy reader_download_entitled_magazines
      on storage.objects
      for select
      to authenticated
      using (
        bucket_id = 'magazines'
        and public.has_issue_access((storage.foldername(name))[1])
      );
  end if;
end
$$;
