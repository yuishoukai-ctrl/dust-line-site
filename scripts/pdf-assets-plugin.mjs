import { readdirSync, readFileSync, createReadStream } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = dirname(fileURLToPath(import.meta.resolve('pdfjs-dist/package.json')))
const { version } = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
const directories = ['cmaps', 'standard_fonts', 'wasm']
const prefix = `/pdfjs/${version}/`

// Keep the worker's font/codec assets on our own origin, at their expected names.
export default function pdfAssetsPlugin() {
  let building = false
  return {
    name: 'dustline-pdf-assets',
    configResolved(config) { building = config.command === 'build' },
    buildStart() {
      if (!building) return
      for (const directory of directories) {
        for (const file of readdirSync(join(packageRoot, directory))) {
          if (file.endsWith('.map')) continue
          this.emitFile({ type: 'asset', fileName: `${prefix.slice(1)}${directory}/${file}`, source: readFileSync(join(packageRoot, directory, file)) })
        }
      }
    },
    configureServer(server) {
      server.middlewares.use(prefix, (request, response, next) => {
        const [directory, file, extra] = request.url.split('?')[0].split('/').filter(Boolean)
        if (extra || !directories.includes(directory) || !readdirSync(join(packageRoot, directory)).includes(file)) return next()
        response.setHeader('Content-Type', file.endsWith('.wasm') ? 'application/wasm' : file.endsWith('.js') ? 'text/javascript' : 'application/octet-stream')
        createReadStream(join(packageRoot, directory, file)).pipe(response)
      })
    },
  }
}
