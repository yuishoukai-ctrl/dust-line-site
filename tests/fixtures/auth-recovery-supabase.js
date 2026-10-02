// Imported only by tests/local-auth-preview.mjs. No credentials or service requests.
// Submitted addresses and passwords are deliberately never recorded.
const sessionKey = 'dustline-local-auth-qa-session'
const testUser = {
  id: 'local-auth-qa-reader',
  email: 'reader@example.invalid',
  email_confirmed_at: '2026-09-30T00:00:00Z',
}
const subscribers = new Set()
let currentSession = null

const settings = () => globalThis.window?.__DUSTLINE_AUTH_QA__ || {}
const record = (method, outcome) => {
  globalThis.window?.__DUSTLINE_AUTH_QA_EVENTS__?.push({ type: 'auth', method, outcome })
}
const readSession = () => {
  try {
    const saved = globalThis.window?.localStorage.getItem(sessionKey)
    if (saved === 'signed-in') currentSession = { user: { ...testUser } }
  } catch {}
  return currentSession
}
const setSession = (nextSession) => {
  currentSession = nextSession
  try {
    if (nextSession) globalThis.window?.localStorage.setItem(sessionKey, 'signed-in')
    else globalThis.window?.localStorage.removeItem(sessionKey)
  } catch {}
  for (const subscriber of subscribers) subscriber(nextSession ? 'SIGNED_IN' : 'SIGNED_OUT', nextSession)
}
const resultFor = (method, mode) => {
  record(method, mode)
  if (mode === 'throw') throw new Error(`LOCAL QA simulated ${method} exception`)
  if (mode === 'error') {
    return { data: { user: null, session: null }, error: new Error(`LOCAL QA simulated ${method} returned error`) }
  }
  return null
}

export const isSupabaseConfigured = true
export const supabase = {
  auth: {
    async getSession() { return { data: { session: readSession() }, error: null } },
    onAuthStateChange(callback) {
      subscribers.add(callback)
      return { data: { subscription: { unsubscribe() { subscribers.delete(callback) } } } }
    },
    async getUser() { return { data: { user: readSession()?.user || null }, error: null } },
    async signUp() {
      const mode = settings().qaSignup || 'success'
      const failure = resultFor('signUp', mode)
      if (failure) return failure
      if (mode === 'session') {
        const session = { user: { ...testUser } }
        setSession(session)
        return { data: { user: { ...testUser }, session }, error: null }
      }
      return { data: { user: { ...testUser, email_confirmed_at: null }, session: null }, error: null }
    },
    async verifyOtp() {
      const failure = resultFor('verifyOtp', settings().qaVerify || 'success')
      if (failure) return failure
      const session = { user: { ...testUser } }
      setSession(session)
      return { data: { user: { ...testUser }, session }, error: null }
    },
    async signInWithPassword() {
      record('signInWithPassword', 'success')
      const session = { user: { ...testUser } }
      setSession(session)
      return { data: { user: { ...testUser }, session }, error: null }
    },
    async signOut() {
      record('signOut', 'success')
      setSession(null)
      return { error: null }
    },
    async resetPasswordForEmail() {
      record('resetPasswordForEmail', 'success')
      return { data: {}, error: null }
    },
    async updateUser() {
      record('updateUser', 'success')
      return { data: { user: { ...testUser } }, error: null }
    },
  },
  from() {
    return {
      select() {
        return {
          eq(_field, slug) {
            const result = () => ({ data: { id: slug, status: 'published', storage_path: `${slug}/local-only.pdf` }, error: null })
            return { async single() { return result() }, async maybeSingle() { return result() } }
          },
        }
      },
    }
  },
  storage: {
    from() {
      return {
        async createSignedUrl() {
          record('createSignedUrl', 'error')
          return { data: null, error: new Error('LOCAL QA preview has no magazine PDF configured') }
        },
      }
    },
  },
}
