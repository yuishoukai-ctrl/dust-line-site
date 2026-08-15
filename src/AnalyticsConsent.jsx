import { useEffect, useState } from 'react'
import {
  analyticsConsentEvent,
  analyticsIsConfigured,
  getAnalyticsConsent,
  initializeAnalytics,
  setAnalyticsConsent,
} from './lib/analytics'
import './analytics-consent.css'

export default function AnalyticsConsent() {
  const [consent, setConsent] = useState(getAnalyticsConsent)

  useEffect(() => {
    if (!analyticsIsConfigured) return undefined
    initializeAnalytics()
    const handleConsentChange = (event) => setConsent(event.detail)
    window.addEventListener(analyticsConsentEvent, handleConsentChange)
    return () => window.removeEventListener(analyticsConsentEvent, handleConsentChange)
  }, [])

  if (!analyticsIsConfigured || consent) return null

  return (
    <aside className="analytics-consent" aria-label="アクセス解析の設定">
      <div>
        <p className="analytics-consent__label">PRIVACY / ANALYTICS</p>
        <p>サイト改善のため、Google Analyticsで個人を直接識別しない利用状況を計測してもよいですか。メールアドレスや入力内容は送信しません。</p>
        <a href="/privacy/">詳しい取り扱いを見る</a>
      </div>
      <div className="analytics-consent__actions">
        <button type="button" className="analytics-consent__button analytics-consent__button--deny" onClick={() => setAnalyticsConsent('denied')}>許可しない</button>
        <button type="button" className="analytics-consent__button analytics-consent__button--allow" onClick={() => setAnalyticsConsent('granted')}>許可する</button>
      </div>
    </aside>
  )
}
