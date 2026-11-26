import { useRef, useState } from 'react'
import { contactEndpoint, contactLimits, contactRecipient, contactTopics, isContactTopic } from './lib/contact'
import './contact.css'

export default function ContactPage({ privacyPath }) {
  const requestedTopic = new URLSearchParams(window.location.search).get('topic')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const submitting = useRef(false)

  async function submit(event) {
    event.preventDefault()
    if (submitting.current) return
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    submitting.current = true
    setStatus('sending')
    setError('')
    try {
      const response = await fetch(contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(15000),
      })
      const result = await response.json()
      if (response.ok && result.ok === true) {
        setStatus('sent')
      } else {
        setStatus('idle')
        setError(response.status === 429
          ? '送信回数が上限に達しました。少し時間をおいてからお試しください。'
          : response.status === 400
            ? '返信先メールアドレスとお問い合わせ内容を確認してください。'
            : '送信できませんでした。時間をおいて再度お試しください。')
      }
    } catch {
      setStatus('idle')
      setError('送信結果を確認できませんでした。通信状況をご確認ください。')
    } finally {
      submitting.current = false
    }
  }

  return (
    <main className="contact-page" id="main">
      <div className="contact-page__inner">
        <header className="contact-page__header">
          <h1>お問い合わせ</h1>
          <p>雑誌の購入・閲覧、広告やパーツについてご相談いただけます。</p>
        </header>
        {status === 'sent' ? (
          <div className="contact-page__receipt" role="status">
            <h2>お問い合わせを受け付けました</h2>
            <p>ご入力いただいたメールアドレスに返信します。</p>
          </div>
        ) : (
          <form className="contact-form" action={contactEndpoint} method="post" onSubmit={submit} aria-busy={status === 'sending'}>
            <label>
              <span>お問い合わせの種類</span>
              <select name="topic" required defaultValue={isContactTopic(requestedTopic) ? requestedTopic : ''}>
                <option value="" disabled>選択してください</option>
                {Object.entries(contactTopics).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              <span>返信先メールアドレス</span>
              <input name="email" type="email" autoComplete="email" maxLength={contactLimits.email} required />
            </label>
            <label>
              <span>お名前・会社名 <small>任意</small></span>
              <input name="name" type="text" autoComplete="name" maxLength={contactLimits.name} />
            </label>
            <label>
              <span>お問い合わせ内容</span>
              <textarea name="message" rows={7} maxLength={contactLimits.message} required />
            </label>
            <div hidden aria-hidden="true">
              <label>ウェブサイト<input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>
            <p className="contact-form__privacy">入力内容はお問い合わせへの回答に使用します。 <a href={privacyPath}>プライバシーポリシー</a></p>
            {error && <p className="contact-form__error" role="alert">{error}</p>}
            <button className="button button--accent contact-form__submit" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? '送信中…' : '送信する'}
            </button>
          </form>
        )}
        <p className="contact-page__email">メールでもご連絡いただけます。 <a href={'mailto:' + contactRecipient}>{contactRecipient}</a></p>
      </div>
    </main>
  )
}
