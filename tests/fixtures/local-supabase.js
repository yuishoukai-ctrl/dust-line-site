// Imported only by tests/local-preview.mjs. No production services or credentials.
const key = 'dustline-local-qa-session'
const user = () => JSON.parse(sessionStorage.getItem(key) || 'null')
const session = () => user() ? { user: user() } : null
let signedCount = 0
export const isSupabaseConfigured = true
export const supabase = {
  auth: {
    async getSession() { return { data: { session: session() } } },
    onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } } },
    async getUser() {
      return { data: { user: user()?.email.startsWith('expired@') ? null : user() } }
    },
    async signInWithPassword({ email }) {
      const account = { id: 'local-qa-reader', email, email_confirmed_at: email.startsWith('unconfirmed@') ? null : '2026-09-18T00:00:00Z' }
      sessionStorage.setItem(key, JSON.stringify(account))
      return { data: { session: { user: account } } }
    },
    async verifyOtp() {
      const account = { ...user(), email_confirmed_at: '2026-09-18T00:00:00Z' }
      sessionStorage.setItem(key, JSON.stringify(account))
      return { data: { session: { user: account } } }
    },
    async signOut() { sessionStorage.removeItem(key); return {} },
  },
  from(table) {
    const issue = slug => ({ id: slug, issue_number: slug === 'issue-02' ? 2 : 1, title: `DUST LINE ${slug === 'issue-02' ? '第2号（ローカル検証）' : '創刊号'}`, subtitle: '架空の購入済み号・本番データではありません', price_jpy: slug === 'issue-02' ? 1480 : 0, published_at: '2026-10-06T00:00:00Z', status: 'published', storage_path: `${slug}/local-only.pdf` })
    if (table === 'entitlements') return { select() { return { eq(_field, owner) { return {
      async eq() { return { data: owner === user()?.id ? [{ issue_id: 'issue-02', expires_at: null }] : [], error: null } },
    } } } } }
    return { select() { return {
      eq(_field, slug) { return { async maybeSingle() { return { data: issue(slug), error: null } } } },
      async in(_field, slugs) { return { data: slugs.map(issue), error: null } },
    } } }
  },
  storage: { from() { return {
    async createSignedUrl() {
      if (user()?.email.startsWith('denied@')) return { data: null, error: new Error('Local simulated storage denial') }
      signedCount++
      if (user()?.email.startsWith('broken@')) return { data: { signedUrl: `${location.origin}/_qa/missing.pdf?attempt=${signedCount}` } }
      return { data: { signedUrl: `${location.origin}/_qa/magazine.pdf?attempt=${signedCount}` } }
    },
  } } },
}
