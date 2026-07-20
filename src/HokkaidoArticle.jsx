import { useEffect } from 'react'
import './world-trip.css'
import './hokkaido-article.css'

function BackArrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  )
}

function ForwardArrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function TravelFigure({ src, alt, caption, className = '', priority = false }) {
  return (
    <figure className={`hokkaido-figure ${className}`}>
      <img src={src} alt={alt} loading={priority ? undefined : 'lazy'} decoding="async" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

const routeStops = [
  '静岡', '茨城', '岩手', '青森', '函館', '積丹', '札幌', '富良野', 'オロロンライン',
  '宗谷岬', '利尻島', '礼文島', '猿払', '清里', '根室', '襟裳岬', '苫小牧',
]

export default function HokkaidoArticle({ assetPath }) {
  const root = import.meta.env.BASE_URL
  const image = (name) => assetPath(`hokkaido-1190/${name}`)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'KTM 1190 Adventureで行く北海道・利尻島・礼文島3,500km | DUST LINE'
    window.scrollTo(0, 0)
    return () => { document.title = previousTitle }
  }, [])

  return (
    <div className="article-page hokkaido-page">
      <header className="article-header">
        <a className="article-header__brand" href={root}>DUST LINE</a>
        <a className="article-header__back" href={root}><BackArrow /> BACK TO JOURNAL</a>
      </header>

      <main>
        <article>
          <header className="hokkaido-hero">
            <TravelFigure
              src={image('hero-ktm-ferry-departure.jpg')}
              alt="北海道ツーリングで利尻島・礼文島を巡ったオレンジ色のKTM 1190 Adventure"
              className="hokkaido-hero__image"
              priority
            />
            <div className="hokkaido-hero__veil" />
            <div className="hokkaido-hero__copy">
              <p className="article-kicker">TRAVEL REPORT / LONG DISTANCE</p>
              <h1><span>KTM 1190 ADVENTUREで行く</span>北海道・利尻島・礼文島 3,500kmの旅</h1>
              <p className="hokkaido-hero__deck">約3,500km、10日間。静岡から北上し、宗谷岬、利尻島、礼文島、道東、襟裳岬をつないだ北海道ツーリングの記録。</p>
              <div className="article-byline"><span>WORDS & PHOTOS</span><strong>DUST LINE編集部</strong></div>
            </div>
            <div className="hokkaido-hero__index" aria-hidden="true"><span>TR</span><span>1190</span><span>JPN</span></div>
          </header>

          <section className="hokkaido-overview" aria-label="旅の概要">
            <dl className="hokkaido-stats">
              <div><dt>DISTANCE</dt><dd>約3,500<small>km</small></dd></div>
              <div><dt>DURATION</dt><dd>10<small>DAYS</small></dd></div>
              <div><dt>ROUTE</dt><dd>17<small>STOPS</small></dd></div>
              <div><dt>MACHINE</dt><dd>1190<small>ADVENTURE</small></dd></div>
            </dl>
            <nav className="hokkaido-toc" aria-label="記事の目次">
              <a href="#preparation">1190の出発前整備</a>
              <a href="#northbound">青森から北海道へ</a>
              <a href="#trouble">積丹のエンジン停止</a>
              <a href="#far-north">利尻島・礼文島</a>
              <a href="#eastern-arc">道東・襟裳岬</a>
              <a href="#impression">1190の旅性能</a>
            </nav>
          </section>

          <div className="article-intro hokkaido-intro">
            <p className="article-dropcap">初めての北海道は、空冷R1200GSで巡った。ならば次はKTM 1190 ADVENTUREで走ってみたい。知人の渡辺くんを誘い、再び北を目指すことにした。</p>
            <p>ただし、北海道へ着く前から旅は始まっている。長距離で止まらないために、冷却系ホース、燃料系統、油脂類、タイヤとブレーキ、バッテリー、灯火類を確認した。</p>
            <p>製造から8年が経過した車両だ。交換時期だけではなく、にじみ、亀裂、硬化まで見る。整備中にはホースが途中でもげた。小さな劣化を出発前に見つけられたと思っていた。</p>
          </div>

          <section className="article-section article-section--dark hokkaido-section" id="preparation">
            <div className="article-section__number">01</div>
            <div className="article-section__heading">
              <p>PRE-RIDE CHECK</p>
              <h2>KTM 1190 Adventure、<br />出発前の整備。</h2>
            </div>
            <div className="hokkaido-split">
              <div className="article-prose">
                <p>1190 ADVENTUREでは、燃料フィルターの詰まりによってガス欠に似た症状が出た事例を聞いていた。そこで燃料ホースを含め、足まわりから燃料系まで点検した。</p>
                <p>この1190は放置車ではない。それでも、時間はゴムや樹脂を確実に変えていく。旅仕様への準備とは、部品を追加することだけではなく、経年した部分を見直すことでもある。</p>
                <aside className="hokkaido-note hokkaido-note--dark">
                  <strong>PRE-RIDE CHECK</strong>
                  <p>冷却系、燃料系統、油脂類、タイヤ、ブレーキ、バッテリー、灯火類を確認。長距離前は、にじみや亀裂、ホースの硬化も見逃さない。</p>
                </aside>
              </div>
              <div className="hokkaido-image-stack">
                <TravelFigure src={image('00-preflight-hose.jpg')} alt="点検中に劣化が見つかった1190 ADVENTUREのホース" caption="製造から8年。ホース類を含めて再点検した。" />
                <TravelFigure src={image('01-ktm-loaded-for-hokkaido.jpg')} alt="パニアケースを装着したKTM 1190 ADVENTURE" caption="北海道へ向けて荷物を積んだ1190 ADVENTURE。" />
              </div>
            </div>
          </section>

          <section className="article-section article-section--paper hokkaido-section" id="northbound">
            <div className="article-section__number">02</div>
            <div className="article-section__heading">
              <p>DAY 01–02 / NORTHBOUND</p>
              <h2>静岡から青森862km。<br />フェリーで北海道へ。</h2>
            </div>
            <div className="hokkaido-story-grid">
              <div className="article-prose">
                <p>選んだ入口は青森だった。静岡から青森のフェリーターミナルまで約862km。茨城でラーメンを食べ、岩手で一泊し、2日目に津軽海峡へ着いた。</p>
                <p>すでに若干疲れている。それでも、船が陸地を離れていくと空気が変わる。ディーゼルエンジンの鼓動と夕日。北海道ツーリングは、函館へ着く前から始まっていた。</p>
              </div>
              <TravelFigure src={image('02-ferry-departure-port.jpg')} alt="青森から函館へ向かうフェリーの出発港" caption="青森から函館へ。海峡を渡る時間も旅の一部だ。" />
            </div>
            <ol className="hokkaido-route-line" aria-label="旅のルート">
              {routeStops.map((stop) => <li key={stop}>{stop}</li>)}
            </ol>
          </section>

          <section className="hokkaido-trouble" id="trouble">
            <div className="hokkaido-trouble__visual">
              <TravelFigure src={image('02-shakotan-trouble.jpg')} alt="積丹でエンジンが止まったKTM 1190 ADVENTURE" caption="海を前に、ガス欠に似た症状が出た。" />
            </div>
            <div className="hokkaido-trouble__copy">
              <p className="article-kicker">TROUBLE LOG / SHAKOTAN</p>
              <h2>積丹でエンジン停止。<br />燃料キャップを疑う。</h2>
              <p>函館から札幌へ向かう途中、積丹半島でガス欠に似た症状が出た。時間を置くと何事もなかったように始動する。頭の中のトラブルシューティングをたどり、燃料キャップの通気穴を疑った。</p>
              <p>当時は応急措置として燃料キャップを半開きにして走り、小樽のホームセンターで取り外して通気穴を清掃した。ドレン側から泥のような汚れが出ると、症状は改善した。</p>
              <aside className="hokkaido-warning">
                <strong>SAFETY</strong>
                <p>燃料キャップを半開きにした走行は、燃料漏れや引火につながる危険な行為であり推奨できない。ここでは当時の体験として記録している。</p>
              </aside>
            </div>
          </section>

          <section className="article-section article-section--dark hokkaido-section" id="far-north">
            <div className="article-section__number">03</div>
            <div className="article-section__heading">
              <p>FURANO / ORORON LINE / THE NORTH</p>
              <h2>富良野からオロロンライン、<br />宗谷岬へ。</h2>
            </div>
            <div className="hokkaido-gallery hokkaido-gallery--lead">
              <TravelFigure src={image('03-furano-lavender-fields.jpg')} alt="富良野のラベンダー畑" caption="札幌を朝5時に出発。富良野で足を止められたのは約10分だった。" />
              <TravelFigure src={image('04-ororon-wind-turbine-road.jpg')} alt="風力発電機が並ぶオロロンライン" caption="日本海側を北へ。風の道が宗谷岬へ続く。" />
            </div>
            <div className="article-columns article-columns--after">
              <p>札幌を朝5時に出発し、ラベンダー畑で有名な富良野へ。2回目でも景色には感動した。しかし宗谷岬まではまだ遠い。バイクを降りて眺められたのは、わずか10分だった。</p>
              <p>オロロンラインを北上中、首に強い衝撃と激痛が走った。飛んできた虫はハチだった。すぐに止まれる場所がなく、そのまま稚内まで走り、最初に買ったのは虫刺され薬だった。</p>
              <p>宗谷岬へ着いた頃には、10時間ほどバイクに乗り続けていた。気温は12〜14度ほど。最北端まで来た勢いで「離島へ行ってみよう」と渡辺くんに提案すると、すんなりOKが出た。</p>
            </div>
            <aside className="hokkaido-note hokkaido-note--dark hokkaido-bee-note">
              <strong>蜂に刺されたとき</strong>
              <p>蜂刺されは、痛みや腫れだけでなく重い全身症状につながる場合がある。医師の診療を受け、異常を感じたら無理に走行を続けない。</p>
              <a href="https://www.jrc.or.jp/study/safety/animal/" target="_blank" rel="noreferrer">日本赤十字社の案内を見る</a>
            </aside>
          </section>

          <section className="article-section article-section--paper hokkaido-section hokkaido-islands">
            <div className="article-section__number">04</div>
            <div className="article-section__heading">
              <p>RISHIRI / REBUN ISLAND</p>
              <h2>宗谷岬の先、<br />利尻島・礼文島へ。</h2>
            </div>
            <div className="hokkaido-gallery hokkaido-gallery--islands">
              <TravelFigure src={image('05-northern-canary-park-bikes.jpg')} alt="礼文島の北のカナリアパークに停めた2台のバイク" caption="海を渡った2台。島では、走る時間の密度が変わる。" />
              <TravelFigure src={image('07-cape-sukai-rebun.jpg')} alt="礼文島の澄海岬に広がる海岸風景" caption="礼文島の澄海岬。短い距離の中に、立ち止まりたい景色が続く。" />
              <TravelFigure src={image('06-scoton-cape-northernmost.jpg')} alt="礼文島最北端のスコトン岬" caption="礼文島最北端、スコトン岬。強風の中で立ちごけにも注意したい。" />
            </div>
            <div className="hokkaido-story-grid hokkaido-story-grid--islands">
              <div className="article-prose">
                <h3>利尻島を一周する</h3>
                <p>朝5時、稚内フェリーターミナルへ。利尻島は、寄り道をせずに巡ればバイクで一周1時間ほど。写真を撮り、「利尻らーめん味楽 本店」で食事をして、2〜3時間ほどで一周した。</p>
                <p>小雨は止まず、ずっとレインウエアを着たまま。それでもフェリーターミナルへ戻れば、次は礼文島だ。</p>
              </div>
              <div className="article-prose">
                <h3>礼文、道が途切れた先</h3>
                <p>礼文島は、車道で巡れる範囲が島の一部に限られる。残りはハイキングコースで歩く場所が多い。スコトン岬は強風で知られ、離島でけがをすれば診療まで時間がかかることもある。</p>
                <p>観光名所は比較的コンパクトにまとまり、短時間でも動きやすかった。島を離れるフェリーの上で、また訪れたいと思った。</p>
              </div>
            </div>
            <aside className="hokkaido-note">
              <strong>FERRY NOTE</strong>
              <p>利尻・礼文航路のバイクは予約対象外で、当日先着順と案内されている。運航状況や受付条件は変わるため、出発前に公式情報を確認したい。</p>
              <a href="https://heartlandferry.jp/faq/" target="_blank" rel="noreferrer">ハートランドフェリー公式案内</a>
            </aside>
          </section>

          <section className="article-section article-section--dark hokkaido-section" id="eastern-arc">
            <div className="article-section__number">05</div>
            <div className="article-section__heading">
              <p>SARUFUTSU / EASTERN ARC / CAPE ERIMO</p>
              <h2>エサヌカ線から道東、<br />襟裳岬へ。</h2>
            </div>
            <TravelFigure src={image('08-esanuka-straight-road.jpg')} alt="北海道猿払村の真っすぐなエサヌカ線" caption="ガードレールも電柱もない直線。農作業車や地域の通行を妨げず、速度を控えて走りたい。" className="hokkaido-wide-figure" />
            <div className="hokkaido-chapter-grid">
              <article>
                <span>01</span><h3>清里、夜と朝</h3>
                <p>観光シーズンの7月下旬。宿が見つからず、清里で唯一空室のあったペンションへ泊まった。夜の小料理店と、翌朝ようやく現れた北海道らしい青空が残った。</p>
              </article>
              <article>
                <span>02</span><h3>地球の熱が噴き出す</h3>
                <p>清里からアトサヌプリへ。硫黄の噴気が立ち上る区域には立入制限もある。現地の柵、案内、係員の指示に従い、次の根室へ向かった。</p>
              </article>
              <article>
                <span>03</span><h3>根室の皿</h3>
                <p>根室では、渡辺くんの希望で喫茶店「どりあん」へ。薄切りの豚カツにデミグラスソースを合わせたエスカロップを食べた。</p>
              </article>
              <article>
                <span>04</span><h3>襟裳岬、風の正体</h3>
                <p>道中は小雨。襟裳岬では、バイクが倒れないか心配になるほどの風が吹いた。次は苫小牧。旅は帰路へ入った。</p>
              </article>
            </div>
            <div className="hokkaido-gallery hokkaido-gallery--east">
              <TravelFigure src={image('09-atosanupuri-sulfur-steam.jpg')} alt="アトサヌプリで立ち上る硫黄の噴気" caption="硫黄山の名でも知られるアトサヌプリ。" />
              <TravelFigure src={image('10-nemuro-escalopp.jpg')} alt="根室の名物料理エスカロップ" caption="根室で味わったエスカロップ。走った土地を、食でも覚えていく。" />
              <TravelFigure src={image('11-erimo-cape-sign.jpg')} alt="北海道の襟裳岬の標識と海岸" caption="強い風に吹かれながら、旅の折り返しを実感した襟裳岬。" />
            </div>
          </section>

          <section className="hokkaido-impression" id="impression">
            <div className="hokkaido-impression__copy">
              <p className="article-kicker">MACHINE IMPRESSION</p>
              <h2>北海道3,500kmで分かった<br />1190 Adventureの旅性能。</h2>
              <p>今回1190 ADVENTUREを選んだのは、空冷R1200GSとの違いを試したかったからでもある。2台で同じ北海道を走ったら、何を感じるのか。</p>
              <p>R1200GSは一定の巡航速度を保ちながら流していく。対して1190 ADVENTUREは、次の目的地へ向けてアクセルを開け、加速していくのが似合う。BMWとKTM、それぞれのフラッグシップ・アドベンチャーには違う良さがある。</p>
              <p>旅の後半、今回の個体は高回転まできっちり回らなくなってきた。走行距離は約3,500km。車両の状態と走り方を踏まえ、筆者は3,000kmほどを目安にオイル交換を考えたほうがよさそうだと感じた。これは今回の一台で得た所感である。</p>
              <dl className="article-specs hokkaido-specs">
                <div><dt>DISTANCE</dt><dd>約3,500km</dd></div>
                <div><dt>DURATION</dt><dd>10日間</dd></div>
                <div><dt>MACHINE</dt><dd>KTM 1190 ADVENTURE</dd></div>
              </dl>
            </div>
            <div className="hokkaido-impression__images">
              <TravelFigure src={image('01-ktm-loaded-for-hokkaido.jpg')} alt="北海道を走り終えたKTM 1190 ADVENTURE" caption="10日間、約3,500kmを走った1190 ADVENTURE。" />
              <TravelFigure src={image('12-homebound-ferry-sunset.jpg')} alt="帰りのフェリーから見た海へ沈む夕日" caption="ありがとう、北海道。また来よう。" />
            </div>
          </section>

          <section className="hokkaido-sources" aria-labelledby="hokkaido-sources-title">
            <p className="article-kicker">EDITORIAL NOTE / SOURCES</p>
            <h2 id="hokkaido-sources-title">旅の言葉を、<br />確かな情報で支える。</h2>
            <p>本文は当時の体験として再構成しています。運航、立入規制、店舗情報は変わるため、訪問前に最新の公式情報を確認してください。</p>
            <div className="hokkaido-source-links">
              <a href="https://www.jrc.or.jp/study/safety/animal/" target="_blank" rel="noreferrer">日本赤十字社｜蜂に刺されたとき</a>
              <a href="https://heartlandferry.jp/faq/" target="_blank" rel="noreferrer">ハートランドフェリー｜バイクの乗船案内</a>
              <a href="https://www.town.rebun.hokkaido.jp/hotnews/detail/00000180.html" target="_blank" rel="noreferrer">北海道礼文町｜スコトン岬</a>
              <a href="https://www.town.erimo.lg.jp/kankou/pages/k9mfea0000000bnv.html" target="_blank" rel="noreferrer">えりも町｜襟裳岬</a>
            </div>
          </section>

          <aside className="hokkaido-next">
            <div><p>CONTINUE THE JOURNEY</p><h2>次の記録へ。</h2></div>
            <div className="hokkaido-next__links">
              <a href="/travel/">北海道・ロングツーリングの記事を見る <ForwardArrow /></a>
              <a href="/articles/world-trip/">KLR650とIMS 37Lタンクの製作記を読む <ForwardArrow /></a>
              <a href="/articles/machine-file-001/">BMW R1200GS 60L大陸横断マシンを読む <ForwardArrow /></a>
              <a href={`${root}downloads/dust-line-issue-01-sample.pdf`} target="_blank" rel="noreferrer">創刊号を2ページ試し読み <ForwardArrow /></a>
              <a href={`${root}#issue`}>創刊号について見る <ForwardArrow /></a>
              <a href="https://x.com/DUSTLINE_ADV" target="_blank" rel="noreferrer">公式Xを見る <ForwardArrow /></a>
              <a href={`${root}?page=goods`}>DUST LINE公式グッズを見る <ForwardArrow /></a>
            </div>
          </aside>

          <footer className="article-footer">
            <span>DUST LINE / TRAVEL REPORT / KTM 1190</span>
            <a href={root}>JOURNALへ戻る</a>
          </footer>
        </article>
      </main>
    </div>
  )
}
