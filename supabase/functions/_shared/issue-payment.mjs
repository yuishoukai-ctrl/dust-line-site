// Shared by the Edge Functions and local tests. No credentials or network globals.
export class PaymentError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status }
}

export const productionProject = 'vndhldmmhvmpqvaizqci'
export const isUuid = (value) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
export const stripeId = (value) => typeof value === 'string' ? value : value?.id

export function validateEnvironment(config) {
  if (!['test', 'live'].includes(config.mode)) throw new PaymentError('CONFIGURATION_ERROR', 503)
  if (!new RegExp(`^rk_${config.mode}_`).test(config.stripeKey ?? '')) throw new PaymentError('CONFIGURATION_ERROR', 503)
  const backend = new URL(config.supabaseUrl)
  if (config.mode === 'test' && backend.hostname === `${productionProject}.supabase.co`) {
    throw new PaymentError('TEST_REQUIRES_ISOLATED_DATABASE', 503)
  }
  const site = new URL(config.siteUrl)
  if (config.mode === 'live' && site.origin !== 'https://dustline.jp') throw new PaymentError('CONFIGURATION_ERROR', 503)
  if (site.protocol !== 'https:' && !(config.mode === 'test' && ['127.0.0.1', 'localhost'].includes(site.hostname))) {
    throw new PaymentError('CONFIGURATION_ERROR', 503)
  }
}

export function checkPrice(price, order, mode) {
  if (!price.active || price.type !== 'one_time' || price.currency !== 'jpy'
    || price.unit_amount !== order.amount_jpy || price.livemode !== (mode === 'live')
    || price.id !== order.price_id) throw new PaymentError('PRICE_MISMATCH', 409)
}

export function checkoutParameters(order, config) {
  const metadata = { integration: 'dustline_issues', order_id: order.id, issue_id: order.issue_id }
  const page = `${new URL(config.siteUrl).origin}/magazine/issue-02/`
  return {
    mode: 'payment', locale: 'ja',
    integration_identifier: 'dustline_issues_qmrtsvwx',
    line_items: [{ price: order.price_id, quantity: 1 }],
    metadata, payment_intent_data: { metadata },
    success_url: `${page}?checkout=return&order_id=${order.id}`,
    cancel_url: `${page}?checkout=cancel&order_id=${order.id}`,
    // Stable between retries so Stripe's idempotency key can safely be reused.
    expires_at: Math.floor(new Date(order.expires_at).getTime() / 1000),
  }
}

export function validateSession(session, order, mode) {
  const items = session.line_items?.data ?? []
  if (session.mode !== 'payment' || session.livemode !== (mode === 'live')
    || session.metadata?.integration !== 'dustline_issues'
    || session.metadata?.order_id !== order.id || session.metadata?.issue_id !== order.issue_id
    || session.currency !== 'jpy' || session.amount_total !== order.amount_jpy
    || items.length !== 1 || session.line_items?.has_more
    || items[0].quantity !== 1 || stripeId(items[0].price) !== order.price_id
    || (order.session_id && session.id !== order.session_id)) {
    throw new PaymentError('PAYMENT_MISMATCH', 409)
  }
}

export function validCheckoutUrl(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && u.hostname === 'checkout.stripe.com' }
  catch { return false }
}

function json(value, status, headers = {}) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } })
}

export function createCheckoutHandler({ auth, store, stripe, config }) {
  return async (request) => {
    const origin = request.headers.get('origin')
    const headers = { 'Access-Control-Allow-Origin': origin ?? '', 'Vary': 'Origin',
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
    if (!config.origins.includes(origin)) return json({ error: 'ORIGIN_NOT_ALLOWED' }, 403)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    if (request.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405, headers)
    try {
      validateEnvironment(config)
      const bearer = request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1]
      if (!bearer) throw new PaymentError('AUTH_REQUIRED', 401)
      const user = await auth(bearer)
      if (!user?.id) throw new PaymentError('AUTH_REQUIRED', 401)
      if (!user.email_confirmed_at) throw new PaymentError('EMAIL_UNCONFIRMED', 403)
      if (Number(request.headers.get('content-length') ?? 0) > 2048) throw new PaymentError('INVALID_REQUEST')
      const bodyText = await request.text()
      if (bodyText.length > 2048) throw new PaymentError('INVALID_REQUEST')
      let body
      try { body = JSON.parse(bodyText) } catch { throw new PaymentError('INVALID_REQUEST') }
      if (body?.action === 'status' && isUuid(body.order_id) && Object.keys(body).every(k => ['action', 'order_id'].includes(k))) {
        const order = await store.ownOrder(body.order_id, user.id, config.mode)
        if (!order) throw new PaymentError('ORDER_NOT_FOUND', 404)
        // A return URL can only read status. It never grants access.
        return json({ order_id: order.id, issue_id: order.issue_id, status: order.status }, 200, headers)
      }
      if (body?.action !== 'checkout' || body.issue_id !== 'issue-02'
        || !Object.keys(body).every(k => ['action', 'issue_id'].includes(k))) throw new PaymentError('INVALID_REQUEST')
      if (!config.enabled) throw new PaymentError('SALES_CLOSED', 503)
      const order = await store.prepare(user.id, body.issue_id, config.mode)
      if (order.status === 'already_owned') return json({ status: 'already_owned', issue_id: body.issue_id }, 200, headers)
      if (order.status === 'processing') return json({ status: 'processing', order_id: order.id }, 200, headers)
      checkPrice(await stripe.prices.retrieve(order.price_id), order, config.mode)
      const session = order.session_id
        ? await stripe.checkout.sessions.retrieve(order.session_id)
        : await stripe.checkout.sessions.create(checkoutParameters(order, config), { idempotencyKey: `dustline-order-${order.id}` })
      if (session.status !== 'open') return json({ status: session.status === 'complete' ? 'processing' : 'expired', order_id: order.id }, 200, headers)
      if (!validCheckoutUrl(session.url)) throw new PaymentError('CHECKOUT_UNAVAILABLE', 503)
      await store.bindSession(order.id, session.id)
      return json({ status: 'open', order_id: order.id, url: session.url, amount_jpy: order.amount_jpy }, 200, headers)
    } catch (error) {
      return json({ error: error instanceof PaymentError ? error.code : 'PAYMENT_SERVICE_UNAVAILABLE' }, error instanceof PaymentError ? error.status : 503, headers)
    }
  }
}

const sessionEvents = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed', 'checkout.session.expired'])
const chargeEvents = new Set(['charge.refunded', 'charge.dispute.created', 'charge.dispute.closed'])

export function createWebhookHandler({ verify, store, stripe, config }) {
  return async (request) => {
    if (request.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405)
    let event
    try {
      validateEnvironment(config)
      const raw = await request.text()
      if (raw.length > 262144) throw new Error('Oversized body')
      const signature = request.headers.get('stripe-signature')
      if (!signature) throw new Error('Signature required')
      event = await verify(raw, signature)
    } catch { return json({ error: 'INVALID_WEBHOOK' }, 400) }
    try {
      if (event.livemode !== (config.mode === 'live')) throw new PaymentError('MODE_MISMATCH')
      if (!sessionEvents.has(event.type) && !chargeEvents.has(event.type)) return json({ received: true }, 200)
      let session, intent, state
      if (sessionEvents.has(event.type)) {
        session = await stripe.checkout.sessions.retrieve(event.data.object.id, { expand: ['line_items', 'payment_intent.latest_charge'] })
        if (session.metadata?.integration !== 'dustline_issues') return json({ received: true }, 200)
        intent = session.payment_intent
        if (event.type === 'checkout.session.expired') {
          if (session.status !== 'expired') return json({ received: true }, 200)
          state = 'expired'
        } else if (event.type === 'checkout.session.async_payment_failed') {
          if (session.payment_status === 'paid') return json({ received: true }, 200)
          state = 'failed'
        } else {
          state = session.payment_status === 'paid' ? 'paid' : 'processing'
        }
      } else {
        const chargeId = event.type === 'charge.refunded' ? event.data.object.id : stripeId(event.data.object.charge)
        const charge = await stripe.charges.retrieve(chargeId)
        intent = await stripe.paymentIntents.retrieve(stripeId(charge.payment_intent))
        if (intent.metadata?.integration !== 'dustline_issues') return json({ received: true }, 200)
        // Partial refunds keep access; a won dispute requires an operator's review.
        if (event.type === 'charge.refunded') {
          if (!charge.refunded || charge.amount_refunded < charge.amount) return json({ received: true }, 200)
          state = 'refunded'
        } else if (event.type === 'charge.dispute.created') state = 'disputed'
        else return json({ received: true }, 200)
        const order = await store.order(intent.metadata.order_id)
        if (!order?.session_id) throw new Error('Order binding not ready')
        session = await stripe.checkout.sessions.retrieve(order.session_id, { expand: ['line_items'] })
      }
      const order = await store.order(session.metadata.order_id)
      if (!order) throw new Error('Order not ready')
      validateSession(session, order, config.mode)
      if (intent && stripeId(intent) !== stripeId(session.payment_intent)) throw new Error('Intent mismatch')
      // Canonical charge state prevents a delayed completed event from restoring refunded access.
      if (state === 'paid' && intent?.latest_charge && typeof intent.latest_charge === 'object') {
        const charge = intent.latest_charge
        if (charge.refunded && charge.amount_refunded >= charge.amount) state = 'refunded'
        else if (charge.disputed) state = 'disputed'
      }
      if (state === 'paid' && (session.payment_status !== 'paid' || !stripeId(session.payment_intent))) throw new Error('Not paid')
      await store.apply({ event, order, session, state, mode: config.mode })
      return json({ received: true }, 200)
    } catch {
      // Failed database/API work must be retried by Stripe, never acknowledged as success.
      return json({ error: 'WEBHOOK_PROCESSING_RETRY' }, 503)
    }
  }
}
