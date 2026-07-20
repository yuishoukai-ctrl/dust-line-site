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
    '?article=hokkaido-1190': '/articles/hokkaido-1190/',
    '?article=world-trip': '/articles/world-trip/',
    '?article=machine-file-001': '/articles/machine-file-001/',
  }

  const fixedPath = normalizedPath(window.location.pathname)
  const fixedRouteTitles = new Set([
    '/company/',
    '/goods/',
    '/advertise/',
    '/privacy/',
    '/articles/hokkaido-1190/',
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
