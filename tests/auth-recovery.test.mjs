import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as jsxRuntime from 'react/jsx-runtime'
import { transformWithOxc } from 'vite'
import * as authAction from '../src/lib/authAction.js'
import * as verificationEmail from '../src/lib/verificationEmail.js'
import * as memberContent from '../src/member-content.js'
import * as memberNavigation from '../src/lib/member-navigation.js'

const { getAuthErrorMessage, runAuthAction } = authAction
const analyticsSource = await readFile(new URL('../src/lib/analytics.js', import.meta.url), 'utf8')

function authState(action, request, onSuccess = () => {}) {
  const state = { submitting: false, loadingChanges: [], errorMessage: '', successCount: 0 }
  return {
    state,
    options: {
      action,
      request,
      setSubmitting(value) {
        state.submitting = value
        state.loadingChanges.push(value)
      },
      setErrorMessage(value) { state.errorMessage = value },
      async onSuccess(result) {
        state.successCount += 1
        await onSuccess(result)
      },
    },
  }
}

for (const action of ['signup', 'verify']) {
  test(`${action}: success waits for the request and always releases loading`, async () => {
    let completeRequest
    let requestCount = 0
    const response = { data: { session: null }, error: null }
    const fixture = authState(action, () => {
      requestCount += 1
      return new Promise((resolve) => { completeRequest = resolve })
    }, (result) => assert.equal(result, response))
    const pending = runAuthAction(fixture.options)
    assert.equal(fixture.state.submitting, true)
    assert.equal(fixture.state.successCount, 0)
    completeRequest(response)
    assert.equal(await pending, true)
    assert.equal(requestCount, 1)
    assert.equal(fixture.state.successCount, 1)
    assert.equal(fixture.state.errorMessage, '')
    assert.deepEqual(fixture.state.loadingChanges, [true, false])
  })

  test(`${action}: returned SDK error prevents success and releases loading`, async () => {
    const fixture = authState(action, async () => ({
      data: { session: null },
      error: { code: 'unexpected_failure', status: 400, message: 'private server details' },
    }))
    assert.equal(await runAuthAction(fixture.options), false)
    assert.equal(fixture.state.successCount, 0)
    assert.ok(fixture.state.errorMessage)
    assert.ok(!fixture.state.errorMessage.includes('private server details'))
    assert.deepEqual(fixture.state.loadingChanges, [true, false])
  })

  for (const synchronous of [false, true]) {
    test(`${action}: ${synchronous ? 'synchronous throw' : 'rejected request'} does not complete auth or retry`, async () => {
      let requestCount = 0
      const error = Object.assign(new Error('private fetch details'), { name: 'AuthRetryableFetchError', status: 0 })
      const fixture = authState(action, () => {
        requestCount += 1
        if (synchronous) throw error
        return Promise.reject(error)
      })
      assert.equal(await runAuthAction(fixture.options), false)
      assert.equal(requestCount, 1)
      assert.equal(fixture.state.successCount, 0)
      assert.match(fixture.state.errorMessage, /通信/)
      assert.ok(!fixture.state.errorMessage.includes('private fetch details'))
      assert.deepEqual(fixture.state.loadingChanges, [true, false])
    })
  }

  test(`${action}: failure during completion also releases loading`, async () => {
    const fixture = authState(action, async () => ({ data: {}, error: null }), () => {
      throw new Error('private client details')
    })
    assert.equal(await runAuthAction(fixture.options), false)
    assert.ok(fixture.state.errorMessage)
    assert.ok(!fixture.state.errorMessage.includes('private client details'))
    assert.deepEqual(fixture.state.loadingChanges, [true, false])
  })
}

test('safe auth errors distinguish rate limit, service, input and expired code without server text', () => {
  assert.match(getAuthErrorMessage('signup', { status: 429 }), /操作回数/)
  assert.match(getAuthErrorMessage('signup', { code: 'over_email_send_rate_limit' }), /操作回数/)
  assert.match(getAuthErrorMessage('signup', { status: 500, name: 'AuthRetryableFetchError' }), /現在、登録処理/)
  assert.match(getAuthErrorMessage('verify', { status: 503 }), /現在、メール確認/)
  assert.match(getAuthErrorMessage('signup', { code: 'weak_password' }), /パスワード/)
  assert.match(getAuthErrorMessage('signup', { code: 'email_address_invalid' }), /メールアドレス/)
  assert.match(getAuthErrorMessage('verify', { code: 'otp_expired' }), /有効期限/)
  assert.match(getAuthErrorMessage('signup', null), /6桁コード/)
})

async function loadAnalytics({ consent = 'granted', gtag, storageThrows = false, appendThrows = false } = {}) {
  const calls = []
  const scripts = []
  let savedConsent = consent
  const window = {
    localStorage: {
      getItem() { if (storageThrows) throw new Error('blocked storage'); return savedConsent },
      setItem(_key, value) { if (storageThrows) throw new Error('blocked storage'); savedConsent = value },
    },
    dispatchEvent() {},
    gtag: gtag ?? ((...args) => calls.push(args)),
  }
  const document = {
    createElement() { return { dataset: {} } },
    head: { appendChild(script) { if (appendThrows) throw new Error('blocked script'); scripts.push(script) } },
  }
  const context = vm.createContext({ window, document, CustomEvent: class {}, Date })
  const module = new vm.SourceTextModule(analyticsSource, {
    context,
    initializeImportMeta(meta) { meta.env = { VITE_GA4_MEASUREMENT_ID: 'G-QATEST' } },
  })
  await module.link(() => { throw new Error('analytics must not import dependencies') })
  await module.evaluate()
  return { analytics: module.namespace, calls, scripts, window }
}

for (const consent of [null, 'denied']) {
  test(`analytics: ${consent} consent does not initialize or send events`, async () => {
    const fixture = await loadAnalytics({ consent })
    assert.equal(fixture.analytics.initializeAnalytics(), false)
    assert.equal(fixture.analytics.trackAnalyticsEvent('signup_submit'), false)
    assert.deepEqual(fixture.calls, [])
    assert.deepEqual(fixture.scripts, [])
  })
}

test('analytics: granted consent sends only allowlisted events with existing privacy options', async () => {
  const fixture = await loadAnalytics()
  assert.equal(fixture.analytics.trackAnalyticsEvent('signup_code_sent'), true)
  assert.equal(fixture.analytics.trackAnalyticsEvent('email@example.invalid'), false)
  assert.equal(fixture.scripts.length, 1)
  const config = fixture.calls.find(([name]) => name === 'config')[2]
  assert.equal(config.send_page_view, false)
  assert.equal(config.allow_google_signals, false)
  assert.equal(config.allow_ad_personalization_signals, false)
  assert.deepEqual(fixture.calls.filter(([name]) => name === 'event'), [['event', 'signup_code_sent']])
  fixture.analytics.setAnalyticsConsent('denied')
  assert.equal(fixture.analytics.trackAnalyticsEvent('signup_verify_success'), false)
  assert.equal(fixture.calls.filter(([name]) => name === 'event').length, 1)
})

test('analytics: throwing gtag and blocked script insertion stay optional', async () => {
  for (const options of [
    { gtag() { throw new Error('tracker failed') } },
    { appendThrows: true },
  ]) {
    const fixture = await loadAnalytics(options)
    assert.equal(fixture.analytics.initializeAnalytics(), false)
    assert.equal(fixture.analytics.trackAnalyticsEvent('signup_submit'), false)
  }
})

test('analytics: exception while sending an event cannot escape after initialization', async () => {
  const fixture = await loadAnalytics()
  assert.equal(fixture.analytics.initializeAnalytics(), true)
  fixture.window.gtag = () => { throw new Error('event failed') }
  assert.equal(fixture.analytics.trackAnalyticsEvent('signup_verify_success'), false)
})

test('analytics: blocked consent storage and notification are handled safely', async () => {
  const fixture = await loadAnalytics({ storageThrows: true })
  fixture.window.dispatchEvent = () => { throw new Error('blocked event') }
  assert.doesNotThrow(() => fixture.analytics.setAnalyticsConsent('granted'))
  assert.equal(fixture.analytics.initializeAnalytics(), false)
  assert.equal(fixture.analytics.trackAnalyticsEvent('signup_submit'), false)
  assert.deepEqual(fixture.calls, [])
})

test('signup success continues to navigation even when the actual analytics module throws internally', async () => {
  const { analytics } = await loadAnalytics({ gtag() { throw new Error('tracker failed') } })
  let destination = ''
  const fixture = authState('signup', async () => ({ data: { session: null }, error: null }), () => {
    assert.equal(analytics.trackAnalyticsEvent('signup_code_sent'), false)
    destination = '/account/verify/'
  })
  assert.equal(await runAuthAction(fixture.options), true)
  assert.equal(destination, '/account/verify/')
  assert.deepEqual(fixture.state.loadingChanges, [true, false])
})

test('verification email is kept in session storage, trimmed and removable', () => {
  const previousWindow = globalThis.window
  const values = new Map()
  globalThis.window = {
    sessionStorage: {
      setItem: (key, value) => values.set(key, value),
      getItem: (key) => values.get(key),
      removeItem: (key) => values.delete(key),
    },
  }
  try {
    verificationEmail.storeVerificationEmail('  reader@example.invalid  ')
    assert.equal(verificationEmail.getVerificationEmail(), 'reader@example.invalid')
    verificationEmail.clearVerificationEmail()
    assert.equal(verificationEmail.getVerificationEmail(), '')
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})

test('unavailable session storage or window does not block manual email verification', () => {
  const previousWindow = globalThis.window
  globalThis.window = { get sessionStorage() { throw new Error('storage disabled') } }
  try {
    assert.doesNotThrow(() => verificationEmail.storeVerificationEmail('reader@example.invalid'))
    assert.equal(verificationEmail.getVerificationEmail(), '')
    assert.doesNotThrow(() => verificationEmail.clearVerificationEmail())
    delete globalThis.window
    assert.doesNotThrow(() => verificationEmail.storeVerificationEmail('reader@example.invalid'))
    assert.equal(verificationEmail.getVerificationEmail(), '')
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})

test('actual signup and login markup always exposes verification recovery without putting email in URLs', async () => {
  const source = await readFile(new URL('../src/MemberPages.jsx', import.meta.url), 'utf8')
  // Expose the existing components in this isolated test module only.
  const transformed = await transformWithOxc(`${source}\nexport { SignupPage, LoginPage, VerifyPage }\n`, 'MemberPages.jsx', { jsx: { runtime: 'automatic' } })
  const context = vm.createContext({ window: { location: { search: '', origin: 'https://example.invalid' } }, URL, URLSearchParams })
  const imports = {
    react: React,
    'react/jsx-runtime': jsxRuntime,
    './lib/supabaseClient': { isSupabaseConfigured: true, supabase: null },
    './lib/analytics': { trackAnalyticsEvent: () => false },
    './lib/authAction': authAction,
    './lib/verificationEmail': { ...verificationEmail, getVerificationEmail: () => '' },
    './member-content': memberContent,
    './lib/member-navigation': memberNavigation,
    './lib/issue-reader': { loadIssuePdf: () => {} },
    './PdfMagazineViewer': { default: () => null },
    './member-pages.css': {},
  }
  const module = new vm.SourceTextModule(transformed.code, { context })
  await module.link((specifier) => {
    const values = imports[specifier]
    assert.ok(values, `unexpected component dependency: ${specifier}`)
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [name, value] of Object.entries(values)) this.setExport(name, value)
    }, { context })
  })
  await module.evaluate()
  for (const returnTo of ['/library/', '/issues/issue-01/']) {
    context.window.location.search = `?returnTo=${encodeURIComponent(returnTo)}`
    for (const component of [module.namespace.SignupPage, module.namespace.LoginPage]) {
      const html = renderToStaticMarkup(React.createElement(component, { session: null }))
      const recovery = html.match(/href="([^"]+)"[^>]*>確認メールが届いている方：6桁コードを入力<\/a>/)
      assert.ok(recovery)
      const url = new URL(recovery[1], 'https://example.invalid')
      assert.equal(url.pathname, '/account/verify/')
      assert.equal(url.searchParams.get('returnTo'), returnTo)
      assert.ok(!url.searchParams.has('email'))
    }
  }
  const verifyHtml = renderToStaticMarkup(React.createElement(module.namespace.VerifyPage, { session: null }))
  assert.match(verifyHtml, /type="email"/)
  assert.match(verifyHtml, /6桁の認証コード/)
})
