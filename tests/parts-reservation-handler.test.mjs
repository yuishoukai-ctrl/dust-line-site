import test from 'node:test'
import assert from 'node:assert/strict'
import { createReservationHandler, validateReservation, reservationPolicy, ReservationError } from '../supabase/functions/_shared/parts-reservation.mjs'
import { sendPartsReservation, reservationRequestId } from '../src/lib/parts-reservation.js'

const id = '11111111-1111-4111-8111-111111111111'
const fields = { product: 'f450gs-radiator-guard', quantity: 2, name: '検証用', email: 'TEST@example.invalid', request_id: id, policy_version: reservationPolicy, consent: true, challenge: 'synthetic-challenge' }
test('older browsers without randomUUID still use secure version-4 request IDs', () => {
  const result = reservationRequestId({ getRandomValues: values => { values.fill(255); return values } })
  assert.match(result, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  assert.throws(() => reservationRequestId({}), /Secure request ID unavailable/)
})
function request(body = fields, origin = 'https://dustline.jp', method = 'POST') {
  return new Request('https://example.invalid/reservations', { method, headers: { origin, 'content-type': 'application/json' }, ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) })
}
function setup(overrides = {}) {
  const writes = []
  const handler = createReservationHandler({
    config: { origins: ['https://dustline.jp'], enabled: true },
    hash: async () => 'a'.repeat(64),
    verifyChallenge: async () => ({ success: true, action: 'parts_reservation', hostname: 'dustline.jp' }),
    store: { receive: async value => { writes.push(value); return { request_id: value.request_id, private_email: value.email, reservation_id: 'must-not-leak' } } },
    ...overrides,
  })
  return { handler, writes }
}

test('guest receipt saves normalized contact details without returning any private record', async () => {
  const { handler, writes } = setup(); const response = await handler(request())
  assert.equal(response.status, 201)
  assert.deepEqual(await response.json(), { status: 'received', receipt: id })
  assert.equal(writes[0].email, 'test@example.invalid')
  assert.equal(response.headers.get('cache-control'), 'no-store')
})
test('wrong origin, method and closed reception never call storage', async () => {
  const { handler, writes } = setup()
  assert.equal((await handler(request(fields, 'https://attacker.invalid'))).status, 403)
  assert.equal((await handler(request(fields, 'https://dustline.jp', 'GET'))).status, 405)
  assert.equal((await handler(request(fields, 'https://dustline.jp', 'OPTIONS'))).status, 204)
  assert.equal((await setup({ config: { enabled: false, origins: ['https://dustline.jp'] } }).handler(request())).status, 503)
  assert.equal(writes.length, 0)
})
test('quantity, unsupported product, consent, policy, control characters and honeypot are rejected', () => {
  for (const patch of [{ quantity: 0 }, { quantity: 1.1 }, { quantity: 11 }, { product: 'djebel250-frame-guard' }, { consent: false }, { policy_version: 'future' }, { name: '  ' }, { name: 'x\n' }, { email: 'wrong' }, { request_id: '../path' }, { website: 'bot' }, { challenge: '' }, { price: 1 }, { address: 'unneeded' }]) {
    assert.throws(() => validateReservation({ ...fields, ...patch }), error => error.code === 'INVALID_INPUT')
  }
})
test('invalid, cross-host and cross-action challenges cannot create reservations', async () => {
  for (const challenge of [{ success: false }, { success: true, hostname: 'evil.invalid', action: 'parts_reservation' }, { success: true, hostname: 'dustline.jp', action: 'other' }]) {
    const { handler, writes } = setup({ verifyChallenge: async () => challenge })
    assert.equal((await handler(request())).status, 400)
    assert.equal(writes.length, 0)
  }
})
test('invalid or oversized JSON is bounded and never reaches storage', async () => {
  const { handler, writes } = setup()
  assert.equal((await handler(request('{'))).status, 400)
  assert.equal((await handler(request(JSON.stringify({ ...fields, name: 'x'.repeat(9000) })))).status, 413)
  assert.equal(writes.length, 0)
})
test('internal provider errors are hidden; safe rate and conflict errors survive', async () => {
  for (const [failure, code, status] of [[new Error('secret-key/private-email'), 'UNAVAILABLE', 503], [new ReservationError('RATE_LIMIT', 429), 'RATE_LIMIT', 429], [new ReservationError('RETRY_CONFLICT', 409), 'RETRY_CONFLICT', 409]]) {
    const { handler } = setup({ store: { receive: async () => { throw failure } } })
    const response = await handler(request()); assert.equal(response.status, status)
    assert.deepEqual(await response.json(), { error: code })
  }
})
test('client accepts only its own receipt and never sends cookies or an Auth session', async () => {
  const result = await sendPartsReservation({ endpoint: '/fixture', anonKey: 'public-fixture', payload: fields, fetchImpl: async (_, options) => {
    assert.equal(options.credentials, 'omit'); assert.equal(options.headers.Authorization, undefined)
    return new Response(JSON.stringify({ status: 'received', receipt: id }), { status: 201 })
  } })
  assert.equal(result.receipt, id)
  await assert.rejects(sendPartsReservation({ endpoint: '/fixture', payload: fields, fetchImpl: async () => new Response(JSON.stringify({ status: 'received', receipt: 'other' })) }), error => error.code === 'UNAVAILABLE')
})
test('stalled fetch restores control even if transport ignores abort', async () => {
  await assert.rejects(sendPartsReservation({ endpoint: '/fixture', payload: fields, timeoutMs: 15, fetchImpl: () => new Promise(() => {}) }), error => error.code === 'UNAVAILABLE')
})
