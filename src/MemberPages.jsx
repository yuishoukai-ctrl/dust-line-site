import { useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'
import { trackAnalyticsEvent } from './lib/analytics'
import {
  clearVerificationEmail,
  getVerificationEmail,
  storeVerificationEmail,
} from './lib/verificationEmail'
import {
  journal, issues, firstIssue, getIssue, canReadIssue,
  getIssueDateLabel, getIssueReadLabel, getIssueEditionLabel, getIssueDescription,
} from './member-content'
import { safeLocalReturnPath, authPath } from './lib/member-navigation'
import { loadIssuePdf } from './lib/issue-reader'
import PdfMagazineViewer from './PdfMagazineViewer'
import './member-pages.css'

const pageTitles = {
  signup: '無料会員登録｜DUST LINE',
  login: '会員ログイン｜DUST LINE',
  verify: 'メール確認｜DUST LINE',
  reset: 'パスワード再設定｜DUST LINE',
  library: 'マイライブラリ｜DUST LINE',
  issue: 'DUST LINE 創刊号｜会員閲覧',
}

const useReturnTo = () => useMemo(() => safeLocalReturnPath(
  new URLSearchParams(window.location.search).get('returnTo'), window.location.origin,
), [])

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
    }).catch(() => {
      if (active) setLoading(false)
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
      <p>ただいま会員ページをご利用いただけません。時間を置いて、もう一度お試しください。</p>
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

function AuthRequired({ returnPath, issue }) {
  const loginHref = authPath('/account/login/', returnPath)
  useEffect(() => {
    trackAnalyticsEvent('library_guest_view')
  }, [])

  return (
    <section className="member-panel member-panel--gate" aria-labelledby="member-gate-title">
      <p className="member-kicker">MEMBERS ONLY</p>
      <h2 id="member-gate-title">{issue ? `${issue.issueNumber}を読む` : 'マイライブラリ'}</h2>
      <p>ログインして誌面を開きます。初めての方は会員登録後、確認メールに記載された6桁コードを入力してください。</p>
      {issue && <p>{getIssueDescription(issue)} {issue.accessLabel}。</p>}
      <div className="member-actions">
        <a className="member-button member-button--accent" href={authPath('/account/signup/', returnPath)} onClick={() => trackAnalyticsEvent('signup_cta_click')}>無料会員登録 <Arrow /></a>
        <a className="member-button member-button--outline" href={loginHref}>登録済みの方はログイン</a>
      </div>
      <a className="member-text-link" href={`${journal.path}#issues`}>巻号一覧を見る <Arrow /></a>
    </section>
  )
}

function SignupPage({ session }) {
  const returnTo = useReturnTo()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!session) trackAnalyticsEvent('signup_view')
  }, [session])

  if (session) {
    return (
      <section className="member-panel">
        <p className="member-kicker">ACCOUNT READY</p>
        <h2>すでにログインしています。</h2>
        <p>選んだ誌面、またはマイライブラリへ進めます。</p>
        <a className="member-button member-button--accent" href={returnTo}>続きを読む <Arrow /></a>
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

    trackAnalyticsEvent('signup_submit')
    setSubmitting(true)
    const verifyPath = authPath('/account/verify/', returnTo)
    const redirectTo = `${window.location.origin}${verifyPath}`
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
      trackAnalyticsEvent('signup_verify_success')
      window.location.assign(returnTo)
      return
    }
    trackAnalyticsEvent('signup_code_sent')
    storeVerificationEmail(email)
    window.location.assign(verifyPath)
  }

  return (
    <section className="member-panel" aria-labelledby="signup-title">
      <p className="member-kicker">CREATE YOUR ACCOUNT</p>
      <h2 id="signup-title">無料会員登録</h2>
      <p>{getIssueDescription(firstIssue)}</p>
      <p className="member-reassurance">登録無料 / カード情報不要 / 創刊号無料</p>
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

      <p className="member-switch">登録済みの方は <a href={authPath('/account/login/', returnTo)}>会員ログイン</a></p>
    </section>
  )
}

function LoginPage({ session }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const returnTo = useReturnTo()

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
        <span>初めての方は <a href={authPath('/account/signup/', returnTo)} onClick={() => trackAnalyticsEvent('signup_cta_click')}>無料会員登録</a></span>
      </div>
    </section>
  )
}

function VerifyPage({ session }) {
  const returnTo = useReturnTo()
  const [email, setEmail] = useState(getVerificationEmail)
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

    clearVerificationEmail()
    trackAnalyticsEvent('signup_verify_success')
    window.location.assign(returnTo)
  }

  return (
    <section className="member-panel" aria-labelledby="verify-title">
      <p className="member-kicker">VERIFY YOUR EMAIL</p>
      <h2 id="verify-title">メール確認</h2>
      {session?.user?.email_confirmed_at ? (
        <>
          <p className="member-message member-message--success">メール確認が完了し、ログインしました。</p>
          <a className="member-button member-button--accent" href={returnTo}>続きを読む <Arrow /></a>
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
          <a className="member-button member-button--outline" href={authPath('/account/signup/', returnTo)}>登録画面へ戻る</a>
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
          <a className="member-text-link" href={`${journal.path}#issues`}>巻号一覧・収録内容を見る</a>
        </div>
        <button className="member-signout" type="button" onClick={signOut} disabled={signingOut}>{signingOut ? 'ログアウト中…' : 'ログアウト'}</button>
      </header>
      {issues.map((issue) => (
        <article className="member-issue-card" key={issue.slug}>
          <figure>
            <img src={assetPath(issue.coverImage)} alt={`${issue.title}の表紙`} />
            <figcaption>{issue.publicationStatus === 'published' ? '公開中' : issue.statusLabel}</figcaption>
          </figure>
          <div className="member-issue-card__copy">
            <p className="member-kicker">{issue.issueNumber} / {issue.priceLabel}</p>
            <h3>{issue.title}</h3>
            <dl>
              <div><dt>{getIssueDateLabel(issue)}</dt><dd><time dateTime={issue.releaseDate}>{issue.releaseDateLabel}</time></dd></div>
              <div><dt>価格</dt><dd>{issue.priceLabel}</dd></div>
              <div><dt>閲覧</dt><dd>{issue.accessLabel}</dd></div>
            </dl>
            <p>{getIssueDescription(issue)}</p>
            {canReadIssue(issue)
              ? <a className="member-button member-button--accent" href={issue.readerPath}>{getIssueReadLabel(issue)} <Arrow /></a>
              : <p>本文の公開準備中です。</p>}
          </div>
        </article>
      ))}
    </section>
  )
}

function IssueNotFound() {
  return (
    <section className="member-panel" aria-labelledby="issue-not-found">
      <p className="member-kicker">ISSUE NOT FOUND</p>
      <h2 id="issue-not-found">この号は見つかりませんでした。</h2>
      <p>巻号一覧から、お探しの号を選んでください。</p>
      <a className="member-button member-button--accent" href={`${journal.path}#issues`}>巻号一覧へ <Arrow /></a>
    </section>
  )
}

const readerMessages = {
  AUTH_REQUIRED: 'ログインの有効期限が切れているか、会員情報を確認できませんでした。',
  EMAIL_UNCONFIRMED: 'メールアドレスの確認を完了してから、誌面を開いてください。',
  NO_ACCESS: 'この号の閲覧権限がないか、誌面の配信準備中です。',
  NOT_READY: 'この号の本文は公開準備中です。',
  UNAVAILABLE: '誌面を読み込めませんでした。時間を置いて再読み込みしてください。',
}

function IssueReaderPage({ session, issue }) {
  const [readerUrl, setReaderUrl] = useState('')
  const [readerLoading, setReaderLoading] = useState(true)
  const [readerError, setReaderError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [openingPdf, setOpeningPdf] = useState(false)

  useEffect(() => {
    if (!session?.user?.id || !canReadIssue(issue)) return undefined
    let active = true
    setReaderUrl('')
    setReaderLoading(true)
    setReaderError('')
    loadIssuePdf(supabase, issue)
      .then((url) => { if (active) setReaderUrl(url) })
      .catch((error) => { if (active) setReaderError(Object.hasOwn(readerMessages, error?.code) ? error.code : 'UNAVAILABLE') })
      .finally(() => { if (active) setReaderLoading(false) })
    return () => { active = false }
  }, [session?.user?.id, issue, attempt])

  if (!issue) return <IssueNotFound />
  if (!canReadIssue(issue)) return (
    <section className="member-panel">
      <h2>{issue.title}</h2>
      <p>本文の公開準備中です。</p>
      <a className="member-text-link" href={`${journal.path}#issues`}>巻号一覧へ <Arrow /></a>
    </section>
  )
  if (!session) return <AuthRequired returnPath={issue.readerPath} issue={issue} />

  const editionLabel = getIssueEditionLabel(issue)
  const loginAgain = async () => {
    await supabase.auth.signOut({ scope: 'local' })
    window.location.assign(authPath('/account/login/', issue.readerPath))
  }
  const openPdf = async () => {
    setOpeningPdf(true)
    setReaderError('')
    try {
      // Generate a fresh URL on every click. Same-tab navigation is not a popup.
      const url = await loadIssuePdf(supabase, issue)
      window.location.assign(url)
    } catch (error) {
      setReaderError(Object.hasOwn(readerMessages, error?.code) ? error.code : 'UNAVAILABLE')
    } finally {
      setOpeningPdf(false)
    }
  }
  return (
    <section className="member-reader" aria-labelledby="reader-title">
      <header className="member-reader__header">
        <div>
          <p className="member-kicker">{issue.issueNumber} / {editionLabel}</p>
          <h2 id="reader-title">{issue.title}</h2>
          <p>{getIssueDescription(issue)}</p>
        </div>
        <a className="member-button member-button--outline" href="/library/">ライブラリへ戻る</a>
      </header>
      {issue.publicationStatus !== 'published' && (
        <div className="member-reader__notice" role="note">
          <strong>{editionLabel}</strong>
          <span>本誌の公開予定は{issue.releaseDateLabel}です。</span>
        </div>
      )}
      {readerLoading && <LoadingPanel />}
      {readerError && (
        <div className="member-message member-message--error" role="alert">
          <p>{readerMessages[readerError]}</p>
          {readerError === 'AUTH_REQUIRED' && <button className="member-button member-button--outline" onClick={loginAgain}>ログインし直す</button>}
          {readerError === 'EMAIL_UNCONFIRMED' && <a className="member-button member-button--outline" href={authPath('/account/verify/', issue.readerPath)}>メール確認へ</a>}
          {readerError === 'NO_ACCESS' && <a className="member-text-link" href={`${journal.path}#issues`}>号の案内を確認する</a>}
        </div>
      )}
      {readerUrl && !readerLoading && (
        <>
          <PdfMagazineViewer url={readerUrl} title={`${issue.title} ${editionLabel}`} />
          <div className="member-reader__fallback">
            <button className="member-button member-button--outline" type="button" disabled={openingPdf} onClick={openPdf}>{openingPdf ? 'PDFを準備しています…' : 'PDFを直接開く'}</button>
            <p>X・LINE内でうまく読めない場合は、アプリのメニューからSafariまたはChromeでこのページを開いてください。</p>
          </div>
        </>
      )}
      {!readerLoading && (
        <div className="member-reader__reload">
          <button className="member-button member-button--outline" type="button" onClick={() => setAttempt((value) => value + 1)}>誌面を再読み込み</button>
          <p>時間を置いて開けなくなった場合も、ここから再読み込みできます。</p>
        </div>
      )}
    </section>
  )
}

export default function MemberPage({ view, assetPath, issueSlug }) {
  const issue = view === 'issue' ? getIssue(issueSlug) : null
  const { session, loading } = useAuthSession()

  useEffect(() => {
    const previousTitle = document.title
    document.title = view === 'issue'
      ? (issue ? `${issue.title}｜会員閲覧` : '号が見つかりません｜DUST LINE')
      : (pageTitles[view] ?? '会員ページ｜DUST LINE')
    window.scrollTo(0, 0)
    return () => { document.title = previousTitle }
  }, [view, issue])

  let content
  if (view === 'issue' && !issue) content = <IssueNotFound />
  else if (!isSupabaseConfigured) content = <SetupNotice />
  else if (loading) content = <LoadingPanel />
  else if (view === 'signup') content = <SignupPage session={session} />
  else if (view === 'login') content = <LoginPage session={session} />
  else if (view === 'verify') content = <VerifyPage session={session} />
  else if (view === 'reset') content = <ResetPasswordPage session={session} />
  else if (view === 'library') content = <LibraryPage session={session} assetPath={assetPath} />
  else content = <IssueReaderPage session={session} issue={issue} />

  const compactHero = ['signup', 'login', 'verify', 'reset', 'library'].includes(view)

  return (
    <main className="member-page" id="main">
      <header className={`member-hero${compactHero ? ' member-hero--compact' : ''}`}>
        <div className="member-hero__texture" aria-hidden="true" />
        <div className="member-hero__copy">
          <p>DUST LINE / DIGITAL READER</p>
          <h1>READ BEYOND<br /><span>THE PAVEMENT.</span></h1>
        </div>
        <div className="member-hero__index" aria-hidden="true"><span>DL</span><span>{issue?.issueNumber.replace('ISSUE ', '') ?? 'ALL'}</span><span>WEB</span></div>
      </header>
      <div className="member-page__body">{content}</div>
    </main>
  )
}
