import { contactEndpoint, contactLimits, contactRecipient, contactSender, contactTopics, isContactTopic } from '../src/lib/contact.js'

const maxBodyBytes = 16_384
const emailPattern = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/

function reply(status, ok = false, headers = {}) {
  return Response.json({ ok }, { status, headers: { 'Cache-Control': 'no-store', ...headers } })
}

async function readSubmission(request) {
  if (!request.body || Number(request.headers.get('Content-Length')) > maxBodyBytes) return null
  const reader = request.body.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let body = ''
  let bytes = 0

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) return JSON.parse(body + decoder.decode())
      bytes += value.byteLength
      if (bytes > maxBodyBytes) {
        await reader.cancel()
        return null
      }
      body += decoder.decode(value, { stream: true })
    }
  } catch {
    return null
  }
}

export async function contactRequest(request, env) {
  if (request.method !== 'POST') return reply(405, false, { Allow: 'POST' })
  if (request.headers.get('Origin') !== new URL(request.url).origin) return reply(403)
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return reply(415)
  if (!env.CONTACT_EMAIL || !env.CONTACT_RATE_LIMIT) return reply(503)

  const ip = request.headers.get('CF-Connecting-IP') || 'local'
  try {
    if (!(await env.CONTACT_RATE_LIMIT.limit({ key: ip })).success) return reply(429)
  } catch {
    return reply(503)
  }

  const data = await readSubmission(request)
  if (!data || typeof data !== 'object' || Array.isArray(data)) return reply(400)
  if (data.website !== undefined && data.website !== '') return reply(400)

  const topic = data.topic
  const email = typeof data.email === 'string' ? data.email.trim() : ''
  const name = typeof data.name === 'string' ? data.name.trim() : ''
  const message = typeof data.message === 'string' ? data.message.trim() : ''
  if (typeof topic !== 'string' || !isContactTopic(topic)
    || email.length > contactLimits.email || !emailPattern.test(email)
    || name.length > contactLimits.name || /[\r\n\0]/.test(name)
    || !message || message.length > contactLimits.message || message.includes('\0')) return reply(400)

  try {
    await env.CONTACT_EMAIL.send({
      from: { email: contactSender, name: 'DUST LINE お問い合わせ' },
      to: contactRecipient,
      replyTo: email,
      subject: '[DUST LINE] ' + contactTopics[topic],
      text: ['お問い合わせの種類：' + contactTopics[topic], '返信先：' + email,
        'お名前・会社名：' + (name || '未記入'), '', message].join('\n'),
    })
    return reply(200, true)
  } catch {
    return reply(503)
  }
}

export default {
  fetch(request, env) {
    const { pathname } = new URL(request.url)
    return pathname === contactEndpoint ? contactRequest(request, env) : env.ASSETS.fetch(request)
  },
}
