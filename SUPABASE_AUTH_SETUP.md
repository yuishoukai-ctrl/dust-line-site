# DUSTLINE Web会員版 Supabase Auth設定

## 1. ローカル環境変数

`.env.example` をコピーして `.env.local` を作成し、Supabase DashboardのProject URLとAnon Keyを設定します。

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Anon Keyはブラウザ利用を前提とした公開キーです。Service Role KeyはWebサイトの環境変数へ入れないでください。

## 2. Supabase Auth URL設定

Supabase Dashboardの Authentication > URL Configuration で設定します。

Site URL:

```text
https://dustline.jp
```

Redirect URLs:

```text
https://dustline.jp/account/verify/
https://dustline.jp/account/reset-password/?recovery=1
http://localhost:5173/account/verify/
http://localhost:5173/account/reset-password/?recovery=1
```

## 3. Auth設定

- Email provider: ON
- Confirm email: ON
- Minimum password length: 12
- Secure email change: ON
- Allow new users to sign up: ON

公開前に送信者名、確認メール本文、パスワード再設定メール本文をDUSTLINE表記へ変更します。

## 4. 仮公開中の創刊号

表示内容と説明は `src/member-content.js` で管理しています。Supabase Storageの `magazines` private bucketから、ログインユーザーの権限をRLSで確認した署名URLを発行します。Web配布用のPDFを `public` 配下へ置かないでください。

仮PDFのStorage上の配置先:

```text
magazines/issue-01/dust-line-issue-01-sample.pdf
```

既存DB、RLS、バケットに対する非破壊の設定差分:

```text
supabase/migrations/20260815090000_membership_reader.sql
```

署名URLはブラウザからSupabase Storageへ直接要求します。`storage.objects` のRLSが、ログイン状態・号の公開状態・購入権限を判定します。Service RoleキーはWebへ置きません。

## 5. 確認手順

1. `npm run dev` を起動します。
2. `/account/signup/` で別名メールアドレスを登録します。
3. 確認メールに記載された6桁コードを `/account/verify/` へ入力します。
4. `/library/` に創刊号が表示されることを確認します。
5. `/issues/issue-01/` で仮公開PDFが表示されることを確認します。
6. ログアウト後、同URLがログイン要求になることを確認します。
