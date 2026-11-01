import content from './michinoku-rally-content.json'
import './michinoku-rally.css'

function RallyImage({ number, width, height, caption, captionId, assetPath, priority = false }) {
  const file = (size) => assetPath(`michinoku-rally/${String(number).padStart(2, '0')}-${size}.webp`)
  return (
    <figure className={`michinoku-photo${height > width ? ' michinoku-photo--portrait' : ''}`}>
      <img src={file(1300)} srcSet={`${file(640)} 640w, ${file(1300)} ${Math.min(1300, width)}w`}
        sizes="(max-width: 760px) 100vw, 960px" width={width} height={height}
        alt={caption || '夕暮れの山々を背景にした編集部の参加車両'}
        loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} decoding="async" />
      {caption && <figcaption data-source-id={captionId}>{caption}</figcaption>}
    </figure>
  )
}

function StoryBlocks({ blocks, assetPath }) {
  const groups = []
  for (const block of blocks) {
    const last = groups.at(-1)
    if (block.type === 'figure') {
      if (last?.type === 'gallery') last.blocks.push(block)
      else groups.push({ type: 'gallery', blocks: [block] })
    } else if (block.type === 'speaker') {
      groups.push({ type: 'speech', blocks: [block] })
    } else if (last?.type === 'speech') {
      last.blocks.push(block)
    } else {
      groups.push({ type: 'prose', blocks: [block] })
    }
  }
  return groups.map((group, index) => {
    if (group.type === 'gallery') return (
      <div className={`michinoku-gallery michinoku-gallery--${group.blocks.length}`} key={`gallery-${index}`}>
        {group.blocks.map((block) => <RallyImage key={block.number} {...block} assetPath={assetPath} />)}
      </div>
    )
    return (
      <div className={`michinoku-${group.type}`} key={group.blocks[0].id}>
        {group.blocks.map((block) => block.type === 'speaker'
          ? <p className="michinoku-speaker" data-source-id={block.id} key={block.id}>{block.text}</p>
          : <p data-source-id={block.id} key={block.id}>{block.text}</p>)}
      </div>
    )
  })
}

export default function MichinokuRallyArticle({ assetPath }) {
  return (
    <main className="michinoku-article" id="main">
      <article>
        <header className="michinoku-hero">
          <div className="michinoku-hero__copy">
            <a className="michinoku-back" href="/travel/">← 旅の記録</a>
            <p className="michinoku-kicker">FIELD REPORT / IWATE / 2026.10.10</p>
            <h1 data-source-id="0">{content.title}</h1>
            <p className="michinoku-deck" data-source-id="1">{content.subtitle}</p>
          </div>
          <RallyImage number={12} width={1299} height={974} assetPath={assetPath} priority />
        </header>

        <section className="michinoku-digest" aria-labelledby="michinoku-digest-title">
          <h2 id="michinoku-digest-title">ダイジェスト</h2>
          <p>{content.digest}</p>
          <nav className="michinoku-toc" aria-label="記事の目次">
            {content.sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.shortTitle}<span aria-hidden="true">↓</span></a>)}
          </nav>
        </section>

        <div className="michinoku-lead">
          <StoryBlocks blocks={content.lead} assetPath={assetPath} />
        </div>

        {content.sections.map((section, index) => (
          <section className={`michinoku-section${index === 0 ? ' michinoku-section--overview' : ''}`} id={section.id}
            key={section.id} aria-labelledby={`${section.id}-title`}>
            <h2 id={`${section.id}-title`} data-source-id={section.headingId}>{section.title}</h2>
            <StoryBlocks blocks={section.blocks} assetPath={assetPath} />
          </section>
        ))}
        <p className="michinoku-credit" data-source-id={content.creditId}>{content.credit}</p>

        <aside className="michinoku-next" aria-label="関連する記事">
          <a href="/magazine/issue-02/">第2号の予告を見る <span aria-hidden="true">→</span></a>
          <a href="/travel/">ほかの旅の記録を読む <span aria-hidden="true">→</span></a>
        </aside>
      </article>
    </main>
  )
}
