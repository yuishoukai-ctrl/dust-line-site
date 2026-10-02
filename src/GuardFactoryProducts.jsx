import { useEffect, useState } from 'react'
import { guardFactoryProducts, guardFactoryProductPath, guardFactoryPhotoPath } from './guard-factory-products'
import './guard-factory.css'

export function GuardFactoryLogo({ assetPath }) {
  return <img className="gf-logo" src={assetPath('parts/guard-factory/guard-factory-logo.webp')} width="1000" height="487" alt="Guard Factory — GIVE FORM TO IDEAS" decoding="async" />
}

function ProductPhoto({ photo, assetPath, sizes, eager = false, ...props }) {
  const largeWidth = photo.width || 1280
  return <img
    src={assetPath(guardFactoryPhotoPath(photo.name, largeWidth))}
    srcSet={`${assetPath(guardFactoryPhotoPath(photo.name, 640))} 640w, ${assetPath(guardFactoryPhotoPath(photo.name, largeWidth))} ${largeWidth}w`}
    sizes={sizes} width={photo.width || 1280} height={photo.height || 960} alt={photo.alt}
    loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" {...props}
  />
}

function PendingPhoto() {
  return <div className="gf-photo-pending"><p>PRODUCT PHOTO</p><span>商品画像は準備中です。</span></div>
}

export function GuardFactoryLineup({ assetPath, basePath, collection = 'djebel250' }) {
  const isCad = collection === 'f450gs'
  const products = guardFactoryProducts.filter((product) => product.collection === collection)
  const sectionId = isCad ? 'lineup' : 'guard-factory'
  return (
    <section className={`gf-lineup${isCad ? ' gf-lineup--cad' : ''}`} id={sectionId} aria-labelledby={`${sectionId}-title`}>
      <header className="gf-lineup__head reveal">
        <div><p className="gf-eyebrow">GUARD FACTORY / {isCad ? 'BMW F 450 GS' : 'DJEBEL 250'}</p><h2 id={`${sectionId}-title`}>{isCad ? <>F 450 GSに、<br />4つのガード。</> : <>ジェベル250に、<br />{products.length}つのガード。</>}</h2></div>
        <div className="gf-lineup__brand"><GuardFactoryLogo assetPath={assetPath} /><p>{isCad ? <>販売準備中の4商品を、実CADの画像で紹介。<br />価格・販売仕様・実車適合は確定後にご案内します。</> : <>ガードファクトリーの製品情報と実画像。<br />仕様・適合条件を、商品ごとにご案内します。</>}</p></div>
      </header>
      {isCad && <figure className="gf-vehicle reveal">
        <img
          src={assetPath('parts/guard-factory/f450gs-vehicle-1280.webp')}
          srcSet={`${assetPath('parts/guard-factory/f450gs-vehicle-640.webp')} 640w, ${assetPath('parts/guard-factory/f450gs-vehicle-1280.webp')} 1280w`}
          sizes="(max-width: 760px) calc(100vw - 40px), 58vw"
          width="1280" height="853"
          alt="店内に展示された青・白・赤のBMW F 450 GSの車体全体を右前方から見た写真"
          loading="lazy" decoding="async"
        />
        <figcaption>
          <p className="gf-eyebrow">VEHICLE / BMW F 450 GS</p>
          <p className="gf-vehicle__title">BMW F 450 GS</p>
          <p>F 450 GSの展示車両。下の4製品はCAD開発画像で紹介しています。</p>
          <p>写真はGuard Factory製品の装着状態を示すものではありません。</p>
        </figcaption>
      </figure>}
      <div className="gf-lineup__products">
        {products.map((product, index) => (
          <article className="gf-card reveal" key={product.slug}>
            <a className="gf-card__photo" href={guardFactoryProductPath(product.slug, basePath)} aria-label={`${product.name}の詳細を見る`}>
              {product.photos.length ? <ProductPhoto photo={product.photos[0]} assetPath={assetPath} sizes="(max-width: 760px) calc(100vw - 40px), 44vw" /> : <PendingPhoto />}
              {isCad && <span className="gf-card__cad-label">CAD / 開発イメージ</span>}
              <span aria-hidden="true">0{index + 1} / VIEW PRODUCT →</span>
            </a>
            <div className="gf-card__body">
              <p className="gf-eyebrow">{product.category}</p>
              <h3><a href={guardFactoryProductPath(product.slug, basePath)}>{product.shortName}</a></h3>
              <p>{product.summary}</p>
              <div className="gf-card__foot"><p><strong>{product.priceLabel}</strong><span>{product.priceNote}</span></p><span className="gf-status">販売準備中</span></div>
              <a className="gf-text-link" href={guardFactoryProductPath(product.slug, basePath)}>{isCad ? 'CAD画像・開発情報を見る' : '仕様・商品情報を見る'} <span aria-hidden="true">→</span></a>
            </div>
          </article>
        ))}
      </div>
      <p className="gf-lineup__note">{isCad && <>画像は完成品の写真ではありません。形状・色・販売仕様は変更する場合があります。<br /></>}販売開始日・在庫・納期は確認中です。購入先は販売開始後にご案内します。</p>
    </section>
  )
}

function ProductGallery({ product, assetPath }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [imageFailed, setImageFailed] = useState(false)
  const activePhoto = product.photos[activeIndex]
  return (
    <div className={`gf-gallery${product.portraitPhoto ? ' gf-gallery--portrait' : ''}`}>
      {product.development && <p className="gf-gallery__cad-label">CAD / 開発イメージ <span>{product.imageRevision}</span></p>}
      {activePhoto ? <figure className="gf-gallery__main">
        <ProductPhoto photo={activePhoto} assetPath={assetPath} sizes="(max-width: 900px) calc(100vw - 40px), 53vw" eager onError={() => setImageFailed(true)} onLoad={() => setImageFailed(false)} />
        {imageFailed && <p role="status">画像を読み込めませんでした。{product.photos.length > 1 ? '別の画像を選ぶか、ページを再読み込みしてください。' : 'ページを再読み込みしてください。'}</p>}
        <figcaption id="gf-photo-caption" aria-live="polite">{activePhoto.caption}</figcaption>
      </figure> : <PendingPhoto />}
      {product.photos.length > 1 && <div className="gf-gallery__thumbs" role="group" aria-label={product.development ? 'CAD画像を選択' : '商品写真を選択'}>
        {product.photos.map((photo, index) => (
          <button type="button" key={photo.name} aria-pressed={activeIndex === index} aria-label={`${index + 1}枚目：${photo.caption}`} onClick={() => { setActiveIndex(index); setImageFailed(false) }}>
            <img src={assetPath(guardFactoryPhotoPath(photo.name, 640))} width="640" height={Math.round((photo.height || 960) * 640 / (photo.width || 1280))} alt="" decoding="async" />
          </button>
        ))}
      </div>}
      <p className="gf-gallery__note">{product.galleryNote}</p>
    </div>
  )
}

export default function GuardFactoryProductPage({ slug, assetPath, basePath, contactUrl }) {
  const product = guardFactoryProducts.find((item) => item.slug === slug)
  useEffect(() => {
    const previousTitle = document.title
    document.title = `${product.name}｜Guard Factory｜DUST LINE Parts`
    window.scrollTo(0, 0)
    return () => { document.title = previousTitle }
  }, [product])
  const relatedProducts = guardFactoryProducts.filter((item) => item.slug !== slug && item.collection === product.collection)
  return (
    <main className="gf-product-page" id="main">
      <div className="gf-product-shell">
        <nav className="gf-breadcrumb" aria-label="パンくずリスト"><ol><li><a href={basePath}>DUST LINE</a></li><li><a href={`${basePath}parts/`}>Parts</a></li><li aria-current="page">{product.shortName}</li></ol></nav>
        <section className="gf-product-hero" aria-labelledby="gf-product-title">
          <ProductGallery key={product.slug} product={product} assetPath={assetPath} />
          <div className="gf-product-copy">
            <GuardFactoryLogo assetPath={assetPath} />
            <p className="gf-eyebrow">{product.category}</p>
            <h1 id="gf-product-title"><span className="gf-product-model">{product.modelLabel} </span>{product.headingParts.map((term) => <span className="gf-product-term" key={term}>{term}</span>)}</h1>
            <p className="gf-product-copy__summary">{product.summary}</p>
            <p className="gf-price"><strong>{product.priceLabel}</strong><span>{product.priceNote}</span></p>
            <div className="gf-release"><span className="gf-status">販売準備中</span><p>販売開始日・在庫・納期は確認中です。<br />購入先は販売開始後にご案内します。</p></div>
            <a className="gf-button" href={contactUrl} target="_blank" rel="noreferrer">適合・販売について問い合わせる <span aria-hidden="true">↗</span><span className="gf-sr-only">（別タブで開きます）</span></a>
            <a className="gf-text-link" href="#gf-specifications">{product.development ? '開発情報と確認事項を見る' : '仕様と取付条件を確認する'} <span aria-hidden="true">↓</span></a>
          </div>
        </section>
      </div>
      <section className="gf-specifications" id="gf-specifications" aria-labelledby="gf-spec-title">
        <div className="gf-specifications__intro"><p className="gf-eyebrow">{product.development ? 'DEVELOPMENT DETAILS' : 'PRODUCT DETAILS'}</p><h2 id="gf-spec-title">{product.development ? '開発情報と、確認事項。' : '仕様と、取付前の確認。'}</h2><p>{product.description}</p><h3>取付について</h3><p>{product.installation}</p><p>{product.verificationNote}</p></div>
        <dl className="gf-spec-table">
          <div><dt>{product.development ? '開発対象' : '対象車種'}</dt><dd>{product.fitment}<small>{product.fitmentNote}</small></dd></div>
          <div><dt>材質・板厚</dt><dd>{product.material}</dd></div>
          <div><dt>仕上げ</dt><dd>{product.finish}</dd></div>
          <div><dt>商品構成</dt><dd>{product.configuration}</dd></div>
          <div><dt>同梱品</dt><dd>{product.included}</dd></div>
          <div><dt>重量・寸法</dt><dd>確認中</dd></div>
          <div><dt>在庫・納期</dt><dd>確認中</dd></div>
          <div><dt>保証・返品条件</dt><dd>確認中。販売開始前にご案内します。</dd></div>
        </dl>
      </section>
      <aside className="gf-related" aria-labelledby="gf-related-title"><div><p className="gf-eyebrow">ALSO FROM GUARD FACTORY</p><h2 id="gf-related-title">{product.development ? 'F 450 GSのガード。' : 'ジェベル250のガード。'}</h2><ul>{relatedProducts.map((related) => <li key={related.slug}><a className="gf-text-link" href={guardFactoryProductPath(related.slug, basePath)}>{related.name} <span aria-hidden="true">→</span></a></li>)}</ul></div><a className="gf-text-link" href={`${basePath}parts/#${product.development ? 'lineup' : 'guard-factory'}`}>Partsの製品一覧へ戻る <span aria-hidden="true">→</span></a></aside>
    </main>
  )
}
