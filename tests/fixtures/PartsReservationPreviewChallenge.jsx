import { useEffect } from 'react'
export default function PreviewChallenge({ onToken, resetKey }) {
  useEffect(() => { onToken('preview-token') }, [onToken, resetKey])
  return <p role="status">ローカル検証用の安全確認です。外部サービスへ送信しません。</p>
}
