import './line-community.css'

const LINE_ADD_FRIEND_URL = 'https://lin.ee/xheG78sH'

export default function LineCommunity({ assetPath }) {
  return (
    <section className="line-community" aria-labelledby="line-community-title">
      <div className="line-community__inner">
        <div className="line-community__copy reveal">
          <p>DUST LINE / OFFICIAL LINE</p>
          <h2 id="line-community-title">新刊と記事の更新を、<br />LINEで受け取る。</h2>
          <span>
            創刊号の公開、WEB記事、DUST LINE GARAGEの塗装情報をお知らせします。
            友だち追加後、トーク画面のメニューからすぐに各ページを開けます。
          </span>
          <a
            className="line-community__button"
            href={LINE_ADD_FRIEND_URL}
            target="_blank"
            rel="noreferrer"
          >
            LINE公式を友だち追加 <span aria-hidden="true">→</span>
          </a>
          <small>LINE公式アカウント：@271syazw</small>
        </div>

        <a
          className="line-community__qr reveal"
          href={LINE_ADD_FRIEND_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="DUSTLINE公式LINEを友だち追加"
        >
          <span>SCAN TO ADD</span>
          <img
            src={assetPath('line/dustline-line-add-friend-qr-official-v1.png')}
            alt="DUSTLINE公式LINEの友だち追加QRコード"
            loading="lazy"
            decoding="async"
          />
          <strong>DUSTLINE公式</strong>
        </a>
      </div>
    </section>
  )
}
