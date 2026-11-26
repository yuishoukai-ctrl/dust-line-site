import assert from 'node:assert/strict'
import test from 'node:test'
import worker, { contactRequest } from '../worker/contact.mjs'
import { contactRecipient, contactSender } from '../src/lib/contact.js'

const origin = 'https://dustline.jp'
const body = { topic: 'advertising', email: 'reader@example.com', message: '広告掲載について相談したいです。' }

function request({ payload = body, sender = origin, method = 'POST' } = {}) {
  return new Request(origin + '/api/contact', {
    method,
    headers: { Origin: sender, 'Content-Type': 'application/json' },
    ...(method === 'POST' && { body: JSON.stringify(payload) }),
  })
}

test('sends validated inquiry to the fixed recipient, with the reader as reply-to', async () => {
  const sent = []
  const result = await contactRequest(request({ payload: { ...body, to: 'elsewhere@example.com', subject: 'override' } }), {
    CONTACT_RATE_LIMIT: { limit: async () => ({ success: true }) },
    CONTACT_EMAIL: { send: async email => sent.push(email) },
  })
  assert.equal(result.status, 200)
  assert.deepEqual(await result.json(), { ok: true })
  assert.equal(result.headers.get('Cache-Control'), 'no-store')
  assert.equal(sent.length, 1)
  assert.equal(sent[0].from.email, contactSender)
  assert.equal(sent[0].to, contactRecipient)
  assert.equal(sent[0].subject, '[DUST LINE] 広告・掲載')
  assert.equal(sent[0].replyTo, body.email)
  assert.ok(sent[0].text.includes(body.message))
})

test('rejects foreign origins, invalid fields, oversized data, and the honeypot', async () => {
  const unavailable = {
    CONTACT_RATE_LIMIT: { limit: async () => ({ success: true }) },
    CONTACT_EMAIL: { send: async () => assert.fail('Invalid request reached the sender') },
  }
  const table = [
    [request({ method: 'GET' }), 405],
    [request({ sender: 'https://elsewhere.example' }), 403],
    [request({ payload: { ...body, email: 'bad@example.com\nBCC: other@example.com' } }), 400],
    [request({ payload: { ...body, topic: '__proto__' } }), 400],
    [request({ payload: { ...body, website: 'https://spam.example' } }), 400],
    [request({ payload: { ...body, message: '日'.repeat(6_000) } }), 400],
  ]
  for (const [input, status] of table) assert.equal((await contactRequest(input, unavailable)).status, status)
})

test('reports rate limits and email transport errors without exposing details', async () => {
  const env = {
    CONTACT_RATE_LIMIT: { limit: async () => ({ success: false }) },
    CONTACT_EMAIL: { send: async () => { throw new Error('Provider rejected sender') } },
  }
  assert.equal((await contactRequest(request(), env)).status, 429)
  env.CONTACT_RATE_LIMIT.limit = async () => ({ success: true })
  const response = await contactRequest(request(), env)
  assert.equal(response.status, 503)
  assert.deepEqual(await response.json(), { ok: false })
})

test('delegates ordinary page and asset requests to Cloudflare Assets', async () => {
  const result = await worker.fetch(new Request(origin + '/contact/'), {
    ASSETS: { fetch: () => new Response('contact page', { status: 200 }) },
  })
  assert.equal(await result.text(), 'contact page')
})
