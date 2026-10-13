const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const siteKey = import.meta.env.VITE_PARTS_RESERVATION_TURNSTILE_SITE_KEY?.trim()
export const partsReservationConfig = {
  enabled: import.meta.env.VITE_PARTS_RESERVATIONS_ENABLED === 'true' && Boolean(url && anonKey && siteKey),
  endpoint: url ? `${url.replace(/\/$/, '')}/functions/v1/parts-reservation` : '',
  anonKey, siteKey,
}
