import './category-pages.css'

const CATEGORY_NAV = [
  { key: 'travel', label: '旅の記録', sublabel: 'TRAVEL', href: '/travel/' },
  { key: 'machines', label: '車両製作', sublabel: 'BUILD', href: '/build/' },
  { key: 'garage', label: '溶接・塗装・整備', sublabel: 'GARAGE', href: '/garage/' },
]

const CATEGORY_CONTENT = {
  travel: {
    index: '01',
    eyebrow: 'FIELD REPORTS / THE ROAD OUTSIDE THE MAP',
    label: 'TRAVEL',
    title: '旅の記録',
    lead: 'アドベンチャーバイクで走った距離、立ち止まった理由、そして道の先で起きたこと。北海道から世界一周の準備まで、実走から生まれた記録を集めます。',
    statement: '目的地だけでは、旅は残らない。',
    description: '予定どおりに進まなかった時間も、故障の兆候も、次の旅を変えた選択も。その場にいたライダーの言葉と写真で編みます。',
    heroImage: 'hokkaido-1190/hero-ktm-ferry-departure.jpg',
    heroAlt: 'フェリー乗り場で北海道への出発を待つKTM 1190 Adventure',
    cards: [
      {
        number: '001',
        kicker: 'TRAVEL REPORT / 3,500 KM',
        title: 'KTM 1190で行く、北海道・離島の旅。',
        excerpt: '10日間、3,500km。積丹での不調、宗谷岬、その先の利尻・礼文まで。北の端を走った実走記録。',
        image: 'hokkaido-1190/01-ktm-loaded-for-hokkaido.jpg',
        alt: '北海道ツーリングの荷物を積んだKTM 1190 Adventure',
        href: '/articles/hokkaido-1190/',
        linkLabel: '旅の記録を読む',
        featured: true,
      },
      {
        number: '002',
        kicker: 'BUILD LOG / BEFORE DEPARTURE',
        title: '世界一周に行こうとしたら。',
        excerpt: 'KLR650を選び、37Lタンクを載せ、足りない部品を作った。走り出す前から始まっていた旅の話。',
        image: 'world-trip/completed-klr650.jpg',
        alt: '37Lタンクとパニアステーを装着した世界一周仕様のKLR650',
        href: '/articles/world-trip/',
        linkLabel: '準備の記録を読む',
      },
    ],
  },
  machines: {
    index: '02',
    eyebrow: 'MACHINE FILES / BUILT FOR THE LONG WAY',
    label: 'BUILD',
    title: '車両製作',
    lead: '市販のままでは届かない場所へ行くために、何を選び、何を作り直したのか。長距離と悪路を見据えた車両製作を記録します。',
    statement: '売っていないなら、つくる。',
    description: 'KLR650のIMS 37Lタンク、R1200GSの60Lタンクとトリプルヘッドライト。完成形だけでなく、合わなかった理由と判断の過程まで残します。',
    heroImage: 'world-trip/completed-klr650.jpg',
    heroAlt: '旅に向けて製作された世界一周仕様のKLR650',
    cards: [
      {
        number: '001',
        kicker: 'BUILD LOG / KLR650',
        title: '37Lを載せた、世界一周仕様。',
        excerpt: '北米仕様のIMSタンクを欧州仕様車へ。切断、溶接、燃料系統、ワンオフ部品まで、一台を旅の道具へ変えた記録。',
        image: 'world-trip/tank-mounted-side.jpg',
        alt: 'IMS製37Lタンクを装着したKLR650',
        href: '/articles/world-trip/',
        linkLabel: '製作記録を読む',
        featured: true,
      },
      {
        number: '002',
        kicker: 'MACHINE FILE 001 / R1200GS',
        title: '大陸横断マシン。',
        excerpt: '60Lタンク、トリプルヘッドライト、6mmアーマー。ガードファクトリーが仕立てたR1200GSの誌面を公開。',
        image: 'bike-profile.jpg',
        alt: '60Lタンクとトリプルヘッドライトを備えたR1200GS',
        href: '/articles/machine-file-001/',
        linkLabel: 'マシンファイルを見る',
      },
    ],
  },
  garage: {
    index: '03',
    eyebrow: 'DUST LINE GARAGE / HANDS, HEAT AND METAL',
    label: 'GARAGE',
    title: '溶接・塗装・整備',
    lead: '走るための加工を、現場の手順で。溶接、塗装、研磨、車両整備を、実車で確認した寸法と失敗しないための判断から伝えます。',
    statement: '火花の先に、次の一台がある。',
    description: 'GARAGEの公開記事は、現在準備中です。サイドスタンド拡張、ワンオフ部品、塗装と下地づくりなど、編集部が実際に手を動かした工程を順次公開します。',
    heroImage: 'bike-profile.jpg',
    heroAlt: 'DUST LINEで製作したアドベンチャーバイクの車両ディテール',
    cards: [
      {
        number: '001',
        kicker: 'MACHINE FILE / FABRICATION',
        title: '大陸横断マシン、その仕事。',
        excerpt: '60Lタンクと6mmアーマー。長距離を走り切るための金属加工と車両製作を、公開中の誌面から見る。',
        image: 'machine-file-001-spread.webp',
        alt: 'DUST LINE創刊号の大陸横断マシン記事見開き',
        href: '/articles/machine-file-001/',
        linkLabel: '公開中の誌面を見る',
        featured: true,
      },
    ],
    upcoming: [
      ['01', 'SIDE STAND', '型紙から始める、サイドスタンド接地面の拡張。'],
      ['02', 'WELDING', 'ワンオフ部品をつくる、切断・仮付け・本溶接。'],
      ['03', 'PAINT', '塗装の仕上がりを変える、研磨と下地づくり。'],
      ['04', 'MAINTENANCE', '旅の途中で止まらないための、出発前整備。'],
    ],
  },
}

function imagePath(assetPath, filename) {
  return typeof assetPath === 'function' ? assetPath(filename) : `/images/${filename}`
}

function ArticleCard({ card, assetPath, position }) {
  return (
    <article className={`dl-category-card${card.featured ? ' dl-category-card--featured' : ''}`}>
      <a className="dl-category-card__media" href={card.href} aria-label={`${card.title}を読む`}>
        <img
          src={imagePath(assetPath, card.image)}
          alt={card.alt}
          loading={position === 0 ? 'eager' : 'lazy'}
          fetchPriority={position === 0 ? 'high' : undefined}
          decoding="async"
        />
        <span className="dl-category-card__number" aria-hidden="true">{card.number}</span>
      </a>
      <div className="dl-category-card__copy">
        <p>{card.kicker}</p>
        <h2>{card.title}</h2>
        <p>{card.excerpt}</p>
        <a className="dl-category-card__link" href={card.href}>
          {card.linkLabel}<span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  )
}

export default function CategoryPage({ category = 'travel', assetPath }) {
  const content = CATEGORY_CONTENT[category] || CATEGORY_CONTENT.travel

  return (
    <main className={`dl-category dl-category--${category}`} id="main">
      <header className="dl-category-hero">
        <div className="dl-category-hero__image">
          <img src={imagePath(assetPath, content.heroImage)} alt={content.heroAlt} fetchPriority="high" />
        </div>
        <div className="dl-category-hero__shade" aria-hidden="true" />
        <div className="dl-category-hero__copy">
          <p className="dl-category-hero__eyebrow">{content.eyebrow}</p>
          <p className="dl-category-hero__index" aria-hidden="true">{content.index}</p>
          <h1>{content.title}</h1>
          <p className="dl-category-hero__lead">{content.lead}</p>
        </div>
        <p className="dl-category-hero__label" aria-hidden="true">{content.label}</p>
      </header>

      <nav className="dl-category-nav" aria-label="記事カテゴリー">
        <div className="dl-category-nav__inner">
          {CATEGORY_NAV.map((item) => (
            <a key={item.key} href={item.href} aria-current={item.key === category ? 'page' : undefined}>
              <span>{item.sublabel}</span>
              <strong>{item.label}</strong>
            </a>
          ))}
        </div>
      </nav>

      <section className="dl-category-intro" aria-labelledby="category-statement">
        <div className="dl-category-intro__label"><span>{content.index}</span><span>EDITORIAL LINE</span></div>
        <div className="dl-category-intro__body">
          <h2 id="category-statement">{content.statement}</h2>
          <p>{content.description}</p>
        </div>
      </section>

      <section className="dl-category-stories" aria-labelledby="category-stories-title">
        <header className="dl-category-stories__header">
          <div>
            <p>{content.label} / LATEST RECORDS</p>
            <h2 id="category-stories-title">公開中の記録</h2>
          </div>
          <span>{String(content.cards.length).padStart(2, '0')} STORIES</span>
        </header>

        <div className="dl-category-stories__grid">
          {content.cards.map((card, index) => (
            <ArticleCard key={`${category}-${card.number}`} card={card} assetPath={assetPath} position={index} />
          ))}
        </div>

        {content.upcoming && (
          <aside className="dl-category-upcoming" aria-labelledby="garage-upcoming-title">
            <header>
              <p>NEXT IN THE GARAGE</p>
              <h2 id="garage-upcoming-title">これから公開する記事</h2>
              <span>現在、取材・製作中</span>
            </header>
            <ol>
              {content.upcoming.map(([number, label, title]) => (
                <li key={number}>
                  <span>{number}</span>
                  <small>{label}</small>
                  <strong>{title}</strong>
                </li>
              ))}
            </ol>
          </aside>
        )}
      </section>

      <aside className="dl-category-issue" aria-labelledby="category-issue-title">
        <div className="dl-category-issue__index" aria-hidden="true">01</div>
        <div className="dl-category-issue__copy">
          <p>DUST LINE / FIRST ISSUE</p>
          <h2 id="category-issue-title">工程の続きは、<br />創刊号で。</h2>
          <p>WEBでは旅と製作の入口を。誌面では連続写真、加工の細部、現場で得た数字まで収録します。</p>
        </div>
        <div className="dl-category-issue__actions">
          <a className="dl-category-button" href="/#issue">創刊号について見る<span aria-hidden="true">→</span></a>
          <a className="dl-category-text-link" href="/downloads/dust-line-issue-01-sample.pdf" target="_blank" rel="noreferrer">2ページ試し読み<span aria-hidden="true">↗</span></a>
        </div>
      </aside>
    </main>
  )
}

export { CATEGORY_CONTENT }
