import { useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'
import { provisionalIssue } from './member-content'
import './member-pages.css'

const pageTitles = {
  signup: '無料会員登録｜DUST LINE',
  login: '会員ログイン｜DUST LINE',
  verify: 'メール確認｜DUST LINE',
  reset: 'パスワード再設定｜DUST LINE',
  library: 'マイライブラリ｜DUST LINE',
  issue: 'DUST LINE 創刊号｜会員閲覧',
}

const safeLocalReturnPath = (candidate, fallback = '/library/') => {
  if (!candidate) return fallback
  try {
    const parsed = new URL(candidate, window.location.origin)
    if (parsed.origin !== window.location.origin) return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  )
}

function useAuthSession() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let active = true
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (!error) setSession(data.session ?? null)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  return { session, loading }
}

function SetupNotice() {
  return (
    <section className="member-panel member-panel--notice" aria-labelledby="member-setup-title">
      <p className="member-kicker">MEMBER ACCESS / PREPARING</p>
      <h2 id="member-setup-title">会員ページは、現在接続準備中です。</h2>
      <p>画面と認証導線は完成しています。Supabaseの接続設定後に無料会員登録を開始します。</p>
      {import.meta.env.DEV && (
        <p className="member-dev-note">開発メモ：`.env.local` に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定してください。</p>
      )}
      <a className="member-text-link" href="/offroad-bike-magazine/">DUST LINEについて見る <Arrow /></a>
    </section>
  )
}

function LoadingPanel() {
  return (
    <section className="member-panel member-panel--loading" aria-live="polite">
      <span className="member-spinner" aria-hidden="true" />
      <p>会員情報を確認しています。</p>
    </section>
  )
}

function AuthRequired({ returnPath }) {
  const loginHref = `/account/login/?returnTo=${encodeURIComponent(returnPath)}`
  return (
    <section className="member-panel member-panel--gate" aria-labelledby="member-gate-title">
      <p className="member-kicker">MEMBERS ONLY</p>
      <h2 id="member-gate-title">創刊号を無料で読む</h2>
      <p>創刊号は無料です。初めての方は会員登録後、確認メールに記載された6桁コードを入力してください。</p>
      <div className="member-actions">
        <a className="member-button member-button--accent" href="/account/signup/">無料会員登録して読む <Arrow /></a>
        <a className="member-button member-button--outline" href={loginHref}>登録済みの方はログイン</a>
      </div>
    </section>
  )
}

function SignupPage({ session }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (session) {
    return (
      <section className="member-panel">
        <p className="member-kicker">ACCOUNT READY</p>
        <h2>すでにログインしています。</h2>
        <p>マイライブラリから仮公開中の創刊号を開けます。</p>
        <a className="member-button member-button--accent" href="/library/">マイライブラリへ <Arrow /></a>
      </section>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!privacyAccepted) {
      setErrorMessage('プライバシーポリシーを確認してください。')
      return
    }
    if (password.length < 12) {
      setErrorMessage('パスワードは12文字以上で入力してください。')
      return
    }
    if (password !== passwordConfirm) {
      setErrorMessage('確認用パスワードが一致しません。')
      return
    }

    setSubmitting(true)
    const redirectTo = `${window.location.origin}/account/verify/`
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: redirectTo },
    })
    setSubmitting(false)

    if (error) {
      setErrorMessage('登録を完了できませんでした。入力内容を確認し、時間を置いて再度お試しください。')
      return
    }

    setPassword('')
    setPasswordConfirm('')
    if (data.session) {
      window.location.assign('/library/')
      return
    }
    window.location.assign(`/account/verify/?email=${encodeURIComponent(email.trim())}`)
  }

  return (
    <section className="member-panel" aria-labelledby="signup-title">
      <p className="member-kicker">CREATE YOUR ACCOUNT</p>
      <h2 id="signup-title">無料会員登録</h2>
      <p>創刊号は無料でお読みいただけます。現在は校了前のため、2ページの仮公開版を掲載しています。</p>
      <p className="member-reassurance">登録無料 / カード情報不要 / メール確認後すぐ読める</p>
      <ol className="member-steps" aria-label="会員登録の手順">
        <li className="is-current"><span>1/2</span> 会員情報</li>
        <li><span>2/2</span> メール確認</li>
      </ol>

      <form className="member-form" onSubmit={handleSubmit} noValidate>
        <label>
          <span>メールアドレス</span>
          <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <div className="member-field">
          <label htmlFor="signup-password">パスワード <small>12文字以上</small></label>
          <div className="member-password-input">
            <input id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength="12" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button type="button" className="member-password-toggle" aria-controls="signup-password" aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
              {showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
            </button>
          </div>
        </div>
        <div className="member-field">
          <label htmlFor="signup-password-confirm">パスワード確認</label>
          <div className="member-password-input">
            <input id="signup-password-confirm" type={showPasswordConfirm ? 'text' : 'password'} autoComplete="new-password" minLength="12" value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} required />
            <button type="button" className="member-password-toggle" aria-controls="signup-password-confirm" aria-pressed={showPasswordConfirm} onClick={() => setShowPasswordConfirm((visible) => !visible)}>
              {showPasswordConfirm ? '確認用パスワードを隠す' : '確認用パスワードを表示'}
            </button>
          </div>
        </div>
        <label className="member-check">
          <input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} />
          <span><a href="/privacy/" target="_blank" rel="noreferrer">プライバシーポリシー</a>を確認しました</span>
        </label>
        {errorMessage && <p className="member-message member-message--error" role="alert">{errorMessage}</p>}
        <button className="member-button member-button--accent" type="submit" disabled={submitting}>
          {submitting ? '登録しています…' : '確認メールを受け取る'} {!submitting && <Arrow />}
        </button>
      </form>

      <p className="member-switch">登録済みの方は <a href="/account/login/">会員ログイン</a></p>
    </section>
  )
}

function LoginPage({ session }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const returnTo = useMemo(() => {
    const requested = new URLSearchParams(window.location.search).get('returnTo')
    return safeLocalReturnPath(requested)
  }, [])

  if (session) {
    return (
      <section className="member-panel">
        <p className="member-kicker">SIGNED IN</p>
        <h2>ログイン済みです。</h2>
        <a className="member-button member-button--accent" href={returnTo}>続きを読む <Arrow /></a>
      </section>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setSubmitting(false)
    if (error) {
      setErrorMessage('メールアドレスまたはパスワードを確認してください。メール確認が済んでいない場合は、確認画面で6桁の認証コードを入力してください。')
      return
    }
    window.location.assign(returnTo)
  }

  return (
    <section className="member-panel" aria-labelledby="login-title">
      <p className="member-kicker">WELCOME BACK</p>
      <h2 id="login-title">会員ログイン</h2>
      <p>登録したメールアドレスとパスワードを入力してください。</p>
      <form className="member-form" onSubmit={handleSubmit}>
        <label>
          <span>メールアドレス</span>
          <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          <span>パスワード</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        {errorMessage && <p className="member-message member-message--error" role="alert">{errorMessage}</p>}
        <button className="member-button member-button--accent" type="submit" disabled={submitting}>
          {submitting ? '確認しています…' : 'ログイン'} {!submitting && <Arrow />}
        </button>
      </form>
      <div className="member-switch member-switch--stack">
        <a href="/account/reset-password/">パスワードを忘れた方</a>
        <span>初めての方は <a href="/account/signup/">無料会員登録</a></span>
      </div>
    </section>
  )
}

function VerifyPage({ session }) {
  const [email, setEmail] = useState(() => new URLSearchParams(window.location.search).get('email') || '')
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleOtpSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!/^\d{6}$/.test(otp.trim())) {
      setErrorMessage('認証コードは6桁の数字で入力してください。')
      return
    }

    setSubmitting(true)
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: 'signup',
    })
    setSubmitting(false)

    if (error) {
      setErrorMessage('認証コードを確認できませんでした。最新のメールに記載されたコードを入力してください。')
      return
    }

    window.location.assign('/library/')
  }

  return (
    <section className="member-panel" aria-labelledby="verify-title">
      <p className="member-kicker">VERIFY YOUR EMAIL</p>
      <h2 id="verify-title">メール確認</h2>
      {session ? (
        <>
          <p className="member-message member-message--success">メール確認が完了し、ログインしました。</p>
          <a className="member-button member-button--accent" href="/library/">創刊号を読む <Arrow /></a>
        </>
      ) : (
        <form className="member-form" onSubmit={handleOtpSubmit} noValidate>
          <p>登録メールに記載された6桁の認証コードを入力してください。</p>
          <label>
            <span>メールアドレス</span>
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            <span>6桁の認証コード</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength="6"
              pattern="[0-9]{6}"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
          </label>
          {errorMessage && <p className="member-message member-message--error" role="alert">{errorMessage}</p>}
          <button className="member-button member-button--accent" type="submit" disabled={submitting || !email.trim()}>
            {submitting ? '確認しています…' : '登録を完了する'} {!submitting && <Arrow />}
          </button>
          <a className="member-button member-button--outline" href="/account/signup/">登録画面へ戻る</a>
        </form>
      )}
    </section>
  )
}

function ResetPasswordPage({ session }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const recoveryMode = session && new URLSearchParams(window.location.search).get('recovery') === '1'

  const requestReset = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage('')
    const redirectTo = `${window.location.origin}/account/reset-password/?recovery=1`
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
    setSubmitting(false)
    if (error) {
      setErrorMessage('再設定メールを送信できませんでした。時間を置いて再度お試しください。')
      return
    }
    setMessage('該当するアカウントがある場合、パスワード再設定メールを送信しました。')
  }

  const updatePassword = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    if (password.length < 12) {
      setErrorMessage('新しいパスワードは12文字以上で入力してください。')
      return
    }
    if (password !== passwordConfirm) {
      setErrorMessage('確認用パスワードが一致しません。')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (error) {
      setErrorMessage('パスワードを更新できませんでした。再設定メールからもう一度お試しください。')
      return
    }
    setMessage('パスワードを更新しました。')
    setPassword('')
    setPasswordConfirm('')
  }

  return (
    <section className="member-panel" aria-labelledby="reset-title">
      <p className="member-kicker">RESET PASSWORD</p>
      <h2 id="reset-title">パスワード再設定</h2>
      {recoveryMode ? (
        <form className="member-form" onSubmit={updatePassword}>
          <label>
            <span>新しいパスワード <small>12文字以上</small></span>
            <input type="password" autoComplete="new-password" minLength="12" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <label>
            <span>新しいパスワード確認</span>
            <input type="password" autoComplete="new-password" minLength="12" value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} required />
          </label>
          {errorMessage && <p className="member-message member-message--error" role="alert">{errorMessage}</p>}
          {message && <p className="member-message member-message--success" role="status">{message}</p>}
          <button className="member-button member-button--accent" type="submit" disabled={submitting}>{submitting ? '更新しています…' : 'パスワードを更新する'}</button>
        </form>
      ) : (
        <form className="member-form" onSubmit={requestReset}>
          <p>登録したメールアドレスへ再設定リンクを送信します。</p>
          <label>
            <span>メールアドレス</span>
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          {errorMessage && <p className="member-message member-message--error" role="alert">{errorMessage}</p>}
          {message && <p className="member-message member-message--success" role="status">{message}</p>}
          <button className="member-button member-button--accent" type="submit" disabled={submitting}>{submitting ? '送信しています…' : '再設定メールを送る'}</button>
        </form>
      )}
      <p className="member-switch"><a href="/account/login/">ログイン画面へ戻る</a></p>
    </section>
  )
}

function LibraryPage({ session, assetPath }) {
  const [signingOut, setSigningOut] = useState(false)
  if (!session) return <AuthRequired returnPath="/library/" />

  const signOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    window.location.assign('/account/login/')
  }

  return (
    <section className="member-library" aria-labelledby="library-title">
      <header className="member-library__header">
        <div>
          <p className="member-kicker">MEMBER LIBRARY</p>
          <h2 id="library-title">MY LIBRARY</h2>
          <p>{session.user.email}</p>
        </div>
        <button className="member-signout" type="button" onClick={signOut} disabled={signingOut}>{signingOut ? 'ログアウト中…' : 'ログアウト'}</button>
      </header>

      <article className="member-issue-card">
        <figure>
          <img src={assetPath(provisionalIssue.coverImage)} alt="DUST LINE創刊号の表紙" />
          <figcaption>{provisionalIssue.statusLabel}</figcaption>
        </figure>
        <div className="member-issue-card__copy">
          <p className="member-kicker">{provisionalIssue.issueNumber} / FREE</p>
          <h3>{provisionalIssue.title}</h3>
          <dl>
            <div><dt>公開予定</dt><dd>{provisionalIssue.releaseDate}</dd></div>
            <div><dt>価格</dt><dd>{provisionalIssue.priceLabel}</dd></div>
            <div><dt>現在</dt><dd>2ページ試し読み</dd></div>
          </dl>
          <p>{provisionalIssue.description}</p>
          <a className="member-button member-button--accent" href="/issues/issue-01/">仮公開版を読む <Arrow /></a>
        </div>
      </article>
    </section>
  )
}

function IssueReaderPage({ session, assetPath }) {
  const [readerUrl, setReaderUrl] = useState('')
  const [readerLoading, setReaderLoading] = useState(true)
  const [readerError, setReaderError] = useState('')

  useEffect(() => {
    if (!session) return undefined

    if (!supabase) {
      setReaderError('閲覧設定が完了していません。管理者へお問い合わせください。')
      setReaderLoading(false)
      return undefined
    }

    let active = true
    setReaderLoading(true)
    setReaderError('')
    supabase
      .from('issues')
      .select('storage_path')
      .eq('id', provisionalIssue.slug)
      .single()
      .then(async ({ data: issue, error: issueError }) => {
        if (issueError || !issue?.storage_path) {
          throw issueError || new Error('Storage path is not configured.')
        }

        return supabase.storage
          .from('magazines')
          .createSignedUrl(issue.storage_path, 60 * 10)
      })
      .then(({ data, error }) => {
      if (!active) return
      if (error || !data?.signedUrl) {
        setReaderError('誌面を読み込めませんでした。時間を置いて再度お試しください。')
        setReaderLoading(false)
        return
      }
      setReaderUrl(data.signedUrl)
      setReaderLoading(false)
      })
      .catch(() => {
        if (!active) return
        setReaderError('誌面を読み込めませんでした。時間を置いて再度お試しください。')
        setReaderLoading(false)
      })

    return () => { active = false }
  }, [session])

  if (!session) return <AuthRequired returnPath="/issues/issue-01/" />

  const embeddedReaderUrl = readerUrl ? `${readerUrl}#view=FitH&toolbar=1&navpanes=0` : ''
  return (
    <section className="member-reader" aria-labelledby="reader-title">
      <header className="member-reader__header">
        <div>
          <p className="member-kicker">{provisionalIssue.issueNumber} / PROVISIONAL</p>
          <h2 id="reader-title">{provisionalIssue.title}</h2>
          <p>{provisionalIssue.description}</p>
        </div>
        <a className="member-button member-button--outline" href="/library/">ライブラリへ戻る</a>
      </header>

      <div className="member-reader__notice" role="note">
        <strong>現在は仮公開です。</strong>
        <span>記事追加後、ここを完成版へ差し替えます。誌面は会員確認後に発行する短時間URLで配信しています。</span>
      </div>

      {readerLoading && <LoadingPanel />}
      {readerError && <p className="member-message member-message--error" role="alert">{readerError}</p>}
      {embeddedReaderUrl && (
        <>
          <div className="member-reader__frame">
            <iframe src={embeddedReaderUrl} title="DUST LINE創刊号 2ページ試し読み版" />
          </div>
          <p className="member-reader__fallback">
            誌面が表示されない場合は、<a href={readerUrl} target="_blank" rel="noreferrer">仮公開PDFを新しいタブで開く</a>ことができます。
          </p>
        </>
      )}
    </section>
  )
}

export default function MemberPage({ view, assetPath }) {
  const { session, loading } = useAuthSession()

  useEffect(() => {
    const previousTitle = document.title
    document.title = pageTitles[view] ?? '会員ページ｜DUST LINE'
    window.scrollTo(0, 0)
    return () => { document.title = previousTitle }
  }, [view])

  let content
  if (!isSupabaseConfigured) content = <SetupNotice />
  else if (loading) content = <LoadingPanel />
  else if (view === 'signup') content = <SignupPage session={session} />
  else if (view === 'login') content = <LoginPage session={session} />
  else if (view === 'verify') content = <VerifyPage session={session} />
  else if (view === 'reset') content = <ResetPasswordPage session={session} />
  else if (view === 'library') content = <LibraryPage session={session} assetPath={assetPath} />
  else content = <IssueReaderPage session={session} assetPath={assetPath} />

  const compactHero = ['signup', 'login', 'verify', 'reset', 'library'].includes(view)

  return (
    <main className="member-page" id="main">
      <header className={`member-hero${compactHero ? ' member-hero--compact' : ''}`}>
        <div className="member-hero__texture" aria-hidden="true" />
        <div className="member-hero__copy">
          <p>DUST LINE / DIGITAL READER</p>
          <h1>READ BEYOND<br /><span>THE PAVEMENT.</span></h1>
        </div>
        <div className="member-hero__index" aria-hidden="true"><span>DL</span><span>001</span><span>WEB</span></div>
      </header>
      <div className="member-page__body">{content}</div>
    </main>
  )
}
