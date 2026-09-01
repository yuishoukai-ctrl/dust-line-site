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
const modifiedDate = '2026-08-06'

const routes = [
  {
    path: '/',
    source: '/',
    title: 'オフロードバイク雑誌 DUST LINE｜アドベンチャー・カスタム・旅',
    description: 'DUST LINEは、オフロードバイクとアドベンチャーバイクの旅、実車製作、カスタム、溶接・塗装を届ける季刊誌。創刊号は2026年9月中旬に無料公開予定。',
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
    path: '/parts/',
    source: '/?page=parts',
    title: 'BMW F 450 GS向けオリジナル部品｜DUST LINE GARAGE',
    description: 'BMW F 450 GS向けのアンダーガード、ナビゲーションタワー、エンジンガード、ブレーキマスターガードを開発中。試作と実車確認後に販売情報を公開します。',
    image: '/images/parts/side-stand-extension-welding.jpeg',
    imageAlt: 'DUST LINE GARAGEの溶接・部品製作記録',
    schemaType: 'CollectionPage',
    expectedText: '走るための',
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
    path: '/commercial-disclosure/',
    source: '/?page=commercial-disclosure',
    title: '特定商取引法に基づく表記｜DUST LINE',
    description: 'DUST LINEが直接販売するデジタル雑誌の販売事業者、価格、支払方法、提供時期、返品・キャンセル条件をご案内します。',
    image: '/og.png',
    imageAlt: 'DUST LINE公式サイト',
    schemaType: 'WebPage',
    expectedText: '特定商取引法に',
  },
  {
    path: '/refund-policy/',
    source: '/?page=refund-policy',
    title: '返金・キャンセルポリシー｜DUST LINE',
    description: 'DUST LINE公式サイトで直接販売するデジタル雑誌の返金・キャンセル条件とお問い合わせ方法をご案内します。',
    image: '/og.png',
    imageAlt: 'DUST LINE公式サイト',
    schemaType: 'WebPage',
    expectedText: '返金・キャンセル',
  },
  {
    path: '/digital-delivery/',
    source: '/?page=digital-delivery',
    title: 'デジタル商品の提供条件｜DUST LINE',
    description: 'DUST LINEデジタル雑誌の提供時期、会員アカウント、閲覧環境、閲覧できない場合の対応をご案内します。',
    image: '/og.png',
    imageAlt: 'DUST LINE公式サイト',
    schemaType: 'WebPage',
    expectedText: 'デジタル商品の',
  },
  {
    path: '/magazine/issue-02/',
    source: '/?page=issue-02-product',
    title: 'DUST LINE ISSUE 02｜商品情報・販売準備中',
    description: 'DUST LINE ISSUE 02の販売開始前の商品案内。価格は1,480円（税込）の単品販売で、自動更新はありません。収録内容と公開日は確定後にお知らせします。',
    image: '/images/hero-rider.jpg',
    imageAlt: 'DUST LINE ISSUE 02の仮表紙に使用したアドベンチャーバイクの実写素材',
    schemaType: 'WebPage',
    robots: 'noindex,nofollow',
    expectedText: 'DUST LINE ISSUE 02',
  },
  {
    path: '/news/issue-01-release-delay/',
    source: '/?page=issue-01-delay',
    title: 'DUST LINE創刊号 発売延期のお知らせ｜2026年9月中旬へ変更',
    description: '2026年9月1日に予定していたDUST LINE創刊号の発売・無料公開を、2026年9月中旬へ延期します。創刊号は予定どおり無料で公開します。',
    image: '/images/cover-issue-01-r1200gs.webp',
    imageAlt: 'DUST LINE創刊号の表紙',
    schemaType: 'Article',
    section: 'お知らせ',
    publishedDate: '2026-09-01',
    modifiedDate: '2026-09-02',
    expectedText: '発売延期の',
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
  {
    path: '/offroad-bike-magazine/',
    source: '/offroad-bike-magazine/',
    title: 'オフロードバイク雑誌 DUST LINEとは｜2026年9月中旬創刊',
    description: 'オフロードバイクとアドベンチャーバイクの旅、車両製作、カスタム、溶接・塗装を届ける季刊誌DUST LINE。創刊号は2026年9月中旬に無料公開予定。',
    image: '/images/hero-rider.jpg',
    imageAlt: 'ダートを走るアドベンチャーバイク',
    schemaType: 'AboutPage',
    expectedText: 'オフロードバイク雑誌を',
  },
  {
    path: '/account/signup/',
    source: '/account/signup/',
    title: '無料会員登録｜DUST LINE',
    description: 'DUST LINEの無料会員登録ページです。創刊号をWebブラウザからお読みいただけます。',
    image: '/images/cover-issue-01-r1200gs.webp',
    imageAlt: 'DUST LINE創刊号の表紙',
    schemaType: 'WebPage',
    robots: 'noindex,nofollow',
    expectedText: 'READ BEYOND',
  },
  {
    path: '/account/login/',
    source: '/account/login/',
    title: '会員ログイン｜DUST LINE',
    description: 'DUST LINE会員向けログインページです。',
    image: '/images/cover-issue-01-r1200gs.webp',
    imageAlt: 'DUST LINE創刊号の表紙',
    schemaType: 'WebPage',
    robots: 'noindex,nofollow',
    expectedText: 'READ BEYOND',
  },
  {
    path: '/account/verify/',
    source: '/account/verify/',
    title: 'メール確認｜DUST LINE',
    description: 'DUST LINE会員登録のメール確認ページです。',
    image: '/images/cover-issue-01-r1200gs.webp',
    imageAlt: 'DUST LINE創刊号の表紙',
    schemaType: 'WebPage',
    robots: 'noindex,nofollow',
    expectedText: 'READ BEYOND',
  },
  {
    path: '/account/reset-password/',
    source: '/account/reset-password/',
    title: 'パスワード再設定｜DUST LINE',
    description: 'DUST LINE会員アカウントのパスワード再設定ページです。',
    image: '/images/cover-issue-01-r1200gs.webp',
    imageAlt: 'DUST LINE創刊号の表紙',
    schemaType: 'WebPage',
    robots: 'noindex,nofollow',
    expectedText: 'READ BEYOND',
  },
  {
    path: '/library/',
    source: '/library/',
    title: 'マイライブラリ｜DUST LINE',
    description: 'DUST LINE会員が無料号と購入済みの号を読むためのページです。',
    image: '/images/cover-issue-01-r1200gs.webp',
    imageAlt: 'DUST LINE創刊号の表紙',
    schemaType: 'WebPage',
    robots: 'noindex,nofollow',
    expectedText: 'READ BEYOND',
  },
  {
    path: '/issues/issue-01/',
    source: '/issues/issue-01/',
    title: 'DUST LINE 創刊号｜会員閲覧',
    description: 'DUST LINE創刊号の会員向け閲覧ページです。',
    image: '/images/cover-issue-01-r1200gs.webp',
    imageAlt: 'DUST LINE創刊号の表紙',
    schemaType: 'WebPage',
    robots: 'noindex,nofollow',
    expectedText: 'READ BEYOND',
  },
  {
    path: '/paint/',
    source: '/?page=paint',
    title: 'バイク部品の塗装価格・見積依頼｜DUST LINE GARAGE',
    description: 'パウダーコート、ガンコート、セラコートの参考価格を掲載。バイク部品の写真を送って見積を依頼できます。',
    image: '/og.png',
    imageAlt: 'DUST LINE GARAGEのバイク部品塗装サービス',
    schemaType: 'Service',
    expectedText: '走る部品を',
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
    console.error('Prerender preview server error:', error)
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Internal server error')
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

const dumpDom = async (browserSession, url, route = null) => {
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
    let result
    if (route) {
      const metadataPayload = JSON.stringify(metadataForRoute(route)).replaceAll('<', '\\u003c')
      const metadataResult = await client.send('Runtime.evaluate', {
        expression: `((metadata) => {
          const head = document.head
          if (!head) throw new Error('Document head unavailable')

          document.title = metadata.title
          Array.from(head.querySelectorAll('title')).slice(1).forEach((element) => element.remove())

          const upsertMeta = (attribute, key, content) => {
            const matches = Array.from(head.querySelectorAll('meta'))
              .filter((element) => element.getAttribute(attribute) === key)
            const element = matches.shift() ?? document.createElement('meta')
            matches.forEach((duplicate) => duplicate.remove())
            element.setAttribute(attribute, key)
            element.removeAttribute(attribute === 'name' ? 'property' : 'name')
            element.setAttribute('content', content)
            if (!element.parentNode) head.append(element)
          }

          upsertMeta('name', 'description', metadata.description)
          upsertMeta('name', 'robots', metadata.robots)
          upsertMeta('property', 'og:locale', 'ja_JP')
          upsertMeta('property', 'og:type', metadata.ogType)
          upsertMeta('property', 'og:site_name', 'DUST LINE')
          upsertMeta('property', 'og:title', metadata.title)
          upsertMeta('property', 'og:description', metadata.description)
          upsertMeta('property', 'og:url', metadata.canonical)
          upsertMeta('property', 'og:image', metadata.image)
          upsertMeta('property', 'og:image:alt', metadata.imageAlt)
          upsertMeta('name', 'twitter:card', 'summary_large_image')
          upsertMeta('name', 'twitter:site', '@DUSTLINE_ADV')
          upsertMeta('name', 'twitter:title', metadata.title)
          upsertMeta('name', 'twitter:description', metadata.description)
          upsertMeta('name', 'twitter:image', metadata.image)
          upsertMeta('name', 'twitter:image:alt', metadata.imageAlt)

          const canonicalLinks = Array.from(head.querySelectorAll('link'))
            .filter((element) => element.relList?.contains('canonical'))
          const canonicalLink = canonicalLinks.shift() ?? document.createElement('link')
          canonicalLinks.forEach((duplicate) => duplicate.remove())
          canonicalLink.setAttribute('rel', 'canonical')
          canonicalLink.setAttribute('href', metadata.canonical)
          if (!canonicalLink.parentNode) head.append(canonicalLink)

          head.querySelectorAll('script[type="application/ld+json"]').forEach((element) => element.remove())
          const schema = document.createElement('script')
          schema.type = 'application/ld+json'
          schema.textContent = metadata.schemaJson
          head.append(schema)

          return {
            html: document.documentElement.outerHTML,
            text: document.body?.innerText ?? '',
            headings: Array.from(document.querySelectorAll('h1'))
              .map((element) => element.textContent ?? '')
              .join(' | '),
            title: document.title,
            canonical: canonicalLink.href,
            jsonLdCount: document.querySelectorAll('script[type="application/ld+json"]').length,
          }
        })(${metadataPayload})`,
        returnByValue: true,
      }, sessionId)
      if (metadataResult.exceptionDetails) {
        throw new Error(`Unable to apply metadata: ${url}`)
      }
      result = metadataResult
    }

    if (!result) {
      result = await client.send('Runtime.evaluate', {
        expression: `(() => {
          const canonical = document.querySelector('link[rel="canonical"]')
          return {
            html: document.documentElement.outerHTML,
            text: document.body?.innerText ?? '',
            headings: Array.from(document.querySelectorAll('h1'))
              .map((element) => element.textContent ?? '')
              .join(' | '),
            title: document.title,
            canonical: canonical?.href ?? '',
            jsonLdCount: document.querySelectorAll('script[type="application/ld+json"]').length,
          }
        })()`,
        returnByValue: true,
      }, sessionId)
    }
    const documentState = result.result?.value
    if (typeof documentState?.html !== 'string' || !documentState.html.includes('<div id="root">')) {
      throw new Error(`Rendered page did not produce a valid document: ${url}`)
    }
    return { ...documentState, html: `<!doctype html>\n${documentState.html}` }
  } finally {
    await client.send('Target.closeTarget', { targetId })
  }
}

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
      description: 'オフロードバイクとアドベンチャーバイクの旅、実車製作、カスタム、溶接・塗装を実走と実作業から届ける季刊誌。',
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

const metadataForRoute = (route) => ({
  title: route.title,
  description: route.description,
  robots: route.robots ?? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
  canonical: absoluteUrl(route.path),
  ogType: route.schemaType === 'Article' ? 'article' : 'website',
  image: absoluteUrl(route.image),
  imageAlt: route.imageAlt,
  schemaJson: JSON.stringify(pageSchema(route)).replaceAll('<', '\\u003c'),
})

const verifyOutput = (documentState, route) => {
  const canonical = absoluteUrl(route.path)
  const checks = {
    title: documentState.title === route.title,
    canonical: documentState.canonical === canonical,
    jsonLd: documentState.jsonLdCount === 1,
    root: documentState.html.includes('<div id="root">'),
    expectedText: documentState.text.includes(route.expectedText),
  }
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name)
  if (failedChecks.length > 0) {
    const details = failedChecks.includes('title')
      ? `; title=${JSON.stringify(documentState.title)}, expected=${JSON.stringify(route.title)}`
      : ''
    throw new Error(`SEO verification failed for ${route.path}: ${failedChecks.join(', ')}${details}`)
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
    const rendered = await dumpDom(browserSession, new URL(route.source, localOrigin).href, route)
    const outputPath = route.path === '/'
      ? join(distDir, 'index.html')
      : join(distDir, route.path.replace(/^\//, ''), 'index.html')
    await mkdir(dirname(outputPath), { recursive: true })
    verifyOutput(rendered, route)
    await writeFile(outputPath, rendered.html, 'utf8')
    console.log(`prerendered ${route.path}`)
  }

  // Test the public fixed URLs after every route file exists. The source pass
  // above also covers the legacy query URLs used by older links.
  for (const route of routes) {
    const runtimeDocument = await dumpDom(browserSession, new URL(route.path, localOrigin).href)
    if (!runtimeDocument.headings.includes(route.expectedText)) {
      throw new Error(`Fixed-route runtime verification failed for ${route.path}`)
    }
    console.log(`verified ${route.path}`)
  }
} finally {
  await browserSession.close()
  await new Promise((resolveClose) => server.close(resolveClose))
}
