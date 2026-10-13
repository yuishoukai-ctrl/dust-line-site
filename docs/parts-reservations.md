# F450GS部品の無料仮予約

## 今回の実装

- 対象：ラジエーターガード（12,800円）、リアマスターシリンダーカップガード（4,980円）。どちらも税込・販売予定価格。
- 会員登録なし。商品ページで希望数量（1〜10）、名前、メールアドレス、条件への同意を受け付ける。送料・適合・販売仕様は確認中と明示する。2商品の発送予定は本人指定（2026-10-13）の「2026年11月中旬〜12月中」。製作状況により変更する可能性を併記し、個別の発送確約とは扱わない。
- 無料・注文未確定。カード・住所・Stripe決済・在庫引当はこの段階では扱わない。受付完了は画面に番号を表示し、自動メールは送らない。
- 同じメール・商品への再送は追加数量として扱わず、既存の連絡先・数量も匿名の再送では書き換えない。変更・取消・アドレス訂正は既存問い合わせフォームで受付番号を添えて連絡する。
- 仮予約はSupabaseの専用テーブルで管理。既存の電子雑誌決済、購入権限、会員登録、PDFには変更を加えない。

## 公開ゲート

コード作成と本番受付は分ける。初期設定はフロント・関数・商品カタログの3箇所とも受付停止。本番データベース変更・実顧客情報の受付開始・GitHub保護規則の例外操作は、それぞれ対象と内容を確認した承認の範囲で行う。

本番反映承認後の手順：

1. 本番プロジェクト `vndhldmmhvmpqvaizqci` を確認し、既存テーブルを保持したまま `20261013090000_parts_reservations.sql` のみ適用する。全未適用migrationを無確認でpushしない。
2. Cloudflare Turnstileでこのフォーム用Widgetを作成する。許可ホスト `dustline.jp`（必要なら `www.dustline.jp`）。サイトキーは公開可能、秘密キーはサーバー専用。実際のCAPTCHA操作と新しい認証情報の保存は該当する本人操作・承認を取得する。
3. Supabase Edge Function Secretsに下記を設定する。値を台帳・チャット・リポジトリへ書かない。

| Name | 内容 |
|---|---|
| `PARTS_RESERVATIONS_ENABLED` | 最初は `false`、検証後 `true` |
| `PARTS_RESERVATION_ALLOWED_ORIGINS` | `https://dustline.jp,https://www.dustline.jp` |
| `TURNSTILE_SECRET_KEY` | Widgetの秘密キー |
| `PARTS_RESERVATION_HASH_SECRET` | 32バイト以上の暗号学的乱数。重複判定用HMAC。変更時は既存キーの移行計画が必要 |

4. `parts-reservation` のみデプロイする。`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` はEdgeのサーバー側既定値を使用。ゲスト用 `verify_jwt=false` はJWTを信頼する代わりの設定ではなく、Origin・入力・Turnstile・非公開RPCを必須にする。
5. テスト後、2商品の `parts_reservation_catalog.enabled` を明示的にONにする。GitHubの公開用Varsに `VITE_PARTS_RESERVATIONS_ENABLED=true` と `VITE_PARTS_RESERVATION_TURNSTILE_SITE_KEY` を設定する。雑誌の `VITE_ISSUE_PAYMENTS_ENABLED=false` を保持する。
6. PR承認・本番反映後、PCとスマホで2商品、実Turnstile、受付番号、保存、再送、停止、私的情報へのアクセス拒否を確認する。未確認の実メール送信・Stripe課金成功を完了扱いにしない。

停止：まず関数の `PARTS_RESERVATIONS_ENABLED=false` と商品カタログのenabledをOFFにする。既存の受付情報を削除しない。フロント公開フラグもOFFにして再配信する。

## 台帳・受付管理

`parts_reservations`：1商品・1メールにつき1件の有効な仮予約。requested（連絡前）／contacted（案内済み）／cancelled（取り消し）。代金支払済みを示す状態はない。

`parts_reservation_receipts`：送信ごとの受付番号と内部仮予約ID。サーバーが同一リクエストを再処理しても件数・数量は増えない。

メール所有者確認や納期確約は未実施のため、集計値は「仮予約希望数」とする。製造数確定や受注・売上として扱わない。案内前に連絡先・希望数量を確認する。下記SQLはSupabase管理画面で管理者が実行するもの。フロントからの閲覧・更新は許可しない。

```sql
-- 個人情報を含めない商品別希望数
select c.product_name, r.status, count(*) as requests, sum(r.quantity) as requested_quantity
from public.parts_reservations r
join public.parts_reservation_catalog c on c.product_slug = r.product_slug
group by c.product_name, r.status order by c.product_name, r.status;

-- 連絡対象。必要な担当者だけが管理画面で閲覧する。
select id, product_slug, quantity, contact_name, contact_email, created_at
from public.parts_reservations where status = 'requested' order by created_at;

-- 問い合わせの受付番号から内部IDを確認する。UUIDを差し替える。
select r.id, r.product_slug, r.quantity, r.status, r.contact_email
from public.parts_reservations r
join public.parts_reservation_receipts receipt on receipt.reservation_id = r.id
where receipt.request_id = '00000000-0000-4000-8000-000000000000';
```

変更・取消は本人からの連絡と対象を確認したうえで、IDに限定して管理画面で更新する。contactedも取り消し可能。発送する段階の注文情報は今後の正式受注テーブルに分ける。

## セキュリティ・通信

- テーブルはRLS有効、anon/authenticated/PUBLICのアクセス・RPC実行を取り消す。Edgeのservice_roleだけが登録する。ゲストには本人が今回送信した受付番号だけを返し、他人のメールや過去の予約の有無を返さない。
- 商品2件の許可リスト、同意版、整数数量、長さ・JSON 8KB制限、ハニーポット、Cloudflareのaction・hostnameをサーバーで検証。Turnstileは必須、通信不良時にスキップしない。
- DBでメール単位5送信/15分、全体250送信/15分を同一トランザクションで制限。受付停止と合わせて運用状況で調整する。生IPは独自テーブルに保存しない。
- フロントは15秒で通信待ちを解除し、入力保持・同じリクエストIDで再試行できる。Turnstileトークンは再取得する。確定していない送信結果を成功と表示しない。
- 入力内容やメールをURL、アクセス解析、ログ、会社台帳に送らない。Cloudflareの安全確認の技術情報処理はプライバシーポリシーに記載する。

## ローカル検証

```powershell
npm test
npm run build
npm run check:cloudflare
node scripts/preview-parts-reservations.mjs
```

`http://127.0.0.1:4194/parts/guard-factory/f450gs-radiator-guard/#gf-reservation`。
この専用プレビューだけはin-memory PostgreSQL（PGlite）と架空の安全確認を使用。API・DB登録・受付番号は実処理だが、外部通信・本番DB・メール送信・課金はない。実在する連絡先は入力しない。`retry@example.invalid` はDB受付成功後の最初の応答を意図的に503にし、再送の復旧を検証できる。
プレビュー用設定・認証コンポーネントはViteプレビュー起動スクリプトだけが差し替え、通常ビルドには含めない。プロセス終了でテストデータは消える。

## 後日のStripe決済

納期・適合・構成・税込総額・送料・キャンセル/返品条件が確定したら、同意した予約者へ購入案内を送る。本人の購入意思を再確認してStripe Checkout/Payment Linkへ進む。カード保持や自動請求は行わない。

この実装に決済リンク自動発行、支払済み管理、物品発送Webhookは含めていない。電子雑誌用 `issue-checkout` / `stripe-issue-webhook` を物品注文に流用しない。後日、物品用の正式注文管理と支払照合を追加する。

Stripeの本番申請が通ったとのユーザー報告はあるが、今回の実装では `charges_enabled` 等の本番状態は未検証。

## 参考（確認2026-10-13）

- [Turnstileのサーバー検証](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)：5分・1回限りのトークンをSiteverifyで確認する。
- [TurnstileのWidget](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- [Supabase Edge Secrets](https://supabase.com/docs/guides/functions/secrets)
