# DUST LINE Website

DUST LINE公式サイトのフロントエンドです。React + Viteで構築しています。

## 起動

```powershell
npm install
npm run dev
```

ターミナルに表示されるローカルURLをブラウザで開いてください。

## 本番ビルド

```powershell
npm run build
```

生成物は `dist/` に出力されます。

## 現在の仮実装

- Kindle創刊号は発売前表示です。商品ページ公開後、`src/main.jsx` の該当リンクをAmazon URLへ変更してください。
- ニュースレター登録は画面上の状態確認用です。実送信にはメール配信サービスまたはAPIとの接続が必要です。
- 記事リンクはニュースレター登録セクションへの仮導線です。記事ページ追加後に差し替えてください。
