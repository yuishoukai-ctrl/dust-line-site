import { useEffect } from 'react'
import './world-trip.css'

function ArticleArrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  )
}

function Figure({ src, alt, caption, className = '', priority = false }) {
  return (
    <figure className={`world-figure ${className}`}>
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
  ['machine', '01', 'KLR650を選んだ理由'],
  ['tank', '02', 'IMS 37Lタンクを輸入'],
  ['fit', '03', '37Lタンクを車体へ合わせる'],
  ['fuel', '04', '負圧ポンプで燃料を使い切る'],
  ['make', '05', 'パニアステーを製作'],
  ['stopped', '06', '完成したKLR650、止まった旅'],
]

export default function WorldTripArticle({ assetPath }) {
  const root = import.meta.env.BASE_URL
  const image = (name) => assetPath(`world-trip/${name}`)
  const samplePdf = `${root}downloads/dust-line-issue-01-sample.pdf`
  const hokkaidoArticle = '/articles/hokkaido-1190/'

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'KLR650で世界一周へ｜IMS 37Lビッグタンク製作記 | DUST LINE'
    window.scrollTo(0, 0)
    return () => { document.title = previousTitle }
  }, [])

  return (
    <div className="article-page world-digest">
      <header className="article-header">
        <a className="article-header__brand" href={root}>DUST LINE</a>
        <a className="article-header__back" href={root}><ArticleArrow /> 記事一覧へ</a>
      </header>

      <main>
        <article>
          <header className="article-hero">
            <div className="article-hero__copy">
              <p className="article-kicker">WEB DIGEST / BUILD LOG 001</p>
              <h1>KLR650で<br />世界一周へ。<br />37Lを積む。</h1>
              <p className="article-deck">
                KLR650を選び、IMS 37Lビッグタンクを載せ、足りない部品は作った。
                車両が完成したとき、旅を始められない理由が残った。
              </p>
              <div className="article-byline"><span>WORDS & PHOTOS</span><strong>DUST LINE編集部</strong><span>WEB EDITION</span></div>
            </div>
            <Figure
              src={image('completed-klr650.jpg')}
              alt="IMS 37Lビッグタンクとパニアステーを装着した世界一周仕様のKLR650"
              caption="車両は完成した。これは、出発しなかった旅の入口だ。"
              className="article-hero__machine"
              priority
            />
          </header>

          <div className="article-intro world-digest__intro">
            <p className="article-dropcap">
              世界一周は、国境を越える前から始まっていた。ユーラシア大陸とアメリカ大陸の横断を見据え、選んだのは欧州仕様のKLR650。故障したときに直しやすく、IMS 37Lビッグタンクで給油地点の少ない土地を走れる一台を目指した。
            </p>
            <p>
              WEB版では、長い準備を6つの判断に絞ってたどる。切断、溶接、燃料系統、ワンオフ部品の詳しい工程は、創刊号の8ページに残した。
            </p>

            <aside className="web-edition-note" aria-label="WEB版と誌面版の違い">
              <span>WEB EDITION</span>
              <strong>ここでは、旅と車両製作の全体像を。</strong>
              <p>加工の細部、連続写真、DUST DATAは誌面版で読めます。</p>
            </aside>

            <dl className="web-edition-stats">
              <div><dt>MACHINE</dt><dd>KLR650<small>EUROPEAN SPEC.</small></dd></div>
              <div><dt>FUEL</dt><dd>37<small>LITERS</small></dd></div>
              <div><dt>EST. RANGE</dt><dd>800<small>KM / CALCULATED</small></dd></div>
              <div><dt>PLAN</dt><dd>2<small>CONTINENTS</small></dd></div>
            </dl>
          </div>

          <nav className="article-toc" aria-label="記事の目次">
            <p>6 DECISIONS BEFORE DEPARTURE</p>
            <ol>
              {chapters.map(([id, number, label]) => (
                <li key={id}><a href={`#${id}`}><span>{number}</span>{label}</a></li>
              ))}
            </ol>
          </nav>

          <section className="article-section article-section--dark" id="machine">
            <div className="article-section__number">01</div>
            <div className="article-section__heading">
              <p>CHOOSING THE MACHINE</p>
              <h2>世界一周の相棒に<br />KLR650を選んだ理由。</h2>
            </div>
            <div className="web-copy-grid">
              <p>
                整備拠点が限られる地域で故障したら、その場で旅が終わる。だから選定基準は、最新かどうかでも、速いかどうかでもなかった。海外で流通し、構造を理解しやすく、手を入れられること。XR650LとKLR650まで候補を絞り、最終的に欧州仕様のKLR650を選んだ。
              </p>
              <div className="web-decision"><span>DECISION</span><strong>KLR650 / EUROPEAN SPEC.</strong><small>故障率をゼロにするより、故障しても先へ進める一台。</small></div>
            </div>
            <div className="candidate-grid world-digest__machine-images">
              <Figure src={image('route-map.jpg')} alt="日本からロシアを経由してヨーロッパへ向かう当時の計画ルート" caption="当時計画していたユーラシア横断ルート。" />
              <Figure src={image('klr650-stock.jpg')} alt="世界一周用のベース車両に選んだKLR650" caption="世界一周仕様のベースに選んだ欧州仕様KLR650。" />
            </div>
          </section>

          <section className="article-section article-section--arrival" id="tank">
            <div className="arrival-copy">
              <p className="article-kicker">THE 10-GALLON ANSWER</p>
              <h2>IMS 37Lビッグタンクを、<br />海の向こうから。</h2>
              <p>
                給油地点の少ない土地を想定して選んだのは、IMS製の10ガロンタンク。フロリダのショップから680ドルで取り寄せ、当時の送料などを含む総額は約14万円になった。
              </p>
              <p className="arrival-shout">でかい。</p>
              <dl className="article-specs">
                <div><dt>CAPACITY</dt><dd>10 gal / 約37L</dd></div>
                <div><dt>PRICE</dt><dd>$680 / 総額約14万円</dd></div>
                <div><dt>EST. RANGE</dt><dd>約800km</dd></div>
              </dl>
              <p className="web-calculation-note">※航続距離は37L×約22km/Lによる机上計算。実走値ではありません。</p>
            </div>
            <Figure src={image('tank-arrival.jpg')} alt="海外から届いたIMS製10ガロンタンク" caption="箱から出てきた10ガロン、約37Lの樹脂タンク。" />
          </section>

          <section className="article-section article-section--workshop" id="fit">
            <div className="article-section__number">03</div>
            <div className="article-section__heading">
              <p>NOT A BOLT-ON PART</p>
              <h2>KLR650に37Lタンクを載せる。<br />何も合わない。</h2>
            </div>
            <div className="workshop-lead world-digest__workshop-lead">
              <p>
                タンクは北米仕様向け。車両は欧州仕様。取付ステー、フロントウインカー、エンジンガードのどれも、そのままでは使えなかった。
              </p>
              <p>
                合わない理由を一つずつ見つけ、切って、位置を変え、必要な隙間を作る。取り付けではなく、車体側まで含めた製作になった。
              </p>
            </div>
            <div className="web-problem-list" aria-label="主な加工点">
              <div><span>01</span><strong>MOUNT</strong><p>取付ステーを切断し、欧州仕様の車体へ合わせて再製作。</p></div>
              <div><span>02</span><strong>INDICATOR</strong><p>タンクへ接触するフロントウインカーの位置を変更。</p></div>
              <div><span>03</span><strong>CLEARANCE</strong><p>タンクとガードが接触しない距離を確保。</p></div>
            </div>
            <div className="workshop-gallery workshop-gallery--three">
              <Figure src={image('test-fit.jpg')} alt="KLR650へIMSタンクを仮合わせしている様子" caption="TEST FIT / まず載せ、合わない場所を探す。" />
              <Figure src={image('tank-bracket-close.jpg')} alt="作り直したタンク取付部の拡大" caption="MOUNT / 取付位置を車体へ合わせる。" />
              <Figure src={image('indicator-clearance.jpg')} alt="タンクとの干渉を避けたフロントウインカー" caption="RELOCATE / ウインカーの位置を移す。" />
            </div>
          </section>

          <aside className="article-magazine-break">
            <div>
              <p>ISSUE 01 / 8-PAGE FEATURE</p>
              <h2>ここから先は、<br />写真で見る加工記録。</h2>
            </div>
            <div>
              <p>北米仕様のタンクを欧州仕様のKLR650へ合わせるまで。切断、溶接、燃料系統、パニア製作の細部を、創刊号では8ページで収録します。</p>
              <a href={samplePdf} target="_blank" rel="noreferrer">創刊号を2ページ試し読み <ArticleArrow /></a>
            </div>
          </aside>

          <section className="article-section article-section--fuel" id="fuel">
            <Figure src={image('fuel-system.jpg')} alt="IMSタンクからキャブレターへつながる燃料系統" caption="左右の低い位置に残る燃料を、負圧ポンプで送る構成。" />
            <div>
              <p className="article-kicker">VACUUM FUEL PUMP</p>
              <h2>負圧ポンプで37Lの燃料を、<br />最後まで使う。</h2>
              <p>
                半透明のタンクなら、メーターに頼らず残量を目で確認できる。一方、タンクの最下部はキャブレターより低く、重力だけでは燃料を使い切れない。そこで負圧ポンプを使い、左右の低い場所から燃料を吸い上げる構成にした。仕組みとホースの取り回しは誌面版で詳しく紹介している。
              </p>
            </div>
          </section>

          <section className="article-section article-section--workshop" id="make">
            <div className="article-section__number">05</div>
            <div className="article-section__heading">
              <p>ONE-OFF PANNIER RACK</p>
              <h2>パニアステーとガード。<br />売っていないなら作る。</h2>
            </div>
            <div className="article-feature-grid world-digest__pannier">
              <div className="article-prose">
                <p>
                  欧州仕様KLR650に合うパニアステーは、ほとんど見つからなかった。ベースにしたのはヤマハMT-07用。車体へ合わせて切断し、溶接し、KLR650用へ作り替えた。
                </p>
                <p>
                  既製品を取り付けて終わるはずだった準備は、タンクから周辺部品までを作るプロジェクトへ広がっていった。
                </p>
              </div>
              <Figure src={image('pannier-frame.jpg')} alt="KLR650へ仮組みしたワンオフのパニアステー" caption="塗装前のワンオフ・パニアステー。" />
            </div>
          </section>

          <section className="article-finale" id="stopped">
            <div className="article-finale__copy">
              <p className="article-kicker">THE TRIP THAT STOPPED</p>
              <h2>KLR650は完成した。<br />旅だけが始まらなかった。</h2>
              <p>
                37Lタンクを備えたKLR650は完成し、知人とのツーリングでも走らせた。車両は、出発できる形になった。
              </p>
              <p>
                しかし、ロシアによるウクライナ侵攻後、当時計画していたロシア横断ルートを実行することは難しくなった。これは計画当時の経緯を記したもので、現在の渡航可否を示すものではない。
              </p>
              <p className="article-finale__last">旅は始まらなかった。けれど、作った一台と判断の跡は残った。</p>
              <aside className="article-note">
                <strong>TRAVEL INFORMATION</strong>
                <p>国際情勢、国境、交通機関の情報は変化します。渡航を検討する際は、必ず最新の公的情報を確認してください。</p>
                <a href="https://www.anzen.mofa.go.jp/m/mbcrimesituation_178.html" target="_blank" rel="noreferrer">外務省海外安全情報</a>
              </aside>
            </div>
            <div className="article-finale__images article-finale__images--single">
              <Figure src={image('group-ride.jpg')} alt="知人とのツーリングに参加した世界一周仕様のKLR650" caption="知人とのツーリング。車両の準備はできていた。" />
            </div>
          </section>

          <section className="magazine-cta" aria-labelledby="magazine-cta-title">
            <div>
              <p className="article-kicker">CONTINUE IN ISSUE 01</p>
               <h2 id="magazine-cta-title">KLR650製作の全記録は、<br />創刊号で。</h2>
              <p>WEBで省いた加工の細部と写真を、8ページの誌面にまとめました。</p>
            </div>
            <ul>
              <li>候補車の比較と、KLR650を選んだ理由</li>
              <li>37Lタンクの切断・位置変更・取付工程</li>
              <li>負圧ポンプ、エンジンガード、パニア製作</li>
              <li>全17点の写真とDUST DATA</li>
            </ul>
            <div className="magazine-cta__actions">
              <a className="magazine-cta__primary" href={samplePdf} target="_blank" rel="noreferrer">誌面を2ページ試し読み <ArticleArrow /></a>
              <a href="/build/">車両製作の記事を見る <ArticleArrow /></a>
              <a href="/garage/">溶接・加工の記事を見る <ArticleArrow /></a>
              <a href={`${root}#issue`}>創刊号について見る <ArticleArrow /></a>
              <a href="https://x.com/DUSTLINE_ADV" target="_blank" rel="noreferrer">公式Xを見る <ArticleArrow /></a>
              <a href={`${root}?page=goods`}>公式グッズを見る <ArticleArrow /></a>
            </div>
          </section>

          <aside className="article-next-read">
            <p>NEXT STORY / TRAVEL REPORT</p>
            <a href={hokkaidoArticle}><strong>KTM 1190 Adventureで行く北海道・利尻島・礼文島。</strong><span>約3,500km、10日間の記録 <ArticleArrow /></span></a>
          </aside>

          <footer className="article-footer">
            <span>DUST LINE / WEB DIGEST 001</span>
            <a href={root}>JOURNALへ戻る</a>
          </footer>
        </article>
      </main>
    </div>
  )
}
