import test from 'node:test'
import assert from 'node:assert/strict'
import { firstIssue } from '../src/member-content.js'
import { loadIssuePdf, PDF_URL_TTL_SECONDS } from '../src/lib/issue-reader.js'

function fixture(overrides = {}) {
  const options = {
    user: { id: 'local-test-user', email_confirmed_at: '2026-09-18T00:00:00Z' },
    record: { id: 'issue-01', status: 'published', storage_path: 'issue-01/magazine.pdf' },
    ...overrides,
  }
  const calls = []
  let sequence = 0
  const client = {
    auth: { async getUser() { calls.push('getUser'); return { data: { user: options.user }, error: options.authError } } },
    from(table) {
      calls.push(['from', table])
      return { select(columns) { calls.push(['select', columns]); return {
        eq(field, id) { calls.push(['eq', field, id]); return {
          async maybeSingle() { return { data: options.record, error: options.recordError } },
        } },
      } } }
    },
    storage: { from(bucket) { calls.push(['bucket', bucket]); return {
      async createSignedUrl(path, ttl) {
        calls.push(['sign', path, ttl]); sequence++
        return { data: { signedUrl: options.url ?? `https://storage.example/issue.pdf?token=local-${sequence}` }, error: options.signError }
      },
    } } },
  }
  return { client, calls }
}
const code = (expected) => (error) => error.code === expected

test('each load validates Auth, selects only the requested issue and renews a short signed URL', async () => {
  const { client, calls } = fixture()
  const initial = await loadIssuePdf(client, firstIssue)
  const renewed = await loadIssuePdf(client, firstIssue)
  assert.notEqual(initial, renewed)
  assert.deepEqual(calls.slice(0, 6), ['getUser', ['from', 'issues'], ['select', 'id, storage_path, status'], ['eq', 'id', 'issue-01'], ['bucket', 'magazines'], ['sign', 'issue-01/magazine.pdf', PDF_URL_TTL_SECONDS]])
  assert.equal(PDF_URL_TTL_SECONDS, 600)
})
test('unknown/unreleased issue, missing or unconfirmed user never requests storage', async () => {
  for (const issue of [null, { ...firstIssue, publicationStatus: 'planned', previewAvailable: false }]) {
    const { client, calls } = fixture()
    await assert.rejects(loadIssuePdf(client, issue), code('NOT_READY'))
    assert.deepEqual(calls, [])
  }
  for (const options of [{ user: null }, { authError: new Error('expired') }, { user: { id: 'unconfirmed' } }]) {
    const { client, calls } = fixture(options)
    await assert.rejects(loadIssuePdf(client, firstIssue), code(options.user?.id === 'unconfirmed' ? 'EMAIL_UNCONFIRMED' : 'AUTH_REQUIRED'))
    assert.deepEqual(calls, ['getUser'])
  }
})
test('denied and unpublished database records cannot reach signed URL generation', async () => {
  for (const [options, expected] of [
    [{ record: null }, 'NO_ACCESS'],
    [{ recordError: new Error('database unavailable') }, 'UNAVAILABLE'],
    [{ record: { id: 'issue-01', status: 'draft', storage_path: 'issue-01/full.pdf' } }, 'NOT_READY'],
  ]) {
    const { client, calls } = fixture(options)
    await assert.rejects(loadIssuePdf(client, firstIssue), code(expected))
    assert.equal(calls.some((call) => call[0] === 'sign'), false)
  }
})
test('cross-issue paths, traversal and non-PDF objects fail closed', async () => {
  for (const storage_path of ['issue-02/full.pdf', 'issue-01/../private.pdf', 'issue-01/%2e%2e/full.pdf', 'issue-01\\full.pdf', 'issue-01//full.pdf', 'issue-01/index.html', 'issue-01/full.pdf?token=anything']) {
    const { client, calls } = fixture({ record: { id: 'issue-01', status: 'published', storage_path } })
    await assert.rejects(loadIssuePdf(client, firstIssue), code('UNAVAILABLE'))
    assert.equal(calls.some((call) => call[0] === 'sign'), false)
  }
  const { client } = fixture({ record: { id: 'issue-02', status: 'published', storage_path: 'issue-01/full.pdf' } })
  await assert.rejects(loadIssuePdf(client, firstIssue), code('UNAVAILABLE'))
})
test('storage denial is not treated as entitlement and can be retried', async () => {
  const denied = fixture({ signError: new Error('RLS denied') })
  await assert.rejects(loadIssuePdf(denied.client, firstIssue), code('NO_ACCESS'))
  const allowed = fixture()
  assert.match(await loadIssuePdf(allowed.client, firstIssue), /^https:/)
  const invalid = fixture({ url: 'javascript:alert(1)' })
  await assert.rejects(loadIssuePdf(invalid.client, firstIssue), code('UNAVAILABLE'))
})
