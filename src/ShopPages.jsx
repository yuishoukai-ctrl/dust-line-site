import { useEffect } from 'react'
import { motorradShizuoka as shop, shopPhotoPath, hotelAz as hotel } from './shop-profiles'
import { HotelAzPhoto } from './HotelAzPage'
import './shop-pages.css'

function ShopPhoto({ assetPath, name, alt, eager = false, sizes = '(max-width: 760px) 100vw, 90vw' }) {
  return (
    <img
      src={assetPath(shopPhotoPath(name))}
      srcSet={[640, 1280, 1920].map((width) => `${assetPath(shopPhotoPath(name, width))} ${width}w`).join(', ')}
      sizes={sizes}
      width="1920"
      height="1280"
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  )
}

function OutboundLink({ href, children, primary = false }) {
  return <a className={`shop-link${primary ? ' shop-link--primary' : ''}`} href={href} target="_blank" rel="noreferrer">{children}<span aria-hidden="true">↗</span></a>
}

export function ShopIndexPage({ assetPath, basePath = '/' }) {
  useEffect(() => { document.title = 'ショップ紹介｜DUST LINE' }, [])

  return (
    <main id="main" className="shop-pages shop-directory">
      <header className="shop-directory__heading shop-container">
        <p className="shop-eyebrow">DUST LINE / SHOP VISIT</p>
        <h1>ショップ紹介</h1>
        <p className="shop-directory__lead">バイクを選ぶ。旅を相談する。<br />旅を支える、お店と宿へ。</p>
        <p className="shop-directory__intro">バイクショップから、ツーリングや遠征の宿泊先まで。DUST LINEが写真と言葉で紹介します。</p>
        <nav className="shop-directory__categories" aria-label="紹介カテゴリ"><a href="#bike-shops">バイクショップ<span aria-hidden="true">↓</span></a><a href="#stays">宿泊先紹介<span aria-hidden="true">↓</span></a></nav>
      </header>

      <section id="bike-shops" className="shop-container shop-directory__list" aria-labelledby="bike-shops-title">
        <h2 id="bike-shops-title" className="shop-directory__section-title">バイクショップ</h2>
        <article className="shop-feature">
          <a className="shop-feature__image" href={`${basePath}shops/${shop.slug}/`} aria-label="モトラッド静岡の紹介を読む">
            <ShopPhoto assetPath={assetPath} name="exterior" alt="BMW Motorradのサインを掲げたモトラッド静岡の外観" eager sizes="(max-width: 760px) 100vw, 60vw" />
            <span className="shop-feature__number" aria-hidden="true">SHOP VISIT 01</span>
          </a>
          <div className="shop-feature__copy">
            <p className="shop-eyebrow">{shop.region}</p>
            <p className="shop-feature__category">{shop.category}</p>
            <h3><a href={`${basePath}shops/${shop.slug}/`}>{shop.name}</a></h3>
            <p className="shop-feature__headline">{shop.headline}</p>
            <p>新しい一台の相談も、次のツーリングの話も。静岡市駿河区のショールームから、「バイクのある人生」を楽しむきっかけを。</p>
            <ul className="shop-tags" aria-label="取扱い・サービス"><li>新車・中古車</li><li>整備</li><li>試乗相談</li></ul>
            <a className="shop-link shop-feature__read" href={`${basePath}shops/${shop.slug}/`}>紹介を読む<span aria-hidden="true">→</span></a>
          </div>
        </article>
      </section>

      <section id="stays" className="shop-container shop-directory__list shop-directory__stays" aria-labelledby="stays-title">
        <h2 id="stays-title" className="shop-directory__section-title">宿泊先紹介</h2>
        <article className="shop-feature shop-feature--stay">
          <a className="shop-feature__image" href={`${basePath}shops/${hotel.slug}/`} aria-label="HOTEL AZの宿泊先紹介を読む">
            <HotelAzPhoto assetPath={assetPath} name="wajiro" alt="HOTEL AZ福岡和白店の外観" sizes="(max-width: 760px) 100vw, 60vw" />
            <span className="shop-feature__number" aria-hidden="true">STAY GUIDE 01</span>
          </a>
          <div className="shop-feature__copy">
            <p className="shop-eyebrow">九州を中心に各地へ</p><p className="shop-feature__category">ホテルチェーン / 宿泊先紹介</p>
            <h3><a href={`${basePath}shops/${hotel.slug}/`}>HOTEL AZ</a></h3>
            <p className="shop-feature__headline">{hotel.headline}</p>
            <p>客室、朝食、料金・予約方法を提供写真とともに紹介。ツーリングやイベント遠征の一泊を、旅のルートから探す。</p>
            <ul className="shop-tags" aria-label="紹介するサービス"><li>朝食バイキング無料</li><li>全室無料Wi-Fi</li><li>館内レストラン</li></ul>
            <a className="shop-link shop-feature__read" href={`${basePath}shops/${hotel.slug}/`}>紹介を読む<span aria-hidden="true">→</span></a>
          </div>
        </article>
      </section>
    </main>
  )
}

export default function MotorradShizuokaPage({ assetPath, basePath = '/' }) {
  useEffect(() => { document.title = 'モトラッド静岡｜BMWの話も、次の林道の話も。｜DUST LINE' }, [])

  return (
    <main id="main" className="shop-pages shop-profile">
      <nav className="shop-breadcrumb shop-container" aria-label="パンくずリスト">
        <a href={basePath}>ホーム</a><span aria-hidden="true">/</span><a href={`${basePath}shops/`}>ショップ紹介</a><span aria-hidden="true">/</span><span aria-current="page">{shop.name}</span>
      </nav>

      <article>
        <header className="shop-hero">
          <ShopPhoto assetPath={assetPath} name="exterior" alt="静岡市駿河区にあるモトラッド静岡のショールーム外観" eager />
          <div className="shop-hero__copy shop-container">
            <p className="shop-eyebrow">SHOP VISIT 01 / SHIZUOKA</p>
            <p className="shop-hero__dealer">{shop.category}</p>
            <h1>{shop.name}</h1>
            <p className="shop-hero__english" lang="en">{shop.englishName}</p>
            <p className="shop-hero__headline">BMWの話も、<br className="shop-mobile-break" />次の林道の話も。</p>
          </div>
        </header>

        <div className="shop-quick-info shop-container">
          <p><span>静岡市駿河区</span><span>10:00〜18:00 ／ 火・水定休</span></p>
          <a className="shop-link" href="#shop-information">店舗情報・アクセス<span aria-hidden="true">↓</span></a>
        </div>

        <section className="shop-intro shop-container">
          <div>
            <p className="shop-eyebrow">MAKE LIFE A RIDE</p>
            <h2>「ちょっと気になる」<br />から、始まる。</h2>
          </div>
          <div className="shop-body-copy">
            <p>静岡市駿河区にある、BMW Motorrad正規ディーラー・モトラッド静岡。車両を選ぶ時間から、次のツーリングを考える時間まで。「バイクのある人生」を一緒につくっていきたいというお店です。</p>
            <p>BMWに興味はあるけれど、ディーラーには少し入りにくい。そんな人にも気軽に足を運んでほしいと、コーヒースタンドのように立ち寄れる雰囲気づくりを意識しています。</p>
            <p className="shop-credit">原稿・写真提供：モトラッド静岡<br />構成：DUST LINE編集部</p>
          </div>
        </section>

        <figure className="shop-wide-photo shop-container">
          <ShopPhoto assetPath={assetPath} name="showroom" alt="BMWのモーターサイクルと純正ウェアが並ぶモトラッド静岡のショールーム" />
          <figcaption>車両と純正ウェアが並ぶショールーム。バイク選びと、旅に使う装備選びを同じ場所で。</figcaption>
        </figure>

        <section className="shop-people shop-container">
          <figure>
            <ShopPhoto assetPath={assetPath} name="people" alt="WELCOMEのサインがあるカウンターで迎えるモトラッド静岡の人たち" sizes="(max-width: 760px) 100vw, 48vw" />
            <figcaption>「今日はちょっと寄っただけ！」という来店も。バイクの話をしながら過ごす時間を大切に。</figcaption>
          </figure>
          <div className="shop-people__copy">
            <p className="shop-eyebrow">PEOPLE & PLACE</p>
            <h2>コーヒーを飲みながら、<br />バイクの話を。</h2>
            <p>ツーリングのおすすめスポットや、次に走るルートの話。車両のことに限らず、ライダー同士の会話も生まれる場所を目指すモトラッド静岡。</p>
            <blockquote>「私たちは、『バイクのある人生』を皆さまと一緒につくっていけるお店でありたいと思っています。」</blockquote>
            <p>BMWが初めての人も歓迎。「ちょっと気になる」くらいの気持ちで訪ねてみてはいかがでしょう。</p>
          </div>
        </section>

        <section className="shop-gs">
          <div className="shop-container">
            <div className="shop-gs__heading">
              <p className="shop-eyebrow">THE NEXT RIDE</p>
              <h2>GSは、走ってこそ。</h2>
              <p>林道を走ってみたい。もっと遠くまで旅してみたい。<br />その一歩を、試乗の相談から。</p>
            </div>
            <figure className="shop-gs__main-photo">
              <ShopPhoto assetPath={assetPath} name="gs-front" alt="モトラッド静岡の店内に展示されたBMW F 450 GSの前方からの姿" />
              <figcaption>提供写真より、店内に展示されたF 450 GS。展示車・試乗車の最新状況は店舗へご確認ください。</figcaption>
            </figure>
            <div className="shop-gs__story">
              <div className="shop-body-copy">
                <h3>数字だけでは分からない、<br />一台との相性を。</h3>
                <p>オンロードから林道、ロングツーリングまで。GSに興味がある人には、ぜひ一度その楽しさを体感してほしい、とお店は話します。</p>
                <p>提供原稿では、試乗車での一日ツーリングや、オフロードを含むコースの相談にも対応すると紹介されています。乗ってみたい車両や走り方を、まずは店舗へ相談してみてください。</p>
                <p className="shop-note">試乗車・日程・コース・利用条件は、事前に店舗へご確認ください。</p>
                <OutboundLink href={shop.website}>公式サイトで試乗を相談する</OutboundLink>
              </div>
              <figure>
                <ShopPhoto assetPath={assetPath} name="gs-rear" alt="店内に展示されたBMW F 450 GSの後ろ姿" sizes="(max-width: 760px) 100vw, 48vw" />
                <figcaption>後ろ姿からも、一台のサイズ感や装備を確かめたい。</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="shop-services shop-container">
          <div className="shop-services__heading">
            <p className="shop-eyebrow">SHOWROOM & SERVICE</p>
            <h2>選ぶときも、<br />乗り続けるときも。</h2>
          </div>
          <figure>
            <ShopPhoto assetPath={assetPath} name="inside" alt="BMWの車両やウェア、アクセサリーが展示された店内" />
            <figcaption>車両の購入から、ウェアやアクセサリー選びまで。</figcaption>
          </figure>
          <dl className="shop-services__list">
            <div><dt>新車・中古車</dt><dd>BMW Motorradの車両選びを相談。</dd></div>
            <div><dt>整備・サービス</dt><dd>乗り続けるための点検・整備について相談。</dd></div>
            <div><dt>ウェア・アクセサリー</dt><dd>純正ウェアやアクセサリーを、ショールームで。</dd></div>
          </dl>
        </section>

        <section id="shop-information" className="shop-information">
          <div className="shop-container">
            <div className="shop-information__heading"><p className="shop-eyebrow">INFORMATION & ACCESS</p><h2>お店へ行く。</h2></div>
            <div className="shop-information__grid">
              <figure><ShopPhoto assetPath={assetPath} name="sign" alt="来店の目印となるMotorrad Shizuokaのサインと店舗" sizes="(max-width: 760px) 100vw, 40vw" /><figcaption>目印は、Motorrad Shizuokaのサイン。</figcaption></figure>
              <div>
                <h3>{shop.name}<small lang="en">{shop.englishName}</small></h3>
                <dl className="shop-information__details">
                  <div><dt>所在地</dt><dd><address>〒{shop.postcode}<br />{shop.address}</address></dd></div>
                  <div><dt>営業時間</dt><dd>{shop.hours}<small>サービス受付 {shop.serviceReception}</small></dd></div>
                  <div><dt>定休日</dt><dd>{shop.closed}</dd></div>
                  <div><dt>電話</dt><dd><a href={shop.telephoneHref}>{shop.telephone}</a></dd></div>
                </dl>
                <div className="shop-information__actions"><OutboundLink href={shop.map} primary>地図・ルートを見る</OutboundLink><OutboundLink href={shop.website}>公式サイト</OutboundLink></div>
                <div className="shop-information__social"><OutboundLink href={shop.instagram}>Instagram</OutboundLink><OutboundLink href={shop.blog}>公式ブログ</OutboundLink></div>
                <p className="shop-note">臨時休業や最新の営業案内は、公式サイト・SNSでご確認ください。<br />店舗情報確認日：{shop.checkedDateLabel}</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="shop-issue shop-container" aria-label="関連するDUST LINE本誌">
          <img src={assetPath('cover-issue-01-r1200gs.webp')} alt="DUST LINE創刊号の表紙" width="210" height="297" loading="lazy" />
          <div><p className="shop-eyebrow">DUST LINE ISSUE 01</p><h2>本誌でも、モトラッド静岡を紹介。</h2><p>旅・カスタム・ものづくり、そして人とお店。創刊号を無料会員登録でお読みいただけます。</p><a className="shop-link" href={`${basePath}issues/issue-01/`}>創刊号を読む<span aria-hidden="true">→</span></a></div>
        </aside>
        <div className="shop-back shop-container"><a className="shop-link" href={`${basePath}shops/`}><span aria-hidden="true">←</span>ショップ紹介へ戻る</a></div>
      </article>
    </main>
  )
}
