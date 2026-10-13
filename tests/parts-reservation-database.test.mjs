import test, { before, beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
let db
const migration = await readFile(new URL('../supabase/migrations/20261013090000_parts_reservations.sql', import.meta.url), 'utf8')
const product = 'f450gs-radiator-guard'
const key = 'a'.repeat(64), fingerprint = 'b'.repeat(64)
const id = n => `11111111-1111-4111-8111-${String(n).padStart(12, '0')}`
const receive = async (n = 1, qty = 2, hash = fingerprint, emailKey = key) => (await db.query('select public.parts_receive_reservation($1,$2,$3,$4,$5,$6,$7,$8) as item', [id(n), product, qty, '検証用', 'test@example.invalid', emailKey, hash, '2026-10-13-v1'])).rows[0].item
before(async () => { db = new PGlite(); await db.exec('create role anon; create role authenticated; create role service_role bypassrls;'); await db.exec(migration) })
after(async () => { await db?.close() })
beforeEach(async () => { await db.exec('reset role; truncate public.parts_reservation_receipts, public.parts_reservations; update public.parts_reservation_catalog set enabled=true;') })

test('database makes a private non-payment request and exact retry does not add quantity', async () => {
  assert.equal((await receive()).request_id, id(1)); await receive()
  assert.equal((await db.query('select count(*)::int as n from public.parts_reservations')).rows[0].n, 1)
  assert.equal((await db.query('select count(*)::int as n from public.parts_reservation_receipts')).rows[0].n, 1)
  assert.equal((await db.query('select quantity,status from public.parts_reservations')).rows[0].status, 'requested')
})
test('new retry IDs or changed quantity cannot overwrite or double-count an existing guest', async () => {
  await receive(); await receive(2, 9, 'c'.repeat(64))
  assert.deepEqual((await db.query('select quantity from public.parts_reservations')).rows, [{ quantity: 2 }])
  assert.equal((await db.query('select count(*)::int as n from public.parts_reservation_receipts')).rows[0].n, 2)
  await assert.rejects(receive(1, 9, 'c'.repeat(64)), /RETRY_CONFLICT/)
})
test('cancelled request can be replaced by a new non-binding request', async () => {
  await receive(); await db.exec("update public.parts_reservations set status='cancelled'"); await receive(2)
  assert.equal((await db.query("select count(*)::int as n from public.parts_reservations where status='requested'")).rows[0].n, 1)
})
test('catalog shutdown and invalid quantities reject writes but an accepted receipt remains recoverable', async () => {
  await receive(); await db.exec('update public.parts_reservation_catalog set enabled=false')
  await assert.rejects(receive(2), /CLOSED/)
  assert.equal((await receive()).request_id, id(1))
  await db.exec('update public.parts_reservation_catalog set enabled=true')
  await assert.rejects(receive(2, 11), /INVALID_INPUT/)
})
test('email rate limit is atomic and failed attempts do not count', async () => {
  for (let i = 1; i <= 5; i++) await receive(i)
  await assert.rejects(receive(6), /RATE_LIMIT/)
  assert.equal((await db.query('select count(*)::int as n from public.parts_reservation_receipts')).rows[0].n, 5)
})
test('anonymous and ordinary member roles cannot read contacts, receipts or execute the RPC', async () => {
  await receive()
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`set role ${role}`)
    for (const table of ['parts_reservation_catalog', 'parts_reservations', 'parts_reservation_receipts']) await assert.rejects(db.query(`select * from public.${table}`), /permission denied/)
    await assert.rejects(receive(2), /permission denied/)
    await db.exec('reset role')
  }
})
test('the server service role can register while guests cannot', async () => {
  await db.exec('set role service_role')
  assert.equal((await receive()).request_id, id(1))
  assert.equal((await db.query('select quantity from public.parts_reservations')).rows[0].quantity, 2)
  await db.exec('reset role')
})
