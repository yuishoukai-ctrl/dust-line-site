// Loopback-only UI/database rehearsal. Synthetic data; no production or email IO.
import { createServer } from 'vite'
import { PGlite } from '@electric-sql/pglite'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createHmac } from 'node:crypto'
import { createReservationHandler, ReservationError } from '../supabase/functions/_shared/parts-reservation.mjs'
const db = new PGlite()
const lostResponses = new Set()
await db.exec('create role anon; create role authenticated; create role service_role bypassrls;')
await db.exec(await readFile(new URL('../supabase/migrations/20261013090000_parts_reservations.sql', import.meta.url), 'utf8'))
await db.exec('update public.parts_reservation_catalog set enabled=true')
const handler = createReservationHandler({
  config: { enabled: true, origins: ['http://127.0.0.1:4194'] },
  hash: async value => createHmac('sha256', 'synthetic-preview-only').update(value).digest('hex'),
  verifyChallenge: async token => ({ success: token === 'preview-token', hostname: '127.0.0.1', action: 'parts_reservation' }),
  store: { receive: async value => {
    try { return (await db.query('select public.parts_receive_reservation($1,$2,$3,$4,$5,$6,$7,$8) as item', [value.request_id, value.product, value.quantity, value.name, value.email, value.email_key, value.fingerprint, value.policy_version])).rows[0].item }
    catch (error) { const code = ['CLOSED', 'RATE_LIMIT', 'RETRY_CONFLICT'].find(c => error.message.includes(c)); if (code) throw new ReservationError(code, 409); throw error }
  } },
})
const server = await createServer({
  server: { host: '127.0.0.1', port: 4194, strictPort: true },
  plugins: [{
    name: 'synthetic-parts-reservation-preview', enforce: 'pre',
    resolveId(source, importer) {
      if (!importer?.endsWith('/src/PartsReservationForm.jsx')) return
      if (source === './lib/parts-reservation-config') return resolve('tests/fixtures/parts-reservation-preview-config.js')
      if (source === './TurnstileChallenge') return resolve('tests/fixtures/PartsReservationPreviewChallenge.jsx')
    },
    configureServer(server) { server.middlewares.use('/__parts-reservations-preview', async (req, res) => {
      try {
        const chunks = []; let size = 0
        for await (const chunk of req) { size += chunk.length; if (size > 8192) { res.writeHead(413); res.end(); return } chunks.push(chunk) }
        const request = new Request('http://127.0.0.1:4194/__parts-reservations-preview', { method: req.method, headers: req.headers, ...(req.method === 'POST' ? { body: Buffer.concat(chunks) } : {}) })
        const response = await handler(request)
        const payload = req.method === 'POST' ? JSON.parse(Buffer.concat(chunks).toString()) : null
        if (response.status === 201 && payload?.email === 'retry@example.invalid' && !lostResponses.has(payload.request_id)) {
          lostResponses.add(payload.request_id)
          res.writeHead(503, Object.fromEntries(response.headers)); res.end(JSON.stringify({ error: 'UNAVAILABLE' })); return
        }
        res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(await response.text())
      } catch { res.writeHead(503); res.end(JSON.stringify({ error: 'UNAVAILABLE' })) }
    }) },
  }],
})
await server.listen()
console.log('Synthetic reservation preview: http://127.0.0.1:4194/parts/guard-factory/f450gs-radiator-guard/#gf-reservation')
const close = async () => { await server.close(); await db.close(); process.exit(0) }
process.on('SIGINT', close); process.on('SIGTERM', close)
