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
  from() { return { select() { return { eq(_field, slug) { return {
    async maybeSingle() {
      return { data: { id: slug, status: 'published', storage_path: `${slug}/local-only.pdf` } }
    },
  } } } } } },
  storage: { from() { return {
    async createSignedUrl() {
      if (user()?.email.startsWith('denied@')) return { data: null, error: new Error('Local simulated storage denial') }
      signedCount++
      if (user()?.email.startsWith('broken@')) return { data: { signedUrl: `${location.origin}/_qa/missing.pdf?attempt=${signedCount}` } }
      return { data: { signedUrl: `${location.origin}/_qa/magazine.pdf?attempt=${signedCount}` } }
    },
  } } },
}
