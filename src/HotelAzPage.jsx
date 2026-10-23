import { useEffect } from 'react'
import { hotelAz as hotel, hotelAzPhotos, hotelAzPhotoPath } from './shop-profiles'
import './shop-pages.css'
import './hotel-az.css'

export function HotelAzPhoto({ assetPath, name, alt, eager = false, sizes = '(max-width: 760px) 100vw, 55vw' }) {
  const photo = hotelAzPhotos[name]
  return (
    <img
      src={assetPath(hotelAzPhotoPath(name))}
      srcSet={photo.widths.map((width) => `${assetPath(hotelAzPhotoPath(name, width))} ${width}w`).join(', ')}
      sizes={sizes}
      width={photo.width}
      height={photo.height}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  )
}

function HotelLink({ href, children, primary = false }) {
  return <a className={`shop-link${primary ? ' shop-link--primary' : ''}`} href={href} target="_blank" rel="noreferrer">{children}<span aria-hidden="true">↗</span></a>
}

export default function HotelAzPage({ assetPath, basePath = '/' }) {
  useEffect(() => { document.title = 'HOTEL AZ｜旅の拠点になるホテルを紹介｜DUST LINE' }, [])

  return (
    <main id="main" className="shop-pages hotel-profile">
      <nav className="shop-breadcrumb shop-container" aria-label="パンくずリスト">
        <a href={basePath}>ホーム</a><span aria-hidden="true">/</span><a href={`${basePath}shops/`}>ショップ紹介</a><span aria-hidden="true">/</span><a href={`${basePath}shops/#stays`}>宿泊先紹介</a><span aria-hidden="true">/</span><span aria-current="page">HOTEL AZ</span>
      </nav>
      <article>
        <header className="hotel-intro shop-container">
          <div className="hotel-intro__copy">
            <p className="shop-eyebrow">STAY GUIDE 01 / HOTEL AZ</p>
            <h1>旅の拠点に、<br /><span lang="en">HOTEL AZ。</span></h1>
            <p className="hotel-intro__deck">客室、食事、使いやすさから知るホテルチェーン。</p>
            <p>九州を中心に、中国・四国、東海・北陸、甲信越にも展開するHOTEL AZ。ツーリングやイベント遠征で泊まる一軒を、旅のルートに合わせて探せます。</p>
            <div className="hotel-actions"><HotelLink href={hotel.hotelList} primary>ホテル一覧・空室を探す</HotelLink><a className="shop-link" href="#hotel-price">料金・予約条件<span aria-hidden="true">↓</span></a></div>
          </div>
          <figure>
            <HotelAzPhoto assetPath={assetPath} name="wajiro" alt="HOTEL AZ福岡和白店の外観。HOTEL AZの看板を掲げたホテルの建物" eager />
            <figcaption>福岡和白店。写真提供：HOTEL AZ。写真内の看板料金は撮影時の表示です。</figcaption>
          </figure>
        </header>

        <div className="hotel-highlights shop-container" aria-label="ホテルの主なサービス">
          <p><strong>朝食バイキング無料</strong><span>一日の始まりを、館内で。</span></p>
          <p><strong>全室無料Wi-Fi</strong><span>明日のルートを、部屋で調べる。</span></p>
          <p><strong>館内レストラン</strong><span>夕食もホテルで。別料金。</span></p>
        </div>

        <section className="hotel-section shop-container" aria-labelledby="hotel-room-title">
          <div className="hotel-section__heading"><p className="shop-eyebrow">ROOMS & FACILITIES</p><h2 id="hotel-room-title">一人でも、仲間とでも。</h2><p>シングルやツインなど、人数や過ごし方に合わせて客室を選ぶ。部屋のタイプ・設備は利用する店舗の案内で確認できます。</p></div>
          <div className="hotel-photo-pair">
            <figure><HotelAzPhoto assetPath={assetPath} name="single" alt="ベッドとデスクを備えたHOTEL AZのシングルルームの一例" /><figcaption>シングルルームの一例。</figcaption></figure>
            <figure><HotelAzPhoto assetPath={assetPath} name="twin" alt="ベッドが2台並ぶHOTEL AZのツインルームの一例" /><figcaption>ツインルームの一例。</figcaption></figure>
          </div>
          <p className="hotel-facility-note">コインランドリーを備えた店舗もあり、連泊時の洗濯にも利用できます。三重名張店には設置されていません。客室や設備の詳細は、宿泊前に各店舗へご確認ください。</p>
        </section>

        <section className="hotel-meals" aria-labelledby="hotel-meal-title">
          <div className="shop-container hotel-meals__grid">
            <figure><HotelAzPhoto assetPath={assetPath} name="breakfast" alt="ご飯、味噌汁、卵料理や野菜などを盛り付けたHOTEL AZの朝食の一例" /><figcaption>朝食バイキングの一例。メニューは店舗により異なります。</figcaption></figure>
            <div className="hotel-meals__copy"><p className="shop-eyebrow">BREAKFAST & RESTAURANT</p><h2 id="hotel-meal-title">朝は食べて、出発する。</h2><p>宿泊者の朝食は無料。和食・洋食をそろえたバイキング形式で、出発前に館内で食事ができます。</p><p>館内レストランでは夕食も利用できます。夕食は別料金で、レストランの種類や営業時間、朝食の提供時間は店舗ごとに確認が必要です。</p><figure className="hotel-restaurant"><HotelAzPhoto assetPath={assetPath} name="restaurant" alt="明るい窓とテーブル席が並ぶAZcafeの店内" sizes="(max-width: 760px) 100vw, 35vw" /><figcaption>館内レストラン・AZcafeの一例。</figcaption></figure></div>
          </div>
        </section>

        <section id="hotel-price" className="hotel-price shop-container" aria-labelledby="hotel-price-title">
          <div className="hotel-price__amount"><p className="shop-eyebrow">PRICE & CONDITIONS</p><h2 id="hotel-price-title">365日同一価格<span>※一部店舗を除く</span></h2><p className="hotel-price__number">6,050<span>円（税込）</span></p><p>シングル・1室1名・1泊朝食付き<br />公式サイト予約時の料金例</p></div>
          <div className="hotel-price__conditions"><h3>条件を確かめて、予約する。</h3><p>公式のサービス案内では、シングル通常6,380円（税込）に対し、公式サイト予約時は6,050円（税込）と案内されています。</p><ul><li>365日同一価格は、一部店舗を除きます。</li><li>対象店舗・客室・プランにより条件が異なります。三重名張店は公式サイト最安値保証の対象外です。</li><li>夕食は別料金。宿泊税など、別途必要な費用の有無は予約画面でご確認ください。</li><li>写真内の看板料金と、予約時の適用料金が異なる場合があります。</li></ul><HotelLink href={hotel.services}>公式サイトで料金・サービスを確認</HotelLink></div>
        </section>

        <section className="hotel-section hotel-locations shop-container" aria-labelledby="hotel-location-title">
          <div className="hotel-section__heading"><p className="shop-eyebrow">LOCATIONS & PARKING</p><h2 id="hotel-location-title">ルートから、泊まる場所を。</h2><p>公式のホテル一覧からエリアを選び、アクセスや駐車場を確認。普通車用駐車場は一部店舗を除き無料です。バイクの駐車場所や屋根の有無、到着予定などは、予約前に宿泊する店舗へご相談ください。</p></div>
          <div className="hotel-photo-pair hotel-branches">
            <figure><HotelAzPhoto assetPath={assetPath} name="ainan" alt="広い駐車場と周辺の風景が見渡せるHOTEL AZ愛媛愛南店の全景" /><figcaption><strong>愛媛愛南店</strong>建物と駐車場の全景。<a href="https://www.az-hotel.com/ainan/" target="_blank" rel="noreferrer">店舗の公式案内を見る ↗</a></figcaption></figure>
            <figure><HotelAzPhoto assetPath={assetPath} name="miki" alt="HOTEL AZ香川三木店のホテル外観と駐車場" /><figcaption><strong>香川三木店</strong>宿泊先は旅のルートに合わせて。<a href="https://www.az-hotel.com/miki/" target="_blank" rel="noreferrer">店舗の公式案内を見る ↗</a></figcaption></figure>
          </div>
        </section>

        <section className="hotel-booking shop-container" aria-labelledby="hotel-booking-title">
          <div><p className="shop-eyebrow">FIND YOUR NEXT STAY</p><h2 id="hotel-booking-title">次の一泊を、探す。</h2><p>エリア・宿泊日・人数を決めて、空室とプランを確認。ご予約はHOTEL AZ公式サイトへ。</p></div>
          <div className="hotel-actions"><HotelLink href={hotel.hotelList} primary>ホテル一覧・空室を探す</HotelLink><HotelLink href={hotel.website}>HOTEL AZ公式サイト</HotelLink></div>
        </section>

        <aside className="hotel-magazine shop-container" aria-label="DUST LINE第2号の関連情報"><p className="shop-eyebrow">DUST LINE / ISSUE 02</p><h2>本誌でも、HOTEL AZを紹介。</h2><p>DUST LINE第2号では、HOTEL AZを5ページにわたって紹介予定です。</p><a className="shop-link" href={`${basePath}magazine/issue-02/`}>第2号の案内へ<span aria-hidden="true">→</span></a></aside>

        <footer className="hotel-source shop-container"><p>写真提供：HOTEL AZ ／ 構成：DUST LINE編集部</p><p>情報確認日：{hotel.checkedDateLabel}。最新の料金・営業状況・設備は、公式サイトと利用店舗でご確認ください。</p><p className="hotel-source__links"><a href={hotel.services} target="_blank" rel="noreferrer">サービス案内</a><a href={hotel.discount} target="_blank" rel="noreferrer">公式予約の割引・適用条件</a><a href={hotel.hotelList} target="_blank" rel="noreferrer">ホテル一覧</a></p></footer>
        <div className="shop-back shop-container"><a className="shop-link" href={`${basePath}shops/#stays`}><span aria-hidden="true">←</span>宿泊先紹介へ戻る</a></div>
      </article>
    </main>
  )
}
