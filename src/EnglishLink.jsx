import { useEffect } from 'react'
import { englishTranslationUrl, officialSiteOrigin, publicTranslationPath, translatedNavigationTarget } from './lib/english-translation.js'
import './english-link.css'

function siteTranslationOrigin() {
  // Preview packaging sets this in HTML only; production has no override.
  const origin = document.querySelector('meta[name="dustline-translation-origin"]')?.content
  return origin && englishTranslationUrl({}, origin) ? new URL(origin).origin : officialSiteOrigin
}

export default function EnglishLink({ className = '', onClick }) {
  useEffect(() => {
    if (!window.location.hostname.endsWith('.translate.goog')) return
    const root = document.documentElement
    let toolbar = null
    const update = () => {
      const offset = toolbar ? Math.max(0, Math.ceil(toolbar.getBoundingClientRect().bottom)) : 0
      root.toggleAttribute('data-translation-toolbar', offset > 0)
      root.style.setProperty('--translation-toolbar-offset', `${offset}px`)
    }
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null
    const attributes = new MutationObserver(update)
    const connect = () => {
      const next = document.getElementById('gt-nvframe')
      if (next !== toolbar) {
        resize?.disconnect()
        attributes.disconnect()
        toolbar = next
        if (toolbar) {
          resize?.observe(toolbar)
          attributes.observe(toolbar, { attributes: true, attributeFilter: ['style', 'class', 'height', 'hidden'] })
        }
      }
      update()
    }
    const added = new MutationObserver(connect)
    added.observe(document.body, { childList: true })
    window.addEventListener('resize', update)
    const destinationFor = (anchor) => {
      if (!anchor || anchor.hasAttribute('download')) return null
      let sourceUrl = new URL(window.location.pathname, siteTranslationOrigin()).href
      try {
        const frame = new URL(document.getElementById('gt-nvframe')?.getAttribute('src') || '', window.location.href)
        const original = frame.searchParams.get('u')
        if (original && new URL(original).protocol === 'https:') sourceUrl = original
      } catch { /* Keep the canonical public fallback. */ }
      return translatedNavigationTarget({
        href: anchor.getAttribute('href'), sourceUrl, proxyUrl: window.location.href,
        originalLanguage: anchor.hasAttribute('data-original-language'),
      })
    }
    const prepareLinks = (node) => {
      if (!(node instanceof Element)) return
      const anchors = [...node.querySelectorAll('a[href]')]
      if (node.matches('a[href]')) anchors.unshift(node)
      for (const anchor of anchors) {
        const destination = destinationFor(anchor)
        if (destination && anchor.getAttribute('href') !== destination.href) anchor.href = destination.href
      }
    }
    const appRoot = document.getElementById('root')
    const links = new MutationObserver((records) => {
      for (const record of records) for (const node of record.addedNodes) prepareLinks(node)
    })
    if (appRoot) {
      prepareLinks(appRoot)
      links.observe(appRoot, { childList: true, subtree: true })
    }
    const navigate = (event) => {
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (event.defaultPrevented) return
      const destination = destinationFor(anchor)
      if (!destination) return
      anchor.href = destination.href
      if (destination.native) {
        event.preventDefault()
        event.stopPropagation()
        if (anchor.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey) {
          window.open(destination.href, '_blank', 'noopener,noreferrer')
        } else window.location.assign(destination.href)
      }
    }
    window.addEventListener('click', navigate, true)
    connect()
    return () => {
      added.disconnect()
      links.disconnect()
      attributes.disconnect()
      resize?.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener('click', navigate, true)
      root.removeAttribute('data-translation-toolbar')
      root.style.removeProperty('--translation-toolbar-offset')
    }
  }, [])
  const location = typeof window === 'undefined' ? {} : window.location
  const translated = Boolean(location.hostname?.endsWith('.translate.goog'))
  const origin = typeof document === 'undefined' ? officialSiteOrigin : siteTranslationOrigin()
  const path = publicTranslationPath(location)
  const href = translated ? (path ? `${origin}${path}` : null) : englishTranslationUrl(location, origin)
  if (!href) return null
  return (
    <a className={`english-link notranslate ${className}`.trim()} href={href}
      target={translated ? undefined : '_blank'} rel={translated ? undefined : 'noopener noreferrer'} referrerPolicy="no-referrer"
      data-original-language={translated ? '' : undefined}
      lang={translated ? 'ja' : 'en'} translate="no" onClick={onClick}
      aria-label={translated ? '日本語の元ページに戻る' : 'Read this page in English with Google Translate (opens in a new tab)'}
      title={translated ? '日本語の元ページに戻る' : 'English · Google Translate (new tab)'}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c5 5 5 13 0 18M12 3c-5 5-5 13 0 18" /></svg>
      <span>{translated ? '日本語' : 'English'}</span>{!translated && <span className="english-link__external" aria-hidden="true">↗</span>}
    </a>
  )
}
