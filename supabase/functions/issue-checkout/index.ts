import { paymentRuntime } from '../_shared/payment-runtime.ts'
import { createCheckoutHandler } from '../_shared/issue-payment.mjs'

Deno.serve(async request => {
  try { return await createCheckoutHandler(paymentRuntime())(request) }
  catch { return new Response(JSON.stringify({ error: 'PAYMENT_CONFIGURATION_UNAVAILABLE' }), { status: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }) }
})
