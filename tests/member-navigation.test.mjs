import test from 'node:test'
import assert from 'node:assert/strict'
import { safeLocalReturnPath, authPath } from '../src/lib/member-navigation.js'

const origin = 'https://dustline.jp'
test('login and email confirmation preserve an issue destination', () => {
  const login = new URL(authPath('/account/login/', '/issues/issue-02/'), origin)
  const destination = safeLocalReturnPath(login.searchParams.get('returnTo'), origin)
  const verify = new URL(authPath('/account/verify/', destination), origin)
  assert.equal(safeLocalReturnPath(verify.searchParams.get('returnTo'), origin), '/issues/issue-02/')
  assert.equal(safeLocalReturnPath(`${origin}/issues/issue-01?token=discard#page=2`, origin), '/issues/issue-01/')
})
test('untrusted redirects cannot leave the internal reader/library', () => {
  for (const candidate of [null, '', 'https://evil.example/issues/issue-01/', '//evil.example/library/', '\\\\evil.example\\library', 'javascript:alert(1)', 'data:text/html,hello', 'https://user:pass@dustline.jp/library/', '/account/login/', '/admin/', '/issues/issue-01/extra/', '/issues/%2e%2e/admin/', '/issues/issue-01%2fextra/', 'https://dustline.jp.evil.example/library/']) {
    assert.equal(safeLocalReturnPath(candidate, origin), '/library/', candidate)
  }
})

