import { createClient } from 'npm:@supabase/supabase-js@2.112.3'
import { createReservationHandler, ReservationError } from '../_shared/parts-reservation.mjs'

const origins = (Deno.env.get('PARTS_RESERVATION_ALLOWED_ORIGINS') ?? '').split(',').map(s => s.trim()).filter(Boolean)
const secret = Deno.env.get('TURNSTILE_SECRET_KEY')?.trim()
const hashSecret = Deno.env.get('PARTS_RESERVATION_HASH_SECRET')?.trim()
const url = Deno.env.get('SUPABASE_URL')?.trim()
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim()
// Configuration errors close the guest endpoint rather than disabling protections.
const originsValid = origins.length > 0 && origins.every(origin => {
  try { const parsed = new URL(origin); return parsed.protocol === 'https:' && parsed.origin === origin } catch { return false }
})
const enabled = Deno.env.get('PARTS_RESERVATIONS_ENABLED') === 'true' && Boolean(secret && hashSecret && hashSecret.length >= 32 && url && serviceKey && originsValid)
const admin = enabled ? createClient(url!, serviceKey!, { auth: { persistSession: false, autoRefreshToken: false } }) : null
const hashKey = hashSecret ? await crypto.subtle.importKey('raw', new TextEncoder().encode(hashSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']) : null

Deno.serve(createReservationHandler({
  config: { enabled, origins },
  hash: async (value: string) => {
    const signed = await crypto.subtle.sign('HMAC', hashKey!, new TextEncoder().encode(value))
    return Array.from(new Uint8Array(signed)).map(byte => byte.toString(16).padStart(2, '0')).join('')
  },
  verifyChallenge: async (token: string) => {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(8000),
      body: JSON.stringify({ secret, response: token }),
    })
    if (!response.ok) throw new Error('Challenge unavailable')
    return response.json()
  },
  store: {
    receive: async (value: any) => {
      const { data, error } = await admin!.rpc('parts_receive_reservation', {
        p_request_id: value.request_id, p_product: value.product, p_quantity: value.quantity,
        p_name: value.name, p_email: value.email, p_email_key: value.email_key,
        p_fingerprint: value.fingerprint, p_policy_version: value.policy_version,
      })
      if (error) {
        const code = ['CLOSED', 'RATE_LIMIT', 'RETRY_CONFLICT', 'INVALID_INPUT'].find(c => error.message?.includes(c))
        if (code) throw new ReservationError(code, code === 'RATE_LIMIT' ? 429 : code === 'CLOSED' ? 503 : 409)
        throw new Error('Reservation storage unavailable')
      }
      return data
    },
  },
}))
