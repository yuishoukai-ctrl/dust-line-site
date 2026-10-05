import test, { before, beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

const user = '11111111-1111-4111-8111-111111111111'
const other = '22222222-2222-4222-8222-222222222222'
let db
const migration = await readFile(new URL('../supabase/migrations/20261006000000_stripe_issue_payments.sql', import.meta.url), 'utf8')
before(async () => {
  db = new PGlite()
  await db.exec(await readFile(new URL('./fixtures/payment-schema.sql', import.meta.url),'utf8'))
  await db.exec(migration)
})
after(async () => { await db?.close() })
beforeEach(async () => {
  await db.exec('reset role; truncate public.stripe_webhook_events,public.stripe_orders,public.stripe_issue_catalog,public.entitlements,public.issues,auth.users cascade;')
  await db.query('insert into auth.users(id) values($1),($2)',[user,other])
  await db.exec("insert into public.issues values('issue-01','published',0,'JPY','issue-01/fixture.pdf'),('issue-02','published',1480,'JPY','issue-02/fixture.pdf'); insert into public.stripe_issue_catalog(issue_id,price_id,amount_jpy,mode,enabled) values('issue-02','price_fixture',1480,'test',true);")
})
const prepare = async (id=user) => (await db.query("select public.stripe_prepare_order($1,'issue-02','test') as item",[id])).rows[0].item
const bound = async () => { const o=await prepare(); await db.query("update public.stripe_orders set session_id='cs_fixture',status='open' where id=$1",[o.id]); return o }
const apply = async (o,state='paid',event='evt_fixture',amount=1480,session='cs_fixture') => (await db.query(
  'select public.stripe_apply_event($1,$2,$3,$4,$5,$6,$7,$8,$9) as item',
  [event,'checkout.session.completed',o.id,session,'pi_fixture',state,'test',amount,'price_fixture'],
)).rows[0].item
const rights = async () => (await db.query('select source,status from public.entitlements')).rows
const access = async () => { await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]); return (await db.query("select public.has_issue_access('issue-02') as allowed")).rows[0].allowed }

test('paid event grants the private-PDF entitlement once, including replay', async () => {
  const o=await bound()
  assert.equal(await access(),false)
  assert.equal((await apply(o)).status,'paid')
  assert.equal((await apply(o)).status,'duplicate')
  assert.deepEqual(await rights(),[{source:'stripe',status:'active'}])
  assert.equal(await access(),true)
})
test('open checkout reservations are reused for repeated requests', async () => {
  const results=await Promise.all([prepare(),prepare(),prepare()])
  assert.equal(new Set(results.map(x=>x.id)).size,1)
})
test('asynchronous processing and failure never grant access', async () => {
  const o=await bound(); await apply(o,'processing'); assert.equal(await access(),false)
  await apply(o,'failed','evt_failed'); await apply(o,'processing','evt_old_complete')
  assert.equal((await db.query('select status from public.stripe_orders')).rows[0].status,'failed')
  assert.equal(await access(),false)
})
test('an asynchronous success grants access after unpaid completion', async () => {
  const o=await bound(); await apply(o,'processing'); await apply(o,'paid','evt_async_success')
  assert.equal(await access(),true)
})
test('full refund revokes only Stripe rights and stale success cannot restore them', async () => {
  const o=await bound(); await apply(o); await apply(o,'refunded','evt_refund'); await apply(o,'paid','evt_late_paid')
  assert.deepEqual(await rights(),[{source:'stripe',status:'refunded'}]); assert.equal(await access(),false)
})
test('refund arriving before completed event prevents access', async () => {
  const o=await bound(); await apply(o,'refunded','evt_refund_first'); await apply(o,'paid','evt_old_success')
  assert.equal(await access(),false)
})
test('dispute revokes access and needs a reviewed resolution', async () => {
  const o=await bound(); await apply(o); await apply(o,'disputed','evt_dispute'); await apply(o,'paid','evt_replay_paid')
  assert.deepEqual(await rights(),[{source:'stripe',status:'revoked'}])
})
test('active rights from another channel are preserved on Stripe refund', async () => {
  const o=await bound()
  await db.query("insert into public.entitlements(user_id,issue_id,source) values($1,'issue-02','apple_app_store')",[user])
  await apply(o); await apply(o,'refunded','evt_refund')
  assert.deepEqual(await rights(),[{source:'apple_app_store',status:'active'}])
})
test('price/session mismatches roll back both event and entitlement', async () => {
  const o=await bound(); await assert.rejects(apply(o,'paid','evt_wrong_amount',1),/PAYMENT_MISMATCH/)
  await assert.rejects(apply(o,'paid','evt_wrong_session',1480,'cs_other'),/PAYMENT_MISMATCH/)
  assert.equal((await db.query('select count(*)::int as n from public.stripe_webhook_events')).rows[0].n,0)
  assert.equal(await access(),false)
})
test('an upcoming issue, missing PDF or disabled catalogue blocks checkout', async () => {
  await db.exec("update public.issues set status='upcoming' where id='issue-02'")
  await assert.rejects(prepare(),/SALES_CLOSED/)
  await db.exec("update public.issues set status='published',storage_path=null where id='issue-02'")
  await assert.rejects(prepare(),/SALES_CLOSED/)
  await db.exec("update public.issues set storage_path='issue-02/fixture.pdf';update public.stripe_issue_catalog set enabled=false")
  await assert.rejects(prepare(),/SALES_CLOSED/)
})
test('owned issues cannot be purchased again', async () => {
  const o=await bound(); await apply(o); assert.equal((await prepare()).status,'already_owned')
})
test('processing payment is retained even after the local expiry time', async () => {
  const o=await bound(); await apply(o,'processing')
  await db.query("update public.stripe_orders set expires_at=now()-interval '1 day' where id=$1",[o.id])
  assert.equal((await prepare()).id,o.id)
})
test('authenticated users cannot call fulfillment/reservation or forge orders', async () => {
  await db.exec('set role authenticated')
  await assert.rejects(prepare(),/permission denied/)
  await assert.rejects(db.query("insert into public.stripe_orders(user_id,issue_id,mode,price_id,amount_jpy) values($1,'issue-02','test','price_fixture',1480)",[user]),/permission denied/)
})
test('the server service role can reserve and apply a verified payment', async () => {
  await db.exec('set role service_role')
  const o=await bound(); await apply(o)
  await db.exec('reset role'); assert.equal(await access(),true)
})
test('RLS exposes only the current user’s order', async () => {
  await prepare(); await prepare(other)
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]); await db.exec('set role authenticated')
  const result=(await db.query('select user_id from public.stripe_orders')).rows
  assert.deepEqual(result,[{user_id:user}])
})
test('migration can be reapplied without changing existing access', async () => {
  const o=await bound(); await apply(o); await db.exec(migration); assert.equal(await access(),true)
})
