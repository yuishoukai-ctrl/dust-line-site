export const checkoutMessages = {
  AUTH_REQUIRED: '購入前に会員ログインをお願いします。',
  EMAIL_UNCONFIRMED: 'メールアドレスの確認を完了してから購入してください。',
  SALES_CLOSED: 'この号は販売準備中です。現在は決済を受け付けていません。',
  PRICE_CHANGED: '価格が変更されたため、購入画面を開き直してください。',
  PRICE_MISMATCH: '販売条件を確認できませんでした。時間を置いてお試しください。',
  RATE_LIMIT: '操作が続いたため、15分ほど時間を置いてください。',
  ORDER_NOT_FOUND: 'このアカウントの購入情報を確認できませんでした。購入時のアカウントでログインしてください。',
  UNAVAILABLE: '決済の結果を確認できませんでした。マイライブラリを確認し、重ねて支払わず時間を置いてお試しください。',
}

export async function callIssueCheckout(client, body, { timeoutMs = 25_000 } = {}) {
  if (!client) throw Object.assign(new Error('Sales not configured'), { code: 'SALES_CLOSED' })
  const { data, error } = await client.functions.invoke('issue-checkout', { body, timeout: timeoutMs })
  if (error) {
    let code = 'UNAVAILABLE'
    try { const detail = await error.context?.json(); if (Object.hasOwn(checkoutMessages, detail?.error)) code = detail.error } catch { /* No raw service errors in the UI. */ }
    throw Object.assign(new Error(code), { code })
  }
  if (!data || typeof data.status !== 'string') throw Object.assign(new Error('Unavailable'), { code: 'UNAVAILABLE' })
  return data
}

export function checkoutDestination(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === 'checkout.stripe.com' ? url.href : null }
  catch { return null }
}

export function paidIssueMetadata(record) {
  if (!record || !/^issue-[a-z0-9-]+$/.test(record.id) || record.status !== 'published'
    || !Number.isInteger(record.price_jpy) || record.price_jpy <= 0 || !Number.isInteger(record.issue_number)) return null
  const date = record.published_at ? new Date(record.published_at) : null
  return {
    slug: record.id, issueNumber: `ISSUE ${String(record.issue_number).padStart(2, '0')}`,
    title: record.title, subtitle: record.subtitle ?? '', publicationStatus: 'published',
    releaseDate: date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0,10) : '',
    releaseDateLabel: date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('ja-JP') : '公開中',
    priceLabel: `${record.price_jpy.toLocaleString('ja-JP')}円（税込）`, accessLabel: '購入した会員アカウントで閲覧',
    statusLabel: '公開中', description: record.subtitle ?? '購入した号は、このアカウントで閲覧できます。',
    readerPath: `/issues/${record.id}/`, coverImage: null,
  }
}

const issueColumns = 'id,issue_number,title,subtitle,status,price_jpy,published_at'
export async function loadPaidIssueMetadata(client, slug) {
  if (!client || !/^issue-[a-z0-9-]+$/.test(slug)) return null
  const { data, error } = await client.from('issues').select(issueColumns).eq('id',slug).maybeSingle()
  if (error) throw error
  return paidIssueMetadata(data)
}

export async function loadPurchasedIssues(client, userId, now = Date.now()) {
  const { data: rights, error } = await client.from('entitlements').select('issue_id,expires_at').eq('user_id',userId).eq('status','active')
  if (error) throw error
  const ids = [...new Set((rights ?? []).filter(r => !r.expires_at || new Date(r.expires_at).getTime() > now).map(r => r.issue_id))]
  if (!ids.length) return []
  const result = await client.from('issues').select(issueColumns).in('id',ids)
  if (result.error) throw result.error
  return (result.data ?? []).map(paidIssueMetadata).filter(Boolean)
}
