import test from 'node:test'
import assert from 'node:assert/strict'
import { publicTranslationPath, englishTranslationUrl } from '../src/lib/english-translation.js'
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
