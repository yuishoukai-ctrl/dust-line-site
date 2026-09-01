import './ReleaseDelayNoticePage.css'

export default function ReleaseDelayNoticePage({ coverSrc, magazinePath, officialXUrl }) {
  return (
    <main id="main" className="release-delay-page">
      <section className="release-delay-hero" aria-labelledby="release-delay-title">
        <div className="release-delay-hero__grid" aria-hidden="true" />
        <div className="release-delay-hero__copy">
          <p className="release-delay-eyebrow">OFFICIAL NOTICE / 2026.09.01</p>
          <h1 id="release-delay-title"><span>DUST LINE</span><span>創刊号</span><span>発売延期の</span><span>お知らせ</span></h1>
          <p className="release-delay-lead">
            9月1日に予定していた発売・無料公開を、<strong>2026年9月中旬</strong>へ変更します。
          </p>
        </div>
        <figure className="release-delay-cover">
          <span aria-hidden="true">ISSUE 01</span>
          <img src={coverSrc} alt="DUST LINE創刊号の表紙" width="800" height="1120" />
        </figure>
        <p className="release-delay-number" aria-hidden="true">01</p>
      </section>

      <article className="release-delay-letter" aria-label="発売延期についてのご案内">
        <header className="release-delay-letter__header">
          <p>TO OUR READERS</p>
          <time dateTime="2026-09-01">2026年9月1日</time>
        </header>

        <div className="release-delay-letter__body">
          <p>平素よりDUST LINEを応援いただき、誠にありがとうございます。</p>

          <p>
            2026年9月1日に予定しておりました「DUST LINE創刊号」の発売・無料公開につきまして、
            発売時期を<strong>2026年9月中旬</strong>へ延期することとなりました。
          </p>

          <p>
            現在、創刊号をより良い形で皆さまへお届けするため、掲載内容、誌面構成および閲覧環境の
            最終確認を進めております。
          </p>

          <p>
            発売を楽しみにお待ちいただいている皆さまには、ご案内が遅くなりましたことを
            心よりお詫び申し上げます。
          </p>

          <p>
            創刊号は、当初の予定どおり<strong>無料</strong>でお読みいただけます。
            正式な発売・公開日が決まり次第、DUST LINE公式サイトおよび公式Xにて改めてお知らせいたします。
          </p>

          <p>もうしばらくお待ちくださいますよう、何卒ご理解のほどお願い申し上げます。</p>

          <footer className="release-delay-signature">
            <p>走る。つくる。直す。その先へ。</p>
            <p>DUST LINE編集部</p>
          </footer>
        </div>
      </article>

      <nav className="release-delay-links" aria-label="関連ページ">
        <a className="button button--accent" href={magazinePath}>創刊号について見る <span aria-hidden="true">→</span></a>
        <a className="text-link" href={officialXUrl} target="_blank" rel="noreferrer">公式Xで最新情報を見る <span aria-hidden="true">→</span></a>
      </nav>
    </main>
  )
}
