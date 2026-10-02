import { firstIssue } from './member-content'
import IssueReadNote from './IssueReadNote'
import './ReleaseDelayNoticePage.css'

export default function IssueReleaseNewsPage({ coverSrc, magazinePath, historyPath }) {
  return (
    <main id="main" className="release-delay-page">
      <section className="release-delay-hero" aria-labelledby="issue-release-news-title">
        <div className="release-delay-hero__grid" aria-hidden="true" />
        <div className="release-delay-hero__copy">
          <p className="release-delay-eyebrow">OFFICIAL NEWS / <time dateTime={firstIssue.releaseDate}>2026.10.01</time></p>
          <h1 id="issue-release-news-title"><span>創刊号を</span><span>無料公開</span><span>しました。</span></h1>
          <p className="release-delay-lead">{firstIssue.releaseDateLabel}、DUST LINE創刊号を公開しました。<br />電子版は全{firstIssue.pageCount}ページ。表紙・裏表紙を含む総ページ数です。</p>
          <a className="button button--accent" href={firstIssue.readerPath}>創刊号を無料で読む <span aria-hidden="true">→</span></a>
          <IssueReadNote />
        </div>
        <figure className="release-delay-cover">
          <span aria-hidden="true">ISSUE 01</span>
          <img src={coverSrc} alt="DUST LINE創刊号の表紙" width="800" height="1120" />
        </figure>
        <p className="release-delay-number" aria-hidden="true">01</p>
      </section>

      <article className="release-delay-letter" aria-label="創刊号公開のご案内">
        <header className="release-delay-letter__header"><p>TO OUR READERS</p><time dateTime={firstIssue.releaseDate}>{firstIssue.releaseDateLabel}</time></header>
        <div className="release-delay-letter__body">
          <h2>DUST LINE創刊号、無料公開中。</h2>
          <p>旅、車両製作、カスタム、ものづくりから、ショップ・イベントの紹介まで。舗装路の向こう側へ踏み出すための一冊を、全{firstIssue.pageCount}ページでお届けします。</p>
          <p>創刊号は無料会員登録でお読みいただけます。カードの登録は不要です。登録済みの方も、<a href={firstIssue.readerPath}>創刊号の閲覧ページ</a>からお進みください。</p>
          <p>収録内容は<a href={magazinePath}>巻号一覧</a>でご案内しています。</p>
          <footer className="release-delay-signature"><p>走る。つくる。直す。その先へ。</p><p>DUST LINE編集部</p></footer>
        </div>
      </article>

      <nav className="release-delay-links" aria-label="関連ページと過去のお知らせ">
        <a className="button button--accent" href={firstIssue.readerPath}>創刊号を無料で読む <span aria-hidden="true">→</span></a>
        <a className="text-link" href={historyPath}>2026年9月1日の発売延期のお知らせ <span aria-hidden="true">→</span></a>
      </nav>
    </main>
  )
}
