import { useEffect } from 'react'
import './machine-file.css'

function BackArrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  )
}

export default function MachineFileArticle({ assetPath }) {
  const root = import.meta.env.BASE_URL
  const spread = assetPath('machine-file-001-spread.webp')
  const samplePdf = `${root}downloads/dust-line-issue-01-sample.pdf`

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'BMW R1200GS 60Lタンク・トリプルヘッドライト車両製作 | DUST LINE'
    window.scrollTo(0, 0)
    return () => { document.title = previousTitle }
  }, [])

  return (
    <div className="machine-reader">
      <header className="machine-reader__header">
        <a className="machine-reader__brand" href={root}>DUST LINE</a>
        <a className="machine-reader__back" href={root}><BackArrow /> BACK TO JOURNAL</a>
      </header>

      <main>
        <header className="machine-reader__intro">
          <div>
            <p className="machine-reader__kicker">MACHINE FILE 001 / SAMPLE SPREAD</p>
            <h1>BMW R1200GS<br />60L大陸横断マシン</h1>
          </div>
          <div className="machine-reader__deck">
            <p>60L燃料タンク、トリプルヘッドライト、6mmアーマー。ガードファクトリーが仕立てたBMW R1200GS車両製作の誌面を、2ページ公開します。</p>
            <span>ISSUE 01 / PAGES 026–027</span>
          </div>
        </header>

        <section className="machine-reader__canvas" aria-label="BMW R1200GS 60L大陸横断マシン 2ページ試し読み">
          <figure className="machine-reader__spread">
            <img src={spread} alt="BMW R1200GSに60Lタンクとトリプルヘッドライトを装着した大陸横断マシンの記事見開き" loading="lazy" decoding="async" />
          </figure>

          <div className="machine-reader__pages">
            <figure className="machine-reader__page machine-reader__page--left">
              <img src={spread} alt="BMW R1200GS 60L大陸横断マシンの車両製作記事 026ページ" loading="lazy" decoding="async" />
            </figure>
            <figure className="machine-reader__page machine-reader__page--right">
              <img src={spread} alt="BMW R1200GS 60Lタンクとトリプルヘッドライトの製作記事 027ページ" loading="lazy" decoding="async" />
            </figure>
          </div>

          <div className="machine-reader__afterword">
            <p>DUST LINE創刊号に収録するBMW R1200GS大陸横断仕様の車両製作記事から、2ページを公開しています。</p>
            <a href={root}><BackArrow /> JOURNALへ戻る</a>
          </div>

          <nav className="machine-reader__links" aria-label="記事を読んだ後のリンク">
            <a href="/build/"><span>BUILD STORIES</span><strong>車両製作の記事を見る</strong><BackArrow /></a>
            <a href="/articles/world-trip/"><span>NEXT STORY</span><strong>KLR650とIMS 37Lタンクの製作記</strong><BackArrow /></a>
            <a href="/articles/hokkaido-1190/"><span>TRAVEL REPORT</span><strong>KTM 1190で行く北海道・離島の旅</strong><BackArrow /></a>
            <a href={samplePdf} target="_blank" rel="noreferrer"><span>ISSUE 01</span><strong>創刊号を2ページ試し読み</strong><BackArrow /></a>
            <a href="https://x.com/DUSTLINE_ADV" target="_blank" rel="noreferrer"><span>OFFICIAL X</span><strong>発売情報を見る</strong><BackArrow /></a>
            <a href={`${root}?page=goods`}><span>OFFICIAL GOODS</span><strong>グッズを見る</strong><BackArrow /></a>
          </nav>
        </section>
      </main>

      <footer className="machine-reader__footer">
        <span>DUST LINE / MACHINE FILE 001</span>
        <span>026—027</span>
      </footer>
    </div>
  )
}
