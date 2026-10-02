const fallbackMessages = {
  signup: '登録を完了できませんでした。入力内容を確認し、時間を置いて再度お試しください。確認メールが届いている場合は、6桁コードの入力へ進めます。',
  verify: '認証コードを確認できませんでした。最新の確認メールに記載された6桁コードを入力してください。',
}

export const getAuthErrorMessage = (action, error) => {
  const code = error?.code
  const status = error?.status
  if (status === 429 || code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') {
    return '操作回数が上限に達しました。時間を置いて再度お試しください。確認メールが届いている場合は、6桁コードの入力へ進めます。'
  }
  if (status >= 500) {
    return action === 'signup'
      ? '現在、登録処理を完了できません。時間を置いて再度お試しください。確認メールが届いている場合は、6桁コードの入力へ進めます。'
      : '現在、メール確認を完了できません。時間を置いて再度お試しください。'
  }
  if (error?.name === 'AuthRetryableFetchError' || error?.name === 'AbortError' || code === 'request_timeout') {
    return '通信を確認できませんでした。接続状況を確認し、もう一度お試しください。確認メールが届いている場合は、6桁コードの入力へ進めます。'
  }
  if (code === 'email_address_invalid') return 'メールアドレスの入力内容を確認してください。'
  if (action === 'signup' && code === 'weak_password') return 'パスワードは12文字以上で、推測されにくいものを入力してください。'
  if (action === 'verify' && code === 'otp_expired') return '認証コードが無効か、有効期限を過ぎています。最新の確認メールに記載された6桁コードを入力してください。'
  return fallbackMessages[action]
}

export const runAuthAction = async ({ action, request, onSuccess, setSubmitting, setErrorMessage }) => {
  setSubmitting(true)
  try {
    const result = await request()
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
    setSubmitting(false)
  }
}
