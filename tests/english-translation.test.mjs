import test from 'node:test'
import assert from 'node:assert/strict'
import { publicTranslationPath, englishTranslationUrl, translatedNavigationTarget } from '../src/lib/english-translation.js'
import { guardFactoryProducts } from '../src/guard-factory-products.js'
import { gearGuides } from '../src/gear-guides.js'
import { issue01Digests } from '../src/issue01-digests.js'

test('English uses the official public page, even when previewed on localhost', () => {
  const url = new URL(englishTranslationUrl({ hostname: '127.0.0.1', pathname: '/shops/hotel-az/' }))
  assert.equal(url.origin, 'https://translate.google.com')
  assert.equal(url.pathname, '/translate')
  assert.equal(url.searchParams.get('sl'), 'ja')
  assert.equal(url.searchParams.get('tl'), 'en')
  assert.equal(url.searchParams.get('u'), 'https://dustline.jp/shops/hotel-az/')
})

test('tracking parameters, private query values and auth fragments never leave the site', () => {
  const url = englishTranslationUrl({ pathname: '/parts/', search: '?email=private%40example.com&access_token=secret&utm_source=test', hash: '#refresh_token=secret' })
  assert.equal(new URL(url).searchParams.get('u'), 'https://dustline.jp/parts/')
  assert.doesNotMatch(url, /private|secret|token|utm_source/)
})

test('account, reader, library and unknown paths are never passed to the translation service', () => {
  for (const pathname of ['/account/login/', '/account/verify/', '/account/reset-password/', '/library/', '/issues/issue-01/', '/issues/issue-02/', '/not-a-public-page/', '//example.com/', 'https://example.com/', '/\\example.com/']) {
    assert.equal(englishTranslationUrl({ pathname, search: '?code=secret' }), null, pathname)
  }
  for (const page of ['member-login', 'member-verify', 'member-library', 'member-issue', '__proto__', 'constructor']) {
    assert.equal(englishTranslationUrl({ pathname: '/', search: `?page=${page}` }), null, page)
  }
})

test('legacy query routes used by prerendering resolve to public canonical paths', () => {
  assert.equal(publicTranslationPath({ search: '?page=shop-hotel-az&email=secret' }), '/shops/hotel-az/')
  assert.equal(publicTranslationPath({ search: '?article=michinoku-adventure-rally' }), '/articles/michinoku-adventure-rally/')
  assert.equal(publicTranslationPath({ search: '?article=not-an-article' }), null)
  for (const { slug } of guardFactoryProducts) {
    assert.equal(publicTranslationPath({ search: `?page=${slug}` }), `/parts/guard-factory/${slug}/`)
  }
  for (const { slug, path } of [...gearGuides, ...issue01Digests]) {
    assert.equal(publicTranslationPath({ search: `?article=${slug}` }), path)
    assert.equal(publicTranslationPath({ pathname: path }), path)
  }
})

test('normalizes trailing slashes while keeping every supported public entry point', () => {
  for (const pathname of ['/', '/parts', '/paint/', '/travel/', '/build/', '/garage/', '/gear/', '/shops/', '/privacy/', '/magazine/issue-02/', '/offroad-bike-magazine/']) {
    const target = new URL(englishTranslationUrl({ pathname })).searchParams.get('u')
    assert.equal(target, `https://dustline.jp${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')+'/'}`)
  }
})

const sourceUrl = 'https://dustline.jp/shops/hotel-az/'
const proxyUrl = 'https://dustline-jp.translate.goog/shops/hotel-az/?_x_tr_sl=ja&_x_tr_tl=en&_x_tr_hl=en'

test('an explicit HTTPS preview origin works without changing production defaults', () => {
  assert.equal(new URL(englishTranslationUrl({ pathname: '/parts/' }, 'https://preview.example.workers.dev')).searchParams.get('u'), 'https://preview.example.workers.dev/parts/')
  for (const origin of ['http://example.com', 'javascript:alert(1)', 'https://u:secret@example.com/', 'https://example.com/?token=secret', 'https://example.com/not-an-origin']) assert.equal(englishTranslationUrl({}, origin), null)
})

test('translated public navigation stays in English and drops unrelated query data', () => {
  const result = translatedNavigationTarget({ href: '/parts/?email=secret#products', sourceUrl, proxyUrl: `${proxyUrl}&access_token=secret` })
  const url = new URL(result.href)
  assert.equal(result.native, false)
  assert.equal(url.origin, 'https://dustline-jp.translate.goog')
  assert.equal(url.pathname, '/parts/')
  assert.equal(url.hash, '#products')
  assert.equal(url.searchParams.get('_x_tr_tl'), 'en')
  assert.doesNotMatch(result.href, /secret|email|access_token/)
})

test('translated anchors and legacy article links retain the proper public page', () => {
  const anchor = translatedNavigationTarget({ href: '#hotel-price', sourceUrl, proxyUrl })
  assert.equal(anchor.href, `${proxyUrl}#hotel-price`)
  const article = translatedNavigationTarget({ href: '/?article=ktm-990-adv-s', sourceUrl, proxyUrl })
  assert.equal(new URL(article.href).pathname, '/articles/ktm-990-adv-s/')
  const encoded = translatedNavigationTarget({ href: '/parts/', sourceUrl: 'https://preview.example.workers.dev/', proxyUrl: 'https://1-preview-example-workers-dev.translate.goog/?_x_tr_enc=1&_x_tr_sl=ja&_x_tr_tl=en&_x_tr_hl=en' })
  assert.equal(new URL(encoded.href).searchParams.get('_x_tr_enc'), '1')
})

test('member links and the Japanese switch leave the translation proxy', () => {
  assert.deepEqual(translatedNavigationTarget({ href: '/account/login/?next=%2Flibrary%2F', sourceUrl, proxyUrl }), { href: 'https://dustline.jp/account/login/?next=%2Flibrary%2F', native: true })
  assert.deepEqual(translatedNavigationTarget({ href: sourceUrl, sourceUrl, proxyUrl, originalLanguage: true }), { href: sourceUrl, native: true })
})

test('unrelated or unsafe URLs are not rewritten', () => {
  for (const href of ['https://www.amazon.co.jp/dp/example', 'https://dustline.jp.evil.test/parts/', 'javascript:alert(1)', '/unknown-page/']) assert.equal(translatedNavigationTarget({ href, sourceUrl, proxyUrl }), null)
  assert.equal(translatedNavigationTarget({ href: '/parts/', sourceUrl, proxyUrl: 'https://dustline.jp/' }), null)
})
