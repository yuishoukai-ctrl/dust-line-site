(() => {
  const normalizedPath = (pathname) => {
    if (pathname === '/') return '/'
    return `${pathname.replace(/\/+$/, '')}/`
  }

  const legacyToFixed = {
    '?page=company': '/company/',
    '?page=goods': '/goods/',
    '?page=advertise': '/advertise/',
    '?page=privacy': '/privacy/',
    '?page=commercial-disclosure': '/commercial-disclosure/',
    '?page=refund-policy': '/refund-policy/',
    '?page=digital-delivery': '/digital-delivery/',
    '?page=paint': '/paint/',
    '?article=hokkaido-1190': '/articles/hokkaido-1190/',
    '?article=ktm-990-adv-s': '/articles/ktm-990-adv-s/',
    '?article=world-trip': '/articles/world-trip/',
    '?article=machine-file-001': '/articles/machine-file-001/',
  }

  const fixedPath = normalizedPath(window.location.pathname)
  const fixedRouteTitles = new Set([
    '/company/',
    '/goods/',
    '/advertise/',
    '/privacy/',
    '/commercial-disclosure/',
    '/refund-policy/',
    '/digital-delivery/',
    '/paint/',
    '/offroad-bike-magazine/',
    '/account/signup/',
    '/account/login/',
    '/account/verify/',
    '/account/reset-password/',
    '/library/',
    '/issues/issue-01/',
    '/articles/hokkaido-1190/',
    '/articles/ktm-990-adv-s/',
    '/articles/world-trip/',
    '/articles/machine-file-001/',
    '/travel/',
    '/build/',
    '/garage/',
  ])
  const fixedTitle = fixedRouteTitles.has(fixedPath) ? document.title : null

  function rewriteInternalLinks() {
    if (fixedTitle && document.title !== fixedTitle) document.title = fixedTitle
    document.querySelectorAll('a[href]').forEach((link) => {
      try {
        const url = new URL(link.getAttribute('href'), window.location.origin)
        const fixed = url.origin === window.location.origin && url.pathname === '/'
          ? legacyToFixed[url.search]
          : null
        if (fixed) link.setAttribute('href', fixed)
      } catch {
        // Keep malformed or non-URL href values unchanged.
      }
    })
  }

  const startLinkObserver = () => {
    rewriteInternalLinks()
    const observer = new MutationObserver(rewriteInternalLinks)
    observer.observe(document.documentElement, { childList: true, subtree: true })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLinkObserver, { once: true })
  } else {
    startLinkObserver()
  }
})()
