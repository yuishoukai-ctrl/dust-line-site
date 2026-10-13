export const partsReservationSlugs = new Set(['f450gs-radiator-guard', 'f450gs-rear-master-cylinder-guard'])
export const partsReservationPolicy = '2026-10-13-v1'
export function reservationRequestId(cryptoApi = globalThis.crypto) {
  if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID()
  if (!cryptoApi?.getRandomValues) throw new Error('Secure request ID unavailable')
  const bytes = cryptoApi.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128
  const value = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
  return `${value.slice(0,8)}-${value.slice(8,12)}-${value.slice(12,16)}-${value.slice(16,20)}-${value.slice(20)}`
}
export const reservationMessages = {
  INVALID_INPUT: '入力内容を確認してください。お名前、メールアドレス、数量が必要です。',
  CLOSED: '現在は仮予約を受け付けていません。お問い合わせフォームをご利用ください。',
  CHALLENGE_FAILED: '安全確認をもう一度行ってから送信してください。',
  RATE_LIMIT: '操作が続いたため、15分ほど時間を置いてお試しください。',
  RETRY_CONFLICT: '送信内容を確認できませんでした。ページを開き直してください。',
  UNAVAILABLE: '受付結果を確認できませんでした。入力内容を変えずに再試行してください。繰り返し失敗する場合はお問い合わせください。',
}

export async function sendPartsReservation({ endpoint, anonKey, payload, timeoutMs = 15000, fetchImpl = fetch }) {
  const controller = new AbortController(); let timer
  try {
    const operation = (async () => {
      const response = await fetchImpl(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: anonKey },
        body: JSON.stringify(payload), signal: controller.signal, credentials: 'omit',
      })
      const result = await response.json()
      if (!response.ok) throw Object.assign(new Error('Reservation failed'), { code: Object.hasOwn(reservationMessages, result?.error) ? result.error : 'UNAVAILABLE' })
      if (result?.status !== 'received' || result.receipt !== payload.request_id) throw new Error('Unexpected receipt')
      return result
    })()
    const timeout = new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('Timed out')) }, timeoutMs) })
    return await Promise.race([operation, timeout])
  } catch (error) {
    throw Object.assign(new Error('Reservation failed'), { code: Object.hasOwn(reservationMessages, error?.code) ? error.code : 'UNAVAILABLE' })
  } finally { clearTimeout(timer) }
}
