import { useEffect } from 'react'
import { trackAnalyticsEvent } from './lib/analytics'
import './issue-product.css'

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  )
}

const purchaseSteps = [
  {
    number: '01',
    title: '無料会員登録',
    copy: '購入と閲覧には、DUST LINE会員アカウントとメールアドレスの確認が必要です。',
  },
  {
    number: '02',
    title: '商品内容を確認して購入',
    copy: '販売開始後、本ページと購入内容の最終確認画面に、対象号・税込価格・提供条件を表示します。',
  },
  {
    number: '03',
    title: 'マイライブラリで閲覧',
    copy: '決済完了後、購入に使用した会員アカウントへ閲覧権限を付与します。',
  },
]

export default function Issue02ProductPage({
  assetPath,
  signupPath = '/account/signup/',
  magazinePath = '/offroad-bike-magazine/',
  commercialDisclosurePath = '/commercial-disclosure/',
  refundPolicyPath = '/refund-policy/',
  digitalDeliveryPath = '/digital-delivery/',
  supportEmail = 'dustlineadv@gmail.com',
}) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'DUST LINE ISSUE 02｜商品情報・販売準備中'
    window.scrollTo(0, 0)
    return () => { document.title = previousTitle }
  }, [])

  return (
    <main className="issue-product" id="main">
      <section className="issue-product__hero" aria-labelledby="issue-02-title">
        <figure className="issue-product__cover reveal">
          <img
            src={assetPath('hero-rider.jpg')}
            alt="ダートを走るDUST LINE編集部のアドベンチャーバイク"
            fetchPriority="high"
          />
          <div className="issue-product__cover-shade" aria-hidden="true" />
          <div className="issue-product__cover-copy" aria-hidden="true">
            <span>DUST LINE</span>
            <small>ADVENTURE MOTORCYCLE JOURNAL</small>
            <strong>02</strong>
            <p>BEYOND<br />THE NEXT LINE.</p>
          </div>
          <figcaption>仮表紙・実際の第2号とは異なります</figcaption>
        </figure>

        <div className="issue-product__summary reveal">
          <div className="issue-product__status"><span aria-hidden="true" />販売準備中</div>
          <p className="issue-product__eyebrow">ISSUE 02 / DIGITAL QUARTERLY</p>
          <h1 id="issue-02-title">DUST LINE <span>ISSUE 02</span></h1>
          <p className="issue-product__lead">
            オフロード／アドベンチャーバイクの旅、実車、ものづくりを、現場から届ける季刊デジタル雑誌の第2号です。
            収録内容は現在編集中です。
          </p>

          <dl className="issue-product__facts">
            <div><dt>販売価格</dt><dd><strong>1,480円</strong><span>税込・日本円</span></dd></div>
            <div><dt>販売方式</dt><dd>各号単品<span>自動更新なし</span></dd></div>
            <div><dt>公開日</dt><dd>調整中<span>確定後に本ページで案内</span></dd></div>
            <div><dt>提供形式</dt><dd>デジタル雑誌<span>Webブラウザで閲覧</span></dd></div>
          </dl>

          <div className="issue-product__actions">
            <button type="button" disabled>現在は購入できません</button>
            <a href={signupPath} onClick={() => trackAnalyticsEvent('signup_cta_click')}>無料会員登録 <Arrow /></a>
          </div>
          <p className="issue-product__purchase-note">
            現在は注文・決済を受け付けていません。販売開始前に、表紙、収録内容、公開日、購入ボタンを本ページへ表示します。
          </p>
        </div>
      </section>

      <section className="issue-product__editorial" aria-labelledby="issue-02-editorial-title">
        <div className="issue-product__section-label reveal"><span>01</span><span>EDITORIAL STATUS</span></div>
        <div className="issue-product__editorial-grid">
          <div className="reveal">
            <p className="issue-product__kicker">IN PRODUCTION / CONTENT TO BE CONFIRMED</p>
            <h2 id="issue-02-editorial-title">内容を固めてから、<br />販売を始めます。</h2>
          </div>
          <div className="issue-product__editorial-copy reveal">
            <p>
              第2号は現在編集中です。特集名、収録記事、ページ数、表紙、公開日は、内容の確定後に本ページへ掲載します。
              未確定の内容を商品情報として表示したまま販売することはありません。
            </p>
            <p>
              表紙に使用している写真は、DUST LINE編集部が保有する実写素材による構成見本です。
              写真の車両や企画が第2号へ収録されることを示すものではありません。
            </p>
          </div>
        </div>
      </section>

      <section className="issue-product__delivery" aria-labelledby="issue-02-delivery-title">
        <header className="issue-product__delivery-header reveal">
          <div className="issue-product__section-label issue-product__section-label--light"><span>02</span><span>BUY & READ</span></div>
          <h2 id="issue-02-delivery-title">販売開始後の、<br />購入と閲覧。</h2>
        </header>
        <ol className="issue-product__steps">
          {purchaseSteps.map((step) => (
            <li className="reveal" key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="issue-product__terms" aria-labelledby="issue-02-terms-title">
        <div className="issue-product__section-label reveal"><span>03</span><span>PRODUCT TERMS</span></div>
        <div className="issue-product__terms-grid">
          <header className="reveal">
            <p className="issue-product__kicker">ONE ISSUE / NO AUTO-RENEWAL</p>
            <h2 id="issue-02-terms-title">購入前に確認できる、<br />提供条件。</h2>
          </header>
          <dl className="issue-product__term-list reveal">
            <div><dt>商品</dt><dd>DUST LINE ISSUE 02／季刊デジタル雑誌</dd></div>
            <div><dt>価格</dt><dd>1,480円（税込・日本円）</dd></div>
            <div><dt>課金</dt><dd>1号ごとの単品購入。自動更新や定期課金はありません。</dd></div>
            <div><dt>提供</dt><dd>販売中の号は、決済完了後に会員アカウントへ閲覧権限を付与します。</dd></div>
            <div><dt>閲覧期間</dt><dd>購入した号は、原則として閲覧期限を設けず、無期限で閲覧できます。</dd></div>
            <div><dt>閲覧環境</dt><dd>インターネット接続と、更新が提供されている一般的なWebブラウザが必要です。</dd></div>
            <div><dt>保存</dt><dd>ダウンロードやオフライン閲覧は、販売開始時に提供する場合だけ本ページへ明記します。</dd></div>
          </dl>
        </div>
        <nav className="issue-product__policy-links reveal" aria-label="販売条件に関するページ">
          <a href={commercialDisclosurePath}>特定商取引法に基づく表記 <Arrow /></a>
          <a href={refundPolicyPath}>返金・キャンセルポリシー <Arrow /></a>
          <a href={digitalDeliveryPath}>デジタル商品の提供条件 <Arrow /></a>
        </nav>
      </section>

      <section className="issue-product__closing" aria-labelledby="issue-02-closing-title">
        <div className="reveal">
          <p>ISSUE 01 / FREE TO READ</p>
          <h2 id="issue-02-closing-title">第2号を待つあいだに、<br />創刊号を。</h2>
        </div>
        <div className="issue-product__closing-actions reveal">
          <a className="issue-product__primary-link" href={signupPath} onClick={() => trackAnalyticsEvent('signup_cta_click')}>無料会員登録 <Arrow /></a>
          <a href={magazinePath}>DUST LINEについて <Arrow /></a>
          <a href={`mailto:${supportEmail}`}>商品について問い合わせる <Arrow /></a>
        </div>
      </section>
    </main>
  )
}
