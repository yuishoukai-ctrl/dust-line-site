-- Move the ISSUE 01 release metadata from September 1 to mid-September.
-- The provisional sample remains readable while status = 'published'.
update public.issues
set published_at = '2026-09-15 00:00:00+09'
where id = 'issue-01'
  and published_at = '2026-09-01 00:00:00+09';
