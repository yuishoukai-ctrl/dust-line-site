import test from 'node:test'
import assert from 'node:assert/strict'
import Stripe from 'stripe'
import { createServer } from 'node:http'
import { createClient } from '@supabase/supabase-js'
import { createCheckoutHandler, createWebhookHandler, checkoutParameters, validateEnvironment, validateSession } from '../supabase/functions/_shared/issue-payment.mjs'
import { callIssueCheckout, checkoutDestination, paidIssueMetadata } from '../src/lib/issue-checkout.js'

const user = { id:'11111111-1111-4111-8111-111111111111', email_confirmed_at:'2026-10-01T00:00:00Z' }
const config = { mode:'test', enabled:true, stripeKey:['rk','test','fixture'].join('_'), supabaseUrl:'http://127.0.0.1:54321',siteUrl:'http://127.0.0.1:4186',origins:['http://127.0.0.1:4186'] }
const signatureSecret = ['whsec','synthetic_fixture_not_a_credential'].join('_')
const sdk = new Stripe('synthetic-no-api-requests')
function fixture() {
  const order = { id:'33333333-3333-4333-8333-333333333333',issue_id:'issue-02',user_id:user.id,mode:'test',amount_jpy:1480,price_id:'price_fixture',status:'creating',session_id:null,expires_at:new Date(Date.now()+3600_000).toISOString() }
  const session = { id:'cs_fixture',status:'open',mode:'payment',livemode:false,currency:'jpy',amount_total:1480,payment_status:'paid',
    metadata:{integration:'dustline_issues',order_id:order.id,issue_id:'issue-02'},
    line_items:{data:[{quantity:1,price:{id:'price_fixture'}}],has_more:false},
    payment_intent:{id:'pi_fixture',latest_charge:{id:'ch_fixture',amount:1480,amount_refunded:0,refunded:false,disputed:false}},url:'https://checkout.stripe.com/c/pay/synthetic' }
  const applied=[], created=[]
  const store={
    prepare:async()=>order,order:async id=>id===order.id?order:null,
    ownOrder:async(id,uid,mode)=>id===order.id&&uid===user.id&&mode==='test'?order:null,
    bindSession:async(id,sid)=>{assert.equal(id,order.id);order.session_id=sid;order.status='open'},
    apply:async data=>{applied.push(data)},
  }
  const stripe={prices:{retrieve:async()=>({id:'price_fixture',active:true,type:'one_time',currency:'jpy',unit_amount:1480,livemode:false})},
    checkout:{sessions:{retrieve:async()=>session,create:async(params,options)=>{created.push({params,options});return session}}},
    charges:{retrieve:async()=>session.payment_intent.latest_charge},paymentIntents:{retrieve:async()=>({...session.payment_intent,metadata:session.metadata})} }
  const dependencies={config:{...config},stripe,store,auth:async token=>token==='synthetic-token'?user:null,
    verify:(raw,signature)=>sdk.webhooks.constructEventAsync(raw,signature,signatureSecret,undefined,Stripe.createSubtleCryptoProvider()) }
  return {order,session,applied,created,store,stripe,dependencies}
}
const request = body=>new Request(`${config.siteUrl}/`,{method:'POST',headers:{origin:config.siteUrl,'content-type':'application/json',authorization:'Bearer synthetic-token'},body:JSON.stringify(body)})
const eventRequest = (type,object,overrides={})=>{
  const payload=JSON.stringify({id:'evt_fixture',type,livemode:false,data:{object},...overrides})
  const signature=sdk.webhooks.generateTestHeaderString({payload,secret:signatureSecret})
  return new Request('http://127.0.0.1/webhook',{method:'POST',headers:{'stripe-signature':signature},body:payload})
}

test('authenticated checkout uses only the server price and stable order idempotency',async()=>{
  const f=fixture(),handler=createCheckoutHandler(f.dependencies)
  assert.equal((await handler(request({action:'checkout',issue_id:'issue-02'}))).status,200)
  assert.equal((await handler(request({action:'checkout',issue_id:'issue-02'}))).status,200)
  assert.equal(f.created.length,1)
  assert.equal(f.created[0].options.idempotencyKey,`dustline-order-${f.order.id}`)
  assert.equal(f.created[0].params.mode,'payment')
  assert.deepEqual(f.created[0].params.line_items,[{price:'price_fixture',quantity:1}])
  assert.equal('payment_method_types' in f.created[0].params,false)
  assert.equal('customer_email' in f.created[0].params,false)
  assert.deepEqual(checkoutParameters(f.order,config),f.created[0].params)
})
test('unauthenticated and unconfirmed users cannot start checkout',async()=>{
  const f=fixture();f.dependencies.auth=async()=>null
  assert.equal((await createCheckoutHandler(f.dependencies)(request({action:'checkout',issue_id:'issue-02'}))).status,401)
  f.dependencies.auth=async()=>({id:user.id})
  assert.equal((await createCheckoutHandler(f.dependencies)(request({action:'checkout',issue_id:'issue-02'}))).status,403)
  assert.equal(f.created.length,0)
})
test('client amount, user ID and unknown origins are rejected',async()=>{
  const f=fixture(),handler=createCheckoutHandler(f.dependencies)
  assert.equal((await handler(request({action:'checkout',issue_id:'issue-02',amount_jpy:1}))).status,400)
  assert.equal((await handler(request({action:'checkout',issue_id:'issue-02',user_id:'other'}))).status,400)
  const evil=request({action:'checkout',issue_id:'issue-02'});evil.headers.set('origin','https://attacker.invalid')
  assert.equal((await handler(evil)).status,403)
})
test('price ID/type/mode/amount mismatch fails without creating a session',async()=>{
  const f=fixture();f.stripe.prices.retrieve=async()=>({id:'price_fixture',active:true,type:'recurring',currency:'jpy',unit_amount:1480,livemode:false})
  assert.equal((await createCheckoutHandler(f.dependencies)(request({action:'checkout',issue_id:'issue-02'}))).status,409)
  assert.equal(f.created.length,0)
})
test('test keys cannot use the production Supabase database',()=>{
  assert.throws(()=>validateEnvironment({...config,supabaseUrl:'https://vndhldmmhvmpqvaizqci.supabase.co'}),/TEST_REQUIRES_ISOLATED_DATABASE/)
  assert.throws(()=>validateEnvironment({...config,stripeKey:['rk','live','fixture'].join('_')}),/CONFIGURATION_ERROR/)
})
test('return/status endpoint verifies ownership and never fulfills a payment',async()=>{
  const f=fixture(),handler=createCheckoutHandler(f.dependencies)
  assert.equal((await handler(request({action:'status',order_id:f.order.id}))).status,200)
  assert.equal((await handler(request({action:'status',order_id:'44444444-4444-4444-8444-444444444444'}))).status,404)
  assert.equal(f.applied.length,0)
})
test('real Stripe SDK verifies the signed body before accepting paid fulfillment',async()=>{
  const f=fixture();f.order.session_id=f.session.id
  const response=await createWebhookHandler(f.dependencies)(eventRequest('checkout.session.completed',{id:f.session.id}))
  assert.equal(response.status,200);assert.equal(f.applied[0].state,'paid')
})
test('a tampered or missing signature never reaches the database',async()=>{
  const f=fixture(),handler=createWebhookHandler(f.dependencies)
  const original=eventRequest('checkout.session.completed',{id:f.session.id})
  assert.equal((await handler(new Request(original.url,{method:'POST',headers:original.headers,body:'{}'}))).status,400)
  assert.equal((await handler(new Request(original.url,{method:'POST',body:'{}'}))).status,400)
  assert.equal(f.applied.length,0)
})
test('unpaid completion is processing; async success is paid',async()=>{
  const f=fixture(),handler=createWebhookHandler(f.dependencies)
  f.session.payment_status='unpaid'
  await handler(eventRequest('checkout.session.completed',{id:f.session.id}));assert.equal(f.applied[0].state,'processing')
  f.session.payment_status='paid'
  await handler(eventRequest('checkout.session.async_payment_succeeded',{id:f.session.id}));assert.equal(f.applied[1].state,'paid')
})
test('refund canonical state beats a delayed completion; partial refund keeps rights',async()=>{
  const f=fixture(),handler=createWebhookHandler(f.dependencies);f.order.session_id=f.session.id
  f.session.payment_intent.latest_charge.refunded=true;f.session.payment_intent.latest_charge.amount_refunded=1480
  await handler(eventRequest('checkout.session.completed',{id:f.session.id}));assert.equal(f.applied[0].state,'refunded')
  f.session.payment_intent.latest_charge.refunded=false;f.session.payment_intent.latest_charge.amount_refunded=100
  await handler(eventRequest('charge.refunded',{id:'ch_fixture'}));assert.equal(f.applied.length,1)
})
test('session mismatch/DB failure returns a retryable error rather than success',async()=>{
  const f=fixture(),handler=createWebhookHandler(f.dependencies)
  f.session.amount_total=1
  assert.equal((await handler(eventRequest('checkout.session.completed',{id:f.session.id}))).status,503)
  f.session.amount_total=1480;f.store.apply=async()=>{throw new Error('private database error')}
  const response=await handler(eventRequest('checkout.session.completed',{id:f.session.id}))
  assert.equal(response.status,503);assert.equal((await response.text()).includes('private database'),false)
})
test('current session identity and exactly one item are mandatory',()=>{
  const f=fixture();assert.doesNotThrow(()=>validateSession(f.session,f.order,'test'))
  assert.throws(()=>validateSession({...f.session,line_items:{data:[],has_more:false}},f.order,'test'),/PAYMENT_MISMATCH/)
})
test('frontend invokes a bounded request and does not accept unsafe redirect URLs',async()=>{
  let options
  const data=await callIssueCheckout({functions:{invoke:async(name,input)=>{assert.equal(name,'issue-checkout');options=input;return{data:{status:'paid'}}}}},{action:'status',order_id:'fixture'})
  assert.equal(data.status,'paid');assert.equal(options.timeout,25000)
  assert.equal(checkoutDestination('https://checkout.stripe.com/c/pay/fixture'),'https://checkout.stripe.com/c/pay/fixture')
  for(const url of ['javascript:alert(1)','http://checkout.stripe.com/c/pay/x','https://checkout.stripe.com.attacker.invalid/x'])assert.equal(checkoutDestination(url),null)
})
test('frontend only creates paid-reader metadata for a published positive-price issue',()=>{
  const record={id:'issue-02',issue_number:2,title:'Test issue',status:'published',price_jpy:1480}
  assert.equal(paidIssueMetadata(record).readerPath,'/issues/issue-02/')
  for(const patch of [{status:'upcoming'},{price_jpy:0},{id:'../../private'},{price_jpy:1.5}]) assert.equal(paidIssueMetadata({...record,...patch}),null)
})
test('a real stalled HTTP request is aborted by the Supabase Functions client timeout',async()=>{
  const server=createServer(()=>{})
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  const port=server.address().port
  const client=createClient(`http://127.0.0.1:${port}`,'synthetic-public-fixture',{auth:{persistSession:false,autoRefreshToken:false}})
  try {
    await assert.rejects(callIssueCheckout(client,{action:'checkout',issue_id:'issue-02'},{timeoutMs:100}),error=>error.code==='UNAVAILABLE')
  } finally { server.closeAllConnections();await new Promise(resolve=>server.close(resolve)) }
})
