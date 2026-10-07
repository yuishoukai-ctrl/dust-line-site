import { readdir, readFile, lstat } from 'node:fs/promises'
import { resolve, join, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const dist = join(root, 'dist')
const maxBytes = 25 * 1024 * 1024
const files = []
const errors = []

async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    const name = relative(dist, path).replaceAll('\\', '/')
    if (entry.isSymbolicLink()) { errors.push(`Symbolic link: ${name}`); continue }
    if (entry.isDirectory()) { await scan(path); continue }
    const { size } = await lstat(path)
    files.push({ path: name, bytes: size })
    if (size > maxBytes) errors.push(`Asset exceeds 25 MiB: ${name}`)
    if (/(^|\/)(\.env(?:\..*)?|\.git|node_modules)(\/|$)/.test(name)) errors.push(`Private build input: ${name}`)
    if (['.js', '.html', '.json', '.txt', '.map'].includes(extname(name))) {
      const content = await readFile(path, 'utf8')
      if (/(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|whsec_[A-Za-z0-9]{16,}/.test(content)) errors.push(`Server credential pattern in ${name}`)
      if (content.includes('hqoqvdhppgsbjhmvrrzm') || content.includes('local-qa-reader')) errors.push(`Sandbox or fixture data in ${name}`)
    }
  }
}

await scan(dist)
if (files.length > 20000) errors.push('Asset count exceeds the Workers Free limit')
for (const path of ['index.html', 'account/login/index.html', 'account/signup/index.html', 'account/verify/index.html', 'library/index.html', 'issues/issue-01/index.html', 'magazine/issue-02/index.html', '_headers']) {
  if (!files.some(file => file.path === path)) errors.push(`Required route or configuration missing: ${path}`)
}
const config = JSON.parse(await readFile(join(root, 'wrangler.json'), 'utf8'))
if (config.main || config.routes?.length || config.route || config.assets.run_worker_first) errors.push('Migration must deploy static assets without activating a domain or Worker script')
if (errors.length) throw new Error(errors.join('\n'))
console.log(JSON.stringify({ ok: true, assets: files.length, totalMiB: +(files.reduce((sum, file) => sum + file.bytes, 0) / 1024 ** 2).toFixed(2), largestMiB: +(Math.max(...files.map(file => file.bytes)) / 1024 ** 2).toFixed(2), routesChecked: 7, credentialsFound: false, sandboxDataFound: false, customDomainActivated: false }, null, 2))
