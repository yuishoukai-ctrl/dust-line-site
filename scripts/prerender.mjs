import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { constants, existsSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(projectRoot, 'dist')
const siteOrigin = 'https://dustline.jp'
const publishedDate = '2026-07-17'
const modifiedDate = '2026-07-22'

const routes = [
  {
    path: '/',
    source: '/',
    title: 'DUST LINE｜アドベンチャーバイク・オフロードの無料WEBマガジン',
    description: 'DUST LINEは、アドベンチャーバイクとオフロードの旅、実車製作、溶接・塗装・整備を一次取材で届ける無料WEBマガジンです。',
    image: '/og.png',
    imageAlt: 'DUST LINE ISSUE 01とアドベンチャーバイクの公式ビジュアル',
    schemaType: 'WebPage',
    expectedText: '道の先ではなく',
  },
  {
    path: '/company/',
    source: '/?page=company',
    title: 'DUST LINEについて｜編集部・運営情報',
    description: 'アドベンチャーバイクWEBマガジン「DUST LINE」の編集方針と、編集長・副編集長のプロフィールを紹介します。',
    image: '/og.png',
    imageAlt: 'DUST LINE編集部の運営情報',
    schemaType: 'AboutPage',
    expectedText: '運営情報',
  },
  {
    path: '/goods/',
    source: '/?page=goods',
    title: 'DUST LINE公式グッズ｜Tシャツ・ステッカー',
    description: '旅と機械、雑誌づくりから生まれたDUST LINE公式Tシャツとステッカーを紹介。SUZURIで販売しています。',
    image: '/images/goods/suzuri/dust-line-official-white-back-suzuri.webp',
    imageAlt: 'SUZURIで販売中のDUST LINE公式Tシャツ',
    schemaType: 'CollectionPage',
    expectedText: '公式ショップ',
  },
  {
    path: '/advertise/',
    source: '/?page=advertise',
    title: '創刊号の無料広告募集｜DUST LINE',
    description: 'バイク、工具、溶接、塗装・鈑金など、バイクに関連する事業者向けにDUST LINE創刊号の無料広告を募集しています。',
    image: '/images/ad-recruitment-issue-01-cover.webp',
    imageAlt: 'DUST LINE創刊号の広告募集案内',
    schemaType: 'WebPage',
    expectedText: 'バイクに関わる仕事',
  },
  {
    path: '/privacy/',
    source: '/?page=privacy',
    title: 'プライバシー・免責事項｜DUST LINE',
    description: 'DUST LINE公式サイトのプライバシーポリシー、免責事項、広告掲載に関する方針をご案内します。',
    image: '/og.png',
    imageAlt: 'DUST LINE公式サイト',
    schemaType: 'WebPage',
    expectedText: 'プライバシー',
  },
  {
    path: '/articles/hokkaido-1190/',
    source: '/?article=hokkaido-1190',
    title: 'KTM 1190 ADVENTUREで北海道・利尻島・礼文島へ｜DUST LINE',
    description: 'KTM 1190 ADVENTUREで北海道と利尻島・礼文島を巡った10日間、約3,500kmのツーリング記録。トラブルと北の景色を実体験で綴ります。',
    image: '/images/hokkaido-1190/hero-ktm-ferry-departure.jpg',
    imageAlt: '北海道行きフェリーを待つKTM 1190 ADVENTURE',
    schemaType: 'Article',
    section: '旅・ツーリング',
    expectedText: 'KTM 1190 ADVENTUREで行く',
  },
  {
    path: '/articles/ktm-990-adv-s/',
    source: '/?article=ktm-990-adv-s',
    title: 'KTM 990 ADVENTURE S｜12年乗って分かったダートで際立つLC8｜DUST LINE',
    description: '2007年型KTM 990 ADVENTURE Sを12年所有したライダーが語る、LC8の手応え、前後265mmの足、ダートでの走り、40Lタンクなど3つの変更。',
    image: '/images/ktm-990-adv-s/01-dirt-slide.webp',
    imageAlt: 'ダートでKTM 990 ADVENTURE Sをスライドさせるライダー',
    schemaType: 'Article',
    section: '車両・インプレッション',
    publishedDate: '2026-07-22',
    modifiedDate: '2026-07-22',
    expectedText: '12年乗って分かった',
  },
  {
    path: '/articles/world-trip/',
    source: '/?article=world-trip',
    title: 'KLR650にIMS 37Lタンクを装着｜世界一周仕様の製作記録',
    description: 'KLR650を世界一周仕様へ。IMS 37Lビッグタンクの装着、車両選び、製作の理由、そして旅が止まった理由までを記録します。',
    image: '/images/world-trip/completed-klr650.jpg',
    imageAlt: 'IMS 37Lタンクを装着した世界一周仕様のKLR650',
    schemaType: 'Article',
    section: '車両製作',
    expectedText: 'KLR650で',
  },
  {
    path: '/articles/machine-file-001/',
    source: '/?article=machine-file-001',
    title: 'BMW R1200GSを60Lタンク・3灯化｜大陸横断マシン製作記録',
    description: '60L燃料タンク、トリプルヘッドライト、6mmアーマーを備えたBMW R1200GS。大陸横断を想定した一台の設計と製作を紹介します。',
    image: '/images/machine-file-001-spread.webp',
    imageAlt: '60Lタンクとトリプルヘッドライトを備えた大陸横断仕様車',
    schemaType: 'Article',
    section: '車両製作',
    expectedText: '大陸横断',
  },
  {
    path: '/travel/',
    source: '/travel/',
    title: 'アドベンチャーバイクの旅・ツーリング記事｜DUST LINE',
    description: '北海道、離島、林道、長距離旅。DUST LINE編集部が実際に走って記録したアドベンチャーバイクのツーリング記事をまとめています。',
    image: '/images/hokkaido-1190/04-ororon-wind-turbine-road.jpg',
    imageAlt: '北海道の道を走るアドベンチャーバイク',
    schemaType: 'CollectionPage',
    expectedText: '旅の記録',
  },
  {
    path: '/build/',
    source: '/build/',
    title: 'アドベンチャーバイクの車両製作・カスタム記事｜DUST LINE',
    description: 'KLR650の37Lタンク化や大陸横断仕様車など、アドベンチャーバイクの実車製作とカスタムを写真付きで紹介します。',
    image: '/images/world-trip/completed-klr650.jpg',
    imageAlt: 'DUST LINEが記録したアドベンチャーバイクの車両製作',
    schemaType: 'CollectionPage',
    expectedText: '車両製作',
  },
  {
    path: '/garage/',
    source: '/garage/',
    title: 'バイクの溶接・塗装・整備記事｜DUST LINE GARAGE',
    description: 'サイドスタンド拡張、溶接、塗装、研磨、車両整備。現場で確かめた工程と判断をDUST LINE GARAGEの記事で紹介します。',
    image: '/images/bike-front.jpg',
    imageAlt: 'DUST LINE GARAGEの車両製作・整備',
    schemaType: 'CollectionPage',
    expectedText: '溶接・塗装・整備',
  },
]

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
}

const canRead = async (path) => {
  try {
    await access(path, constants.R_OK)
    return true
  } catch {
    return false
  }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1')
    const pathname = decodeURIComponent(url.pathname)
    const candidate = join(distDir, pathname.endsWith('/') ? `${pathname}index.html` : pathname)
    const filePath = await canRead(candidate) ? candidate : join(distDir, 'index.html')
    const body = await readFile(filePath)
    response.writeHead(200, { 'content-type': mimeTypes[extname(filePath)] ?? 'application/octet-stream' })
    response.end(body)
  } catch (error) {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    response.end(error instanceof Error ? error.message : String(error))
  }
})

const findBrowser = () => {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean)
  return candidates.find(existsSync)
}

class CdpClient {
  constructor(socket) {
    this.socket = socket
    this.nextId = 1
    this.pending = new Map()
    socket.addEventListener('message', async (event) => {
      const raw = typeof event.data === 'string' ? event.data : await event.data.text()
      const message = JSON.parse(raw)
      if (!message.id || !this.pending.has(message.id)) return
      const pending = this.pending.get(message.id)
      this.pending.delete(message.id)
      clearTimeout(pending.timer)
      if (message.error) pending.reject(new Error(message.error.message))
      else pending.resolve(message.result)
    })
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++
    return new Promise((resolveCommand, rejectCommand) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        rejectCommand(new Error(`CDP command timed out: ${method}`))
      }, 15000)
      this.pending.set(id, { resolve: resolveCommand, reject: rejectCommand, timer })
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
    })
  }
}

const launchBrowser = async (browser) => {
  const userDataDir = await mkdtemp(join(tmpdir(), 'dust-line-prerender-'))
  const child = spawn(browser, [
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-background-networking',
    '--no-sandbox',
    '--no-first-run',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] })

  child.stderr.setEncoding('utf8')
  let startupLog = ''
  const webSocketUrl = await new Promise((resolveSocket, rejectSocket) => {
    const timer = setTimeout(() => rejectSocket(new Error(`Browser startup timed out: ${startupLog.slice(-600)}`)), 15000)
    const finish = (callback, value) => {
      clearTimeout(timer)
      callback(value)
    }
    child.stderr.on('data', (chunk) => {
      startupLog += chunk
      const match = startupLog.match(/DevTools listening on (ws:\/\/\S+)/)
      if (match) finish(resolveSocket, match[1])
    })
    child.once('error', (error) => finish(rejectSocket, error))
    child.once('exit', (code) => finish(rejectSocket, new Error(`Browser exited during startup (${code ?? 'unknown'}).`)))
  })

  const socket = new WebSocket(webSocketUrl)
  await new Promise((resolveOpen, rejectOpen) => {
    const timer = setTimeout(() => rejectOpen(new Error('DevTools WebSocket connection timed out.')), 10000)
    socket.addEventListener('open', () => { clearTimeout(timer); resolveOpen() }, { once: true })
    socket.addEventListener('error', (event) => { clearTimeout(timer); rejectOpen(event.error ?? new Error('DevTools WebSocket connection failed.')) }, { once: true })
  })
  const client = new CdpClient(socket)

  return {
    child,
    client,
    userDataDir,
    async close() {
      try {
        await client.send('Browser.close')
      } catch {
        child.kill()
      }
      await new Promise((resolveExit) => {
        if (child.exitCode !== null) resolveExit()
        else {
          const timer = setTimeout(() => { child.kill(); resolveExit() }, 3000)
          child.once('exit', () => { clearTimeout(timer); resolveExit() })
        }
      })
      socket.close()
      await rm(userDataDir, { recursive: true, force: true })
    },
  }
}

const pause = (milliseconds) => new Promise((resolvePause) => setTimeout(resolvePause, milliseconds))

const dumpDom = async (browserSession, url) => {
  const { client } = browserSession
  const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await client.send('Target.attachToTarget', { targetId, flatten: true })
  try {
    await client.send('Page.enable', {}, sessionId)
    await client.send('Runtime.enable', {}, sessionId)
    await client.send('Page.navigate', { url }, sessionId)

    for (let attempt = 0; attempt < 100; attempt += 1) {
      const state = await client.send('Runtime.evaluate', {
        expression: "document.readyState === 'complete' && Boolean(document.querySelector('#root')?.firstElementChild)",
        returnByValue: true,
      }, sessionId)
      if (state.result?.value) break
      await pause(100)
      if (attempt === 99) throw new Error(`Rendered page did not become ready: ${url}`)
    }

    // Let React effects, route compatibility, and font/layout work settle.
    await pause(900)
    const result = await client.send('Runtime.evaluate', {
      expression: 'document.documentElement.outerHTML',
      returnByValue: true,
    }, sessionId)
    const html = result.result?.value
    if (typeof html !== 'string' || !html.includes('<div id="root">')) {
      throw new Error(`Rendered page did not produce a valid document: ${url}`)
    }
    return `<!doctype html>\n${html}`
  } finally {
    await client.send('Target.closeTarget', { targetId })
  }
}

const escapeAttribute = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

const absoluteUrl = (pathname) => new URL(pathname, siteOrigin).href

const pageSchema = (route) => {
  const canonical = absoluteUrl(route.path)
  const image = absoluteUrl(route.image)
  const graph = [
    {
      '@type': 'Organization',
      '@id': `${siteOrigin}/#organization`,
      name: 'DUST LINE',
      url: `${siteOrigin}/`,
      logo: { '@type': 'ImageObject', url: `${siteOrigin}/images/dust-line-logo.png` },
      sameAs: ['https://x.com/DUSTLINE_ADV'],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteOrigin}/#website`,
      url: `${siteOrigin}/`,
      name: 'DUST LINE',
      description: 'アドベンチャーバイクとオフロードの旅、実車製作、溶接・塗装・整備を一次取材で届ける無料WEBマガジン。',
      inLanguage: 'ja-JP',
      publisher: { '@id': `${siteOrigin}/#organization` },
    },
  ]

  if (route.schemaType === 'Article') {
    graph.push({
      '@type': 'Article',
      '@id': `${canonical}#article`,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      headline: route.title.replace(/｜DUST LINE(?: GARAGE)?$/, ''),
      description: route.description,
      image: [image],
      datePublished: route.publishedDate ?? publishedDate,
      dateModified: route.modifiedDate ?? modifiedDate,
      articleSection: route.section,
      inLanguage: 'ja-JP',
      author: { '@type': 'Organization', name: 'DUST LINE編集部', url: `${siteOrigin}/company/` },
      publisher: { '@id': `${siteOrigin}/#organization` },
    })
  } else {
    graph.push({
      '@type': route.schemaType,
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: route.title,
      description: route.description,
      isPartOf: { '@id': `${siteOrigin}/#website` },
      primaryImageOfPage: { '@type': 'ImageObject', url: image },
      inLanguage: 'ja-JP',
    })
  }

  if (route.path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'DUST LINE', item: `${siteOrigin}/` },
        { '@type': 'ListItem', position: 2, name: route.title.split('｜')[0], item: canonical },
      ],
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

const applyMetadata = (html, route) => {
  const canonical = absoluteUrl(route.path)
  const image = absoluteUrl(route.image)
  const title = escapeAttribute(route.title)
  const description = escapeAttribute(route.description)
  const imageAlt = escapeAttribute(route.imageAlt)
  const ogType = route.schemaType === 'Article' ? 'article' : 'website'
  const jsonLd = JSON.stringify(pageSchema(route)).replaceAll('<', '\\u003c')

  let clean = html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi, '')
    .replace(/<meta\b(?=[^>]*\bname=["'](?:description|robots|twitter:[^"']+)["'])[^>]*>\s*/gi, '')
    .replace(/<meta\b(?=[^>]*\bproperty=["']og:[^"']+["'])[^>]*>\s*/gi, '')
    .replace(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>\s*/gi, '')

  const metadata = `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
    <link rel="canonical" href="${canonical}">
    <meta property="og:locale" content="ja_JP">
    <meta property="og:type" content="${ogType}">
    <meta property="og:site_name" content="DUST LINE">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:alt" content="${imageAlt}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@DUSTLINE_ADV">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
    <meta name="twitter:image:alt" content="${imageAlt}">
    <script type="application/ld+json">${jsonLd}</script>
  `

  clean = clean.replace('</head>', `${metadata}</head>`)
  return clean.startsWith('<!DOCTYPE') ? clean : `<!doctype html>\n${clean}`
}

const htmlText = (html) => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const headingText = (html) => [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)]
  .map((match) => htmlText(match[1]))
  .join(' | ')

const verifyOutput = (html, route) => {
  const canonical = absoluteUrl(route.path)
  const checks = [
    html.includes(`<title>${escapeAttribute(route.title)}</title>`),
    html.includes(`<link rel="canonical" href="${canonical}">`),
    html.includes('<script type="application/ld+json">'),
    html.includes('<div id="root">'),
    htmlText(html).includes(route.expectedText),
  ]
  if (checks.some((passed) => !passed)) {
    throw new Error(`SEO verification failed for ${route.path}`)
  }
}

await access(join(distDir, 'index.html'), constants.R_OK)
const browser = findBrowser()
if (!browser) {
  throw new Error('Chrome or Chromium is required for SEO prerendering. Set CHROME_PATH to its executable.')
}

await new Promise((resolveListen, rejectListen) => {
  server.once('error', rejectListen)
  server.listen(0, '127.0.0.1', resolveListen)
})

const address = server.address()
if (!address || typeof address === 'string') throw new Error('Unable to start prerender server.')
const localOrigin = `http://127.0.0.1:${address.port}`
const browserSession = await launchBrowser(browser)

try {
  for (const route of routes) {
    const rendered = await dumpDom(browserSession, new URL(route.source, localOrigin).href)
    const outputPath = route.path === '/'
      ? join(distDir, 'index.html')
      : join(distDir, route.path.replace(/^\//, ''), 'index.html')
    await mkdir(dirname(outputPath), { recursive: true })
    const output = applyMetadata(rendered, route)
    verifyOutput(output, route)
    await writeFile(outputPath, output, 'utf8')
    console.log(`prerendered ${route.path}`)
  }

  // Test the public fixed URLs after every route file exists. The source pass
  // above also covers the legacy query URLs used by older links.
  for (const route of routes) {
    const runtimeHtml = await dumpDom(browserSession, new URL(route.path, localOrigin).href)
    if (!headingText(runtimeHtml).includes(route.expectedText)) {
      throw new Error(`Fixed-route runtime verification failed for ${route.path}`)
    }
    console.log(`verified ${route.path}`)
  }
} finally {
  await browserSession.close()
  await new Promise((resolveClose) => server.close(resolveClose))
}
