import Stripe from 'npm:stripe@23.0.0'
import { createClient } from 'npm:@supabase/supabase-js@2.112.3'
import { PaymentError, validateEnvironment } from './issue-payment.mjs'

const required = (name: string) => { const value = Deno.env.get(name)?.trim(); if (!value) throw new Error('Missing server configuration'); return value }

export function paymentRuntime() {
  const config = {
    mode: Deno.env.get('STRIPE_MODE') ?? 'test',
    enabled: Deno.env.get('ISSUE_PAYMENTS_ENABLED') === 'true',
    stripeKey: required('STRIPE_RESTRICTED_KEY'),
    supabaseUrl: required('SUPABASE_URL'), siteUrl: required('PAYMENT_SITE_URL'),
    origins: required('PAYMENT_ALLOWED_ORIGINS').split(',').map(s => s.trim()),
  }
  validateEnvironment(config)
  const stripe = new Stripe(config.stripeKey, { apiVersion: '2026-09-30.endive', httpClient: Stripe.createFetchHttpClient(), maxNetworkRetries: 2 })
  const admin = createClient(config.supabaseUrl, required('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } })
  const checked = (result: { data: any, error: any }) => {
    if (result.error) {
      const code = ['SALES_CLOSED','PRICE_CHANGED','RATE_LIMIT'].find(code => result.error.message?.includes(code))
      if (code) throw new PaymentError(code, code === 'RATE_LIMIT' ? 429 : 409)
      throw new Error('Database operation failed')
    }
    return result.data
  }
  const store = {
    prepare: async (user: string, issue: string, mode: string) => checked(await admin.rpc('stripe_prepare_order', { p_user_id: user, p_issue_id: issue, p_mode: mode })),
    ownOrder: async (id: string, user: string, mode: string) => checked(await admin.from('stripe_orders').select('id,issue_id,status').eq('id',id).eq('user_id',user).eq('mode',mode).maybeSingle()),
    order: async (id: string) => checked(await admin.from('stripe_orders').select('*').eq('id',id).maybeSingle()),
    bindSession: async (id: string, session: string) => {
      checked(await admin.from('stripe_orders').update({ session_id: session, status: 'open', updated_at: new Date().toISOString() }).eq('id',id).eq('status','creating').is('session_id',null))
      const current = checked(await admin.from('stripe_orders').select('session_id').eq('id',id).single())
      if (current.session_id !== session) throw new Error('Session binding failed')
    },
    apply: async ({ event, order, session, state, mode }: any) => checked(await admin.rpc('stripe_apply_event', {
      p_event_id: event.id, p_event_type: event.type, p_order_id: order.id, p_session_id: session.id,
      p_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null,
      p_state: state, p_mode: mode, p_amount_jpy: session.amount_total, p_price_id: order.price_id,
    })),
  }
  return {
    config, stripe, store,
    auth: async (token: string) => { const { data, error } = await admin.auth.getUser(token); return error ? null : data.user },
    verify: (raw: string, signature: string) => stripe.webhooks.constructEventAsync(raw, signature, required('STRIPE_WEBHOOK_SECRET'), undefined, Stripe.createSubtleCryptoProvider()),
  }
}
