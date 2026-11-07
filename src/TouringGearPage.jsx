import { useEffect } from 'react'
import { amazonGearSearch, amazonGearProduct, recommendedMirror, repairGear, packingGear, campingGear } from './touring-gear'
import { GearGuideLinks } from './GearGuideArticle'
import './touring-gear.css'

function GearList({ items }) {
  return (
    <ul className="tg-products">
      {items.map((item) => (
        <li key={item.name}>
          <div><h3>{item.name}</h3><p>{item.detail}</p><a className="tg-spec-link" href={item.source} target="_blank" rel="noopener">メーカーの仕様<span aria-hidden="true">↗</span></a></div>
          <a className="tg-amazon" href={amazonGearSearch(item.query)} target="_blank" rel="sponsored noopener"
            aria-label={`${item.name}をAmazonで探す（新しいタブ）`}>
            Amazonで探す<span aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function TouringGearPage({ assetPath, basePath = '/' }) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = '編集部のツーリング装備｜旅の記事から選ぶ道具｜DUST LINE'
    return () => { document.title = previousTitle }
  }, [])

  return (
    <main id="main" className="touring-gear">
      <header className="tg-hero">
        <img className="tg-hero__image" src={assetPath('camp-sunset.jpg')} width="1800" height="1350"
          alt="夕暮れのキャンプ場に停めた、荷物を積んだアドベンチャーバイク" fetchPriority="high" />
        <div className="tg-hero__shade" />
        <div className="tg-hero__inner tg-container">
          <nav className="tg-breadcrumb" aria-label="パンくずリスト">
            <a href={basePath}>ホーム</a><span aria-hidden="true">/</span><span aria-current="page">ツーリング装備</span>
          </nav>
          <div className="tg-hero__copy">
            <p className="tg-kicker">DUST LINE / GEAR GUIDE</p>
            <h1>編集部の<br />ツーリング装備</h1>
            <p className="tg-hero__lead">旅の記事から、次に持っていく道具を。</p>
            <div className="tg-hero__actions">
              <a className="tg-hero__link" href="#guides">装備の選び方を読む<span aria-hidden="true">↓</span></a>
              <a className="tg-hero__link" href="#editors-pick">編集部のおすすめを見る<span aria-hidden="true">↓</span></a>
            </div>
          </div>
        </div>
      </header>

      <div className="tg-disclosure tg-container">
        <p><strong>広告</strong> 本ページはアフィリエイトリンクを含みます。Amazonのアソシエイトとして、DUSTLINEは適格販売により収入を得ています。</p>
        <p>編集部おすすめのミラーと、用途に合わせた購入候補を紹介します。記事に添えた実走・積載写真は、紹介するミラーや購入候補の商品写真ではありません。</p>
        <p>製品仕様確認：2026年11月7日。価格・在庫・適合は購入先でご確認ください。</p>
      </div>

      <section id="editors-pick" className="tg-pick tg-container" aria-labelledby="tg-pick-title">
        <div className="tg-pick__heading">
          <p className="tg-kicker">編集部のおすすめ</p>
          <h2 id="tg-pick-title">ボールジョイント式<br />バイクミラー</h2>
          <p className="tg-pick__model">{recommendedMirror.brand}<span aria-hidden="true"> / </span>{recommendedMirror.set}</p>
        </div>
        <div className="tg-pick__body">
          <p>{recommendedMirror.description}</p>
          <p>{recommendedMirror.mounting}</p>
          <p className="tg-note">{recommendedMirror.fitNote}</p>
          <a className="tg-amazon tg-pick__amazon" href={amazonGearProduct(recommendedMirror.asin)} target="_blank" rel="sponsored noopener"
            aria-label={`${recommendedMirror.brand} ${recommendedMirror.name}をAmazonで見る（新しいタブ）`}>
            このミラーをAmazonで見る<span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <nav className="tg-jump tg-container" aria-label="用途から装備を選ぶ">
        <a href="#repair"><span>01</span>パンクに備える<span aria-hidden="true">↓</span></a>
        <a href="#packing"><span>02</span>荷物をまとめる<span aria-hidden="true">↓</span></a>
        <a href="#camping"><span>03</span>キャンプで泊まる<span aria-hidden="true">↓</span></a>
      </nav>

      <section id="repair" className="tg-section tg-container" aria-labelledby="tg-repair-title">
        <div className="tg-section__heading">
          <p className="tg-kicker">01 / REPAIR</p>
          <h2 id="tg-repair-title">パンクに備える。</h2>
          <p>みちのくラリーの対談で挙がったのは、パッチ、予備チューブ、タイヤレバー、空気入れ、虫回し、ホイール脱着工具、棒ジャッキ。実際のトラブルから、持っていく道具を考えます。</p>
        </div>
        <div className="tg-repair-grid">
          <div className="tg-repair-story">
            <figure className="tg-figure tg-repair-photo">
              <img src={assetPath('michinoku-rally/09-1300.webp')} width="1299" height="1733" loading="lazy" decoding="async"
                alt="みちのくアドベンチャーラリーで確認したタイヤのパンク箇所" />
              <figcaption>みちのくアドベンチャーラリーでのパンク対応。写真：石川。</figcaption>
            </figure>
            <a className="tg-story-link" href={`${basePath}articles/michinoku-adventure-rally/`}>みちのくラリーの対談を読む<span aria-hidden="true">→</span></a>
          </div>
          <GearList items={repairGear} />
        </div>
        <p className="tg-note">修理用品はチューブ式・チューブレス式で異なります。ここで紹介するチューブ補修用品は、チューブ式向けです。</p>
      </section>

      <section id="packing" className="tg-packing" aria-labelledby="tg-packing-title">
        <div className="tg-container">
          <div className="tg-packing-top">
            <div className="tg-section__heading">
              <p className="tg-kicker">02 / PACKING</p>
              <h2 id="tg-packing-title">荷物をまとめる。</h2>
              <p>北海道・離島を巡った10日間、3,500kmの旅。積載例を眺めながら、自分の車体と旅の日数に合う収納を考えたい。</p>
              <a className="tg-story-link" href={`${basePath}articles/hokkaido-1190/`}>北海道ツーリングの記事を読む<span aria-hidden="true">→</span></a>
            </div>
            <figure className="tg-figure">
              <img src={assetPath('hokkaido-1190/01-ktm-loaded-for-hokkaido.jpg')} width="1295" height="974" loading="lazy" decoding="async"
                alt="トップケースと左右のパニアケースを装着した北海道ツーリングのKTM 1190 Adventure" />
              <figcaption>北海道記事の積載例。紹介するシートバッグとは異なります。</figcaption>
            </figure>
          </div>
          <GearList items={packingGear} />
        </div>
      </section>

      <section id="camping" className="tg-section tg-container" aria-labelledby="tg-camping-title">
        <div className="tg-section__heading">
          <p className="tg-kicker">03 / CAMPING</p>
          <h2 id="tg-camping-title">キャンプで泊まる。</h2>
          <p>泊まる季節、収納サイズ、設営のしやすさ。バイクに積める範囲で、一晩を過ごす道具を選びます。</p>
        </div>
        <GearList items={campingGear} />
        <aside className="tg-own-product" aria-labelledby="tg-fire-title">
          <figure className="tg-figure">
            <img src={assetPath('parts/guard-factory/stainless-fire-pit-oblique-20261021-1280.webp')} width="1280" height="960"
              loading="lazy" decoding="async" alt="GUARD FACTORYの無塗装ステンレス焚き火台の実物写真" />
          </figure>
          <div>
            <p className="tg-kicker">GUARD FACTORY / DUSTLINE取扱商品</p>
            <h3 id="tg-fire-title">ソロキャンプに、<br />ステンレス焚き火台。</h3>
            <p>素材はステンレス、仕上げは無塗装。分解して収納する、ソロツーリングキャンプ向けの焚き火台です。</p>
            <p className="tg-own-product__price">5,980<span>円（税込）</span></p>
            <a className="tg-story-link" href={`${basePath}parts/guard-factory/stainless-fire-pit/`}>仕様・購入相談を見る<span aria-hidden="true">→</span></a>
          </div>
        </aside>
      </section>

      <section id="guides" className="tg-guides tg-container" aria-labelledby="tg-guides-title">
        <h2 id="tg-guides-title">装備の選び方</h2>
        <p>取材で見えた準備の課題と、製品の仕様から。自分の車両と旅に合う道具を考えます。</p>
        <GearGuideLinks basePath={basePath} />
      </section>

      <section className="tg-closing" aria-labelledby="tg-closing-title">
        <div className="tg-container">
          <p className="tg-kicker">READ THE RIDE</p>
          <h2 id="tg-closing-title">道具の先に、旅がある。</h2>
          <div className="tg-related">
            <a href={`${basePath}articles/michinoku-adventure-rally/`}><span>みちのくアドベンチャーラリー</span><strong>準備から、ダートの先まで。</strong><span aria-hidden="true">→</span></a>
            <a href={`${basePath}articles/hokkaido-1190/`}><span>KTM 1190 / 北海道・離島の旅</span><strong>10日間、3,500kmの記録。</strong><span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>
    </main>
  )
}
