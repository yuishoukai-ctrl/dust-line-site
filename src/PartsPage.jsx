import { useEffect } from 'react'
import { GuardFactoryLineup } from './GuardFactoryProducts'
import './parts-page.css'

const developmentSteps = [
  ['01', '採寸・設計', '実車を基準に取付位置、可動部、整備時のアクセスを確認します。'],
  ['02', '試作', '切断・曲げ・溶接を行い、形状と取付方法を詰めます。'],
  ['03', '実車確認', '走行前点検と干渉確認を重ね、必要な修正を反映します。'],
  ['04', '製品情報公開', '適合、材質、重量、価格、納期、取付条件を製品ごとに案内します。'],
]

function PartsArrow() {
  return <span className="parts-arrow" aria-hidden="true">→</span>
}

export default function PartsPage({ assetPath, basePath, contactUrl, officialXUrl }) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Guard Factory・オリジナル部品｜DUST LINE Parts'
    window.scrollTo(0, 0)
    return () => { document.title = previousTitle }
  }, [])

  return (
    <main className="parts-page" id="main">
      <section className="parts-hero" aria-labelledby="parts-title">
        <div className="parts-hero__grid" aria-hidden="true" />
        <div className="parts-hero__copy reveal">
          <p className="parts-eyebrow">DUST LINE / PARTS & FABRICATION</p>
          <p className="parts-status">GUARD FACTORY / DJEBEL 250 & F 450 GS</p>
          <h1 id="parts-title">走るための<br />部品を、<br className="parts-mobile-break" />つくる。</h1>
          <p className="parts-hero__lead">
            旅と整備の現場で感じた「ここに必要」を、形にする。Guard Factoryのジェベル250用ガード3点と、
            BMW F 450 GS向けガード4点のCAD開発画像を紹介します。
          </p>
          <a className="parts-button parts-button--accent" href="#guard-factory">Guard Factoryの製品を見る <PartsArrow /></a>
          <a className="parts-text-link parts-hero__development-link" href="#lineup">BMW F 450 GSの4商品を見る <PartsArrow /></a>
        </div>

        <figure className="parts-hero__media reveal">
          <img
            src={assetPath('parts/guard-factory/djebel250-frame-installed-1280.webp')}
            srcSet={`${assetPath('parts/guard-factory/djebel250-frame-installed-640.webp')} 640w, ${assetPath('parts/guard-factory/djebel250-frame-installed-1280.webp')} 1280w`}
            sizes="(max-width: 900px) calc(100vw - 40px), 46vw"
            width="1280" height="960"
            alt="Guard Factoryの右フレームガードとリアマスターシリンダーガードをジェベル250に装着した例"
            fetchPriority="high"
            decoding="async"
          />
          <figcaption><span>GUARD FACTORY / DJEBEL 250</span>右フレームガード・リアマスターシリンダーガードの装着例</figcaption>
        </figure>

        <p className="parts-hero__word" aria-hidden="true">PARTS</p>
      </section>

      <GuardFactoryLineup assetPath={assetPath} basePath={basePath} />

      <GuardFactoryLineup assetPath={assetPath} basePath={basePath} collection="f450gs" />

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
