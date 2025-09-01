# 冷蔵庫ビューア

Google Apps Script で公開された API から最新の `Refrige` メモを取得して表示する、ポップな冷蔵庫 UI のサンプルです。

## 使い方

1. 任意の HTTP サーバでこのフォルダを公開します（例: `python -m http.server`）。
2. ブラウザで `index.html` を開きます。
3. 「冷蔵庫を開ける」ボタンを押すと扉が開き、最新メモを取得します。

## 開発メモ

- 取得したテキストは `localStorage` にキャッシュされ、次回の表示に利用されます。
- 扉のアニメーションは `prefers-reduced-motion` に対応しています。
- API がエラーのときはキャッシュを表示しつつ、再試行ボタンを提示します。

## ライセンス

MIT License
