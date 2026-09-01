import { useEffect } from 'react'
import './parts-page.css'

const plannedParts = [
  {
    number: '01',
    category: 'UNDERBODY PROTECTION',
    name: 'アンダーガード',
    description: 'エンジン下部を守るための構成を、車体とのクリアランスや整備性を確認しながら検討します。',
  },
  {
    number: '02',
    category: 'RALLY COCKPIT',
    name: 'ナビゲーションタワー',
    description: 'ナビゲーション機器を見やすくまとめるためのタワー。装着機器と配線の取り回しを含めて設計します。',
  },
  {
    number: '03',
    category: 'SIDE PROTECTION',
    name: 'エンジンガード',
    description: '車体側面とエンジン周辺の保護を目的に、取付位置と他部品との干渉を実車で確かめます。',
  },
  {
    number: '04',
    category: 'CONTROL PROTECTION',
    name: 'ブレーキマスターガード',
    description: 'ブレーキマスター周辺を保護するための小型ガード。操作や点検を妨げない形状を検討します。',
  },
]

const developmentSteps = [
  ['01', '採寸・設計', '実車を基準に取付位置、可動部、整備時のアクセスを確認します。'],
  ['02', '試作', '切断・曲げ・溶接を行い、形状と取付方法を詰めます。'],
  ['03', '実車確認', '走行前点検と干渉確認を重ね、必要な修正を反映します。'],
  ['04', '製品情報公開', '適合、材質、重量、価格、納期、取付条件を製品ごとに案内します。'],
]

function PartsArrow() {
  return <span className="parts-arrow" aria-hidden="true">→</span>
}

export default function PartsPage({ assetPath, contactUrl, officialXUrl }) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'BMW F 450 GS向けオリジナル部品｜DUST LINE GARAGE'
    window.scrollTo(0, 0)
    return () => { document.title = previousTitle }
  }, [])

  return (
    <main className="parts-page" id="main">
      <section className="parts-hero" aria-labelledby="parts-title">
        <div className="parts-hero__grid" aria-hidden="true" />
        <div className="parts-hero__copy reveal">
          <p className="parts-eyebrow">DUST LINE GARAGE / ORIGINAL PARTS</p>
          <p className="parts-status">BMW F 450 GS / SALES FROM MID-SEPTEMBER</p>
          <h1 id="parts-title">走るための<br />部品を、<br className="parts-mobile-break" />つくる。</h1>
          <p className="parts-hero__lead">
            旅と整備の現場で感じた「ここに必要」を、形にする。DUST LINE GARAGEでは、
            BMW F 450 GS向けのオリジナル部品を開発中。<br />販売時期は準備が整い次第お知らせします。
          </p>
          <a className="parts-button parts-button--accent" href="#lineup">製品ラインアップを見る <PartsArrow /></a>
        </div>

        <figure className="parts-hero__media reveal">
          <img
            src={assetPath('parts/side-stand-extension-welding.jpeg')}
            alt="DUST LINE GARAGEでサイドスタンド拡張部を溶接した過去の製作記録"
            decoding="async"
          />
          <figcaption><span>FABRICATION ARCHIVE</span>過去の製作記録／サイドスタンド拡張</figcaption>
        </figure>

        <p className="parts-hero__word" aria-hidden="true">PARTS</p>
      </section>

      <section className="parts-lineup" id="lineup" aria-labelledby="parts-lineup-title">
        <header className="parts-section-head reveal">
          <div className="parts-section-index"><span>01</span><span>PLANNED LINEUP</span></div>
          <div>
            <p>BMW F 450 GS / ORIGINAL PARTS</p>
            <h2 id="parts-lineup-title">最初の4点を、<br />実車から始める。</h2>
            <p>
              販売開始時期と価格、材質、適合年式などの詳細は、試作と実車確認を終えた製品から順に公開します。
            </p>
          </div>
        </header>

        <div className="parts-product-list">
          {plannedParts.map((part, index) => (
            <article className="parts-product reveal" key={part.number} style={{ '--delay': `${index * 70}ms` }}>
              <div className="parts-product__number" aria-hidden="true">{part.number}</div>
              <div className="parts-product__copy">
                <p>{part.category}</p>
                <h3>{part.name}</h3>
                <p>{part.description}</p>
              </div>
              <div className="parts-product__state">
                <span>STATUS</span>
                <strong>開発中</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="parts-development" aria-labelledby="parts-development-title">
        <header className="parts-development__head reveal">
          <p>DUST LINE GARAGE / DEVELOPMENT FLOW</p>
          <h2 id="parts-development-title">売る前に、<br />実車で確かめる。</h2>
        </header>
        <ol className="parts-steps">
          {developmentSteps.map(([number, title, text], index) => (
            <li className="reveal" key={number} style={{ '--delay': `${index * 60}ms` }}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="parts-craft" aria-labelledby="parts-craft-title">
        <div className="parts-craft__copy reveal">
          <div className="parts-section-index"><span>02</span><span>OUR FABRICATION</span></div>
          <p>DUST LINE GARAGE / MADE FROM THE RIDE</p>
          <h2 id="parts-craft-title">誌面で伝えてきた製作を、<br />次は部品へ。</h2>
          <p>
            溶接、塗装、整備を記事にするだけでなく、実際に使う部品として届ける準備を進めます。
            写真はF 450 GS用製品ではなく、これまでの製作姿勢を伝える過去のサイドスタンド拡張事例です。
          </p>
        </div>
        <figure className="parts-craft__media reveal">
          <img
            src={assetPath('parts/side-stand-extension-finished.jpeg')}
            alt="塗装まで完了したサイドスタンド拡張部の過去の製作事例"
            loading="lazy"
            decoding="async"
          />
          <figcaption><span>PAST WORK</span>溶接・仕上げ・塗装まで行った製作事例</figcaption>
        </figure>
      </section>

      <section className="parts-notice" aria-labelledby="parts-notice-title">
        <div className="parts-notice__title reveal">
          <p>BEFORE RELEASE</p>
          <h2 id="parts-notice-title">適合と条件は、<br />製品ごとに明記します。</h2>
        </div>
        <div className="parts-notice__body reveal">
          <p>
            販売開始時には、対応車種・年式、材質、重量、取付方法、必要な加工、他社部品との干渉、価格、納期、返品・保証条件を各商品ページに掲載します。
          </p>
          <p>
            DUST LINEはBMW MotorradおよびBMW AGとは関係のない独立した編集・製作チームです。
          </p>
          <div className="parts-notice__actions">
            <a className="parts-button parts-button--accent" href={contactUrl} target="_blank" rel="noreferrer">部品について問い合わせる <PartsArrow /></a>
            <a className="parts-text-link" href={officialXUrl} target="_blank" rel="noreferrer">開発情報を公式Xで見る <PartsArrow /></a>
          </div>
        </div>
      </section>
    </main>
  )
}
