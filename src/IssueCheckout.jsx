import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { callIssueCheckout, checkoutDestination, checkoutMessages } from './lib/issue-checkout'
import { authPath } from './lib/member-navigation'
import './issue-checkout.css'

export const issuePaymentsEnabled = import.meta.env.VITE_ISSUE_PAYMENTS_ENABLED === 'true'

export default function IssueCheckout() {
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const query = new URLSearchParams(window.location.search)
  const orderId = query.get('order_id')
  const activeOrderId = result?.order_id ?? orderId
  const returned = query.get('checkout') === 'return'
  const cancelled = query.get('checkout') === 'cancel'

  const refresh = async () => {
    setBusy(true); setError('')
    try { setResult(await callIssueCheckout(supabase, { action: 'status', order_id: activeOrderId })) }
    catch (error) { setError(error.code ?? 'UNAVAILABLE') }
    finally { setBusy(false) }
  }
  useEffect(() => {
    if (!returned || !orderId) return undefined
    let active = true, timer, count = 0
    const poll = async () => {
      try {
        const data = await callIssueCheckout(supabase, { action: 'status', order_id: orderId })
        if (!active) return
        setResult(data)
        if (['creating','open','processing'].includes(data.status) && ++count < 10) timer = setTimeout(poll, 3000)
      } catch (error) { if (active) setError(error.code ?? 'UNAVAILABLE') }
    }
    poll()
    return () => { active = false; clearTimeout(timer) }
  }, [returned, orderId])

  const purchase = async () => {
    if (!issuePaymentsEnabled) { setError('SALES_CLOSED'); return }
    setBusy(true); setError('')
    try {
      const data = await callIssueCheckout(supabase, { action: 'checkout', issue_id: 'issue-02' })
      if (data.status === 'open') {
        const destination = checkoutDestination(data.url)
        if (!destination || data.amount_jpy !== 1480) throw new Error('Invalid payment destination')
        window.location.assign(destination)
      } else setResult(data)
    } catch (error) { setError(error.code ?? 'UNAVAILABLE') }
    finally { setBusy(false) }
  }

  const owned = result?.status === 'paid' || result?.status === 'already_owned'
  return (
    <section className="issue-checkout" aria-label="電子版の購入">
      {import.meta.env.DEV && <p className="issue-checkout__test">決済接続テスト用の画面です。実際の販売開始前です。</p>}
      <p><strong>DUST LINE ISSUE 02 電子版</strong><br />1,480円（税込）／1号の単品購入・自動更新なし</p>
      {owned ? (
        <p role="status">購入を確認しました。<a href="/library/">マイライブラリで読む</a></p>
      ) : (returned || result?.status === 'processing') ? (
        <>
          <p role="status">{result?.status === 'refunded' ? '返金済みです。' : result?.status === 'disputed' ? 'この購入は確認中です。お問い合わせください。' : ['failed','expired'].includes(result?.status) ? 'この決済では購入が完了していません。' : '決済結果を確認しています。反映に時間がかかる場合があります。重ねて支払わず、ライブラリをご確認ください。'}</p>
          <a href="/library/">マイライブラリを確認</a>
          {activeOrderId && <button type="button" disabled={busy} onClick={refresh}>{busy ? '確認中…' : '購入状態を再確認'}</button>}
          {['failed','expired'].includes(result?.status) && <a href="/magazine/issue-02/">商品ページに戻る</a>}
        </>
      ) : (
        <>
          {cancelled && <p role="status">決済画面から戻りました。購入済みか不明な場合は、先にマイライブラリをご確認ください。</p>}
          {issuePaymentsEnabled ? (
            <>
              <label><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />対象号・税込価格・単品購入と提供条件を確認しました。</label>
              <button type="button" disabled={!confirmed || busy} onClick={purchase}>{busy ? '決済画面を準備中…' : '1,480円で購入手続きへ'}</button>
              <p>支払いはStripeの画面で行います。DUST LINE会員ログインとメール確認が必要です。</p>
            </>
          ) : (
            <>
              <button type="button" disabled>現在は購入できません</button>
              <p>販売開始の案内をお待ちください。</p>
              <a href="/library/">マイライブラリへ</a>
            </>
          )}
        </>
      )}
      {error && <p className="issue-checkout__error" role="alert">{checkoutMessages[error] ?? checkoutMessages.UNAVAILABLE}</p>}
      {(error === 'AUTH_REQUIRED' || error === 'EMAIL_UNCONFIRMED') && <a href={authPath(error === 'AUTH_REQUIRED' ? '/account/login/' : '/account/verify/','/magazine/issue-02/')}>ログイン・メール確認へ</a>}
      <nav aria-label="購入条件"><a href="/refund-policy/">返金・キャンセル</a><a href="/digital-delivery/">提供条件</a><a href="/commercial-disclosure/">販売者情報</a></nav>
    </section>
  )
}
