# yumeshop-mock

フロントエンドのインターン課題の yumeshop の mock サーバーです。
これを起動するためには Java のランタイムが必要になりますので、適当な Java のインストールをお願いいたします。
Oracle の Java 8 の JRE は[こちら](https://www.java.com/ja/)からダウンロードできます。

## How to use

```
git clone https://github.com/yumemi/yumeshop-mock.git

cd yumeshop-mock

yarn install # or npm install

yarn mock # or npm run mock
```

## その他の主要なコマンド

```
# データベースの初期値(`database/seed.json`)をDBに上書きしてからモックサーバーを立ち上げる。
# それまでに追加していたデータは初期されてなくなるので注意すること。
yarn mock:seed

# OpenAPIの定義からこのmockで使うTypeScriptの型を生成する。
yarn generate:types
```

## この mock を拡張する場合

### ディレクトリ構成

- `openapi/`
  - OpenAPI に関するファイルなどがある
- `database/db.json`
  - データベースの実態(このファイルが DB として読み込まれ、新しいデータが書き込まれる)
- `src/database/`
  - データベースを操作する処理などがここに実装されている
- `src/routes/`
  - route と実行する処理に関する定義
- `src/types/`
  - 広く共通で使いたい型など
- `src/utils/`
  - 広く共通で使いたい処理など

### 手順

#### DB にテーブルを追加する必要がある場合

`src/database/db.ts`に追加したい DB の path を追加して、初期化の処理を書く。
`src/database/models.ts`に追加したい DB のテーブルのモデルの型を実装する。
OpenAPI も修正してあると`yarn generate:types # or npm run generate:types`で適切な型を生成した上で、その型を上書きする形で定義できる。

基本的にはリレーションの必要なカラムを`string[]`(id の配列)の型に修正するだけで良い。

#### 処理を追加する

`src/database/operations`に DB を操作する処理を実装していく。
リレーションのあるカラムは存在しない id を設定できないようにし、レコードが削除された時にそのレコードがリレーションされていたものを適切に更新する。
(informations や shop_items などを参考にしてください。)

実装が完了したら、`src/database/index.ts`で export する。

#### route の追加

`src/routes`に route とメソッドに関する処理を追加する。
最後に`src/app.ts`に先ほど作成した route を登録して実装完了。
