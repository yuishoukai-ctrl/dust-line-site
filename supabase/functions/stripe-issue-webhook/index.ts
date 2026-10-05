import { paymentRuntime } from '../_shared/payment-runtime.ts'
import { createWebhookHandler } from '../_shared/issue-payment.mjs'

Deno.serve(async request => {
  try { return await createWebhookHandler(paymentRuntime())(request) }
  catch { return new Response(JSON.stringify({ error: 'WEBHOOK_CONFIGURATION_UNAVAILABLE' }), { status: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }) }
})
