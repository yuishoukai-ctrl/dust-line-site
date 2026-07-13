import { useEffect } from 'react'
import './world-trip.css'

function ArticleArrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  )
}

function Figure({ src, alt, caption, className = '' }) {
  return (
    <figure className={`world-figure ${className}`}>
      <img src={src} alt={alt} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

export default function WorldTripArticle({ assetPath }) {
  const root = import.meta.env.BASE_URL
  const image = (name) => assetPath(`world-trip/${name}`)

  useEffect(() => {
    const previousTitle = document.title
    document.title = '世界一周に行こうとしたら。 | DUST LINE'
    window.scrollTo(0, 0)
    return () => { document.title = previousTitle }
  }, [])

  return (
    <div className="article-page">
      <header className="article-header">
        <a className="article-header__brand" href={root}>DUST LINE</a>
        <a className="article-header__back" href={root}><ArticleArrow /> BACK TO JOURNAL</a>
      </header>

      <main>
        <article>
          <header className="article-hero">
            <div className="article-hero__copy">
              <p className="article-kicker">BUILD LOG 001 / WORLD TOUR MACHINE</p>
              <h1>世界一周に<br />行こうとしたら。</h1>
              <p className="article-deck">
                ユーラシア大陸とアメリカ大陸を横断するために選んだのは、KLR650。
                10ガロンの巨大タンクを海の向こうから取り寄せ、世界一周仕様へ作り替えた記録。
              </p>
              <div className="article-byline"><span>WORDS & PHOTOS</span><strong>DUST LINE編集部</strong><span>2026.07.13</span></div>
            </div>
            <Figure src={image('route-map.jpg')} alt="日本からロシアを経由してヨーロッパへ向かう計画ルート" caption="計画していたユーラシア大陸横断ルート。旅は車両選びから始まった。" className="article-hero__map" />
          </header>

          <div className="article-intro">
            <p className="article-dropcap">
              編集長である筆者が、ロシアによるウクライナ侵攻以前に計画していたユーラシア大陸横断とアメリカ大陸横断。その旅のために作った一台を紹介しよう。
            </p>
            <p>
              2024年から2025年のどちらかで、世界一周へ出ようと決めていた。新型コロナウイルスによる各国のロックダウンが終わり、世界が再び動き始めた頃だ。
            </p>
            <p>
              日本から韓国・東海へ渡り、そこからロシア・ウラジオストクへ向かうフェリーが復活したことで、バイクや車とともにロシアへ入るルートが現実味を帯びた。そうと決まれば、さまざまな準備が必要になる。まずは車両作りからだ。
            </p>
          </div>

          <section className="article-section article-section--dark">
            <div className="article-section__number">01</div>
            <div className="article-section__heading">
              <p>CHOOSING THE MACHINE</p>
              <h2>壊れにくく、<br />直せるバイク。</h2>
            </div>
            <div className="article-columns">
              <p>
                定番のBMW R1200GSで行くか、KTM 1190 Adventureで行くか。だが本音をいえば、なるべく故障の少ないバイクで行きたかった。
              </p>
              <p>
                ユーラシア大陸を走り、中央アジアにも寄り道する。整備拠点が限られる地域で故障したとき、本当に修理できるのかという不安があった。BMWのRシリーズはシャフトドライブのため日常的なチェーンメンテナンスは不要だが、駆動系が故障すれば、その場で旅が終わる可能性もある。それが荒野の真ん中なのか、砂漠地帯の途中なのかは誰にも予想できない。
              </p>
              <p>
                そこで、海外でも販売されている国産車なら、現地でも部品を見つけやすいのではないかと考えた。候補を絞り込んだ結果、残ったのはホンダXR650LとカワサキKLR650の2台だった。
              </p>
            </div>
            <div className="candidate-grid">
              <Figure src={image('xr650l.jpg')} alt="ホンダXR650L" caption="候補車1：セルスターターを備えるホンダXR650L。" />
              <Figure src={image('klr650-stock.jpg')} alt="カワサキKLR650" caption="候補車2：長年販売されてきたカワサキKLR650。" />
            </div>
            <div className="article-columns article-columns--after">
              <p>
                XR650Rは、バハラリーで砂漠を駆けるレーサーとして知られる。キックスタートのみを備える一方、XR650Lはセルスターターを採用し、キックは持たない。Rに比べれば穏やかな性格のモデルだ。
              </p>
              <p>
                もう1台のKLR650は、1980年代から販売されているロングセラーモデル。世代によってトランスミッションに違いがあり、北米仕様と欧州仕様でも細部が異なる。世界一周用として購入したのは、KLR650の欧州仕様だった。
              </p>
              <p>
                古い北米仕様は部品がすでに廃番になっている可能性があり、車両状態にも不安があった。1990年代から2000年代初頭に世界を走った先輩ライダーの記録には、「300km先までガソリンスタンドがない」「国境を目指して200km進んだら道が消え、また200km戻った」といった話が出てくる。想像以上に過酷な旅路だ。
              </p>
            </div>
          </section>

          <section className="article-section article-section--paper">
            <div className="article-section__number">02</div>
            <div className="article-section__heading">
              <p>THE 10-GALLON ANSWER</p>
              <h2>世界一周なら、<br />ビッグタンク。</h2>
            </div>
            <div className="article-feature-grid">
              <div className="article-prose">
                <p>
                  世界一周へ行くなら、やはりビッグタンクだ。海外サイトで見つけた樹脂製タンクの定番メーカーがIMSだった。フロリダ州のショップへ連絡し、日本へ売ってもらえるか問い合わせた。
                </p>
                <blockquote>
                  「なぜ日本人がIMSのビッグタンクを買うんだ？　詐欺じゃないのか？」
                </blockquote>
                <p>
                  返ってきたのは、かなり辛辣なメッセージだった。だが、こちらも同じライダーとして引くわけにはいかない。
                </p>
                <blockquote>
                  「KLR650で世界一周に行く。必要だから売ってくれないか？」
                </blockquote>
                <p>
                  そう伝えると、相手の反応は一変した。「それはすごい。ぜひ、うちの店にも寄ってくれよ」。免許証の画像を送り、本人確認が済んでから購入できることになった。価格は680ドル。当時の円安と送料を合わせると、総額は約14万円になった。
                </p>
              </div>
              <Figure src={image('ims-listing.jpg')} alt="IMS製10ガロンタンクの販売ページ" caption="フロリダのショップで見つけたIMS製10ガロンタンク。" />
            </div>
          </section>

          <section className="article-section article-section--arrival">
            <div className="arrival-copy">
              <p className="article-kicker">TANK ARRIVAL</p>
              <h2>10ガロン、<br />37リットル。</h2>
              <p>
                ついにタンクが届いた。郵便局の職員から「大きな荷物が届いていますよ」と声をかけられ、箱を開けて出てきたのがこれだ。
              </p>
              <p className="arrival-shout">でかい。</p>
              <p>
                容量は10ガロン。リットル換算で約37Lになる。KLR650欧州仕様の燃費を約22km/Lとして単純計算すると、航続距離は約800km。これなら余裕だと思い、装着作業を始めた。
              </p>
              <dl className="article-specs">
                <div><dt>CAPACITY</dt><dd>10 gal / 約37L</dd></div>
                <div><dt>EST. RANGE</dt><dd>約800km</dd></div>
                <div><dt>TANK COLOR</dt><dd>Natural</dd></div>
              </dl>
            </div>
            <Figure src={image('tank-arrival.jpg')} alt="床に置かれたIMS製37Lタンク" caption="アメリカから届いたナチュラルカラーのIMS製タンク。" />
          </section>

          <section className="article-section article-section--workshop">
            <div className="article-section__number">03</div>
            <div className="article-section__heading">
              <p>NOT A BOLT-ON PART</p>
              <h2>載せてみると、<br />何も合わない。</h2>
            </div>
            <div className="workshop-lead">
              <p>
                いざタンクを載せてみると、さまざまな部分が合わなかった。理由は明確だ。このタンクは北米仕様向けであり、筆者のKLR650は欧州仕様だからである。
              </p>
              <p>
                取付ステーは合わず、切断して作り直すことになった。フロントウインカーもタンクへ接触するため、位置を変更しなければならない。切って、合わせて、位置を変える。加工を重ね、ようやく車体へ装着できた。
              </p>
            </div>
            <div className="workshop-gallery">
              <Figure src={image('test-fit.jpg')} alt="KLR650へIMSタンクを仮組みしている様子" caption="まずは車体へ仮組み。欧州仕様にはそのまま装着できなかった。" />
              <Figure src={image('tank-bracket-close.jpg')} alt="タンク取付部のクローズアップ" caption="タンクと車体側ステーの位置関係を確認する。" />
              <Figure src={image('tank-bracket.jpg')} alt="加工したタンクステー" caption="合わない取付ステーは切断し、車体に合わせて加工。" />
              <Figure src={image('indicator-clearance.jpg')} alt="タンクとウインカーの干渉箇所" caption="フロントウインカーもタンクと干渉。位置変更が必要だった。" />
            </div>
          </section>

          <section className="article-section article-section--paper">
            <div className="article-section__number">04</div>
            <div className="article-section__heading">
              <p>SEE THE FUEL</p>
              <h2>燃料が見える、<br />という保険。</h2>
            </div>
            <div className="article-feature-grid article-feature-grid--reverse">
              <div className="article-prose">
                <p>
                  タンクをナチュラルカラーにしたのには理由がある。旅先でトリップメーターが壊れ、残りの燃料が分からなくなる事態を想定したからだ。半透明のタンクなら、外側から燃料の残量を直接確認できる。トラブルへの対処もシンプルになる。
                </p>
                <p>
                  37Lタンクは大きいため、既存のエンジンガードもそのままでは装着できず、こちらも加工が必要になった。ガードとタンクの距離が近すぎれば、接触によってタンクへ食い込む恐れがある。破損すれば、37Lの半分近いガソリンが漏れ出す可能性もある。十分なクリアランスを確保しなければならない。
                </p>
              </div>
              <div className="article-image-pair">
                <Figure src={image('tank-front.jpg')} alt="車体前方から見た大型タンク" caption="前方から見ると、タンクの張り出しがよく分かる。" />
                <Figure src={image('engine-guard.jpg')} alt="大型タンクとエンジンガード" caption="タンクとの接触を避けるため、エンジンガードも加工した。" />
              </div>
            </div>
          </section>

          <section className="article-section article-section--fuel">
            <Figure src={image('fuel-system.jpg')} alt="IMS製タンク下部の燃料配管" caption="ナチュラルカラーなら燃料残量を目視できる。下部の燃料を吸い上げる配管も組み込まれている。" />
            <div>
              <p className="article-kicker">VACUUM FUEL PUMP</p>
              <h2>重力だけでは、<br />最後まで使えない。</h2>
              <p>
                IMSタンクは非常に大きく、左右の最下部がキャブレターより低い位置にくる。そのため、最も低い部分の燃料は重力だけではキャブレターへ落ちていかない。
              </p>
              <p>
                そこでIMSが採用したのが、キャブレターの負圧を利用するポンプだ。原理はスクーターの負圧式燃料コックと同じ。タンクから伸びるホースの奥側がキャブレターへつながり、負圧ポンプが左右の最下部から燃料を吸い上げ、燃料コック付近の液だまりへ供給する仕組みになっている。
              </p>
            </div>
          </section>

          <section className="article-section article-section--workshop">
            <div className="article-section__number">05</div>
            <div className="article-section__heading">
              <p>ONE-OFF PANNIER RACK</p>
              <h2>売っていないなら、<br />作るしかない。</h2>
            </div>
            <div className="workshop-lead">
              <p>
                KLR650欧州仕様に対応するパニアステーは、ほとんど販売されていなかった。そのため、パニアステーもワンオフで製作することにした。ベースに選んだのはヤマハMT-07用。車体へ合わせて切断・溶接し、KLR650へ装着できる形へ作り替えた。
              </p>
              <p>
                下の写真は加工を終え、塗装する前のパニアステーだ。既製品を探して終わるはずだった準備は、タンクだけでなく、周辺部品まで作るプロジェクトになっていった。
              </p>
            </div>
            <div className="workshop-gallery workshop-gallery--three">
              <Figure src={image('tank-mounted-side.jpg')} alt="タンクを装着したKLR650の側面" caption="タンクを装着し、周辺部品との位置を確認。" />
              <Figure src={image('pannier-frame.jpg')} alt="KLR650に仮組みしたパニアステー" caption="MT-07用をベースに、KLR650へワンオフ装着。" />
              <Figure src={image('pannier-parts.jpg')} alt="加工と溶接を終えたパニアステー" caption="加工を終え、塗装前の状態となったパニアステー。" />
            </div>
          </section>

          <section className="article-finale">
            <div className="article-finale__copy">
              <p className="article-kicker">THE TRIP THAT STOPPED</p>
              <h2>車両は完成した。<br />旅の時だけが、来なかった。</h2>
              <p>
                こうして、37Lタンクを備えた世界一周仕様のKLR650が完成した。知人とのツーリングでも走らせ、車両としての形は整った。
              </p>
              <p>
                しかし、世界一周へ出るタイミングを失ってしまった。ロシアによるウクライナ侵攻が始まり、日本を含む主要国はロシア政府から「非友好国」に指定された。情勢が悪化するなか、当初計画していたロシア横断は現実的な選択肢ではなくなった。
              </p>
              <p>
                さらに、ロシア国内ではガソリン不足が起き、ガソリン車をLPG仕様へ変更する人も出ているという話も耳にした。準備していたルートを、そのまま走れる状況ではない。
              </p>
              <p className="article-finale__last">次に世界一周へ行けるタイミングは、いつになるのだろう。</p>
              <aside className="article-note">
                <strong>編集部注</strong>
                <p>ロシアによる日本の位置づけは、原稿の「仮想敵国」から、外務省が使用する「非友好国」へ表現を修正した。旅行の可否や安全情報は、渡航時点の公的情報を必ず確認してほしい。</p>
                <a href="https://www.anzen.mofa.go.jp/m/mbcrimesituation_178.html" target="_blank" rel="noreferrer">外務省海外安全情報</a>
              </aside>
            </div>
            <div className="article-finale__images">
              <Figure src={image('completed-klr650.jpg')} alt="37Lタンクとパニアステーを装着した完成状態のKLR650" caption="完成したKLR650、37Lタンク仕様。" />
              <Figure src={image('group-ride.jpg')} alt="知人とのツーリングに参加したKLR650" caption="知人とのツーリング。旅の準備はできていた。" />
            </div>
          </section>

          <footer className="article-footer">
            <span>DUST LINE / BUILD LOG 001</span>
            <a href={root}>JOURNALへ戻る</a>
          </footer>
        </article>
      </main>
    </div>
  )
}
