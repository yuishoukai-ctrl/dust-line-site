import { guardFactoryProducts } from '../guard-factory-products.js'
import { gearGuides } from '../gear-guides.js'
import { issue01Digests } from '../issue01-digests.js'

export const officialSiteOrigin = 'https://dustline.jp'

const pageAliases = {
  company: '/company/', goods: '/goods/', advertise: '/advertise/',
  privacy: '/privacy/', 'commercial-disclosure': '/commercial-disclosure/',
  'refund-policy': '/refund-policy/', 'digital-delivery': '/digital-delivery/',
  travel: '/travel/', build: '/build/', garage: '/garage/', gear: '/gear/',
  parts: '/parts/', shops: '/shops/', paint: '/paint/', magazine: '/offroad-bike-magazine/',
  'issue-01-digests': '/articles/issue-01/',
  'issue-02-product': '/magazine/issue-02/',
  'issue-01-delay': '/news/issue-01-release-delay/',
  'shop-motorrad-shizuoka': '/shops/motorrad-shizuoka/',
  'shop-hotel-az': '/shops/hotel-az/',
  ...Object.fromEntries(guardFactoryProducts.map(({ slug }) => [slug, `/parts/guard-factory/${slug}/`])),
}
const articleAliases = {
  ...Object.fromEntries(['michinoku-adventure-rally', 'hokkaido-1190', 'ktm-990-adv-s', 'world-trip', 'machine-file-001']
    .map((slug) => [slug, `/articles/${slug}/`])),
  ...Object.fromEntries([...gearGuides, ...issue01Digests].map(({ slug, path }) => [slug, path])),
}
const publicPaths = new Set(['/', ...Object.values(pageAliases), ...Object.values(articleAliases)])

/** Only public canonical URLs are sent to the translation service, never account URLs or query/fragment data. */
export function publicTranslationPath({ pathname = '/', search = '' } = {}) {
  if (typeof pathname !== 'string' || !pathname.startsWith('/') || pathname.startsWith('//') || pathname.includes('\\')) return null
  const path = pathname === '/' ? '/' : `${pathname.replace(/\/+$/, '')}/`
  if (path !== '/') return publicPaths.has(path) ? path : null
  const params = new URLSearchParams(search)
  if (params.has('article')) return Object.hasOwn(articleAliases, params.get('article')) ? articleAliases[params.get('article')] : null
  if (params.has('page')) return Object.hasOwn(pageAliases, params.get('page')) ? pageAliases[params.get('page')] : null
  return '/'
}

export function englishTranslationUrl(location, siteOrigin = officialSiteOrigin) {
  const path = publicTranslationPath(location)
  if (!path) return null
  let origin
  try {
    const configured = new URL(siteOrigin)
    if (configured.protocol !== 'https:' || configured.username || configured.password || configured.search || configured.hash || configured.pathname !== '/') return null
    origin = configured.origin
  } catch { return null }
  const url = new URL('https://translate.google.com/translate')
  url.search = new URLSearchParams({ sl: 'ja', tl: 'en', hl: 'en', u: `${origin}${path}` }).toString()
  return url.href
}

/** React recreates relative links after Google has rewritten the server HTML. Keep public navigation on the translated origin. */
export function translatedNavigationTarget({ href, sourceUrl, proxyUrl, originalLanguage = false }) {
  let source, proxy, target
  try {
    source = new URL(sourceUrl)
    proxy = new URL(proxyUrl)
    target = new URL(href, source)
  } catch { return null }
  if (source.protocol !== 'https:' || proxy.protocol !== 'https:' || !proxy.hostname.endsWith('.translate.goog')) return null
  if (![source.origin, proxy.origin].includes(target.origin) || target.username || target.password) return null
  if (originalLanguage || /^\/(?:account|library|issues)(?:\/|$)/.test(target.pathname)) {
    return { href: new URL(`${target.pathname}${target.search}${target.hash}`, source.origin).href, native: true }
  }
  const path = publicTranslationPath({ pathname: target.pathname, search: target.search })
  if (!path) return null
  const translated = new URL(path, proxy.origin)
  const params = new URLSearchParams(proxy.search)
  for (const key of [...params.keys()]) {
    if (!['_x_tr_sl', '_x_tr_tl', '_x_tr_hl', '_x_tr_enc'].includes(key)) params.delete(key)
  }
  params.set('_x_tr_sl', 'ja')
  params.set('_x_tr_tl', 'en')
  params.set('_x_tr_hl', 'en')
  if (params.get('_x_tr_enc') !== '1') params.delete('_x_tr_enc')
  translated.search = params.toString()
  if (/^#[a-z][a-z0-9_-]*$/i.test(target.hash)) translated.hash = target.hash
  return { href: translated.href, native: false }
}
