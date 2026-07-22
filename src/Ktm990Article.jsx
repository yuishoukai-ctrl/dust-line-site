import { useEffect } from 'react'
import './world-trip.css'
import './ktm990-article.css'

function ArticleArrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  )
}

function Figure({ src, alt, caption, className = '', priority = false }) {
  return (
    <figure className={`ktm990-figure ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding={priority ? 'sync' : 'async'}
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

const chapters = [
  ['road', '01', '舗装路からダートへ'],
  ['input', '02', '制御ではなく手応え'],
  ['origin', '03', '憧れを決断に変える'],
  ['setup', '04', '12年分の選択'],
]

const modifications = [
  {
    number: '01',
    title: 'SAFARI TANKS / 40 L',
    meta: '2018 / FUEL TANK',
    text: '純正タンクを温存し、ダートで傷を気にせず使うために装着。転倒を重ねても、この車両では現在までトラブルは出ていない。',
  },
  {
    number: '02',
    title: 'LEOVINCE SILENCER',
    meta: 'LIGHT / HEAT',
    text: '軽量化と熱害対策を目的に交換。純正よりLC8が抵抗なく回るように感じられるという、長期所有者の選択だ。',
  },
  {
    number: '03',
    title: 'SUPER ENDURO R REAR',
    meta: '4.25 TO 2.50',
    text: '950 SUPER ENDURO R用リアホイールへ換装。タイヤの選択肢を広げ、現在はDunlop D908RRの140/80-18を履く。',
  },
]

export default function Ktm990Article({ assetPath }) {
  const root = import.meta.env.BASE_URL
  const image = (name) => assetPath(`ktm-990-adv-s/${name}`)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'KTM 990 ADVENTURE S｜12年乗って分かったダートで際立つLC8 | DUST LINE'
    window.scrollTo(0, 0)
    return () => { document.title = previousTitle }
  }, [])

  return (
    <div className="article-page ktm990-digest">
      <header className="article-header">
        <a className="article-header__brand" href={root}>DUST LINE</a>
        <a className="article-header__back" href="/build/" aria-label="車両記事の一覧へ">
          <ArticleArrow />
          <span className="ktm990-back-label--desktop">車両記事へ</span>
          <span className="ktm990-back-label--mobile">BUILD</span>
        </a>
      </header>

      <main>
        <article>
          <header className="ktm990-hero">
            <div className="ktm990-hero__media">
              <img
                src={image('01-dirt-slide.webp')}
                alt="ダートでKTM 990 ADVENTURE Sをスライドさせるライダー"
                fetchPriority="high"
                decoding="sync"
              />
            </div>
            <div className="ktm990-hero__shade" aria-hidden="true" />
            <div className="ktm990-hero__copy">
              <p>WEB DIGEST / MACHINE PROFILE 003</p>
              <h1>
                <span>KTM 990</span>
                <span>ADVENTURE <em>S</em></span>
                <small>12年乗って分かった、<br />ダートで際立つLC8。</small>
              </h1>
              <div className="ktm990-hero__rule" aria-hidden="true" />
              <p className="ktm990-hero__deck">電子制御へ委ねず、右手の入力へそのまま答える。2007年型の一台と過ごした12年を、4つの場面でたどる。</p>
              <div className="ktm990-hero__byline"><span>OWNER'S STORY</span><strong>EDIT / DUST LINE編集部</strong><span>WEB EDITION</span></div>
            </div>
            <span className="ktm990-hero__index" aria-hidden="true">003</span>
          </header>

          <section className="ktm990-intro" aria-label="記事の概要">
            <div className="ktm990-intro__copy">
              <p className="ktm990-intro__lead">12年乗っても、まだ分からない部分がある。だから、またダートへ向かう。</p>
              <p>990 ADVENTURE Sは、所有するほど静かにまとまっていく機械ではなかった。ワイヤースロットル、前後265mmのストローク、ABSを持たないS。入力を曖昧にしない性格が、ライダーへ次の一本を選ばせ続ける。</p>
              <aside className="ktm990-web-note">
                <span>WEB EDITION</span>
                <div>
                  <strong>ここでは、一日の走りと12年の選択を。</strong>
                  <p>完全なスペック、舗装路での挙動、三つの換装の詳しい経緯は、創刊号の8ページに残しました。</p>
                </div>
              </aside>
            </div>

            <dl className="ktm990-stats">
              <div><dt>MODEL YEAR</dt><dd>2007<small>KTM 990 ADVENTURE S</small></dd></div>
              <div><dt>ENGINE</dt><dd>999<small>CC / LC8 75° V-TWIN</small></dd></div>
              <div><dt>TRAVEL</dt><dd>265<small>MM / FRONT & REAR</small></dd></div>
              <div><dt>PURCHASED</dt><dd>2014.03<small>12 YEARS TOGETHER</small></dd></div>
            </dl>
          </section>

          <nav className="ktm990-toc" aria-label="記事の目次">
            <p>FOUR SCENES / TWELVE YEARS</p>
            <ol>
              {chapters.map(([id, number, label]) => (
                <li key={id}><a href={`#${id}`}><span>{number}</span><strong>{label}</strong></a></li>
              ))}
            </ol>
          </nav>

          <section className="ktm990-road" id="road">
            <div className="ktm990-heading">
              <span>01 / ROAD TO DIRT</span>
              <h2>舗装路から<br />ダートへ。</h2>
            </div>
            <div className="ktm990-road__copy">
              <p>日が昇る頃、ダートを求めて高速道路を走る。ワイヤースロットルの入力へ、回転上昇の早いLC8が間を置かず応える。アナログのタコメーターが動くたび、今日を駆けるマインドセットが整っていく。</p>
              <p>高速を降り、ワインディングを走る。前後265mmのWPサスペンションは舗装の凹凸をいなし、ブレンボ製ブレーキでフロントを沈めれば、高い目線から車体が向きを変える。コーナーをつないだ先に、ダートが現れた。</p>
              <div className="ktm990-data-line"><strong>265 MM</strong><span>WP FRONT / REAR TRAVEL</span></div>
            </div>
            <Figure
              src={image('02-road-to-dirt.webp')}
              alt="ダートへ進入するKTM 990 ADVENTURE Sの後方"
              caption="高速からワインディング、そしてダートへ。モードを切り替える工程はない。"
              className="ktm990-road__figure"
            />
          </section>

          <section className="ktm990-input" id="input">
            <div className="ktm990-input__number" aria-hidden="true">02</div>
            <div className="ktm990-heading ktm990-heading--light">
              <span>02 / DIRECT INPUT</span>
              <h2>制御ではなく、<br />手応え。</h2>
            </div>
            <div className="ktm990-input__body">
              <div className="ktm990-input__prose">
                <p>この990 ADVENTURE Sは、トラクションコントロールもABSも持たない。モードを選ぶ必要はなく、そのままダートへ入っていける。右手の入力に対する答えが、車体から直接返ってくる。</p>
                <p>アクセルを開けるほど車体は安定する。タイトターンの大きなスライドから、高速コーナーの小さなスライドまで、ピックアップのよいLC8が動きをつくる。追い込むほど、切り取りたいラインがはっきり見えてくる。</p>
                <aside><strong>OWNER'S IMPRESSION</strong><p>走行感と改造効果は、この車両を12年所有したライダーの実感です。</p></aside>
              </div>
              <blockquote>トラクションを作るのは、<br />電子制御ではなく右手。</blockquote>
            </div>
            <dl className="ktm990-input__facts">
              <div><dt>ABS</dt><dd>NONE</dd></div>
              <div><dt>TRACTION CONTROL</dt><dd>NONE</dd></div>
              <div><dt>RESPONSE</dt><dd>RIGHT HAND</dd></div>
            </dl>
          </section>

          <section className="ktm990-origin" id="origin">
            <div className="ktm990-origin__copy">
              <div className="ktm990-heading">
                <span>03 / FROM SOMEDAY TO NOW</span>
                <h2>憧れを、<br />決断に変える。</h2>
              </div>
              <p>十代からオフロードバイクに惹かれ、心の中にはいつも「ビッグオフ」があった。2003年に登場した950 ADVENTURE。左右分割式の燃料タンク、直線基調の外装、ラリーを出発点とするLC8。その姿へ、高校生だった私は「いつか絶対に」と思った。</p>
              <p>社会人になっても、その「いつか」は消えなかった。950は990へ変わり、990も最終モデルの販売を終える。そんな頃、インターネット上に短い言葉が現れた。</p>
              <blockquote>「売ります　990 ADVENTURE S」</blockquote>
              <p>今しかない。しかも、ロングストロークサスペンションを持つABSレスのSだった。すぐに現車を確かめ、2014年3月に購入。憧れは、12年を共にする一台へ変わった。</p>
              <div className="ktm990-timeline" aria-label="950との出会いから990 ADVENTURE S購入まで">
                <div><span>2003</span><strong>950 ADVENTUREとの出会い</strong></div>
                <div><span>2014.03</span><strong>990 ADVENTURE Sを購入</strong></div>
                <div><span>2026</span><strong>所有12年</strong></div>
              </div>
            </div>
            <Figure
              src={image('03-blue-s-archive.webp')}
              alt="納車直後のブルー外装をまとったKTM 990 ADVENTURE S"
              caption="納車直後のブルー外装はSの特別色。前オーナーのロングスクリーンとツーリング装備が残る。"
              className="ktm990-origin__figure"
            />
          </section>

          <section className="ktm990-setup" id="setup">
            <div className="ktm990-setup__intro">
              <div className="ktm990-heading ktm990-heading--light">
                <span>04 / CURRENT SETUP</span>
                <h2>三つの変更。<br />目的は一つ。</h2>
              </div>
              <div>
                <p className="ktm990-setup__statement">全ては、ダートを駆け抜けるため。</p>
                <p>完成形へ近づけるためではない。純正を残し、必要な部分だけをダートへ寄せる。現在の姿には、12年分の判断が残っている。</p>
              </div>
            </div>
            <Figure
              src={image('04-current-setup.webp')}
              alt="Safari Tanks 40Lタンクなどを装着した現在のKTM 990 ADVENTURE S"
              caption="車高の高いSは、ダートがよく似合う。40Lタンクと細いリアリムが走行性能を格段に向上させた。"
              className="ktm990-setup__figure"
            />
            <ol className="ktm990-mods">
              {modifications.map((item) => (
                <li key={item.number}>
                  <span>{item.number}</span>
                  <small>{item.meta}</small>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="ktm990-closing" id="closing" aria-label="記事の結び">
            <img src={image('05-edge-at-sunset.webp')} alt="夕方のダートを走るKTM 990 ADVENTURE Sと金色の土煙" loading="lazy" decoding="async" />
            <div className="ktm990-closing__shade" aria-hidden="true" />
            <div className="ktm990-closing__copy">
              <p>EDGE, STILL RUNNING.</p>
              <h2>次は、<br />どこへ行こう。</h2>
              <span>990 ADVENTURE Sに跨がれば、考えるのはまたダートのことばかりだ。走り終えたはずなのに、次のラインを探している。</span>
              <strong>EDGEと共に、ずっと。</strong>
            </div>
          </section>

          <section className="ktm990-magazine" aria-labelledby="ktm990-magazine-title">
            <div>
              <p>CONTINUE IN ISSUE 01</p>
              <h2 id="ktm990-magazine-title">8ページの完全版は、<br />創刊号で。</h2>
              <span>WEBでは4つの場面を。誌面では、舗装路からダートへ移る一日の流れと、12年をかけた変更を写真と数字で追います。</span>
            </div>
            <ul>
              <li>2007年型990 ADVENTURE Sの詳細スペック</li>
              <li>舗装路とダート、それぞれの手応え</li>
              <li>Safari Tanks、LeoVince、リアホイール換装</li>
              <li>8ページで読む、憧れから現在までの12年</li>
            </ul>
            <div className="ktm990-magazine__actions">
              <a className="ktm990-magazine__primary" href={`${root}#issue`}>創刊号について見る <ArticleArrow /></a>
              <a href="/build/">車両製作の記事を見る <ArticleArrow /></a>
              <a href="/articles/hokkaido-1190/">KTM 1190の旅を読む <ArticleArrow /></a>
            </div>
          </section>

          <footer className="article-footer">
            <span>DUST LINE / KTM 990 ADVENTURE S</span>
            <a href={root}>JOURNALへ戻る</a>
          </footer>
        </article>
      </main>
    </div>
  )
}
