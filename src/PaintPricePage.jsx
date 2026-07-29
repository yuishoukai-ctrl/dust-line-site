import { useEffect, useState } from 'react'
import './paint-price-page.css'

const CATEGORY_META = {
  'powder-coating': {
    index: '01',
    label: 'パウダーコート',
    english: 'POWDER COATING',
    use: 'フレーム / ガード / スタンド / ホイール',
    description: '厚膜で耐食性と耐衝撃性を確保。日常の傷や飛び石に晒される車体部品へ。',
  },
  gunkote: {
    index: '02',
    label: 'ガンコート',
    english: 'GUN-KOTE',
    use: 'ラジエーター / オイルクーラー',
    description: '薄膜でフィン形状を保ちやすい仕上げ。放熱部品の状態を確認して施工します。',
  },
  cerakote: {
    index: '03',
    label: 'セラコート',
    english: 'CERAKOTE',
    use: '排気系 / エンジン部品 / ラジエーター',
    description: '耐熱・耐薬品性を求める部品へ。用途と温度域に応じて塗料シリーズを選定します。',
  },
  other: {
    index: '04',
    label: 'その他・複数点',
    english: 'PHOTO ESTIMATE',
    use: '一覧にない部品 / 複数点',
    description: '写真で材質・寸法・状態を確認し、施工方法から提案します。',
  },
}

const CATEGORY_ORDER = ['powder-coating', 'gunkote', 'cerakote', 'other']

const paintAsset = (filename) => `${import.meta.env.BASE_URL}images/paint-service/${filename}`

const RECENT_FINISHES = [
  {
    className: 'paint-price__work-item--wheels',
    image: paintAsset('paint-finish-wheels-black.webp'),
    width: 1477,
    height: 1108,
    label: 'POWDER COAT / GLOSS BLACK',
    title: 'ホイール',
    alt: '艶あり黒で塗装された前後のモーターサイクルホイール',
  },
  {
    className: 'paint-price__work-item--parts',
    image: paintAsset('paint-finish-parts-black.webp'),
    width: 1108,
    height: 1477,
    label: 'POWDER COAT / PARTS',
    title: 'ステップ・ブラケット類',
    alt: '艶あり黒で塗装されたステップ、ブラケット、キャリア部品',
  },
  {
    className: 'paint-price__work-item--silver',
    image: paintAsset('paint-finish-caliper-silver.webp'),
    width: 1108,
    height: 1477,
    label: 'CALIPER / SILVER',
    title: 'ブレーキキャリパー',
    alt: 'シルバーで塗装されたモーターサイクル用ブレーキキャリパー',
  },
  {
    className: 'paint-price__work-item--red',
    image: paintAsset('paint-finish-caliper-red.webp'),
    width: 1108,
    height: 1477,
    label: 'CALIPER / RED',
    title: 'ブレーキキャリパー',
    alt: '赤で塗装されたモーターサイクル用ブレーキキャリパー',
  },
]

function LoadingPriceList() {
  return (
    <div className="paint-price__loading" role="status" aria-live="polite">
      <span />
      <span />
      <span />
      <p>価格表を読み込んでいます。</p>
    </div>
  )
}

function PriceGroup({ category, items }) {
  const meta = CATEGORY_META[category]
  if (!meta || items.length === 0) return null

  return (
    <section className="paint-price__group" aria-labelledby={`paint-${category}`}>
      <header className="paint-price__group-head">
        <div className="paint-price__group-index">{meta.index}</div>
        <div>
          <p>{meta.english}</p>
          <h2 id={`paint-${category}`}>{meta.label}</h2>
        </div>
        <div className="paint-price__group-use">
          <span>主な対象</span>
          <strong>{meta.use}</strong>
        </div>
      </header>
      <p className="paint-price__group-description">{meta.description}</p>
      <div className="paint-price__rows">
        {items.map((item) => (
          <article className="paint-price__row" key={item.id}>
            <div>
              <h3>{item.item_name_ja}</h3>
              <p>{item.note_ja}</p>
            </div>
            <strong>{item.price_text_ja}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function PaintPricePage({ formUrl }) {
  const [document, setDocument] = useState(null)
  const [error, setError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    setError(false)

    fetch(`${import.meta.env.BASE_URL}content/paint-prices.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((data) => {
        if (!Array.isArray(data.items)) throw new Error('Invalid price document')
        if (active) setDocument(data)
      })
      .catch(() => {
        if (active) setError(true)
      })

    return () => {
      active = false
    }
  }, [reloadKey])

  const publishedItems = (document?.items || [])
    .filter((item) => item.published)
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
  const updatedLabel = document?.updated_at
    ? new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(document.updated_at))
    : null

  return (
    <main id="main" className="paint-price">
      <section className="paint-price__hero">
        <div className="paint-price__hero-grid" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="paint-price__hero-copy">
          <p className="paint-price__eyebrow">DUST LINE GARAGE / PAINT REQUEST</p>
          <h1>走る部品を、<br />もう一度仕上げる。</h1>
          <p className="paint-price__lead">
            パウダーコート、ガンコート、セラコート。
            部品の用途と状態から、必要な仕上げを選びます。
          </p>
          <a className="paint-price__hero-cta" href={formUrl} target="_blank" rel="noreferrer">
            写真で見積を依頼する <span aria-hidden="true">→</span>
          </a>
        </div>
        <figure className="paint-price__hero-visual">
          <img
            src={paintAsset('paint-finish-composite-transparent-v3.png')}
            width="1856"
            height="1088"
            alt="塗装を終えた黒いホイールと部品、シルバーと赤のブレーキキャリパー"
            fetchPriority="high"
          />
          <figcaption>
            <span>RECENT FINISHES</span>
            <strong>WHEELS / CALIPERS / PARTS</strong>
          </figcaption>
        </figure>
        <div className="paint-price__hero-mark" aria-hidden="true">PAINT</div>
      </section>

      <section className="paint-price__work" aria-labelledby="paint-work-title">
        <header className="paint-price__work-head">
          <p>RECENT FINISHES / ACTUAL WORK</p>
          <div>
            <h2 id="paint-work-title">色と艶は、<br />写真で見る。</h2>
            <span>
              実際に塗装したホイール、車体部品、ブレーキキャリパーです。
              仕上がりは部品の状態、下地、塗色によって異なります。
            </span>
          </div>
        </header>
        <div className="paint-price__work-grid">
          {RECENT_FINISHES.map((item) => (
            <figure className={`paint-price__work-item ${item.className}`} key={item.image}>
              <img
                src={item.image}
                width={item.width}
                height={item.height}
                alt={item.alt}
                loading="lazy"
              />
              <figcaption>
                <span>{item.label}</span>
                <strong>{item.title}</strong>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="paint-price__intro" aria-labelledby="paint-intro-title">
        <div className="paint-price__section-label"><span>01</span><span>SELECT THE FINISH</span></div>
        <div>
          <h2 id="paint-intro-title">同じ黒でも、<br />役割が違う。</h2>
          <p>
            飛び石を受けるガード、熱を逃がすラジエーター、高温に晒される排気系。
            見た目だけで塗料を決めず、部品が置かれる環境から施工方法を選びます。
          </p>
        </div>
      </section>

      <section className="paint-price__catalog" aria-labelledby="paint-catalog-title">
        <header className="paint-price__catalog-head">
          <div>
            <p>PRICE GUIDE / TAX INCLUDED</p>
            <h2 id="paint-catalog-title">参考価格</h2>
          </div>
          {updatedLabel && <span>UPDATED {updatedLabel}</span>}
        </header>

        <div className="paint-price__notice">
          <strong>部品写真を確認して、正式な料金を案内します。</strong>
          <p>表示価格は税込・部品単体・標準ブラック系・通常マスキングを基準にした参考価格です。</p>
        </div>

        {!document && !error && <LoadingPriceList />}
        {error && (
          <div className="paint-price__error" role="alert">
            <p>価格表を読み込めませんでした。</p>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)}>もう一度読み込む</button>
          </div>
        )}
        {document && CATEGORY_ORDER.map((category) => (
          <PriceGroup
            key={category}
            category={category}
            items={publishedItems.filter((item) => item.category === category)}
          />
        ))}
      </section>

      <section className="paint-price__conditions" aria-labelledby="paint-conditions-title">
        <div className="paint-price__section-label paint-price__section-label--light"><span>02</span><span>BEFORE REQUEST</span></div>
        <div className="paint-price__conditions-grid">
          <div>
            <h2 id="paint-conditions-title">写真で分かること。<br />実物で決めること。</h2>
          </div>
          <div>
            <ol>
              <li><span>01</span><p><strong>全体を撮る</strong>部品の大きさと形状が分かるよう、正面と裏面を撮影してください。</p></li>
              <li><span>02</span><p><strong>傷みを寄って撮る</strong>錆、傷、亀裂、油汚れ、旧塗膜の浮きを近くから撮影してください。</p></li>
              <li><span>03</span><p><strong>材質と希望を書く</strong>車種、部品名、材質、希望色、希望納期を分かる範囲で送ってください。</p></li>
            </ol>
          </div>
        </div>
        <div className="paint-price__fineprint">
          {(document?.notes_ja || []).map((note) => <p key={note}>・{note}</p>)}
          <p>・セラコートは用途に応じて塗料シリーズを選定します。すべてのシリーズが同じ耐熱温度ではありません。</p>
        </div>
        <a className="paint-price__final-cta" href={formUrl} target="_blank" rel="noreferrer">
          <span>写真見積フォームへ</span>
          <strong>部品を送る前に、まず相談する。</strong>
          <i aria-hidden="true">→</i>
        </a>
      </section>
    </main>
  )
}
