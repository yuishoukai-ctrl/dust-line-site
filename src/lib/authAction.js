const fallbackMessages = {
  signup: '登録を完了できませんでした。入力内容を確認し、時間を置いて再度お試しください。確認メールが届いている場合は、6桁コードの入力へ進めます。',
  verify: '認証コードを確認できませんでした。最新の確認メールに記載された6桁コードを入力してください。',
  resend: '確認メールを再送できませんでした。接続状況を確認し、時間を置いて再度お試しください。',
}

export const getAuthErrorMessage = (action, error) => {
  const code = error?.code
  const status = error?.status
  if (code === 'client_response_timeout') {
    return '通信の応答待ちが長引いたため、処理結果を確認できませんでした。確認メールが届いていれば6桁コードを入力してください。届かない場合は、この画面を開き直してお試しください。'
  }
  if (status === 429 || code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') {
    return '操作回数が上限に達しました。時間を置いて再度お試しください。確認メールが届いている場合は、6桁コードの入力へ進めます。'
  }
  if (status >= 500) {
    if (action === 'resend') return '現在、確認メールの再送を完了できません。時間を置いて再度お試しください。'
    return action === 'signup'
      ? '現在、登録処理を完了できません。時間を置いて再度お試しください。確認メールが届いている場合は、6桁コードの入力へ進めます。'
      : '現在、メール確認を完了できません。時間を置いて再度お試しください。'
  }
  if (error?.name === 'AuthRetryableFetchError' || error?.name === 'AbortError' || code === 'request_timeout') {
    return '通信を確認できませんでした。接続状況を確認し、もう一度お試しください。確認メールが届いている場合は、6桁コードの入力へ進めます。'
  }
  if (code === 'email_address_invalid') return 'メールアドレスの入力内容を確認してください。'
  if (action === 'signup' && code === 'weak_password') return 'パスワードは12文字以上で、推測されにくいものを入力してください。'
  if (action === 'verify' && code === 'otp_expired') return '認証コードが無効か、有効期限を過ぎています。最新の確認メールに記載された6桁コードを入力するか、確認メールを再送してください。'
  return fallbackMessages[action]
}

export const runAuthAction = async ({ action, request, onSuccess, setSubmitting, setErrorMessage, timeoutMs = 30_000 }) => {
  setSubmitting(true)
  let timeoutId
  try {
    const timeout = new Promise((_resolve, reject) => {
      timeoutId = setTimeout(() => {
        const error = new Error('Auth response deadline exceeded')
        error.code = 'client_response_timeout'
        reject(error)
      }, timeoutMs)
    })
    const result = await Promise.race([request(), timeout])
    clearTimeout(timeoutId)
    if (result.error) {
      setErrorMessage(getAuthErrorMessage(action, result.error))
      return false
    }
    await onSuccess(result)
    return true
  } catch (error) {
    setErrorMessage(getAuthErrorMessage(action, error))
    return false
  } finally {
    clearTimeout(timeoutId)
    setSubmitting(false)
  }
}
