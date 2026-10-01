// Local-only browser fixture. Production Vite config does not import this file.
// node tests/local-preview.mjs "C:/path/to/review.pdf"
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { createReadStream, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import pdfAssetsPlugin from '../scripts/pdf-assets-plugin.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pdfPath = process.argv[2] && resolve(process.argv[2])
if (!pdfPath || !statSync(pdfPath).isFile()) throw new Error('Pass a local review PDF path.')
const mock = resolve(root, 'tests/fixtures/local-supabase.js')
const server = await createServer({
  configFile: false,
  root,
  envDir: false,
  server: { host: '127.0.0.1', port: 4174, strictPort: true },
  define: { 'import.meta.env.VITE_GA4_MEASUREMENT_ID': '""' },
  plugins: [
    {
      name: 'local-issn-qa', enforce: 'pre',
      resolveId(source) { if (/\/lib\/supabaseClient(?:\.js)?$/.test(source)) return mock },
      transformIndexHtml(html) {
        return html.replace('<body>', '<body><div style="position:fixed;z-index:99999;bottom:0;left:0;background:#fff3c4;color:#191919;padding:4px 12px;font:12px sans-serif">LOCAL QA・テスト会員／ローカルPDF</div>')
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.split('?')[0] !== '/_qa/magazine.pdf') return next()
          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Content-Length', statSync(pdfPath).size)
          res.setHeader('Cache-Control', 'no-store')
          createReadStream(pdfPath).pipe(res)
        })
      },
    },
    react(),
    pdfAssetsPlugin(),
  ],
})
await server.listen()
console.log('Local ISSN QA: http://127.0.0.1:4174/offroad-bike-magazine/')
