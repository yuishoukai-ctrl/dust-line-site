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

export function englishTranslationUrl(location) {
  const path = publicTranslationPath(location)
  if (!path) return null
  const url = new URL('https://translate.google.com/translate')
  url.search = new URLSearchParams({ sl: 'ja', tl: 'en', hl: 'en', u: `${officialSiteOrigin}${path}` }).toString()
  return url.href
}
