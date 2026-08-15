const ANALYTICS_CONSENT_KEY = 'dustline_analytics_consent'
const ANALYTICS_CONSENT_EVENT = 'dustline:analytics-consent'

const allowedEvents = new Set([
  'signup_cta_click',
  'signup_view',
  'signup_submit',
  'signup_code_sent',
  'signup_verify_success',
  'library_guest_view',
])

const measurementId = (import.meta.env.VITE_GA4_MEASUREMENT_ID || '').trim()
const hasValidMeasurementId = /^G-[A-Z0-9]+$/.test(measurementId)
let analyticsLoaded = false

const readConsent = () => {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

const writeConsent = (value) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value)
  } catch {
    // Storage may be unavailable in private browsing. Keep analytics disabled.
  }
  window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: value }))
}

const loadAnalytics = () => {
  if (!hasValidMeasurementId || readConsent() !== 'granted' || analyticsLoaded || typeof document === 'undefined') return false

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  script.dataset.dustlineAnalytics = 'true'
  document.head.appendChild(script)
  analyticsLoaded = true
  return true
}

export const analyticsIsConfigured = hasValidMeasurementId
export const getAnalyticsConsent = readConsent
export const analyticsConsentEvent = ANALYTICS_CONSENT_EVENT

export const setAnalyticsConsent = (value) => {
  const normalized = value === 'granted' ? 'granted' : 'denied'
  writeConsent(normalized)
  if (normalized === 'granted') loadAnalytics()
}

export const initializeAnalytics = () => loadAnalytics()

export const trackAnalyticsEvent = (eventName) => {
  if (!allowedEvents.has(eventName) || readConsent() !== 'granted') return false
  loadAnalytics()
  if (typeof window.gtag !== 'function') return false
  window.gtag('event', eventName)
  return true
}
