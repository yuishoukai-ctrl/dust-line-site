// Physical-part interest requests are separate from Stripe magazine orders.
export const reservationPolicy = '2026-10-13-v1'
export const reservationProducts = new Set(['f450gs-radiator-guard', 'f450gs-rear-master-cylinder-guard'])
export const reservationErrors = new Set(['INVALID_INPUT', 'CLOSED', 'CHALLENGE_FAILED', 'RATE_LIMIT', 'RETRY_CONFLICT', 'UNAVAILABLE'])
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export class ReservationError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status }
}

export function validateReservation(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ReservationError('INVALID_INPUT')
  const allowedFields = new Set(['product', 'quantity', 'name', 'email', 'request_id', 'policy_version', 'consent', 'challenge', 'website'])
  if (Object.keys(value).some(key => !allowedFields.has(key))) throw new ReservationError('INVALID_INPUT')
  const { product, quantity, name, email, request_id, policy_version, consent, challenge, website } = value
  if (!reservationProducts.has(product) || !Number.isInteger(quantity) || quantity < 1 || quantity > 10
    || typeof name !== 'string' || !name.trim() || name.trim().length > 80 || /[\u0000-\u001f\u007f]/.test(name)
    || typeof email !== 'string' || email.trim().length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email.trim())
    || typeof request_id !== 'string' || !uuid.test(request_id) || policy_version !== reservationPolicy || consent !== true
    || typeof challenge !== 'string' || !challenge || challenge.length > 2048
    || (website !== undefined && website !== '')) throw new ReservationError('INVALID_INPUT')
  return { product, quantity, name: name.trim(), email: email.trim().toLowerCase(), request_id: request_id.toLowerCase(), policy_version, challenge }
}

async function readLimitedJson(request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new ReservationError('INVALID_INPUT', 415)
  if (Number(request.headers.get('content-length')) > 8192 || !request.body) throw new ReservationError('INVALID_INPUT', 413)
  const reader = request.body.getReader(); const chunks = []; let size = 0
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break
      size += value.byteLength
      if (size > 8192) { await reader.cancel(); throw new ReservationError('INVALID_INPUT', 413) }
      chunks.push(value)
    }
    const bytes = new Uint8Array(size); let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch (error) {
    if (error instanceof ReservationError) throw error
    throw new ReservationError('INVALID_INPUT')
  } finally { reader.releaseLock() }
}

export function createReservationHandler({ config, verifyChallenge, hash, store }) {
  return async (request) => {
    const origin = request.headers.get('origin')
    const allowed = config.origins.includes(origin)
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin' }
    if (allowed) Object.assign(headers, { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type, apikey' })
    const response = (data, status = 200) => new Response(JSON.stringify(data), { status, headers })
    if (!allowed) return response({ error: 'UNAVAILABLE' }, 403)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    if (request.method !== 'POST') return response({ error: 'INVALID_INPUT' }, 405)
    if (!config.enabled) return response({ error: 'CLOSED' }, 503)
    try {
      const value = validateReservation(await readLimitedJson(request))
      const challenge = await verifyChallenge(value.challenge)
      if (!challenge?.success || challenge.action !== 'parts_reservation' || challenge.hostname !== new URL(origin).hostname) throw new ReservationError('CHALLENGE_FAILED', 400)
      const emailKey = await hash('email:' + value.email)
      const fingerprint = await hash(JSON.stringify([value.product, value.quantity, value.name, value.email, value.policy_version]))
      const result = await store.receive({ ...value, email_key: emailKey, fingerprint })
      if (result?.request_id !== value.request_id) throw new Error('Invalid receipt')
      // Never disclose another guest's record, contact details or duplicate status.
      return response({ status: 'received', receipt: result.request_id }, 201)
    } catch (error) {
      const safe = error instanceof ReservationError && reservationErrors.has(error.code)
      return response({ error: safe ? error.code : 'UNAVAILABLE' }, safe ? error.status : 503)
    }
  }
}
