import { useEffect } from 'react'
import { issue01Digests, issue01DigestDate } from './issue01-digests'
import './issue01-digests.css'

const issueRange = (article) => `P${String(article.pages[0]).padStart(3, '0')}–${String(article.pages[1]).padStart(3, '0')}`
const internalHref = (basePath, path) => `${basePath}${path.slice(1)}`

function DigestPhoto({ photo, assetPath, hero = false }) {
  return (
    <figure className={`id-photo${hero ? ' id-photo--hero' : ''}`}>
      <img src={assetPath(photo.file)} alt={photo.alt} width={photo.width} height={photo.height} style={{ maxWidth: photo.width }} loading={hero ? 'eager' : 'lazy'} fetchPriority={hero ? 'high' : undefined} decoding="async" />
      <figcaption>{photo.credit}<span>本誌 P{String(photo.page).padStart(3, '0')}</span></figcaption>
    </figure>
  )
}

function DigestCards({ articles, assetPath, basePath }) {
  return <div className="id-cards">{articles.map((article) => (
    <article key={article.slug} className="id-card">
      <a className="id-card__image" href={internalHref(basePath, article.path)} aria-label={article.title}>
        <img src={assetPath(article.hero.file)} alt={article.hero.alt} loading="lazy" decoding="async" />
      </a>
      <div className="id-card__copy"><p>{article.category}<span>{issueRange(article)}</span></p>
        <h2><a href={internalHref(basePath, article.path)}>{article.title}</a></h2>
        <p>{article.introduction}</p>
        <a className="id-text-link" href={internalHref(basePath, article.path)}>ダイジェストを読む<span aria-hidden="true">→</span></a>
      </div>
    </article>
  ))}</div>
}

export function Issue01DigestIndex({ assetPath, basePath = '/' }) {
  return (
    <main id="main" className="issue01-digest">
      <header className="id-header id-wide">
        <nav className="id-breadcrumb" aria-label="パンくずリスト"><a href={basePath}>ホーム</a><span aria-hidden="true">/</span><span aria-current="page">創刊号ダイジェスト</span></nav>
        <p className="id-category">DUSTLINE / ISSUE 01</p>
        <h1>創刊号ダイジェスト</h1>
        <p className="id-intro">一台と重ねた時間、地域をつなぐラリー、手を動かすガレージ。創刊号から、本文と写真の一部を公開します。</p>
        <p className="id-index-note">本文は原文からの抜粋です。全文と連続写真は本誌でお読みいただけます。</p>
      </header>
      <section className="id-wide" aria-label="創刊号から公開した6記事"><DigestCards articles={issue01Digests} assetPath={assetPath} basePath={basePath} /></section>
      <aside className="id-issue id-wide"><div><p>DUSTLINE ISSUE 01</p><h2>記事の続きは、創刊号で。</h2></div><a href={`${basePath}offroad-bike-magazine/`}>創刊号の案内を見る<span aria-hidden="true">→</span></a></aside>
    </main>
  )
}

export default function Issue01DigestArticle({ article, assetPath, basePath = '/' }) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = `${article.title}｜創刊号ダイジェスト｜DUST LINE`
    return () => { document.title = previousTitle }
  }, [article])
  const related = issue01Digests.filter((item) => article.related.includes(item.slug))
  return (
    <main id="main" className="issue01-digest">
      <article>
        <header className="id-header id-wide">
          <nav className="id-breadcrumb" aria-label="パンくずリスト"><a href={basePath}>ホーム</a><span aria-hidden="true">/</span><a href={`${basePath}articles/issue-01/`}>創刊号ダイジェスト</a></nav>
          <p className="id-category">{article.category}</p>
          <h1>{article.title}</h1>
          <p className="id-credit">{article.credit}</p>
          <p className="id-publication"><time dateTime={issue01DigestDate}>2026年11月7日 Web公開</time><span>創刊号 {issueRange(article)}</span></p>
          <p className="id-intro">{article.introduction}</p>
        </header>
        <div className="id-wide"><DigestPhoto photo={article.hero} assetPath={assetPath} hero /></div>
        <div className="id-body">
          <aside className="id-source-note"><p>創刊号掲載記事から本文を原文で抜粋しています。導入・見出し・配置はWeb用に編集しています。</p>{article.commercialNote && <p>{article.commercialNote}</p>}</aside>
          {article.sections.map((section, index) => (
            <section className="id-section" key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex} data-source-page={paragraph.page}>{paragraph.text}</p>)}
              {article.photoAfter === index && <DigestPhoto photo={article.photo} assetPath={assetPath} />}
            </section>
          ))}
          <footer className="id-source-end">
            <p>出典：DUSTLINE創刊号 {issueRange(article)}。Web版の本文抜粋：{article.excerptPages.map((page) => `P${String(page).padStart(3, '0')}`).join('・')}。</p>
            <p>{article.credit}</p>
            {article.more && <a className="id-text-link" href={internalHref(basePath, article.more.href)}>{article.more.title}<span aria-hidden="true">→</span></a>}
          </footer>
        </div>
      </article>
      <aside className="id-issue id-wide"><div><p>DUSTLINE ISSUE 01</p><h2>全文と写真の続きは、本誌で。</h2></div><div><a href={`${basePath}library/`}>創刊号を読む<span aria-hidden="true">→</span></a><a href={`${basePath}offroad-bike-magazine/`}>雑誌の案内を見る<span aria-hidden="true">→</span></a></div></aside>
      <aside className="id-related id-wide" aria-labelledby="id-related-title"><h2 id="id-related-title">創刊号から、あわせて読む。</h2><DigestCards articles={related} assetPath={assetPath} basePath={basePath} /><a className="id-text-link" href={`${basePath}articles/issue-01/`}>ダイジェスト一覧へ<span aria-hidden="true">→</span></a></aside>
    </main>
  )
}
