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
  const spread = assetPath('machine-file-001-spread.png')

  useEffect(() => {
    const previousTitle = document.title
    document.title = '大陸横断マシン | DUST LINE'
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
            <h1>大陸横断<br />マシン</h1>
          </div>
          <div className="machine-reader__deck">
            <p>60Lタンク、トリプルヘッドライト、6mmアーマー。ガードファクトリーが仕立てたR1200GSの誌面を、2ページ公開します。</p>
            <span>ISSUE 01 / PAGES 026–027</span>
          </div>
        </header>

        <section className="machine-reader__canvas" aria-label="大陸横断マシン 2ページ試し読み">
          <figure className="machine-reader__spread">
            <img src={spread} alt="DUST LINE 大陸横断マシンの記事見開き、026ページと027ページ" />
          </figure>

          <div className="machine-reader__pages">
            <figure className="machine-reader__page machine-reader__page--left">
              <img src={spread} alt="大陸横断マシンの記事 026ページ" />
            </figure>
            <figure className="machine-reader__page machine-reader__page--right">
              <img src={spread} alt="大陸横断マシンの記事 027ページ" />
            </figure>
          </div>

          <div className="machine-reader__afterword">
            <p>DUST LINE創刊号に収録予定の誌面から、2ページを公開しています。</p>
            <a href={root}><BackArrow /> JOURNALへ戻る</a>
          </div>
        </section>
      </main>

      <footer className="machine-reader__footer">
        <span>DUST LINE / MACHINE FILE 001</span>
        <span>026—027</span>
      </footer>
    </div>
  )
}
