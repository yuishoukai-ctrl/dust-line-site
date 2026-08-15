import { useEffect } from 'react'
import { trackAnalyticsEvent } from './lib/analytics'
import './offroad-magazine.css'

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  )
}

const sections = [
  {
    number: '01',
    label: 'RIDE / FIELD REPORT',
    title: '道の外で、確かめる。',
    copy: '林道、長距離、離島。アドベンチャーバイクで実際に走り、旅の途中で起きたことや装備の選択まで記録します。',
    image: 'hokkaido-1190/04-ororon-wind-turbine-road.jpg',
    alt: '北海道の道を走るアドベンチャーバイク',
    href: '/travel/',
    link: '旅の記録を読む',
  },
  {
    number: '02',
    label: 'BUILD / MACHINE FILE',
    title: '売っていないなら、つくる。',
    copy: '60Lタンク、トリプルヘッドライト、37Lビッグタンク。完成車の紹介だけでなく、車両を起こす過程を残します。',
    image: 'bike-profile.jpg',
    alt: '60Lタンクとトリプルヘッドライトを備えたBMW R1200GS',
    href: '/build/',
    link: '車両製作を読む',
  },
  {
    number: '03',
    label: 'GARAGE / HANDS ON',
    title: '手を動かした分だけ、深くなる。',
    copy: 'カスタム、溶接、塗装、整備。自社で実車と部品に向き合える編集部だから、工程と判断を具体的に伝えられます。',
    image: 'world-trip/tank-mounted-side.jpg',
    alt: 'IMS製37Lタンクを装着するKLR650の車両製作',
    href: '/garage/',
    link: 'ガレージ記事を読む',
  },
]

export default function OffroadMagazinePage({ assetPath, signupPath = '/account/signup/', libraryPath = '/library/' }) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'オフロードバイク雑誌 DUST LINEとは｜2026年9月1日創刊'
    window.scrollTo(0, 0)
    return () => { document.title = previousTitle }
  }, [])

  return (
    <main className="magazine-page" id="main">
      <header className="magazine-hero">
        <div className="magazine-hero__image">
          <img src={assetPath('hero-rider.jpg')} alt="ダートを走るアドベンチャーバイク" fetchPriority="high" />
        </div>
        <div className="magazine-hero__shade" aria-hidden="true" />
        <div className="magazine-hero__copy reveal">
          <p className="magazine-eyebrow">OFF-ROAD MOTORCYCLE MAGAZINE / DUST LINE</p>
          <h1>オフロードバイク雑誌を、<br /><span>もっと遠くへ。</span></h1>
          <p className="magazine-hero__lead">
            DUST LINEは、オフロードバイクとアドベンチャーバイクの旅、車両製作、
            カスタム、溶接、塗装を、実走と実作業から届ける季刊誌です。
          </p>
          <div className="magazine-hero__actions">
            <a className="magazine-button magazine-button--accent" href={signupPath} onClick={() => trackAnalyticsEvent('signup_cta_click')}>創刊号を無料で読む <Arrow /></a>
            <a className="magazine-text-link" href={libraryPath}>会員ログイン <Arrow /></a>
          </div>
        </div>
        <div className="magazine-hero__release" aria-label="創刊号の発売情報">
          <small>ISSUE 01 / FREE</small>
          <strong>2026.09.01</strong>
          <span>無料公開</span>
        </div>
        <p className="magazine-hero__word" aria-hidden="true">MAGAZINE</p>
      </header>

      <section className="magazine-intro" aria-labelledby="magazine-intro-title">
        <div className="magazine-section-label reveal"><span>01</span><span>ABOUT DUST LINE</span></div>
        <div className="magazine-intro__grid">
          <div className="reveal">
            <p className="magazine-kicker">QUARTERLY / DIGITAL FIRST</p>
            <h2 id="magazine-intro-title">読むだけで、<br />次の一台が動き出す。</h2>
          </div>
          <div className="magazine-intro__copy reveal">
            <p>
              新車の仕様やレース結果だけではなく、「なぜその車両を選んだか」「どう直し、どう作ったか」
              「走って何が分かったか」までを一つの物語として編集します。
            </p>
            <p>
              公式アプリとWebサイトから購読でき、店舗用の紙面はオフロードショップやディーラーなどへ配布予定です。
              創刊号は2026年9月1日に無料公開。第2号からは各号1,480円（税込）の単品販売で季刊発行します。
            </p>
          </div>
        </div>
        <dl className="magazine-facts reveal">
          <div><dt>FIRST ISSUE</dt><dd><time dateTime="2026-09-01">2026年9月1日</time></dd><span>創刊号・無料公開</span></div>
          <div><dt>FREQUENCY</dt><dd>年4回</dd><span>季刊発行</span></div>
          <div><dt>FROM ISSUE 02</dt><dd>1,480円（税込）</dd><span>単品販売・自動更新なし</span></div>
          <div><dt>FIELD</dt><dd>OFF / ADV</dd><span>旅・車両・用品・ものづくり</span></div>
        </dl>
      </section>

      <section className="magazine-records" aria-labelledby="magazine-records-title">
        <header className="magazine-records__header reveal">
          <div className="magazine-section-label magazine-section-label--light"><span>02</span><span>WHAT WE RECORD</span></div>
          <h2 id="magazine-records-title">誌面をつくるのは、<br />現場で得た手応え。</h2>
        </header>
        <div className="magazine-records__grid">
          {sections.map((section, index) => (
            <article className="magazine-record-card reveal" key={section.number} style={{ '--delay': `${index * 80}ms` }}>
              <a className="magazine-record-card__image" href={section.href} aria-label={section.link}>
                <img src={assetPath(section.image)} alt={section.alt} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
                <span>{section.number}</span>
              </a>
              <div className="magazine-record-card__copy">
                <p>{section.label}</p>
                <h3>{section.title}</h3>
                <p>{section.copy}</p>
                <a href={section.href}>{section.link} <Arrow /></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="magazine-difference" aria-labelledby="magazine-difference-title">
        <figure className="magazine-difference__visual reveal">
          <img src={assetPath('cover-issue-01-r1200gs.webp')} alt="DUST LINE創刊号の表紙" loading="lazy" decoding="async" />
          <figcaption>ISSUE 01 / BEYOND THE PAVEMENT</figcaption>
        </figure>
        <div className="magazine-difference__copy reveal">
          <div className="magazine-section-label"><span>03</span><span>WHY DUST LINE</span></div>
          <p className="magazine-kicker">MEDIA + WORKSHOP + FIELD</p>
          <h2 id="magazine-difference-title">取材する。つくる。<br />そして、走る。</h2>
          <p>
            DUST LINEのベースには、バイクパーツ開発のGuard Factoryと、塗装を担うMoto Coatingがあります。
            編集部自身がカスタムバイクを製作し、溶接・塗装・実走まで展開できることが強みです。
          </p>
          <ul>
            <li><span>01</span>実車で試し、数値と手応えを確かめる</li>
            <li><span>02</span>完成形だけでなく、選択と工程を記録する</li>
            <li><span>03</span>オフロードからアドベンチャー、旅、用品まで横断する</li>
          </ul>
          <a className="magazine-button magazine-button--dark" href={signupPath} onClick={() => trackAnalyticsEvent('signup_cta_click')}>無料会員登録で創刊号を読む <Arrow /></a>
        </div>
      </section>
    </main>
  )
}
