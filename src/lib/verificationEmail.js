const VERIFICATION_EMAIL_KEY = 'dustline_verification_email'

const writeVerificationEmail = (email) => {
  if (typeof window === 'undefined' || !email) return
  try {
    window.sessionStorage.setItem(VERIFICATION_EMAIL_KEY, email)
  } catch {
    // The verification form remains usable when session storage is unavailable.
  }
}

export const prepareVerificationEmail = () => {
  if (typeof window === 'undefined') return
  const pathname = `${window.location.pathname.replace(/\/+$/, '')}/`
  if (pathname !== '/account/verify/') return

  const url = new URL(window.location.href)
  const email = url.searchParams.get('email')
  if (!email) return

  writeVerificationEmail(email)
  url.searchParams.delete('email')
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
}

export const storeVerificationEmail = (email) => writeVerificationEmail(email.trim())

export const getVerificationEmail = () => {
  if (typeof window === 'undefined') return ''
  try {
    return window.sessionStorage.getItem(VERIFICATION_EMAIL_KEY) || ''
  } catch {
    return ''
  }
}

export const clearVerificationEmail = () => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(VERIFICATION_EMAIL_KEY)
  } catch {
    // Nothing else is required if storage is unavailable.
  }
}
