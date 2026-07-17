import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import HokkaidoArticle from './HokkaidoArticle'
import MachineFileArticle from './MachineFileArticle'
import WorldTripArticle from './WorldTripArticle'
import './styles.css'

const assetPath = (filename) => `${import.meta.env.BASE_URL}images/${filename}`
const homePath = import.meta.env.BASE_URL
const companyPagePath = `${homePath}?page=company`
const goodsPagePath = `${homePath}?page=goods`
const contactFormUrl = 'https://forms.gle/JHvhHTEuxrDbtW6R6'
const suzuriShopUrl = 'https://suzuri.jp/dustline'
const officialXUrl = 'https://x.com/DUSTLINE_ADV'

const stories = [
  {
    category: 'BUILD LOG 001',
    title: '世界一周に行こうとしたら。',
    excerpt: 'なぜKLR650、なぜ37L。そして旅が止まった理由。世界一周仕様を作った記録。',
    image: assetPath('world-trip/completed-klr650.jpg'),
    href: `${import.meta.env.BASE_URL}?article=world-trip`,
    className: 'story--wide',
  },
  {
    category: 'CAMP & RIDE',
    title: '一日の終わりを運ぶ',
    excerpt: '積みすぎないキャンプ道具と、夕暮れまで走るための小さな工夫。',
    image: assetPath('camp-sunset.jpg'),
    className: 'story--tall',
  },
  {
    category: 'MACHINE FILE 001',
    title: '大陸横断マシン',
    excerpt: '60Lタンク、トリプルヘッドライト、6mmアーマー。ガードファクトリーが仕立てた一台。',
    image: assetPath('bike-profile.jpg'),
    href: `${homePath}?article=machine-file-001`,
    className: 'story--compact',
  },
]

const goods = [
  {
    category: 'LIMITED EDITION / FOUNDING & SUPPORT CREW',
    title: 'ファウンディング、サポーターエディション',
    titleLines: ['ファウンディング、', 'サポーターエディション'],
    description: 'DUST LINEの立ち上げに関わったファウンディングメンバーとサポーターのための期間限定モデル。白T・黒Tの2カラーを用意しています。',
    href: suzuriShopUrl,
    linkLabel: '限定版をSUZURIで見る',
    badge: 'LIMITED EDITION',
    wide: true,
    images: [
      {
        src: assetPath('goods/suzuri/dust-line-founding-support-white-back-suzuri.webp'),
        alt: 'SUZURIで販売中のファウンディング、サポーターエディション白T背面',
        side: 'WHITE T',
      },
      {
        src: assetPath('goods/suzuri/dust-line-founding-support-black-back-suzuri.webp'),
        alt: 'SUZURIで販売中のファウンディング、サポーターエディション黒T背面',
        side: 'BLACK T',
      },
    ],
  },
  {
    category: 'T-SHIRT 01 / OFFICIAL',
    title: 'DUST LINE OFFICIAL T-SHIRT',
    description: '白ボディの胸元にDUST LINEロゴ、背面に日本縦断ルートを配置した公式モデル。',
    href: 'https://suzuri.jp/dustline/20413142/t-shirt/s/white',
    images: [
      {
        src: assetPath('goods/suzuri/dust-line-official-white-front-suzuri.webp'),
        alt: 'SUZURIで販売中の白いDUST LINE公式Tシャツ前面',
        side: 'FRONT',
      },
      {
        src: assetPath('goods/suzuri/dust-line-official-white-back-suzuri.webp'),
        alt: 'SUZURIで販売中の白いDUST LINE公式Tシャツ背面',
        side: 'BACK',
      },
    ],
  },
  {
    category: 'T-SHIRT 02 / ROUTE MAP',
    title: 'ROUTE JAPAN T-SHIRT',
    description: 'アッシュボディの胸元に淡色ロゴ、背面に日本列島と縦断ルートを大きく配置。',
    href: 'https://suzuri.jp/dustline/20413378/t-shirt/s/ash',
    images: [
      {
        src: assetPath('goods/suzuri/dust-line-route-japan-ash-front-suzuri.webp'),
        alt: 'SUZURIで販売中のアッシュ色ROUTE JAPAN Tシャツ前面',
        side: 'FRONT',
      },
      {
        src: assetPath('goods/suzuri/dust-line-route-japan-ash-back-suzuri.webp'),
        alt: 'SUZURIで販売中のアッシュ色ROUTE JAPAN Tシャツ背面',
        side: 'BACK',
      },
    ],
  },
]

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  )
}

function MenuIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 17h16" />}
    </svg>
  )
}

function Header({ currentPage = null }) {
  const [open, setOpen] = useState(false)
  const subpage = Boolean(currentPage)
  const sectionHref = (id) => subpage ? `${homePath}#${id}` : `#${id}`

  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  return (
    <header className="site-header">
      <a className="brand" href={subpage ? homePath : '#top'} aria-label="DUST LINE ホーム">
        <span>DUST LINE</span>
        <small>ADVENTURE JOURNAL</small>
      </a>
      <nav className={open ? 'nav nav--open' : 'nav'} aria-label="メインナビゲーション">
        <a href={sectionHref('stories')} onClick={() => setOpen(false)}>Stories</a>
        <a href={sectionHref('magazine')} onClick={() => setOpen(false)}>Magazine</a>
        <a href={sectionHref('issue')} onClick={() => setOpen(false)}>Issue 01</a>
        <a href={sectionHref('about')} onClick={() => setOpen(false)}>About</a>
        <a href={goodsPagePath} aria-current={currentPage === 'goods' ? 'page' : undefined} onClick={() => setOpen(false)}>Goods</a>
        <a href={companyPagePath} aria-current={currentPage === 'company' ? 'page' : undefined} onClick={() => setOpen(false)}>Company</a>
        <a className="nav__cta" href={suzuriShopUrl} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Shop</a>
      </nav>
      <button
        className="menu-button"
        type="button"
        aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MenuIcon open={open} />
      </button>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__image" style={{ backgroundImage: `url(${assetPath('hero-rider.jpg')})` }} role="img" aria-label="ダートを走るアドベンチャーバイク" />
      <div className="hero__veil" />
      <div className="hero__content reveal">
        <p className="eyebrow">ADVENTURE MOTORCYCLE JOURNAL</p>
        <h1><span>道の先ではなく、</span><span>道の外へ。</span></h1>
        <p className="hero__lead">
          地図に残らない時間を走る。DUST LINEは、旅と道具、
          そしてライダーの選択を記録するデジタル・ジャーナルです。
        </p>
        <div className="hero__actions">
          <a className="button button--accent" href="#issue">創刊号について見る <ArrowIcon /></a>
          <a className="text-link" href="#stories">最新の記録を読む <ArrowIcon /></a>
        </div>
      </div>
      <div className="hero__index" aria-hidden="true">
        <span>DL</span><span>001</span><span>JPN</span>
      </div>
      <div className="scroll-cue" aria-hidden="true"><span />SCROLL</div>
    </section>
  )
}

function Manifesto() {
  return (
    <section className="manifesto section" id="about">
      <div className="section-label reveal"><span>01</span><span>OUR LINE</span></div>
      <div className="manifesto__grid">
        <h2 className="reveal">走ることから生まれた発見を、<br />次の旅へつながる記録に。</h2>
        <div className="manifesto__copy reveal">
          <p>
            マシンの個性、選んだ道具、どこへ向かい、どこで引き返したか。
            DUST LINEは実走と取材から生まれた情報を、写真と文章で丁寧に編みます。
          </p>
          <p className="manifesto__en">RIDE FAR. PACK LIGHT. STAY CURIOUS.</p>
        </div>
      </div>
    </section>
  )
}

function EditorialTeam({ page = false }) {
  return (
    <div
      className={`editorial-team reveal${page ? ' editorial-team--page' : ''}`}
      aria-labelledby="editorial-team-title"
    >
      <div className="editorial-team__heading">
        <p>EDITORIAL TEAM</p>
        <h2 id="editorial-team-title">つくる人</h2>
      </div>
      <div className="editorial-team__profiles">
        <article className="editorial-profile">
          <header className="editorial-profile__header">
            <p>EDITOR-IN-CHIEF</p>
            <h3>小長谷 一行 <small>通称 ぽんさん</small></h3>
          </header>
          <dl className="editorial-profile__details">
            <div><dt>バイク歴</dt><dd>14年</dd></div>
            <div><dt>得意分野</dt><dd>車両整備、溶接、塗装、研磨</dd></div>
            <div><dt>DUST LINEでの担当</dt><dd>記事制作、車両製作、塗装、溶接</dd></div>
            <div>
              <dt>雑誌を作る理由</dt>
              <dd>
                紙媒体から電子書籍へと時代が変化し、素晴らしい雑誌が廃刊となっていく中で、
                さらに面白い記事を作りたかったから。
              </dd>
            </div>
            <div>
              <dt>代表記事</dt>
              <dd>37L IMSビッグタンク／60Lタンク・トリプルヘッドライト／1190北海道ツーリング</dd>
            </div>
          </dl>
        </article>

        <article className="editorial-profile editorial-profile--with-portrait">
          <header className="editorial-profile__header">
            <p>DEPUTY EDITOR-IN-CHIEF</p>
            <h3>小池 将史 <small>通称 ジュニア</small></h3>
          </header>
          <div className="editorial-profile__body">
            <figure className="editorial-profile__portrait">
              <img
                src={assetPath('editorial-koike-junior.jpg')}
                alt="林道でアドベンチャーバイクに乗る副編集長の小池将史"
                loading="lazy"
              />
            </figure>
            <dl className="editorial-profile__details">
              <div><dt>バイク歴</dt><dd>17年</dd></div>
              <div><dt>愛車</dt><dd>R1300GS、ジェベル250XC</dd></div>
              <div><dt>得意分野</dt><dd>ツーリング、林道</dd></div>
              <div><dt>DUST LINEでの担当</dt><dd>ツーリング記事、車両記事、部品製作</dd></div>
              <div>
                <dt>雑誌を作る理由</dt>
                <dd>
                  ツーリングを通じて自身が感じたことや、皆さんに伝えたいと思ったことを
                  電子書籍で書けるから。
                </dd>
              </div>
            </dl>
          </div>
        </article>
      </div>
    </div>
  )
}

function CompanyPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = '運営情報 | DUST LINE'
    window.scrollTo(0, 0)
    return () => { document.title = previousTitle }
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">本文へ移動</a>
      <Header currentPage="company" />
      <main className="company-page" id="main">
        <section className="company-page__hero">
          <div className="company-page__word" aria-hidden="true">COMPANY</div>
          <div className="company-page__hero-inner reveal">
            <p className="eyebrow">DUST LINE / COMPANY PROFILE</p>
            <h1>運営情報</h1>
            <p>DUST LINEを発行・運営する事業者の基本情報をご案内します。</p>
          </div>
          <div className="company-page__index" aria-hidden="true"><span>DL</span><span>INFO</span><span>JPN</span></div>
        </section>

        <section className="company-page__content section">
          <EditorialTeam page />
          <div className="company-profile reveal">
            <div className="company-profile__heading">
              <p>COMPANY PROFILE</p>
              <h2 id="company-profile-title">事業者情報</h2>
            </div>
            <dl className="company-profile__details">
              <div><dt>運営会社</dt><dd>DUST LINE</dd></div>
              <div>
                <dt>所在地</dt>
                <dd><address>〒421-3115 静岡県静岡市清水区由比西倉澤838-2</address></dd>
              </div>
              <div><dt>代表者</dt><dd>小長谷一行</dd></div>
              <div><dt>事業内容</dt><dd>出版・Webメディア運営・コンテンツ制作</dd></div>
              <div><dt>運営媒体</dt><dd>DUST LINE</dd></div>
              <div><dt>URL</dt><dd><a href="https://dustline.jp">dustline.jp</a></dd></div>
              <div>
                <dt>お問い合わせ</dt>
                <dd>
                  <a
                    href={contactFormUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="お問い合わせフォーム（新しいタブで開きます）"
                  >
                    お問い合わせフォーム
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <a className="company-page__back text-link" href={homePath}>DUST LINEトップへ <ArrowIcon /></a>
        </section>
      </main>
      <Footer currentPage="company" />
    </>
  )
}

function GoodsPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = '公式オンラインショップ | DUST LINE'
    window.scrollTo(0, 0)
    return () => { document.title = previousTitle }
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">本文へ移動</a>
      <Header currentPage="goods" />
      <main className="goods-page" id="main">
        <section className="goods-page__hero">
          <div className="goods-page__word" aria-hidden="true">GOODS</div>
          <div className="goods-page__hero-inner reveal">
            <p className="eyebrow">DUST LINE / OFFICIAL GOODS</p>
            <p className="goods-page__status">ONLINE STORE / NOW OPEN</p>
            <h1><span>公式ショップ、</span><span>公開。</span></h1>
            <p className="goods-page__lead">
              旅と機械、雑誌づくりから生まれたDUST LINEの公式グッズを、SUZURIで販売しています。
              商品の価格、サイズ、発送予定はショップの商品ページでご確認ください。
            </p>
            <div className="goods-page__actions">
              <a className="button button--accent" href={suzuriShopUrl} target="_blank" rel="noreferrer">SUZURIショップを見る <ArrowIcon /></a>
            </div>
          </div>
          <div className="goods-page__index" aria-hidden="true"><span>DL</span><span>GOODS</span><span>001</span></div>
        </section>

        <section className="goods-page__content section" aria-labelledby="goods-lineup-title">
          <header className="goods-page__intro reveal">
            <div className="section-label"><span>01</span><span>NOW ON SALE</span></div>
            <div>
              <p>OFFICIAL GOODS / ONLINE STORE</p>
              <h2 id="goods-lineup-title">SUZURIで販売中。</h2>
              <p>現在販売中の公式Tシャツです。画像はSUZURIの商品ページと同じ前面・背面プレビューを掲載しています。</p>
            </div>
          </header>

          <div className="goods-grid">
            {goods.map((item, index) => (
              <article
                className={`goods-card reveal${item.wide ? ' goods-card--wide' : ''}`}
                key={item.title}
                style={{ '--delay': `${index * 70}ms` }}
              >
                <figure className="goods-card__image goods-card__image--pair">
                  {item.images.map((image, imageIndex) => (
                    <div className="goods-card__side" key={image.side}>
                      <img src={image.src} alt={image.alt} loading={index > 0 || imageIndex > 0 ? 'lazy' : 'eager'} />
                      <small>{image.side}</small>
                    </div>
                  ))}
                  <span>{item.badge || 'NOW ON SALE'}</span>
                </figure>
                <div className="goods-card__copy">
                  <p>{item.category}</p>
                  <h3>
                    {item.titleLines
                      ? item.titleLines.map((line) => <span key={line}>{line}</span>)
                      : item.title}
                  </h3>
                  <p>{item.description}</p>
                  <a className="goods-card__link" href={item.href} target="_blank" rel="noreferrer">{item.linkLabel || 'この商品をSUZURIで見る'} <ArrowIcon /></a>
                </div>
              </article>
            ))}
          </div>

          <aside className="goods-page__notice reveal">
            <div>
              <p>OFFICIAL ONLINE SHOP</p>
              <h2>走る日にも、<br />つくらない日にも。</h2>
            </div>
            <div>
              <p>DUST LINEの公式グッズは、SUZURIが製造・発送します。最新の商品ラインナップは公式ショップでご確認ください。</p>
              <a className="button button--accent" href={suzuriShopUrl} target="_blank" rel="noreferrer">公式ショップへ <ArrowIcon /></a>
            </div>
          </aside>

          <a className="goods-page__back text-link" href={homePath}>DUST LINEトップへ <ArrowIcon /></a>
        </section>
      </main>
      <Footer currentPage="goods" />
    </>
  )
}

function FeaturedStory() {
  return (
    <section className="feature section" id="stories">
      <div className="section-label section-label--light reveal"><span>02</span><span>LATEST STORY</span></div>
      <a className="feature__frame reveal" href={`${import.meta.env.BASE_URL}?article=hokkaido-1190`}>
        <img src={assetPath('hokkaido-1190/hero-ktm-ferry-departure.jpg')} alt="北海道行きのフェリーを前に停めたKTM 1190 ADVENTURE" />
        <div className="feature__shade" />
        <div className="feature__copy">
          <p>TRAVEL REPORT / 3,500 KM</p>
          <h2>1190で行く、<br />北海道・離島の旅。</h2>
          <span>10日間。北の端、その先にある島へ。<ArrowIcon /></span>
        </div>
        <div className="feature__number" aria-hidden="true">01</div>
      </a>
    </section>
  )
}

function StoryGrid() {
  return (
    <section className="story-section section">
      <div className="story-grid">
        {stories.map((story, index) => {
          const content = (
            <>
              <div className="story__image"><img src={story.image} alt="" /></div>
              <div className="story__meta">
                <p>{story.category}</p>
                <span>0{index + 2}</span>
              </div>
              <h3>{story.title}</h3>
              <p className="story__excerpt">{story.excerpt}</p>
              {!story.href && <span className="story__status">記事準備中</span>}
            </>
          )

          return (
            <article className={`story ${story.className} reveal`} key={story.title} style={{ '--delay': `${index * 90}ms` }}>
              {story.href ? (
                <a href={story.href} aria-label={`${story.title}を読む`}>{content}</a>
              ) : (
                <div className="story__pending" aria-label={`${story.title} 記事準備中`}>{content}</div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function MagazinePreview() {
  const webArticle = `${import.meta.env.BASE_URL}?article=world-trip`
  const samplePdf = `${import.meta.env.BASE_URL}downloads/dust-line-issue-01-sample.pdf`
  const page026 = assetPath('issue-01/world-trip-026.png')
  const page027 = assetPath('issue-01/world-trip-027.png')
  const page030 = assetPath('issue-01/world-trip-030.png')
  const page031 = assetPath('issue-01/world-trip-031.png')

  return (
    <section className="sneak-peek section" id="magazine">
      <div className="sneak-peek__intro reveal">
        <div className="section-label"><span>03</span><span>INSIDE THE MAGAZINE</span></div>
        <div>
          <p className="sneak-peek__kicker">ISSUE 01 / OPEN FEATURE</p>
          <h2>世界一周に<br />行こうとしたら。</h2>
          <p>WEBでは計画と車両選び、加工の要点をダイジェストで紹介。創刊号では全工程とDUST DATAを8ページで収録します。</p>
          <div className="sneak-peek__actions">
            <a className="button button--accent" href={webArticle}>WEBダイジェストを読む <ArrowIcon /></a>
            <a className="sneak-peek__notify" href={samplePdf} target="_blank" rel="noreferrer">誌面を2ページ試し読み <ArrowIcon /></a>
            <a className="sneak-peek__notify" href={officialXUrl} target="_blank" rel="noreferrer">公式Xで発売情報を見る <ArrowIcon /></a>
          </div>
        </div>
      </div>

      <a className="sneak-peek__primary reveal" href={samplePdf} target="_blank" rel="noreferrer" aria-label="創刊号の2ページ試し読みPDFを開く">
        <span className="sneak-peek__ribbon">SAMPLE / ISSUE 01</span>
        <div className="sneak-peek__spread">
          <figure><img src={page026} alt="世界一周に行こうとしたら。扉ページ 026" loading="lazy" /></figure>
          <figure><img src={page027} alt="計画ルートを掲載した誌面 027" loading="lazy" /></figure>
        </div>
        <span className="sneak-peek__open">OPEN 2-PAGE PDF <ArrowIcon /></span>
      </a>

      <div className="sneak-peek__tease reveal" aria-label="創刊号に収録する加工記事の誌面を一部公開">
        <div className="sneak-peek__tease-spread">
          <img src={page030} alt="タンク装着加工を掲載した誌面 030" loading="lazy" />
          <img src={page031} alt="燃料系統を解説した誌面 031" loading="lazy" />
        </div>
        <div className="sneak-peek__veil">
          <span>ISSUE 01 / 8-PAGE FEATURE</span>
          <strong>準備の全記録は、創刊号で。</strong>
          <a href={webArticle}>WEBダイジェストを読む <ArrowIcon /></a>
        </div>
      </div>
    </section>
  )
}

function Issue() {
  return (
    <section className="issue section" id="issue">
      <div className="issue__background" aria-hidden="true">ISSUE 01</div>
      <div className="issue__visual reveal">
        <div className="issue__cover-wrap">
          <img
            src={assetPath('cover-issue-01-r1200gs.png')}
            alt="ガードファクトリー製R1200GSが砂煙の中を走るDUST LINE創刊号表紙"
          />
          <span className="issue__tag">DIGITAL EDITION</span>
        </div>
      </div>
      <div className="issue__copy reveal">
        <div className="section-label section-label--light"><span>04</span><span>FIRST ISSUE</span></div>
        <p className="issue__status">ISSUE 01 / COMING SOON</p>
        <h2>BEYOND<br />THE PAVEMENT</h2>
        <p>
          創刊号は、舗装路の向こう側へ踏み出すための一冊。
          ロングライド、積載、装備、そして旅の途中で出会った風景を収録します。
        </p>
        <dl className="issue__details">
          <div><dt>FORMAT</dt><dd>Kindle Edition</dd></div>
          <div><dt>LANGUAGE</dt><dd>Japanese</dd></div>
          <div><dt>RELEASE</dt><dd>Coming soon</dd></div>
        </dl>
        <a className="button button--outline" href={officialXUrl} target="_blank" rel="noreferrer">公式Xで発売情報を見る <ArrowIcon /></a>
      </div>
    </section>
  )
}

function RouteStrip() {
  return (
    <section className="route-strip" aria-label="旅の写真">
      <div className="route-strip__image route-strip__image--one"><img src={assetPath('coastal-view.jpg')} alt="海を望む峠に停めたバイク" /></div>
      <div className="route-strip__statement reveal">
        <span>THE DISTANCE IS NOT THE POINT.</span>
        <strong><span>遠くへ行くことより、</span><span>何を持ち帰ったか。</span></strong>
        <p>距離や速さでは測れない旅の記憶を、写真と文章で残していく。</p>
      </div>
      <svg className="route-line" viewBox="0 0 1000 180" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 125 C160 40 260 160 410 92 S690 15 1000 110" />
      </svg>
    </section>
  )
}

function Newsletter() {
  return (
    <section className="newsletter section" id="newsletter">
      <div className="newsletter__image reveal"><img src={assetPath('mountain-stop.jpg')} alt="山を望む道路に停めたアドベンチャーバイク" /></div>
      <div className="newsletter__copy reveal">
        <div className="section-label"><span>05</span><span>FIELD LETTER</span></div>
        <h2>次の旅を、<br />受信箱へ。</h2>
        <p>新しい記事、創刊号の発売情報、誌面に入りきらなかったルートノートを届けます。</p>
        <div className="newsletter__pending" role="status">
          <span>NEWSLETTER / PREPARING</span>
          <strong>登録準備中</strong>
          <p>ニュースレターの配信準備を進めています。最新情報はDUST LINE公式Xでお知らせします。</p>
          <a
            className="button button--accent"
            href={officialXUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="DUST LINE公式Xを新しいタブで開く"
          >
            公式Xを見る <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer({ currentPage = null }) {
  const subpage = Boolean(currentPage)
  const sectionHref = (id) => subpage ? `${homePath}#${id}` : `#${id}`

  return (
    <footer className="footer">
      <div className="footer__brand">
        <div className="footer__logo-frame">
          <img className="footer__logo" src={assetPath('dust-line-logo.png')} alt="DUST LINE" />
        </div>
        <small>ADVENTURE MOTORCYCLE JOURNAL</small>
      </div>
      <div className="footer__links">
        <a href={sectionHref('stories')}>Stories</a>
        <a href={sectionHref('issue')}>Issue</a>
        <a href={sectionHref('about')}>About</a>
        <a href={goodsPagePath} aria-current={currentPage === 'goods' ? 'page' : undefined}>Goods</a>
        <a href={suzuriShopUrl} target="_blank" rel="noreferrer">Shop</a>
        <a href={companyPagePath} aria-current={currentPage === 'company' ? 'page' : undefined}>Company</a>
        <a href={contactFormUrl} target="_blank" rel="noreferrer">Contact</a>
        <a href={officialXUrl} target="_blank" rel="noreferrer" aria-label="DUST LINE公式X">Official X</a>
      </div>
      <p>© 2026 DUST LINE. ALL RIGHTS RESERVED.</p>
    </footer>
  )
}

function App() {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  const article = new URLSearchParams(window.location.search).get('article')
  if (article === 'hokkaido-1190') return <HokkaidoArticle assetPath={assetPath} />
  if (article === 'world-trip') return <WorldTripArticle assetPath={assetPath} />
  if (article === 'machine-file-001') return <MachineFileArticle assetPath={assetPath} />

  const page = new URLSearchParams(window.location.search).get('page')
  if (page === 'company') return <CompanyPage />
  if (page === 'goods') return <GoodsPage />

  return (
    <>
      <a className="skip-link" href="#main">本文へ移動</a>
      <Header />
      <main id="main">
        <Hero />
        <Manifesto />
        <FeaturedStory />
        <StoryGrid />
        <MagazinePreview />
        <Issue />
        <RouteStrip />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>,
)
