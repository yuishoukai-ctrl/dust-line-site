import { useRef, useState } from 'react'
import TurnstileChallenge from './TurnstileChallenge'
import { partsReservationConfig } from './lib/parts-reservation-config'
import { partsReservationPolicy, partsReservationSlugs, reservationMessages, reservationRequestId, sendPartsReservation } from './lib/parts-reservation'
import './parts-reservation.css'

export function canReservePart(product) {
  return partsReservationConfig.enabled && partsReservationSlugs.has(product.slug)
}

export default function PartsReservationForm({ product, contactUrl, basePath = '/' }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [consent, setConsent] = useState(false)
  const [challenge, setChallenge] = useState('')
  const [resetKey, setResetKey] = useState(0)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState('')
  const attempt = useRef(null)
  const sending = useRef(false)
  const resultRegion = useRef(null)
  if (!canReservePart(product)) return null

  async function handleSubmit(event) {
    event.preventDefault()
    if (sending.current) return
    if (!consent || !challenge) { setError('仮予約の条件に同意し、安全確認を完了してください。'); return }
    const fields = { product: product.slug, quantity: Number(quantity), name: name.trim(), email: email.trim().toLowerCase(), consent: true, policy_version: partsReservationPolicy }
    const signature = JSON.stringify(fields)
    const website = new FormData(event.currentTarget).get('website') || ''
    sending.current = true; setPending(true); setError('')
    try {
      if (attempt.current?.signature !== signature) attempt.current = { signature, requestId: reservationRequestId() }
      const result = await sendPartsReservation({
        ...partsReservationConfig, payload: { ...fields, request_id: attempt.current.requestId, challenge, website },
      })
      setReceipt(result.receipt)
      // Keep the DOM focus on the accessible success region after it renders.
      requestAnimationFrame(() => resultRegion.current?.focus())
    } catch (failure) { setError(reservationMessages[failure.code] || reservationMessages.UNAVAILABLE) }
    finally { sending.current = false; setPending(false); setChallenge(''); setResetKey(value => value + 1) }
  }

  return <section className="gf-reservation" id="gf-reservation" aria-labelledby="gf-reservation-title">
    <header>
      <p className="gf-eyebrow">GUARD FACTORY / FREE RESERVATION</p>
      <h2 id="gf-reservation-title">無料で、仮予約する。</h2>
      <p className="gf-reservation__product">{product.name}</p>
      <p className="gf-price"><strong>{product.priceLabel}</strong><span>{product.priceNote}／送料未定</span></p>
      <p>会員登録は不要です。販売条件と発送時期が決まり次第、入力いただいたメールアドレスへご案内します。</p>
      <ol className="gf-reservation__steps"><li>無料仮予約</li><li>仕様・納期のご案内</li><li>希望される方がStripeでお支払い</li></ol>
    </header>
    <div>
      <div className="gf-reservation__conditions" id="gf-reservation-conditions">
        <h3>仮予約の条件</h3>
        <ul>
          <li>今回は希望数量と連絡先の受付です。代金は発生せず、注文や在庫の確保をお約束するものではありません。</li>
          <li>適合・販売仕様・発送時期・送料は確認中です。価格や形状が変更になる場合があります。</li>
          <li>確定した価格・送料・納期・返品条件を確認いただき、購入を希望される場合に後日お支払いいただきます。自動で請求しません。</li>
          <li>同じメールアドレス・商品での再送は数量の追加として扱いません。数量の変更・取り消しは受付番号を添えてお問い合わせください。</li>
        </ul>
      </div>
      {receipt ? <div className="gf-reservation__receipt" role="status" tabIndex={-1} ref={resultRegion}>
        <h3>仮予約を受け付けました。</h3>
        <p>代金は発生していません。販売条件と発送時期が決まり次第、メールでご案内します。</p>
        <p>受付番号を控えておいてください。</p><code>{receipt}</code>
        <p>受付完了メールは自動送信していません。数量変更・取り消し・メールアドレスの訂正は、受付番号を添えてご連絡ください。</p>
        <a className="gf-text-link" href={contactUrl} target="_blank" rel="noreferrer">仮予約について問い合わせる <span aria-hidden="true">↗</span><span className="gf-sr-only">（別タブで開きます）</span></a>
      </div> : <form className="gf-reservation__form" onSubmit={handleSubmit} aria-describedby="gf-reservation-conditions" aria-busy={pending}>
        <fieldset disabled={pending}>
          <label>希望数量<select value={quantity} onChange={event => setQuantity(event.target.value)} name="quantity">{Array.from({ length: 10 }, (_, i) => <option value={i + 1} key={i}>{i + 1}個</option>)}</select></label>
          <label>お名前<input required name="name" autoComplete="name" maxLength={80} value={name} onChange={event => setName(event.target.value)} /></label>
          <label>メールアドレス<input required type="email" name="email" autoComplete="email" inputMode="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} /><small>ご案内を受け取れるアドレスを入力してください。</small></label>
          <div className="gf-reservation__honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <label className="gf-reservation__consent"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} /><span>上記の仮予約の条件と、<a href={`${basePath}privacy/`} target="_blank" rel="noreferrer">プライバシーポリシー（別タブ）</a>を確認し、商品に関する連絡を受け取ることに同意します。</span></label>
        </fieldset>
        {consent && <TurnstileChallenge siteKey={partsReservationConfig.siteKey} onToken={setChallenge} resetKey={resetKey} />}
        <p className="gf-reservation__privacy">入力情報は仮予約の管理・商品に関するご連絡に利用します。広告メールの登録は行いません。不正送信対策にCloudflare Turnstileを使用します。</p>
        {error && <p className="gf-reservation__error" role="alert">{error}</p>}
        <button className="gf-button" type="submit" disabled={pending || !consent || !challenge}>{pending ? '送信しています…' : '無料仮予約を送信する'} <span aria-hidden="true">→</span></button>
        <p role="status" className="gf-reservation__pending">{pending ? '通信結果を確認しています。最大15秒ほどお待ちください。' : 'この画面ではお支払いは発生しません。'}</p>
      </form>}
    </div>
  </section>
}
