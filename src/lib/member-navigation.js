// Restrict auth return URLs to the reader and library on this origin.
export function safeLocalReturnPath(candidate, origin, fallback = '/library/') {
  if (!candidate) return fallback
  try {
    const url = new URL(candidate, origin)
    if (url.origin !== origin || url.username || url.password) return fallback
    const path = `${url.pathname.replace(/\/+$/, '')}/`
    if (path !== '/library/' && !/^\/issues\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(path)) return fallback
    return path
  } catch {
    return fallback
  }
}

export function authPath(path, returnTo) {
  return `${path}?returnTo=${encodeURIComponent(returnTo)}`
}
