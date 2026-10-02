import { firstIssue } from './member-content'
import { authPath } from './lib/member-navigation'

export default function IssueReadNote() {
  return <p className="issue-read-note">
    無料会員登録が必要です。カード不要。
    <a href={authPath('/account/login/', firstIssue.readerPath)}>登録済みの方はログイン</a>
  </p>
}
