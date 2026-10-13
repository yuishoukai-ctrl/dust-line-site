import { useEffect, useRef, useState } from 'react'

let pendingScript
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (pendingScript) return pendingScript
  pendingScript = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    const timeout = setTimeout(() => { script.remove(); reject(new Error('Challenge unavailable')) }, 10000)
    script.onload = () => { clearTimeout(timeout); window.turnstile ? resolve(window.turnstile) : reject(new Error('Challenge unavailable')) }
    script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error('Challenge unavailable')) }
    document.head.appendChild(script)
  }).catch(error => { pendingScript = null; throw error })
  return pendingScript
}

export default function TurnstileChallenge({ siteKey, onToken, resetKey }) {
  const container = useRef(null)
  const [state, setState] = useState('loading')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let alive = true, widget, api
    onToken(''); setState('loading')
    loadTurnstile().then(client => {
      if (!alive) return
      api = client
      widget = client.render(container.current, {
        sitekey: siteKey, action: 'parts_reservation', language: 'ja', theme: 'dark', size: 'flexible',
        callback: token => { if (alive) { onToken(token); setState('ready') } },
        'expired-callback': () => { if (alive) { onToken(''); setState('expired') } },
        'error-callback': () => { if (alive) { onToken(''); setState('error') }; return true },
        'timeout-callback': () => { if (alive) { onToken(''); setState('expired') } },
      })
    }).catch(() => { if (alive) setState('error') })
    return () => { alive = false; if (widget !== undefined) api?.remove(widget) }
  }, [siteKey, onToken, resetKey, retry])
  return <div className="gf-reservation__challenge">
    <div ref={container} />
    <p role="status">{state === 'ready' ? '安全確認が完了しました。' : state === 'error' ? '安全確認を読み込めませんでした。通信状態を確認してください。' : state === 'expired' ? '安全確認の有効期限が切れました。' : '安全確認を読み込んでいます。'}</p>
    {['expired', 'error'].includes(state) && <button className="gf-text-link" type="button" onClick={() => setRetry(value => value + 1)}>安全確認をやり直す</button>}
  </div>
}
