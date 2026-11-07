import { useEffect } from 'react'
import { gearGuides, gearGuideDate } from './gear-guides'
import { amazonGearProduct, amazonGearSearch, recommendedMirror, repairGear, packingGear, campingGear } from './touring-gear'
import './gear-guide.css'

const products = {
  patch: repairGear[1], lever: repairGear[0], pump: repairGear[2],
  bag: packingGear[0], tent: campingGear[0], lantern: campingGear[1],
  mirror: { ...recommendedMirror, source: 'https://www.amazon.co.jp/dp/B0CNSZ3CBD' },
}

export function GearGuideLinks({ basePath = '/', excludeSlug }) {
  const guides = excludeSlug
    ? gearGuides.filter((guide) => gearGuides.find((item) => item.slug === excludeSlug)?.related.includes(guide.slug))
    : gearGuides
  return (
    <div className="gg-links">
      {guides.map((guide) => (
        <a key={guide.slug} href={`${basePath}${guide.path.slice(1)}`}>
          <span>{guide.category}</span><strong>{guide.title}</strong><span aria-hidden="true">→</span>
        </a>
      ))}
    </div>
  )
}

export default function GearGuideArticle({ guide, assetPath, basePath = '/' }) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = `${guide.title}｜DUST LINE`
    return () => { document.title = previousTitle }
  }, [guide])

  const hasAffiliate = guide.productKeys.length > 0
  return (
    <main id="main" className="gear-guide">
      <article>
        <header className="gg-header gg-wide">
          <nav className="gg-breadcrumb" aria-label="パンくずリスト">
            <a href={basePath}>ホーム</a><span aria-hidden="true">/</span><a href={`${basePath}gear/`}>ツーリング装備</a>
          </nav>
          <p className="gg-category">{guide.category}</p>
          <h1>{guide.title}</h1>
          <p className="gg-byline"><a href={`${basePath}company/`}>DUSTLINE編集部</a><time dateTime={gearGuideDate}>2026年11月7日</time></p>
          <p className="gg-lead">{guide.lead}</p>
        </header>
        {guide.image && (
          <figure className={`gg-figure gg-wide${guide.slug === 'motorcycle-puncture-kit' ? ' gg-figure--portrait' : ''}`}>
            <img src={assetPath(guide.image)} alt={guide.imageAlt} fetchPriority="high" decoding="async" />
            <figcaption>{guide.caption}</figcaption>
          </figure>
        )}
        <div className="gg-body">
          <aside className="gg-disclosure" aria-label="記事と広告について">
            {hasAffiliate && <p><strong>広告</strong> 本記事はアフィリエイトリンクを含みます。Amazonのアソシエイトとして、DUSTLINEは適格販売により収入を得ています。</p>}
            {guide.commercialNote && <p><strong>自社取扱商品</strong> {guide.commercialNote}</p>}
            <p>編集部が公開取材と確認できた製品情報をもとに構成した、装備選びのガイドです。</p>
          </aside>
          <nav className="gg-contents" aria-label="この記事の目次">
            <p>この記事で確認すること</p>
            <ol>{guide.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol>
          </nav>
          {guide.sections.map((section, index) => (
            <section id={section.id} key={section.id} className="gg-section">
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.source && <p className="gg-source">参照：<a href={section.source.asin ? amazonGearProduct(section.source.asin) : section.source.url} target={section.source.url.startsWith('https:') ? '_blank' : undefined} rel={section.source.asin ? 'sponsored noopener' : 'noopener'}>{section.source.label}</a></p>}
              {index === 1 && (
                <div className="gg-comparison">
                  <table><caption>{guide.table.title}</caption>
                    <thead><tr>{guide.table.headers.map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead>
                    <tbody>{guide.table.rows.map(([label, detail]) => <tr key={label}><th scope="row">{label}</th><td>{detail}</td></tr>)}</tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
          <section className="gg-checklist" aria-labelledby="gg-checklist-title">
            <h2 id="gg-checklist-title">出発前に、ここを確認</h2>
            <ul>{guide.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          {hasAffiliate && (
            <section className="gg-products" aria-labelledby="gg-products-title">
              <h2 id="gg-products-title">この記事の購入候補</h2>
              <p>仕様と同梱内容を照合して選べる候補です。価格・在庫・適合は購入先でご確認ください。仕様確認：2026年11月7日。</p>
              <ul>{guide.productKeys.map((key) => {
                const item = products[key]
                return <li key={key}><h3>{item.brand ? `${item.brand} ` : ''}{item.name}{item.set ? `（${item.set}）` : ''}</h3>
                  <a href={key === 'mirror' ? amazonGearProduct(item.asin) : amazonGearSearch(item.query)} target="_blank" rel="sponsored noopener">{key === 'mirror' ? 'Amazonで商品を見る' : 'Amazonで候補を探す'}<span aria-hidden="true">↗</span></a>
                </li>
              })}</ul>
            </section>
          )}
          {guide.ownProductPath && <a className="gg-report-link" href={`${basePath}${guide.ownProductPath.slice(1)}`}>取扱の焚き火台：仕様・購入相談を見る<span aria-hidden="true">→</span></a>}
          {guide.reporting && <a className="gg-report-link" href={`${basePath}${guide.reporting.path.slice(1)}`}>{guide.reporting.title}<span aria-hidden="true">→</span></a>}
        </div>
      </article>
      <aside className="gg-more gg-wide" aria-labelledby="gg-more-title">
        <h2 id="gg-more-title">あわせて読みたい</h2>
        <GearGuideLinks excludeSlug={guide.slug} basePath={basePath} />
        <a className="gg-back" href={`${basePath}gear/#guides`}>装備の選び方一覧へ<span aria-hidden="true">→</span></a>
      </aside>
    </main>
  )
}
